const config = {
    port: 8080,
    applicationName: 'beachesEast',
    mysql: {
        user: 'sportorg',
        password: 'notarealpassword',
        host: 'localhost',
        port: 3306,
        database: 'beaches',
        connectionLimit: 10
    }
};
module.exports = config;