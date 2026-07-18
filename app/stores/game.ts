import type { Post, ImageChoice } from "~~/shared/types/app";

export const useGameStore = defineStore("game", () => {
    const gameId = ref<string | null>(null);
    const gamePosts = ref<Post[]>([]);
    const gameFinished = ref(true);
    const gameRounds = ref(0);
    const gameRecordRounds = ref(0);
    const lastAttemptId = ref("");

    const correct = ref<ImageChoice | null>(null);
    const selected = ref<ImageChoice | null>(null);

    const REVEAL_MS = 5000;

    async function start() {
        try {
            const res = await $fetch("/api/game/new", {
                method: "POST",
            });

            gameId.value = null;
            gamePosts.value = [];
            correct.value = null;
            selected.value = null;

            if (res && res.ok) {
                gameFinished.value = false;
                gameRounds.value = 0;

                gameId.value = res.response.id;

                gamePosts.value = [res.response.posts[0]!, res.response.posts[1]!];
            } else {
                throw new Error("Error starting new game");
            }
        } catch (error) {
            console.error("Error starting new game:", error);
            throw error;
        }
    }

    async function select(choice: ImageChoice) {
        if (gameFinished.value) return;
        selected.value = choice;
        try {
            const res = await $fetch(`/api/game/${gameId.value}`, {
                method: "POST",
                body: {
                    choice,
                },
            });

            if (res && res.ok && "game" in res.response) {
                gamePosts.value[1]!.score = res.response.game.posts[1]!.score;
                correct.value = gamePosts.value[0]!.score! > gamePosts.value[1]!.score ? 0 : 1;

                if ("next_game" in res.response) {
                    const nextGame = res.response.next_game;

                    setTimeout(() => {
                        gamePosts.value = [nextGame.posts[0]!, nextGame.posts[1]!];
                        gameRounds.value++;
                        correct.value = null;
                        selected.value = null;
                    }, REVEAL_MS);
                } else {
                    gameRecordRounds.value = res.response.game.record_rounds;
                    lastAttemptId.value = res.response.game.attempt_id;

                    setTimeout(() => {
                        gameFinished.value = true;
                    }, 500);
                }
            }
        } catch (error) {
            console.error("Error making choice:", error);
        }
    }

    return {
        gameId,
        gamePosts,
        gameFinished,
        gameRounds,
        gameRecordRounds,
        lastAttemptId,
        correct,
        selected,

        start,
        select,
    };
});
