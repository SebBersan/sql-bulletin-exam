import { Router } from "express";
import { subscriptionSchema } from "../validations/userSchema.js";

export default function subscriptionsRoutes(db) {
  const router = Router();

  router.post("/", async (req, res) => {
    // Validate input
    const { error, value } = subscriptionSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { user_id, channel_id } = value;

    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const subscriptionRes = await client.query(
        `INSERT INTO "SUBSCRIPTIONS" (user_id, channel_id) VALUES ($1, $2) RETURNING *`,
        [user_id, channel_id]
      );

      await client.query("COMMIT");

      res.status(201).json({
        success: true,
        message: "Subscription created successfully",
        subscription: subscriptionRes.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error creating subscription: ", error);
      res.status(500).json({
        success: false,
        message: "Error creating subscription",
        error: error.message,
      });
    } finally {
      client.release();
    }
  });
}
