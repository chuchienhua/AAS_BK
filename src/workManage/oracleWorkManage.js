import config from '../config.js';
import { getNowDatetimeString } from '../libs.js';
import oracledb from 'oracledb';

//取得所有工作命令檔
export async function getWorkFile(dateAfter) {
    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = `
            SELECT OPNO, FM_ST, TO_ST, LONO, STATUS, IO_KIND, IO_TIME, PL_TYPE, CREATE_TIME
            FROM ASRS_WOKFIL
            WHERE STATUS NOT IN ( 'O' )
            AND CREATE_TIME >= TO_DATE( :DATE_AFTER, 'YYYYMMDD' )
            ORDER BY
            CASE
                WHEN STATUS = 'R' THEN 1
                WHEN STATUS = 'C' THEN 2
                WHEN STATUS = 'A' THEN 3
                ELSE 4
            END, CREATE_TIME  `;
        const params = {
            DATE_AFTER: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + dateAfter },
        };
        const result = await conn.execute(sql, params, { outFormat: oracledb.OBJECT });
        obj.res = result.rows;
    } catch (err) {
        console.error(getNowDatetimeString(), 'getWorkFile', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }

    return obj;
}

//強制取消特定工作命令
export async function cancelWork(opno) {
    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = ' CALL WMS_UPDATE_WCS_TRK_STATUS(:V_OPNO, :V_STATUS, :V_STNO, :V_FLAG, :V_ERROR_CODE, :V_ERROR_DESC, :V_LONO) ';
        const params = {
            V_OPNO: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + opno },
            V_STATUS: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '93' },
            V_STNO: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: 'NULL' },
            V_FLAG: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: 'NULL' },
            V_ERROR_CODE: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            V_ERROR_DESC: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
            V_LONO: { dir: oracledb.BIND_OUT, type: oracledb.STRING }
        };
        const result = await conn.execute(sql, params, { outFormat: oracledb.OBJECT, autoCommit: false });
        if (result.outBinds.V_ERROR_CODE) {
            throw new Error(`強制結束異常，${result.outBinds.V_ERROR_DESC}`);
        }
    } catch (err) {
        console.error(getNowDatetimeString(), 'cancelWork', err);
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

//強制完成特定工作命令
export async function finishWork(opno) {
    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = ' CALL WMS_UPDATE_WCS_TRK_STATUS(:V_OPNO, :V_STATUS, :V_STNO, :V_FLAG, :V_ERROR_CODE, :V_ERROR_DESC, :V_LONO) ';
        const params = {
            V_OPNO: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + opno },
            V_STATUS: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '99' },
            V_STNO: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: 'NULL' },
            V_FLAG: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: 'NULL' },
            V_ERROR_CODE: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            V_ERROR_DESC: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
            V_LONO: { dir: oracledb.BIND_OUT, type: oracledb.STRING }
        };
        const result = await conn.execute(sql, params, { outFormat: oracledb.OBJECT, autoCommit: false });
        if (result.outBinds.V_ERROR_CODE) {
            throw new Error(`強制完成異常，${result.outBinds.V_ERROR_DESC}`);
        }
    } catch (err) {
        console.error(getNowDatetimeString(), 'finishWork', err);
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