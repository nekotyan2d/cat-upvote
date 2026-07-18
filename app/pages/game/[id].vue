<script lang="ts" setup>
import type Card from "~/components/Card.vue";
import { useGameStore } from "~/stores/game";

const route = useRoute();
const gameId = route.params.id;

if (!gameId) {
    showError({
        statusCode: 404,
    });
}

const gameStore = useGameStore();

const { start, select } = gameStore;

if (!gameStore.gameId) {
    navigateTo("/");
}

const appearing = ref<[boolean, boolean]>([true, true]);
const carouselPosts = ref<[Post | null, Post | null, Post | null]>([null, null, null]);
const isSliding = ref(false);
const cardsViewport = ref<HTMLElement | null>(null);
const slideDistance = ref(0);
const trackOffset = ref(0);
const trackTransition = ref(false);
const slideTimeoutId = ref<number | null>(null);
const slideMs = 380;

function clearSlideTimeout() {
    if (slideTimeoutId.value !== null) {
        window.clearTimeout(slideTimeoutId.value);
        slideTimeoutId.value = null;
    }
}

function measureSlideDistance() {
    const viewport = cardsViewport.value;

    if (!viewport) {
        slideDistance.value = 0;
        return;
    }

    const cards = viewport.querySelectorAll(".card");
    const firstCard = cards[0] as HTMLElement | undefined;
    const secondCard = cards[1] as HTMLElement | undefined;

    if (!firstCard || !secondCard) {
        slideDistance.value = 0;
        return;
    }

    slideDistance.value = secondCard.getBoundingClientRect().left - firstCard.getBoundingClientRect().left;
}

function syncInitialCarousel() {
    if (gameStore.gamePosts.length < 2) {
        carouselPosts.value = [null, null, null];
        return;
    }

    carouselPosts.value = [gameStore.gamePosts[0]!, gameStore.gamePosts[1]!, gameStore.gamePosts[1]!];
}

watch(
    () => gameStore.gamePosts.map((post) => post.post_id).join("|"),
    async (newValue, oldValue) => {
        if (!newValue || gameStore.gamePosts.length < 2) {
            carouselPosts.value = [null, null, null];
            return;
        }

        if (!oldValue || carouselPosts.value[0] == null || carouselPosts.value[1] == null) {
            syncInitialCarousel();
            isSliding.value = false;
            clearSlideTimeout();
            return;
        }

        const currentLeft = carouselPosts.value[0]!;
        const currentRight = carouselPosts.value[1]!;
        const nextLeft = gameStore.gamePosts[0]!;
        const nextRight = gameStore.gamePosts[1]!;

        carouselPosts.value = [currentLeft, currentRight, nextRight];
        await nextTick();
        measureSlideDistance();
        trackTransition.value = true;
        trackOffset.value = 0;
        await nextTick();
        requestAnimationFrame(() => {
            trackOffset.value = -slideDistance.value;
        });
        isSliding.value = true;

        clearSlideTimeout();
        slideTimeoutId.value = window.setTimeout(() => {
            carouselPosts.value = [nextLeft, nextRight, nextRight];
            trackTransition.value = false;
            trackOffset.value = 0;
            isSliding.value = false;
            slideTimeoutId.value = null;

            requestAnimationFrame(() => {
                trackTransition.value = true;
            });
        }, slideMs);
    },
    { immediate: true },
);

watch(
    () => gameStore.gameFinished,
    (finished) => {
        if (finished) {
            clearSlideTimeout();
            isSliding.value = false;
            trackTransition.value = false;
            trackOffset.value = 0;
        }
    },
);

async function onAgain() {
    appearing.value = [false, false];
    carouselPosts.value = [null, null, null];
    isSliding.value = false;
    trackOffset.value = 0;
    trackTransition.value = false;
    clearSlideTimeout();
    try {
        await start();
        navigateTo(`/game/${gameStore.gameId}`);
    } catch (error) {}
}

async function onSelect(choice: ImageChoice) {
    await select(choice);
}
</script>

<template>
    <h2>У кого больше апвоутов?</h2>
    <div
        v-if="gameStore.gameId"
        class="game-container">
        <div
            class="cards"
            ref="cardsViewport">
            <div
                class="cards__track"
                :class="{ 'cards__track--sliding': isSliding }"
                :style="{
                    transform: `translateX(${trackOffset}px)`,
                    transition: trackTransition ? undefined : 'none',
                }">
                <Card
                    :post="carouselPosts[0]!"
                    :appearing="appearing[0]"
                    :open-orig="true"
                    :correct="gameStore.correct == null ? undefined : gameStore.correct == 0"
                    :selected="gameStore.selected == null ? undefined : gameStore.selected == 0"
                    @click="onSelect(0)"
                    @appear-finished="appearing[0] = false" />
                <Card
                    :post="carouselPosts[1]!"
                    :appearing="appearing[1]"
                    :open-orig="gameStore.gameFinished && carouselPosts[1]?.score !== null"
                    :correct="gameStore.correct == null ? undefined : gameStore.correct == 1"
                    :selected="gameStore.selected == null ? undefined : gameStore.selected == 1"
                    @click="onSelect(1)"
                    @appear-finished="appearing[1] = false" />
                <Card
                    :post="carouselPosts[2] || carouselPosts[1]!"
                    :appearing="false"
                    :open-orig="false" />
            </div>
        </div>
        <div
            v-if="gameStore.gamePosts.length == 0"
            class="cards--loading">
            Загрузка...
        </div>
        <div class="game__rounds">Раунд: {{ gameStore.gameRounds + 1 }}</div>
        <template v-if="gameStore.gameFinished">
            <GameOverModal
                :show="gameStore.gameFinished"
                :attempt-id="gameStore.lastAttemptId"
                :game-rounds="gameStore.gameRounds"
                :game-record-rounds="gameStore.gameRecordRounds" />
            <button @click="onAgain">Играть снова</button>
        </template>
    </div>
</template>
<style lang="scss">
.game-container {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--gap-normal);

    .game__rounds {
        text-align: center;
        font-size: var(--font-size-normal);
        color: var(--color-text);
    }
}
.cards {
    overflow: hidden;

    &__track {
        display: flex;
        gap: var(--gap-normal);
        width: 100%;
        will-change: transform;

        transition: transform 380ms cubic-bezier(0.22, 1, 0.36, 1);

        &--sliding {
            pointer-events: none;
        }
    }

    &--loading {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 70dvh;
        font-size: 1.5rem;
        color: var(--color-text);
    }
}
</style>
