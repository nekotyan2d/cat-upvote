<script lang="ts" setup>
const rating = ref<RatingItem[]>([]);
try {
    const data = await $fetch("/api/rating");

    if (data.ok) {
        rating.value = data.response.rating;
    } else {
        throw new Error("Произошла ошибка при загрузке рейтинга");
    }
} catch (error) {
    console.error(error);
}
</script>

<template>
    <section class="rating">
        <h3>Рейтинг</h3>
        <div
            v-for="(item, i) in rating"
            class="rating-item">
            <div class="rating-item__position">#{{ i + 1 }}</div>
            <div class="rating-item__name">{{ item.name }}</div>
            <div class="rating-item__round">
                <div class="round-count">
                    {{ item.round }}
                </div>
                <div class="round-label">раундов</div>
            </div>
            <time
                class="rating-item__date"
                :datetime="item.created_at"
                >{{ new Date(item.created_at).toLocaleDateString() }}</time
            >
        </div>
    </section>
</template>

<style lang="scss" scoped>
.rating {
    display: flex;
    flex-direction: column;
    gap: var(--gap-normal);
    max-width: 400px;

    h3 {
        margin: 0;
    }

    .rating-item {
        background-color: var(--color-background-secondary);
        border-radius: var(--border-radius);
        padding: var(--padding-normal);
        display: grid;
        grid-template-columns: auto 1fr auto;
        grid-template-areas:
            "position name round"
            "position date round";

        gap: var(--gap-normal);
        &__position {
            grid-area: position;
            font-size: var(--font-size-large);
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--color-background);
            padding: var(--padding-normal);
            border-radius: var(--border-radius-small);
        }

        &__name {
            grid-area: name;
            display: flex;
            align-items: flex-end;
        }

        &__date {
            grid-area: date;
            font-size: var(--font-size-small);
            color: var(--color-text-secondary);
            display: flex;
            align-items: flex-start;
        }

        &__round {
            grid-area: round;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            .round-count {
                font-size: var(--font-size-large);
                font-weight: bold;
            }

            .round-label {
                font-size: var(--font-size-small);
                color: var(--color-text-secondary);
            }
        }
    }
}
</style>
