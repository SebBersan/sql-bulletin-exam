import { Router } from "express";
// import bcrypt from "bcryptjs";
import { userSchema } from "../validations/userSchema.js";

export default function usersRoutes(db) {
  const router = Router();

  router.post("/users", async (req, res) => {
    const { error, value } = userSchema.validate(req.body);

    // Validate input
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { username, email, password } = value;

    const client = await db.connect();
    try {
      // Check if the user already exists
      const existingUser = await client.query(
        `SELECT * FROM "USER" WHERE username = $1 OR email = $2`,
        [username, email]
      );
      if (existingUser.rows.length > 0) {
        if (existingUser.rows[0].username === username) {
          return res.status(400).json({
            success: false,
            message: "Username already taken",
          });
        } else if (existingUser.rows[0].email === email) {
          return res.status(400).json({
            success: false,
            message: "Email already registered",
          });
        }
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
