import { Router } from "express";

export default function channelRoutes(db) {
  const router = Router();

  router.post("/channels", async (req, res) => {
    const { channel_name, description, channel_owner_id } = req.body;

    // Validate input
    if (!channel_name || !channel_owner_id) {
      return res.status(400).json({
        success: false,
        message: "Channel name and owner ID are required",
      });
    }

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
}
