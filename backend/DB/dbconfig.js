// dbConfig.js
require('dotenv').config(); // Ensure environment variables are loaded

const dbConfig = {
    user: process.env.AZURE_SQL_USER,
    password: process.env.AZURE_SQL_PASSWORD,
    database: process.env.AZURE_SQL_DATABASE,
    server: process.env.AZURE_SQL_SERVER,
    options: {
        encrypt: true,
        trustServerCertificate: false,
        hostNameInCertificate: '*.database.windows.net',
        loginTimeout: 30
    }
};

module.exports = dbConfig;
