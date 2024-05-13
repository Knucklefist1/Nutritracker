const express = require('express');
const router = express.Router(); // Opretter en router til håndtering af ruteanmodninger
const sql = require('mssql'); // Importerer MSSQL-modul til databaseinteraktion

// Slutpunkt til oprettelse af et nyt måltid og måltidsingredienser
router.post('/api/meals', (req, res) => {
    const { userID, name, ingredients } = req.body; // Udpakker data fra anmodningen

    // Indsæt måltid i Meal-tabel
    const mealQuery = `
        INSERT INTO [dbo].[Meal] (UserID, Mealname)
        OUTPUT inserted.MealID
        VALUES (${userID}, '${name}');
    `;

    // Indsæt måltidsingredienser i MealIngredients-tabel
    const insertIngredientsQuery = (mealID) => {
        const ingredientQueries = ingredients.map(ingredient => {
            return `
                INSERT INTO [dbo].[MealIngredients] (MealID, FoodName, Nutrients, IngredientsAmount)
                VALUES (${mealID}, '${ingredient.foodName}', '${JSON.stringify(ingredient.nutrients)}', '${ingredient.amount}');
            `;
        });
        return Promise.all(ingredientQueries.map(query => sql.query(query)));
    };

    sql.query(mealQuery)
        .then(result => {
            const mealID = result.recordset[0].MealID;
            return insertIngredientsQuery(mealID);
        })
        .then(() => {
            res.json({ message: 'Meal and meal ingredients created successfully' });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

// Slutpunkt til at hente måltid og måltidsingredienser efter måltids-ID
router.get('/api/meals/:userID/:mealID', (req, res) => {
    const mealID = req.params.mealID;
    const userId = req.params.userID;

    // Forespørgsel for at hente måltid og måltidsingredienser
    const query = `
        SELECT Meal.*, MealIngredients.*
        FROM [dbo].[Meal]
        JOIN [dbo].[MealIngredients] ON Meal.MealID = MealIngredients.MealID
        WHERE Meal.MealID = ${mealID} and Meal.UserID = ${userId};
    `;

    // Forbind til databasen og udfør forespørgslen
    sql.query(query)
        .then(result => {
            if (result.recordset.length > 0) {
                // Grupper måltidsingredienser efter måltids-ID
                const mealData = {
                    mealID: result.recordset[0].MealID,
                    userID: result.recordset[0].UserID,
                    mealName: result.recordset[0].Mealname,
                    mealAmount: result.recordset[0].MealAmount,
                    ingredients: result.recordset.map(row => ({
                        foodName: row.FoodName,
                        nutrients: JSON.parse(row.Nutrients),
                        amount: row.IngredientsAmount
                    }))
                };
                res.json(mealData);
            } else {
                res.status(404).json({ message: 'Meal not found' });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

// Slutpunkt til at hente alle måltider og måltidsingredienser efter bruger-ID
router.get('/api/meals/:userID', (req, res) => {
    const userId = req.params.userID;

    // Forespørgsel for at hente alle måltider og deres ingredienser for den angivne bruger-ID
    const query = `
        SELECT Meal.*, MealIngredients.*
        FROM [dbo].[Meal]
        JOIN [dbo].[MealIngredients] ON Meal.MealID = MealIngredients.MealID
        WHERE Meal.UserID = ${userId};
    `;

    // Forbind til databasen og udfør forespørgslen
    sql.query(query)
        .then(result => {
            if (result.recordset.length > 0) {
                // Gruppér måltider og deres ingredienser efter måltids-ID
                const meals = {};
                result.recordset.forEach(row => {
                    if (!meals[row.MealID]) {
                        meals[row.MealID] = {
                            mealID: row.MealID[0],
                            userID: row.UserID,
                            mealName: row.Mealname,
                            mealAmount: row.MealAmount,
                            ingredients: []
                        };
                    }
                    meals[row.MealID].ingredients.push({
                        foodName: row.FoodName,
                        nutrients: JSON.parse(row.Nutrients),
                        amount: row.IngredientsAmount
                    });
                });
                res.json(Object.values(meals)); // Send et array af måltidsobjekter
            } else {
                res.status(404).json({ message: 'No meals found for the user ID' });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

// Definér slutpunktet til at slette et måltid og dets ingredienser
router.delete('/api/meals/:mealID', (req, res) => {
    const mealID = req.params.mealID;

    // Forespørgsel for at slette måltidet fra Meal-tabellen
    const deleteMealQuery = `
        DELETE FROM [dbo].[Meal]
        WHERE MealID = ${mealID};
    `;

    // Forespørgsel for at slette de tilknyttede ingredienser fra MealIngredients-tabellen
    const deleteIngredientsQuery = `
        DELETE FROM [dbo].[MealIngredients]
        WHERE MealID = ${mealID};
    `;

    // Udfør sletningsforespørgslerne
    sql.query(deleteIngredientsQuery)
        .then(() => {
            // Efter sletning af måltidet, slet dets tilknyttede ingredienser
            return sql.query(deleteMealQuery);
        })
        .then(() => {
            // Send en succesbesked
            res.json({ message: 'Meal and its ingredients deleted successfully' });
        })
        .catch(err => {
            // Hvis der opstår en fejl, send en fejlbesked
            res.status(500).json({ error: err.message });
        });
});

module.exports = router; // Eksporterer routerobjektet til brug i andre filer
