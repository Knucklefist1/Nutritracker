// dbConfig.js

require('dotenv').config(); // Sikrer, at miljøvariabler er indlæst

// Konfiguration af databaseforbindelse
const dbConfig = {
    user: process.env.AZURE_SQL_USER, // Brugernavn til databaseadgang
    password: process.env.AZURE_SQL_PASSWORD, // Adgangskode til databaseadgang
    database: process.env.AZURE_SQL_DATABASE, // Databasenavn
    server: process.env.AZURE_SQL_SERVER, // Serveradresse til databasen
    options: {
        encrypt: true, // Aktiver kryptering af forbindelsen
        trustServerCertificate: false, // Deaktiver tillid til servercertifikat
        hostNameInCertificate: '*.database.windows.net', // Angiv værtens navn i certifikatet
        loginTimeout: 30 // Tidsgrænse for login i sekunder
    }
};

module.exports = dbConfig; // Eksporterer konfigurationsobjektet til brug i andre filer
