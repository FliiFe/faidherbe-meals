const md5 = require('md5');
const url_faidherbe =
    'https://services.ard.fr/fr/espaces-clients/etablissements/lille-faidherbe/';
const url_api = fe_uid =>
    `https://services.ard.fr/?eID=tx_aferesa_rest_record&_dc=${Date.now()}&fe_uid=${fe_uid}`;
const hash_password = (challenge, username, password) =>
    md5(`${username}:${md5(password)}:${challenge}`);

export default class Meals {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }
    async connect() {
        // Get challenge and pid
        const [challenge, pid] = await fetch(url_faidherbe + 'accueil.html', {credentials: 'include'})
            .then(content => content.text())
            .then(content => [
                content.match(/challenge..value..(.+). /)[1],
                content.match(/pid..value..(.+). /)[1]
            ]);
        // console.log('challenge, pid =', [challenge, pid]);
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
        await fetch(url_faidherbe + 'accueil.html', {
            method: 'POST',
            body: form,
            credentials: 'include'
        }).then(content => content.headers.get('Location')) //.then(c => c.replace(/path=\/.?/g,''));
        // console.log(headers)
    }
    async getMeals() {
        // debugger;
        this.initialData = await fetch(
            url_faidherbe + 'menu-utilisateur/reservation.html?no_cache=1', {credentials: 'include'}
        )
            .then(content => content.text())
            .then(text =>
                text
                    .split('\n')
                    .filter(e => e.includes('gecData'))
                    .join('')
            )
            .then(text => text.replace(/^.+var.*?=/, '').replace(/..script.$/, ''))
            .then(text => JSON.parse(text));
        // console.log(this.initialData)

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
        // console.log(available);

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
                requests: list.map(({ serviceDate, serviceType, service_uid }) => ({
                    serviceDate,
                    serviceType: serviceType.toString(),
                    id: "AfeResa.model.RequestModel-1",
                    mealNumber: 1,
                    servicePrice: 0,
                    service_uid,
                    chainId: 0
                }))
            }
        };

        const response = await fetch(url_api(this.initialData.loggedUser.uid), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Cookie: this.cookie
            },
            body: JSON.stringify(reqobj),
            credentials: 'include'
        }).then(response => response.text());

        try {
            JSON.parse(response);
            if(response.length < 2) throw "Fail" ;
            // console.log("Success !");
            return true;
        } catch (e) {
            /* handle error */
            // console.log("Failed ! Got no response");
            return false;
        }
    }
    async logout() {
        await fetch(url_faidherbe + 'accueil.html?logintype=logout', {credentials: 'include'});
        this._available = this._booked = '';
    }
    get available() {
        return this._available;
    }
    get booked() {
        return this._booked;
    }
}
