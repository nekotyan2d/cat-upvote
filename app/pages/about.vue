<template>
    <section class="about">
        <h1>О проекте</h1>
        <p>
            <strong class="highlight">cat-upvote</strong> — игра-сравнение: показываются два поста с котиками из Reddit,
            а игрок угадывает, у какого больше апвоутов.
        </p>
        <p>
            База постов пополняется в фоне скриптом
            <a
                href="https://github.com/nekotyan2d/reddit-post-parser"
                target="_blank"
                rel="noopener noreferrer"
                >reddit-post-parser</a
            >, который парсит Reddit и складывает посты в базу — так рейтинг остаётся свежим без ручного участия.
        </p>
        <p>
            Исходный код этого сайта можно посмотреть на <a href="https://github.com/nekotyan2d/cat-upvote">Github</a>.
        </p>
    </section>
</template>

<style lang="scss" scoped>
.about {
    display: flex;
    flex-direction: column;
    gap: var(--gap-normal);
    max-width: 600px;

    a {
        color: var(--color-primary);
    }
}
</style>
