import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function setupDatabase() {
  const client = await db.connect();
  try {
    await client.query(`BEGIN`);

    //Users table
    await client.query(`
				CREATE TABLE IF NOT EXISTS "USER" (
				user_id SERIAL PRIMARY KEY,
				username VARCHAR(50) UNIQUE NOT NULL,
				email VARCHAR(150) UNIQUE NOT NULL,
				password_hash VARCHAR(50) NOT NULL,
				date_created TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
		)
			`);

    //Channel table
    await client.query(`
				CREATE TABLE IF NOT EXISTS "CHANNEL" (
				channel_id SERIAL PRIMARY KEY,
				channel_name VARCHAR(50) NOT NULL,
				description VARCHAR(250),
				channel_owner_id INT NOT NULL,
				date_created TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

					CONSTRAINT fk_channel_owner
						FOREIGN KEY(channel_owner_id)
						REFERENCES "USER"(user_id)
						ON DELETE RESTRICT -- Förhindrar radering av användare som äger kanaler
		)
	`);

    //Messages table
    await client.query(`
				CREATE TABLE IF NOT EXISTS "MESSAGES" (
				message_id SERIAL PRIMARY KEY,
				content TEXT NOT NULL,
				date_created TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				message_updated TIMESTAMPTZ,
				author_id INT,
				channel_id INT NOT NULL,

					CONSTRAINT fk_author
						FOREIGN KEY(author_id)
						REFERENCES "USER"(user_id)
						ON DELETE SET NULL, -- Om en användare raderas, sätts författaren till NULL (anonymt meddelande)

					CONSTRAINT fk_channel
						FOREIGN KEY(channel_id)
						REFERENCES "CHANNEL"(channel_id)
						ON DELETE CASCADE -- Om kanalen raderas, raderas även dess meddelanden.
		)
		`);

    //Subscription table
    await client.query(`
			CREATE TABLE IF NOT EXISTS "SUBSCRIPTIONS" (
			user_id INT NOT NULL,
			channel_id INT NOT NULL,
			subscription_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (user_id, channel_id), -- Säkerställer att en användare bara kan prenumerera en gång på samma kanal

				CONSTRAINT fk_user_subscription
					FOREIGN KEY(user_id)
					REFERENCES "USER"(user_id)
					ON DELETE CASCADE,-- Om användaren raderas, tas hens prenumerationer bort

				CONSTRAINT fk_channel_subscription
					FOREIGN KEY(channel_id)
					REFERENCES "CHANNEL"(channel_id)
					ON DELETE CASCADE -- Om kanalen raderas, tas prenumerationerna på den bort
		)
		`);

    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_channel_owner_id ON "CHANNEL"(channel_owner_id);`
    );
    await client.query(`CREATE INDEX IF NOT EXISTS idx_messages_author_id ON "MESSAGES"(author_id);
;`);
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON "MESSAGES"(channel_id);`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_subscriptions_channel_id ON "SUBSCRIPTIONS"(channel_id);`
    );

    console.log("Databasen har skapats och tabellerna har lagts till.");
    await client.query(`COMMIT`);
  } catch (error) {
    console.error("Fel vid skapande av databas eller tabeller:", error);
    await client.query(`ROLLBACK`);
  } finally {
    client.release();
  }
}
setupDatabase();
