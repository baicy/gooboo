<style scoped>
.currency-border {
  width: 100%;
  border: 2px solid white;
}
.currency-text {
  z-index: 1;
  line-height: 1;
}
.currency-container {
  position: relative;
  height: 44px;
}
</style>

<template>
  <gb-tooltip :title-text="$vuetify.lang.t('$vuetify.globalLevel.name')">
    <template #activator="{ attrs, on}">
      <div
        v-bind="attrs"
        v-on="on"
        class="currency-container rounded d-flex flex-nowrap align-center pa-2 ma-2"
        :class="[beauty.color, {
          'darken-2': $vuetify.theme.dark
        }]"
      >
        <v-icon color="white" class="mr-2">{{ beauty.icon }}</v-icon>
        <div class="currency-border rounded mt-1 mb-1">
          <v-progress-linear
            :background-color="beauty.color + ($vuetify.theme.dark ? ' darken-4' : ' darken-2')"
            :color="beauty.color + ($vuetify.theme.dark ? '' : ' lighten-2')"
            :value="percent"
            :height="24"
            style="overflow: visible;"
          >
            <span class="balloon-text-dynamic currency-text text-center">
              {{ $vuetify.lang.t('$vuetify.gooboo.level') }}  {{ level }} ( {{ $formatNum(percent, true) }}% / {{ $formatTime(timeNeeded) }} )
            </span>
          </v-progress-linear>
        </div>
      </div>
    </template>
    <div>
      <div class="d-flex">
        <span>当前等级：</span>
        <v-spacer></v-spacer>
        <span>{{ level }}</span>
      </div>
      <div class="d-flex">
        <span>总计美丽：</span>
        <v-spacer></v-spacer>
        <span>{{ $formatNum(amount) }}</span>
      </div>
      <div class="d-flex">
        <span>下级所需：</span>
        <v-spacer></v-spacer>
        <span>{{ $formatNum(nextAmount) }}</span>
      </div>
      <div class="d-flex">
        <span>美丽增益：</span>
        <v-spacer></v-spacer>
        <span>{{ $formatNum(gain) }}/s</span>
      </div>
      <div class="d-flex">
        <span>升级时间：</span>
        <v-spacer></v-spacer>
        <span>{{ $formatTime(timeNeeded) }}</span>
      </div>
    </div>
  </gb-tooltip>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState({
      amount: state => state.stat.gallery_beauty.total,
      level: state => state.meta.globalLevelParts.gallery_0
    }),
    beauty() {
      return this.$store.state.currency['gallery_beauty'];
    },
    nextAmount() {
      return Math.exp((this.level + 1) * Math.log(4));
    },
    percent() {
      return 100 * this.amount / this.nextAmount;
    },
    gain() {
      return this.$store.getters['mult/get']('currencyGalleryBeautyGain');
    },
    timeNeeded() {
      return Math.ceil((this.nextAmount - this.amount) / this.gain);
    }
  }
}
</script>
