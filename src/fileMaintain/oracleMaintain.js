import config from '../config.js';
import { getNowDatetimeString } from '../libs.js';
import oracledb from 'oracledb';

//取得所有設定檔
export async function getSettings() {
    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = `
            SELECT TYPE, NAME, CREATOR_NAME, CREATE_TIME, EXPIRE_TIME
            FROM WMS_FILE_MAINTAIN `;
        const result = await conn.execute(sql, {}, { outFormat: oracledb.OBJECT });
        obj.res = result.rows;
    } catch (err) {
        console.error(getNowDatetimeString(), 'getSettings', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }

    return obj;
}

//新增設定項目
export async function createFile(columnType, name, user) {
    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = `
            INSERT INTO WMS_FILE_MAINTAIN ( TYPE, NAME, CREATOR, CREATOR_NAME )
            VALUES ( :TYPE, :NAME, :CREATOR, :CREATOR_NAME ) `;
        const params = {
            TYPE: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + columnType },
            NAME: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + name },
            CREATOR: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + user.PPS_CODE },
            CREATOR_NAME: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + user.NAME },
        };
        await conn.execute(sql, params, { autoCommit: true });
    } catch (err) {
        console.error(getNowDatetimeString(), 'createFile', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }

    return obj;
}

//更新設定項目
export async function updateFile(columnType, name, settings) {
    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = `
            UPDATE WMS_FILE_MAINTAIN
            SET EXPIRE_TIME = :EXPIRE_TIME
            WHERE TYPE = :TYPE
            AND NAME = :NAME `;
        const params = {
            TYPE: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + columnType },
            NAME: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + name },
            EXPIRE_TIME: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: Number(settings.EXPIRE_TIME || 0) },
        };
        await conn.execute(sql, params, { autoCommit: true });
    } catch (err) {
        console.error(getNowDatetimeString(), 'updateFile', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }

    return obj;
}

//移除設定項目
export async function deleteFile(columnType, name) {
    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = `
            DELETE WMS_FILE_MAINTAIN
            WHERE TYPE = :TYPE
            AND NAME = :NAME `;
        const params = {
            TYPE: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + columnType },
            NAME: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + name },
        };
        await conn.execute(sql, params, { autoCommit: true });
    } catch (err) {
        console.error(getNowDatetimeString(), 'deleteFile', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }

    return obj;
}

//信件設定清單
export async function getMailList() {
    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = `
            SELECT S0.PPS_CODE, S0.MAIL_KIND, S1.NAME
            FROM WMS_MAIL_LIST S0
                LEFT JOIN PERSON_FULL@ERP.ML.CCP.COM.TW S1
                    ON S0.PPS_CODE = S1.PPS_CODE
                    AND S1.IS_ACTIVE IN ('A', 'T')
            ORDER BY MAIL_KIND, PPS_CODE `;
        const result = await conn.execute(sql, {}, { outFormat: oracledb.OBJECT });
        obj.res = result.rows;
    } catch (err) {
        console.error(getNowDatetimeString(), 'getMailList', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }

    return obj;
}

//編輯信件設定清單
export async function editMailList(type, ppsCode, mailKind, user) {
    let obj = {
        res: [],
        error: false,
    };

    let conn;
    let sql;
    let params;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        if ('create' === type) {
            sql = `
                INSERT INTO WMS_MAIL_LIST ( PPS_CODE, MAIL_KIND, CREATOR )
                VALUES ( :PPS_CODE, :MAIL_KIND, :CREATOR ) `;
            params = {
                PPS_CODE: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + ppsCode },
                MAIL_KIND: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + mailKind },
                CREATOR: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + user.PPS_CODE },
            };
            await conn.execute(sql, params, { autoCommit: true });

        } else {
            sql = `
                DELETE WMS_MAIL_LIST 
                WHERE PPS_CODE = :PPS_CODE
                AND MAIL_KIND = :MAIL_KIND `;
            params = {
                PPS_CODE: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + ppsCode },
                MAIL_KIND: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + mailKind },
            };
            await conn.execute(sql, params, { autoCommit: true });
        }
    } catch (err) {
        console.error(getNowDatetimeString(), 'editMailList', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }

    return obj;
}

//新增廠商名稱
export async function createFactory(name, user) {
    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = `
            INSERT INTO WMS_FACTORY_LIST ( FACTORY_NAME, CREATOR)
            VALUES ( :NAME, :CREATOR ) `;
        const params = {
            NAME: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + name },
            CREATOR: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + user },
        };
        await conn.execute(sql, params, { autoCommit: true });
    } catch (err) {
        console.error(getNowDatetimeString(), 'createFactory', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }

    return obj;
}

//選取廠商名稱
export async function getFactory() {
    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = `
            SELECT * FROM WMS_FACTORY_LIST 
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

//移除廠商項目
export async function deleteFactory(name, user) {
    let obj = {
        res: [],
        error: false,
    };

    let conn;
    try {
        conn = await oracledb.getConnection(config.ORACLE_CONFIG);
        const sql = `
            DELETE WMS_FACTORY_LIST
            WHERE FACTORY_NAME = :NAME
            AND CREATOR = :CREATOR `;
        const params = {
            NAME: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + name },
            CREATOR: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: '' + user },
        };
        await conn.execute(sql, params, { autoCommit: true });
    } catch (err) {
        console.error(getNowDatetimeString(), 'deleteFactory', err);
        obj.res = err.toString();
        obj.error = true;
    } finally {
        if (conn) {
            await conn.close();
        }
    }

    return obj;
}