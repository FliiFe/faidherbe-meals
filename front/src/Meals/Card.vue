<template>
    <div class="card">
        <div class="cart-title"><div class="googlesans card-title-text" style="display: inline-block">Repas</div>
            <v-btn flat v-if="connected" class="bookall" color="indigo" :disabled="bookingAll || booking" :loading="bookingAll" @click="bookall">
                <v-icon left>arrow_forward</v-icon>
                <!-- <p class="bottom-btn">Tout réserver</p> -->
                <div class="align-center-text">Tout réserver</div>
            </v-btn>
        </div>
        <div class="separator" v-if="connected"></div>
        <div v-if="connected" class="meals-precise-booking">
            <v-progress-circular
                indeterminate
                color="indigo"
                class="bookwait"
                v-if="fetchingAvailable"></v-progress-circular>
            <table>
                <tr v-for="day in Object.keys(availableDays)" :key="day">
                    <td class="day-cell">{{ d2h(new Date(day*1e3)) }}</td>
                    <td><v-checkbox color="indigo" :disabled="booking || bookingAll" class="checkbox" v-show="checkboxes[day].a !== undefined"
                                                                                                      v-model="checkboxes[day].a"></v-checkbox>
                    </td>
                    <td><v-checkbox color="indigo" :disabled="booking || bookingAll" class="checkbox" v-show="checkboxes[day].b !== undefined"
                                                                                                      v-model="checkboxes[day].b"></v-checkbox>
                    </td>
                </tr>
            </table>
        </div>
        <div class="separator"></div>
        <!-- Hey -->
        <!-- <div class="separator"></div> -->
        <div class="book-container">
            <v-btn flat class="book" color="indigo" :disabled="bookingAll || booking" :loading="booking" @click="bookselected">
                <!-- <v-icon left>arrow_forward</v-icon> -->
                <!-- <p class="bottom-btn">Tout réserver</p> -->
                <v-icon left v-show="!connected">arrow_forward</v-icon>
                <div class="align-center-text">{{ connected ? 'Réserver la séléction' : 'Connexion' }}</div>
            </v-btn>
        </div>
        <v-snackbar bottom v-model="snackbar" :timeout="10000">
            {{ snackMessage }}
            <v-btn flat color="white" @click="snackbar = false">Ok</v-btn>
        </v-snackbar>
    </div>
</template>

<script>
import Meals from './meals.js'
import {date2human} from '../dateutils.js'

export default {
    name: 'meal-card',
    data() {
        return {
            bookingAll: false,
            booking: false,
            connected: window.localStorage.meals.split(';;;').length >= 2,
            snackMessage: "",
            snackbar: false,
            fetchingAvailable: false,
            availableDays: {},
            checkboxes: {},
        }
    },
    methods: {
        d2h(d) {
            return date2human(d);
        },
        async bookall() {
            this.bookingAll = true;
            const meals = new Meals(...window.localStorage.meals.split(';;;'));
            const loginsuccess = await meals.connect();
            if(!loginsuccess) {
                this.booking = false;
                this.snackMessage = "Identifiants incorrects !"
                this.snackbar = true;
                return;
            }
            await meals.getMeals();
            const [available, booked] = [meals.available, meals.booked];
            const unbooked = available.filter(a => !booked.some(b => b.serviceDate == a.serviceDate));
            if(unbooked.length == 0) {
                this.snackMessage = "Tous les repas sont déjà réservés"
            } else {
                const success = await meals.book(unbooked);
                if(success) {
                    Object.keys(this.checkboxes).forEach(k => {
                        this.checkboxes[k].a = this.checkboxes[k].a !== undefined ? 1 : undefined;
                        this.checkboxes[k].b = this.checkboxes[k].b !== undefined ? 1 : undefined;
                    })
                }
                this.snackMessage = success ? "Réservation effectuée avec succès" : "Erreur lors de la réservation."
            }
            meals.logout();
            this.bookingAll = false;
            this.snackbar = true;
        },
        async bookselected() {
            if(!this.connected) {
                this.$router.push('mealslogin');
                return;
            }
            this.booking = true;
            const meals = new Meals(...window.localStorage.meals.split(';;;'));
            const loginsuccess = await meals.connect();
            if(!loginsuccess) {
                this.booking = false;
                this.snackMessage = "Identifiants incorrects !"
                this.snackbar = true;
                return;
            }
            await meals.getMeals();
            const [available, booked] = [meals.available, meals.booked];
            const list = Object.keys(this.checkboxes)
                .map(key => [
                    {serviceDate: key, meals: this.checkboxes[key].a ? 1 : 0, serviceType: 1},
                    {serviceDate: key, meals: this.checkboxes[key].b ? 1 : 0, serviceType: 2}
                ]).reduce((acc, val) => [...acc, ...val], []);
            const toBook = list.filter(el => {
                const correspondingBooking = booked.find(b => b.serviceDate - b.serviceType == el.serviceDate - el.serviceType);
                if(correspondingBooking && el.meals === 0)
                    return true;
                if(!correspondingBooking && el.meals === 1)
                    return true;
                return false;
            }).map(el => {
                return {...el, meals: el.meals ? 1 : -1}
            }).map(el => {
                const ca = available.find(a => el.serviceDate == a.serviceDate && a.serviceType == el.serviceType);
                return {...ca, mealNumber: el.meals};
            });
            if(list.length == 0) {
                this.snackMessage = "Tous les repas sont déjà réservés"
            } else {
                const success = await meals.book(toBook);
                this.snackMessage = success ? "Réservation effectuée avec succès" : "Erreur lors de la réservation."
            }
            meals.logout();
            this.booking = false;
            this.snackbar = true;
        },
        async refresh() {
            if(this.connected) {
                this.fetchingAvailable = true;
                const meals = new Meals(...window.localStorage.meals.split(';;;'));
                const loginsuccess = await meals.connect();
                if(!loginsuccess) {
                    this.snackMessage = "Identifiants incorrects !"
                    this.snackbar = true;
                    return;
                }
                await meals.getMeals();
                const [available, booked] = [meals.available || [], meals.booked || []];
                const availableDays = {};
                available.map(service => {
                    const correspondingBooking = booked.find(e =>
                        e.serviceDate == service.serviceDate
                        && e.serviceType == service.serviceType) || {}
                    service.mealNumber = correspondingBooking.mealNumber || 0;
                    if(availableDays[service.serviceDate]) availableDays[service.serviceDate].push(service);
                    else availableDays[service.serviceDate] = [service];
                });
                this.availableDays = availableDays;
                this.fetchingAvailable = false;
                Object.keys(this.availableDays).forEach(day => {
                    const avail = n => this.availableDays[day].find(e => e.serviceType == n)
                    this.checkboxes[day] = {
                        a: avail(1) ? avail(1).mealNumber : undefined,
                        b: avail(2) ? avail(2).mealNumber : undefined,
                    };
                })
                meals.logout();
            }

        }
    },
    async mounted() {
        await this.refresh();
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
    margin-bottom: 3px;
    margin-top: 3px;
    font-size: 17px;
    width: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.card-title-text {
    padding-bottom: 12px;
    padding-top: 12px;
}

.bookwait {
    display: block;
    margin: 10px auto;
}

.align-center-text {
    margin-bottom: -2px;
}

table {
    width: 100%;
    padding: 10px;
    padding-left: 20px;
}

.checkbox {
    display: inline-block;
    height: 15px;
}

td, th {
    text-align: center;
}

.day-cell {
    text-align: left;
}

.bookall {
    display: inline-block;
}

.book-container {
    display: flex;
}
</style>
