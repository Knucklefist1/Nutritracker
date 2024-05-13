const express = require('express');
const router = express.Router(); // Opretter en router til håndtering af ruteanmodninger
const sql = require('mssql'); // Importerer MSSQL-modul til databaseinteraktion

// Opret en ny post-rute for daglig ernæring
router.post('/api/daily-nutri', (req, res) => {
    const { userId, time, energyIntake, waterIntake, caloriesBurned, calorieBalance } = req.body; // Udpakker data fra anmodningen
    const query = `
        INSERT INTO [dbo].[DailyNutri] (UserID, Time, Energyintake, Waterintake, Caloriesburned, Caloriebalance)
        VALUES (${userId}, '${time}', ${energyIntake}, ${waterIntake}, ${caloriesBurned}, ${calorieBalance})
    `; // SQL-forespørgsel til at indsætte daglig ernæringsdata i databasen
    sql.query(query)
        .then(result => res.json({ message: 'Daily nutrition record created successfully' })) // Sender succesmeddelelse til klienten
        .catch(err => res.status(500).json({ error: err.message })); // Sender fejlmeddelelse til klienten ved fejl
});

// Læs alle daglige ernæringsposter
router.get('/api/daily-nutri/:userId', (req, res) => {
    const userId = req.params.userId; // Henter bruger-ID fra anmodningen
    const query = `SELECT * FROM [dbo].[DailyNutri] WHERE UserID = ${userId}`; // SQL-forespørgsel til at hente daglig ernæringsdata baseret på bruger-ID
    sql.query(query)
        .then(result => res.json(result.recordset)) // Sender daglig ernæringsdata til klienten
        .catch(err => res.status(500).json({ error: err.message })); // Sender fejlmeddelelse til klienten ved fejl
});

// Opdater en daglig ernæringspost
router.put('/api/daily-nutri/:recordId', (req, res) => {
    const recordId = req.params.recordId; // Henter post-ID fra anmodningen
    const { time, energyIntake, waterIntake, caloriesBurned, calorieBalance } = req.body; // Udpakker data fra anmodningen
    const query = `
        UPDATE [dbo].[DailyNutri]
        SET Time = '${time}', Energyintake = ${energyIntake}, Waterintake = ${waterIntake}, 
            Caloriesburned = ${caloriesBurned}, Caloriebalance = ${calorieBalance}
        WHERE RecordID = ${recordId}
    `; // SQL-forespørgsel til at opdatere daglig ernæringsdata i databasen
    sql.query(query)
        .then(result => res.json({ message: 'Daily nutrition record updated successfully' })) // Sender succesmeddelelse til klienten
        .catch(err => res.status(500).json({ error: err.message })); // Sender fejlmeddelelse til klienten ved fejl
});

// Slet en daglig ernæringspost
router.delete('/api/daily-nutri/:recordId', (req, res) => {
    const recordId = req.params.recordId; // Henter post-ID fra anmodningen
    const query = `DELETE FROM [dbo].[DailyNutri] WHERE RecordID = ${recordId}`; // SQL-forespørgsel til at slette daglig ernæringspost baseret på post-ID
    sql.query(query)
        .then(result => res.json({ message: 'Daily nutrition record deleted successfully' })) // Sender succesmeddelelse til klienten
        .catch(err => res.status(500).json({ error: err.message })); // Sender fejlmeddelelse til klienten ved fejl
});

// Eksempel slutpunkt til at hente daglig ernæringsdata
router.get("/api/daily-nutri-calories-daywise/:userID", async (req, res) => {
    try {
        const userID = req.params.userID; // Henter bruger-ID fra anmodningen

        const mealQuery = `
          SELECT *
          FROM (
              SELECT 
                  *,
                  CONCAT([Date], ' ', [Time]) AS datetime_column
              FROM 
                  [dbo].[MealTracker]
          ) AS sub
          WHERE 
              sub.datetime_column >= DATEADD(DAY, -30, GETDATE()) AND UserID = @UserID;`;

        const activityQuery = `
          SELECT *
          FROM (
              SELECT 
                  *,
                  CONCAT([Date], ' ', [Time]) AS datetime_column
              FROM 
                  [dbo].[ActivityTracker]
          ) AS sub
          WHERE 
              sub.datetime_column >= DATEADD(DAY, -30, GETDATE()) AND UserID = @UserID;`;

        const ingredientQuery = `
          SELECT *
          FROM (
              SELECT 
                  *,
                  CONCAT([Date], ' ', [Time]) AS datetime_column
              FROM 
                  [dbo].[MealIngredientTracker]
          ) AS sub
          WHERE 
              sub.datetime_column >= DATEADD(DAY, -30, GETDATE()) AND UserID = @UserID;`;

        const request = new sql.Request();
        request.input("UserID", sql.Int, userID);

        // Udfør alle forespørgsler samtidigt
        const [mealResult, activityResult, ingredientResult] = await Promise.all([
            request.query(mealQuery),
            request.query(activityQuery),
            request.query(ingredientQuery),
        ]);

        // Kombiner resultaterne
        const combinedResult = {
            meals: mealResult.recordset,
            activities: activityResult.recordset,
            ingredients: ingredientResult.recordset,
        };

        res.status(200).json(combinedResult); // Sender kombinerede resultater til klienten
    } catch (error) {
        res.status(500).send(error.message); // Sender fejlmeddelelse til klienten ved fejl
    }
});

// Eksempel slutpunkt til at hente daglig ernæringsdata
router.get("/api/daily-nutri-calories/:userID", async (req, res) => {
    try {
        const userID = req.params.userID; // Henter bruger-ID fra anmodningen

        const mealQuery = `
          SELECT *,
            CONCAT([Date], ' ', [Time]) AS datetime_column
          FROM 
            [dbo].[MealTracker]
          WHERE 
            CONCAT([Date], ' ', [Time]) >= GETDATE() AND UserID = @UserID;`;

        const activityQuery = `
          SELECT *,
            CONCAT([Date], ' ', [Time]) AS datetime_column
          FROM 
            [dbo].[ActivityTracker]
          WHERE 
            CONCAT([Date], ' ', [Time]) >= GETDATE() AND UserID = @UserID;`;

        const ingredientQuery = `
          SELECT *,
            CONCAT([Date], ' ', [Time]) AS datetime_column
          FROM 
            [dbo].[MealIngredientTracker]
          WHERE 
            CONCAT([Date], ' ', [Time]) >= GETDATE() AND UserID = @UserID;`;

        const request = new sql.Request();
        request.input("UserID", sql.Int, userID);

        // Udfør alle forespørgsler samtidigt
        const [mealResult, activityResult, ingredientResult] = await Promise.all([
            request.query(mealQuery),
            request.query(activityQuery),
            request.query(ingredientQuery), // Rettede fra IngredientQuery til ingredientQuery
        ]);

        // Kombiner resultaterne
        const combinedResult = {
            meals: mealResult.recordset, // Rettede fra mealsa til meals
            activities: activityResult.recordset,
            ingredients: ingredientResult.recordset, // Rettede fra ingredi til ingredients
        };

        res.status(200).json(combinedResult); // Sender kombinerede resultater til klienten
    } catch (error) {
        res.status(500).send(error.message); // Sender fejlmeddelelse til klienten ved fejl
    }
});

module.exports = router; // Eksporterer routerobjektet til brug i andre filer
