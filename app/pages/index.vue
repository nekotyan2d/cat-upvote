<template>
    <section class="hero">
        <div class="hero__left">
            <h1>У кого больше <span class="highlight">апвоутов?</span></h1>
            <p>Угадывай и соревнуйся с другими игроками</p>
            <button @click="play">Играть</button>
        </div>
        <div class="hero__right">
            <Card
                v-for="post in posts"
                :post="post"
                :open-orig="false"
                :appearing="false" />
        </div>
    </section>
    <Rating />
</template>
<script lang="ts" setup>
import { useGameStore } from "~/stores/game";

const gameStore = useGameStore();

const { start } = gameStore;

const posts: Post[] = [
    {
        post_id: "1uorxwp/went_hiking_in_the_chamonix_and_this_lil_fella/",
        score: 5200,
        img_url:
            "https://preview.redd.it/went-hiking-in-the-chamonix-and-this-lil-fella-started-v0-hrfbmz59rkbh1.jpg?width=640&crop=smart&auto=webp&s=74b28e0561d15cdcc44c18142cf8d0a39c9ea132",
        created_at: "2026-07-06T09:01:56.149Z",
    },
    {
        post_id: "1uv2mim/my_little_one_is_gone_im_heartbroken_for_me_and/",
        score: null,
        img_url:
            "https://preview.redd.it/my-little-one-is-gone-im-heartbroken-for-me-and-his-big-v0-1truf7a6pxch1.jpg?width=640&crop=smart&auto=webp&s=0200569d8b386a04fbeab0185cfdca51e04afe43",
        created_at: "2026-07-13T05:37:32.661Z",
    },
];

async function play() {
    try {
        await start();
        navigateTo(`/game/${gameStore.gameId}`);
    } catch (error) {}
}
</script>
<style lang="scss" scoped>
.hero {
    height: 80dvh;
    display: flex;
    align-items: center;
    gap: var(--gap-normal);

    &__left {
        flex: 2;

        h1 {
            font-size: 3rem;
            line-height: 0.9;
        }
    }

    &__right {
        flex: 3;
        display: flex;
        gap: var(--gap-normal);

        &:deep(.card) {
            height: unset;
            width: 250px;

            &:first-child {
                transform: translateX(20px) rotate(-10deg);
            }

            &:last-child {
                transform: rotate(10deg) translateX(-20px);
            }

            .card__image {
                max-height: 20dvh;
            }
        }
    }
}

@media screen and (max-width: 1024px) {
    .hero {
        flex-direction: column;
        gap: 4rem;

        &__left {
            width: 100%;
            flex: unset;
            text-align: center;
            max-width: 400px;
        }

        &__right {
            flex: unset;
        }
    }
}

@media screen and (max-width: 768px) {
    .hero {
        flex-direction: column;

        &__left {
            width: 100%;
        }
    }
}
@media screen and (max-width: 640px) {
    .hero {
        flex-direction: column;

        &__left {
            width: 100%;
        }

        &__right {
            &:deep(.card) {
                width: auto;
            }
        }
    }
}
</style>
