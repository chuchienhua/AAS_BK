import oracledb from 'oracledb';
import config from '../config.js';
import { getNowDatetimeString } from '../libs.js';

//搜尋庫存
export async function searchStockoutStgfld(stockOutLotNo, stockOutProductCode, stockOutPackageType, stockOutItem, stockOutReasonMark, Lono) {
    let connection;
    let obj = {
        res: [],
        error: false,
    };
    try {
        // console.log('LONO: ' + Lono);
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
        // AND  C.CRANE = 'O'
        let whereConditions = [];
        let queryParams = {};

        if (stockOutProductCode) {
            whereConditions.push('A.F5 = :productCode');
            queryParams.productCode = stockOutProductCode;
        }

        if (stockOutLotNo) {
            whereConditions.push('A.F4 = :lotNo');
            queryParams.lotNo = stockOutLotNo;
        }

        if (stockOutPackageType) {
            whereConditions.push('A.F9 = :stockOutPackageType');
            queryParams.stockOutPackageType = stockOutPackageType;
        }

        if (stockOutItem) {
            whereConditions.push('A.F6 = :stockOutItem');
            queryParams.stockOutItem = stockOutItem;
        }

        if (stockOutReasonMark) {
            whereConditions.push('A.F17 = :stockOutReasonMark');
            queryParams.stockOutReasonMark = stockOutReasonMark;
        }
        if (Lono) {
            whereConditions.push('A.LONO = :Lono');
            queryParams.Lono = Lono;
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

//取STGFLD全部資訊 (目前無使用)
export async function getAllStockoutStgfld() {
    let connection;
    let obj = {
        res: [],
        error: false,
    };

    try {
        connection = await oracledb.getConnection(config.ORACLE_CONFIG);
        let sql = 'SELECT * FROM ASRS_STGFLD ORDER BY INV_DATE ';

        const result = await connection.execute(sql, {}, { outFormat: oracledb.OBJECT });
        obj.res = result.rows;

    } catch (err) {
        console.error(getNowDatetimeString(), 'getAllStockoutStgfld Error: ', err);
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
export async function filterStockoutStgfld(stockOutLotNo, stockOutProductCode, stockOutItem, stockOutPackageType, stockOutReasonMark, Lono) {

    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        let sql = `
                SELECT F4, F5, F6, F9, F17 , LONO
                FROM ASRS_STGFLD `;
        let whereConditions = [];
        let queryParams = {};
        if (stockOutLotNo) {
            whereConditions.push('F4 = :lotNo');
            queryParams.lotNo = stockOutLotNo;
        }
        if (stockOutProductCode) {
            whereConditions.push('F5 = :productCode');
            queryParams.productCode = stockOutProductCode;
        }
        if (stockOutItem) {
            whereConditions.push('F6 = :stockOutItem');
            queryParams.stockOutItem = stockOutItem;
        }
        if (stockOutPackageType) {
            whereConditions.push('F9 = :stockOutPackageType');
            queryParams.stockOutPackageType = stockOutPackageType;
        }
        if (stockOutReasonMark) {
            whereConditions.push('F17 = :stockOutReasonMark');
            queryParams.stockOutReasonMark = stockOutReasonMark;
        }
        if (Lono) {
            whereConditions.push('LONO = :Lono');
            queryParams.Lono = Lono;
        }
        if (whereConditions.length > 0) {
            sql += ' WHERE ' + whereConditions.join(' AND ');
        }

        sql += ' ORDER BY INV_DATE'; // 生產日期排序
        const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
        const result = await conn.execute(sql, queryParams, options);
        obj.res = result.rows;

    } catch (err) {
        console.error(getNowDatetimeString(), 'UpdateASRS_STGFLD_Table:', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }
    return obj;
}

//過濾預約出庫的WMS_SYOCK_RESERVE_LIST (過濾下拉式選單選單)
export async function filterStockoutReserve(ReserveDate, Factory, Opno, F4, F5, F6, F9) {

    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        let sql = `
                SELECT RESERVE_DATE, FACTORY, OPNO
                FROM WMS_STOCK_RESERVE_LIST `;
        let whereConditions = [];
        let queryParams = {};
        if (ReserveDate) {
            whereConditions.push('RESERVE_DATE = :ReserveDate');
            queryParams.ReserveDate = ReserveDate;
        }
        if (Factory) {
            whereConditions.push('FACTORY = :Factory');
            queryParams.Factory = Factory;
        }
        if (Opno) {
            whereConditions.push('OPNO = :Opno');
            queryParams.Opno = Opno;
        }
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
        if (F9) {
            whereConditions.push('F9 = :F9');
            queryParams.F9 = F9;
        }
        if (whereConditions.length > 0) {
            sql += ' WHERE ' + whereConditions.join(' AND ');
        }

        sql += ' ORDER BY LOC_TYPE'; // 生產日期排序
        const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
        const result = await conn.execute(sql, queryParams, options);
        obj.res = result.rows;

    } catch (err) {
        console.error(getNowDatetimeString(), 'WMS_STOCK_RESERVE_LIST_Table:', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }
    return obj;
}

//透過WCS更新ASRS_WOKFIL
export async function updateWcsTrkStatus(vOpno, vStatus, vStno, vFlag) {
    let connection;
    let obj = {
        res: [],
        error: false,
    };
    try {
        connection = await oracledb.getConnection(config.ORACLE_CONFIG);

        // const checkSql = 'SELECT COUNT(*) AS cnt FROM ASRS_OUT_PREVENT_WOK_REPEAT WHERE OPNO = :vOpno';
        // const checkResult = await connection.execute(checkSql, { vOpno: { val: vOpno, dir: oracledb.BIND_IN, type: oracledb.STRING } }, { outFormat: oracledb.OBJECT });

        // 確認此命令使否已存在 存在就return
        // if (checkResult.rows[0].CNT > 0) {
        //     console.log(getNowDatetimeString(), `此 ${vOpno} 已存在此命令，待出貨中`);
        //     obj.res = `此 ${vOpno} 已存在此命令，待出貨中`;
        //     obj.error = true;
        //     return obj;
        // }

        // 定義呼叫儲存過程的SQL語句
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
        console.log(getNowDatetimeString(), 'vErr:', result.outBinds.V_ERROR_CODE);
        console.log(getNowDatetimeString(), 'vErrDesc:', LogError);
        console.log(getNowDatetimeString(), 'vLono:', result.outBinds.V_LONO);

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

//預約出貨
export async function reserveStockOut(ReserveDate, Factory, LONO, Opno, Loc_Type, F4, F5, F6, F9, F11, F13, ListStatus) {
    let connection;
    let obj = {
        res: null,
        error: false,
    };

    try {
        connection = await oracledb.getConnection(config.ORACLE_CONFIG);
        const query = `
            INSERT INTO WMS_STOCK_RESERVE_LIST (RESERVE_DATE, FACTORY, LONO, OPNO, LOC_TYPE ,F4 ,F5, F6, F9 , F11 , F13 ,JOIN_LIST_STATUS)
            VALUES (:RESERVEDATE, :FACTORY, :LONO, :OPNO, :LOC_TYPE, :F4, :F5, :F6, :F9, :F11 , :F13, :JOIN_LIST_STATUS)
            `;
        const params = {
            RESERVEDATE: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: ReserveDate },
            FACTORY: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: Factory },
            LONO: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: LONO },
            OPNO: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: Opno },
            LOC_TYPE: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: Loc_Type },
            F4: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: F4 },
            F5: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: F5 },
            F6: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: F6 },
            F9: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: F9 },
            F11: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: F11 },
            F13: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: F13 },
            JOIN_LIST_STATUS: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: ListStatus },
        };

        const options = { autoCommit: false };

        const result = await connection.execute(query, params, options);
        obj.rows = result.rows;
        if (!obj.error) {
            await connection.commit();
        }
    } catch (err) {
        console.error(getNowDatetimeString(), 'CF_LOT_CONTROL_Insert_error', err);
        obj.res = err.toString();
        obj.error = true;
        if (connection) {
            await connection.rollback();
        }
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

//預約出貨查詢
export async function reserveStockOutSearch(ReserveDate, Factory, Lono, Opno, F4, F5, F6, F9) {
    let connection;
    let obj = {
        res: [],
        error: false,
    };
    try {
        // console.log('LONO: ' + Lono);
        connection = await oracledb.getConnection(config.ORACLE_CONFIG);
        let sql = `
        SELECT A.* , 
        C.CRANE AS WOKFIL_CRANE, C.STATUS AS WOKFIL_STATUS,
        B.STATUS ,
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
        END AS FRONT_STATUS
    FROM WMS_STOCK_RESERVE_LIST A
    JOIN ASRS_LOC B ON A.LONO = B.LONO 
    LEFT JOIN ASRS_WOKFIL C ON C.O_OPNO = A.OPNO 
        `;
        let whereConditions = [];
        let queryParams = {};

        if (ReserveDate) {
            whereConditions.push('A.RESERVE_DATE = :ReserveDate');
            queryParams.ReserveDate = ReserveDate;
        }
        if (Factory) {
            whereConditions.push('A.FACTORY = :Factory');
            queryParams.Factory = Factory;
        }
        if (Lono) {
            whereConditions.push('A.LONO = :Lono');
            queryParams.Lono = Lono;
        }
        if (Opno) {
            whereConditions.push('A.OPNO = :Opno');
            queryParams.Opno = Opno;
        }
        if (F4) {
            whereConditions.push('A.F4 = :F4');
            queryParams.F4 = F4;
        }
        if (F5) {
            whereConditions.push('A.F5 = :F5');
            queryParams.F5 = F5;
        }
        if (F6) {
            whereConditions.push('A.F6 = :F6');
            queryParams.F6 = F6;
        }
        if (F9) {
            whereConditions.push('A.F9 = :F9');
            queryParams.F9 = F9;
        }

        if (whereConditions.length > 0) {
            sql += ' WHERE ' + whereConditions.join(' AND ');
        }

        sql += ' ORDER BY A.RESERVE_DATE, A.FACTORY , A.F13'; // 預約日期 廠商 板號
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

//預約出貨單個刪除
export async function reserveStockOutDelete(ReserveDate, Factory, Opno, F4, F5, F6, F9) {
    let connection;
    let obj = {
        res: [],
        error: false,
    };
    try {
        connection = await oracledb.getConnection(config.ORACLE_CONFIG);
        const query = `
            DELETE FROM WMS_STOCK_RESERVE_LIST
            WHERE RESERVE_DATE = :RESERVEDATE
            AND FACTORY = :FACTORY
            AND OPNO = :OPNO
            AND F4 = :F4
            AND F5 = :F5
            AND F6 = :F6
            AND F9 = :F9
            `;
        const params = {
            RESERVEDATE: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: ReserveDate },
            FACTORY: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: Factory },
            OPNO: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: Opno },
            F4: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: F4 },
            F5: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: F5 },
            F6: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: F6 },
            F9: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: F9 },
        };

        const options = { autoCommit: false };

        const result = await connection.execute(query, params, options);
        obj.rows = result.rows;
        if (!obj.error) {
            await connection.commit();
        }
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

//取得廠商名稱
export async function getFactory() {
    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = `
            SELECT FACTORY_NAME FROM WMS_FACTORY_LIST 
            ORDER BY FACTORY_NAME
            `;
        const result = await conn.execute(sql, {}, { outFormat: oracledb.OBJECT });
        obj.res = result.rows;
    } catch (err) {
        console.error(getNowDatetimeString(), 'getFactory', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }
    return obj;
}

//加入預約複製出貨
export async function reserveCopyList(ReserveDate, Factory, F4, F5, F11, F13, ListStatus) {
    let connection;
    let obj = {
        res: null,
        error: false,
    };
    let attemptedOpno = "";

    try {
        connection = await oracledb.getConnection(config.ORACLE_CONFIG);

        const opnoQuery = `SELECT F16 FROM ASRS_STGFLD WHERE F4 = :F4 AND F5 = :F5 AND F11 = :F11 AND F13 = :F13`;
        const opnoResult = await connection.execute(opnoQuery, { F4, F5, F11, F13 }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (opnoResult.rows.length > 0) {
            attemptedOpno = opnoResult.rows[0].F16; // 存储尝试插入的OPNO值
            // console.log(attemptedOpno);
        } else {
            throw new Error("未找到对应的OPNO值");
        }
        const query =
            `
                INSERT INTO WMS_STOCK_RESERVE_LIST
                (RESERVE_DATE, FACTORY, LONO, OPNO, LOC_TYPE, F4, F5, F6, F9, F11, F13, JOIN_LIST_STATUS)
                SELECT :RESERVEDATE, :FACTORY, r1.LONO, r1.F16, r2.LOC_TYPE, r1.F4, r1.F5,
                    r1.F6, r1.F9, r1.F11, r1.F13, :JOIN_LIST_STATUS
                FROM ASRS_STGFLD r1
                JOIN ASRS_LOC r2 ON r1.LONO = r2.LONO
                WHERE r1.F4 = :F4 AND r1.F5 = :F5 AND r1.F11 = :F11 AND r1.F13 = :F13
            `;
        const params = {
            RESERVEDATE: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + ReserveDate },
            FACTORY: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + Factory },
            F4: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + F4 },
            F5: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + F5 },
            F11: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + F11 },
            F13: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + F13 },
            JOIN_LIST_STATUS: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + ListStatus },
        };

        const options = { autoCommit: false };

        const result = await connection.execute(query, params, options);
        obj.rows = result.rows;
        if (!obj.error) {
            await connection.commit();
        }
    } catch (err) {
        console.error(getNowDatetimeString(), 'CF_LOT_CONTROL_Insert_error', err);
        // obj.res = err.toString();
        obj.res = `清單中已有OPNO: ${attemptedOpno}`;
        obj.error = true;
        if (connection) {
            await connection.rollback();
        }
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

//測試Procedure asrsGetCommand
export async function asrsGetCommand(V_COMPANY, V_FIRM, V_DEPT, V_O_OPNO, V_STNO, V_LONO, V_ORIGINAL_LONO, V_IO_KIND) {
    let connection;
    let obj = {
        res: [],
        error: false,
    };
    try {
        connection = await oracledb.getConnection(config.ORACLE_CONFIG);

        // 定義呼叫儲存過程的SQL語句
        const sql = 'CALL ASRS_GET_COMMAND(:V_COMPANY, :V_FIRM, :V_DEPT, :V_O_OPNO, :V_STNO, :V_LONO, :V_ORIGINAL_LONO,:V_IO_KIND,:V_ERR_DESC)';

        // 定義傳遞給儲存過程的參數
        const params = {
            V_COMPANY: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_COMPANY },
            V_FIRM: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_FIRM },
            V_DEPT: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_DEPT },
            V_O_OPNO: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_O_OPNO },
            V_STNO: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_STNO },
            V_LONO: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_LONO },
            V_ORIGINAL_LONO: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_ORIGINAL_LONO },
            V_IO_KIND: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_IO_KIND },
            V_ERR_DESC: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
        };
        // 執行儲存過程
        const result = await connection.execute(sql, params, { outFormat: oracledb.OBJECT, autoCommit: false });
        obj.rows = result.rows;
        // 輸出回傳值
        console.log('vErrDesc:', result.outBinds.V_ERR_DESC);
    } catch (err) {
        console.error(getNowDatetimeString(), 'UpdateWcsTrkStatus Error: ', err);
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

//測試Procedure asrs_get_loc
export async function asrsGetLoc(V_COMPANY, V_FIRM, V_DEPT, V_OPNO, V_STNO, V_CRANE, V_FLAG, V_OUT_LONO) {
    let connection;
    let obj = {
        res: [],
        error: false,
    };
    try {
        connection = await oracledb.getConnection(config.ORACLE_CONFIG);

        // 定義呼叫儲存過程的SQL語句
        const sql = 'CALL ASRS_GET_LOC(:V_COMPANY, :V_FIRM, :V_DEPT, :V_OPNO, :V_STNO, :V_CRANE, :V_FLAG, :V_OUT_LONO, :V_LONO)';
        // 定義傳遞給儲存過程的參數
        const params = {
            V_COMPANY: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_COMPANY },
            V_FIRM: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_FIRM },
            V_DEPT: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_DEPT },
            V_OPNO: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_OPNO },
            V_STNO: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_STNO },
            V_CRANE: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_CRANE },
            V_FLAG: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_FLAG },
            V_OUT_LONO: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_OUT_LONO },
            V_LONO: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
            // V_MSG: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
        };
        // 執行儲存過程
        const result = await connection.execute(sql, params, { outFormat: oracledb.OBJECT, autoCommit: false });
        obj.rows = result.rows;
        // 輸出回傳值
        console.log('vLono:', result.outBinds.V_LONO);
        // console.log('vMsg:', result.outBinds.V_MSG);
    } catch (err) {
        console.error(getNowDatetimeString(), 'asrsGetLoc Error: ', err);
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

//測試Procedure asrsOutWareHouse
export async function asrsOutWareHouse(V_COMPANY, V_FIRM, V_DEPT, V_OPNO, V_LONO, V_LOC_TYPE, V_CRANE, V_FLAG, V_TO_ST) {
    let connection;
    let obj = {
        res: [],
        error: false,
    };
    try {
        connection = await oracledb.getConnection(config.ORACLE_CONFIG);

        // 定義呼叫儲存過程的SQL語句
        const sql = 'CALL ASRS_OUT_WAREHOUSE(:V_COMPANY, :V_FIRM, :V_DEPT, :V_OPNO, :V_LONO, :V_LOC_TYPE, :V_CRANE,:V_FLAG,:V_TO_ST,:V_ERR_DESC)';

        // 定義傳遞給儲存過程的參數
        const params = {
            V_COMPANY: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_COMPANY },
            V_FIRM: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_FIRM },
            V_DEPT: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_DEPT },
            V_OPNO: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_OPNO },
            V_LONO: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_LONO },
            V_LOC_TYPE: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_LOC_TYPE },
            V_CRANE: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_CRANE },
            V_FLAG: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_FLAG },
            V_TO_ST: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + V_TO_ST },
            V_ERR_DESC: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
        };
        // 執行儲存過程
        const result = await connection.execute(sql, params, { outFormat: oracledb.OBJECT, autoCommit: false });
        obj.rows = result.rows;
        // 輸出回傳值
        console.log('vErrDesc:', result.outBinds.V_ERR_DESC);
    } catch (err) {
        console.error(getNowDatetimeString(), 'UpdateWcsTrkStatus Error: ', err);
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