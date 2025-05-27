<template>
  <div class="mt-4 d-flex align-center mx-2 justify-space-between flex-wrap" style="gap: 10px;">
    <div>
      能够1s击碎的最大深度：{{ allDepths.maxFlashBreak }}m
      <v-btn color="primary" small @click="depthFlash" :disabled="isFrozen || autoBreak.active">跳转</v-btn>
    </div>
    <v-btn color="primary" @click="showOverview = true">总览</v-btn>
    <v-dialog v-model="showOverview">
      <v-card class="default-card">
        <v-data-table
          :headers="headers"
          :items="allDepths.depths"
          fixed-header
          height="calc(60vh)"
          dense
          multi-sort
          hide-default-footer
          :items-per-page="-1"
        >
          <template #[`item.time`] = "{ item }">
            {{ $formatTime(item.time) }}
          </template>
          <template #[`item.ores`] = "{ item }">
            <v-icon v-for="ore in Object.keys(item.ores)" :key="ore" :color="currency[`mining_${ore}`].color">
              {{ currency[`mining_${ore}`].icon }}
            </v-icon>
          </template>
          <template v-for="col in ['salt', 'deeprock']" #[`item.${col}`] = "{ item }">
            <v-icon v-if="item[col]" :color="currency[`mining_${col}`].color" v-bind:key="col">
              {{ currency[`mining_${col}`].icon }}
            </v-icon>
          </template>
          <!-- <template v-for="ore in ores" #[`item.${ore}`]="{ item }">
            {{ item[ore] ? $formatNum(item[ore]) : '' }}
          </template> -->
        </v-data-table>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { MINING_DEEPROCK_DEPTH, MINING_SALT_DEPTH } from '../../../js/constants';
import { digitSum } from '../../../js/utils/math';

export default {
  data: ()=> ({
    showOverview: false,
  }),
  computed: {
    ...mapState({
      depth: state => state.mining.depth,
      subfeature: state => state.system.features.mining.currentSubfeature,
      isFrozen: state => state.cryolab.mining.active,
      autoBreak: state => state.mining.autoBreak,
      ingredients: state => state.mining.ingredient,
      currency: state => state.currency
    }),
    maxDepth() {
      return this.$store.state.stat[`mining_maxDepth${this.subfeature}`].value;
    },
    allDepths() {
      const depths = [];
      let maxFlashBreak = 0;
      for (let i = 0; i < this.maxDepth + 1; i++) {
        const d = { id: i+1 }
        d.break = this.$store.state.mining.breaks[i];
        d.time = this.$store.getters['mining/depthHitsNeeded'](i+1);
        if(d.time === 1) {
          maxFlashBreak = i+1;
        }
        const ores = this.$store.getters['mining/depthOre'](i+1);
        d.ores = ores;
        // Object.entries(ores).forEach(([ore, elem]) => {
        //   d[ore] = elem.amount * (d.time===1 ? 2 : 1);
        // });
        d.salt = (i+1 >= MINING_SALT_DEPTH && Object.keys(ores).length ===1) ? true : false;
        d.deeprock = (i+1 >= MINING_DEEPROCK_DEPTH && digitSum(i+1) >= 14) ? true : false;
        depths.unshift(d);
      }
      return { depths, maxFlashBreak };
    },
    ores() {
      return Object.entries(this.ingredients)
        .filter(([, elem]) => (elem.minDepth <= this.maxDepth + 1))
        .map(([ore]) => ore);
    },
    headers() {
      let columns = [
        {
          text: '深度',
          value: 'id',
          sortable: true,
          divider: true,
        },
        {
          text: '击碎次数',
          value: 'break',
          sortable: true,
          divider: true,
        },
        {
          text: '击碎时间',
          value: 'time',
          sortable: true,
          divider: true,
        },
      ];
      if (this.subfeature === 0) {
        columns = [...columns, {
          text: '矿石',
          value: 'ores',
          sortable: true,
          sort: (a, b) => Object.keys(a||{}).length - Object.keys(b||{}).length,
          divider: true,
        },
        {
          text: '盐',
          value: 'salt',
          sortable: true,
          divider: true,
        },

        {
          text: '深岩',
          value: 'deeprock',
          sortable: true,
          divider: true,
        }];
      }
      // this.ores.forEach(ore => {
      //   columns.push({
      //     text: this.$vuetify.lang.t(`$vuetify.currency.mining_${ore}.name`),
      //     value: ore,
      //     sortable: true,
      //     divider: true,
      //   })
      // });
      // columns = [...columns, {
      //   text: '盐',
      //   value: 'salt',
      //   sortable: true,
      //   divider: true,
      // }, {
      //   text: '深岩',
      //   value: 'deeprock',
      //   sortable: true,
      // }];
      return columns;
    }
  },
  methods: {
    resetDurability() {
      this.$store.commit('mining/updateKey', {key: 'durability', value: this.$store.getters['mining/currentDurability']});
      this.$store.dispatch('mining/applyBeaconEffects');
    },
    depthFlash() {
      this.$store.commit('mining/updateKey', {key: 'depth', value: this.allDepths.maxFlashBreak});
      this.resetDurability();
    },
  }
}
</script>
