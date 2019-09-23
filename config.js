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
        },
        mysql: {
            user: 'sportorg',
            password: 'notarealpassword',
            host: '162.216.113.174',
            port: 3306,
            database: 'beaches',
            connectionLimit: 10
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
        },
        mysql: {
            user: 'sportorg',
            password: 'notarealpassword',
            host: '162.216.113.174',
            port: 3306,
            database: 'beaches',
            connectionLimit: 10
        }
    }

};
module.exports = (env) => {
    if (config[env]) {
        return config[env];
    }
    return config['local'];
};