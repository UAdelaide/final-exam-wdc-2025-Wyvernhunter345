var express = require('express');
var router = express.Router();

router.get('/dogs', async function (req,res,next) {
    try {
        const [dogs] = await req.pool.execute('SELECT DISTINCT name, size, Users.username AS owner_username FROM Dogs INNER JOIN Users ON Dogs.owner_id = Users.user_id');
        res.json(dogs);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch dogs' });
    }
});

router.get('/walkrequests/open', function (req,res,next) {
    try {
        const [requests] = await req.pool.execute('SELECT ')
    }
})

module.exports = router;
