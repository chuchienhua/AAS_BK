import * as stockViewDB from '../stockView/oracleStockView.js';
import express from 'express';
const stockViewRouter = express.Router();
//取得所有吊車對應的棧位
stockViewRouter.get('/getLocNo', function (req, res) {
    stockViewDB.getLocNo()
        .then(val => res.send(val));
});

//取得LocTable
stockViewRouter.post('/getLocTable', function (req, res) {
    const Lono = req.body.Lono;
    const Status = req.body.Status;
    stockViewDB.getLocTable(Lono, Status)
        .then(val => res.send(val));
});


//取得StgLocTable(Lono, Status, F4, F5, F6, F8, F9, startDate, endDate)
stockViewRouter.get('/getStgfldTable', function (req, res) {
    stockViewDB.getStgfldTable()
        .then(val => res.send(val));
});

//取得StgLocTable
stockViewRouter.post('/getAllStgfldTable', function (req, res) {
    //Lono, Status, F4, F5, F6, F8, F9, startDate, endDate
    const Lono = req.body.Lono;
    const Status = req.body.Status;
    const F4 = req.body.F4;
    const F5 = req.body.F5;
    const F6 = req.body.F6;
    const F9 = req.body.F9;
    const F17 = req.body.F17;
    const F19 = req.body.F19;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    stockViewDB.getAllStgfldTable(Lono, Status, F4, F5, F6, F9, F17, F19, startDate, endDate)
        .then(val => res.send(val));
});

//更新StgLocTable
stockViewRouter.post('/updateStgfldTable', function (req, res) {
    //Lono, F17
    const Lono = req.body.Lono;
    const F17 = req.body.F17;
    stockViewDB.updateStgfldTable(Lono, F17)
        .then(val => res.send(val));
});
export default stockViewRouter;