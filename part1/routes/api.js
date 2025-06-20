var express = require('express');
var router = express.Router();

router.get('/dogs', async function (req,res,next) {
    try {
        const await dbConnectionPool.execute(`SELECT dog_name, size FROM Dogs`);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

module.exports = router;
