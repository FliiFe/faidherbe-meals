<template>
    <div id="body">
        <meals-card></meals-card>
    </div>
</template>

<script>
import MealsCard from './views/Card.vue'

export default {
    name: 'home',
    components: {
        MealsCard
    }
}
</script>

<style>
#body {
    margin: 0 auto;
    width: 100%;
}
</style>
