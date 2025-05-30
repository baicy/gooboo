<template>
  <v-card>
    <v-card-title class="pa-2 justify-center">{{ $vuetify.lang.t(`$vuetify.feature.${ name }`) }}</v-card-title>
    <v-card-text class="py-0">
      <template v-for="sub in finalSubfeatures">
        <gb-tooltip :key="`progress-${sub}`">
          <template v-slot:activator="{ on, attrs }">
            <v-progress-linear class="rounded balloon-text-dynamic" height="20" :value="expPercents[sub]" v-bind="attrs" v-on="on">{{ $vuetify.lang.t('$vuetify.gooboo.level') }}{{ feature.level[sub] }} ({{ $formatNum(expPercents[sub], true) }}% / {{ $formatTime((expNeededs[sub] - feature.exp[sub]) / expGain[sub] * 86400) }})</v-progress-linear>
          </template>
          <template v-if="expGain[sub] > 0">
            <div>{{ $vuetify.lang.t(`$vuetify.cryolab.expDescription`, $formatNum(feature.exp[sub]), $formatNum(expNeededs[sub]), $formatNum(expGain[sub]))}}</div>
            <div>{{ $vuetify.lang.t(`$vuetify.cryolab.expDescription2`) }}</div>
          </template>
          <alert-text v-else type="error">{{ $vuetify.lang.t(`$vuetify.cryolab.expNoGain`) }}</alert-text>
          <div class="text-center">{{ $vuetify.lang.t(`$vuetify.cryolab.expNext`) }}</div>
          <div>
            <display-row v-for="(item, key) in effect[sub]" :key="`${item.name}-${item.type}-${key}`" :name="item.name" :type="item.type" :before="item.before" :after="item.after"></display-row>
          </div>
        </gb-tooltip>
        <div class="d-flex justify-center align-center ma-1" :key="`title-${sub}`">
          <gb-tooltip :title-text="$vuetify.lang.t(`$vuetify.cryolab.passiveTitle`)">
            <template v-slot:activator="{ on, attrs }">
              <div :class="{'primary--text': !feature.active}" v-bind="attrs" v-on="on">{{ $vuetify.lang.t('$vuetify.cryolab.passive', $formatNum(passiveMults[sub] * 100, true)) }}</div>
            </template>
            <div>{{ $vuetify.lang.t('$vuetify.cryolab.passiveDescription', $formatNum(passiveMults[sub] * 100, true)) }}</div>
            <stat-breakdown :name="passiveMultNames[sub]"></stat-breakdown>
          </gb-tooltip>
          <v-icon>mdi-circle-small</v-icon>
          <gb-tooltip :title-text="$vuetify.lang.t(`$vuetify.cryolab.activeTitle`)">
            <template v-slot:activator="{ on, attrs }">
              <div :class="{'primary--text': feature.active}" v-bind="attrs" v-on="on">{{ $vuetify.lang.t('$vuetify.cryolab.active', $formatNum(activeMults[sub] * 100, true)) }}</div>
            </template>
            <div>{{ $vuetify.lang.t('$vuetify.cryolab.activeDescription', $formatNum(activeMults[sub] * 100, true)) }}</div>
            <stat-breakdown :name="activeMultNames[sub]"></stat-breakdown>
          </gb-tooltip>
        </div>
      </template>
      <div class="d-flex flex-wrap mx-n1">
        <template v-for="(amount, currency) in prestigeGain">
          <gb-tooltip v-if="currency === 'farm_exp'" :key="`currency-gain-${ currency }`" :min-width="0">
            <template v-slot:activator="{ on, attrs }">
              <v-chip class="ma-1 px-2 balloon-text-dynamic" label small color="cyan" :class="$vuetify.theme.dark ? 'theme--dark darken-3' : 'theme--light lighten-3'" v-bind="attrs" v-on="on">
                <v-icon size="12" class="mr-2">mdi-star</v-icon>
                <span>+{{ $formatNum(amount) }}/d</span>
              </v-chip>
            </template>
            <div class="mt-0">{{ $vuetify.lang.t(`$vuetify.cryolab.cropExp`) }}</div>
          </gb-tooltip>
          <price-tag v-else class="ma-1" :key="`currency-gain-${ currency }`" add :currency="currency" :amount="amount">
            <template slot="suffix">/d</template>
          </price-tag>
        </template>
      </div>
    </v-card-text>
    <v-card-actions class="justify-center">
      <v-btn :color="feature.active ? 'cyan' : 'secondary'" :disabled="!canFreeze" @click="toggleActive"><v-icon>mdi-snowflake</v-icon></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import PriceTag from '../../render/PriceTag.vue';
import StatBreakdown from '../../render/StatBreakdown.vue';
import AlertText from '../render/AlertText.vue';
import DisplayRow from '../upgrade/DisplayRow.vue';

export default {
  components: { StatBreakdown, DisplayRow, PriceTag, AlertText },
  props: {
    name: {
      type: String,
      required: true
    },
    cheater: {
      type: Boolean
    }
  },
  computed: {
    feature() {
      return this.$store.state.cryolab[this.name];
    },
    subfeatures() {
      return new Array(this.feature.data.length).fill(0).map((_,i) => i);
    },
    finalSubfeatures() {
      return this.$store.getters['system/checkExtraCheated']('allSubfeatureCryolab') ? this.subfeatures : [this.subfeature];
    },
    subfeature() {
      return this.$store.state.system.features[this.name].currentSubfeature;
    },
    expNeededs() {
      return this.subfeatures.map(sub => this.$store.getters['cryolab/expNeeded'](this.feature.level[sub]));
    },
    expPercents() {
      return this.subfeatures.map(sub => 100 * this.feature.exp[sub] / this.expNeededs[sub]);
    },
    passiveMultNames() {
      return this.subfeatures.map(sub => `${ this.name }CryolabPassive${ sub }`);
    },
    activeMultNames() {
      return this.subfeatures.map(sub => `${ this.name }CryolabActive${ sub }`);
    },
    passiveMults() {
      return this.subfeatures.map(sub => this.$store.getters['mult/get'](this.passiveMultNames[sub]));
    },
    activeMults() {
      return this.subfeatures.map(sub => this.$store.getters['mult/get'](this.activeMultNames[sub]));
    },
    effect() {
      return this.feature.effect.map((e, sub) => e.map(elem => {
        const level = this.feature.level[sub];
        return {
            ...elem,
            before: level > 0 ? elem.value(level) : null,
            after: elem.value(level + 1)
          };
        })
      );
    },
    canFreeze() {
      return this.feature.active || this.$store.getters['cryolab/currentFrozen'] < this.$store.getters['mult/get']('cryolabMaxFeatures');
    },
    expGain() {
      const gains = [];
      for(const sub in this.subfeatures) {
        gains.push(this.$store.getters['cryolab/expGain'](this.name, sub));
      }
      return gains;
    },
    prestigeGain() {
      return this.$store.getters['cryolab/prestigeGain'](this.name);
    }
  },
  methods: {
    toggleActive() {
      this.$store.dispatch('cryolab/toggleActive', this.name);
    }
  }
}
</script>
