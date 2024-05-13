const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Opretter et endpoint for at tilføje data til MealTracker-tabellen
router.post('/api/mealtracker', (req, res) => {
    // Udpakker data fra request body
    const { userID, mealID, weight, timeOfMeal, nutrients, drinkVolume, drinkTime, time, date } = req.body;
    // SQL-forespørgsel til at indsætte data
    const query = `
        INSERT INTO MealTracker (UserID, MealID, Weight, TimeOfMeal, Nutrients, DrinkVolume, DrinkTime, Time, Date)
        VALUES (@userID, @mealID, @weight, @timeOfMeal, @nutrients, @drinkVolume, @drinkTime, @time, @date);
    `;

    // Opretter en ny SQL-forespørgsel
    const request = new sql.Request();
    // Tilføjer parametre til SQL-forespørgslen
    request.input('UserID', sql.Int, userID);
    request.input('MealID', sql.VarChar(255), mealID);
    request.input('Weight', sql.Decimal(10, 2), weight);
    request.input('TimeOfMeal', sql.VarChar(8), timeOfMeal);
    request.input('Nutrients', sql.NVarChar(sql.MAX), JSON.stringify(nutrients));
    request.input('DrinkVolume', sql.Decimal(10, 2), drinkVolume);
    request.input('DrinkTime', sql.VarChar(8), drinkTime);
    request.input('Time', sql.VarChar(8), time);
    request.input('Date', sql.Date, date);

    // Udfører SQL-forespørgslen og håndterer resultater
    request.query(query)
        .then(result => {
            res.json({ message: 'Meal Tracker record created successfully.' });
        })
        .catch(error => {
            res.status(500).json({ error: error.message });
        });
});

// Opdaterer en eksisterende Meal Tracker-post
router.put('/api/mealtracker/:mealTrackerID', (req, res) => {
    const mealTrackerID = req.params.mealTrackerID;
    const { userID, mealID, mealName, weight, TimeOfMeal, nutrients, drinkVolume, drinkTime, time, date } = req.body;
    console.log({ mealTrackerID }, { TimeOfMeal }) // Logger til konsollen for fejlsøgning
    // SQL-forespørgsel til at opdatere en post
    const query = `
        UPDATE MealTracker 
        SET UserID = @UserID, Weight = @Weight, TimeOfMeal = @TimeOfMeal, Nutrients = @Nutrients, 
            DrinkVolume = @DrinkVolume, DrinkTime = @DrinkTime, Time = @Time, Date = @Date
        WHERE MealTrackerID = @mealTrackerID;
    `;

    // Ny forespørgsel for SQL-operation
    const request = new sql.Request();
    // Tilføjer parametre til SQL-forespørgslen
    request.input('UserID', sql.Int, userID);
    // request.input('MealName', sql.VarChar(255), mealName); // denne linje er udkommenteret, da den ikke bruges i forespørgslen
    request.input('Weight', sql.Decimal(10, 2), weight);
    request.input('TimeOfMeal', sql.VarChar(8), TimeOfMeal);
    request.input('Nutrients', sql.NVarChar(sql.MAX), nutrients);
    request.input('DrinkVolume', sql.Decimal(10, 2), drinkVolume);
    request.input('DrinkTime', sql.VarChar(8), drinkTime);
    request.input('Time', sql.VarChar(8), time);
    request.input('Date', sql.Date, date);
    request.input('mealTrackerID', sql.Int, mealTrackerID);

    // Udfører forespørgslen og håndterer svar
    request.query(query)
        .then(result => {
            if (result.rowsAffected[0] > 0) {
                const query = `
                UPDATE [dbo].[Meal]
                SET Mealname = '${mealName}' WHERE MealID = ${mealID} 
            `;
                // Opdaterer yderligere data i en anden tabel hvis den primære opdatering lykkes
                sql.query(query)
                    .then(result => {
                        res.status(201).send({ message: 'Meal and Meal Tracker updated successfully' })
                        return;
                    })
                    .catch(err => res.status(500).json({ error: err.message }));

                return;
            } else {
                res.status(404).json({ message: 'Meal Tracker record not found.' });
            }
        })
        .catch(error => {
            res.status(500).json({ error: error.message });
        });
});

router.get('/api/mealtracker/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = `
        SELECT Meal.*, MealTracker.* FROM [dbo].[Meal] JOIN [dbo].[MealTracker] ON Meal.MealID = MealTracker.MealID WHERE MealTracker.UserID = ${userId} order By MealTracker.Date Desc ;
    `;

    sql.query(query)
        .then(result => {
            if (result.recordset.length > 0) {
                const mealTrackerData = result.recordset.map(row => ({
                    mealTrackerID: row.MealTrackerID,
                    userID: row.UserID[0],
                    mealID: row.MealID[0],
                    mealName: row.Mealname,
                    weight: row.Weight,
                    TimeOfMeal: row.TimeOfMeal,
                    drinkVolume: row.DrinkVolume,
                    drinkTime: row.DrinkTime,
                    time: row.Time,
                    date: row.Date,
                    nutrients: JSON.parse(row.Nutrients),
                }))
                res.json(mealTrackerData);
            } else {
                res.status(404).json({ message: 'Meal Tracker record not found.' });
            }
        })
        .catch(error => {
            res.status(500).json({ error: error.message });
        });
});

router.get('/api/mealtracker/:userID/:mealTrackerID', (req, res) => {
    const mealTrackerID = req.params.mealTrackerID;
    const userId = req.params.userID;

    const query = `
        SELECT * FROM MealTracker WHERE MealTrackerID = @mealTrackerID and UserId = @userId;
    `;

    const request = new sql.Request();
    request.input('mealTrackerID', sql.Int, mealTrackerID);
    request.input('UserId', sql.Int, userId);

    request.query(query)
        .then(result => {
            if (result.recordset.length > 0) {
                res.json(result.recordset[0]);
            } else {
                res.status(404).json({ message: 'Meal Tracker record not found.' });
            }
        })
        .catch(error => {
            res.status(500).json({ error: error.message });
        });
});


router.put('/api/mealtracker/:mealTrackerID', (req, res) => {
    const mealTrackerID = req.params.mealTrackerID;
    // const { UserID, MealName, Weight, TimeOfMeal, Nutrients, DrinkVolume, DrinkTime, Time, Date } = req.body;
    const { userID, mealID, weight, timeOfMeal, nutrients, drinkVolume, drinkTime, time, date } = req.body;

    const query = `
        UPDATE MealTracker 
        SET UserID = @UserID, MealID = @mealID, Weight = @Weight, TimeOfMeal = @TimeOfMeal, Nutrients = @Nutrients, 
            DrinkVolume = @DrinkVolume, DrinkTime = @DrinkTime, Time = @Time, Date = @Date
        WHERE MealTrackerID = @mealTrackerID;
    `;

    const request = new sql.Request();
    request.input('UserID', sql.Int, userID);
    request.input('MealID', sql.Int, mealID);
    request.input('Weight', sql.Decimal(10, 2), weight);
    request.input('TimeOfMeal', sql.DateTime, timeOfMeal);
    request.input('Nutrients', sql.NVarChar(sql.MAX), nutrients);
    request.input('DrinkVolume', sql.Decimal(10, 2), drinkVolume);
    request.input('DrinkTime', sql.DateTime, drinkTime);
    request.input('Time', sql.VarChar(8), time);
    request.input('Date', sql.Date, date);
    request.input('mealTrackerID', sql.Int, mealTrackerID);

    request.query(query)
        .then(result => {
            if (result.rowsAffected[0] > 0) {
                res.json({ message: 'Meal Tracker record updated successfully.' });
            } else {
                res.status(404).json({ message: 'Meal Tracker record not found.' });
            }
        })
        .catch(error => {
            res.status(500).json({ error: error.message });
        });
});


router.delete('/api/mealtracker/:mealTrackerID', (req, res) => {
    const mealTrackerID = req.params.mealTrackerID;

    const query = `
        DELETE FROM MealTracker WHERE MealTrackerID = @mealTrackerID;
    `;

    const request = new sql.Request();
    request.input('mealTrackerID', sql.Int, mealTrackerID);

    request.query(query)
        .then(result => {
            if (result.rowsAffected[0] > 0) {
                res.json({ message: 'Meal Tracker record deleted successfully.' });
            } else {
                res.status(404).json({ message: 'Meal Tracker record not found.' });
            }
        })
        .catch(error => {
            res.status(500).json({ error: error.message });
        });
});
router.get('/api/Ingredients', (req, res) => {
    const query = `SELECT * FROM Ingredients`;
    const request = new sql.Request();
    request.query(query, (err, result) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).json(result.recordset);
        }
    });
});
module.exports = router;
