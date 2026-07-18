import { DatabaseError } from "pg";
import { ErrorResponse, RatingItem, SuccessResponse } from "~~/shared/types/app";

export default defineEventHandler(async (event) => {
    const db = await pool.connect();

    let result: RatingItem[] = [];

    try {
        const data = await db.query("SELECT * FROM attempts WHERE name IS NOT NULL ORDER BY round DESC");

        if (!data.rowCount) {
            throw new Error("Empty rating");
        }

        result = data.rows;
    } catch (error) {
        if (!Error.isError(error) || error instanceof DatabaseError) {
            setResponseStatus(event, 500);
            console.error(error);
            return {
                ok: false,
                message: "Internal Server Error",
            } as ErrorResponse;
        }

        setResponseStatus(event, 400);
        return {
            ok: false,
            message: error.message,
        } as ErrorResponse;
    } finally {
        db.release();
    }

    return {
        ok: true,
        response: {
            rating: result,
        },
    } as SuccessResponse<{
        rating: RatingItem[];
    }>;
});
