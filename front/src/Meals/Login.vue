<template>
    <div class="loginform">
        <v-text-field
            v-model="username"
            label="Identifiant"
            required outline></v-text-field>
        <v-text-field
            v-model="password"
            label="Mot de passe"
            type="password"
            required outline></v-text-field>
        <v-btn color="indigo" flat class="float-right" @click="connect" :loading="loading" :disabled="username.length <= 5 || password.length <= 5">Connexion</v-btn>
        <v-snackbar bottom v-model="snackbar" :timeout="10000">
            Identifiant ou mot de passe incorrect
            <v-btn flat color="white" @click="snackbar = false">Ok</v-btn>
        </v-snackbar>
    </div>
</template>

<script>
import Meals from './meals.js';

export default {
    name: 'meals-login',
    data() {
        return {
            username: '',
            password: '',
            loading: false,
            snackbar: false,
        }
    },
    methods: {
        async connect() {
            this.loading = true;
            const meals = new Meals(this.username, this.password);
            const res = await meals.connect();
            if(res) {
                window.localStorage.meals = `${this.username};;;${this.password}`;
                meals.logout();
                this.$router.push('/');
                this.loading = false;
                return;
            }
            else {
                this.loading = false;
                this.snackbar = true;
                // console.log('Aw, snap !');
            }
        }
    }
}
</script>

<style scoped>
.loginform {
    margin: 10px;
    padding: 16px 20px;
    padding-bottom: 55px;
    /* border: 1px solid #ccc; */
    /* border-radius: 5px; */
}
.float-right {
    position: absolute;
    right: 20px;
}
</style>
