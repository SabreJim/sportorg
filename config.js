const config = {
    prod: {
        env: 'prod',
        AWS: {
            region: "us-west-2",
            endpoint: "http://localhost:9999"
        },
        postgres: {
            user: 'orgAdmin',
            host: 'sport-org-db.cksjutalogqa.us-east-2.rds.amazonaws.com',
            database: 'sportorg',
            password: 'abcd1234',
            port: 5432
        }
    },
    local: {
        env: 'local',
        AWS: {
            accessKeyId: 'abcde',
            secretAccessKey: 'abcde',
            region: "us-west-2",
            endpoint: "http://localhost:8000"
        },
        postgres: {
            user: 'orgAdmin',
            host: 'sport-org-db.cksjutalogqa.us-east-2.rds.amazonaws.com',
            database: 'sportorg',
            password: 'abcd1234',
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