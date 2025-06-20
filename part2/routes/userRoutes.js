const express = require("express");
const router = express.Router();
const db = require("../models/db");

// GET all users (for admin/testing)
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT user_id, username, email, role FROM Users"
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// POST a new user (simple signup)
router.post("/register", async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        const [result] = await db.query(
            `
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `,
            [username, email, password, role]
        );

        res.status(201).json({
            message: "User registered",
            user_id: result.insertId,
        });
    } catch (error) {
        res.status(500).json({ error: "Registration failed" });
    }
});

router.get("/me", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not logged in" });
    }
    res.json(req.session.user);
});

// POST login (dummy version)
router.post("/login", async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const [rows] = await db.query(
            `
      SELECT user_id, username, role FROM Users
      WHERE username = ? AND password_hash = ?
    `,
            [username, password]
        );

        if (rows.length === 0) {
            res.redirect("/");
        }

        // Regen session just in case
        req.session.regenerate(function (err) {
            if (err) next(err);

            // Store user information in session
            req.session.user = rows[0].user_id;

            // Save the session before redirection to ensure page load does not happen before session is saved
            req.session.save(function (e) {
                if (e) return next(e);

                // Redirect based on their role
                if (rows[0].role === "owner") {
                    res.redirect("/owner-dashboard.html");
                } else if (rows[0].role === "walker") {
                    res.redirect("/walker-dashboard.html");
                } else {
                    res.json(rows);
                }
            });
        });
    } catch (error) {
        res.status(500).json({ error: "Login failed " + error });
    }
});

router.get("/logout", async (req, res, next) => {
    // Remove the user's session and cookies and signs them out
    req.session.user = null;
    req.cookies = null;
    res.redirect("/");
});

module.exports = router;
