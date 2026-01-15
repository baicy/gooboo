<template>
  <status-template feature="horde" :prestigeGain="prestigeGain" @updateSelectedSubfeature="selectedSubfeature = $event">
    <template slot="footer">
      <div v-if="canSeeSacrifice" class="ma-2 d-flex justify-center align-center">
        <v-btn icon :disabled="isFrozen || sacrificeLevel <= 0" @click="sacrificeLevel--"><v-icon>mdi-minus</v-icon></v-btn>
        <gb-tooltip :title-text="$vuetify.lang.t('$vuetify.horde.sacrifice.name')">
          <template v-slot:activator="{ on, attrs }">
            <v-chip color="pale-red" class="mx-1 balloon-text-dynamic" v-bind="attrs" v-on="on"><v-icon class="mr-4">mdi-skull</v-icon>{{ sacrificeLevel }}</v-chip>
          </template>
          <div>{{ $vuetify.lang.t('$vuetify.horde.sacrifice.description') }}</div>
          <display-row :class="{'mt-0': key > 0}" v-for="(item, key) in sacrificeEffect" :key="key" :name="item.name" :type="item.type" :after="item.value"></display-row>
        </gb-tooltip>
        <v-btn icon color="red" :disabled="isFrozen || !unlock.hordeSacrifice.use || sacrificeLevel >= maxSacrifice" @click="sacrificeLevel++"><v-icon>mdi-plus</v-icon></v-btn>
      </div>
      <div v-if="canSeeClasses" class="ma-2">
        <v-select outlined hide-details item-value="name" :disabled="isFrozen" v-model="selectedClass" :items="classList">
          <template v-slot:selection="{ item }"><v-icon class="mr-2">{{ item.icon }}</v-icon><div>{{ $vuetify.lang.t(`$vuetify.horde.classes.${ item.name }.name`) }}</div></template>
          <template v-slot:item="{ item }">
            <v-icon class="mr-4">{{ item.icon }}</v-icon>
            <fighter-prestige-stats :item="item"></fighter-prestige-stats>
          </template>
        </v-select>
        <v-row class="mt-1">
          <v-col cols="12" sm="6">
            <v-text-field label="期望等级" outlined dense hide-details v-model.number="expectLevel" type="number"></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field label="预计时间" outlined dense hide-details readonly :value="$formatTime(expectTime)"></v-text-field>
          </v-col>
        </v-row>
      </div>
    </template>
  </status-template>
</template>

<script>
import { mapState } from 'vuex';
import StatusTemplate from '../prestige/StatusTemplate.vue';
import DisplayRow from '../upgrade/DisplayRow.vue';
import FighterPrestigeStats from './FighterPrestigeStats.vue';
import { HORDE_LEVEL_MIN_SECONDS } from '../../../js/constants';

export default {
  components: { StatusTemplate, FighterPrestigeStats, DisplayRow },
  data: () => ({
    selectedClass: null,
    selectedSubfeature: 0,
    sacrificeLevel: 0,
    expectLevel: 0,
  }),
  computed: {
    ...mapState({
      subfeature: state => state.system.features.horde.currentSubfeature,
      isFrozen: state => state.cryolab.horde.active,
      unlock: state => state.unlock,
      globalLevel: state => state.meta.globalLevel,
      globalLevelUnlocks: state => state.meta.globalLevelUnlocks
    }),
    prestigeGain() {
      let obj = {};
      switch (this.subfeature) {
        case 0: {
          if (this.$store.state.currency.horde_soulCorrupted.value > 0) {
            obj.horde_soulEmpowered = {
              total: this.$store.state.currency.horde_soulCorrupted.value,
              showDescription: true,
            };
          }
          break;
        }
        case 1: {
          if (this.$store.getters['mult/get']('currencyHordeCourageGain', this.$store.state.horde.courageScore) > 0) {
            obj.horde_courage = {
              base: this.$store.state.horde.courageScore,
              total: this.$store.getters['mult/get']('currencyHordeCourageGain', this.$store.state.horde.courageScore),
              gainMult: 'currencyHordeCourageGain',
              showDescription: true,
            };
          }
          break;
        }
      }
      return obj;
    },
    classList() {
      let arr = [];
      for (const [key, elem] of Object.entries(this.$store.state.horde.fighterClass)) {
        if (elem.unlock === null || this.unlock[elem.unlock].see) {
          arr.push({...elem, name: key});
        }
      }
      return arr;
    },
    canSeeSacrifice() {
      return this.selectedSubfeature === 0 && this.unlock.hordeSacrifice.see;
    },
    canSeeClasses() {
      return this.selectedSubfeature === 1 && this.unlock.hordeClassesSubfeature.see  && this.globalLevelUnlocks.hordeClassesSubfeature < this.globalLevel;
    },
    maxSacrifice() {
      return this.$store.getters['mult/get']('hordeMaxSacrifice');
    },
    sacrificeEffect() {
      return this.sacrificeLevel <= 0 ? [] : this.$store.getters['horde/sacrificeEffectAtLevel'](this.sacrificeLevel);
    },
    expectTime() {
      let total = 0;
      for (let i = 0; i < this.expectLevel; i++) {
        const base = this.$store.state.horde.fighterClass[this.selectedClass].exp.base;
        const time = Math.pow(this.$store.getters['horde/expIncrement'](this.selectedClass), i) * this.$store.getters['mult/get']('hordeExpBase', base);
        total += Math.max(HORDE_LEVEL_MIN_SECONDS, time);
      }
      return total;
    }
  },
  mounted() {
    this.selectedClass = this.$store.state.horde.nextClass;
    this.sacrificeLevel = this.$store.state.horde.nextSacrificeLevel;
  },
  watch: {
    selectedClass: {
      deep: true,
      immediate: false,
      handler(newVal) {
        if (newVal !== null) {
          this.$store.commit('horde/updateKey', {key: 'nextClass', value: newVal});
        }
      }
    },
    sacrificeLevel: {
      deep: true,
      immediate: false,
      handler(newVal) {
        if (newVal !== null) {
          this.$store.commit('horde/updateKey', {key: 'nextSacrificeLevel', value: newVal});
        }
      }
    }
  }
}
</script>
