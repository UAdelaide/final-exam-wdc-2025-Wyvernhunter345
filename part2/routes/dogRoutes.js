
// GET list of all registered dogs
router.get('/api/dogs', async (req, res) => {
    try {
      const [dogs] = await db.execute("SELECT * FROM Dogs");
      res.json(dogs);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });