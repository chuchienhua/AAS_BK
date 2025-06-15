import axios from 'axios';
import moment from 'moment';
import qs from 'qs';
export const getNowDatetimeString = () => moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');

/**
 * 取得成品標籤棧板編號
 */
export async function getOpno() {
    let obj = {
        res: null,
        error: null,
    };

    try {
        const postData = {
            COMPANY: '2',
            FIRM: '3',
            DEPT: '23EC',
        };

        const url = 'http://203.69.135.244/EC/AsrsAPI/getOpno';
        const opno = await axios.post(url, qs.stringify(postData), {
            proxy: false,
            timeout: 10000,
        }).then(res => {
            if (res.data && res.data.length) {
                return res.data;
            }
        }).catch(err => {
            throw err;
        });

        if (opno) {
            obj.res = opno;
        }
    } catch (err) {
        console.error(getNowDatetimeString(), 'getOpno', err);
        obj.error = err.toString();
    }

    return obj;
}