let package = require('../package');
module.exports = {
    app: {
        name: package.name,
        version: package.version
    },
    server: {
        port: process.env.NODE_APP_INSTANCE || 8081,
        lifeTime: process.env.NODE_LIFE_TIME || '', // For auto rebooting features use 'ms','m','s','h','d' suffix for this variable, for example 12h
    },
 
    mysqlPool: {
        host: process.env.DATABASE_HOST || '127.0.0.1',
        user: 'root',
        password: 'root',
        database: 'test'
    },
    tableName : "books"
};