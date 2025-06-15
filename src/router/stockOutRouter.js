import * as stockOutDB from '../stockOut/oracleStockOut.js';
import express from 'express';

const stockOutRouter = express.Router();
stockOutRouter.post('/searchStockOut', async (req, res) => {
    const stockOutLotNo = req.body.stockOutLotNo; //批號
    const stockOutProductCode = req.body.stockOutProductCode;//產品簡碼
    const stockOutPackageType = req.body.stockOutPackageType; // 包裝種類
    const stockOutItem = req.body.stockOutItem; // 料品
    const stockOutReasonMark = req.body.stockOutReasonMark; // 備註
    const Lono = req.body.Lono; //庫位
    // const stockOutModel = req.body.stockOutModel;//出庫模式
    // const stockOutOrder = req.body.stockOutOrder; //出庫順序

    stockOutDB.searchStockoutStgfld(stockOutLotNo, stockOutProductCode, stockOutPackageType, stockOutItem, stockOutReasonMark, Lono)
        .then(val => res.send(val));

});

//取得STGFLD全部資訊
stockOutRouter.get('/getAllStockoutStgfld', function (req, res) {
    stockOutDB.getAllStockoutStgfld()
        .then(val => res.send(val));
});

//出貨後使用WCS_TRK 更新ASRS.WOKFIL狀態
stockOutRouter.post('/updateWcsTrkStatus', async (req, res) => {
    const vOpno = req.body.vOpno;
    const vStatus = req.body.vStatus;
    const vStno = req.body.vStno;
    const vFlag = req.body.vFlag;

    stockOutDB.updateWcsTrkStatus(vOpno, vStatus, vStno, vFlag)
        .then(val => res.send(val));
});

//過濾下拉式選單
stockOutRouter.post('/filterStockoutStgfld', async (req, res) => {
    //F4 F5 F6 F9
    const stockOutLotNo = req.body.stockOutLotNo; //批號
    const stockOutProductCode = req.body.stockOutProductCode;//產品簡碼
    const stockOutPackageType = req.body.stockOutPackageType; // 包裝種類
    const stockOutItem = req.body.stockOutItem; // 料品
    const stockOutReasonMark = req.body.stockOutReasonMark; // 備註
    const Lono = req.body.Lono;
    // console.log(stockOutLotNo, stockOutProductCode, stockOutItem, stockOutPackageType);
    stockOutDB.filterStockoutStgfld(stockOutLotNo, stockOutProductCode, stockOutItem, stockOutPackageType, stockOutReasonMark, Lono)
        .then(val => res.send(val));
});

//預約出庫過濾下拉式選單
stockOutRouter.post('/filterStockoutReserve', async (req, res) => {
    //ReserveDate, Factory, OPNO, F4, F5, F6, F9
    const ReserveDate = req.body.ReserveDate;
    const Factory = req.body.Factory;
    const Opno = req.body.Opno;
    const F4 = req.body.F4;
    const F5 = req.body.F5;
    const F6 = req.body.F6;
    const F9 = req.body.F9;

    // console.log(stockOutLotNo, stockOutProductCode, stockOutItem, stockOutPackageType);
    stockOutDB.filterStockoutReserve(ReserveDate, Factory, Opno, F4, F5, F6, F9)
        .then(val => res.send(val));
});

//預約出庫查詢
stockOutRouter.post('/reserveStockOutSearch', async (req, res) => {
    //ReserveDate, Factory, OPNO, F4, F5, F6, F9
    const ReserveDate = req.body.ReserveDate;
    const Factory = req.body.Factory;
    const Lono = req.body.Lono;
    const Opno = req.body.Opno;
    const F4 = req.body.F4;
    const F5 = req.body.F5;
    const F6 = req.body.F6;
    const F9 = req.body.F9;

    // console.log(stockOutLotNo, stockOutProductCode, stockOutItem, stockOutPackageType);
    stockOutDB.reserveStockOutSearch(ReserveDate, Factory, Lono, Opno, F4, F5, F6, F9)
        .then(val => res.send(val));
});

//預約出庫單個刪除
stockOutRouter.post('/reserveStockOutDelete', async (req, res) => {
    //ReserveDate, Factory, OPNO, F4, F5, F6, F9
    const ReserveDate = req.body.ReserveDate;
    const Factory = req.body.Factory;
    const Opno = req.body.Opno;
    const F4 = req.body.F4;
    const F5 = req.body.F5;
    const F6 = req.body.F6;
    const F9 = req.body.F9;
    stockOutDB.reserveStockOutDelete(ReserveDate, Factory, Opno, F4, F5, F6, F9)
        .then(val => res.send(val));
});

//預約出貨 reserveStockOut
stockOutRouter.post('/reserveStockOut', async (req, res) => {
    //ReserveDate, Factory, OPNO, LOC_TYPE F4, F5, F6, F9
    const ReserveDate = req.body.ReserveDate;
    const Factory = req.body.Factory;
    const Lono = req.body.Lono;
    const Opno = req.body.Opno;
    const Loc_Type = req.body.Loc_Type;
    const F4 = req.body.F4;
    const F5 = req.body.F5;
    const F6 = req.body.F6;
    const F9 = req.body.F9;
    const F11 = req.body.F11;
    const F13 = req.body.F13;
    const ListStatus = req.body.ListStatus;
    // console.log(stockOutLotNo, stockOutProductCode, stockOutItem, stockOutPackageType);
    stockOutDB.reserveStockOut(ReserveDate, Factory, Lono, Opno, Loc_Type, F4, F5, F6, F9, F11, F13, ListStatus)
        .then(val => res.send(val));
});

//取得廠商名稱
stockOutRouter.get('/getFactory', async (req, res) => {
    stockOutDB.getFactory()
        .then(val => res.send(val));
});

//加入預約出貨 reserveCopyList
stockOutRouter.post('/reserveCopyList', async (req, res) => {
    //ReserveDate, Factory, OPNO, LOC_TYPE F4, F5, F6, F9
    const ReserveDate = req.body.ReserveDate;
    const Factory = req.body.Factory;
    const F4 = req.body.F4;
    const F5 = req.body.F5;
    const F11 = req.body.F11;
    const F13 = req.body.F13;
    const ListStatus = req.body.ListStatus;
    // console.log(ReserveDate, Factory, F4, F5, F11, F13)
    stockOutDB.reserveCopyList(ReserveDate, Factory, F4, F5, F11, F13, ListStatus)
        .then(val => res.send(val));
});

//測試Procedure asrsGetCommand
stockOutRouter.post('/asrsGetCommand', async (req, res) => {
    const V_COMPANY = req.body.V_COMPANY;
    const V_FIRM = req.body.V_FIRM;
    const V_DEPT = req.body.V_DEPT;
    const V_O_OPNO = req.body.V_O_OPNO;
    const V_STNO = req.body.V_STNO;
    const V_LONO = req.body.V_LONO;
    const V_ORIGINAL_LONO = req.body.V_ORIGINAL_LONO;
    const V_IO_KIND = req.body.V_IO_KIND;

    stockOutDB.asrsGetCommand(V_COMPANY, V_FIRM, V_DEPT, V_O_OPNO, V_STNO, V_LONO, V_ORIGINAL_LONO, V_IO_KIND)
        .then(val => res.send(val));
});

//測試Procedure asrs_get_loc
stockOutRouter.post('/asrsGetLoc', async (req, res) => {
    const V_COMPANY = req.body.V_COMPANY;
    const V_FIRM = req.body.V_FIRM;
    const V_DEPT = req.body.V_DEPT;
    const V_OPNO = req.body.V_OPNO;
    const V_STNO = req.body.V_STNO;
    const V_CRANE = req.body.V_CRANE;
    const V_FLAG = req.body.V_FLAG;
    const V_OUT_LONO = req.body.V_OUT_LONO;

    stockOutDB.asrsGetLoc(V_COMPANY, V_FIRM, V_DEPT, V_OPNO, V_STNO, V_CRANE, V_FLAG, V_OUT_LONO)
        .then(val => res.send(val));
});

//測試Procedure asrsOutWarehouse
stockOutRouter.post('/asrsOutWarehouse', async (req, res) => {
    const V_COMPANY = req.body.V_COMPANY;
    const V_FIRM = req.body.V_FIRM;
    const V_DEPT = req.body.V_DEPT;
    const V_OPNO = req.body.V_OPNO;
    const V_LONO = req.body.V_LONO;
    const V_LOC_TYPE = req.body.V_LOC_TYPE;
    const V_CRANE = req.body.V_CRANE;
    const V_FLAG = req.body.V_FLAG;
    const V_TO_ST = req.body.V_TO_ST;

    stockOutDB.asrsOutWareHouse(V_COMPANY, V_FIRM, V_DEPT, V_OPNO, V_LONO, V_LOC_TYPE, V_CRANE, V_FLAG, V_TO_ST)
        .then(val => res.send(val));

});

export default stockOutRouter;