<template>
  <div class="bg-tile-default rounded elevation-2 ma-2">
    <div class="d-flex align-center flex-wrap pa-1">
      <gb-tooltip :title-text="$vuetify.lang.t('$vuetify.mult.miningSmelteryTemperature')">
        <template v-slot:activator="{ on, attrs }">
          <div class="d-flex align-center ma-1 mr-5" v-bind="attrs" v-on="on">
            <v-icon>mdi-thermometer</v-icon>
            <div>{{ $formatNum(smeltery.minTemperature, true) }}°C</div>
          </div>
        </template>
        <div>{{ $vuetify.lang.t('$vuetify.mining.smelteryTemperatureDescription2', $formatNum(temperatureSpeed * 100, true)) }}</div>
      </gb-tooltip>
      <gb-tooltip :title-text="$vuetify.lang.t('$vuetify.mult.miningSmelteryTime')">
        <template v-slot:activator="{ on, attrs }">
          <div class="d-flex align-center ma-1" v-bind="attrs" v-on="on">
            <v-icon class="mr-1">mdi-timer</v-icon>
            <div>{{ $formatTime(timeNeeded, 'ms') }}</div>
          </div>
        </template>
        <stat-breakdown name="miningSmelteryTime" :base="baseTimeNeeded" :multArray="temperatureSpeedMult"></stat-breakdown>
      </gb-tooltip>
      <v-spacer></v-spacer>
      <price-tag v-for="(amount, currency) in price" :key="`price-${ currency }`" class="ma-1" :currency="currency" :amount="amount" :is-spent="!smelteryNotSpent.includes(currency)"></price-tag>
      <v-icon class="ma-1">mdi-transfer-right</v-icon>
      <price-tag class="ma-1" :currency="smeltery.output" :amount="1" add></price-tag>
      <v-spacer></v-spacer>
      <v-badge v-if="smeltery.stored + smeltery.book > 0" inline color="secondary" :content="$formatNum(smeltery.stored + smeltery.book)"></v-badge>
      <v-btn class="ma-1" small color="primary" :disabled="isFrozen" @click="showCustom">{{ $vuetify.lang.t('$vuetify.gooboo.custom') }}</v-btn>
      <v-btn class="ma-1" color="primary" :disabled="isFrozen || !canAfford || isBooked" @click="buy">{{ $vuetify.lang.t('$vuetify.mining.smelt') }}</v-btn>
    </div>
    <v-progress-linear class="rounded-b" height="4" :indeterminate="isHighspeed" :value="isHighspeed ? undefined : (smeltery.progress * 100)"></v-progress-linear>
    <v-dialog :max-width="400" v-model="showSmeltCustom">
      <v-card class="default-card pa-2 pt-8">
        <v-card-text>
          <v-text-field
            v-model.number="smeltAmount"
            :label="`${displayName}(最大 ${affordAmount}/${bookAmount}可预定)`"
            type="number"
            :min="0"
            outlined
            hide-details
            dense
          ></v-text-field>
          <div class="d-flex flex-wrap align-center mt-2">
            <span>消耗：</span>
            <price-tag v-for="(amount, currency) in customPriceBooked" :key="`price-${ currency }`" class="ma-1" :currency="currency" :amount="amount"></price-tag>
          </div>
          <div class="d-flex flex-wrap mt-2">
            <span>用时：</span>
            <span>{{ $formatTime(smeltAmount * timeNeeded) }}</span>
          </div>
          <div class="d-flex flex-wrap mt-2">
            <span>已制作：{{ smeltery.total }}</span>
            <v-spacer></v-spacer>
            <span>制作中：{{ smeltery.stored }} ({{ $formatTime(smeltery.stored * timeNeeded) }})</span>
          </div>
           <div class="d-flex flex-wrap align-center mt-2" style="gap: 4px">
            <span class="mr-3">预定中: {{ smeltery.book }}</span>
            <v-btn small :color="smeltery.booking ? 'success' : 'error'" @click="bookPause">{{ smeltery.booking ? '运行' : '暂停' }}中</v-btn>
            <v-spacer></v-spacer>
            <div v-if="smeltery.book > 0" class="d-flex align-center">
              <v-text-field
                v-model.number="cancelBookAmount"
                label="取消预定数量"
                type="number"
                :min="0"
                outlined
                hide-details
                dense
                style="width: 100px;"
              ></v-text-field>
              <v-btn small color="error" class="ml-1" @click="bookCancel">{{ $vuetify.lang.t('$vuetify.gooboo.cancel') }}</v-btn>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="buyMax" :disabled="isFrozen || !canAfford">{{ $vuetify.lang.t('$vuetify.gooboo.max') }}</v-btn>
          <v-btn color="primary" @click="bookCustom" :disabled="smeltAmount <= 0">{{ $vuetify.lang.t('$vuetify.mining.smeltBook') }}</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="showSmeltCustom = false">{{ $vuetify.lang.t('$vuetify.gooboo.cancel') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { MINING_SMELTERY_TEMPERATURE_SPEED, MINING_SMELTERY_TIME_INCREMENT } from '../../../js/constants';
import PriceTag from '../../render/PriceTag.vue';
import StatBreakdown from '../../render/StatBreakdown.vue';
import { capitalize } from '../../../js/utils/format';

export default {
  components: { PriceTag, StatBreakdown },
  props: {
    name: {
      type: String,
      required: true
    }
  },
  data: () => ({
    showSmeltCustom: false,
    smeltAmount: 0,
    cancelBookAmount: 0
  }),
  computed: {
    ...mapState({
      isFrozen: state => state.cryolab.mining.active,
      smelteryNotSpent: state => state.mining.smelteryNotSpent,
    }),
    smeltery() {
      return this.$store.state.mining.smeltery[this.name];
    },
    price() {
      return this.$store.getters['mining/smelteryPrice'](this.name);
    },
    canAfford() {
      return this.$store.getters['currency/canAfford'](this.price, this.price);
    },
    isBooked(){
      return this.smeltery.book;
    },
    baseTimeNeeded() {
      return this.smeltery.timeNeeded * Math.pow(MINING_SMELTERY_TIME_INCREMENT, this.smeltery.total);
    },
    timeNeeded() {
      return this.$store.getters['mining/smelteryTimeNeeded'](this.name) * Math.pow(MINING_SMELTERY_TIME_INCREMENT, this.smeltery.stored);
    },
    temperatureSpeed() {
      return MINING_SMELTERY_TEMPERATURE_SPEED * (this.$store.getters['mult/get']('miningSmelteryTemperature') - this.smeltery.minTemperature);
    },
    temperatureSpeedMult() {
      return this.temperatureSpeed > 0 ? [{name: 'miningTemperature', value: 1 / (this.temperatureSpeed + 1)}] : [];
    },
    isHighspeed() {
      return this.timeNeeded < 1 && this.smeltery.stored > 0;
    },
    affordAmount() {
      return this.$store.getters['mining/smelteryAffordAmount'](this.name);
    },
    displayName() {
      return this.$vuetify.lang.t(`$vuetify.currency.mining_bar${capitalize(this.name)}.name`);
    },
    customPriceBooked() {
      return this.$store.getters['mining/smelteryPriceBookAmount'](this.name, this.smeltAmount + this.smeltery.book);
    },
    bookAmount() {
      return this.$store.getters['mining/smelteryBookAmount'](this.name);
    }
  },
  methods: {
    buy() {
      this.$store.dispatch('mining/addToSmeltery', {name: this.name, max: false});
    },
    buyMax() {
      this.$store.dispatch('mining/addToSmeltery', {name: this.name, max: true});
    },
    showCustom() {
      this.smeltAmount = this.affordAmount;
      this.showSmeltCustom = true;
    },
    bookCustom() {
      const amount = Math.min(this.smeltAmount, this.affordAmount);
      this.$store.dispatch('mining/addToSmelteryCustom', {name: this.name, amount});
      const remain = this.smeltAmount - amount;
      if (remain > 0) {
        this.$store.commit('mining/updateSmelteryKey', {name: this.name, key: 'book', value: this.smeltery.book + remain});
      }
    },
    bookPause() {
      const booking = this.smeltery.booking;
      this.$store.commit('mining/updateSmelteryKey', {name: this.name, key: 'booking', value: !booking});
    },
    bookCancel() {
      const bookAmount = this.smeltery.book;
      this.$store.commit('mining/updateSmelteryKey', {name: this.name, key: 'book', value: Math.max(0, bookAmount - this.cancelBookAmount)});
    }
  }
}
</script>
