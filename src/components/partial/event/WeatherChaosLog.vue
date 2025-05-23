<template>
  <div class="d-flex flex-column pa-8">
    <div class="mb-2">日志（最近50条）</div>
    <div class="overflow-auto" style="height: 300px;">
      <div v-for="(log, index) in logs" :key="index">
        [ {{ $vuetify.lang.t(`$vuetify.event.weatherChaos.location.${log.location}`) }} ] 
        <template v-if="log.type==='fish'">
          <v-icon small :color="fish[log.name].color">{{ fish[log.name].icon }}</v-icon>
          {{ $vuetify.lang.t(`$vuetify.event.weatherChaos.fish.${log.name}`) }}
          ( <span :class="{'font-weight-bold':log.size>=fish[log.name].catchRecord}">{{ log.size }}</span> )
        </template>
        <template v-else-if="log.type==='trash'">
          <v-icon small :color="trashList[log.name].color">{{ trashList[log.name].icon }}</v-icon>
          {{ $vuetify.lang.t(`$vuetify.currency.event_${log.name}.name`) }} {{ $formatNum(log.amount) }}
        </template>
        <template v-else-if="log.type==='bait'">
          鱼饵：
          <v-icon small>{{ bait[log.name].icon }}</v-icon>
          {{ $vuetify.lang.t(`$vuetify.event.weatherChaos.bait.${log.name}`) }} x {{ log.amount }}
        </template>
        <template v-else-if="log.type==='rod'">
          新鱼竿： 
          <v-icon small>{{ fishingRod[log.name].icon }}</v-icon>
          {{ $vuetify.lang.t(`$vuetify.event.weatherChaos.fishingRod.${log.name}`) }}
        </template>
        <template v-else-if="log.type==='location'">
          新地点： {{ $vuetify.lang.t(`$vuetify.event.weatherChaos.location.${log.name}`) }}
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState({
      logs: (state) => state.weatherChaos.logs,
      fish: state => state.weatherChaos.fish,
      fishingRod: state => state.weatherChaos.fishingRod,
      bait: state => state.weatherChaos.bait,
      currencies: state => state.currency,
    }),
    trashList() {
      const list = {};
      ['algae', 'driftwood', 'plastic'].forEach(item => {
        list[item] = this.currencies[`event_${item}`];
      });
      return list;
    },
  },
};
</script>
