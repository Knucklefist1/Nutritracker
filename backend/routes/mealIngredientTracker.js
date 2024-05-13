const express = require('express');
const router = express.Router(); // Opretter en router til håndtering af ruteanmodninger
const sql = require('mssql'); // Importerer MSSQL-modul til databaseinteraktion

// Opret en ny post-rute til måltidsingredienssporing
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
    } = req.body; // Udpakker data fra anmodningen
    const query = `INSERT INTO MealIngredientTracker (UserID, Weight, IngredientsID,Mealname, TimeOfMeal, Nutrients, DrinkVolume, DrinkTime, Date,Time)
                     VALUES (@UserID, @Weight, @IngredientsID,@Mealname, @TimeOfMeal, @Nutrients, @DrinkVolume, @DrinkTime, @Date,@Time);`; // SQL-forespørgsel til at indsætte data om måltidsingredienser i databasen
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
            res.status(500).send(err.message); // Sender fejlmeddelelse til klienten ved fejl
        } else {
            res.status(200).json({ success: true }); // Sender en succesmeddelelse til klienten
        }
    });
});

// Læs alle poster for en specifik bruger
router.get('/api/mealIngredientTracker/:userID', (req, res) => {
    const userID = req.params.userID; // Henter bruger-ID fra anmodningen
    const query = `SELECT * from MealIngredientTracker WHERE UserID = @UserID;`; // SQL-forespørgsel til at hente alle måltidsingrediensposter for en bruger
    const request = new sql.Request();
    request.input('UserID', sql.Int, userID);

    request.query(query, (err, result) => {
        if (err) {
            res.status(500).send(err.message); // Sender fejlmeddelelse til klienten ved fejl
        } else {
            res.status(200).json(result.recordset); // Sender data om måltidsingredienser til klienten
        }
    });
});

// Opdater en post for måltidsingredienssporing
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
    } = req.body; // Udpakker data fra anmodningen
    const { id } = req.params; // Henter post-ID fra anmodningen
    const query = `UPDATE MealIngredientTracker SET Weight = @Weight, TimeOfMeal = @TimeOfMeal, Nutrients = @Nutrients, DrinkVolume = @DrinkVolume, DrinkTime = @DrinkTime, Date = @Date, Time = @Time
                     WHERE MealIngredientTrackerID = @MealIngredientTrackerID;`; // SQL-forespørgsel til at opdatere en post for måltidsingredienssporing
    const request = new sql.Request();
    request.input("MealIngredientTrackerID", sql.Int, id);
    request.input("Weight", sql.Decimal(10, 2), Weight);
    request.input("TimeOfMeal", sql.VarChar(8), TimeOfMeal);
    request.input("Nutrients", sql.NVarChar(sql.MAX), JSON.stringify(Nutrients));
    request.input("DrinkVolume", sql.Decimal(10, 2), DrinkVolume);
    request.input("DrinkTime", sql.VarChar(8), DrinkTime);
    request.input("Date", sql.Date, Date);
    request.input("Time", sql.VarChar(255), Time);

    request.query(query, (err, result) => {
        if (err) {
            res.status(500).send(err.message); // Sender fejlmeddelelse til klienten ved fejl
        } else {
            res.status(200).json({ message: "MealIngredientTracker record updated successfully" }); // Sender en succesmeddelelse til klienten
        }
    });
});

// Slet en post
router.delete('/api/mealIngredientTracker/:id', async (req, res) => {
    try {
        new sql.Request()
            .input('MealIngredientTrackerID', sql.Int, req.params.id)
            .query('DELETE FROM MealIngredientTracker WHERE MealIngredientTrackerID = @MealIngredientTrackerID');
        res.send('Delete successful'); // Sender en besked om, at sletning var vellykket
    } catch (error) {
        res.status(500).send(error.message); // Sender fejlmeddelelse til klienten ved fejl
    }
});

module.exports = router; // Eksporterer routerobjektet til brug i andre filer
