import oracledb from 'oracledb';
import config from '../config.js';
import { getNowDatetimeString } from '../libs.js';

//取得所有ASRS_LOC 庫位編號與狀態
export async function getLocNo() {
    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = `
            SELECT LONO, STATUS
            FROM ASRS_LOC
            ORDER BY LONO `;
        const result = await conn.execute(sql, {}, { outFormat: oracledb.OBJECT });
        obj.res = result.rows;
    } catch (err) {
        console.error(getNowDatetimeString(), 'getASRS_LOC', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }
    return obj;
}

//取得所有ASRS_LOC Table
export async function getLocTable(Lono, Status) {
    let obj = {
        res: [],
        error: false,
    };
    let conn;
    let whereConditions = [];
    let queryParams = {};
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        let sql = `
            SELECT *
            FROM ASRS_LOC
            `;
        if (Lono) {
            whereConditions.push('LONO = :Lono');
            queryParams.Lono = Lono;
        }

        if (Status) {
            whereConditions.push('STATUS = :Status');
            queryParams.Status = Status;
        }
        if (whereConditions.length > 0) {
            sql += ' WHERE ' + whereConditions.join(' AND ');
        }
        sql += ' ORDER BY LONO';
        const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
        const result = await conn.execute(sql, queryParams, options);
        obj.res = result.rows;
    } catch (err) {
        console.error(getNowDatetimeString(), 'getASRS_LOC_Table:', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }

    return obj;
}

//取得所有ASRS_STGFLD Table (下拉式選單)
export async function getStgfldTable() {
    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = `
            SELECT LONO , STATUS , F4 , F5 , F6 , F8 , F9 , F10 , F11 ,F17 ,F19
            FROM ASRS_STGFLD
            ORDER BY INV_DATE `;
        const result = await conn.execute(sql, {}, { outFormat: oracledb.OBJECT });
        obj.res = result.rows;
    } catch (err) {
        console.error(getNowDatetimeString(), 'getASRS_STGFLD_Table:', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }
    return obj;
}

//取得所有ASRS_STGFLD Table
export async function getAllStgfldTable(Lono, Status, F4, F5, F6, F9, F17, F19, startDate, endDate) {
    let obj = {
        res: [],
        error: false,
    };
    let conn;
    let whereConditions = [];
    let queryParams = {};
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        let sql = `
            SELECT A.*, D.JOIN_LIST_STATUS AS RESERVE_STATUS
            FROM ASRS_STGFLD A
            LEFT JOIN WMS_STOCK_RESERVE_LIST D ON D.LONO = A.LONO
            `;
        if (Lono) {
            whereConditions.push('A.LONO = :Lono');
            queryParams.Lono = Lono;
        }
        if (Status) {
            whereConditions.push('A.STATUS = :Status');
            queryParams.Status = Status;
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
        if (F17) {
            whereConditions.push('A.F17 = :F17');
            queryParams.F17 = F17;
        }
        if (F19) {
            whereConditions.push('A.F19 = :F19');
            queryParams.F19 = F19;
        }
        if (startDate && endDate) {
            whereConditions.push('A.F10 BETWEEN :startDate AND :endDate');
            queryParams.startDate = startDate;
            queryParams.endDate = endDate;
        }
        if (whereConditions.length > 0) {
            sql += ' WHERE ' + whereConditions.join(' AND ');
        }
        sql += ' ORDER BY A.LONO';
        const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
        const result = await conn.execute(sql, queryParams, options);
        obj.res = result.rows;
    } catch (err) {
        console.error(getNowDatetimeString(), 'getASRS_LOC_Table:', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }

    return obj;
}

//更新ASRS_STGFLD Table (給予工廠編輯庫存檔)
export async function updateStgfldTable(Lono, F17) {
    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = `
                UPDATE ASRS_STGFLD
                SET F17 = :F17
                WHERE LONO = :LONO
            `;
        const params = {
            F17: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: F17 },
            LONO: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: Lono },
        };
        const options = { autoCommit: true };
        const result = await conn.execute(sql, params, options);
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