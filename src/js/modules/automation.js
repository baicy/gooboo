import store from "../../store";

export default {
    name: 'automation',
    tickspeed: 5,
    unlockNeeded: null,
    tick() {
        if (!store.getters['system/checkExtraCheated']('autoUpgrade')) return;
        for (const [key, elem] of Object.entries(store.state.upgrade.autoQueue)) {
            const [feature, subfeature, type] = key.split('_');
            if (store.state.system.features[feature].currentSubfeature !== undefined && !type) {
                store.state.upgrade.autoQueue[key] = [];
                continue;
            }
            if ((store.state.system.features[feature].currentSubfeature === undefined || store.state.system.features[feature].currentSubfeature === Number(subfeature)) && elem.length) {
                store.dispatch('upgrade/applyAutoQueue', key);
            }
        }
    },
}
