<style scoped>
.upgrade-pagination {
  position: sticky;
  z-index: 2;
  top: 0;
}
.upgrade-pagination-mobile {
  top: 104px;
}
.upgrade-pagination-mobile-notabs {
  top: 56px;
}
.upgrade-queue-speed {
  position: absolute;
  right: 8px;
}
</style>

<template>
  <div>
    <div class="upgrade-pagination" :class="{'upgrade-pagination-mobile': $vuetify.breakpoint.smAndDown && !noTabs, 'upgrade-pagination-mobile-notabs': $vuetify.breakpoint.smAndDown && noTabs}">
      <div class="d-flex mx-2 py-1 bg-tile-default align-center">
        <div class="d-flex px-1 overflow-x-auto overflow-y-hidden">
          <gb-tooltip v-for="mat in neededMaterials" :key="mat" :min-width="0">
            <template v-slot:activator="{ on, attrs }">
              <v-icon :color="currency[mat].color" v-bind="attrs" v-on="on" small>{{ currency[mat].icon }}</v-icon>
            </template>
            {{ $vuetify.lang.t(`$vuetify.currency.${mat}.name`) }}
          </gb-tooltip>
        </div>
        <gb-tooltip :min-width="0">
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" icon x-small text>
              <v-icon>mdi-help-circle-outline</v-icon>
            </v-btn>
          </template>
          <div>左侧显示下列升级项需要用到的材料</div>
          <div>将升级项收起可将其加入黑名单</div>
        </gb-tooltip>
        <v-spacer></v-spacer>
        <v-btn-toggle :value="listFilter" color="primary" dense @change="setListFilter">
          <gb-tooltip :min-width="0">
            <template v-slot:activator="{ on, attrs }">
              <v-btn value="price" v-bind="attrs" v-on="on" :class="{'primary': listFilter==='price'}" min-width="36" width="36">
                <v-icon :color="listFilter==='price'?'white':''">mdi-cash-check</v-icon>
              </v-btn>
            </template>
            只显示当前能够购买的升级
          </gb-tooltip>
          <gb-tooltip>
            <template v-slot:activator="{ on, attrs }">
              <v-btn value="cap" v-bind="attrs" v-on="on" :class="{'primary': listFilter==='cap'}" min-width="36" width="36">
                <v-icon :color="listFilter==='cap'?'white':''">mdi-package-variant-closed-check</v-icon>
              </v-btn>
            </template>
            只显示当前材料容量足够但库存不足暂时无法购买的升级
          </gb-tooltip>
        </v-btn-toggle>
        <gb-tooltip>
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="error" class="ml-2" v-bind="attrs" v-on="on" @click="viewUnlockItems" width="36" min-width="36">
            <v-icon size="30">mdi-eye-lock-open</v-icon>
          </v-btn>
          </template>
          <div>提前查看未解锁升级项，无法购买</div>
          <div>另外会自动将左侧选择的过滤项去除</div>
        </gb-tooltip>
        <v-dialog v-model="viewUnlock">
          <v-card class="default-card">
            <v-card-title class="text-center">未解锁项目</v-card-title>
            <v-card-text>
              <v-row class="pa-1" no-gutters>
                <v-col class="pa-1" v-for="item in unlockItems" :key="`${feature}-${type}-${item}`" cols="12" sm="6" md="4" lg="3">
                  <unlock-upgrade :name="item" :translation-set="translationSet">
                    <slot :upgrade-name="item"></slot>
                  </unlock-upgrade>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-dialog>
      </div>
      <div v-if="items.length > 0 && (pages > 1 || requirementStat.length > 0)" class="d-flex justify-center align-center bg-tile-default rounded-b elevation-2 mx-2" :class="{'pr-10': showQueueSpeed}">
        <v-pagination v-if="pages > 1" v-model="page" :length="pages" :total-visible="7"></v-pagination>
        <gb-tooltip v-for="item in requirementFiltered" :key="item.key" :min-width="0">
          <template v-slot:activator="{ on, attrs }">
            <v-chip small label class="flex-shrink-0 ma-1 px-2" v-bind="attrs" v-on="on"><v-icon class="mr-1">mdi-chevron-double-up</v-icon>{{ $formatNum(requirementNext[item.key]) }}</v-chip>
          </template>
          <div class="mt-0">{{ $vuetify.lang.t('$vuetify.upgrade.keyset.default.nextRequirement') }}{{ $formatNum(requirementNext[item.key]) }} {{ $vuetify.lang.t(`$vuetify.stat.${ item.stat }.description`) }}</div>
        </gb-tooltip>
        <gb-tooltip v-for="(item, index) in requirementCustom" :key="index" :min-width="0">
          <template v-slot:activator="{ on, attrs }">
            <v-chip small label class="flex-shrink-0 ma-1 px-2" v-bind="attrs" v-on="on"><v-icon class="mr-1">mdi-chevron-double-up</v-icon>{{ $formatNum(item.value) }}</v-chip>
          </template>
          <div class="mt-0">{{ item.text }}</div>
        </gb-tooltip>
        <gb-tooltip v-if="speedMultName" :title-text="$vuetify.lang.t(`$vuetify.mult.${speedMultName}`)">
          <template v-slot:activator="{ on, attrs }">
            <div class="flex-shrink-0 upgrade-queue-speed" v-bind="attrs" v-on="on"><v-icon>mdi-chevron-double-right</v-icon></div>
          </template>
          <stat-breakdown :name="speedMultName"></stat-breakdown>
        </gb-tooltip>
      </div>
      <div v-else class="text-center">{{ $vuetify.lang.t(`$vuetify.upgrade.keyset.${ translationSet }.notFound`) }}</div>
    </div>
    <v-row v-if="items.length > 0"  class="pa-1" no-gutters>
      <v-col class="pa-1" v-for="(item, key) in finalItems" :key="`${feature}-${type}-${key}`" :cols="cols">
        <upgrade :name="item" :disabled="isFrozen" :upgrade-translation="upgradeTranslation" :translation-set="translationSet">
          <slot :upgrade-name="item"></slot>
        </upgrade>
      </v-col>
    </v-row>
    <alert-text v-else-if="type === 'book'" class="ma-2" type="info">{{ $vuetify.lang.t(`$vuetify.upgrade.${ feature === 'village' ? 'bookNotFoundVillage' : 'bookNotFound' }`) }}</alert-text>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { capitalize } from '../../js/utils/format';
import AlertText from '../partial/render/AlertText.vue';
import StatBreakdown from './StatBreakdown.vue';
import Upgrade from './Upgrade.vue';
import UnlockUpgrade from './UnlockUpgrade.vue';

export default {
  components: { Upgrade, StatBreakdown, AlertText, UnlockUpgrade },
  props: {
    feature: {
      type: String,
      required: true
    },
    subfeature: {
      type: Number,
      required: false,
      default: 0
    },
    type: {
      type: String,
      required: false,
      default: 'regular'
    },
    cols: {
      type: Number,
      required: false,
      default: 12
    },
    requirementStat: {
      type: Array,
      required: false,
      default: (() => [])
    },
    requirementCustom: {
      type: Array,
      required: false,
      default: (() => [])
    },
    noTabs: {
      type: Boolean,
      required: false,
      default: false
    },
    showQueueSpeed: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data: () => ({
    page: 1,
    viewUnlock: false,
  }),
  mounted() {
    const cachePage = this.$store.state.system.cachePage[this.cacheKey];
    if (cachePage !== undefined) {
      this.page = Math.min(Math.max(cachePage, 1), this.pages);
    }
  },
  computed: {
    ...mapState({
      listFilter: state => state.system.listFilter,
      currency: state => state.currency,
      stat: state => state.stat,
    }),
    baseItems() {
      return [...this.$store.state.upgrade.cache[`${this.feature}_${this.subfeature}_${this.type}`]];
    },
    items() {
      return this.baseItems.filter(elem => {
        const upgrade = this.$store.state.upgrade.item[elem];
        if (this.listFilter) {
          const [feature, name] = elem.split('_');
          let result = false;
          if (this.listFilter==='price') {
            result  = this.$store.getters['upgrade/canAfford'](feature, name);
          } else {
            result  = this.$store.getters['upgrade/ableAfford'](feature, name);
          }
          if (result) return upgrade.requirement(upgrade.level);
        } else {
          return upgrade.requirement(upgrade.level);
        }
      });
    },
    finalItems() {
      if (this.upgradeLimit === null) {
        return this.items;
      }
      return this.items.slice(this.upgradeLimit * (this.page - 1), this.upgradeLimit * this.page);
    },
    neededMaterials() {
      const mats = new Set();
      this.items.forEach(elem => {
        const upgrade = this.$store.state.upgrade.item[elem];
        if (!upgrade.collapse) {
          const price = upgrade.price(upgrade.level);
          if (price) {
            Object.keys(price).forEach(material => this.stat[material].total>0 && mats.add(material));
          }
        }
      });
      return mats;
    },
    unlockItems() {
      return this.baseItems.filter(item=>!this.items.includes(item));
    },
    upgradeLimit() {
      return ['smeltery', 'cindersProducer'].includes(this.type) && this.$vuetify.breakpoint.xlOnly ? 12 : this.$store.state.system.settings.performance.items.upgradeListItems.value;
    },
    pages() {
      return this.upgradeLimit === null ? null : Math.ceil(this.items.length / this.upgradeLimit);
    },
    requirementNext() {
      return this.requirementStat.map(statName => {
        let next = null;
        const stat = this.$store.state.stat[statName].total;
        this.baseItems.forEach(elem => {
          const upgrade = this.$store.state.upgrade.item[elem];
          if (upgrade.requirementValue !== null && upgrade.requirementStat === statName && stat < upgrade.requirementValue && (next === null || upgrade.requirementValue < next)) {
            next = upgrade.requirementValue;
          }
        });
        return next;
      });
    },
    requirementFiltered() {
      return this.requirementStat.map((el, key) => {
        return {stat: el, key};
      }).filter(el => {
        return this.requirementNext[el.key] !== null;
      });
    },
    speedMultName() {
      return this.showQueueSpeed ? ('queueSpeed' + capitalize(this.feature) + capitalize(this.type)) : null;
    },
    isFrozen() {
      return !['premium', 'book'].includes(this.type) && !!this.$store.state.cryolab[this.feature] && this.$store.state.cryolab[this.feature].active;
    },
    upgradeTranslation() {
      if (this.feature === 'village' && this.type === 'building') {
        return '$vuetify.upgrade.build';
      }
      return undefined;
    },
    translationSet() {
      if (this.feature === 'village' && this.type === 'building') {
        return 'building';
      }
      return 'default';
    },
    cacheKey() {
      return `${ this.feature }_${ this.subfeature }_${ this.type }`;
    }
  },
  methods: {
    setListFilter(value) {
      this.$store.commit('system/updateKey', {key: 'listFilter', value});
    },
    viewUnlockItems() {
      this.setListFilter('');
      this.viewUnlock = true;
    },
  },
  watch: {
    page(newVal) {
      this.$store.commit('system/updateCachePageKey', {key: this.cacheKey, value: newVal});
    },
    pages(newVal) {
      if (this.page > newVal) {
        this.page = Math.max(newVal, 1);
      } else if (this.page <= 0 && newVal > 0) {
        this.page = 1;
      }
    }
  }
}
</script>
