<template>
    <v-app>
        <v-toolbar flat class="googlesans">
            <img src="./assets/logo.svg" alt="logo" id="toolbar-logo">
            <v-toolbar-title>Faidherbe</v-toolbar-title>
        </v-toolbar>
        <div id="body">
            <v-btn large color="success" v-show="!booking" @click="domeals">Réserver !</v-btn>
            <v-progress-circular
                indeterminate
                color="green" v-show="booking"></v-progress-circular>
        </div>
    </v-app>
</template>

<script>
import Meals from './meals.js'

export default {
    name: 'app',
    data() {
        return {
            booking: false,
        }
    },
    methods: {
        async domeals() {
            this.booking = true;
            const meals = new Meals('username', 'password');
            await meals.connect();
            await meals.getMeals();
            const [available, booked] = [meals.available, meals.booked];
            // console.log(available, booked);
            await meals.book(available.filter(a => !booked.some(b => b.serviceDate == a.serviceDate)))
            // console.log(r)
            meals.logout();
            this.booking = false;
        }
    }
}
</script>

<style>
@font-face {
    font-family: 'GoogleSans';²
    src: url('./assets/fonts/google-sans-regular.ttf') format('truetype');
}

#app {
    font-family: sans-serif;
    background-color: #f5f5f5;
}

.googlesans {
    font-family: 'GoogleSans', sans-serif;
}

#toolbar-logo {
    max-height: 60%;
}

#body {
    margin: 0 auto;
    margin-top: 100px;
}
</style>
