const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Endpoint to create a new meal and meal ingredients
router.post('/api/meals', (req, res) => {
    const { userID, name, ingredients } = req.body;
    // Insert meal into Meal table
    const mealQuery = `
        INSERT INTO [dbo].[Meal] (UserID, Mealname)
        OUTPUT inserted.MealID
        VALUES (${userID}, '${name}');
    `;

    // Insert meal ingredients into MealIngredients table
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


// Endpoint to get meal and meal ingredients by meal ID
router.get('/api/meals/:userID/:mealID', (req, res) => {
    const mealID = req.params.mealID;
    const userId = req.params.userID;

    // Query to retrieve meal and meal ingredients
    const query = `
        SELECT Meal.*, MealIngredients.*
        FROM [dbo].[Meal]
        JOIN [dbo].[MealIngredients] ON Meal.MealID = MealIngredients.MealID
        WHERE Meal.MealID = ${mealID} and Meal.UserID = ${userId};
    `;

    // Connect to the database and execute query
    sql.query(query)
        .then(result => {
            if (result.recordset.length > 0) {
                // Group meal ingredients by meal ID
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


// Endpoint to get all meals and meal ingredients by user ID
router.get('/api/meals/:userID', (req, res) => {
    const userId = req.params.userID;
    console.log(userId)
    // Query to retrieve all meals and their ingredients for the given user ID
    const query = `
        SELECT Meal.*, MealIngredients.*
        FROM [dbo].[Meal]
        JOIN [dbo].[MealIngredients] ON Meal.MealID = MealIngredients.MealID
        WHERE Meal.UserID = ${userId};
    `;

    // Connect to the database and execute query
    sql.query(query)
        .then(result => {
            if (result.recordset.length > 0) {
                // Group meals and their ingredients by meal ID
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
                res.json(Object.values(meals)); // Send an array of meal objects
            } else {
                res.status(404).json({ message: 'No meals found for the user ID' });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

// Import the required modules and set up your server

// Define the DELETE endpoint to remove a meal and its ingredients
router.delete('/api/meals/:mealID', (req, res) => {
    const mealID = req.params.mealID;
    console.log({ mealID })
    // Query to delete the meal from the Meal table
    const deleteMealQuery = `
        DELETE FROM [dbo].[Meal]
        WHERE MealID = ${mealID};
    `;

    // Query to delete the associated ingredients from the MealIngredients table
    const deleteIngredientsQuery = `
        DELETE FROM [dbo].[MealIngredients]
        WHERE MealID = ${mealID};
    `;

    // Execute the delete queries
    sql.query(deleteIngredientsQuery)
        .then(() => {
            // After deleting the meal, delete its associated ingredients
            return sql.query(deleteMealQuery);
        })
        .then(() => {
            // Send a success response
            res.json({ message: 'Meal and its ingredients deleted successfully' });
        })
        .catch(err => {
            // If an error occurs, send an error response
            res.status(500).json({ error: err.message });
        });
});

module.exports = router