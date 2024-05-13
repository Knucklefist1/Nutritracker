// Import af nødvendige moduler
const express = require('express'); // Express framework til webapplikationer
const sql = require('mssql'); // SQL-modul til databaseforbindelse
const dbConfig = require('./DB/dbconfig'); // Konfiguration for databaseforbindelse
const bodyParser = require('body-parser'); // Parser til at læse indkommende anmodninger
const cors = require('cors'); // Middleware for håndtering af CORS
const userRoutes = require('./routes/userRoutes'); // Ruter for brugerrelaterede handlinger
const mealRoutes = require('./routes/mealRoutes'); // Ruter for måltider
const activityRoutes = require('./routes/activityRoutes'); // Ruter for aktiviteter
const mealTrackerRoutes = require('./routes/mealTrackerRoutes'); // Ruter for måltidssporing
const bmrRoutes = require('./routes/bmrRoutes'); // Ruter for basalt stofskifte
const mealIngredientTracker = require('./routes/mealIngredientTracker'); // Ruter for ingredienssporing i måltider
const dailyNutriRoutes = require('./routes/dailyNutriRoutes'); // Ruter for daglige ernæringsbehov

const app = express(); // Opretter en Express-app

// Middleware-konfiguration
app.use(bodyParser.json()); // Parser JSON-anmodninger
app.use(cors({origin: "*"})); // Håndterer CORS med oprindelse sat til alle
app.use('/', userRoutes); // Brugerrelaterede ruter
app.use('/', mealRoutes); // Ruter for måltider
app.use('/', activityRoutes); // Ruter for aktiviteter
app.use('/', mealTrackerRoutes); // Ruter for måltidssporing
app.use('/', bmrRoutes); // Ruter for basalt stofskifte
app.use('/', mealIngredientTracker); // Ruter for ingredienssporing i måltider
app.use('/', dailyNutriRoutes); // Ruter for daglige ernæringsbehov

// Testrute for at bekræfte, at API'en fungerer
app.get('/api', (req, res) => {
    res.status(200).send("API is working"); // Sender en bekræftelse på, at API'en fungerer
});

// Opret forbindelse til databasen
sql.connect(dbConfig)
    .then(() => {
        console.log('Database connected'); // Logger en bekræftelse på en vellykket databaseforbindelse
        // Starter serveren kun efter en vellykket databaseforbindelse
        app.listen(3000, () => {
            console.log('Server is running on port 3000'); // Logger, at serveren kører på port 3000
        });
    })
    .catch(err => {
        console.error('Database connection failed: ', err); // Logger en fejl, hvis databaseforbindelsen mislykkes
        // Håndter fejlen mere elegant, potentielt ved at forsøge igen eller afslutte
    });
