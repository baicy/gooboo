import store from "../../store";

export default {
    name: 'automation',
    tickspeed: 5,
    unlockNeeded: null,
    tick() {
        if (!store.getters['system/checkExtraCheated']('autoUpgrade')) return;
        for (const [key] of Object.entries(store.state.upgrade.autoQueue)) {
            store.dispatch('upgrade/applyAutoQueue', key);
        }
    },
}
