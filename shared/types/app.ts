export interface Post {
    post_id: string;
    score: number | null;
    img_url: string;
    created_at: string;
}

export interface Game {
    id: string;
    posts: Post[];
}

export interface RatingItem {
    name: string;
    round: number;
    created_at: string;
}

export type ImageChoice = 0 | 1;

export interface ApiResponse<T> {
    ok: boolean;
    message: string;
    response: T;
}

export interface SuccessResponse<T> extends ApiResponse<T> {
    ok: true;
    response: T;
}

export interface ErrorResponse extends ApiResponse<undefined> {
    ok: false;
}
