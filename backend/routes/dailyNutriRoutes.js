const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.post('/api/daily-nutri', (req, res) => {
    const { userId, time, energyIntake, waterIntake, caloriesBurned, calorieBalance } = req.body;
    const query = `
        INSERT INTO [dbo].[DailyNutri] (UserID, Time, Energyintake, Waterintake, Caloriesburned, Caloriebalance)
        VALUES (${userId}, '${time}', ${energyIntake}, ${waterIntake}, ${caloriesBurned}, ${calorieBalance})
    `;
    sql.query(query)
        .then(result => res.json({ message: 'Daily nutrition record created successfully' }))
        .catch(err => res.status(500).json({ error: err.message }));
});

// Read Daily Nutrition Records
router.get('/api/daily-nutri/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = `SELECT * FROM [dbo].[DailyNutri] WHERE UserID = ${userId}`;
    sql.query(query)
        .then(result => res.json(result.recordset))
        .catch(err => res.status(500).json({ error: err.message }));
});

// Update Daily Nutrition Record
router.put('/api/daily-nutri/:recordId', (req, res) => {
    const recordId = req.params.recordId;
    const { time, energyIntake, waterIntake, caloriesBurned, calorieBalance } = req.body;
    const query = `
        UPDATE [dbo].[DailyNutri]
        SET Time = '${time}', Energyintake = ${energyIntake}, Waterintake = ${waterIntake}, 
            Caloriesburned = ${caloriesBurned}, Caloriebalance = ${calorieBalance}
        WHERE RecordID = ${recordId}
    `;
    sql.query(query)
        .then(result => res.json({ message: 'Daily nutrition record updated successfully' }))
        .catch(err => res.status(500).json({ error: err.message }));
});

// Delete Daily Nutrition Record
router.delete('/api/daily-nutri/:recordId', (req, res) => {
    const recordId = req.params.recordId;
    const query = `DELETE FROM [dbo].[DailyNutri] WHERE RecordID = ${recordId}`;
    sql.query(query)
        .then(result => res.json({ message: 'Daily nutrition record deleted successfully' }))
        .catch(err => res.status(500).json({ error: err.message }));
});
// Example endpoint to retrieve daily nutri data
router.get("/api/daily-nutri-calories-daywise/:userID", async (req, res) => {
    try {
        const userID = req.params.userID;

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

        // Execute both queries concurrently
        const [mealResult, activityResult, ingredientResult] = await Promise.all([
            request.query(mealQuery),
            request.query(activityQuery),
            request.query(ingredientQuery),
        ]);

        // Combine the results
        const combinedResult = {
            meals: mealResult.recordset,
            activities: activityResult.recordset,
            ingredients: ingredientResult.recordset,
        };

        res.status(200).json(combinedResult);
    } catch (error) {
        res.status(500).send(error.message);
    }
});
// Example endpoint to retrieve daily nutri data
router.get("/api/daily-nutri-calories/:userID", async (req, res) => {
    try {
        const userID = req.params.userID;

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

        // Execute all queries concurrently
        const [mealResult, activityResult, ingredientResult] = await Promise.all([
            request.query(mealQuery),
            request.query(activityQuery),
            request.query(ingredientQuery), // Corrected from IngredientQuery to ingredientQuery
        ]);

        // Combine the results
        const combinedResult = {
            meals: mealResult.recordset, // Corrected from mealsa to meals
            activities: activityResult.recordset,
            ingredients: ingredientResult.recordset, // Corrected from ingredi to ingredients
        };

        res.status(200).json(combinedResult);
    } catch (error) {
        res.status(500).send(error.message);
    }
});
module.exports = router