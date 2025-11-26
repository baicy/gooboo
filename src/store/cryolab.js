import Vue from "vue";
import { SECONDS_PER_DAY } from "../js/constants";

export default {
    namespaced: true,
    state: {},
    getters: {
        expNeeded: () => (level) => {
            return Math.pow(level + 2, 2) * Math.pow(2, level) * 25;
        },
        currentFrozen: (state) => {
            let frozen = 0;
            for (const [, elem] of Object.entries(state)) {
                if (elem.active) {
                    frozen++;
                }
            }
            return frozen;
        },
        featureIsFrozen: (state, getters, rootState) => {
            return !!state[rootState.system.screen]?.active;
        },
        expGain: (state, getters, rootState) => (feature, subfeature) => {
            let canGain = true;
            const globalLevel = rootState.meta.globalLevelParts[feature + '_' + subfeature] ?? 0;
            for (const [, stat] of Object.entries(state[feature].data[subfeature])) {
                if (rootState.stat[stat].total <= 0) {
                    canGain = false;
                }
            }
            return canGain ? Math.round(Math.pow(1.015, globalLevel) * globalLevel * 2) : 0;
        },
        prestigeGain: (state, getters, rootState, rootGetters) => (feature) => {
            const subfeature = rootState.system.features[feature].currentSubfeature;
            let obj = {};
            state[feature].data.forEach((data, index) => {
                const gainMult = rootGetters['mult/get'](`${ feature }Cryolab${ ((rootGetters['system/checkExtraCheated']('allSubfeatureCryolab') || subfeature === index) && state[feature].active) ? 'Active' : 'Passive' }${ index }`);
                if (gainMult > 0) {
                    for (const [currency, stat] of Object.entries(data)) {
                        const statValue = rootState.stat[stat].total;
                        if (statValue > 0) {
                            obj[currency] = statValue * gainMult * (stat === 'farm_bestPrestige' ? 500 : 1);
                        }
                    }
                }
            });
            return obj;
        }
    },
    mutations: {
        init(state, o) {
            const effect = o.effect ?? [[]];
            Vue.set(state, o.name, {
                unlock: o.unlock ?? null,
                active: false,
                exp: effect.map(() => 0),
                level: effect.map(() => 0),
                data: o.data ?? [{}],
                effect
            });
        },
        updateKey(state, o) {
            Vue.set(state[o.name], o.key, o.value);
        },
        updateSubfeatureKey(state, o) {
            Vue.set(state[o.name][o.key], o.subfeature, o.value);
        }
    },
    actions: {
        cleanState({ state, commit }) {
            for (const [key, elem] of Object.entries(state)) {
                commit('updateKey', {name: key, key: 'active', value: false});
                commit('updateKey', {name: key, key: 'exp', value: elem.effect.map(() => 0)});
                commit('updateKey', {name: key, key: 'level', value: elem.effect.map(() => 0)});
            }
        },
        toggleActive({ state, getters, rootGetters, commit }, name) {
            if (state[name].active || getters.currentFrozen < rootGetters['mult/get']('cryolabMaxFeatures')) {
                commit('updateKey', {name, key: 'active', value: !state[name].active});
            }
        },
        init({ commit, rootState }, o) {
            let modifiedEffect = [];
            (o.effect ?? [[]]).forEach((effect, subfeature) => {
                const activeMultName = `${ o.name }CryolabActive${ subfeature }`;
                const passiveMultName = `${ o.name }CryolabPassive${ subfeature }`;
                const featureMult = (o.name === 'village' && !rootState.system.settings.cheat.items.oldVillageCryolab.value) ? 0.4 : 1;
                modifiedEffect.push([
                    {name: activeMultName, type: 'base', value: lvl => lvl * featureMult * 0.01},
                    {name: passiveMultName, type: 'base', value: lvl => lvl * featureMult * 0.005},
                    ...effect
                ]);
                commit('mult/init', {feature: 'cryolab', name: activeMultName, display: 'percent', baseValue: 0.2 * featureMult}, {root: true});
                commit('mult/init', {feature: 'cryolab', name: passiveMultName, display: 'percent'}, {root: true});
            });
            commit('init', {...o, effect: modifiedEffect});
        },
        gainExp({ state, rootState, getters, rootGetters, commit, dispatch }, o) {
            const { currentSubfeature, subfeatures } = rootState.system.features[o.feature];
            const features = rootGetters['system/checkExtraCheated']('allSubfeatureCryolab') ? [ 0, ...Object.keys(subfeatures).map( n=> parseInt(n)+1) ] : [ currentSubfeature ];
            features.forEach(sub => {
                let exp = state[o.feature].exp[sub] + getters.expGain(o.feature, sub) * o.seconds / SECONDS_PER_DAY;
                const oldLevel = state[o.feature].level[sub];
                let newLevel = oldLevel;

                while (exp >= getters.expNeeded(newLevel)) {
                    exp -= getters.expNeeded(newLevel);
                    newLevel++;
                    dispatch('note/find', 'cryolab_1', {root: true});
                }

                commit('updateSubfeatureKey', {name: o.feature, subfeature: sub, key: 'exp', value: exp});
                if (newLevel > oldLevel) {
                    commit('updateSubfeatureKey', {name: o.feature, subfeature: sub, key: 'level', value: newLevel});
                    dispatch('applyLevelEffects', {feature: o.feature, subfeature: sub});
                }
            })
        },
        applyLevelEffects({ state, dispatch }, o) {
            let level = state[o.feature].level[o.subfeature];
            if (level > 0) {
                state[o.feature].effect[o.subfeature].forEach(eff => {
                    dispatch('system/applyEffect', {
                        type: eff.type,
                        name: eff.name,
                        multKey: `cryolab_${ o.feature }_${ o.subfeature }`,
                        value: eff.value(level)
                    }, {root: true});
                });
            } else {
                state[o.feature].effect[o.subfeature].forEach(eff => {
                    dispatch('system/resetEffect', {
                        type: eff.type,
                        name: eff.name,
                        multKey: `cryolab_${ o.feature }_${ o.subfeature }`
                    }, {root: true});
                });
            }
        },
    }
}
