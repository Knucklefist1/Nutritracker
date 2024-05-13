const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.post('/api/activities', (req, res) => {
    const { userId, name, Caloriesburned, time, date } = req.body;
    const query = `
        INSERT INTO [dbo].[ActivityTracker] (UserID, name, Caloriesburned, Time,date)
        VALUES (${userId}, '${name}', ${Caloriesburned}, '${time}', '${date}')
    `;
    sql.query(query)
        .then(result => res.json({ message: 'Activity recorded successfully' }))
        .catch(err => res.status(500).json({ error: err.message }));
});

// Read Activity
router.get('/api/activities/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = `SELECT * FROM [dbo].[ActivityTracker] WHERE UserID = ${userId}`;
    sql.query(query)
        .then(result => res.json(result.recordset))
        .catch(err => res.status(500).json({ error: err.message }));
});

// Update Activity
router.put('/api/activities/:activityId', (req, res) => {
    const activityId = req.params.activityId;
    const { name, Caloriesburned, time, date } = req.body;
    const query = `
        UPDATE [dbo].[ActivityTracker]
        SET name = '${name}', Caloriesburned = ${Caloriesburned}, Time = '${time}',date = '${date}'
        WHERE ActivityID = ${activityId}
    `;
    sql.query(query)
        .then(result => res.json({ message: 'Activity updated successfully' }))
        .catch(err => res.status(500).json({ error: err.message }));
});

// Delete Activity
router.delete('/api/activities/:activityId', (req, res) => {
    const activityId = req.params.activityId;
    const query = `DELETE FROM [dbo].[ActivityTracker] WHERE ActivityID = ${activityId}`;
    sql.query(query)
        .then(result => res.json({ message: 'Activity deleted successfully' }))
        .catch(err => res.status(500).json({ error: err.message }));
}); 
router.post('/api/activities', (req, res) => {
    const { userId, activityName, caloriesBurned } = req.body;
    // Insert logic to calculate basal metabolic rate and store activity data
});
module.exports = router;