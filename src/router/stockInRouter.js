import * as stockInDB from '../stockIn/oracleStockIn.js';
import express from 'express';

const stockInRouter = express.Router();

/* 入庫作業 */
//取得列印標籤需要輸入的欄位列表
stockInRouter.get('/getPrintSetting', function (req, res) {
    stockInDB.getPrintSetting()
        .then(val => res.send(val));
});

//取得所有標籤機
stockInRouter.get('/getPrinter', function (req, res) {
    stockInDB.getPrinter()
        .then(val => res.send(val));
});

//取得所有吊車對應的棧位
stockInRouter.get('/getStackNo', function (req, res) {
    stockInDB.getStackNo()
        .then(val => res.send(val));
});

//列印棧板標籤
stockInRouter.post('/printPallet', function (req, res) {
    const printNum = req.body.printNum;
    const printerName = req.body.printerName;
    const labelData = req.body.labelData;

    stockInDB.printPallet(printNum, printerName, labelData, req.user)
        .then(val => res.send(val));
});

//取得棧板標籤資料
stockInRouter.get('/getLabelData/:opno', function (req, res) {
    const opno = req.params.opno;

    stockInDB.getLabelData(opno)
        .then(val => res.send(val));
});

//標籤掃碼入庫
stockInRouter.post('/scanStockIn', function (req, res) {
    const stackNo = req.body.stackNo;
    const opno = req.body.opno;

    stockInDB.scanStockIn(stackNo, opno)
        .then(val => res.send(val));
});

export default stockInRouter;