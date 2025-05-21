import express from "express";
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

// Här kommer vi importera våra router
import usersRoutes from "./routes/users.js";
import channelsRoutes from "./routes/channels.js";
import subscriptionsRoutes from "./routes/subscriptions.js";
import messagesRoutes from "./routes/messages.js";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

(async () => {
  try {
    await db.connect();
    console.log("Ansluten till db");
  } catch (error) {
    console.error("Fel med anslutningen till db: ", error);
  }
})();

// Koppla våra routes
console.log("Setting up routes for /users");
app.use("/users", usersRoutes(db));
console.log("Setting up routes for /channels");
app.use("/channels", channelsRoutes(db));
console.log("Setting up routes for /subscriptions");
app.use("/subscriptions", subscriptionsRoutes(db));
console.log("Setting up routes for /messages");
app.use("/messages", messagesRoutes(db));

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
