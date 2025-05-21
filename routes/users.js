import { Router } from "express";
// import bcrypt from "bcryptjs";

export default function usersRoutes(db) {
  const router = Router();

  router.post("/users", async (req, res) => {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const client = await db.connect();
    try {
      // Check if the user already exists
      const existingUser = await client.query(
        `SELECT * FROM "USER" WHERE username = $1 OR email = $2`,
        [username, email]
      );
      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      //   const passwordHash = await bcrypt.hash(password, 10);

      await client.query("BEGIN");

      const userRes = await client.query(
        `INSERT INTO "USER" (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *`,
        [username, email, password]
      );

      await client.query("COMMIT");

      res.status(201).json({
        success: true,
        message: "User created successfully",
        user: userRes.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error creating user: ", error);
      res.status(500).json({
        success: false,
        message: "Error creating user",
        error: error.message,
      });
    } finally {
      client.release();
    }
  });
  return router;
}
