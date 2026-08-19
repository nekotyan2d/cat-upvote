<template>
    <header>
        <NuxtLink
            class="logo"
            to="/"
            >cat-upvote</NuxtLink
        >
        <NuxtLink
            class="about-link"
            to="/about"
            >о проекте</NuxtLink
        >
    </header>
</template>
<style lang="scss" scoped>
header {
    padding: var(--padding-normal) var(--padding-large);
    margin: 0 auto;
    max-width: 1000px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .logo {
        font-size: var(--font-size-large);
        text-decoration: none;
        color: var(--color-primary);
    }

    .about-link {
        color: var(--color-text-secondary);
        text-decoration: none;
    }
}
</style>
