<template>
    <div class="loginform">
        <v-text-field
            v-model="username"
            label="Identifiant"
            hint="Identifiant du site de réservation de repas"
            required outlined></v-text-field>
        <v-text-field
            v-model="password"
            label="Mot de passe"
            :type="show ? 'text' : 'password'"
            :append-icon="show ? 'visibility_off' : 'visibility'"
            @click:append="show = !show"
            required outlined></v-text-field>
        <v-btn large color="indigo" text class="float-right" @click="connect" :loading="loading" :disabled="username.length <= 5 || password.length <= 5">Connexion</v-btn>
        <v-snackbar bottom v-model="snackbar" :timeout="10000">
            Identifiant ou mot de passe incorrect
            <template v-slot:action="{ attrs }">
                <v-btn color="white" text v-bind="attrs" @click="snackbar = false">
                    Ok
                </v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<script>
import Meals from '../utils/meals.js';

export default {
    name: 'meals-login',
    data() {
        return {
            username: '',
            password: '',
            loading: false,
            snackbar: false,
            show: false,
        }
    },
    methods: {
        async connect() {
            this.loading = true;
            const meals = new Meals(this.username, this.password);
            const res = await meals.connect();
            if(res) {
                window.localStorage.meals = `${this.username};;;${this.password}`;
                await meals.logout();
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
