import { z } from "zod";

export default defineEventHandler(async (event) => {
    const params = await getValidatedRouterParams(
        event,
        z.object({
            id: z.uuid(),
        }).parse
    );

    const body = await readValidatedBody(
        event,
        z.object({
            choice: z.number().min(1).max(2),
        }).parse
    );

    const db = await connectToDb();

    const gameId = params.id;

    let nextGame: Game;
    let post1: Post, post2: Post;

    let score1: number, score2: number;

    try {
        await db.query("BEGIN");

        const data = await db.query(
            `SELECT 
                p1.post_id AS post_id_1, p1.score as score_1, p1.img_url AS img_url_1,
                p2.post_id AS post_id_2, p2.score as score_2, p2.img_url AS img_url_2
            FROM game JOIN post AS p1 ON game.post_id_1 = p1.post_id JOIN post AS p2 ON game.post_id_2 = p2.post_id WHERE game.id = $1`,
            [gameId]
        );
        if (data.rows.length === 0) {
            throw new Error("Game not found");
        }

        const gameInfo = data.rows[0];

        post1 = {
            post_id: gameInfo.post_id_2,
            score: gameInfo.score_2,
            img_url: gameInfo.img_url_2,
        };

        score1 = gameInfo.score_1;
        score2 = gameInfo.score_2;

        if (!(body.choice === 1 && score1 > score2) && !(body.choice === 2 && score2 > score1)) {
            await db.query(`DELETE FROM game WHERE id = $1`, [gameId]);
            await db.query("COMMIT");

            return {
                ok: true,
                message: "Game over",
                response: {
                    posts: [
                        {
                            score: score1,
                        },
                        {
                            score: score2,
                        },
                    ],
                },
            } as SuccessResponse<{ posts: { score: number }[] }>;
        }

        const postsData = await db.query(`SELECT * FROM post WHERE post_id NOT IN ($1, $2) ORDER BY RANDOM() LIMIT 1`, [
            gameInfo.post_id_1,
            gameInfo.post_id_2,
        ]);

        [post2] = postsData.rows;

        const updateResult = await db.query(
            `UPDATE game SET post_id_1 = $1, post_id_2 = $2, round = round + 1 WHERE id = $3 RETURNING *`,
            [post1.post_id, post2.post_id, gameId]
        );

        nextGame = updateResult.rows[0];

        await db.query("COMMIT");
    } catch (error: any) {
        await db.query("ROLLBACK");
        console.error("Error making choice:", error);
        return {
            ok: false,
            message: `Error making choice: ${error.message}`,
        } as ErrorResponse;
    }

    await db.end();

    return {
        ok: true,
        message: `Right choice!`,
        response: {
            game: {
                posts: [
                    {
                        score: score1,
                    },
                    {
                        score: score2,
                    },
                ],
            },
            next_game: {
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
        },
    } as SuccessResponse<{
        game: { posts: { score: number }[] };
        next_game: { posts: Post[] };
    }>;
});
