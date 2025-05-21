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
  return router;
}
