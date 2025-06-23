<style scoped>
.canvas-tile {
  width: 48px;
  height: 48px;
}
.tier-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  opacity: 0.3;
}
</style>

<template>
  <div v-if="canSee">
    <div class="d-flex justify-center ma-2">
      <currency name="gallery_inspiration" :customPercent="inspirationPercent" :customTimer="nextInspirationTime">
        <span>{{ $vuetify.lang.t(`$vuetify.gallery.nextInspiration.0`) }}</span>
        <currency-icon name="gallery_inspiration"></currency-icon>
        <span>{{ $vuetify.lang.t(`$vuetify.gallery.nextInspiration.1`) }}</span>
        <span>{{ $formatTime(nextInspirationTime) }}</span>
        <h3 class="text-center">{{ $vuetify.lang.t('$vuetify.mult.galleryInspirationBase') }}</h3>
        <stat-breakdown name="galleryInspirationBase"></stat-breakdown>
        <h3 class="text-center">{{ $vuetify.lang.t('$vuetify.mult.galleryInspirationIncrement') }}</h3>
        <stat-breakdown name="galleryInspirationIncrement"></stat-breakdown>
      </currency>
      <div v-if="$store.getters['system/checkExtraCheated']('inspirationReset')" class="d-flex align-center ml-2">
        <price-tag class="ml-1" currency="gem_sapphire" :amount="resetPrice"></price-tag>
        <v-btn color="error" class="ml-1" :disabled="isFrozen" @click="reset">重置(暂时无效)</v-btn>
      </div>
    </div>
    <div v-for="(content, tier) in ideas" :key="tier" class="d-flex flex-wrap justify-center align-center bg-tile-default rounded ma-2 pa-1 elevation-2" style="position: relative;">
      <div class="tier-progress" :class="[needPrevious(tier) ? 'error' : 'success', $vuetify.theme.dark ? 'darken-3': 'lighten-3']" :style="{height: `${needPrevious(tier) === 1 ? 50 : 100}%`}"></div>
      <idea-item v-for="(item, key) in content" :key="tier + '-' + key" class="ma-1" :name="item" :disabled="isFrozen"></idea-item>
    </div>
    <div v-if="canvasSpace.length > 0" class="d-flex flex-wrap grey mx-auto my-2 pa-2 rounded" :style="`width: ${ Math.ceil(Math.sqrt(canvasSpace.length)) * 48 + 16 }px;`">
      <div
        v-for="(item, key) in canvasSpace"
        :key="`canvas-space-${ key }`"
        class="canvas-tile"
        :class="item"
      ></div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Currency from '../../render/Currency.vue';
import CurrencyIcon from '../../render/CurrencyIcon.vue';
import StatBreakdown from '../../render/StatBreakdown.vue';
import IdeaItem from './IdeaItem.vue';
import PriceTag from '../../render/PriceTag.vue';

export default {
  components: { Currency, IdeaItem, CurrencyIcon, StatBreakdown, PriceTag },
  data: ()=>({
    resetPrice: 500
  }),
  computed: {
    ...mapState({
      isFrozen: state => state.cryolab.gallery.active,
      canvasSpace: state => state.gallery.canvasSpace
    }),
    inspirationPercent() {
      return 100 * this.$store.state.gallery.inspirationTime / this.$store.getters['gallery/inspirationTimeNeededCurrent'];
    },
    ideas() {
      let arr = [];
      for (const [key, elem] of Object.entries(this.$store.state.gallery.idea)) {
        if (elem.owned) {
          while (arr.length < elem.tier) {
            arr.push([]);
          }
          arr[elem.tier - 1].push(key);
        }
      }
      return arr;
    },
    countOfTier() {
      return this.$store.getters['gallery/countOfTier']();
    },
    canSee() {
      return this.$store.state.unlock.galleryInspiration.see;
    },
    nextInspirationTime() {
      return this.$store.getters['gallery/inspirationTimeNeeded'](this.$store.state.gallery.inspirationAmount) - this.$store.state.gallery.inspirationTime;
    }
  },
  methods: {
    needPrevious(tier) {
      return (this.countOfTier[tier] + 1) * 2 - this.countOfTier[tier - 1];
    },
    reset() {
      // if (!this.$store.getters['system/checkExtraCheated']('inspirationReset')) return;
      // // let total = 0;
      // for (const [key, elem] of Object.entries(this.$store.state.gallery.idea)) {
      //   if (elem.level > 0) {
      //     // total += elem.level;
      //     this.$store.commit('gallery/updateIdeaKey', {name: key, key: 'level', value: 0});
      //     this.$store.dispatch('gallery/applyIdeaReset', key);
      //   }
      // }
      // commit('updateKey', {key: 'inspirationTime', value: 0});
      // commit('updateKey', {key: 'inspirationAmount', value: 0});
      // // this.$store.state.currency.gallery_inspiration.value += total;
      // if (!this.$store.state.system.endmin) {
      //   this.$store.dispatch('currency/spend', { feature: 'gem', name: 'sapphire', amount: this.resetPrice });
      // }
    }
  }
}
</script>
