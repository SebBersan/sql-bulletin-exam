import { Router } from "express";
import { channelSchema } from "../validations/userSchema.js";

export default function channelsRoutes(db) {
  const router = Router();

  router.post("/", async (req, res) => {
    console.log("Channels route is being hit");
    const { error, value } = channelSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { channel_name, description, channel_owner_id } = value;

    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const channelRes = await client.query(
        `INSERT INTO "CHANNEL" (channel_name, description, channel_owner_id) VALUES ($1, $2, $3) RETURNING *`,
        [channel_name, description, channel_owner_id]
      );

      await client.query("COMMIT");

      res.status(201).json({
        success: true,
        message: "Channel created successfully",
        channel: channelRes.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error creating channel: ", error);
      res.status(500).json({
        success: false,
        message: "Error creating channel",
        error: error.message,
      });
    } finally {
      client.release();
    }
  });

  router.get("/:id/messages", async (req, res) => {
    const userId = parseInt(req.params.id);

    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const client = await db.connect();
    try {
      const result = await client.query(
        `
		SELECT m.message_id, m.content, m.date_created, u.username
		FROM "MESSAGES" m
		JOIN "USER" u ON m.user_id = u.user_id
		WHERE m.user_id = $1
		ORDER BY m.date_created ASC	

	  `,
        [userId]
      );

      res.status(200).json({
        success: true,
        channels: result.rows,
      });
    } catch (error) {
      console.error("Error fetching user messages:", error);
      res.status(500).json({
        success: false,
        message: "Could not retrieve messages",
        error: error.message,
      });
    } finally {
      client.release();
    }
  });

  return router;
}
