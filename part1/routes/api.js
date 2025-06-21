var express = require('express');
var router = express.Router();

router.get('/dogs', async function (req,res,next) {
    try {
        const [dogs] = await req.pool.execute('SELECT DISTINCT name, size, Users.username AS owner_username FROM Dogs INNER JOIN Users ON Dogs.owner_id = Users.user_id');
        res.json(dogs);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch dogs: ' + e });
    }
});

router.get('/walkrequests/open', async function (req,res,next) {
    try {
        const [requests] = await req.pool.execute(`SELECT request_id, Dogs.name AS dog_name, requested_time, duration_minutes, location, Users.username AS owner_username
            FROM WalkRequests
            INNER JOIN Dogs
            ON WalkRequests.dog_id = Dogs.dog_id
            INNER JOIN Users
            ON Dogs.owner_id = Users.user_id
            WHERE status = "open"`);
        res.json(requests);
    }
    catch (e)
    {
        res.status(500).json({ error: 'Failed to fetch walk requests: ' + e });
    }
});

router.get('/walkers/summary', async function (req,res,next) {
    try {
        const [walkers] = await req.pool.execute(`SELECT username AS walker_username, COUNT(WalkRatings.rating) AS total_ratings, AVG(WalkRatings.rating) AS average_rating, COUNT(WalkApplications.walker_id) AS completed_walks
            FROM Users
            INNER JOIN WalkRatings
            ON Users.user_id = WalkRatings.walker_id
            INNER JOIN WalkRequests
            ON Users.user_id = WalkRequests.walker_id
            WHERE role = "walker" AND WalkRequests.status = "completed"
            GROUP BY Username`);
        req.json(walkers);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch walkers: ' + e });
    }
});

module.exports = router;
