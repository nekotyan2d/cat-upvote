import { z } from "zod";
import { pool } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
    const params = await getValidatedRouterParams(
        event,
        z.object({
            id: z.uuid(),
        }).parse,
    );

    const body = await readValidatedBody(
        event,
        z.object({
            choice: z.literal(0).or(z.literal(1)),
        }).parse,
    );

    const cookies = parseCookies(event);
    const deviceId = cookies["device-id"];

    const db = await pool.connect();

    const gameId = params.id;

    let post1: Post, post2: Post;

    let score1: number, score2: number;

    try {
        await db.query("BEGIN");

        const data = await db.query(
            `SELECT
                round,
                p1.post_id AS post_id_1, p1.score as score_1, p1.img_url AS img_url_1, p1.created_at AS created_at_1,
                p2.post_id AS post_id_2, p2.score as score_2, p2.img_url AS img_url_2, p2.created_at AS created_at_2
            FROM game JOIN post AS p1 ON game.post_id_1 = p1.post_id JOIN post AS p2 ON game.post_id_2 = p2.post_id WHERE game.id = $1`,
            [gameId],
        );
        if (data.rows.length === 0) {
            throw new Error("Game not found");
        }

        const gameInfo = data.rows[0];

        post1 = {
            post_id: gameInfo.post_id_2,
            score: gameInfo.score_2,
            img_url: gameInfo.img_url_2,
            created_at: gameInfo.created_at_2,
        };

        score1 = gameInfo.score_1;
        score2 = gameInfo.score_2;

        // ponytail: a tie counts as a correct guess for whichever side was picked
        const correct = (body.choice === 0 && score1 >= score2) || (body.choice === 1 && score2 >= score1);

        if (!correct) {
            const recordRoundsData = await db.query(
                "SELECT MAX(round) as max_round FROM attempts WHERE device_id = $1",
                [deviceId],
            );
            const recordRounds = recordRoundsData.rows[0].max_round;

            const attemptData = await db.query("INSERT INTO attempts (round, device_id) VALUES ($1, $2) RETURNING id", [
                gameInfo.round - 1,
                deviceId,
            ]);
            const id = attemptData.rows[0].id;

            await db.query("COMMIT");

            return {
                ok: true,
                message: "Game over",
                response: {
                    game: {
                        attempt_id: id,
                        record_rounds: recordRounds,
                        posts: [
                            {
                                score: score1,
                            },
                            {
                                score: score2,
                            },
                        ],
                    },
                },
            } as SuccessResponse<{
                game: { attempt_id: string; record_rounds: number; posts: { score: number }[] };
                next_game: undefined;
            }>;
        }

        const postsData = await db.query(`SELECT * FROM post WHERE post_id NOT IN ($1, $2) ORDER BY RANDOM() LIMIT 1`, [
            gameInfo.post_id_1,
            gameInfo.post_id_2,
        ]);

        [post2] = postsData.rows;

        await db.query(`UPDATE game SET post_id_1 = $1, post_id_2 = $2, round = round + 1 WHERE id = $3`, [
            post1.post_id,
            post2.post_id,
            gameId,
        ]);

        await db.query("COMMIT");
    } catch (error: any) {
        await db.query("ROLLBACK");
        console.error("Error making choice:", error);
        return {
            ok: false,
            message: "Error making choice",
        } as ErrorResponse;
    } finally {
        db.release();
    }

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
                        created_at: post1.created_at,
                    },
                    {
                        post_id: post2.post_id,
                        score: null,
                        img_url: post2.img_url,
                        created_at: post2.created_at,
                    },
                ],
            },
        },
    } as SuccessResponse<{
        game: { posts: { score: number }[] };
        next_game: { posts: Post[] };
    }>;
});
