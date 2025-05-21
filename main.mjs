import express from "express";
// import { notesDb, usersDb } from "./db.js"; // Importera databasen

const app = express();
const port = process.env.PORT || 5432;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
