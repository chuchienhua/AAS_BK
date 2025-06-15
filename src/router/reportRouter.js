import * as reportDB from '../report/oracleReport.js';
import express from 'express';

const reportRouter = express.Router();

/* 報表相關 */
//取得吊車狀態
reportRouter.get('/trace/:lotNo', function (req, res) {
    const lotNo = req.params.lotNo;

    reportDB.trace(lotNo)
        .then(val => res.send(val));
});

export default reportRouter;