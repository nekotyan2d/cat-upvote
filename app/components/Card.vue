<template>
    <div
        class="card"
        :class="{ appearing: appearing }">
        <img
            :src="post.img_url"
            alt="Post Image"
            class="card__image"
            @load="onImageLoad" />
        <div
            class="card__score"
            :class="{ 'card__score--unknown': !post.score }">
            {{ post.score || "?" }}
        </div>
    </div>
</template>
<script lang="ts" setup>
const props = defineProps<{
    post: Post;
    appearing: boolean;
}>();

const emit = defineEmits(["appearFinished", "imageLoaded"]);

setTimeout(() => {
    emit("appearFinished");
}, 500);

watch(
    () => props.appearing,
    () => {
        if (props.appearing) {
            setTimeout(() => {
                emit("appearFinished");
            }, 500);
        }
    }
);

function onImageLoad() {
    emit("imageLoaded");
    setTimeout(() => {
        emit("appearFinished");
    }, 500);
}
</script>
<style lang="scss">
.card {
    display: flex;
    flex-direction: column;
    gap: var(--gap-normal);
    align-items: center;
    justify-content: center;
    height: 500px;
    flex: 1;
    border-radius: var(--border-radius);
    background-color: var(--color-background-secondary);

    &.appearing {
        animation: appear 0.5s ease-in-out;
    }

    .card__image {
        max-width: 100%;
        max-height: 400px;
        display: block;
    }

    .card__score {
        color: var(--color-green);
        font-size: 2rem;

        &--unknown {
            color: var(--color-text-secondary);
        }
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
</style>
