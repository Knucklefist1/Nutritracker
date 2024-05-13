const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.post("/api/mealIngredientTracker", (req, res) => {
    const {
        userID,
        weight,
        ingredientsID,
        mealName,
        timeOfMeal,
        nutrients,
        drinkVolume,
        drinkTime,
        date,
        time,
    } = req.body;
    const query = `INSERT INTO MealIngredientTracker (UserID, Weight, IngredientsID,Mealname, TimeOfMeal, Nutrients, DrinkVolume, DrinkTime, Date,Time)
                     VALUES (@UserID, @Weight, @IngredientsID,@Mealname, @TimeOfMeal, @Nutrients, @DrinkVolume, @DrinkTime, @Date,@Time);`;
    const request = new sql.Request();
    request.input("UserID", sql.Int, userID);
    request.input("Weight", sql.Decimal(10, 2), weight);
    request.input("IngredientsID", sql.VarChar(255), String(ingredientsID));
    request.input("Mealname", sql.VarChar(255), mealName);
    request.input("TimeOfMeal", sql.VarChar(8), timeOfMeal);
    request.input("Nutrients", sql.NVarChar(sql.MAX), JSON.stringify(nutrients));
    request.input("DrinkVolume", sql.Decimal(10, 2), drinkVolume);
    request.input("DrinkTime", sql.VarChar(8), drinkTime);
    request.input("Date", sql.Date, date);
    request.input("Time", sql.VarChar(255), time);

    request.query(query, (err, result) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).json({ success: true });
        }
    });
});

// READ operation - Get all records for a specific user
router.get('/api/mealIngredientTracker/:userID', (req, res) => {
    const userID = req.params.userID;
    const query = `SELECT * from MealIngredientTracker WHERE UserID = @UserID;`;
    // const query = `SELECT Ingredients.Name, MealIngredientTracker.* from Ingredients JOIN MealIngredientTracker ON Ingredients.IngredientsID = MealIngredientTracker.IngredientsID WHERE UserID = @UserID;`;
    const request = new sql.Request();
    request.input('UserID', sql.Int, userID);

    request.query(query, (err, result) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).json(result.recordset);
        }
    });
});

// UPDATE operation - Update a MealIngredientTracker record
router.put("/api/mealIngredientTracker/:id", (req, res) => {
    const {
        UserID,
        Weight,
        IngredientsID,
        Mealname,
        TimeOfMeal,
        Nutrients,
        DrinkVolume,
        DrinkTime,
        Date,
        Time,
    } = req.body;
    const { id } = req.params;
    const query = `UPDATE MealIngredientTracker SET Weight = @Weight, TimeOfMeal = @TimeOfMeal, Nutrients = @Nutrients, DrinkVolume = @DrinkVolume, DrinkTime = @DrinkTime, Date = @Date, Time = @Time
                     WHERE MealIngredientTrackerID = @MealIngredientTrackerID;`;
    const request = new sql.Request();
    request.input("MealIngredientTrackerID", sql.Int, id);
    // request.input('UserID', sql.Int, userID);
    request.input("Weight", sql.Decimal(10, 2), Weight);
    // request.input('IngredientsID', sql.VarChar(255), String(ingredientsID));
    // request.input('Mealname', sql.VarChar(255), mealName);
    request.input("TimeOfMeal", sql.VarChar(8), TimeOfMeal);
    request.input("Nutrients", sql.NVarChar(sql.MAX), JSON.stringify(Nutrients));
    request.input("DrinkVolume", sql.Decimal(10, 2), DrinkVolume);
    request.input("DrinkTime", sql.VarChar(8), DrinkTime);
    request.input("Date", sql.Date, Date);
    request.input("Time", sql.VarChar(255), Time);

    request.query(query, (err, result) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res
                .status(200)
                .json({ message: "MealIngredientTracker record updated successfully" });
        }
    });
});

// DELETE: Delete a record
router.delete('/api/mealIngredientTracker/:id', async (req, res) => {
    try {
        new sql.Request()
            .input('MealIngredientTrackerID', sql.Int, req.params.id)
            .query('DELETE FROM MealIngredientTracker WHERE MealIngredientTrackerID = @MealIngredientTrackerID');
        res.send('Delete successful');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router