process.env.TZ = 'Asia/Taipei';

import config from './config.js';
import * as libs from './libs.js';
import * as authDB from './oracleAuth.js';
import stockInRouter from './router/stockInRouter.js';
import stockOutRouter from './router/stockOutRouter.js';
import stockViewRouter from './router/stockViewRouter.js';
import stockCheckRouter from './router/stockCheckRouter.js';
import workManageRouter from './router/workManageRouter.js';
import monitRouter from './router/monitRouter.js';
import maintainRouter from './router/fileMaintainRouter.js';
import reportRouter from './router/reportRouter.js';
import express from 'express';
const app = express();

import jwt from 'jsonwebtoken';
import axios from 'axios';
import compression from 'compression';
import bodyParser from 'body-parser';

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// parse application/json
app.use(express.json({ limit: '20mb' }));
// parse form-data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//整合jwt
app.set('superSecret', config.secret); //jwt密鑰
const apiRoutes = express.Router();
const apiAllowList = new Set(['/login', '/loginJWT']); //忽略token檢查的API允許名單

//有權限的清單
let authUserList = [];
//刷新自動倉與員工編號的清單
async function resetAuthUserMap() {
    const authList = await authDB.getAllUser();
    if (authList.length) {
        authUserList = authList.map(x => x.PPS_CODE);
    }
}

process.on('unhandledRejection', reason => {
    console.error(`${libs.getNowDatetimeString()} Unhandled Rejection:`, reason);
});
process.on('uncaughtException', err => {
    console.error(`${libs.getNowDatetimeString()} Uncaught Exception:`, err);
});

apiRoutes.use((req, res, next) => {
    let token = null;
    if (req.headers.authorization && 'Bearer' === req.headers.authorization.split(' ')[0]) {
        token = req.headers.authorization.split(' ')[1];
    } else {
        token = req.body.token || req.query.token || req.headers['x-access-token'];
    }
    let statusCode = 200;
    let errMsg = '';

    req.user = {};
    if (token) {
        let expireSetting = ('/loginJWT' === req.path) ? {} : { ignoreExpiration: true }; //僅在Refresh時重新驗證Token期限
        jwt.verify(token, app.get('superSecret'), expireSetting, (err, decoded) => {
            if (err || !decoded) {
                statusCode = 403;
                errMsg = 'Failed to authenticate token.';
            } else {
                if (!authUserList.includes(decoded.PPS_CODE)) {
                    statusCode = 403;
                    errMsg = 'Failed to authenticate token.';
                }

                //使用者來源IP
                decoded.clientAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

                req.user = decoded;
                /*
                    {
                    COMPANY: '1',
                    FIRM: '1',
                    FIRM_NAME: '長春樹脂台北公司',
                    DEPT_NO: '11MIMI',
                    DEPT_NO_TW: null,
                    PPS_CODE: '23296',
                    NAME: '廖建銘',
                    DUTY_CODE: 'CNA',
                    EMAIL: 'chien_ming_liao@ccpgp.com',
                    ORG_NO: 'CCPG-WGROUP-11-MI-IOT',
                    ORG_NAME: '資訊中心IoT',
                    REAL_USER: null,
                    SESSION_ID: 'ed0e8a6f6099d23a53f77135e5a416',
                    VISION_TYPE: 'ADMIN',
                    ISENDER_NUM: '88212',
                    ISENDER_UUID: '8156daaf5035f0ed_8156daaf5035f0ed',
                    ss_exp: '2022/12/15 03:07:58',
                    exp: 1670988277
                    }
                */
            }
        });
    } else {
        statusCode = 403;
        errMsg = 'No token provided.';
    }

    //為了開發方便從localhost進來的連線可以忽略token
    if (apiAllowList.has(req.path)) {
        return next();
    } else if (200 !== statusCode) {
        return res.status(statusCode).json({ res: errMsg, error: true });
    }
    return next();
});

//CORS
apiRoutes.use((req, res, next) => {
    if ('OPTIONS' !== req.method) {
        console.log(`${libs.getNowDatetimeString()}; Method:${req.method}; Path:${req.path}; IP:${req.headers['x-forwarded-for'] || req.socket.remoteAddress};
            ${(req.user) && ` USER:${req.user.PPS_CODE}, ${req.user.NAME}; COMPANY:${req.user.COMPANY}; FIRM:${req.user.FIRM}; `} `
        );
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Firm');
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

//gzip壓縮
apiRoutes.use(compression());

//登入串接Vision API
apiRoutes.post('/login', function (req, res) {
    const id = req.body.id;
    const pw = req.body.pw;

    const apiUrl = 'https://vision.ccpgp.com/api/common/login';
    axios.post(apiUrl, { id: id, pw: pw }, { proxy: false, timeout: 10000 })
        .then(val => {
            if (val.data.token) {
                authDB.getAllUserAuth(val.data.user.PPS_CODE)
                    .then(auth => {
                        if (auth.length) {
                            val.data.authRoutes = auth;
                            val.data.warehouse = 'ml_ec';
                        } else {
                            val.data.error = '並無此自動倉的權限';
                            val.data.token = null;
                        }
                        res.send(val.data);
                    });
            } else {
                res.send(val.data);
            }
        })
        .catch(err => {
            console.error(libs.getNowDatetimeString(), 'Login Error', err.toString());
            res.send({
                user: null,
                token: null,
                error: err.toString(),
            });
        });
});

apiRoutes.post('/loginJWT', function (req, res) {
    const token = req.body.token;

    const apiUrl = 'https://vision.ccpgp.com/api/common/refresh';
    axios.post(apiUrl, { token: token }, { proxy: false })
        .then(val => {
            if (val.data.token) {
                authDB.getAllUserAuth(val.data.user.PPS_CODE)
                    .then(auth => {
                        if (auth.length) {
                            val.data.authRoutes = auth;
                            val.data.warehouse = 'ml_ec';
                        } else {
                            val.data.error = '並無此自動倉的權限';
                            val.data.token = null;
                        }
                        res.send(val.data);
                    });
            } else {
                res.send(val.data);
            }
        })
        .catch(err => {
            console.error(libs.getNowDatetimeString(), 'JWT login Error', err.toString());
            res.send({
                user: null,
                token: null,
                error: err.toString(),
            });
        });
});

//權限管理部分
//取得所有Routes
apiRoutes.get('/routes', function (req, res) {
    authDB.getAllRoutes()
        .then(val => res.send(val));
});

//新增使用者權限
apiRoutes.post('/addRouteUser', function (req, res) {
    const ppsCode = req.body.ppsCode;
    const route = req.body.route;
    const isAdmin = req.body.isAdmin;

    authDB.addRouteUser(ppsCode, route, isAdmin, req.user)
        .then(val => {
            resetAuthUserMap();
            res.send(val);
        });
});

//移除使用者權限
apiRoutes.post('/removeRouteUser', function (req, res) {
    const ppsCode = req.body.ppsCode;
    const route = req.body.route;
    const isAdmin = req.body.isAdmin;

    authDB.removeRouteUser(ppsCode, route, isAdmin, req.user)
        .then(val => {
            resetAuthUserMap();
            res.send(val);
        });
});

/* 入庫作業 */
apiRoutes.use('/stockIn', stockInRouter);

/* 出庫作業 */
apiRoutes.use('/stockOut', stockOutRouter);

/*庫存查詢 */
apiRoutes.use('/stockView', stockViewRouter);

/* 盤點作業 */
apiRoutes.use('/stockCheck', stockCheckRouter);

/* 工作命令檔維護 */
apiRoutes.use('/workManage', workManageRouter);

/* 監控相關 */
apiRoutes.use('/monit', monitRouter);

/* 檔案維護 */
apiRoutes.use('/fileMaintain', maintainRouter);

/* 報表相關 */
apiRoutes.use('/report', reportRouter);

//所有api先檢查token
const routerPath = '/api/ml_ec_wms_server';
console.log(`${libs.getNowDatetimeString()} routerPath: ${routerPath}`);
app.use(routerPath, apiRoutes);

app.listen(config.HTTP_PORT, () => {
    resetAuthUserMap();
    console.log(`ML EC WMS Server is listening on port ${config.HTTP_PORT}! ComeFrom=${config.ComeFrom}`);
});