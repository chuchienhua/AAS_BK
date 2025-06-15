import fs from 'fs';

const config = {
    secret: fs.readFileSync('/opt/CCPSSO.Core/SSO_TOKEN.key').toString(),
    ComeFrom: 1010000000000000,
    NAME: 'ml_ec_wms',
    HTTP_PORT: 10011,
    ORACLE_TNS: 'CF_ASRS.WORLD', //測試:203.69.135.52:1521/CF無法
    ORACLE_USERNAME: 'EC_ASRS',
    ORACLE_PASSWORD: 'EC_ASRS.2024PASS',
    ORACLE_CONFIG: {},
};

//Oracle DB連線設定
config.ORACLE_CONFIG = {
    user: config.ORACLE_USERNAME,
    password: config.ORACLE_PASSWORD,
    connectString: config.ORACLE_TNS,
};

export default config;