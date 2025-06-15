import oracledb from 'oracledb';
import config from '../config.js';
import { getNowDatetimeString } from '../libs.js';

//取STGFLD全部資訊 
export async function getAllStockCheckStgfld() {
    let connection;
    let obj = {
        res: [],
        error: false,
    };

    try {
        connection = await oracledb.getConnection(config.ORACLE_CONFIG);
        let sql = 'SELECT LONO ,STATUS FROM ASRS_STGFLD ORDER BY LONO ';

        const result = await connection.execute(sql, {}, { outFormat: oracledb.OBJECT });
        obj.res = result.rows;

    } catch (err) {
        console.error(getNowDatetimeString(), 'getAllStockCheckStgfld Error: ', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
    return obj;
}

//過濾出庫的ASRS_STGFLD (過濾下拉式選單選單)  簡碼, 產品簡碼, 料品選擇 , 包裝種類
export async function filterStockCheckStgfld(F4, F5, F6, F8, F9, F17,) {

    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        let sql = `
                SELECT F4, F5, F6, F8, F9, F17
                FROM ASRS_STGFLD `;
        let whereConditions = [];
        let queryParams = {};
        if (F4) {
            whereConditions.push('F4 = :F4');
            queryParams.F4 = F4;
        }
        if (F5) {
            whereConditions.push('F5 = :F5');
            queryParams.F5 = F5;
        }
        if (F6) {
            whereConditions.push('F6 = :F6');
            queryParams.F6 = F6;
        }
        if (F8) {
            whereConditions.push('F8 = :F8');
            queryParams.F8 = F8;
        }
        if (F9) {
            whereConditions.push('F9 = :F9');
            queryParams.F9 = F9;
        }
        if (F17) {
            whereConditions.push('F17 = :F17');
            queryParams.F17 = F17;
        }
        if (whereConditions.length > 0) {
            sql += ' WHERE ' + whereConditions.join(' AND ');
        }

        sql += ' ORDER BY INV_DATE'; // 生產日期排序
        const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
        const result = await conn.execute(sql, queryParams, options);
        obj.res = result.rows;

    } catch (err) {
        console.error(getNowDatetimeString(), 'Filter_StockCheck_ASRS_STGFLD_Table:', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }
    return obj;
}

//取LOC全部資訊
export async function getAllStockCheckLoc() {
    let connection;
    let obj = {
        res: [],
        error: false,
    };

    try {
        connection = await oracledb.getConnection(config.ORACLE_CONFIG);
        let sql = `SELECT LONO , STATUS
                    FROM ASRS_LOC 
                    WHERE STATUS = 'L' 
                    ORDER BY LONO`;

        const result = await connection.execute(sql, {}, { outFormat: oracledb.OBJECT });
        obj.res = result.rows;

    } catch (err) {
        console.error(getNowDatetimeString(), 'getAllStockCheckLoc Error: ', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
    return obj;
}

//STGFLD搜尋庫存
export async function searchStockCheckStgfld(stockCheckF4, stockCheckF5, stockCheckF6, stockCheckF8, stockCheckF9, stockCheckF17) {
    let connection;
    let obj = {
        res: [],
        error: false,
    };
    try {
        connection = await oracledb.getConnection(config.ORACLE_CONFIG);
        let sql = `
                SELECT 
                A.F4, A.F5, A.F6, A.F8, A.F9, A.F10, A.F11, A.F13, A.F14, A.F16, A.F17,
                B.STATUS, B.LOC_TYPE, B.CRANE, B.LONO,
                CASE 
                    WHEN B.LOC_TYPE = '2' THEN (
                        
                        SELECT STATUS 
                        FROM ASRS_LOC 
                        WHERE LONO = (
                            SELECT CASE
                                WHEN MOD(SUBSTR(LONO, 1, 2), 2) = 0 THEN
                                    LPAD(SUBSTR(LONO, 1, 2) - 1, 2, '0') || SUBSTR(LONO, 3 ,5)
                                ELSE
                                    LPAD(SUBSTR(LONO, 1, 2) + 1, 2, '0') || SUBSTR(LONO, 3,5)
                            END
                            FROM ASRS_LOC
                            WHERE LONO = B.LONO
                        )
                    ) 
                    ELSE '0' 
                END AS FRONT_STATUS,
                C.CRANE AS WOKFIL_CRANE,
                C.STATUS AS WOKFIL_STATUS,
                D.JOIN_LIST_STATUS AS RESERVE_STATUS
            FROM ASRS_STGFLD A 
            JOIN ASRS_LOC B ON A.LONO = B.LONO  
            LEFT JOIN ASRS_WOKFIL C ON C.O_OPNO= A.F16 
            LEFT JOIN WMS_STOCK_RESERVE_LIST D ON D.OPNO = A.F16
            `;
        //AND C.IO_KIND = 'S' AND C.CRANE ='T' 
        let whereConditions = [];
        let queryParams = {};

        if (stockCheckF5) {
            whereConditions.push('A.F5 = :stockCheckF5');
            queryParams.stockCheckF5 = stockCheckF5;
        }

        if (stockCheckF4) {
            whereConditions.push('A.F4 = :stockCheckF4');
            queryParams.stockCheckF4 = stockCheckF4;
        }

        if (stockCheckF9) {
            whereConditions.push('A.F9 = :stockCheckF9');
            queryParams.stockCheckF9 = stockCheckF9;
        }

        if (stockCheckF6) {
            whereConditions.push('A.F6 = :stockCheckF6');
            queryParams.stockCheckF6 = stockCheckF6;
        }

        if (stockCheckF8) {
            whereConditions.push('A.F8 = :stockCheckF8');
            queryParams.stockCheckF8 = stockCheckF8;
        }

        if (stockCheckF17) {
            whereConditions.push('A.F17 = :stockCheckF17');
            queryParams.stockCheckF17 = stockCheckF17;
        }


        if (whereConditions.length > 0) {
            sql += ' WHERE ' + whereConditions.join(' AND ');
        }

        sql += ' ORDER BY A.INV_DATE'; // 生產日期排序
        const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
        const result = await connection.execute(sql, queryParams, options);
        obj.rows = result.rows;
    } catch (err) {
        console.error(getNowDatetimeString(), 'Search Error: ', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
    return obj;
}

//LOC搜尋庫存
export async function searchStockCheckLoc(Lono, Status) {
    let connection;
    let obj = {
        res: [],
        error: false,
    };

    try {
        connection = await oracledb.getConnection(config.ORACLE_CONFIG);
        let sql = `
                SELECT 
                A.F4, A.F5, A.F6, A.F8, A.F9, A.F10, A.F11, A.F13, A.F14, A.F16, A.F17,
                B.STATUS, B.LOC_TYPE, B.CRANE, B.LONO,
                CASE 
                    WHEN B.LOC_TYPE = '2' THEN (
                        
                        SELECT STATUS 
                        FROM ASRS_LOC 
                        WHERE LONO = (
                            SELECT CASE
                                WHEN MOD(SUBSTR(LONO, 1, 2), 2) = 0 THEN
                                    LPAD(SUBSTR(LONO, 1, 2) - 1, 2, '0') || SUBSTR(LONO, 3 ,5)
                                ELSE
                                    LPAD(SUBSTR(LONO, 1, 2) + 1, 2, '0') || SUBSTR(LONO, 3,5)
                            END
                            FROM ASRS_LOC
                            WHERE LONO = B.LONO
                        )
                    ) 
                    ELSE '0' 
                END AS FRONT_STATUS,
                C.STATUS AS WOKFIL_STATUS,
                D.JOIN_LIST_STATUS AS RESERVE_STATUS
            FROM ASRS_STGFLD A 
            JOIN ASRS_LOC B ON A.LONO = B.LONO  
            LEFT JOIN ASRS_WOKFIL C ON C.O_OPNO= A.F16
            LEFT JOIN WMS_STOCK_RESERVE_LIST D ON D.OPNO = A.F16
            `;
        // AND C.IO_KIND = 'S' AND C.CRANE ='T'  
        let whereConditions = [];
        let queryParams = {};

        if (Lono) {
            whereConditions.push('B.LONO = :Lono');
            queryParams.Lono = Lono;
        }

        if (Status) {
            whereConditions.push('B.STATUS = :Status');
            queryParams.Status = Status;
        }

        if (whereConditions.length > 0) {
            sql += ' WHERE ' + whereConditions.join(' AND ');
        }

        sql += ' ORDER BY A.INV_DATE'; // 生產日期排序
        const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
        const result = await connection.execute(sql, queryParams, options);
        obj.rows = result.rows;

    } catch (err) {
        console.error(getNowDatetimeString(), 'searchStockCheckLoc Error: ', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
    return obj;
}

//LOC 先入品搜尋庫存
export async function searchUnknownStockCheckLoc(Lono, Status) {
    let connection;
    let obj = {
        res: [],
        error: false,
    };

    try {
        connection = await oracledb.getConnection(config.ORACLE_CONFIG);
        let sql = `
            SELECT A.*,C.STATUS AS WOKFIL_STATUS
            FROM ASRS_LOC A
            LEFT JOIN ASRS_WOKFIL C ON C.FM_LONO = A.LONO AND C.PL_TYPE = 'L'
        `;
        //LEFT JOIN ASRS_WOKFIL C ON C.FM_LONO = A.LONO AND C.STATUS = 'A' AND C.PL_TYPE = 'L'
        let whereConditions = [];
        let queryParams = {};

        if (Lono) {
            whereConditions.push('A.LONO = :Lono');
            queryParams.Lono = Lono;
        }
        if (Status) {
            whereConditions.push('A.STATUS = :Status');
            queryParams.Status = Status;
        }

        if (whereConditions.length > 0) {
            sql += ' WHERE ' + whereConditions.join(' AND ');
        }

        sql += ' ORDER BY C.CREATE_TIME DESC'; // 生產日期排序
        const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
        const result = await connection.execute(sql, queryParams, options);
        obj.rows = result.rows;

    } catch (err) {
        console.error(getNowDatetimeString(), 'searchStockCheckLoc Error: ', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
    return obj;
}

// 盤點透過WCS更新ASRS_WOKFIL
export async function updateWcsTrkStatus(vOpno, vStatus, vStno, vFlag) {
    let connection;
    let obj = {
        res: [],
        error: false,
    };
    try {
        connection = await oracledb.getConnection(config.ORACLE_CONFIG);
        console.log(getNowDatetimeString(), vOpno);

        const sql = 'CALL WMS_UPDATE_WCS_TRK_STATUS(:V_OPNO, :V_STATUS, :V_STNO, :V_FLAG, :V_ERROR_CODE, :V_ERROR_DESC, :V_LONO)';

        // 定義傳遞給儲存過程的參數
        const params = {
            V_OPNO: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + vOpno },
            V_STATUS: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + vStatus },
            V_STNO: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + vStno },
            V_FLAG: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + vFlag },
            V_ERROR_CODE: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            V_ERROR_DESC: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
            V_LONO: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
        };
        // 執行儲存過程
        const result = await connection.execute(sql, params, { outFormat: oracledb.OBJECT, autoCommit: false });

        obj.res = result.rows;
        const LogError = result.outBinds.V_ERROR_DESC;
        // 輸出回傳值
        console.log(getNowDatetimeString(), vOpno, 'vErr:', result.outBinds.V_ERROR_CODE);
        console.log(getNowDatetimeString(), vOpno, 'vErrDesc:', LogError);
        console.log(getNowDatetimeString(), vOpno, 'vLono:', result.outBinds.V_LONO);

        if (LogError) {
            obj.res = LogError;
            obj.error = true;
        }

    } catch (err) {
        console.error(getNowDatetimeString(), 'UpdateWcsTrkStatus Error: ', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (!obj.error) {
            await connection.commit();
        }
        if (connection) {
            await connection.close();
        }
    }
    return obj;
}