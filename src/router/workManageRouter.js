import * as workManageDB from '../workManage/oracleWorkManage.js';
import express from 'express';

const workManageRouter = express.Router();

/* 工作命令檔執行狀態維護 */
//取得目前所有尚未完成的工作命令檔
workManageRouter.get('/getWorkFile/:dateAfter', function (req, res) {
    const dateAfter = req.params.dateAfter; //YYYYMMDD
    workManageDB.getWorkFile(dateAfter)
        .then(val => res.send(val));
});

//強制取消特定工作命令
workManageRouter.get('/cancelWork/:opno', function (req, res) {
    const opno = req.params.opno;
    workManageDB.cancelWork(opno)
        .then(val => res.send(val));
});

//強制完成特定工作命令
workManageRouter.get('/finishWork/:opno', function (req, res) {
    const opno = req.params.opno;
    workManageDB.finishWork(opno)
        .then(val => res.send(val));
});

export default workManageRouter;