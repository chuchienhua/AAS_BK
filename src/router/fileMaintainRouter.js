import * as maintainDB from '../fileMaintain/oracleMaintain.js';
import express from 'express';

const maintainRouter = express.Router();

/* 檔案維護 */
//所有設定檔
maintainRouter.get('/settings', function (req, res) {
    maintainDB.getSettings()
        .then(val => res.send(val));
});

//項目異動
maintainRouter.post('/modify/:type', function (req, res) {
    const type = req.params.type; //新增或刪除
    const columnType = req.body.columnType; //哪一種品項要做調整
    const name = req.body.name;
    const settings = req.body.settings;

    if ('create' === type) {
        maintainDB.createFile(columnType, name, req.user)
            .then(val => res.send(val));

    } else if ('update' === type) {
        maintainDB.updateFile(columnType, name, settings, req.user)
            .then(val => res.send(val));

    } else {
        maintainDB.deleteFile(columnType, name)
            .then(val => res.send(val));
    }
});

//取得信件設定
maintainRouter.get('/mailList', function (req, res) {
    maintainDB.getMailList()
        .then(val => res.send(val));
});

//異動信件設定
maintainRouter.post('/mailList/:type', function (req, res) {
    const type = req.params.type; //delete || create
    const ppsCode = req.body.ppsCode;
    const mailKind = req.body.mailKind;

    maintainDB.editMailList(type, ppsCode, mailKind, req.user)
        .then(val => res.send(val));
});

//新增廠商名稱
maintainRouter.post('/createFactory', function (req, res) {
    const name = req.body.name;
    const user = req.body.user;

    maintainDB.createFactory(name, user)
        .then(val => res.send(val));
});

//取得廠商設定
maintainRouter.get('/getFactory', function (req, res) {
    maintainDB.getFactory()
        .then(val => res.send(val));
});

//刪除廠商名稱
maintainRouter.post('/deleteFactory', function (req, res) {
    const name = req.body.name;
    const user = req.body.user;

    maintainDB.deleteFactory(name, user)
        .then(val => res.send(val));
});

export default maintainRouter;