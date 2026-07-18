<script setup lang="ts">
import { useGameStore } from "~/stores/game";

const props = defineProps<{
    gameRounds: number;
    gameRecordRounds: number;
    attemptId: string;
    show: boolean;
}>();

const modal = ref<HTMLDialogElement | null>(null);
const name = ref("");

const gameStore = useGameStore();
const { start } = gameStore;

onMounted(() => {
    show();
});

watch(
    () => props.show,
    () => show(),
);

function show() {
    if (props.show) modal.value?.showModal();
}

async function saveResults() {
    try {
        const data = await $fetch("/api/rating/share", {
            method: "POST",
            body: {
                name: name.value,
                id: props.attemptId,
            },
        });

        if (!data.ok) throw new Error("Произошла ошибка при сохранении результатов");

        modal.value?.close();
    } catch (error) {
        console.error(error);
    }
}
</script>

<template>
    <dialog
        ref="modal"
        @click.self="modal?.close()">
        <div class="content">
            <h2>Игра завершена!</h2>
            <section class="results">
                <div class="current-rounds">
                    <div class="count">
                        {{ gameRounds }}
                    </div>
                    <div class="label">раундов</div>
                </div>
                <div class="best-rounds">
                    <template v-if="gameRounds <= gameRecordRounds">рекорд &ndash; {{ gameRecordRounds }}</template>
                    <template v-else>новый рекорд!</template>
                </div>
            </section>
            <form
                class="share"
                @submit.prevent="saveResults">
                <h3>Поделиться попыткой в рейтинге?</h3>
                <input
                    class="share__name-input"
                    placeholder="Имя"
                    v-model="name"
                    tabindex="0"
                    required />
                <button type="submit">Сохранить результат</button>
            </form>
            <button
                class="secondary"
                @click="start">
                Играть снова
            </button>
        </div>
    </dialog>
</template>

<style lang="scss" scoped>
dialog {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 3;
    background-color: var(--color-background-secondary);
    border: none;
    border-radius: var(--border-radius);
    color: var(--color-text);
    max-width: 400px;
    width: 100%;
    animation: appear 0.5s;

    &::backdrop {
        background-color: rgba(0, 0, 0, 0.5);
    }

    .content {
        display: flex;
        flex-direction: column;
        gap: var(--gap-normal);
    }

    h2 {
        text-align: center;
    }

    .results {
        text-align: center;

        .current-rounds {
            .count {
                font-size: 3rem;
                font-weight: bold;
            }

            .label {
                font-size: var(--font-size-small);
                color: var(--color-text-secondary);
            }
        }

        .best-rounds {
            margin-top: var(--gap-normal);
            font-size: var(--font-size-small);
        }
    }

    .share {
        margin-top: var(--gap-normal);
        display: flex;
        flex-direction: column;
        gap: var(--gap-normal);

        h3 {
            margin: 0;
        }
    }
}

@keyframes appear {
    from {
        opacity: 0;
        transform: translateY(-100px);
    }
}
</style>
