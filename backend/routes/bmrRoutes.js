const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.post("/api/bmr", (req, res) => {
    const { userID, age, weight, datetime, bmrvalue } = req.body;
    const query = `INSERT INTO BMR (UserID, Age, Weight, Datetime,BmrValue)
                     VALUES (@UserID, @Age, @Weight, @Datetime,@BmrValue);`;
    const request = new sql.Request();
    request.input("UserID", sql.Int, userID);
    request.input("Age", sql.Int, age);
    request.input("Weight", sql.Decimal(10, 2), weight);
    request.input("Datetime", sql.DateTime, datetime);
    request.input("BmrValue", sql.VarChar(8), bmrvalue);

    request.query(query, (err, result) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json({ success: true });
        }
    });
});




// READ operation - Get all BMR records
router.get('/api/bmr/:userID', (req, res) => {
    const userId = req.params.userID;
    const query = `SELECT * FROM BMR where UserID = ${userId};`;
    sql.query(query, (err, result) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).json(result.recordset);
        }
    });
});

// UPDATE operation - Update a BMR record
router.put('/api/bmr/:id', (req, res) => {
    const { userID, age, weight, datetime, bmrvalue } = req.body;
    const { id } = req.params;
    const query = `UPDATE BMR SET UserID = @UserID, Age = @Age, Weight = @Weight, Datetime = @Datetime , BmrValue = @BmrValue
                   WHERE BMRID = @BMRID;`;
    const request = new sql.Request();
    request.input('BMRID', sql.Int, id);
    request.input('UserID', sql.Int, userID);
    request.input('Age', sql.Int, age);
    request.input('Weight', sql.Decimal(10, 2), weight);
    request.input('Datetime', sql.DateTime, datetime);
    request.input('BmrValue', sql.VarChar(8), bmrvalue);

    request.query(query, (err, result) => {
        if (err) {
            res.status(500).json({ "message": err.message });
        } else {
            res.status(200).send('BMR record updated successfully');
        }
    });
});

// DELETE operation - Delete a BMR record
router.delete('/api/bmr/:id', (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM BMR WHERE BMRID = @BMRID;`;
    const request = new sql.Request();
    request.input('BMRID', sql.Int, id);

    request.query(query, (err, result) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).send('BMR record deleted successfully');
        }
    });
});
// Example endpoint for calculating basal metabolic rate
router.post('/api/basal-metabolic-rate/calculate', (req, res) => {
    const { userId, weight, age, gender } = req.body;
    // Insert logic to calculate basal metabolic rate
});

module.exports = router