import config from '../config.js';
import { getNowDatetimeString, getOpno } from '../libs.js';
import oracledb from 'oracledb';
import { printLabelAPI } from '../printLabel.js';

//取得列印標籤所有欄位
export async function getPrintSetting() {
    let obj = {
        res: {}, //F欄位對應
        list: [], //列表英文名稱列表
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = `
            SELECT *
            FROM ASRS_WOKDATE_SET `;
        const result = await conn.execute(sql, {}, { outFormat: oracledb.OBJECT });
        if (!result.rows.length) {
            throw new Error('ASRS_WOKDATE_SET設定檔尚未建立');
        }

        Object.keys(result.rows[0]).forEach(key => {
            if (key.startsWith('F') && key !== 'FIRM' && result.rows[0][key]) {
                obj.res[key] = result.rows[0][key];

                //不清楚標籤列印會動到哪一個Table，在這邊做文字轉換
                const mapColName = () => {
                    switch (result.rows[0][key]) {
                        case '批號': return 'lotNo';
                        case '產品簡碼': return 'productNo';
                        case '料品': return 'itemType';
                        case '棧板編號': return 'palletNo';
                        case '棧板種類': return 'palletType';
                        case '板號': return 'palletSequence';
                        case '包裝種類': return 'packType';
                        case '製造日期': return 'manDate';
                        case '有效日期': return 'expireDate';
                        case '載運司機': return 'driver';
                        case '備註': return 'memo';
                        default: break;
                    }
                };
                const mappedColumnName = mapColName();
                if (mappedColumnName) {
                    obj.list.push(mappedColumnName);
                }
            }
        });
    } catch (err) {
        console.error(getNowDatetimeString(), 'getPrintSetting', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }

    return obj;
}

//取得所有標籤機
export async function getPrinter() {
    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = `
            SELECT PRINTER_IP, PRINTER_PORT, PRINTER_NAME, FONT_ZONE
            FROM ASRS_PRINTER
            ORDER BY PRINTER_ORDER `;
        const result = await conn.execute(sql, {}, { outFormat: oracledb.OBJECT });
        obj.res = result.rows;
    } catch (err) {
        console.error(getNowDatetimeString(), 'getPrinter', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }

    return obj;
}

//取得所有吊車對應的棧位
export async function getStackNo() {
    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = `
            SELECT CRANE, IN_STNO
            FROM ASRS_CRANE_USE_TMP
            ORDER BY CRANE `;
        const result = await conn.execute(sql, {}, { outFormat: oracledb.OBJECT });
        obj.res = result.rows;
    } catch (err) {
        console.error(getNowDatetimeString(), 'getStackNo', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }

    return obj;
}

//標籤掃碼入庫
export async function scanStockIn(stackNo, opno) {
    let obj = {
        res: null,
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = ' CALL WMS_UPDATE_WCS_TRK_STATUS(:V_OPNO, :V_STATUS, :V_STNO, :V_FLAG, :V_ERROR_CODE, :V_ERROR_DESC, :V_LONO) ';
        const params = {
            V_OPNO: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: opno },
            V_STATUS: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '5' },
            V_STNO: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: stackNo },
            V_FLAG: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: 'NULL' },
            V_ERROR_CODE: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            V_ERROR_DESC: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
            V_LONO: { dir: oracledb.BIND_OUT, type: oracledb.STRING }
        };
        const result = await conn.execute(sql, params, { outFormat: oracledb.OBJECT, autoCommit: false });
        console.log(result.outBinds);
        if (result.outBinds.V_ERROR_CODE || !result.outBinds.V_LONO) {
            throw new Error(`標籤掃碼入庫異常，${result.outBinds.V_ERROR_DESC}`);
        }
        obj.res = result.outBinds.V_LONO;
    } catch (err) {
        console.error(getNowDatetimeString(), 'scanStockIn', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (!obj.error) {
            await conn.commit();
        }
        if (conn) {
            await conn.close();
        }
    }

    return obj;
}

//列印標籤
export async function printPallet(printNum, printerName, labelData, user) {
    let obj = {
        res: [],
        errorList: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);

        //檢查哪些欄位需要輸入
        const mustEnterList = ['lotNo', 'productNo', 'itemType', 'palletType', 'packType', 'palletStart', 'palletEnd', 'manDate', 'expireDate'];
        for (const column of mustEnterList) {
            if (!labelData[column]) {
                obj.errorList.push(column);
            }
        }
        if (obj.errorList.length) {
            throw new Error(`標籤欄位${obj.errorList[0]}輸入不正確`);
        }

        //取得標籤機資料
        const sql = `
            SELECT PRINTER_IP, PRINTER_PORT, PRINTER_NAME, FONT_ZONE
            FROM ASRS_PRINTER
            WHERE PRINTER_NAME = :PRINTER_NAME `;
        const params = {
            PRINTER_NAME: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + printerName },
        };
        const printerResult = await conn.execute(sql, params, { outFormat: oracledb.OBJECT });
        if (!printerResult.rows.length) {
            throw new Error('標籤機選擇異常');
        }
        const printerIP = printerResult.rows[0].PRINTER_IP;
        const printerPort = printerResult.rows[0].PRINTER_PORT;
        const printerZone = printerResult.rows[0].FONT_ZONE;

        const palletStart = Number(labelData.palletStart || 1); //起始板號，從該板號開始列印
        for (let palletSequence = palletStart; palletSequence < palletStart + printNum; palletSequence++) {
            //取得OPNO
            const opnoResult = await getOpno();
            if (!opnoResult.res || opnoResult.error) {
                throw new Error('取得Opno失敗');
            }
            const opno = opnoResult.res;

            //列印標籤
            const printResult = await printLabelAPI(opno, palletSequence, printerIP, printerPort, printerZone, labelData, user);
            if (printResult.error) {
                throw new Error('列印失敗');
            }
        }
    } catch (err) {
        console.error(getNowDatetimeString(), 'printPallet', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }

    return obj;
}

//取得棧板標籤資料
export async function getLabelData(opno) {
    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = `
            SELECT *
            FROM ASRS_WOKDAT S0
                JOIN ASRS_WOKFIL S1
                    ON S0.OPNO = S1.OPNO  
            WHERE S0.OPNO = :OPNO `;
        const params = {
            OPNO: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + opno },
        };
        const result = await conn.execute(sql, params, { outFormat: oracledb.OBJECT });
        if (!result.rows.length) {
            throw new Error('無找到此標籤的資料');
        }
        obj.res = result.rows[0];
    } catch (err) {
        console.error(getNowDatetimeString(), 'getLabelData', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }

    return obj;
}