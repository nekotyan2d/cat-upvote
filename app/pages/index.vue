<template>
    <div>
        <h2>У кого больше апвоутов?</h2>
        <div
            v-if="gameData.id"
            class="game-container">
            <div
                class="cards"
                :class="{ hidden: !(imageLoaded[0] && imageLoaded[1]) }">
                <Card
                    :post="gameData.posts[0]!"
                    :appearing="appearing[0]"
                    @click="select(1)"
                    @appear-finished="appearing[0] = false"
                    @image-loaded="imageLoaded[0] = true" />
                <Card
                    :post="gameData.posts[1]! "
                    :appearing="appearing[1]"
                    @click="select(2)"
                    @appear-finished="appearing[1] = false"
                    @image-loaded="imageLoaded[1] = true" />
            </div>
            <div
                v-if="!(imageLoaded[0] && imageLoaded[1])"
                class="cards--loading">
                Загрузка...
            </div>
            <div class="game__rounds">Раунд: {{ gameRounds + 1 }}</div>
        </div>
        <div v-else>
            <button @click="start">Начать</button>
        </div>
        <div
            v-if="gameFinished"
            class="game-results">
            <h2>Игра завершена!</h2>
            <h3>Текущая попытка</h3>
            <div class="current-rounds">{{ gameRounds }}</div>
            <h3>Лучшая попытка</h3>
            <div class="best-rounds">{{ gameBestRounds }}</div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import type Card from "../components/Card.vue";
const gameData = ref<Game>({
    id: "",
    posts: [
        {
            post_id: "",
            score: null,
            img_url: "",
        },
        {
            post_id: "",
            score: null,
            img_url: "",
        },
    ],
});

const appearing = ref<[boolean, boolean]>([true, true]);
const imageLoaded = ref<[boolean, boolean]>([false, false]);

const gameFinished = ref(false);
const gameRounds = ref(0);
const gameBestRounds = ref(localStorage.getItem("bestRounds") ?? 0);

watch(
    imageLoaded,
    (newVal) => {
        if (newVal[0] && newVal[1]) {
            appearing.value = [true, true];
        }
    },
    { deep: true }
);

watch(gameRounds, (newVal) => {
    const bestRound = localStorage.getItem("bestRounds");
    if (!bestRound || newVal > +bestRound) {
        localStorage.setItem("bestRounds", newVal.toString());
        gameBestRounds.value = newVal;
    }
});

async function start() {
    try {
        const res = await $fetch("/api/game/new", {
            method: "POST",
        });

        if (res && res.ok) {
            gameFinished.value = false;
            gameRounds.value = 0;

            gameData.value.id = res.response.id;

            gameData.value.posts = [res.response.posts[0]!, res.response.posts[1]!];

            appearing.value = [true, true];
            imageLoaded.value = [false, false];
        }
    } catch (error) {
        console.error("Error starting new game:", error);
    }
}

async function select(choice: number) {
    if (gameFinished.value) return;
    try {
        const res = await $fetch(`/api/game/${gameData.value.id}`, {
            method: "POST",
            body: {
                choice,
            },
        });

        if (res && res.ok) {
            if ("next_game" in res.response) {
                gameData.value.posts[0]!.score = res.response.game.posts[0]!.score;
                gameData.value.posts[1]!.score = res.response.game.posts[1]!.score;

                const nextGame = res.response.next_game;

                setTimeout(() => {
                    gameData.value.posts = [nextGame.posts[0]!, nextGame.posts[1]!];
                    imageLoaded.value = [false, false];
                    appearing.value = [true, true];
                    gameRounds.value++;
                }, 5000);
            } else {
                gameData.value.posts[1]!.score = res.response.posts[1]!.score;
                gameFinished.value = true;

                setTimeout(() => {
                    gameData.value.id = "";
                }, 5000);
            }
        }
    } catch (error) {
        console.error("Error making choice:", error);
    }
}
</script>
<style lang="scss">
.game-container {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--gap-normal);

    .game__rounds {
        text-align: center;
        font-size: 1.2rem;
        color: var(--color-text);
    }
}
.cards {
    display: flex;
    gap: var(--gap-normal);

    &.hidden {
        visibility: hidden;
    }

    &--loading {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 500px;
        font-size: 1.5rem;
        color: var(--color-text);
    }
}
</style>
