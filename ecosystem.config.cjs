module.exports = {
    apps: [{
        name: 'ml-ec-wms-server',
        script: 'src/server.js',
        args: '',
        instances: 1,
        exec_mode: 'fork',
        autorestart: true,
        watch: false,
        //max_memory_restart: '1G',
        env_production: {
            NODE_ENV: 'production',
            DEBUG: null,
        },
    }],
};
