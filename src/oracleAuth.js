import config from './config.js';
import { getNowDatetimeString } from './libs.js';
import oracledb from 'oracledb';

//取得所有有權限的員工編號
export async function getAllUser() {
    let conn;
    let rows = [];
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);

        const sql = `
            SELECT PPS_CODE
            FROM WMS_AUTH
            GROUP BY PPS_CODE `;
        const result = await conn.execute(sql, {}, { outFormat: oracledb.OBJECT });
        rows = result.rows;
    } catch (err) {
        console.error(getNowDatetimeString(), 'getAllUser', err);
    } finally {
        if (conn) {
            await conn.close();
        }
    }

    return rows;
}

//帳號權限部分
export async function getAllUserAuth(userPPS) {
    let conn;
    let rows = [];
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);

        const sql = `
            SELECT S0.ROUTE, S0.ISADMIN, S1.ROUTE_NAME
            FROM WMS_AUTH S0 LEFT JOIN WMS_ROUTE_SETTINGS S1
                ON S0.ROUTE = S1.ROUTE
            WHERE S0.PPS_CODE = :PPS_CODE
            ORDER BY S1.ROUTE_ORDER `;
        const params = {
            PPS_CODE: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + userPPS },
        };
        const result = await conn.execute(sql, params, { outFormat: oracledb.OBJECT });
        rows = result.rows;
    } catch (err) {
        console.error(getNowDatetimeString(), 'getAllUserAuth', err);
    } finally {
        if (conn) {
            await conn.close();
        }
    }

    return rows;
}

//取得所有可用的Routes
export async function getAllRoutes() {
    let conn;
    let result;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = `
            SELECT S0.PPS_CODE, S0.ROUTE, S0.ISADMIN, S1.ROUTE_NAME, S2.NAME
            FROM WMS_AUTH S0 
                LEFT JOIN WMS_ROUTE_SETTINGS S1
                    ON S0.ROUTE = S1.ROUTE
                LEFT JOIN PERSON_FULL@ERP.ML.CCP.COM.TW S2
                    ON S0.PPS_CODE = S2.PPS_CODE
                    AND S2.IS_ACTIVE IN ('A', 'T')
            WHERE S0.ROUTE NOT IN ('authManage')
            ORDER BY S1.ROUTE_ORDER, S0.PPS_CODE  `;
        result = await conn.execute(sql, {}, { outFormat: oracledb.OBJECT });
    } catch (err) {
        console.error(getNowDatetimeString(), 'getAllRoutes', err);
    } finally {
        if (conn) {
            await conn.close();
        }
    }

    return result.rows;
}

//新增使用者權限
export async function addRouteUser(ppsCode, route, isAdmin, user) {
    let obj = {
        res: null,
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);

        const sql = `
            INSERT INTO WMS_AUTH ( PPS_CODE, ROUTE, ISADMIN, EDITOR )
            VALUES ( :PPS_CODE, :ROUTE, ${(isAdmin) ? '1' : '0'} , :EDITOR )`;
        const params = {
            PPS_CODE: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: ppsCode.toString() },
            ROUTE: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: route.toString() },
            EDITOR: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + user.PPS_CODE },
        };
        await conn.execute(sql, params, { autoCommit: true });
    } catch (err) {
        console.error(getNowDatetimeString(), 'addRouteUser', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }

    return obj;
}

//移除使用者權限
export async function removeRouteUser(ppsCode, route, isAdmin) {
    let obj = {
        res: null,
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);

        const sql = `
            DELETE WMS_AUTH
            WHERE PPS_CODE = :PPS_CODE
            AND ROUTE = :ROUTE
            AND ISADMIN = ${(isAdmin) ? '1' : '0'} `;
        const params = {
            PPS_CODE: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: ppsCode.toString() },
            ROUTE: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: route.toString() },
        };
        let result = await conn.execute(sql, params, { autoCommit: true });
        if (!result.rowsAffected) {
            throw new Error(`ROUTE: ${route}; 為找到使用者: ${ppsCode}`);
        }
    } catch (err) {
        console.error(getNowDatetimeString(), 'removeRouteUser', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }

    return obj;
}