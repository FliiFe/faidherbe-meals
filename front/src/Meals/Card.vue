<template>
    <div class="card">
        <p class="cart-title googlesans">Repas</p>
        <div class="separator"></div>
        <!-- Hey -->
        <!-- <div class="separator"></div> -->
        <v-btn flat color="indigo" :loading="booking" @click="domeals">
            <v-icon left>arrow_forward</v-icon>
            <!-- <p class="bottom-btn">Tout réserver</p> -->
            <div class="align-center-text">{{ connected ? 'Tout réserver' : 'Connexion' }}</div>
        </v-btn>
    </div>
</template>

<script>
import Meals from './meals.js'

export default {
    name: 'meal-card',
    data() {
        return {
            booking: false,
            connected: window.localStorage.meals.split(';;;').length >= 2
        }
    },
    methods: {
        async domeals() {
            if(!this.connected) {
                this.$router.push('mealslogin')
                return;
            }
            this.booking = true;
            const meals = new Meals(...window.localStorage.meals.split(';;;'));
            const loginsuccess = await meals.connect();
            if(!loginsuccess) {
                this.booking = false;
                // console.log('Failed to log in');
                return;
            }
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

<style scoped>
.card {
    width: calc(100% - 20px);
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-left: 10px;
    margin-right: 10px;
}

.separator {
    width: 100%;
    border-bottom: 1px solid #ccc;
    padding: 0;
    margin: 0;
}

.cart-title {
    margin-left: 16px;
    margin-top: 10px;
    font-size: 17px;
    margin-bottom: 8px;
}

.align-center-text {
    margin-bottom: -2px;
}
</style>
