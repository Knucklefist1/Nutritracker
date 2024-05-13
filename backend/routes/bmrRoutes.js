const express = require('express');
const router = express.Router(); // Opretter en router til håndtering af ruteanmodninger
const sql = require('mssql'); // Importerer MSSQL-modul til databaseinteraktion

// Opret ny BMR-post
router.post("/api/bmr", (req, res) => {
    const { userID, age, weight, datetime, bmrvalue } = req.body; // Udpakker data fra anmodningen
    const query = `INSERT INTO BMR (UserID, Age, Weight, Datetime,BmrValue)
                     VALUES (@UserID, @Age, @Weight, @Datetime,@BmrValue);`; // SQL-forespørgsel til at indsætte BMR-data i databasen
    const request = new sql.Request();
    request.input("UserID", sql.Int, userID);
    request.input("Age", sql.Int, age);
    request.input("Weight", sql.Decimal(10, 2), weight);
    request.input("Datetime", sql.DateTime, datetime);
    request.input("BmrValue", sql.VarChar(8), bmrvalue);

    request.query(query, (err, result) => { // Udfører SQL-forespørgslen
        if (err) {
            res.status(500).send(err.message); // Sender fejlmeddelelse til klienten ved fejl
        } else {
            res.json({ success: true }); // Sender succesmeddelelse til klienten
        }
    });
});

// Læs alle BMR-poster
router.get('/api/bmr/:userID', (req, res) => {
    const userId = req.params.userID; // Henter bruger-ID fra anmodningen
    const query = `SELECT * FROM BMR where UserID = ${userId};`; // SQL-forespørgsel til at hente BMR-data baseret på bruger-ID
    sql.query(query, (err, result) => { // Udfører SQL-forespørgslen
        if (err) {
            res.status(500).send(err.message); // Sender fejlmeddelelse til klienten ved fejl
        } else {
            res.status(200).json(result.recordset); // Sender BMR-data til klienten
        }
    });
});

// Opdater en BMR-post
router.put('/api/bmr/:id', (req, res) => {
    const { userID, age, weight, datetime, bmrvalue } = req.body; // Udpakker data fra anmodningen
    const { id } = req.params; // Henter BMR-ID fra anmodningen
    const query = `UPDATE BMR SET UserID = @UserID, Age = @Age, Weight = @Weight, Datetime = @Datetime , BmrValue = @BmrValue
                   WHERE BMRID = @BMRID;`; // SQL-forespørgsel til at opdatere BMR-data i databasen
    const request = new sql.Request();
    request.input('BMRID', sql.Int, id);
    request.input('UserID', sql.Int, userID);
    request.input('Age', sql.Int, age);
    request.input('Weight', sql.Decimal(10, 2), weight);
    request.input('Datetime', sql.DateTime, datetime);
    request.input('BmrValue', sql.VarChar(8), bmrvalue);

    request.query(query, (err, result) => { // Udfører SQL-forespørgslen
        if (err) {
            res.status(500).json({ "message": err.message }); // Sender fejlmeddelelse til klienten ved fejl
        } else {
            res.status(200).send('BMR record updated successfully'); // Sender succesmeddelelse til klienten
        }
    });
});

// Slet en BMR-post
router.delete('/api/bmr/:id', (req, res) => {
    const { id } = req.params; // Henter BMR-ID fra anmodningen
    const query = `DELETE FROM BMR WHERE BMRID = @BMRID;`; // SQL-forespørgsel til at slette BMR-post baseret på BMR-ID
    const request = new sql.Request();
    request.input('BMRID', sql.Int, id);

    request.query(query, (err, result) => { // Udfører SQL-forespørgslen
        if (err) {
            res.status(500).send(err.message); // Sender fejlmeddelelse til klienten ved fejl
        } else {
            res.status(200).send('BMR record deleted successfully'); // Sender succesmeddelelse til klienten
        }
    });
});

// Eksempel slutpunkt til beregning af basal stofskifte
router.post('/api/basal-metabolic-rate/calculate', (req, res) => {
    const { userId, weight, age, gender } = req.body; // Udpakker data fra anmodningen
    // Indsæt logik til at beregne basal stofskifte
});

module.exports = router; // Eksporterer routerobjektet til brug i andre filer
