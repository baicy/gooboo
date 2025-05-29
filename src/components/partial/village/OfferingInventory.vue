<style scoped>
.offering-inventory-mobile {
  position: sticky;
  top: 108px;
  z-index: 3;
}
</style>

<template>
  <div class="bg-tile-background" :class="{'offering-inventory-mobile':$vuetify.breakpoint.smAndDown}">
    <div class="d-flex justify-center flex-wrap ma-1">
      <currency class="ma-1" name="village_offering"></currency>
    </div>
    <div class="ma-2 mt-1">
      <v-progress-linear rounded height="24" :value="offeringGen * 100">
        <span v-if="timeLeft === null">-</span>
        <span v-else>{{ $formatTime(timeLeft) }}</span>
      </v-progress-linear>
    </div>
    <div class="ma-2 mt-1 d-flex">
      <div class="mr-2" style="width: 100px">批量购买数量</div>
      <div>
        <v-btn v-for="i in [-1, 5, 10, 100]" :key="i" color="primary" @click="changeBatch(i)" class="mr-1 mb-1" small>
          {{ i===-1 ? $vuetify.lang.t('$vuetify.gooboo.max') : `+${i}` }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Currency from '../../render/Currency.vue';

export default {
  components: { Currency },
  computed: {
    ...mapState({
      offeringGen: state => state.village.offeringGen
    }),
    timeLeft() {
      const gain = this.$store.getters['village/offeringPerSecond'];
      return gain > 0 ? Math.ceil((1 - this.offeringGen) / gain) : null;
    }
  },
  methods: {
    changeBatch(batch) {
      this.$store.commit('village/updateKey', {key: 'offeringBuyBatch', value: batch});
    }
  }
}
</script>
