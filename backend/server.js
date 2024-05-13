const express = require('express');
const sql = require('mssql');
const dbConfig = require('./DB/dbconfig');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes'); 
const mealRoutes = require('./routes/mealRoutes'); 
const activityRoutes = require('./routes/activityRoutes'); 
const mealTrackerRoutes = require('./routes/mealTrackerRoutes');
const bmrRoutes = require('./routes/bmrRoutes');
const mealIngredientTracker = require('./routes/mealIngredientTracker');
const dailyNutriRoutes = require('./routes/dailyNutriRoutes');

const app = express();

app.use(bodyParser.json());
app.use(cors({origin: "*"}));
app.use('/', userRoutes);
app.use('/', mealRoutes);
app.use('/', activityRoutes);
app.use('/', mealTrackerRoutes);
app.use('/', bmrRoutes)
app.use('/', mealIngredientTracker)
app.use('/', dailyNutriRoutes)

app.get('/api', (req, res) => {
    res.status(200).send("API is working");
});

// Connect to database
sql.connect(dbConfig)
    .then(() => {
        console.log('Database connected');
        // Start listening for requests only after the database connection is successful
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(err => {
        console.error('Database connection failed: ', err);
        // Handle failure more gracefully, potentially retrying or exiting
    });
