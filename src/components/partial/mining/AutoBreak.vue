<template>
  <v-card class="default-card px-4 py-2">
    <v-card-text class="pa-0 pt-4">
      <v-text-field
        v-model.number="start"
        :min="1"
        :max="maxDepth - 1"
        type="number"
        suffix="m"
        :label="`起始深度(1~${maxDepth - 1})`"
        dense
        outlined
        hide-details
        :disabled="autoBreak.active"
        @input="getNiter"
      ></v-text-field>
      <v-text-field
        v-model.number="end"
        :min="1"
        :max="maxDepth - 1"
        class="mt-3"
        type="number"
        suffix="m"
        :label="`目标深度(1~${maxDepth - 1}${maxFlashDepth ? `/最大1s深度${maxFlashDepth + 1}` : ''})`"
        dense
        outlined
        hide-details
        :disabled="autoBreak.active"
        @input="getNiter"
      ></v-text-field>
      <v-select
        :items="[10, 100, 1000, 10000]"
        v-model="breaks"
        class="mt-3"
        label="击碎次数"
        dense
        outlined
        hide-details
        suffix="次"
        :disabled="autoBreak.active"
        @change="getNiter"
      ></v-select>
    </v-card-text>
    <div class="d-flex justify-center my-2">
      <span>用时：{{ $formatTime(totalTime) }}</span>
      <v-divider vertical class="mx-2"></v-divider>
      <span>获得硝: {{ $formatNum(totalNiter) }}</span>
    </div>
    <v-text-field
      v-model.number="final"
      :min="1"
      :max="maxDepth"
      class="mt-3"
      type="number"
      suffix="m"
      :label="`完成/停止后前往深度(1~${maxDepth})`"
      dense
      outlined
      hide-details
      :disabled="autoBreak.active"
      ></v-text-field>
    <v-card-actions class="px-0">
      <v-btn
        :color="autoBreak.active? 'error': 'primary'"
        @click="toggleAutoBreak"
        :disabled="disabled"
      >
        {{ autoBreak.active ? '停止' : '开始' }}
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn color="error" @click="$emit('close')">{{ $vuetify.lang.t('$vuetify.gooboo.cancel') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex';
import { MINING_GRANITE_DEPTH, MINING_NITER_DEPTH } from '../../../js/constants';

export default {
  data: () => ({
    start: 1,
    end: 1,
    breaks: 10,
    final: 1,
    maxFlashDepth: 0,
    totalTime: 0,
    totalNiter: 0,
  }),
  computed: {
    ...mapState({
      subfeature: state => state.system.features.mining.currentSubfeature,
      depth: state => state.mining.depth,
      allBreaks: state => state.mining.breaks,
      autoBreak: state => state.mining.autoBreak,
      beacon: state => state.mining.beacon,
      beaconPlaced: state => state.mining.beaconPlaced,
    }),
    ...mapGetters({
      hitsNeeded: 'mining/depthHitsNeeded',
      mult: 'mult/get',
    }),
    maxDepth() {
      return this.$store.state.stat[`mining_maxDepth${this.subfeature}`].value;
    },
    disabled() {
      return !this.autoBreak.active && (!this.start || !this.end || this.start < 0 || this.start > this.maxDepth - 1 || this.end < 0 || this.end > this.maxDepth - 1 || this.start > this.end || this.final > this.maxDepth);
    }
  },
  mounted() {
    this.getMaxFlashDepth();
    this.breaks = this.autoBreak.targetBreaks || 1000;
    if (this.autoBreak.active) {
      this.start = this.autoBreak.startDepth;
    } else {
      let start = Math.max(...[1, MINING_GRANITE_DEPTH, MINING_NITER_DEPTH].filter(l => l < this.maxDepth - 1));
      while (this.allBreaks[start - 1] >= this.breaks && start <= this.maxFlashDepth) start++;
      this.start = start;
    }
    this.end = this.autoBreak.active ? this.autoBreak.endDepth : this.maxFlashDepth + 1;
    this.final = this.autoBreak.active ? this.autoBreak.finalDepth : this.depth;
    this.getNiter();
  },
  methods: {
    ...mapActions({
      toggle: 'mining/toggleAutoBreak'
    }),
    resetBeaconEffects() {
      let effects = [];
      for (const [key, elem] of Object.entries(this.beacon)) {
        effects.push(...elem.effect.map(el => {
          return {...el, key};
        }));
      }
      effects.forEach(effect => {
        this.$store.dispatch('system/resetEffect', {type: effect.type, name: effect.name, multKey: `miningBeacon_${ effect.key }`});
      });
    },
    getMaxFlashDepth() {
      let flash = 0;
      this.resetBeaconEffects();
      for (let i = 0; i < this.maxDepth - 1; i++) {
        const beacon = this.beaconPlaced[i+1];
        if (beacon) {
          this.beacon[beacon].effect.forEach(effect => {
            this.$store.dispatch('system/applyEffect', {type: effect.type, name: effect.name, multKey: `miningBeacon_${ beacon }`, value: effect.value(this.beacon[beacon].level), trigger: false});
          });
        }
        if (this.hitsNeeded(i+1) > 1) break;
        flash = i;
      }
      this.$store.dispatch('mining/applyBeaconEffects');
      this.maxFlashDepth = flash;
    },
    getNiter() {
      let neededTime = 0;
      let niter = 0;
      this.resetBeaconEffects();
      for (let i = 0; i < this.maxDepth - 1; i++) {
        const beacon = this.beaconPlaced[i+1];
        if (beacon) {
          this.beacon[beacon].effect.forEach(effect => {
            this.$store.dispatch('system/applyEffect', {type: effect.type, name: effect.name, multKey: `miningBeacon_${ beacon }`, value: effect.value(this.beacon[beacon].level), trigger: false});
          });
        }
        const breaks = this.$store.state.mining.breaks[i];
        const time = this.hitsNeeded(i+1);
        if (i >= this.start - 1 && i < this.end) {
          neededTime += (this.breaks > breaks ? (this.breaks - breaks) : 0) * time;
          const step = this.breaks > breaks? (Math.log10(this.breaks) - Math.log10(breaks)) : 0;
          const base = 100 + (i + 1 - MINING_NITER_DEPTH) * 5;
          const final = this.mult('currencyMiningNiterGain', base);
          niter += step * final;
        }
      }
      this.totalTime = neededTime;
      this.totalNiter = niter;
      this.$store.dispatch('mining/applyBeaconEffects');
    },
    toggleAutoBreak() {
      if (this.autoBreak.active) {
        this.toggle({active: false, depth: this.depth});
      } else {
        this.toggle({
          active: true,
          startDepth: this.start,
          endDepth: this.end,
          targetBreaks: this.breaks,
          finalDepth: this.final,
        });
        this.$emit('close');
      }
    }
  }
};
</script>
