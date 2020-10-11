import md5 from 'md5';
// const md5 = require('md5');
const url_faidherbe =
    'https://services.ard.fr/fr/espaces-clients/etablissements/lille-faidherbe/';
const url_api = fe_uid =>
    `https://services.ard.fr/?eID=tx_aferesa_rest_record&_dc=${Date.now()}&fe_uid=${fe_uid}`;
const hash_password = (challenge, username, password) =>
    md5(`${username}:${md5(password)}:${challenge}`);
const preq = (url, options) => new Promise((resolve, reject) => {
    window.cordova.plugin.http.sendRequest(url, options, resolve, reject)
})
const waitReady = () => new Promise((res) => document.addEventListener('deviceready', res))

export default class Meals {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }
    async connect() {
        await waitReady()
        console.log('connecting')
        window.cordova.plugin.http.clearCookies();
        // Get challenge and pid
        const [challenge, pid] = await preq(url_faidherbe + 'accueil.html')
            .then(response => response.data)
            .then(content => [
                content.match(/challenge..value..(.+). /)[1],
                content.match(/pid..value..(.+). /)[1]
            ]);
        console.log('challenge, pid =', [challenge, pid]);
        this.challenge = challenge;
        this.pid = pid;

        // Log in
        const form = new FormData();
        form.append('user', this.username);
        form.append('pass', hash_password(this.challenge, this.username, this.password));
        form.append('submit', 'VALIDER');
        form.append('logintype', 'login');
        form.append('pid', this.pid);
        form.append('challenge', this.challenge);
        form.append('redirect_url', '');

        // Get session cookie
        const loc = await preq(
            url_faidherbe + 'accueil.html',
            // 'http://192.168.42.21:5555/',
        {
            method: 'POST',
            serializer: 'multipart',
            data: form,
        })
            .then(t => t.data.includes('Identification incorrecte')) //.then(c => c.replace(/path=\/.?/g,''));
        console.log('loc', !loc);
        return !loc;
    }
    async getMeals() {
        console.log('getting meals')
        this.initialData = await preq(url_faidherbe + 'menu-utilisateur/reservation.html')
            .then(t => t.data)
            .then(text =>
                text
                    .split('\n')
                    .filter(e => e.includes('gecData'))
                    .join('')
            )
            .then(text => text.replace(/^.+var.*?=/, '').replace(/..script.$/, ''))
            .then(text => JSON.parse(text));
        // console.log('initialData', this.initialData, this)

        this._available = [];
        this.initialData.userConfig.requestableDays[0].forEach((day, dayi) =>
            day.forEach((meal, meali) => {
                if (meal[0].isBookable)
                    this._available.push({
                        chainId: '0',
                        serviceDate:
                            this.initialData.configuration.calendarStartTS +
                            24 * 60 * 60 * dayi,
                        serviceType: meali,
                        service_uid:
                            this.initialData.userConfig.services[meali].serviceUid
                    });
            })
        );
        try {
            this.money = this.initialData.displayedUser.eWalletData.amount/1e2
        } catch (e) {
            e;
        }

        this._booked = this.initialData.bookings[0]; //.map(e => e[0])
        // console.log(booked);
    }
    async book(list) {
        const reqobj = {
            data: {
                bundle_uid: 'AfeResa.model.BundleModel-1',
                creationDate: null,
                failureReason: '',
                fe_uid: this.initialData.loggedUser.uid,
                state: 0,
                requests: list.map(({ serviceDate, serviceType, service_uid, mealNumber }) => ({
                    serviceDate,
                    serviceType: serviceType.toString(),
                    id: "AfeResa.model.RequestModel-1",
                    mealNumber: mealNumber || 1,
                    servicePrice: 0,
                    service_uid,
                    chainId: 0
                }))
            }
        };

        const response = await preq(url_api(this.initialData.loggedUser.uid), {
            method: 'POST',
            serializer: 'json',
            data: reqobj
        }).then(response => response.data);

        try {
            JSON.parse(response);
            if(response.length < 2) throw "Fail" ;
            console.log("Success !");
            return true;
        } catch (e) {
            /* handle error */
            console.log("Failed ! Got no response");
            return false;
        }
    }
    async logout() {
        console.log('Logging out')
        await preq(url_faidherbe + 'accueil.html?logintype=logout')
        this._available = this._booked = '';
    }
    get available() {
        return this._available;
    }
    get booked() {
        return this._booked;
    }
}
