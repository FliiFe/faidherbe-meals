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

@font-face {
    font-family: 'Roboto';
    src: url('assets/fonts/roboto-regular.ttf') format('truetype');
}

body, html {
    width: 100%;
    padding: 0;
    margin: 0;
}

:hover:before {
    background-color: transparent !important;
}


#app {
    font-family: 'Roboto', sans-serif;
    /* background-color: #fafafa; */
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

.fade-leave-active {
    transition: opacity 0.1s ease-in-out;
    opacity: 0;
}

* {
    -webkit-touch-callout: none;
    -webkit-user-select: none; 
    user-select: none;
}

[contenteditable="true"] , input, textarea {
    -webkit-user-select: auto !important;
    -khtml-user-select: auto !important;
    -moz-user-select: auto !important;
    -ms-user-select: auto !important;
    -o-user-select: auto !important;
    user-select: auto !important;
}
</style>
