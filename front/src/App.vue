<template>
    <v-app>
    <div id="app">
        <div class="googlesans toolbar">
            <img src="./assets/logo.svg" alt="logo" id="toolbar-logo">
            Faidherbe
        </div>
        <transition name="fade" mode="out-in">
            <router-view></router-view>
        </transition>
    </div>
    </v-app>
</template>

<script>
export default {
    name: 'App',
}
</script>

<style>
@font-face {
    font-family: 'GoogleSans';
    src: url('assets/fonts/google-sans-regular.ttf') format('truetype');
}

body, html {
    width: 100%;
    padding: 0;
    margin: 0;
}

#app {
    font-family: 'Roboto', sans-serif;
}

.googlesans {
    font-family: 'GoogleSans', sans-serif;
}

.toolbar {
    height: 60px;
    font-size: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-bottom: 50px;
}

.toolbar img {
    display: inline-block;
    margin-right: 20px;
}

#toolbar-logo {
    max-height: 60%;
}

.fade-enter {
    opacity: 0;
}

.fade-enter-active {
    transition: opacity 0.1s ease-in-out;
}

.fade-leave {

}

.fade-leave-active {
    transition: opacity 0.1s ease-in-out;
    opacity: 0;
}
</style>
