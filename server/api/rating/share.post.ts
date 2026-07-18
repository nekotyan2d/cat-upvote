import { DatabaseError } from "pg";
import z from "zod";
import { ErrorResponse, SuccessResponse } from "~~/shared/types/app";

export default defineEventHandler(async (event) => {
    const db = await pool.connect();

    const body = await readValidatedBody(
        event,
        z.object({
            id: z.uuid(),
            name: z.string().min(1).max(20),
        }).parse,
    );
    try {
        await db.query("BEGIN");

        const id = body.id;

        const gameData = await db.query("SELECT round FROM attempts WHERE id = $1 AND name IS NULL", [id]);
        if (!gameData.rowCount) {
            throw new Error("Attempt not found");
        }

        const name = body.name;
        const rounds = gameData.rows[0].round;

        if (rounds == 0) {
            throw new Error("Cannot share attempt with 0 rounds");
        }

        await db.query("UPDATE attempts SET name = $1 WHERE id = $2", [name, id]);

        await db.query("COMMIT");
    } catch (error) {
        await db.query("ROLLBACK");

        if (!Error.isError(error) || error instanceof DatabaseError) {
            setResponseStatus(event, 500);
            console.error(error);
            return {
                ok: false,
                message: "Internal Server Error",
            } as ErrorResponse;
        }

        setResponseStatus(event, 400);
        return { ok: false, message: error.message } as ErrorResponse;
    } finally {
        db.release();
    }

    return {
        ok: true,
    } as SuccessResponse<{}>;
});
