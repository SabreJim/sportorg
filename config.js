const config = {
    prod: {
        env: 'prod',
        port: 8081,
        postgres: {
            user: 'orgAdmin',
            host: 'sport-org-db.cksjutalogqa.us-east-2.rds.amazonaws.com',
            database: 'sportorg',
            password: 'notrealpassword',
            port: 5432
        }
    },
    local: {
        env: 'local',
        port: 8080,
        postgres: {
            user: 'orgAdmin',
            host: 'sport-org-db.cksjutalogqa.us-east-2.rds.amazonaws.com',
            database: 'sportorg',
            password: 'notrealpassword',
            port: 5432
        }
    }

};
module.exports = (env) => {
    if (config[env]) {
        return config[env];
    }
    return config['local'];
};