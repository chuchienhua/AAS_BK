import config from '../config.js';
import { getNowDatetimeString } from '../libs.js';
import oracledb from 'oracledb';

//取得吊車狀態
export async function getCraneStatus() {
    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = `
            SELECT CRANE, VALID
            FROM ASRS_CRANE_USE_TMP
            ORDER BY CRANE `;
        const result = await conn.execute(sql, {}, { outFormat: oracledb.OBJECT });
        obj.res = result.rows;
    } catch (err) {
        console.error(getNowDatetimeString(), 'getCraneStatus', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }

    return obj;
}

//取得庫位概況
export async function getStockSummary() {
    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = `
            SELECT 
                BIG_ROW, 
                COUNT(*) AS COUNT_LONO,
                COUNT(CASE WHEN STATUS != '0' THEN 1 END) AS COUNT_USE,
                COUNT(CASE WHEN STATUS = 'L' THEN 1 END) AS COUNT_ALARM
            FROM ASRS_LOC
            GROUP BY BIG_ROW
            ORDER BY BIG_ROW `;
        const result = await conn.execute(sql, {}, { outFormat: oracledb.OBJECT });
        obj.res = result.rows;
    } catch (err) {
        console.error(getNowDatetimeString(), 'getStockSummary', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }

    return obj;
}
