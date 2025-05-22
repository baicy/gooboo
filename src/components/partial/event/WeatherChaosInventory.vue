<template>
  <div>
    <div class="d-flex flex-wrap justify-center pa-1">
      <currency v-for="item in currencies" :key="`currency-${ item }`" class="ma-1" :name="`event_${ item }`"></currency>
    </div>
    <weather-chaos-log />
  </div>
</template>

<script>
import Currency from '../../render/Currency.vue';
import WeatherChaosLog from './WeatherChaosLog.vue';

export default {
  components: { Currency, WeatherChaosLog },
  data: () => ({
    currencies: ['cloud', 'weatherChaosToken', 'algae', 'driftwood', 'plastic', 'slime']
  }),
}
</script>
