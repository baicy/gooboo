<style scoped>
.horde-area-map {
  position: relative;
  width: 672px;
  height: 480px;
}
.horde-area-map-mobile {
  width: 336px;
  height: 240px;
}
.horde-area-map-bg {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  opacity: 0.5;
}
.horde-area-zone {
  position: absolute;
}
.horde-area-decoration {
  position: absolute;
  opacity: 0.25;
}
.horde-area-line {
  position: absolute;
  border-top: 3px dotted rgba(0, 0, 0, 0.54);
  height: 0;
  pointer-events: none;
}
.horde-area-line-dark {
  border-top-color: white;
}
.horde-area-map-mobile .horde-area-line {
  border-top-width: 2px;
}
</style>

<template>
  <div class="horde-area-map" :class="{'horde-area-map-mobile': $vuetify.breakpoint.smAndDown}">
    <div class="horde-area-map-bg" :class="area.color"></div>
    <v-icon
      v-for="(item, key) in area.decoration"
      :key="`horde-decoration-${ name }-${ key }`"
      :size="item.size * unitSize"
      :style="`left: ${ item.x * unitSize - 0.5 * item.size * unitSize + xCenter }px; top: ${ item.y * unitSize - 0.5 * item.size * unitSize + yCenter }px; rotate: ${ item.rotate }deg;`"
      class="horde-area-decoration"
    >{{ item.icon }}</v-icon>
    <div
      v-for="(item, key) in lines"
      :key="`horde-line-${ key }`"
      :style="item"
      class="horde-area-line"
      :class="{'horde-area-line-dark': $vuetify.theme.dark}"
    ></div>
    <div class="horde-area-zone" style="left: 4px;top: 4px;">
      <div>通过最大难度：{{ clearMaxDifficulty }}</div>
      <div v-if="trinkets.length">击败boss掉落饰品：</div>
      <div v-for="item in trinkets" :key="item.name">{{ $vuetify.lang.t(`$vuetify.horde.trinket.${ item.name }`) }} +{{ item.amount }}</div>
    </div>
    <gb-tooltip v-for="(item, key) in zones" :key="`horde-zone-${ key }`" :min-width="0" :max-width="300">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          v-on="on"
          :x-small="$vuetify.breakpoint.smAndDown"
          :style="`left: ${ (item.x - 0.5) * unitSize + xCenter }px; top: ${ (item.y - 0.5) * unitSize + yCenter }px;`"
          class="horde-area-zone"
          :color="item.isCurrent ? 'primary' : undefined"
          :disabled="isFrozen && item.type !== 'sign'"
          @click="clickZone(key)"
          icon
        >
          <v-icon :size="$vuetify.breakpoint.smAndDown ? 16 : 24">
            {{ typeIcon[item.type==='regular'?(clearMaxDifficulty>=item.difficulty?'regularDefeated':'regular'):item.type] }}
          </v-icon>
        </v-btn>
      </template>
      <div v-if="item.type === 'regular'" class="mt-0">{{ $vuetify.lang.t(`$vuetify.horde.area.zone`, key) }}</div>
      <div v-else-if="['boss', 'bossDefeated'].includes(item.type)" class="mt-0">{{ $vuetify.lang.t(`$vuetify.horde.area.zoneBoss`, $vuetify.lang.t(`$vuetify.horde.bossName.${ item.boss[item.boss.length - 1] }`)) }}</div>
      <div v-else-if="item.type === 'sign'" class="mt-0">
        <div>{{ $vuetify.lang.t(`$vuetify.horde.sign.${ key }.text`) }}</div>
        <div class="mt-2 text-right">~ {{ $vuetify.lang.t(`$vuetify.horde.sign.${ key }.signed`) }}</div>
      </div>
      <div v-else-if="item.type === 'endless'" class="mt-0">{{ $vuetify.lang.t(`$vuetify.horde.area.zoneEndless`) }}</div>
      <div v-if="['regular', 'boss', 'endless'].includes(item.type)">{{ $vuetify.lang.t(`$vuetify.horde.area.difficulty`, $formatNum(item.difficulty)) }}</div>
      <div v-else-if="item.type === 'bossDefeated'">{{ $vuetify.lang.t(`$vuetify.horde.area.difficulty`, $formatNum(item.difficulty + bossBonusDifficulty)) }} ({{ item.difficulty }} + {{ bossBonusDifficulty }})</div>
      <div v-if="item.type === 'regular'" class="mt-0">{{ $vuetify.lang.t(`$vuetify.horde.area.enemyAmount`, $formatNum(item.enemyAmount)) }}</div>
      <alert-text v-if="item.type === 'bossDefeated'" type="info">{{ $vuetify.lang.t(`$vuetify.horde.bossNoReward`) }}</alert-text>
    </gb-tooltip>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import AlertText from '../render/AlertText.vue';
import { randomInt, weightSelect } from "../../../js/utils/random";

export default {
  components: { AlertText },
  props: {
    name: {
      type: String,
      required: true
    }
  },
  data: () => ({
    typeIcon: {
      regular: 'mdi-circle-medium',
      regularDefeated: 'mdi-square-medium-outline',
      boss: 'mdi-skull',
      bossDefeated: 'mdi-flag-variant',
      endless: 'mdi-infinity',
      sign: 'mdi-sign-text'
    }
  }),
  computed: {
    ...mapState({
      bossBonusDifficulty: state => state.horde.bossBonusDifficulty,
      isFrozen: state => state.cryolab.horde.active,
      clearMaxDifficulty: state => state.stat.horde_maxDifficulty.value,
    }),
    area() {
      return this.$store.state.horde.area[this.name];
    },
    xCenter() {
      return this.$vuetify.breakpoint.smAndDown ? 168 : 336;
    },
    yCenter() {
      return this.$vuetify.breakpoint.smAndDown ? 120 : 240;
    },
    unitSize() {
      return this.$vuetify.breakpoint.smAndDown ? 16 : 32;
    },
    lines() {
      let arr = [];
      for (const [, elem] of Object.entries(this.area.zones)) {
        if (elem.unlockedBy !== null) {
          elem.unlockedBy.forEach(newElem => {
            if (elem.unlocked || this.zones[newElem]) {
              const oldElem = this.area.zones[newElem];
              const x1 = oldElem.x * this.unitSize + this.xCenter;
              const x2 = elem.x * this.unitSize + this.xCenter;
              const y1 = oldElem.y * this.unitSize + this.yCenter;
              const y2 = elem.y * this.unitSize + this.yCenter;

              const length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
              const cx = ((x1 + x2) / 2) - (length / 2);
              const cy = ((y1 + y2) / 2);
              const angle = Math.atan2((y1 - y2),(x1 - x2))*(180 / Math.PI);

              arr.push(`left:${ cx }px; top: ${ cy }px; width: ${ length }px; transform:rotate(${ angle }deg);${ elem.unlocked ? '' : ' opacity: 0.5;'}`);
            }
          });
        }
      }
      return arr;
    },
    zones() {
      let obj = {};
      for (const [key, elem] of Object.entries(this.area.zones)) {
        if (elem.unlocked) {
          obj[key] = {...elem, isCurrent: this.$store.state.horde.selectedArea === this.name && this.$store.state.horde.zone === key};
          if (elem.type === 'boss') {
            if (this.$store.state.unlock[elem.reward].use) {
              obj[key].type = 'bossDefeated';
            }
          }
        }
      }
      return obj;
    },
    trinkets() {
      let drops = [];
      const bossZone = this.area.zones.boss_1;
      const bossName = bossZone.boss[bossZone.boss.length - 1];
      let hasTrinket = false;
      const classObj = this.$store.state.horde.fighterClass[this.$store.state.horde.selectedClass];
      const questObj = classObj.questsCompleted.boss < classObj.quests.boss.length ? classObj.quests.boss[classObj.questsCompleted.boss] : null;
      if (questObj !== null && questObj.boss === bossName && questObj.difficulty === this.bossBonusDifficulty) {
        hasTrinket = true;
      } else if (this.$store.state.horde.selectedClass === 'pirate') {
        hasTrinket = true;
      }
      if (bossZone.unlocked && hasTrinket) {
        const difficulty = bossZone.difficulty + this.bossBonusDifficulty;
        let eligible = [];
        for (const [key, elem] of Object.entries(this.$store.state.horde.trinket)) {
          const diff = this.$store.getters['mult/get']('hordeTrinketQuality', difficulty) - elem.rarity;
          if (diff >= 0 && (elem.uniqueToBoss === null || elem.uniqueToBoss === bossName) && (!elem.isTimeless || elem.level <= 0)) {
            eligible.push({name: key, weight: (diff * 0.1 + 1) * (elem.isTimeless ? 0.05 : 1), maxAmount: elem.isTimeless ? 1 : Math.floor(this.$store.getters['mult/get']('hordeTrinketGain', Math.pow(diff, 1.5) * 0.01) + 1)});
          }
        }
        let rngGen = this.$store.getters['system/getRng']('horde_trinket');
        for (let i = 0; i < 3; i++) {
          if (eligible.length > 0) {
            const chosenId = weightSelect(eligible.map(el => el.weight), rngGen());
            if (chosenId !== -1) {
              const chosenObj = eligible[chosenId];
              drops.push({name: chosenObj.name, amount: randomInt(1, chosenObj.maxAmount, rngGen())});
              eligible.splice(chosenId, 1);
            }
          }
        }
      }
      return drops;
    }
  },
  methods: {
    clickZone(zone) {
      if (this.zones[zone].type !== 'sign' && (this.$store.state.horde.trinketDrop === null || !['boss', 'bossDefeated'].includes(this.zones[zone].type))) {
        this.$store.dispatch('horde/updateAreaZone', {area: this.name, zone});
      }
    }
  }
}
</script>
