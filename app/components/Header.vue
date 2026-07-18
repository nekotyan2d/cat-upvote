<template>
    <header>
        <NuxtLink
            class="logo"
            to="/"
            >cat-upvote</NuxtLink
        >
    </header>
</template>
<style lang="scss" scoped>
header {
    padding: var(--padding-normal) var(--padding-large);
    margin: 0 auto;
    max-width: 1000px;

    .logo {
        font-size: var(--font-size-large);
        text-decoration: none;
        color: var(--color-primary);
    }
}
</style>
