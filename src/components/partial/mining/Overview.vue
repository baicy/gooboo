<template>
  <v-card class="default-card">
    <v-data-table
      :headers="headers"
      :items="depths"
      fixed-header
      height="calc(60vh)"
      dense
      multi-sort
      hide-default-footer
      :items-per-page="-1"
    >
      <template #[`item.id`] = "{ item }">
        <span :class="{'primary--text': item.id===depth}">{{ item.id }}</span>
        <v-btn v-if="!isFrozen && !autoBreak.active && item.id <= maxDepth && item.id !== depth" x-small fab text class="ml-2" @click="depthTo(item.id)">
          <v-icon>mdi-arrow-right-bold</v-icon>
        </v-btn>
        <gb-tooltip :min-width="0" v-if="beaconPlaced[item.id]">
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on" :color="beacon[beaconPlaced[item.id]].color" class="ml-2">mdi-spotlight</v-icon>
          </template>
          <div class="mt-0">{{ $vuetify.lang.t(`$vuetify.mining.beacon.${beaconPlaced[item.id]}`) }}</div>
        </gb-tooltip>
      </template>
      <template #[`item.time`] = "{ item }">
        {{ $formatTime(item.time) }}
      </template>
      <template v-for="ore in ores" #[`item.${ore}`]="{ item }">
        {{ item[ore] ? $formatNum(item[ore]) : '' }}
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { MINING_SALT_DEPTH, MINING_DEEPROCK_DEPTH } from '../../../js/constants';
import { digitSum } from '../../../js/utils/math';

export default {
  data: ()=> ({
    depths: [],
    headers: [],
    ores: [],
  }),
  computed: {
    ...mapState({
      depth: state => state.mining.depth,
      subfeature: state => state.system.features.mining.currentSubfeature,
      isFrozen: state => state.cryolab.mining.active,
      autoBreak: state => state.mining.autoBreak,
      ingredients: state => state.mining.ingredient,
      beacon: state => state.mining.beacon,
      beaconPlaced: state => state.mining.beaconPlaced,
    }),
    ...mapGetters({
      hitsNeeded: 'mining/depthHitsNeeded',
      ore: 'mining/depthOre',
      mult: 'mult/get',
    }),
    maxDepth() {
      return this.$store.state.stat[`mining_maxDepth${this.subfeature}`].value;
    },
  },
  mounted() {
    this.getOres();
    this.getHeaders();
    this.getDepths();
  },
  methods: {
    getDepths() {
      const depths = [];
      // 重置信标效果
      let effects = [];
      for (const [key, elem] of Object.entries(this.beacon)) {
        effects.push(...elem.effect.map(el => {
          return {...el, key};
        }));
      }
      effects.forEach(effect => {
        this.$store.dispatch('system/resetEffect', {type: effect.type, name: effect.name, multKey: `miningBeacon_${ effect.key }`});
      });
      for (let i = 0; i < this.maxDepth + 1; i++) {
        const depth = i + 1;
        const beacon = this.beaconPlaced[depth];
        if (beacon) {
          this.beacon[beacon].effect.forEach(effect => {
            this.$store.dispatch('system/applyEffect', {type: effect.type, name: effect.name, multKey: `miningBeacon_${ beacon }`, value: effect.value(this.beacon[beacon].level), trigger: false});
          });
        }
        const d = { id: depth }
        d.break = this.$store.state.mining.breaks[i];
        d.time = this.hitsNeeded(depth);
        d.scrap = this.$store.getters['mining/depthScrap'](depth) * (d.time===Infinity ? 0 : (d.time + 4) / d.time);
        const ores = this.ore(depth);
        Object.entries(ores).forEach(([ore, elem]) => {
          d[ore] = elem.amount * (d.time===Infinity ? 0 : (d.time + 1) / d.time);
        });
        if (depth >= MINING_SALT_DEPTH && Object.keys(ores).length === 1) {
          d.salt = this.mult('currencyMiningSaltGain', Math.pow(1.05, depth - MINING_SALT_DEPTH) * 0.1);
        }
        if (depth >= MINING_DEEPROCK_DEPTH && digitSum(depth) >= 14) {
          d.deeprock = this.mult('currencyMiningDeeprockGain', Math.pow(1.05, depth - MINING_DEEPROCK_DEPTH) * Math.pow(1.5, digitSum(depth) - 14));
        }
        depths.unshift(d);
        if (beacon) {
          this.beacon[beacon].effect.forEach(effect => {
            this.$store.dispatch('system/resetEffect', {type: effect.type, name: effect.name, multKey: `miningBeacon_${ beacon }`});
          });
        }
      }
      // 恢复信标效果
      this.$store.dispatch('mining/applyBeaconEffects');
      this.depths = depths;
    },
    getOres() {
      this.ores =  ['scrap', ...Object.entries(this.ingredients)
      .filter(([, elem]) => (elem.minDepth <= this.maxDepth + 1))
      .map(([ore]) => ore), 'salt', 'deeprock'];
    },
    getHeaders() {
      let columns = [
        {
          text: '深度',
          value: 'id',
          sortable: true,
          divider: true,
        },
        {
          text: '次数',
          value: 'break',
          sortable: true,
          divider: true,
        },
        {
          text: '时间',
          value: 'time',
          sortable: true,
          divider: true,
        },
      ];
      if (this.subfeature === 0) {
        this.ores.forEach(ore => {
          if (!(ore==='salt' && this.maxDepth < MINING_SALT_DEPTH) && !(ore==='deeprock' && this.maxDepth < MINING_DEEPROCK_DEPTH)) {
            columns.push({
              text: this.$vuetify.lang.t(`$vuetify.currency.mining_${ore}.name`),
              value: ore,
              sortable: true,
              divider: true,
            })
          }
        });
      }
      this.headers = columns;
    },
    depthTo(depth) {
      this.$store.commit('mining/updateKey', {key: 'depth', value: depth});
      this.$store.commit('mining/updateKey', {key: 'durability', value: this.$store.getters['mining/currentDurability']});
      this.$store.dispatch('mining/applyBeaconEffects');
    }
  }
}
</script>
