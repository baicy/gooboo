<template>
  <div class="d-flex flex-column pa-8">
    <div class="mb-2">日志（最近50条）</div>
    <div class="overflow-auto" style="height: 300px;">
      <div v-for="log in logs" :key="log.time" value="log.time">
        [ {{ $vuetify.lang.t(`$vuetify.event.weatherChaos.location.${log.location}`) }} ] 
        <template v-if="log.type==='fish'">
          <v-icon small :color="fishList[log.name].color">{{ fishList[log.name].icon }}</v-icon>
          {{ $vuetify.lang.t(`$vuetify.event.weatherChaos.fish.${log.name}`) }}
          ( <span :class="{'font-weight-bold':log.size>=fishList[log.name].catchRecord}">{{ log.size }}</span> )
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
import { mapGetters, mapState } from "vuex";

export default {
  computed: {
    ...mapState({
      logs: (state) => state.weatherChaos.logs,
      fishingRod: state => state.weatherChaos.fishingRod,
      bait: state => state.weatherChaos.bait,
      currencies: state => state.currency,
    }),
    ...mapGetters({
      fishList: 'weatherChaos/fishList',
    }),
    trashList() {
      const list = {};
      ["algae", "driftwood", "plastic"].forEach(item => {
        list[item] = this.currencies[`event_${item}`];
      });
      return list;
    },
  },
};
</script>
