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
      <gb-tooltip :title-text="$vuetify.lang.t('$vuetify.mult.miningSmelterySpeed')">
        <template v-slot:activator="{ on, attrs }">
          <div class="d-flex align-center ma-1" v-bind="attrs" v-on="on">
            <v-icon class="mr-1">mdi-timer</v-icon>
            <div v-if="timeNeeded >= 1">{{ $formatTime(Math.round(timeNeeded)) }}</div>
            <div v-else>{{ $formatNum(1 / timeNeeded, true) }}/s</div>
          </div>
        </template>
        <div>{{ $vuetify.lang.t('$vuetify.mining.smelterySpeedDescription', $formatTime(smeltery.timeNeeded)) }}</div>
        <stat-breakdown name="miningSmelterySpeed" :multArray="temperatureSpeedMult"></stat-breakdown>
      </gb-tooltip>
      <v-spacer></v-spacer>
      <price-tag v-for="(amount, currency) in price" :key="`price-${ currency }`" class="ma-1" :currency="currency" :amount="amount"></price-tag>
      <v-icon class="ma-1">mdi-transfer-right</v-icon>
      <price-tag class="ma-1" :currency="smeltery.output" :amount="1" add></price-tag>
      <v-spacer></v-spacer>
      <v-badge v-if="smeltery.stored + smeltery.book > 0" inline color="secondary" :content="$formatNum(smeltery.stored + smeltery.book)"></v-badge>
      <v-btn class="ma-1" small color="primary" :disabled="isFrozen" @click="showCustom">{{ $vuetify.lang.t('$vuetify.gooboo.custom') }}</v-btn>
      <v-btn class="ma-1" color="primary" :disabled="isFrozen || !canAfford" @click="buy">{{ $vuetify.lang.t('$vuetify.mining.smelt') }}</v-btn>
    </div>
    <v-progress-linear class="rounded-b" height="4" :indeterminate="isHighspeed" :value="isHighspeed ? undefined : (smeltery.progress * 100)"></v-progress-linear>
    <v-dialog :max-width="400" v-model="showSmeltCustom">
      <v-card class="default-card pa-2 pt-8">
        <v-card-text>
          <v-text-field
            v-model.number="smeltAmount"
            :label="`${displayName}(最大 ${affordAmount}/${bookAmount})`"
            type="number"
            :min="0"
            outlined
            hide-details
            dense
          ></v-text-field>
          <div class="d-flex flex-wrap align-center mt-2">
            <span>消耗：</span>
            <price-tag v-for="(amount, currency) in customPrice" :key="`price-${ currency }`" class="ma-1" :currency="currency" :amount="amount"></price-tag>
          </div>
          <div class="d-flex flex-wrap align-center mt-2">
            <span>算预定消耗：</span>
            <price-tag v-for="(amount, currency) in customPriceBooked" :key="`price-${ currency }`" class="ma-1" :currency="currency" :amount="amount"></price-tag>
          </div>
          <div class="d-flex flex-wrap mt-2">
            <span>库存：{{ statAmount }}</span>
            <v-spacer></v-spacer>
            <span>制作中：{{ smeltery.stored }}</span>
            <v-spacer></v-spacer>
            <span>预定中: {{ smeltery.book }}</span>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="warning" @click="bookCustom" :disabled="smeltAmount <= 0 || smeltAmount > bookAmount">预定</v-btn>
          <v-btn color="primary" @click="buyCustom" :disabled="smeltAmount <= 0 || smeltAmount > affordAmount">{{ $vuetify.lang.t('$vuetify.mining.smelt') }}</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="showSmeltCustom = false">{{ $vuetify.lang.t('$vuetify.gooboo.cancel') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { MINING_SMELTERY_TEMPERATURE_SPEED } from '../../../js/constants';
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
    smeltAmount: 0
  }),
  computed: {
    ...mapState({
      isFrozen: state => state.cryolab.mining.active,
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
    timeNeeded() {
      return this.$store.getters['mining/smelteryTimeNeeded'](this.name);
    },
    temperatureSpeed() {
      return MINING_SMELTERY_TEMPERATURE_SPEED * (this.$store.getters['mult/get']('miningSmelteryTemperature') - this.smeltery.minTemperature);
    },
    temperatureSpeedMult() {
      return this.temperatureSpeed > 0 ? [{name: 'miningTemperature', value: this.temperatureSpeed + 1}] : [];
    },
    isHighspeed() {
      return this.timeNeeded < 1 && this.smeltery.stored > 0;
    },
    affordAmount() {
      return this.$store.getters['mining/smelteryAffordAmount'](this.name);
    },
    statAmount() {
      return this.$store.getters['currency/value'](`mining_bar${capitalize(this.name)}`);
    },
    displayName() {
      return this.$vuetify.lang.t(`$vuetify.currency.mining_bar${capitalize(this.name)}.name`);
    },
    customPrice() {
      return this.$store.getters['mining/smelteryPrice'](this.name, this.smeltAmount);
    },
    customPriceBooked() {
      return this.$store.getters['mining/smelteryPrice'](this.name, this.smeltAmount + (this.smeltAmount > 0 ? this.smeltery.book : 0));
    },
    bookAmount() {
      return this.$store.getters['mining/smelteryBookAmount'](this.name);
    }
  },
  methods: {
    buy() {
      this.$store.dispatch('mining/addToSmeltery', {name: this.name, max: false});
    },
    showCustom() {
      this.smeltAmount = this.affordAmount;
      this.showSmeltCustom = true;
    },
    buyCustom() {
      this.$store.dispatch('mining/addToSmelteryCustom', {name: this.name, amount: this.smeltAmount});
    },
    bookCustom() {
      this.$store.commit('mining/updateSmelteryKey', {name: this.name, key: 'book', value: this.smeltery.book + this.smeltAmount});
    }
  }
}
</script>
