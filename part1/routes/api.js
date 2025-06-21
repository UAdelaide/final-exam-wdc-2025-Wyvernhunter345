var express = require('express');
var router = express.Router();

router.get('/dogs', async function (req,res,next) {
    try {
        const [dogs] = await req.pool.execute('SELECT DISTINCT name, size, owner_username AS o FROM Dogs INNER JOIN Users ON Dogs.owner_id=');
        res.json(dogs);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch dogs' });
    }
});

module.exports = router;
