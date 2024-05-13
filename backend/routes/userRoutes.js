const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Example route: Create User
router.post('/api/users', (req, res) => {
    const { username, password, email, weight, age, sex } = req.body;
    // Truncate sex to a single character
    const truncatedSex = sex.charAt(0).toLowerCase(); // Assuming 'sex' is 'male' or 'female'

    const query = `
        INSERT INTO [dbo].[User] (Username, Password, Email, Weight, Age, Sex)
        VALUES ('${username}', '${password}', '${email}', ${weight}, ${age}, '${truncatedSex}');
        SELECT SCOPE_IDENTITY() AS UserID; -- Return the ID of the newly inserted user
    `;
    sql.query(query)
        .then(result => {
            const userId = result.recordset[0].UserID; // Extract the ID of the newly inserted user
            res.json({ userId }); // Return the ID in the response
        })
        .catch(err => res.status(500).json({ error: err.message }));
});


// Read User
router.get('/api/users/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = `SELECT * FROM [dbo].[User] WHERE UserID = ${userId}`;
    sql.query(query)
        .then(result => {
            if (result.recordset.length > 0) {
                res.json(result.recordset[0]);
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

// Login User
router.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const query = `
        SELECT UserID FROM [dbo].[User] WHERE Email = '${email}' AND Password = '${password}'
    `;
    sql.query(query)
        .then(result => {
            if (result.recordset.length > 0) {
                const userId = result.recordset[0].UserID;
                res.json({ success: true, userId });
            } else {
                res.status(401).json({ success: false, message: 'Invalid email or password' });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
});



// Update User
router.put('/api/users/:userId', (req, res) => {
    const userId = req.params.userId;
    const { username, password, email, weight, age, sex } = req.body;
    // Truncate sex to a single character
    const truncatedSex = sex.charAt(0).toLowerCase(); // Assuming 'sex' is 'male' or 'female'
    const query = `
        UPDATE [dbo].[User]
        SET Username = '${username}', Password = '${password}', Email = '${email}', Weight = ${weight}, Age = ${age}, Sex = '${truncatedSex}'
        WHERE UserID = ${userId}
    `;
    sql.query(query)
        .then(result => res.json({ message: 'User updated successfully' }))
        .catch(err => res.status(500).json({ error: err.message }));
});


// Delete User
router.delete('/api/users/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = `DELETE FROM [dbo].[User] WHERE UserID = ${userId}`;
    sql.query(query)
        .then(result => res.json({ message: 'User deleted successfully' }))
        .catch(err => res.status(500).json({ error: err.message }));
});

// Export the router
module.exports = router;

