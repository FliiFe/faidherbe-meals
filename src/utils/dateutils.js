export function date2human(date) {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[date.getDay()] // + ' ' + date.getDate() + '/' + date.getMonth();
}
