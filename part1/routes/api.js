var express = require('express');
var router = express.Router();

router.get('/dogs', async function (req,res,next) {
    try {
        const [dogs] = await pool.getConnection(function(err, connection) {
            connection.query("", function(err, rows, fields) {
                connection.release();

                res.json(rows);
            });
        });
        return dogs;
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

module.exports = router;
