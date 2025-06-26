<style scoped>
.queue-item {
  touch-action: none;
}
.queue-item-progress {
  position: absolute;
  left: 0;
  height: 100%;
  opacity: 0.4;
}
</style>

<template>
  <v-card class="d-flex flex-column justify-space-between ma-2" v-if="enable && queue.length > 0">
    <div class="d-flex flex-column align-center pa-1">
      <div class="text-center" @click="expanded = !expanded" style="cursor: pointer;">
        <span>自动升级队列</span>
        <v-icon small class="ml-2">{{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </div>
      <div v-if="expanded && queue.length > 0" class="d-flex flex-wrap align-center">
        <div
          class="queue-item"
          v-for="(item, key) in queue"
          :key="key"
          :id="`${ queueKeyName }-${ key }`"
          draggable
          @dragstart="drag($event, queueLength - key)"
          @drop="drop($event, key)"
          @dragover.prevent
          @touchstart="touchdrag(queueLength - key)"
          @touchend="touchdrop($event)"
        >
          <v-chip label class="ma-1" close @click:close="removeItem(item)" :color="upgrades[item].cap && upgrades[item].bought === upgrades[item].cap ? 'error' : ''">
            {{ key + 1 }}
            {{ $vuetify.lang.t(`$vuetify.upgrade.${item}`) }}
            <div
              class="queue-item-progress"
              :class="upgrades[item].buyProgress < 0 ? 'error' : 'primary'"
              :style="{'width': `${(upgrades[item].buyProgress < 0 ? 1 + upgrades[item].buyProgress : upgrades[item].buyProgress) * 100}%`}"
            ></div>
          </v-chip>
        </div>
        <v-spacer></v-spacer>
      </div>
    </div>
  </v-card>
</template>

<script>
import { mapState } from 'vuex';

export default {
  props: {
    feature: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    }
  },
  data: () => ({
    touchId: null,
    expanded: false
  }),
  computed: {
    ...mapState({
      upgrades: state => state.upgrade.item,
      enable: state => state.system.settings.cheat.items.autoUpgrade.value
    }),
    queue() {
      return this.$store.state.upgrade.autoQueue[this.list]||[];
    },
    queueLength() {
      return this.queue.length - 1;
    },
    list() {
      return `${this.feature}_${this.type}`;
    },
    queueKeyName() {
      return `queue-${ this.feature }-${ this.type }`;
    },
  },
  methods: {
    drag(ev, id) {
      ev.dataTransfer.setData("text", id);
    },
    drop(ev, id) {
      ev.preventDefault();
      const draggedId = this.queueLength - parseInt(ev.dataTransfer.getData("text"));
      if (draggedId >= 0) {
        this.switchQueue(draggedId, id);
      }
    },
    touchdrag(id) {
      this.touchId = id;
    },
    touchdrop(ev) {
      if (this.touchId !== null) {
        const draggedId = this.queueLength - this.touchId;
        this.touchId = null;
        const elemList = document.elementsFromPoint(ev.changedTouches[0].clientX, ev.changedTouches[0].clientY);
        if (draggedId >= 0 && elemList) {
          const endElem = elemList.find(el => el.id.slice(0, this.queueKeyName.length) === this.queueKeyName);
          if (endElem) {
            const endIdSplit = endElem.id.split('-');
            const endId = parseInt(endIdSplit[endIdSplit.length - 1]);
            this.switchQueue(draggedId, endId);
          }
        }
      }
    },
    switchQueue(startId, endId) {
      let queue = [...this.queue];
      const oldValue = queue[startId];
      queue[startId] = queue[endId];
      queue[endId] = oldValue;
      this.$store.commit('upgrade/updateAutoQueue', {list: this.list, queue});
    },
    removeItem(item) {
      this.$store.commit('upgrade/removeFromAutoQueue', {list: this.list, item});
    }
  }
}
</script>
