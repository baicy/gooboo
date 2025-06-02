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
    <v-divider></v-divider>
    <v-card-actions class="px-0">
      <v-btn
        :color="autoBreak.active? 'error': 'primary'"
        @click="toggleAutoBreak"
        :disabled="!start || !end ||start < 0 || start > maxDepth - 1 || end < 0 || end > maxDepth - 1 || start > end"
      >
        {{ autoBreak.active ? '停止' : '开始' }}
      </v-btn>
      <v-checkbox v-if="autoBreak.active" label="停留在当前深度" v-model="stayCurrent" class="ml-1"></v-checkbox>
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
    maxFlashDepth: 0,
    totalTime: 0,
    totalNiter: 0,
    stayCurrent: false,
  }),
  computed: {
    ...mapState({
      subfeature: state => state.system.features.mining.currentSubfeature,
      depth: state => state.mining.depth,
      autoBreak: state => state.mining.autoBreak,
    }),
    ...mapGetters({
      hitsNeeded: 'mining/depthHitsNeeded',
      mult: 'mult/get',
    }),
    maxDepth() {
      return this.$store.state.stat[`mining_maxDepth${this.subfeature}`].value;
    },
  },
  mounted() {
    this.getMaxFlashDepth();
    this.start = this.autoBreak.startDepth || Math.max(...[1, MINING_GRANITE_DEPTH, MINING_NITER_DEPTH].filter(l => l < this.maxDepth-1));
    this.end = this.autoBreak.finalDepth || this.maxFlashDepth + 1;
    this.breaks = this.autoBreak.targetBreaks || 1000;
    this.getNiter();
  },
  methods: {
    ...mapActions({
      toggle: 'mining/toggleAutoBreak'
    }),
    getMaxFlashDepth() {
      let flash = 0;
      for (let i = 0; i < this.maxDepth - 1; i++) {
        if (this.hitsNeeded(i+1) > 1) break;
        flash = i;
      }
      this.maxFlashDepth = flash;
    },
    getNiter() {
      let neededTime = 0;
      let niter = 0;
      for (let i = 0; i < this.maxDepth - 1; i++) {
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
    },
    toggleAutoBreak() {
      if (this.autoBreak.active) {
        this.toggle({active: false, depth: this.depth, stay: this.stayCurrent});
      } else {
        this.toggle({
          active: true,
          startDepth: this.start,
          endDepth: this.end,
          targetBreaks: this.breaks,
        });
        this.$emit('close');
      }
    }
  }
};
</script>
