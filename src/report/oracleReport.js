import config from '../config.js';
import { getNowDatetimeString } from '../libs.js';
import oracledb from 'oracledb';

//取得批號命令紀錄
export async function trace(lotNo) {
    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = `
            SELECT 
                S0.F4 AS LOT_NO,
                S0.F13 AS PALLET_SEQUENCE,
                S0.OPNO AS OPNO,
                S1.IO_KIND AS IO_KIND,
                S1.IO_TIME AS IO_TIME,
                S1.LONO AS LONO,
                S1.STATUS AS STATUS
            FROM ASRS_WOKDAT S0
                LEFT JOIN ASRS_WOKFIL S1
                    ON S0.OPNO = S1.OPNO
            WHERE S0.F4 = :LOT_NO
            AND S1.IO_TIME IS NOT NULL
            ORDER BY LOT_NO, TO_NUMBER(PALLET_SEQUENCE), IO_TIME `;
        const params = {
            LOT_NO: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + lotNo },
        };
        const result = await conn.execute(sql, params, { outFormat: oracledb.OBJECT });
        if (!result.rows.length) {
            throw new Error(`未找到${lotNo}的命令記錄`);
        }
        obj.res = result.rows;
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
