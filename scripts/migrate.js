import { Client } from "pg";
import "dotenv/config";

async function migrate() {
    const client = new Client({
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
    });

    try {
        await client.connect();

        await client.query("BEGIN");

        await client.query(`
            CREATE TABLE IF NOT EXISTS post (
                post_id VARCHAR PRIMARY KEY,
                img_url VARCHAR NOT NULL,
                score INT NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW());
            `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS game (
                id UUID PRIMARY KEY,
                post_id_1 VARCHAR REFERENCES post(post_id) ON DELETE CASCADE,
                post_id_2 VARCHAR REFERENCES post(post_id) ON DELETE CASCADE,
                round INT NOT NULL DEFAULT 1,
                time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);
            `);

        await client.query(`
            CREATE OR REPLACE FUNCTION delete_old_games_on_insert()
            RETURNS TRIGGER AS $$
            BEGIN
                DELETE FROM game WHERE NOW() - time >= INTERVAL '1 day';
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;`);

        await client.query(`
            DROP TRIGGER IF EXISTS trigger_delete_old_games ON game;
        `);

        await client.query(`
            CREATE TRIGGER trigger_delete_old_games
            AFTER INSERT ON game
            FOR EACH ROW
            EXECUTE FUNCTION delete_old_games_on_insert();`);

        await client.query("COMMIT");

        console.log("Миграция выполнена");
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Ошибка при выполнении миграции:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();
