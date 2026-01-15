<style scoped>
.shape-table-sm {
  border-spacing: 4px;
}
.shape-table-sm .shape-cell {
  border-radius: 4px;
  width: 36px;
  height: 36px;
}
.shape-table-lg {
  border-spacing: 6px;
}
.shape-table-lg .shape-cell {
  border-radius: 6px;
  width: 64px;
  height: 64px;
}
.shape-icon-disabled {
  opacity: 0.2;
}
.shape-cell {
  position: relative;
}
.shape-bg {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  opacity: 0.25;
}
.shape-table-sm .shape-bg {
  border-radius: 4px;
}
.shape-table-lg .shape-bg {
  border-radius: 6px;
}
.grid-stat-lg {
  position: absolute;
  top: 50px;
}
</style>

<template>
  <div>
    <table ref="grid" class="mx-auto" :class="{
      'shape-table-sm': $vuetify.breakpoint.smAndDown,
      'shape-table-lg': $vuetify.breakpoint.mdAndUp,
      'selected-primary': cheating,
    }">
      <tr v-for="(row, y) in shapeGrid" :key="'shape-row-' + y">
        <td
          class="shape-cell text-center bg-tile-default elevation-2"
          v-for="(cell, x) in row"
          :key="'field-cell-' + y + '-' + x"
          @click="selectTile(x, y)"
          :id="`galleryShape_${ x }_${ y }`"
          draggable
          @dragstart="drag(x, y)"
          @drop="drop($event, x, y)"
          @dragenter="dragOver(x, y)"
          @dragover="allowDrop"
          @touchend="touchdrop($event, x, y)"
        >
          <div v-if="shapeList[cell].unlocked && !shapeList[cell].isSpecial" class="shape-bg" :class="shapeList[cell].color"></div>
          <v-badge
            :content="$formatTime(hourglassTime)"
            :value="cell === 'hourglass'"
            bottom
            left
            offset-x="52"
            offset-y="16"
          >
            <v-icon
              :size="(shapeList[cell].isSpecial ? 48 : 36) * ($vuetify.breakpoint.smAndDown ? 0.75 : 1)"
              :color="shapeList[cell].color"
              :class="{'shape-icon-disabled': !shapeList[cell].unlocked}"
            >{{ shapeList[cell].icon }}</v-icon>
          </v-badge>
        </td>
      </tr>
    </table>
    <v-sheet
      class="d-flex flex-column justify-center mx-auto"
      :class="{'grid-stat-lg': $vuetify.breakpoint.mdAndUp}"
      :width="$vuetify.breakpoint.mdAndUp ? 70 : 360"
      :style="{left: `${gridStatLeft}px`}"
    >
      <div class="d-flex flex-wrap justify-center">
        <gb-tooltip v-if="accelerator" title-text="跳过">
          <template v-slot:activator="{ on, attrs }">
            <v-icon small class="ma-1" v-bind="attrs" v-on="on">mdi-help-circle</v-icon>
          </template>
          <div>不需要拖动形状，直接收集对应形状</div>
          <div>和正常收集一样，只能收集存在至少5个的形状</div>
          <div>不计入连接数目成就</div>
          <div>
            <span class="mr-1">以及每个形状需要花费</span>
            <price-tag currency="gallery_motivation" :amount="5"></price-tag>
          </div>
        </gb-tooltip>
        <template v-for="(stat, index) in gridStat">
          <v-divider v-if="stat.amount < 5 && gridStat[index-1] && gridStat[index-1].amount > 4" :key="`grid-stat-hr-${index}`" class="ma-1 primary" style="flex-basis: 100%;"></v-divider>
          <div
            :key="`grid-stat-1-${index}`"
            class="bg-tile-default px-2 py-1 ma-1 d-flex align-center justify-center elevation-2 rounded"
            style="position: relative;"
            :style="{'cursor': accelerator ? 'pointer' : ''}"
            @click="directCollect(stat)"
          >
            <div class="shape-bg rounded" :class="currency[`gallery_${stat.shape}`].color"></div>
            <v-icon
              class="mr-1"
              :color="currency[`gallery_${stat.shape}`].color"
              :size="16"
            >{{ currency[`gallery_${stat.shape}`].icon }}</v-icon>
            <span class="balloon-text-dynamic text-caption"
              style="position: relative; z-index: 1;"
            >{{ stat.amount }}{{ stat.upgrade ? ' *' : '' }}</span>
          </div>
        </template>
      </div>
    </v-sheet>
    <div class="d-flex flex-wrap justify-center align-center ma-1">
      <gb-tooltip :title-text="$vuetify.lang.t('$vuetify.gallery.shapes.name')">
        <template v-slot:activator="{ on, attrs }">
          <v-icon class="ma-1" v-bind="attrs" v-on="on">mdi-help-circle</v-icon>
        </template>
        <div>{{ $vuetify.lang.t('$vuetify.gallery.shapes.description') }}</div>
        <div>
          <span>{{ $vuetify.lang.t('$vuetify.gallery.shapes.cost') }}&nbsp;</span>
          <price-tag currency="gallery_motivation" :amount="1"></price-tag>
        </div>
      </gb-tooltip>
      <gb-tooltip v-if="specialShapeList.length > 0" :title-text="$vuetify.lang.t('$vuetify.gallery.shapes.special.name')">
        <template v-slot:activator="{ on, attrs }">
          <v-icon class="ma-1" v-bind="attrs" v-on="on">mdi-multiplication-box</v-icon>
        </template>
        <div>{{ $vuetify.lang.t('$vuetify.gallery.shapes.special.description', $formatNum(specialShapeChance * 100, true), $formatNum(specialShapeMult, true)) }}</div>
        <div v-for="item in specialShapeList" :key="`special-shape-${ item }`">
          <v-icon x-small class="mr-1" :color="shapeList[item].color">{{ shapeList[item].icon }}</v-icon>
          <span>{{ $vuetify.lang.t(`$vuetify.gallery.shapes.${ item }`) }} - {{ $vuetify.lang.t(`$vuetify.gallery.shapes.special.${ item }`) }}</span>
        </div>
        <h3 class="text-center">{{ $vuetify.lang.t('$vuetify.mult.gallerySpecialShapeChance') }}</h3>
        <stat-breakdown name="gallerySpecialShapeChance"></stat-breakdown>
        <h3 class="text-center">{{ $vuetify.lang.t('$vuetify.mult.gallerySpecialShapeMult') }}</h3>
        <stat-breakdown name="gallerySpecialShapeMult"></stat-breakdown>
      </gb-tooltip>
      <gb-tooltip :min-width="0">
        <template v-slot:activator="{ on, attrs }">
          <div v-bind="attrs" v-on="on">
            <v-btn class="ma-1" width="36" min-width="36" color="primary" :disabled="!canBuyReroll" @click="buyShapeReroll"><v-icon>mdi-cached</v-icon></v-btn>
          </div>
        </template>
        <div class="mt-0">
          <span>{{ $vuetify.lang.t('$vuetify.gallery.shapes.reroll') }}&nbsp;</span>
          <price-tag currency="gallery_motivation" :amount="rerollCost"></price-tag>
        </div>
      </gb-tooltip>
      <gb-tooltip :min-width="0" v-if="unlockedAllShapes && accelerator">
        <template v-slot:activator="{ on, attrs }">
          <div v-bind="attrs" v-on="on">
              <v-btn class="ma-1" width="36" min-width="36" :color="cheating ? 'error' : 'primary'" @click="cheating = !cheating"><v-icon>mdi-rotate-orbit</v-icon></v-btn>
          </div>
        </template>
        <div class="mt-0">
          <span>选择一个形状变成加速器</span>
        </div>
      </gb-tooltip>
      <currency class="ma-1" name="gallery_motivation" large></currency>
      <consumable class="ma-1" name="gallery_surpriseParty" :disabled="!canBuyMotivation" @click="buyMotivation"></consumable>
      <currency v-for="item in currencies.slice(1)" :key="item" class="ma-1" :name="item" :gainBase="1"></currency>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { GALLERY_MOTIVATION_BUY_AMOUNT, GALLERY_REROLL_COST, GALLERY_SHAPES_GRID_WIDTH, GALLERY_SHAPES_GRID_HEIGHT } from '../../../js/constants';
import Consumable from '../../render/Consumable.vue';
import Currency from '../../render/Currency.vue';
import PriceTag from '../../render/PriceTag.vue';
import StatBreakdown from '../../render/StatBreakdown.vue';
const shapeUpgrades = {
  circle: ['bigCircle', 'wellDrawnCircle'],
  rectangle: ['bigRectangle', 'wellDrawnRectangle'],
  triangle: ['creativity', 'wellDrawnTriangle'],
  star: ['luckyStar', 'wellDrawnStar'],
  ellipse: ['bigEllipse', 'wellDrawnEllipse'],
  heart: ['bigHeart', 'wellDrawnHeart'],
  square: ['bigSquare', 'wellDrawnSquare'],
  octagon: ['bigOctagon', 'wellDrawnOctagon'],
  pentagon: ['bigPentagon', 'wellDrawnPentagon'],
  hexagon: ['bigHexagon', 'wellDrawnHexagon'],
};

export default {
  components: { Currency, PriceTag, StatBreakdown, Consumable },
  data: () => ({
    dragX: null,
    dragY: null,
    gridStatLeft: 0,
    cheating: false,
    cheatPosition: {x: 1, y: 1}
  }),
  mounted() {
    this.gridStatLeft = this.$refs['grid'].offsetLeft + this.$refs['grid'].offsetWidth + 50;
  },
  computed: {
    ...mapState({
      shapeList: state => state.gallery.shape,
      shapeGrid: state => state.gallery.shapeGrid,
      currency: state => state.currency,
      accelerator: state => state.system.settings.cheat.items.galleryAccelerator.value
    }),
    ...mapGetters({
      hourglassTime: 'gallery/hourglassTime'
    }),
    currencies() {
      return this.$store.getters['currency/list']('gallery', 'shape');
    },
    specialShapeChance() {
      return this.$store.getters['mult/get']('gallerySpecialShapeChance');
    },
    specialShapeMult() {
      return this.$store.getters['mult/get']('gallerySpecialShapeMult');
    },
    specialShapeList() {
      let arr = [];
      for (const [key, elem] of Object.entries(this.shapeList)) {
        if (elem.isSpecial && elem.unlocked) {
          arr.push(key);
        }
      }
      return arr;
    },
    rerollCost() {
      return GALLERY_REROLL_COST;
    },
    canBuyReroll() {
      return this.$store.getters['currency/value']('gallery_motivation') >= GALLERY_REROLL_COST;
    },
    canBuyMotivation() {
      return this.$store.state.unlock.galleryShape.use && this.$store.getters['currency/value']('gallery_motivation') < GALLERY_MOTIVATION_BUY_AMOUNT;
    },
    gridStat() {
      const shapes =  {};
      for(const i in this.shapeList) {
        const shape = this.shapeList[i];
        if(shape.unlocked && !shape.isSpecial) {
          shapes[i] = 0;
        }
      }
      for(const row of this.shapeGrid) {
        for(const cell of row) {
          if(shapes[cell]!==undefined) shapes[cell]++;
        }
      }

      const list = [];
      for(const i in shapes) {
        const stat = {shape: i, amount: shapes[i]};
        stat.upgrade = this.$store.getters['upgrade/canAfford']('gallery', shapeUpgrades[i][0]) || this.$store.getters['upgrade/canAfford']('gallery', shapeUpgrades[i][1]);
        list.push(stat);
      }
      list.sort((a, b) => b.amount-a.amount);
      return list;
    },
    unlockedAllShapes() {
      return this.shapeList.hexagon.unlocked && this.shapeList.chest.unlocked
    }
  },
  methods: {
    selectTile(x, y) {
      if (this.cheating) {
        this.$store.commit('gallery/updateShapeCell', {x, y, value: 'accelerator'});
        this.cheating = false;
        return;
      }
      this.$store.dispatch('gallery/clickShape', {x, y});
    },
    drag(x, y) {
      this.dragX = x;
      this.dragY = y;
    },
    drop(ev, x, y) {
      ev.preventDefault();
      if ((Math.abs(this.dragX - x) + Math.abs(this.dragY - y)) === 1) {
        this.$store.dispatch('gallery/switchShape', {fromX: this.dragX, fromY: this.dragY, toX: x, toY: y});
      }
      this.dragX = null;
      this.dragY = null;
    },
    dragOver(x, y) {
      if ((Math.abs(this.dragX - x) + Math.abs(this.dragY - y)) === 1 && this.$store.getters['currency/canAfford']({gallery_motivation: 1})) {
        this.$store.dispatch('gallery/switchShape', {fromX: this.dragX, fromY: this.dragY, toX: x, toY: y});
        this.dragX = x;
        this.dragY = y;
      }
    },
    allowDrop(ev) {
      ev.preventDefault();
    },
    touchdrop(ev, x, y) {
      const elemList = document.elementsFromPoint(ev.changedTouches[0].clientX, ev.changedTouches[0].clientY);
      if (elemList) {
        const endElem = elemList.find(el => el.id.slice(0, 13) === 'galleryShape_');
        if (endElem) {
          const split = endElem.id.slice(13).split('_');
          const endX = parseInt(split[0]);
          const endY = parseInt(split[1]);
          if ((Math.abs(x - endX) + Math.abs(y - endY)) === 1) {
            this.$store.dispatch('gallery/switchShape', {fromX: x, fromY: y, toX: endX, toY: endY});
          }
        }
      }
    },
    buyShapeReroll() {
      this.$store.dispatch('gallery/buyShapeReroll');
    },
    buyMotivation() {
      const consumables = {gallery_surpriseParty: 1};
      const price = this.$store.getters['consumable/priceMultiple'](consumables).price;
      if (this.$store.state.system.settings.confirm.items.gem.value && this.$store.getters['currency/contains'](price, 'gem')) {
        this.$store.commit('system/updateKey', {key: 'confirm', value: {
          type: 'consumable',
          subtype: 'surpriseParty',
          consumable: consumables,
          price: this.$store.getters['currency/filterPrice'](price, 'gem'),
        }});
      } else {
        this.$store.dispatch('gallery/surpriseParty');
      }
    },
    directCollect(stat) {
      if (stat.amount < 5 || !this.accelerator || this.$store.getters['currency/value']('gallery_motivation') < stat.amount * 5) return;
      let changedGrid = [];
      for (let y = 0; y < GALLERY_SHAPES_GRID_HEIGHT; y++) {
          changedGrid.push(Array(GALLERY_SHAPES_GRID_WIDTH).fill(false));
      }
      for (let x = 0; x < GALLERY_SHAPES_GRID_HEIGHT; x++) {
        for (let y = 0; y < GALLERY_SHAPES_GRID_WIDTH; y++) {
          if (this.shapeGrid[x][y] === stat.shape) {
            changedGrid[x][y] = true;
          }
        }
      }
      this.$store.dispatch('currency/gain', {feature: 'gallery', name: stat.shape, gainMult: true, amount: Math.pow(stat.amount, 2)});
      this.$store.dispatch('currency/spend', {feature: 'gallery', name: 'motivation', amount: 5 * stat.amount});
      if (this.$store.getters['gallery/shapeHasHourglass']) {
        this.$store.commit('gallery/updateKey', {key: 'hourglassCombo', value: this.$store.state.gallery.hourglassCombo + stat.amount});
      }
      this.$store.dispatch('gallery/rerollShapes', changedGrid);
    }
  }
}
</script>
