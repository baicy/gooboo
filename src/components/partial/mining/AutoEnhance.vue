<template>
  <div class="d-flex justify-center pa-2 align-center">
    <v-select :items="bars" @change="setIngredient" outlined hide-details v-model="ingredient" clearable>
      <template #item="{ item }">
        <div class="py-2">
          <v-icon :color="currency[`mining_${item}`].color">{{ currency[`mining_${item}`].icon }}</v-icon>
          <span class="ml-1">{{ $vuetify.lang.t(`$vuetify.currency.mining_${item}.name`) }}</span>
          <span class="ml-1">{{ $formatNum(currency[`mining_${item}`].value) }}</span>
          <div class="mt-1">
            <display-row
              v-for="eff in enhancementEffect[item]"
              :key="eff.name"
              class="mx-1"
              :name="eff.name"
              :type="eff.type"
              :before="eff.before"
              :after="eff.after"
            ></display-row>
          </div>
        </div>
      </template>
      <template #selection="{ item }">
        <div class="py-2">
          <div>
            <v-icon :color="currency[`mining_${item}`].color">{{ currency[`mining_${item}`].icon }}</v-icon>
            <span class="ml-1">{{ $vuetify.lang.t(`$vuetify.currency.mining_${item}.name`) }}</span>
            <span v-if="$vuetify.breakpoint.mdAndUp" class="ml-1">{{ $formatNum(currency[`mining_${item}`].value) }}</span>
          </div>
          <div v-if="$vuetify.breakpoint.mdAndUp" class="mt-1">
            <display-row
              v-for="eff in enhancementEffect[item]"
              :key="eff.name"
              class="mx-1"
              :name="eff.name"
              :type="eff.type"
              :before="eff.before"
              :after="eff.after"
            ></display-row>
          </div>
        </div>
      </template>
    </v-select>
    <div class="d-flex flex-column mx-2" style="gap: 4px">
      <price-tag currency="mining_barAluminium" :amount="enhancementBarsNeeded-enhancementBars"></price-tag>
      <price-tag  v-if="enhancementIngredient" :currency="`mining_${enhancementIngredient}`" :amount="enhancementFinalNeeded"></price-tag>
    </div>
    <v-btn color="primary" :disabled="!canEnhance" @click="applyEnhance">自动增强</v-btn>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import DisplayRow from '../upgrade/DisplayRow.vue';
import PriceTag from '../../render/PriceTag.vue';

export default {
  components: { DisplayRow, PriceTag },
  data: () => ({
    ingredient: ''
  }),
  computed: {
    ...mapState({
      enhancement: state => state.mining.enhancement,
      enhancementIngredient: state => state.mining.enhancementIngredient,
      enhancementBars: state => state.mining.enhancementBars,
      currency: state => state.currency
    }),
    ...mapGetters({
      enhancementBarsNeeded: 'mining/enhancementBarsNeeded',
      enhancementFinalNeeded: 'mining/enhancementFinalNeeded'
    }),
    bars() {
      return Object.keys(this.enhancement).filter(bar => this.$store.state.stat[`mining_${bar}`].total > 0);
    },
    enhancementEffect() {
      const effects = {};
      for (const [key, elem] of Object.entries(this.enhancement)) {
          effects[key] = elem.effect.map(eff => {
            return {...eff, before: eff.value(elem.level), after: eff.value(elem.level+1)};
          });
      }
      return effects;
    },
    canEnhance() {
      return this.enhancementIngredient && this.currency['mining_barAluminium'].value >= this.enhancementBarsNeeded && this.currency[`mining_${this.enhancementIngredient}`].value >= this.enhancementFinalNeeded;
    }
  },
  methods: {
    setIngredient(name) {
      this.$store.commit('mining/updateKey', {key: 'enhancementIngredient', value: this.enhancementIngredient === name ? null : name});
    },
    applyEnhance() {
      const bar = this.enhancementIngredient;
      // this.setIngredient('barAluminium');
      // this.$store.dispatch('mining/enhanceBars');
      this.setIngredient(bar);
      this.$store.dispatch('mining/enhanceFinal');
    }
  },
  watch: {
    enhancementIngredient: {
      immediate: true,
      handler(val) {
        this.ingredient = val;
      }
    }
  }
}
</script>
