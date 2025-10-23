import { connectToDb } from "~~/server/utils/db";
import { v4 as uuid4 } from "uuid";

export default defineEventHandler(async (event) => {
    const db = await connectToDb();

    let game: Game;
    let post1: Post, post2: Post;

    try {
        await db.query("BEGIN");

        const postsData = await db.query(`SELECT * FROM post ORDER BY RANDOM() LIMIT 2`);

        [post1, post2] = postsData.rows;

        const insertResult = await db.query(
            `INSERT INTO game (id, post_id_1, post_id_2) VALUES ($1, $2, $3) RETURNING *`,
            [uuid4(), post1.post_id, post2.post_id]
        );

        game = insertResult.rows[0];

        await db.query("COMMIT");
    } catch (error) {
        await db.query("ROLLBACK");
        console.error("Error creating new game:", error);
        return {
            ok: false,
            message: "Error creating new game",
        } as ErrorResponse;
    }

    await db.end();
    return {
        ok: true,
        message: "New game created successfully",
        response: {
            id: String(game.id),
            posts: [
                {
                    post_id: post1.post_id,
                    score: post1.score,
                    img_url: post1.img_url,
                },
                {
                    post_id: post2.post_id,
                    score: null,
                    img_url: post2.img_url,
                },
            ],
        },
    } as SuccessResponse<{ id: string; posts: Post[] }>;
});
