<template>
  <div>
    <div class="d-flex flex-wrap justify-center ma-1">
      <v-card>
        <v-card-text class="d-flex">
          <v-row>
            <v-col cols="12" md="6">
              <div v-for="item in predicateHarvest.exp" :key="item.name">
                <v-icon :color="crop[item.name].color">{{ crop[item.name].icon }}</v-icon>
                {{ $vuetify.lang.t(`$vuetify.farm.crop.${item.name}`) }}:
                {{ item.leveled ? item.before : $formatNum(item.before, true)+'%' }} -> 
                {{ item.leveled ? item.after : $formatNum(item.after, true)+'%' }}
              </div>
            </v-col>
            <v-col cols="12" md="6" class="d-flex flex-wrap align-start">
              <price-tag
                v-for="item in predicateHarvest.gain"
                :key="item.name"
                add
                :currency="item.name"
                :amount="item.amount"
                class="ma-1"
              ></price-tag>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { capitalize } from '../../../js/utils/format';
import { chance, randomRound } from '../../../js/utils/random';
import PriceTag from '../../render/PriceTag.vue';

export default {
  components: { PriceTag },
  computed: {
    ...mapState({
      selectedColor: state => state.farm.selectedColor,
      crop: state => state.farm.crop,
    }),
    ...mapGetters({
      mult: 'mult/get'
    }),
    predicateHarvest() {
      let harvested = [];
      this.$store.state.farm.field.forEach(row => {
        row.forEach(cell => {
          harvested.push(cell)
        });
      });
      harvested = harvested.filter(cell => cell && cell.type==='crop' && cell.grow >= 1 && (!this.selectedColor || cell.color === this.selectedColor));

      const gain = {farm_vegetable: 0, farm_berry: 0, farm_grain: 0, farm_flower: 0, farm_gold: 0};
      const exp = {};
      harvested.forEach(cell => {
        const crop = this.crop[cell.crop];
        const rngGen = this.$store.getters['system/getRngById'](`farmCrop_undefined`, cell.rng);
        const geneStats = this.$store.getters['farm/cropGeneStats'](cell.crop, cell.fertilizer);
        const allGainBoost = 
          (0.04 * (cell.buildingEffect.gnomeBoost ?? 0) / cell.time + 1) *
          ((geneStats.tag.includes('farmLuckyHarvest') && chance(0.01, rngGen())) ? this.mult('farmLuckyHarvestMult', geneStats.mult.farmLuckyHarvestMult.baseValue) : 1);
        const gainAmount = this.mult(
          `currencyFarm${capitalize(crop.type)}Gain`,
          crop.yield + geneStats.mult.farmCropGain.baseValue,
        ) * allGainBoost * cell.grow;
        gain['farm_' + crop.type] += gainAmount;
        // 基因：转换
        if (geneStats.tag.includes('farmYieldConversion')) {
          ['vegetable', 'berry', 'grain', 'flower'].forEach(croptype => {
            if (crop.type !== croptype) {
              const conversionAmount = this.mult(
                  'currencyFarm' + capitalize(croptype) + 'Gain',
                  crop.yield + geneStats.mult.farmCropGain.baseValue,
                  (((cell.buildingEffect.flag ?? 0) / cell.time) * 0.5 + 1) * geneStats.mult.farmCropGain.multValue
              ) * allGainBoost * cell.grow;
              gain['farm_' + croptype] += conversionAmount * 0.05;
            }
          });
        }
        // 黄金
        const goldAmount = randomRound(
          this.mult(
            'farmGoldChance',
            this.$store.getters['farm/baseGoldChance'](cell.crop) + geneStats.mult.farmGoldChance.baseValue,
            ((cell.buildingEffect.gardenGnome ?? 0) / cell.time) * geneStats.mult.farmGoldChance.multValue
          ) * allGainBoost * cell.grow,
          rngGen()
        );
        gain.farm_gold += goldAmount || 0;
        // 稀有掉落
        const geneDrops = geneStats.rareDrop.map(elem => {
          return {
            name: elem.name,
            type: 'currency',
            chance: elem.chance,
            mult: elem.mult,
            value: elem.amount,
            found: true
          };
        });
        const pinwheelMult = (((cell.buildingEffect.pinwheel ?? 0) / cell.time) * 0.015) + 1;
        [...crop.rareDrop, ...geneDrops].forEach(elem => {
          const times = randomRound(this.mult(
            'farmRareDropChance',
            elem.chance + geneStats.mult.farmRareDropChance.baseValue,
            geneStats.mult.farmRareDropChance.multValue * pinwheelMult * elem.mult
          ) * allGainBoost * cell.grow, rngGen());
          if (times > 0) {
            if (!gain[elem.name]) gain[elem.name] = 0;
            gain[elem.name] += elem.value * times;
          }
        });
        // 经验
        const expAmount = this.mult(
          'farmExperience',
          geneStats.mult.farmExperience.baseValue,
          (((cell.buildingEffect.lectern ?? 0) / cell.time) * 2 + 1) * geneStats.mult.farmExperience.multValue
        ) * allGainBoost * cell.grow;
        if (!exp[cell.crop]) exp[cell.crop] = 0;
        exp[cell.crop] += expAmount || 0
      });
      return {
        gain: Object.entries(gain).filter(([, amount]) => amount).map(([name, amount]) => ({name, amount})),
        exp: Object.entries(exp).map(([name, amount]) => {
          const needed = this.$store.getters['farm/expNeeded'](name);
          const level = this.crop[name].level;
          const exp = this.crop[name].exp;
          let leveled = false, before = 0, after = 0;
          if (exp + amount >= needed) {
            leveled = true;
            before = level;
            after = level + 1;
          } else {
            before = exp / needed;
            after = (exp + amount) / needed;
          }
          return {name, leveled, before, after}
        })
      };
    }
  }
}
</script>
