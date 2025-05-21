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

  router.get("/:id/channels", async (req, res) => {
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
		SELECT c.channel_id, c.channel_name, c.description, c.date_created
		FROM "SUBSCRIPTIONS" s
		JOIN "CHANNEL" c ON s.channel_id = c.channel_id
		WHERE s.user_id = $1
	  `,
        [userId]
      );

      res.status(200).json({
        success: true,
        channels: result.rows,
      });
    } catch (error) {
      console.error("Error fetching user channels:", error);
      res.status(500).json({
        success: false,
        message: "Could not retrieve channels",
        error: error.message,
      });
    } finally {
      client.release();
    }
  });

  return router;
}
