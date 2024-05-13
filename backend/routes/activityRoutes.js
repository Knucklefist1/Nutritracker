const express = require('express');
const router = express.Router(); // Opretter en router til håndtering af ruteanmodninger
const sql = require('mssql'); // Importerer MSSQL-modul til databaseinteraktion

// Opret ny aktivitet
router.post('/api/activities', (req, res) => {
    const { userId, name, Caloriesburned, time, date } = req.body; // Udpakker data fra anmodningen
    const query = `
        INSERT INTO [dbo].[ActivityTracker] (UserID, name, Caloriesburned, Time,date)
        VALUES (${userId}, '${name}', ${Caloriesburned}, '${time}', '${date}')
    `; // SQL-forespørgsel til at indsætte aktivitetsdata i databasen
    sql.query(query) // Udfører SQL-forespørgslen
        .then(result => res.json({ message: 'Activity recorded successfully' })) // Sender succesmeddelelse til klienten
        .catch(err => res.status(500).json({ error: err.message })); // Sender fejlmeddelelse til klienten ved fejl
});

// Læs aktivitet
router.get('/api/activities/:userId', (req, res) => {
    const userId = req.params.userId; // Henter bruger-ID fra anmodningen
    const query = `SELECT * FROM [dbo].[ActivityTracker] WHERE UserID = ${userId}`; // SQL-forespørgsel til at hente aktiviteter baseret på bruger-ID
    sql.query(query) // Udfører SQL-forespørgslen
        .then(result => res.json(result.recordset)) // Sender aktivitetsdata til klienten
        .catch(err => res.status(500).json({ error: err.message })); // Sender fejlmeddelelse til klienten ved fejl
});

// Opdater aktivitet
router.put('/api/activities/:activityId', (req, res) => {
    const activityId = req.params.activityId; // Henter aktivitets-ID fra anmodningen
    const { name, Caloriesburned, time, date } = req.body; // Udpakker data fra anmodningen
    const query = `
        UPDATE [dbo].[ActivityTracker]
        SET name = '${name}', Caloriesburned = ${Caloriesburned}, Time = '${time}',date = '${date}'
        WHERE ActivityID = ${activityId}
    `; // SQL-forespørgsel til at opdatere aktivitetsdata i databasen
    sql.query(query) // Udfører SQL-forespørgslen
        .then(result => res.json({ message: 'Activity updated successfully' })) // Sender succesmeddelelse til klienten
        .catch(err => res.status(500).json({ error: err.message })); // Sender fejlmeddelelse til klienten ved fejl
});

// Slet aktivitet
router.delete('/api/activities/:activityId', (req, res) => {
    const activityId = req.params.activityId; // Henter aktivitets-ID fra anmodningen
    const query = `DELETE FROM [dbo].[ActivityTracker] WHERE ActivityID = ${activityId}`; // SQL-forespørgsel til at slette aktivitet baseret på aktivitets-ID
    sql.query(query) // Udfører SQL-forespørgslen
        .then(result => res.json({ message: 'Activity deleted successfully' })) // Sender succesmeddelelse til klienten
        .catch(err => res.status(500).json({ error: err.message })); // Sender fejlmeddelelse til klienten ved fejl
}); 

// Ekstra post-rute til at håndtere oprettelse af aktivitet og beregning af basal stofskifte
router.post('/api/activities', (req, res) => {
    const { userId, activityName, caloriesBurned } = req.body; // Udpakker data fra anmodningen
    // Indsæt logik til at beregne basal stofskifte og gem aktivitetsdata
});

module.exports = router; // Eksporterer routerobjektet til brug i andre filer
