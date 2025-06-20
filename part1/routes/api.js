var express = require('express');
var router = express.Router();

router.get('/dogs', function (req,res,next) {
    try {
        await dbConnectionPool.execute(`SELECT dog_name, size FROM Dogs`);
    } catch (e) {

    }
});

module.exports = router;
