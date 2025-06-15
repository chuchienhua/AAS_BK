import * as monitDB from '../monit/oracleMonit.js';
import express from 'express';

const monitRouter = express.Router();

/* 監控相關 */
//取得吊車狀態
monitRouter.get('/crane', function (req, res) {
    monitDB.getCraneStatus()
        .then(val => res.send(val));
});

//庫位概況
monitRouter.get('/stock', function (req, res) {
    monitDB.getStockSummary()
        .then(val => res.send(val));
});

export default monitRouter;