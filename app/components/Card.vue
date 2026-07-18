<template>
    <div
        class="card"
        :class="{
            appearing: appearing,
            'card--correct': selected && correct,
            'card--incorrect': selected && correct !== undefined && !correct,
            'card--loading': loading,
        }">
        <div class="card__image">
            <img
                ref="imageEl"
                :src="post.img_url"
                :key="post.img_url"
                alt="Post Image"
                @load="onImageLoad"
                @error="onImageError" />
        </div>

        <div class="card__backdrop">
            <img
                :src="post.img_url"
                alt="Backdrop Image"
                class="card__backdrop-image" />
        </div>
        <a
            v-if="openOrig"
            :href="post.img_url"
            target="_blank"
            class="card__open-orig">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24">
                <!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE -->
                <path
                    fill="currentColor"
                    d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h7v2H5v14h14v-7h2v7q0 .825-.587 1.413T19 21zm4.7-5.3l-1.4-1.4L17.6 5H14V3h7v7h-2V6.4z" />
            </svg>
        </a>
        <footer class="card__footer">
            <div
                class="card__score"
                :class="{ 'card__score--unknown': post.score == null }">
                {{ post.score ?? "?" }}
            </div>
            <div class="card__created-at">
                {{ formattedDate }}
            </div>
        </footer>
    </div>
</template>
<script lang="ts" setup>
const imageEl = ref<HTMLImageElement | null>(null);

const props = defineProps<{
    post: Post;
    openOrig: boolean;
    appearing: boolean;
    correct?: boolean;
    selected?: boolean;
}>();

const loading = ref(true);
const emit = defineEmits(["appearFinished"]);

const formattedDate = computed(() => {
    const date = new Date(props.post.created_at);
    return date.toLocaleTimeString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
});

setTimeout(() => {
    emit("appearFinished");
}, 500);

watch(
    () => props.post.img_url,
    async () => {
        loading.value = true;

        // Cached images can skip a visible loading phase and resolve immediately.
        await nextTick();
        if (imageEl.value?.complete) {
            onImageLoad();
        }
    },
    { immediate: true },
);

watch(
    () => props.appearing,
    () => {
        if (props.appearing) {
            setTimeout(() => {
                emit("appearFinished");
            }, 500);
        }
    },
);

function onImageLoad() {
    loading.value = false;

    setTimeout(() => {
        emit("appearFinished");
    }, 500);
}

function onImageError() {
    loading.value = false;
}
</script>
<style lang="scss">
.card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 70dvh;
    flex: 0 0 calc((100% - var(--gap-normal)) / 2);
    border-radius: var(--border-radius);
    background-color: var(--color-background-secondary);
    position: relative;
    overflow: hidden;
    padding: var(--gap-normal);

    &--loading {
        .card__image,
        .card__backdrop,
        .card__open-orig,
        .card__footer {
            visibility: hidden;
        }

        &::before {
            content: "";
            position: absolute;
            inset: 0;
            z-index: 100;
            pointer-events: none;
            border-radius: inherit;
            background:
                linear-gradient(
                    90deg,
                    rgba(255, 255, 255, 0) 20%,
                    rgba(255, 255, 255, 0.12) 50%,
                    rgba(255, 255, 255, 0) 80%
                ),
                linear-gradient(
                    90deg,
                    var(--color-background-secondary) 0%,
                    var(--color-background) 50%,
                    var(--color-background-secondary) 100%
                );
            background-size: 250% 100%;
            animation: card-shimmer 2.4s infinite;
        }
    }

    &--correct {
        border: 2px solid var(--color-green);
        animation: correct 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    &--incorrect {
        border: 2px solid var(--color-red);
        animation: incorrect 0.5s ease-in-out;
    }

    &.appearing {
        animation: appear 0.5s ease-in-out;
    }

    &__open-orig {
        display: flex;
        align-items: center;
        position: absolute;
        right: 0;
        top: 0;
        padding: var(--padding-small);
        border-radius: 0 var(--border-radius) 0 var(--border-radius);
        background-color: rgba(0, 0, 0, 0.5);
        color: var(--color-text);
        z-index: 2;
        cursor: pointer;
    }

    &__image {
        max-height: 50dvh;
        flex: 1;
        z-index: 1;
        display: flex;
        align-items: center;

        img {
            max-width: 100%;
            max-height: 100%;

            border-radius: var(--border-radius-small);
            object-fit: contain;
        }
    }

    &__footer {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--gap-normal);
        width: 100%;
        padding: var(--gap-normal);
        z-index: 1;
    }

    &__backdrop {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        filter: blur(12px) brightness(0.5);

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    &__score {
        color: var(--color-green);
        font-size: 2rem;

        &--unknown {
            color: var(--color-text-secondary);
        }
    }

    &__created-at {
        color: var(--color-text-secondary);
        font-size: 0.8rem;
    }
}

@keyframes appear {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes correct {
    50% {
        transform: scale(1.05);
    }
}

@keyframes incorrect {
    20% {
        transform: translateX(-10px);
    }
    40% {
        transform: translateX(10px);
    }
    60% {
        transform: translateX(-10px);
    }
    80% {
        transform: translateX(10px);
    }
}

@keyframes card-shimmer {
    0% {
        background-position:
            -250% 0,
            0 0;
    }

    100% {
        background-position:
            250% 0,
            0 0;
    }
}
</style>
