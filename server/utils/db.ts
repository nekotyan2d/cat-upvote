import pg from "pg";

export const connectToDb = async () => {
    const client = new pg.Client({
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
    });
    await client.connect();
    return client;
};
