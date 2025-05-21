import { Router } from "express";
import { messageSchema } from "../validations/userSchema.js";

export default function messagesRoutes(db) {
  const router = Router();

  router.post("/", async (req, res) => {
    // Validate input
    const { error, value } = messageSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { user_id, channel_id, content } = value;

    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const messageRes = await client.query(
        `INSERT INTO "MESSAGES" (user_id, channel_id, content) VALUES ($1, $2, $3) RETURNING *`,
        [user_id, channel_id, content]
      );

      await client.query("COMMIT");

      res.status(201).json({
        success: true,
        message: "Message created successfully",
        message: messageRes.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error creating message: ", error);
      res.status(500).json({
        success: false,
        message: "Error creating message",
        error: error.message,
      });
    } finally {
      client.release();
    }
  });
}
