// Noter til Express-ruter til håndtering af brugeroperationer

// Opret bruger
router.post('/api/users', (req, res) => {
    // Modtager brugeroplysninger fra anmodningen
    const { username, password, email, weight, age, sex } = req.body;
    // Forkort køn til et enkelt tegn
    const truncatedSex = sex.charAt(0).toLowerCase(); // Antager at 'sex' er 'male' eller 'female'

    // SQL-forespørgsel til at indsætte en ny bruger i databasen
    const query = `
        INSERT INTO [dbo].[User] (Username, Password, Email, Weight, Age, Sex)
        VALUES ('${username}', '${password}', '${email}', ${weight}, ${age}, '${truncatedSex}');
        SELECT SCOPE_IDENTITY() AS UserID; -- Returnerer ID'et for den nyoprettede bruger
    `;
    // Udfører SQL-forespørgslen
    sql.query(query)
        .then(result => {
            const userId = result.recordset[0].UserID; // Udtrækker ID'et for den nyoprettede bruger
            res.json({ userId }); // Returnerer ID'et i svaret
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

// Læs bruger
router.get('/api/users/:userId', (req, res) => {
    // Modtager brugerens ID fra anmodningen
    const userId = req.params.userId;
    // SQL-forespørgsel til at hente en bruger fra databasen baseret på ID
    const query = `SELECT * FROM [dbo].[User] WHERE UserID = ${userId}`;
    // Udfører SQL-forespørgslen
    sql.query(query)
        .then(result => {
            // Hvis en bruger blev fundet, returneres brugeroplysningerne
            if (result.recordset.length > 0) {
                res.json(result.recordset[0]);
            } else {
                // Hvis ingen bruger blev fundet med det angivne ID, returneres en fejlmeddelelse
                res.status(404).json({ message: 'Bruger blev ikke fundet' });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

// Log ind bruger
router.post('/api/login', (req, res) => {
    // Modtager brugerens email og adgangskode fra anmodningen
    const { email, password } = req.body;
    // SQL-forespørgsel til at kontrollere, om en bruger med den givne email og adgangskode findes
    const query = `
        SELECT UserID FROM [dbo].[User] WHERE Email = '${email}' AND Password = '${password}'
    `;
    // Udfører SQL-forespørgslen
    sql.query(query)
        .then(result => {
            // Hvis en bruger blev fundet, returneres succes og brugerens ID
            if (result.recordset.length > 0) {
                const userId = result.recordset[0].UserID;
                res.json({ success: true, userId });
            } else {
                // Hvis ingen bruger blev fundet med de angivne legitimationsoplysninger, returneres en fejlmeddelelse
                res.status(401).json({ success: false, message: 'Ugyldig email eller adgangskode' });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

// Opdater bruger
router.put('/api/users/:userId', (req, res) => {
    // Modtager brugerens ID og opdaterede oplysninger fra anmodningen
    const userId = req.params.userId;
    const { username, password, email, weight, age, sex } = req.body;
    // Forkort køn til et enkelt tegn
    const truncatedSex = sex.charAt(0).toLowerCase(); // Antager at 'sex' er 'male' eller 'female'
    // SQL-forespørgsel til at opdatere brugeroplysninger i databasen
    const query = `
        UPDATE [dbo].[User]
        SET Username = '${username}', Password = '${password}', Email = '${email}', Weight = ${weight}, Age = ${age}, Sex = '${truncatedSex}'
        WHERE UserID = ${userId}
    `;
    // Udfører SQL-forespørgslen
    sql.query(query)
        .then(result => res.json({ message: 'Bruger opdateret med succes' }))
        .catch(err => res.status(500).json({ error: err.message }));
});

// Slet bruger
router.delete('/api/users/:userId', (req, res) => {
    // Modtager brugerens ID fra anmodningen
    const userId = req.params.userId;
    // SQL-forespørgsel til at slette en bruger fra databasen baseret på ID
    const query = `DELETE FROM [dbo].[User] WHERE UserID = ${userId}`;
    // Udfører SQL-forespørgslen
    sql.query(query)
        .then(result => res.json({ message: 'Bruger slettet med succes' }))
        .catch(err => res.status(500).json({ error: err.message }));
});

// Eksporterer routeren
module.exports = router;
