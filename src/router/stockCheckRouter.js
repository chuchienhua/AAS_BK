import * as stockCheckDB from '../stockcheck/oracleStockCheck.js';
import express from 'express';

const stockCheckRouter = express.Router();

//取得STGFLD全部資訊
stockCheckRouter.get('/getAllStockCheckStgfld', function (req, res) {
    stockCheckDB.getAllStockCheckStgfld()
        .then(val => res.send(val));
});

//過濾下拉式選單
stockCheckRouter.post('/filterStockCheckStgfld', async (req, res) => {
    //F4 F5 F6 F9 F17 Lono
    const F4 = req.body.F4;
    const F5 = req.body.F5;
    const F6 = req.body.F6;
    const F9 = req.body.F9;
    const F8 = req.body.F8;
    const F17 = req.body.F17;
    stockCheckDB.filterStockCheckStgfld(F4, F5, F6, F8, F9, F17)
        .then(val => res.send(val));
});

//取得LOC全部資訊
stockCheckRouter.get('/getAllStockCheckLoc', function (req, res) {
    stockCheckDB.getAllStockCheckLoc()
        .then(val => res.send(val));
});

//取得STG查詢資訊資訊
stockCheckRouter.post('/searchStockCheckStgfld', async (req, res) => {
    const stockCheckF5 = req.body.stockCheckF5; //產品簡碼
    const stockCheckF4 = req.body.stockCheckF4;//批號
    const stockCheckF6 = req.body.stockCheckF6; // 料品
    const stockCheckF8 = req.body.stockCheckF8; //棧板種類
    const stockCheckF9 = req.body.stockCheckF9; // 包裝種類
    const stockCheckF17 = req.body.stockCheckF17;//備註

    stockCheckDB.searchStockCheckStgfld(stockCheckF4, stockCheckF5, stockCheckF6, stockCheckF8, stockCheckF9, stockCheckF17)
        .then(val => res.send(val));

});
//取得LOC查詢資訊資訊
stockCheckRouter.post('/searchStockCheckLoc', async (req, res) => {
    const Lono = req.body.Lono;
    const Status = req.body.Status;
    // console.log(Lono, Status);

    stockCheckDB.searchStockCheckLoc(Lono, Status)
        .then(val => res.send(val));
});

//取得LOC查詢資訊資訊
stockCheckRouter.post('/searchUnknownStockCheckLoc', async (req, res) => {
    const Lono = req.body.Lono;
    const Status = req.body.Status;
    // console.log(Lono, Status);

    stockCheckDB.searchUnknownStockCheckLoc(Lono, Status)
        .then(val => res.send(val));
});

//出貨後使用WCS_TRK 更新ASRS.WOKFIL狀態
stockCheckRouter.post('/updateWcsTrkStatus', async (req, res) => {
    const vOpno = req.body.vOpno;
    const vStatus = req.body.vStatus;
    const vStno = req.body.vStno;
    const vFlag = req.body.vFlag;
    // console.log(vOpno, vStatus, vStno, vFlag);

    stockCheckDB.updateWcsTrkStatus(vOpno, vStatus, vStno, vFlag)
        .then(val => res.send(val));
});

export default stockCheckRouter;