<template>
  <div>
    <v-menu top offset-y :close-on-content-click="false">
      <template v-slot:activator="{ on, attrs }">
        <v-btn text v-bind="attrs" v-on="on">
          <weather-chaos-log-item v-if="logs.length" :log="logs[0]" />
          <v-icon right>mdi-menu-up</v-icon>
        </v-btn>
      </template>
      <v-sheet class="d-flex flex-column pa-8">
        <div class="mb-2">日志（最近50条）</div>
        <div class="overflow-auto" style="height: 240px;">
          <weather-chaos-log-item v-for="(log, index) in logs" :key="index" :log="log" />
        </div>
      </v-sheet>
    </v-menu>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import WeatherChaosLogItem from './WeatherChaosLogItem.vue';

export default {
  components: { WeatherChaosLogItem },
  comments: {
    WeatherChaosLogItem,
  },
  computed: {
    ...mapState({
      logs: (state) => state.weatherChaos.logs,
    }),
  },
};
</script>
