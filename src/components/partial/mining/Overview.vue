<template>
  <v-card class="default-card pt-4">
    <v-card-text>
      <div class="d-flex align-center">
        <v-text-field type="number"
          v-model.number="selectedDepth"
          label="深度"
          suffix="m"
          outlined
          hide-details
          dense
          @input="getDepths"
        >
        </v-text-field>
        <span class="ml-2 text-right" style="min-width: 70px">{{ depth }} / {{ maxDepth }}</span>
      </div>
      <v-row no-gutters class="mt-2">
        <v-col cols="12" :md="4">
          <v-select label="排序" hide-details dense outlined clearable :items="filterBy.length ? filterBy : loots" v-model="sortBy">
            <template #item="{ item }">
              <v-chip
                label small
                class="ma-1 balloon-text-dynamic"
                :class="$vuetify.theme.dark ? 'theme--dark darken-3' : 'theme--light lighten-3'"
                :color="currency[`mining_${item}`].color"
              >
                <v-icon class="mr-1">{{ currency[`mining_${item}`].icon }}</v-icon>
                {{ $vuetify.lang.t(`$vuetify.currency.mining_${item}.name`) }}
              </v-chip>
            </template>
            <template #selection="{ item }">
              <gb-tooltip :min-width="0">
                <template v-slot:activator="{ on, attrs }">
                  <v-chip
                    v-bind="attrs" v-on="on"
                    label small
                    class="ma-1 px-2 balloon-text-dynamic"
                    :class="$vuetify.theme.dark ? 'theme--dark darken-3' : 'theme--light lighten-3'"
                    :color="currency[`mining_${item}`].color"
                  >
                    <v-icon>{{ currency[`mining_${item}`].icon }}</v-icon>
                  </v-chip>
                </template>
                <div class="mt-0">{{ $vuetify.lang.t(`$vuetify.currency.mining_${item}.name`) }}</div>
              </gb-tooltip>
            </template>
          </v-select>
        </v-col>
        <v-col cols="12" md="8" :class="$vuetify.breakpoint.mdAndUp ? 'pl-1' : 'pt-1'">
          <v-select label="筛选" hide-details dense outlined clearable :items="loots" multiple v-model="filterBy" @change="resetFilterBy">
            <template #item="{ item }">
              <v-chip
                label small
                class="ma-1 balloon-text-dynamic"
                :class="$vuetify.theme.dark ? 'darken-2' : 'lighten-2'"
                :color="currency[`mining_${item}`].color"
              >
                <v-icon class="mr-1">{{ currency[`mining_${item}`].icon }}</v-icon>
                {{ $vuetify.lang.t(`$vuetify.currency.mining_${item}.name`) }}
              </v-chip>
            </template>
            <template #selection="{ item }">
              <gb-tooltip :min-width="0">
                <template v-slot:activator="{ on, attrs }">
                  <v-chip
                    v-bind="attrs" v-on="on"
                    label small
                    class="ma-1 px-2 balloon-text-dynamic"
                    :class="$vuetify.theme.dark ? 'theme--dark darken-3' : 'theme--light lighten-3'"
                    :color="currency[`mining_${item}`].color"
                  >
                    <v-icon>{{ currency[`mining_${item}`].icon }}</v-icon>
                  </v-chip>
                </template>
                <div class="mt-0">{{ $vuetify.lang.t(`$vuetify.currency.mining_${item}.name`) }}</div>
              </gb-tooltip>
            </template>
          </v-select>
        </v-col>
      </v-row>
      <v-row no-gutters class="mt-1">
        <v-col cols="12" v-for="item in finalDepths" :key="item.id" :class="{'selected-primary': item.id === depth}">
          <v-card>
            <v-card-text>
              <v-row no-gutters>
                <v-col cols="4">
                  <span>{{ item.id }}</span>
                  <gb-tooltip :min-width="0" v-if="beaconPlaced[item.id]">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon v-bind="attrs" v-on="on" :color="beacon[beaconPlaced[item.id]].color" class="ml-1">mdi-spotlight</v-icon>
                    </template>
                    <div class="mt-0">{{ $vuetify.lang.t(`$vuetify.mining.beacon.${beaconPlaced[item.id]}`) }}</div>
                  </gb-tooltip>
                </v-col>
                <v-col cols="4">
                  <v-icon small>mdi-timer</v-icon>
                  <span>{{ $formatTime(item.time) }}</span>
                </v-col>
                <v-col cols="4" class="text-right">
                  <span>x {{ item.break || 0 }}</span>
                  <v-btn small icon v-if="!isFrozen && !autoBreak.active && item.id <= maxDepth && item.id !== depth" @click="depthTo(item.id)"><v-icon>mdi-arrow-right-bold</v-icon></v-btn>
                </v-col>
              </v-row>
              <template v-for="loot in loots">
                <gb-tooltip :min-width="0" v-if="item[loot]" :key="loot">
                  <template v-slot:activator="{ on, attrs }">
                    <v-chip
                      v-bind="attrs" v-on="on"
                      label small
                      class="ma-1 balloon-text-dynamic"
                      :class="$vuetify.theme.dark ? 'theme--dark darken-3' : 'theme--light lighten-3'"
                      :color="currency[`mining_${loot}`].color"
                    >
                      <v-icon>{{ currency[`mining_${loot}`].icon }}</v-icon>
                      <span class="ml-1">{{ $formatNum(item[loot]) }}/s</span>
                    </v-chip>
                  </template>
                  <div class="mt-0">{{ $vuetify.lang.t(`$vuetify.currency.mining_${loot}.name`) }}</div>
                </gb-tooltip>
              </template>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { MINING_SCRAP_BREAK, MINING_SALT_DEPTH, MINING_DEEPROCK_DEPTH, MINING_OBSIDIAN_DEPTH } from '../../../js/constants';
import { digitSum } from '../../../js/utils/math';

// For Mods
import { MINING_MOONSHARD_DEPTH, MINING_PHOSPHORUS_DEPTH } from '../../../js/constants';
import { isPrime } from '../../../js/utils/math';

export default {
  data: ()=> ({
    depths: [],
    headers: [],
    ores: [],
    loots: [],
    selectedDepth: 0,
    sortBy: '',
    filters: [],
    filterBy: []
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
      currency: state => state.currency
    }),
    ...mapGetters({
      hitsNeeded: 'mining/depthHitsNeeded',
      ore: 'mining/depthOre',
      mult: 'mult/get',
    }),
    maxDepth() {
      return this.$store.state.stat[`mining_maxDepth${this.subfeature}`].value;
    },
    finalDepths() {
      if (!this.sortBy && !this.filterBy.length) {
        return this.depths.slice(Math.max(this.selectedDepth - 2, 0), this.selectedDepth + 1).sort((a, b) => b.id - a.id);
      }
      let depths = [...this.depths];
      if (this.filterBy.length) {
        depths = depths.filter(v => {
          for (let i of this.filterBy) {
            if (!v[i]) return false;
          }
          return true;
        }).sort((a, b) => b.id - a.id);
      }
      if (this.sortBy) {
        depths = depths.filter(v => v.id < this.maxDepth + 1 && v[this.sortBy]).sort((a, b) => b[this.sortBy] - a[this.sortBy]);
      }
      return depths.slice(0, 3);
    }
  },
  mounted() {
    this.selectedDepth = this.depth;
    this.getFilters();
    this.getLoots();
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
      for (let i = 0; i < Math.max(this.maxDepth, this.selectedDepth + 1); i++) {
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
        d.scrap = this.$store.getters['mining/depthScrap'](depth) * (d.time === Infinity ? 0 : (d.time + MINING_SCRAP_BREAK) / d.time);
        if (this.subfeature === 0) {
          const ores = this.ore(depth);
          Object.entries(ores).forEach(([ore, elem]) => {
            d[ore] = elem.amount * (d.time === Infinity ? 0 : (d.time + 1) / d.time);
          });
          if (depth >= MINING_SALT_DEPTH && Object.keys(ores).length === 1) {
            d.salt = this.getRareEarth('salt', depth, d.time);
          }
          if (depth >= MINING_DEEPROCK_DEPTH && digitSum(depth) >= 14) {
            d.deeprock = this.getRareEarth('deeprock', depth, d.time);
          }
          if (depth >= MINING_OBSIDIAN_DEPTH && (this.$store.getters['mining/enhancementLevel'] <= 0 || !this.$store.state.mining.enhancementsActive)) {
            d.obsidian = this.getRareEarth('obsidian', depth, d.time);
          }
        }
        if (this.subfeature === 1) {
          const smoke = this.$store.getters['mining/depthSmoke'](depth);
          if (smoke) d.smoke = smoke;
          if (isPrime(depth)) {
            d.limestone = this.getRareEarth('limestone', depth, d.time);
          }
          if (depth >= MINING_MOONSHARD_DEPTH && this.$store.state.stat.mining_depthDwellerCap1.value >= depth) {
            d.moonshard = this.getRareEarth('moonshard', depth, d.time);
          }
          if (depth >= MINING_PHOSPHORUS_DEPTH && (depth % 25 === 0)) {
            d.phosphorus = this.getRareEarth('phosphorus', depth, d.time);
          }
        }
        depths.push(d);
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
    getRareEarth(name, depth, time) {
      let amount = 0;
      switch (name) {
        case 'salt':
          amount = this.mult('currencyMiningSaltGain', Math.pow(1.05, depth - MINING_SALT_DEPTH) * 0.1);
          break;
        case 'deeprock':
          amount = this.mult('currencyMiningDeeprockGain', Math.pow(1.05, depth - MINING_DEEPROCK_DEPTH) * Math.pow(1.5, digitSum(depth) - 14));
          break;
        case 'obsidian':
          amount = this.mult('currencyMiningObsidianGain', Math.pow(1.05, depth - MINING_OBSIDIAN_DEPTH));
          break;
        case 'limestone':
          amount = this.mult('currencyMiningLimestoneGain', Math.pow(1.1, depth) * 0.001);
          break;
        case 'moonshard':
          amount = this.mult('currencyMiningMoonshardGain', Math.pow(1.35, depth - MINING_MOONSHARD_DEPTH) * 0.00001);
          break;
        case 'phosphorus':
          amount = this.mult('currencyMiningPhosphorusGain', Math.pow(5, (depth - MINING_PHOSPHORUS_DEPTH) / 25) * 0.000001);
          break;
      }
      return amount * (time === Infinity ? 0 : (time + 1) / time);
    },
    getFilters() {
      let filters = [];
      if (this.subfeature === 0) {
        filters = [...Object.entries(this.ingredients)
        .filter(([, elem]) => (elem.minDepth <= this.maxDepth + 1))
        .map(([ore]) => ore)];
      }
      this.filters = filters;
    },
    getLoots() {
      let loots = ['scrap'];
      loots = [...loots, ...this.filters];
      if (this.subfeature === 0) {
        if (this.maxDepth >= MINING_SALT_DEPTH) {
          loots.push('salt');
        }
        if (this.maxDepth >= MINING_DEEPROCK_DEPTH) {
          loots.push('deeprock');
        }
        if (this.maxDepth >= MINING_OBSIDIAN_DEPTH && (this.$store.getters['mining/enhancementLevel'] <= 0 || !this.$store.state.mining.enhancementsActive)) {
          loots.push('obsidian');
        }
      }
      if (this.subfeature === 1) {
        if(this.maxDepth >=2) {
          loots.push('limestone');
        }
        if (this.maxDepth >= 25) {
          loots.push('smoke');
        }
        if (this.maxDepth >= MINING_MOONSHARD_DEPTH) {
          loots.push('moonshard');
        }
        if (this.maxDepth >= MINING_PHOSPHORUS_DEPTH) {
          loots.push('phosphorus');
        }
      }
      this.loots = loots;
    },
    depthTo(depth) {
      this.$store.commit('mining/updateKey', {key: 'depth', value: depth});
      this.$store.commit('mining/updateKey', {key: 'durability', value: this.$store.getters['mining/currentDurability']});
      this.$store.dispatch('mining/applyBeaconEffects');
    },
    resetFilterBy() {
      if (!this.filterBy.includes(this.sortBy)) {
        this.sortBy = '';
      }
    }
  }
}
</script>
