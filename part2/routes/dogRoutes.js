const express = require("express");
const router = express.Router();
const db = require("../models/db");

// GET list of all registered dogs
router.get("/", async (req, res) => {
    try {
        const [dogs] = await db.execute("SELECT DISTINCT * FROM Dogs");
        res.json(dogs);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

module.exports = router;
