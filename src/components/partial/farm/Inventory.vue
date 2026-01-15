<style>
.crop-progress {
  position: absolute;
  left: 4px;
  bottom: 4px;
  width: calc(100% - 8px);
}
</style>

<template>
  <div>
    <div class="d-flex flex-wrap justify-center ma-1">
      <currency v-for="(item, key) in currencies" class="ma-1" :key="'currency-' + key" :name="'farm_' + item"></currency>
    </div>
    <template v-if="useLegacySelect">
      <div v-if="$store.getters['system/checkExtraCheated']('categoryCrop')">
        <v-tabs v-model="category" grow show-arrows>
          <v-tab v-for="category in categories" :key="category" :href="`#${category}`">
            <tab-icon-text :icon="currency[`farm_${category}`]?currency[`farm_${category}`].icon:'mdi-star'"></tab-icon-text>
          </v-tab>
        </v-tabs>
        <div class="d-flex flex-wrap justify-center ma-1">
          <div v-for="item in categoryCrops[category]" :key="`farm-crop-${ item.name }`" style="position: relative;">
            <v-btn
              class="ma-1 px-2 balloon-text-dynamic"
              :class="{'selected-primary': selectedCropName === item.name}"
              min-width="0"
              :color="item.color"
              @click="selectCrop(item.name)"
            >
              <v-icon>{{ item.icon }}</v-icon>
              <span class="ml-1" :class="{'light-blue--text': item.level >= item.levelMax}">{{ item.level || 0 }}</span>
            </v-btn>
            <v-progress-linear class="rounded crop-progress" :color="item.level >= item.levelMax ? 'light-blue' : 'white'" height="4" :value="item.exp / expNeededs[item.name] * 100"></v-progress-linear>
          </div>
        </div>
      </div>
      <div v-else class="d-flex flex-wrap justify-center ma-1">
        <template v-for="(item, key) in crops">
          <v-btn :data-cy="`farm-crop-${ key }`" v-if="item.found" class="ma-1 px-2" :class="{'selected-primary': selectedCropName === key}" min-width="0" :key="'crop-' + key" :color="item.color" @click="selectCrop(key)">
            <v-icon>{{ item.icon }}</v-icon>
          </v-btn>
        </template>
      </div>
      <div class="d-flex flex-wrap justify-center ma-1">
        <template v-for="(item, key) in buildings">
          <v-btn v-if="item.max > 0 && item.cacheAmount < item.max" class="ma-1 px-2" min-width="0" :key="'building-' + key" @click="selectBuilding(key)">
            <v-icon class="mr-2">{{ item.icon }}</v-icon>
            <div>{{ $formatNum(item.max - item.cacheAmount) + ' / ' + $formatNum(item.max) }}</div>
          </v-btn>
        </template>
      </div>
    </template>
    <div v-else class="ma-1">
      <v-select class="w-100" outlined hide-details clearable item-value="name" v-model="selectedPlaceable" :items="placeableList" @change="selectPlaceable">
        <template v-slot:selection="{ item }"><placeable-select-display :item="item" is-simple></placeable-select-display></template>
        <template v-slot:item="{ item }">
          <div v-if="item.type === 'divider'" class="w-100 mt-2">
            <v-divider></v-divider>
            <div class="ml-2 mt-1">{{ $vuetify.lang.t(`$vuetify.farm.divider.${ item.name }`) }}</div>
          </div>
          <placeable-select-display v-else :item="item"></placeable-select-display>
        </template>
      </v-select>
    </div>
    <div v-if="unlock.farmFertilizer.see && selectedCropName" class="d-flex flex-wrap justify-center ma-1">
      <consumable v-for="(item, key) in fertilizers" class="ma-1" :key="'fertilizer-' + key" :name="`farm_${key}`" :is-selected="selectedFertilizerName === key" @click="selectFertilizer(key)">
        <fertilizer-card :name="key"></fertilizer-card>
      </consumable>
    </div>
    <crop-card class="ma-1" v-if="selectedCropName" :name="selectedCropName"></crop-card>
    <building-card class="ma-1" v-if="selectedBuildingName" :name="selectedBuildingName"></building-card>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Consumable from '../../render/Consumable.vue';
import Currency from '../../render/Currency.vue';
import BuildingCard from './BuildingCard.vue';
import CropCard from './CropCard.vue';
import FertilizerCard from './FertilizerCard.vue';
import PlaceableSelectDisplay from './PlaceableSelectDisplay.vue';
import TabIconText from '../render/TabIconText.vue';

export default {
  components: { Currency, CropCard, FertilizerCard, Consumable, BuildingCard, PlaceableSelectDisplay, TabIconText },
  data: () => ({
    currencies: ['vegetable', 'berry', 'grain', 'flower', 'gold', 'seedHull', 'grass', 'petal', 'bug', 'butterfly', 'ladybug', 'spider', 'bee', 'mysteryStone', 'smallSeed'],
    selectedPlaceable: null,
    categories: ['vegetable', 'berry', 'grain', 'flower','special'],
    category: 'vegetable'
  }),
  computed: {
    ...mapState({
      crops: state => state.farm.crop,
      buildings: state => state.farm.building,
      selectedCropName: state => state.farm.selectedCropName,
      selectedBuildingName: state => state.farm.selectedBuildingName,
      selectedFertilizerName: state => state.farm.selectedFertilizerName,
      unlock: state => state.unlock,
      consumable: state => state.consumable,
      currency: state => state.currency
    }),
    fertilizers() {
      if (this.selectedCropName === null) {
        return {};
      }
      let obj = {};
      for (const [key, elem] of Object.entries(this.$store.state.farm.fertilizer)) {
        if (this.consumable[`farm_${key}`].found && ((elem.type === 'all' && this.crops[this.selectedCropName].type !== 'special') || elem.type === this.crops[this.selectedCropName].type)) {
          obj[key] = elem;
        }
      }
      return obj;
    },
    placeableList() {
      let arr = [];
      for (const [key, elem] of Object.entries(this.crops)) {
        if (elem.found && elem.type !== 'special') {
          arr.push({...elem, name: `crop_${ key }`});
        }
      }
      let hasSpecial = false;
      for (const [key, elem] of Object.entries(this.crops)) {
        if (elem.found && elem.type === 'special') {
          if (!hasSpecial) {
            arr.push({type: 'divider', name: 'specialCrop', disabled: true});
            hasSpecial = true;
          }
          arr.push({...elem, name: `crop_${ key }`});
        }
      }
      let hasBuilding = false;
      for (const [key, elem] of Object.entries(this.buildings)) {
        if (elem.max > 0 && elem.cacheAmount < elem.max) {
          if (!hasBuilding) {
            arr.push({type: 'divider', name: 'decoration', disabled: true});
            hasBuilding = true;
          }
          arr.push({...elem, name: `building_${ key }`});
        }
      }
      return arr;
    },
    useLegacySelect() {
      return this.$store.state.system.settings.general.items.useLegacyFarmSelect.value;
    },
    categoryCrops() {
      const crops = {};
      for (const type of this.categories) {
        crops[type] = [];
        for (const [key, elem] of Object.entries(this.crops)) {
          if (elem.type === type && elem.found) {
            crops[type].push({name: key, ...elem});
          }
        }
      }
      return crops;
    },
    expNeededs() {
      const neededs = {};
      for (const [key, elem] of Object.entries(this.crops)) {
        if (elem.found) {
          neededs[key] = this.$store.getters['farm/expNeeded'](key);
        }
      }
      return neededs;
    },
  },
  mounted() {
    if (this.selectedCropName !== null) {
      this.selectedPlaceable = `crop_${ this.selectedCropName }`;
      this.category = this.crops[this.selectedCropName].type;
    } else if (this.selectedBuildingName !== null) {
      this.selectedPlaceable = `building_${ this.selectedBuildingName }`;
    }
  },
  methods: {
    selectPlaceable() {
      if (!this.selectedPlaceable) {
        this.$store.commit('farm/updateKey', {key: 'selectedCropName', value: null});
        this.$store.commit('farm/updateKey', {key: 'selectedBuildingName', value: null});
        this.$store.commit('farm/updateKey', {key: 'selectedFertilizerName', value: null});
        this.$store.commit('farm/updateKey', {key: 'deleting', value: false});
      } else {
        const split = this.selectedPlaceable.split('_');
        if (split[0] === 'crop') {
          this.selectCrop(split[1]);
        } else if (split[0] === 'building') {
          this.selectBuilding(split[1]);
        }
      }
    },
    selectCrop(name) {
      this.$store.commit('farm/updateKey', {key: 'selectedBuildingName', value: null});
      this.$store.commit('farm/updateKey', {key: 'selectedFertilizerName', value: null});
      this.$store.commit('farm/updateKey', {key: 'deleting', value: false});
      this.$store.commit('farm/updateKey', {key: 'selectedCropName', value: this.selectedCropName === name ? null : name});
    },
    selectBuilding(name) {
      this.$store.commit('farm/updateKey', {key: 'selectedCropName', value: null});
      this.$store.commit('farm/updateKey', {key: 'selectedFertilizerName', value: null});
      this.$store.commit('farm/updateKey', {key: 'deleting', value: false});
      this.$store.commit('farm/updateKey', {key: 'selectedBuildingName', value: this.selectedBuildingName === name ? null : name});
    },
    selectFertilizer(name) {
      this.$store.commit('farm/updateKey', {key: 'selectedBuildingName', value: null});
      this.$store.commit('farm/updateKey', {key: 'deleting', value: false});
      this.$store.commit('farm/updateKey', {key: 'selectedFertilizerName', value: this.selectedFertilizerName === name ? null : name});
    }
  }
}
</script>
