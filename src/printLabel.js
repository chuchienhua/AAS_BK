import axios from 'axios';
import moment from 'moment';
import FormData from 'form-data';
import { getNowDatetimeString } from './libs.js';

const axiosConfig = {
    proxy: false,
    timeout: 20000,
};

//列印成品標籤
export const printLabelAPI = async (opno, palletSequence, printerIP, printerPort, fontZone, labelData, user) => {
    const obj = {
        res: '',
        error: false,
    };

    //產生FormData
    const formData = new FormData();
    formData.append('OPNO', opno); //棧板編號
    formData.append('COMPANY', '2');
    formData.append('FIRM', '3');
    formData.append('DEPT', '23EC');
    formData.append('TAG_KIND', 'ASRS_TAG');
    formData.append('PRINTER_IP', printerIP); //標籤機IP
    formData.append('PORT', printerPort); //標籤機Port
    formData.append('FONT_ZONE', fontZone); //標籤機字型
    formData.append('MEMO', labelData.memo || '');
    formData.append('LOT_NO', labelData.lotNo);
    formData.append('PRD_PC', labelData.productNo);
    formData.append('MATERIAL', labelData.itemType);
    formData.append('PALLET_KIND', labelData.palletType);
    formData.append('PACK_KIND', labelData.packType);
    formData.append('PALLET_SEQ', palletSequence);
    formData.append('MFG_DATE', moment(labelData.manDate).format('YYYY/MM/DD'));
    formData.append('EXP_DATE', moment(labelData.expireDate).format('YYYY/MM/DD'));
    formData.append('DRIVER', labelData.driver);
    formData.append('PRINT_TIME', moment(new Date()).format('YYYY/MM/DD HH:mm:ss'));
    formData.append('PRINT_USER', user.PPS_CODE);
    formData.append('CREATOR', user.PPS_CODE);
    formData.append('REPRINT', 'false');

    const PRINT_ASRS_API = 'http://203.69.135.244/EC/AsrsAPI/PrintEcAsrsTag';
    const timeName = `${getNowDatetimeString()} printLabelAPI ${printerIP}花費時間`;
    try {
        console.time(timeName);
        const apiResult = await axios.post(PRINT_ASRS_API, formData, {
            ...axiosConfig,
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        console.timeEnd(timeName);
        console.log(apiResult.data);
        if ('PRINT_OK' !== apiResult.data) {
            obj.res = apiResult.data;
            obj.error = true;
        }
    } catch (err) {
        console.error(getNowDatetimeString(), 'printLabelAPI', err.toString());
        console.timeEnd(timeName);
        obj.res = err.toString();
        obj.error = true;
    }

    return obj;
};