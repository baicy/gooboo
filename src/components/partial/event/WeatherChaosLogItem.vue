<template>
  <div>
    [ {{ logTime }} ]
    [ {{ $vuetify.lang.t(`$vuetify.event.weatherChaos.location.${log.location}`) }} ] 
    <template v-if="log.type==='fish'">
      <v-icon small :color="fish[log.name].color">{{ fish[log.name].icon }}</v-icon>
      {{ $vuetify.lang.t(`$vuetify.event.weatherChaos.fish.${log.name}`) }}
      ( <span :class="{'success--text':log.size>=fish[log.name].catchRecord}">{{ log.size }}</span> )
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
</template>

<script>
import { mapState } from 'vuex';

export default {
  props: {
    log: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState({
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
    logTime() {
      const time = new Date(this.log.time);
      const month = (time.getMonth() + 1).toString().padStart(2, '0');
      const day = time.getDate().toString().padStart(2, '0');
      const hour = time.getHours().toString().padStart(2, '0');
      const minute = time.getMinutes().toString().padStart(2, '0');
      const second = time.getSeconds().toString().padStart(2, '0');
      return `${ month }-${ day } ${ hour }:${ minute }:${ second }`;
    }
  },
};
</script>
