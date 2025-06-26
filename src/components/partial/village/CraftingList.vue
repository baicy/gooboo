<style scoped>
.craft-special {
  position: absolute;
  top: 8px;
  left: 8px;
}
</style>

<template>
  <div>
    <v-row no-gutters class="ma-1">
      <v-col cols="12" sm="6" lg="4">
        <v-card class="ma-1 pa-2">
          <v-row no-gutters>
            <v-col cols="4" class="d-flex align-center">{{ $vuetify.lang.t('$vuetify.mult.villageArtisan') }}</v-col>
            <v-col cols="8" class="d-flex justify-center align-center">
              <gb-tooltip :title-text="$vuetify.lang.t('$vuetify.mult.villageArtisan')">
                <template v-slot:activator="{ on, attrs }">
                  <span v-bind="attrs" v-on="on">{{ $formatNum(currentArtisan) }} / {{ $formatNum(maxArtisan) }}</span>
                </template>
                <div>{{ $vuetify.lang.t('$vuetify.village.artisanDescription') }}</div>
                <stat-breakdown name="villageArtisan"></stat-breakdown>
              </gb-tooltip>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" lg="4">
        <v-card class="ma-1 pa-2">
          <v-row no-gutters>
            <v-col cols="4" class="d-flex align-center">{{ $vuetify.lang.t('$vuetify.mult.villageCounter') }}</v-col>
            <v-col cols="8" class="d-flex justify-center align-center">
              <gb-tooltip :title-text="$vuetify.lang.t('$vuetify.mult.villageCounter')">
                <template v-slot:activator="{ on, attrs }">
                  <span v-bind="attrs" v-on="on">{{ $formatNum(currentCounter) }} / {{ $formatNum(maxCounter) }}</span>
                </template>
                <div>{{ $vuetify.lang.t('$vuetify.village.counterDescription') }}</div>
                <stat-breakdown name="villageCounter"></stat-breakdown>
              </gb-tooltip>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
      <v-col cols="12" lg="4">
        <v-card class="ma-1 pa-2">
          <v-row no-gutters>
            <v-col cols="4" class="d-flex align-center">{{ $vuetify.lang.t('$vuetify.mult.villageHappiness') }}</v-col>
            <v-col cols="8" class="d-flex justify-center align-center">
              <gb-tooltip :title-text="$vuetify.lang.t('$vuetify.mult.villageHappiness')">
                <template v-slot:activator="{ on, attrs }">
                  <span :class="{'red--text': happinessPercent < 100, 'green--text': happinessPercent > 100}" v-bind="attrs" v-on="on">{{ $formatNum(happinessPercent, true) }}%</span>
                </template>
                <div>{{ $vuetify.lang.t('$vuetify.village.happinessDescription') }}</div>
                <stat-breakdown name="villageHappiness"></stat-breakdown>
              </gb-tooltip>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <div v-if="$store.getters['system/checkExtraCheated']('extraToolbar')" class="d-flex mx-2 align-center justify-center" style="gap: 4px;">
      <gb-tooltip :min-width="0">
        <template v-slot:activator="{ on, attrs }">
          <v-btn :color="crafting ? 'primary' : ''" v-bind="attrs" v-on="on" @click="toggleFilterCrafting" width="36" min-width="36" elevation="5">
          <v-icon>mdi-hammer</v-icon>
        </v-btn>
        </template>
        <div>筛选制作中的工艺品</div>
      </gb-tooltip>
      <gb-tooltip :min-width="0">
        <template v-slot:activator="{ on, attrs }">
          <v-btn :color="selling ? 'primary' : ''" v-bind="attrs" v-on="on" @click="toggleFilterSelling" width="36" min-width="36" elevation="5">
          <v-icon>mdi-currency-usd</v-icon>
        </v-btn>
        </template>
        <div>筛选出售中的工艺品</div>
      </gb-tooltip>
      <gb-tooltip :min-width="0">
        <template v-slot:activator="{ on, attrs }">
          <v-btn :color="enable ? 'primary' : ''" v-bind="attrs" v-on="on" @click="enable = !enable" width="36" min-width="36" elevation="5" :disabled="crafting || selling">
          <v-icon>mdi-check</v-icon>
        </v-btn>
        </template>
        <div>筛选可以制作的工艺品</div>
      </gb-tooltip>
      <gb-tooltip :min-width="0">
        <template v-slot:activator="{ on, attrs }">
          <v-btn :color="finalFilter ? craftMaterials[finalFilter].color : ''" v-bind="attrs" v-on="on" @click="showMaterials = !showMaterials" width="36" min-width="36" elevation="5" :disabled="crafting || selling">
          <v-icon>{{ finalFilter ? craftMaterials[finalFilter].icon : 'mdi-filter' }}</v-icon>
        </v-btn>
        </template>
        <div>根据原材料筛选工艺品</div>
      </gb-tooltip>
      <gb-tooltip :min-width="0">
        <template v-slot:activator="{ on, attrs }">
          <v-btn :color="showLocked ? 'primary' : ''" v-bind="attrs" v-on="on" @click="showLocked = !showLocked" width="36" min-width="36" elevation="5" :disabled="crafting || selling">
          <v-icon>mdi-lock</v-icon>
        </v-btn>
        </template>
        <div>查看未解锁工艺品</div>
      </gb-tooltip>
    </div>
    <div v-if="showMaterials" class="d-flex flex-wrap bg-tile-background px-2 justify-center my-1" style="gap: 8px">
      <gb-tooltip
        v-for="mat in craftMaterials"
        :key="mat.name"
        :min-width="0"
        :title-text="mat.title"
      >
        <template v-slot:activator="{ on, attrs }">
          <div v-bind="attrs" v-on="on" class="rounded" :class="{'selected-primary': finalFilter === mat.name}">
            <v-btn
              :color="mat.color"
              class="balloon-text-dynamic opacity-40"
              :class="[$vuetify.theme.dark ? 'theme--dark darken-3' : 'theme--light lighten-3']"
              min-width="30" width="30" height="30"
              elevation="3"
              @click="() => filter = filter === mat.name ? '' : mat.name"
            >
              <v-icon size="16">{{ mat.icon }}</v-icon>
            </v-btn>
          </div>
        </template>
      </gb-tooltip>
    </div>
    <div class="d-flex flex-wrap ma-1">
      <crafting-item class="ma-1" v-for="craft in finalCraftingItems" :key="craft" :name="craft" @click="selectCraft(craft)"></crafting-item>
    </div>
    <v-card v-if="selectedCraft" class="ma-2">
      <v-card-title class="pa-2 justify-center">
        {{ $vuetify.lang.t(`$vuetify.village.crafting.${ selectedCraft }`) }}
        <v-chip label small v-if="completedMilestones !== null" class="ml-2">
          <v-icon class="mr-1">mdi-trophy</v-icon>
          <span>{{ completedMilestones }}</span>
        </v-chip>
      </v-card-title>
      <v-card-subtitle class="pa-1 text-center">{{ $vuetify.lang.t('$vuetify.village.crafting.owned', $formatNum(craftObj.owned)) }}</v-card-subtitle>
      <v-card-text>
        <div class="d-flex flex-wrap mx-n1 my-1">
          <template v-for="(amount, currency, index) in craftObj.price">
            <gb-tooltip v-if="currency.split('_')[0] === 'craft'" :key="currency + '-' + index">
              <template v-slot:activator="{ on, attrs }">
                <v-chip small label class="ma-1 px-2 balloon-text-dynamic" :color="craftingList[currency.split('_')[1]].color" v-bind="attrs" v-on="on">
                  <v-icon class="mr-2">{{ craftingList[currency.split('_')[1]].icon }}</v-icon>
                  <span :class="{
                    'red--text': craftingList[currency.split('_')[1]].owned < (craftObj.isSpecial ? amount(craftObj.owned) : amount),
                    'text--lighten-2': $vuetify.theme.dark,
                    'text--darken-4': !$vuetify.theme.dark
                  }">{{ $formatNum(craftObj.isSpecial ? amount(craftObj.owned) : amount) }}</span>
                </v-chip>
              </template>
              <div class="mt-0 text-center">
                {{ craftingList[currency.split('_')[1]].owned}} / {{ (craftObj.isSpecial ? amount(craftObj.owned) : amount) }}
              </div>
              <div class="mt-0 text-center" v-if="craftingList[currency.split('_')[1]].owned < (craftObj.isSpecial ? amount(craftObj.owned) : amount)">
                预计需要 {{  $formatTime(((craftObj.isSpecial ? amount(craftObj.owned) : amount) - craftingList[currency.split('_')[1]].owned) * craftingList[currency.split('_')[1]].timeNeeded) }}
              </div>
            </gb-tooltip>
            <price-tag v-else class="ma-1" :key="currency + '-' + index" :currency="currency" :amount="craftObj.isSpecial ? amount(craftObj.owned) : amount"></price-tag>
          </template>
          <v-chip small label class="ma-1 px-2 balloon-text-dynamic" color="orange" v-if="!craftObj.isSpecial">
            <v-icon>mdi-circle-multiple</v-icon>
            <span class="ml-2">{{ parseFloat(sellPrice *craftObj.cacheSellChance).toFixed(4) }}/s</span>
          </v-chip>
        </div>
        <div class="d-flex align-center my-1">
          <v-btn
            v-if="craftObj.unlocked"
            class="mr-2"
            :color="craftObj.isCrafting ? 'success': 'error'"
            @click="toggleCrafting"
            :disabled="isFrozen || !craftObj.isCrafting && currentArtisan >= maxArtisan"
          ><v-icon>{{ craftObj.isCrafting ? 'mdi-check' : 'mdi-cancel' }}</v-icon></v-btn>
          <v-progress-linear class="rounded" height="16" :value="craftObj.progress * 100">{{ $formatTime(craftObj.timeNeeded * (1 - craftObj.progress)) }} / {{ $formatTime(craftObj.timeNeeded) }}</v-progress-linear>
        </div>
        <div v-if="!craftObj.isSpecial" class="d-flex align-center my-1 mt-3">
          <v-btn
            v-if="craftObj.unlocked"
            class="mr-2"
            :color="craftObj.isSelling ? 'success': 'error'"
            @click="toggleSelling"
            :disabled="isFrozen || !craftObj.isSelling && currentCounter >= maxCounter"
          ><v-icon>{{ craftObj.isSelling ? 'mdi-currency-usd' : 'mdi-currency-usd-off' }}</v-icon></v-btn>
          <v-text-field type="number" :label="$vuetify.lang.t('$vuetify.village.crafting.sellPrice', $formatNum(craftObj.value))" min="1" outlined hide-details v-model="sellPrice"></v-text-field>
          <div class="text-center">
            {{ $vuetify.lang.t('$vuetify.village.crafting.sellEvery', $formatTime(Math.round(1 / Math.min(craftObj.cacheSellChance, 1)))) }}
            <br/>
            售完 ~{{ $formatTime(Math.round(1 / Math.min(craftObj.cacheSellChance, 1))*craftObj.owned) }}
          </div>
        </div>
        <v-progress-linear v-if="currentMilestone !== null" class="rounded mt-2" color="blue" height="24" :value="milestonePercent">
          <div class="d-flex w-100 justify-space-between align-center ma-1">
            <span>{{ $vuetify.lang.t('$vuetify.village.crafting.crafts', $formatNum(craftObj.crafted), $formatNum(currentMilestone.needed)) }}:</span>
            <span>{{ $formatTime(craftObj.timeNeeded * (currentMilestone.needed - craftObj.crafted)) }}</span>
            <span v-if="currentMilestone.type === 'changeStat'" :key="`milestone-reward-stat-${selectedCraft}-${currentMilestone.needed}`">{{ $vuetify.lang.t(`$vuetify.village.crafting.changeStat.${ currentMilestone.name }`, currentMilestone.name === 'timeNeeded' ? $formatTime(currentMilestone.value) : $formatNum(currentMilestone.value)) }}</span>
            <display-row v-else :key="`milestone-reward-other-${selectedCraft}-${currentMilestone.needed}`" :type="currentMilestone.type" :name="currentMilestone.name" :after="currentMilestone.value"></display-row>
          </div>
        </v-progress-linear>
        <div v-if="craftObj.isSpecial">
          <div class="text-center">{{ $vuetify.lang.t('$vuetify.village.crafting.nextEffect') }}:</div>
          <display-row v-for="(item, key) in display" :key="`craft-reward-${selectedCraft}-${item.name}-${item.type}-${key}`" :type="item.type" :name="item.name" :before="item.before" :after="item.after"></display-row>
        </div>
      </v-card-text>
      <gb-tooltip v-if="craftObj.isSpecial" :min-width="0">
        <template v-slot:activator="{ on, attrs }">
          <v-icon class="craft-special" v-bind="attrs" v-on="on">mdi-star</v-icon>
        </template>
        <div class="mt-0">{{ $vuetify.lang.t(`$vuetify.village.crafting.special.description`) }}</div>
      </gb-tooltip>
    </v-card>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import PriceTag from '../../render/PriceTag.vue';
import StatBreakdown from '../../render/StatBreakdown.vue';
import DisplayRow from '../upgrade/DisplayRow.vue';
import CraftingItem from './CraftingItem.vue';

export default {
  components: { CraftingItem, PriceTag, StatBreakdown, DisplayRow },
  data: () => ({
    selectedCraft: null,
    sellPrice: null,
    showLocked: false,
    showMaterials: false,
    filter: '',
    enable: false,
    crafting: false,
    selling: false
  }),
  computed: {
    ...mapState({
      craftingList: state => state.village.crafting,
      isFrozen: state => state.cryolab.village.active,
      currency: state => state.currency
    }),
    ...mapGetters({
      currentArtisan: 'village/artisansActive',
      currentCounter: 'village/countersActive'
    }),
    craftingItems() {
      let arr = [];
      for (const [key, elem] of Object.entries(this.craftingList)) {
        if (elem.unlocked || this.showLocked) {
          arr.push(key);
        }
      }
      return arr;
    },
    finalFilter() {
      if (!this.filter || !this.craftMaterials[this.filter]) {
        return '';
      }
      return this.filter;
    },
    finalCraftingItems() {
      let items = this.craftingItems;
      if (this.crafting) {
        items = items.filter(item => {
          const craftObj = this.craftingList[item];
          return craftObj.isCrafting;
        });
      } else if (this.selling) {
        items = items.filter(item => {
          const craftObj = this.craftingList[item];
          return craftObj.isSelling;
        });
      } else {
        if (this.finalFilter) {
          items = items.filter(item => {
            const craftObj = this.craftingList[item];
            return Object.keys(craftObj.price).includes(this.finalFilter);
          });
        }
        if (this.enable) {
          items = items.filter(item => {
            const craftObj = this.craftingList[item];
            for (const [material, amount] of Object.entries(craftObj.price)) {
              const [type, craftName] = material.split('_');
              if (type === 'craft' && !this.craftingList[craftName].unlocked) {
                return false;
              }
              if (type !== 'craft') {
                if (typeof amount === 'function') {
                  if (this.$store.getters['currency/value'](material) < amount(craftObj.owned)) {
                    return false;
                  }
                } else {
                  if (this.$store.getters['currency/value'](material) < amount) {
                    return false;
                  }
                }
              }
            }
            return true;
          });
        }
      }
      return items;
    },
    craftMaterials() {
      const materials = {};
      this.craftingItems.forEach(craft => {
        const craftObj = this.craftingList[craft];
        for (const material of Object.keys(craftObj.price)) {
          if (materials[material]) continue;
          const [type, craftName] = material.split('_');
          materials[material] = {
            name: material,
            title: type === 'craft' ? this.$vuetify.lang.t(`$vuetify.village.crafting.${ craftName }`): this.$vuetify.lang.t(`$vuetify.currency.${material}.name`),
            color: type === 'craft' ? this.craftingList[craftName].color : this.currency[material].color,
            icon: type === 'craft' ? this.craftingList[craftName].icon : this.currency[material].icon,
          };
        }
      });
      return materials;
    },
    craftObj() {
      return this.selectedCraft === null ? null : this.craftingList[this.selectedCraft];
    },
    happinessPercent() {
      return this.$store.getters['mult/get']('villageHappiness') * 100;
    },
    maxArtisan() {
      return this.$store.getters['mult/get']('villageArtisan');
    },
    maxCounter() {
      return this.$store.getters['mult/get']('villageCounter');
    },
    previousMilestone() {
      if (this.selectedCraft === null || this.craftObj.isSpecial) {
        return 0;
      }
      let amount = 0;
      for (const [key] of Object.entries(this.craftObj.milestone)) {
        if (parseInt(key) > this.craftObj.crafted) {
          return amount;
        }
        amount = parseInt(key);
      }
      return 0;
    },
    completedMilestones() {
      if (this.selectedCraft === null || this.craftObj.isSpecial) {
        return null;
      }
      let completes = 0;
      for (const key of Object.keys(this.craftObj.milestone)) {
        if (parseInt(key) <= this.craftObj.crafted) {
          completes++;
        }
      }
      return completes;
    },
    currentMilestone() {
      if (this.selectedCraft === null || this.craftObj.isSpecial) {
        return null;
      }
      for (const [key, elem] of Object.entries(this.craftObj.milestone)) {
        if (parseInt(key) > this.craftObj.crafted) {
          return {...elem, needed: parseInt(key)};
        }
      }
      return null;
    },
    milestonePercent() {
      if (this.currentMilestone === null || this.selectedCraft === null) {
        return 0;
      }
      return 100 * (this.craftObj.crafted - this.previousMilestone) / (this.currentMilestone.needed - this.previousMilestone);
    },
    display() {
      return this.craftObj.effect.map(elem => {
        const lvl = this.craftObj.owned;
        return {
          ...elem,
          before: lvl > 0 ? elem.value(lvl) : null,
          after: elem.value(lvl + 1)
        };
      });
    }
  },
  methods: {
    selectCraft(name) {
      this.selectedCraft = this.selectedCraft === name ? null : name;
    },
    toggleCrafting() {
      if (this.selectedCraft !== null) {
        this.$store.commit('village/updateSubkey', {key: 'crafting', name: this.selectedCraft, subkey: 'isCrafting', value: !this.craftObj.isCrafting});
      }
    },
    toggleSelling() {
      if (this.selectedCraft !== null) {
        this.$store.commit('village/updateSubkey', {key: 'crafting', name: this.selectedCraft, subkey: 'isSelling', value: !this.craftObj.isSelling});
      }
    },
    toggleFilterCrafting() {
      this.crafting = !this.crafting;
      if (this.crafting) {
        this.filter = '';
        this.showMaterials = false;
        this.selling = false;
      }
    },
    toggleFilterSelling() {
      this.selling = !this.selling;
      if (this.selling) {
        this.filter = '';
        this.showMaterials = false;
        this.crafting = false;
      }
    }
  },
  watch: {
    selectedCraft(newVal) {
      this.sellPrice = newVal === null ? null : this.craftObj.sellPrice;
    },
    sellPrice(newVal) {
      if (newVal !== null && parseInt(newVal) >= 1) {
        const price = parseInt(newVal);
        this.$store.commit('village/updateSubkey', {key: 'crafting', name: this.selectedCraft, subkey: 'sellPrice', value: price});
        this.$store.commit('village/updateSubkey', {key: 'crafting', name: this.selectedCraft, subkey: 'cacheSellChance', value: 0.01 * Math.pow(this.craftObj.value / price, 2)});
      }
    }
  }
}
</script>
