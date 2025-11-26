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
      <div v-if="$store.getters['system/checkExtraCheated']('extraToolbar')" class="d-flex mx-2 py-1 bg-tile-default align-center justify-center">
        <gb-tooltip :min-width="0">
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" min-width="36" width="36" elevation="5" :color="filter ? currency[filter].color : ''" @click="viewFilter = !viewFilter;">
              <v-icon>{{ filter ? currency[filter].icon : 'mdi-filter' }}</v-icon>
            </v-btn>
          </template>
          <div>点击显示升级项需要用到的材料</div>
          <div>升级项收起可将其加入黑名单</div>
        </gb-tooltip>
        <v-btn :color="listSort ? 'primary' : ''" class="ml-1" @click="setListSort" min-width="36" width="36" elevation="5">
          <v-icon>mdi-order-bool-descending-variant</v-icon>
        </v-btn>
        <gb-tooltip v-if="unlockItems.length">
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="error" v-bind="attrs" v-on="on" @click="viewUnlockItems" width="36" min-width="36" elevation="5" class="ml-1">
            <v-icon>mdi-eye-lock-open</v-icon>
          </v-btn>
          </template>
          <div>提前查看未解锁升级项，无法购买</div>
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
        <gb-tooltip :min-width="0" v-if="feature === 'event'">
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" min-width="36" width="36" elevation="5" color="error" @click="viewReset = true" class="ml-1">
              <v-icon>mdi-restart</v-icon>
            </v-btn>
          </template>
          <div>重置升级列表</div>
        </gb-tooltip>
        <v-dialog :width="400" v-model="viewReset">
          <v-card class="default-card pt-6">
            <v-card-title>是否确认重置升级列表</v-card-title>
            <v-card-text>
              <div>重置该列表所有升级项并返还所用资源</div>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" @click="viewReset = false">{{ $vuetify.lang.t('$vuetify.gooboo.cancel') }}</v-btn>
              <v-btn color="primary" @click="resetAll">{{ $vuetify.lang.t('$vuetify.gooboo.confirm') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
      <div v-if="viewFilter" class="d-flex flex-wrap bg-tile-background px-2 justify-center my-1" style="gap: 8px">
        <gb-tooltip v-for="mat in materials" :key="mat" :min-width="0" :title-text="$vuetify.lang.t(`$vuetify.currency.${mat}.name`)" >
          <template v-slot:activator="{ on, attrs }">
            <div v-bind="attrs" v-on="on" class="rounded" :class="{'selected-primary': filter === mat}">
              <v-btn
                :color="currency[mat].color"
                class="balloon-text-dynamic"
                :class="[$vuetify.theme.dark ? 'theme--dark darken-3' : 'theme--light lighten-3']"
                :style="{ opacity: neededMaterials.has(mat) ? 1 : 0.5 }"
                min-width="30" width="30" height="30"
                elevation="3"
                @click="() => filter = filter===mat ? '' : mat"
              >
                <v-icon size="16">{{ currency[mat].icon }}</v-icon>
              </v-btn>
            </div>
          </template>
        </gb-tooltip>
      </div>
      <div v-if="filterItems.length > 0 && (pages > 1 || requirementStat.length > 0)" class="d-flex justify-center align-center bg-tile-default rounded-b elevation-2 mx-2" :class="{'pr-10': showQueueSpeed}">
        <v-pagination v-if="pages > 1" v-model="page" :length="pages" :total-visible="7"></v-pagination>
        <gb-tooltip v-for="item in requirementFiltered" :key="item.key" :min-width="0">
          <template v-slot:activator="{ on, attrs }">
            <v-chip small label class="flex-shrink-0 ma-1 px-2" v-bind="attrs" v-on="on"><v-icon class="mr-1">mdi-chevron-double-up</v-icon>{{ $formatNum(requirementNext[item.key].requirementValue) }}</v-chip>
          </template>
          <div class="mt-0">{{ $vuetify.lang.t('$vuetify.upgrade.keyset.default.nextRequirement') }}{{ $formatNum(requirementNext[item.key].requirementValue) }} {{ $vuetify.lang.t(`$vuetify.stat.${ item.stat }.description`) }}</div>
          <display-row v-for="(subitem, key) in item.effect" class="mt-0 mx-1" :key="`next-display-${ item.key }-${ subitem.name }-${ subitem.type }-${ key }`" :name="subitem.name" :type="subitem.type" :after="subitem.after"></display-row>
          <div class="d-flex flex-wrap mt-0">
            <price-tag class="ma-1" v-for="(amount, currency, index) in item.price" :key="'next-price-' + item.key + '-' + currency + '-' + index" :currency="currency" :amount="amount"></price-tag>
          </div>
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
      <div v-if="filterItems.length === 0" class="text-center">{{ $vuetify.lang.t(`$vuetify.upgrade.keyset.${ translationSet }.notFound`) }}</div>
    </div>
    <auto-queue :feature="feature" :subfeature="subfeature" :type="type"></auto-queue>
    <v-row v-if="filterItems.length > 0"  class="pa-1" no-gutters>
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
import { UPGRADE_IS_BOOL } from '../../js/constants';
import { capitalize } from '../../js/utils/format';
import AlertText from '../partial/render/AlertText.vue';
import DisplayRow from '../partial/upgrade/DisplayRow.vue';
import PriceTag from './PriceTag.vue';
import StatBreakdown from './StatBreakdown.vue';
import Upgrade from './Upgrade.vue';
import UnlockUpgrade from './UnlockUpgrade.vue';
import AutoQueue from './AutoQueue.vue';

export default {
  components: { Upgrade, StatBreakdown, AlertText, DisplayRow, PriceTag , UnlockUpgrade, AutoQueue },
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
    viewFilter: false,
    filter: '',
    mats: new Set(),
    viewReset: false
  }),
  mounted() {
    const cachePage = this.$store.state.system.cachePage[this.cacheKey];
    if (cachePage !== undefined) {
      this.page = Math.min(Math.max(cachePage, 1), this.pages);
    }
  },
  computed: {
    ...mapState({
      listSort: state => state.system.listSort,
      currency: state => state.currency,
      stat: state => state.stat,
    }),
    baseItems() {
      return [...this.$store.state.upgrade.cache[`${this.feature}_${this.subfeature}_${this.type}`]];
    },
    items() {
      const list = this.baseItems.filter(elem => {
        const upgrade = this.$store.state.upgrade.item[elem];
        return upgrade.requirement(upgrade.level);
      });
      list.forEach(elem => {
        this.$store.dispatch('upgrade/updateProgress', elem);
      });
      if (this.$store.getters['system/checkExtraCheated']('extraToolbar') && this.listSort) {
        return list.sort((a, b) => this.$store.state.upgrade.item[b].buyProgress - this.$store.state.upgrade.item[a].buyProgress);
      }
      return list;
    },
    filterItems() {
      const list = this.items;
      if (this.filter) {
        return list.filter(elem => {
          const upgrade = this.$store.state.upgrade.item[elem];
          const price = upgrade.price(upgrade.level);
          return Object.keys(price).includes(this.filter);
        });
      }
      return list;
    },
    finalItems() {
      if (this.upgradeLimit === null) {
        return this.items;
      }
      return this.filterItems.slice(this.upgradeLimit * (this.page - 1), this.upgradeLimit * this.page);
    },
    materials() {
      const mats = new Set();
      this.items.forEach(elem => {
        const upgrade = this.$store.state.upgrade.item[elem];
        const price = upgrade.price(upgrade.level);
        Object.keys(price).forEach(mat => this.stat[mat].total > 0 && mats.add(mat));
      });
      return mats;
    },
    neededMaterials() {
      const mats = new Set();
      this.items.forEach(elem => {
        const upgrade = this.$store.state.upgrade.item[elem];
        if (!upgrade.collapse) {
          const price = upgrade.price(upgrade.level);
          Object.keys(price).forEach(mat => this.stat[mat].total > 0 && mats.add(mat));
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
      return this.upgradeLimit === null ? null : Math.ceil(this.filterItems.length / this.upgradeLimit);
    },
    requirementNext() {
      return this.requirementStat.map(statName => {
        let next = null;
        let stat = 0;
        if (statName.split('_')[0] === 'custom') {
          switch (statName.split('_')[1]) {
            case 'hordeBattlepass':
              stat = this.$store.getters['horde/battlePassCurrentLevel'];
              break;
            default:
              stat = 0;
              break;
          }
        } else {
          stat = this.$store.state.stat[statName].total;
        }
        this.baseItems.forEach(elem => {
          const upgrade = this.$store.state.upgrade.item[elem];
          if (upgrade.requirementValue !== null && upgrade.requirementStat === statName && stat < upgrade.requirementValue && (next === null || upgrade.requirementValue < next)) {
            next = upgrade;
          }
        });
        return next;
      });
    },
    requirementFiltered() {
      return this.requirementStat.map((el, key) => {
        if (this.requirementNext[key] === null) {
          return {stat: el, effect: [], price: {}, key};
        }
        const effect = this.requirementNext[key].effect.map(elem => {
          return {
            ...elem,
            after: elem.value(1)
          };
        }).filter(elem => {
          const isBool = UPGRADE_IS_BOOL.includes(elem.type);
          return (isBool && elem.after) || (!isBool && elem.after !== null);
        });
        return {
          stat: el,
          effect,
          price: this.requirementNext[key].price(0),
          key,
        };
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
    setListSort() {
      this.$store.commit('system/updateKey', {key: 'listSort', value: !this.listSort});
    },
    viewUnlockItems() {
      this.viewUnlock = true;
    },
    resetAll() {
      const items = this.$store.state.upgrade.item;
      for (const [, elem] of Object.entries(items)) {
        if (elem.feature === this.feature && elem.type === this.type && elem.bought > 0) {
          for (let i = 0; i < elem.bought; i++) {
            for (const [mat, amount] of Object.entries(elem.price(i))) {
              const [f, n] = mat.split('_');
              this.$store.dispatch('currency/gain', {feature: f, name: n, amount});
            }
          }
        }
      }
      this.$store.dispatch('upgrade/reset', {feature: 'event', type: this.type});
      this.viewReset = false;
    }
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
