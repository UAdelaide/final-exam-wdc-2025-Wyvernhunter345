var express = require('express');
var router = express.Router();

router.get('/dogs', async function (req,res,next) {
    try {
        const [dogs] = await pool.query('SELECT dog_name, size FROM Dogs');
        return dogs;
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch dogs' });
    }
});

module.exports = router;
