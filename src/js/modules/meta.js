import store from "../../store";
import { SECONDS_PER_DAY } from "../constants";
import themes from "../theme/themes";
import { buildArray } from "../utils/array";
import { getSequence } from "../utils/math";
import v1_0_0 from "./patchnote/v1_0_0";

export default {
    name: 'meta',
    tickspeed: 5,
    unlockNeeded: null,
    tick() {
        for (const [key, elem] of Object.entries(store.state.system.tutorial)) {
            if (!elem.active && !elem.completed && (elem.screen === null || elem.screen === store.state.system.screen) && elem.enableCondition()) {
                if (elem.currentDelay >= elem.delay) {
                    store.commit('system/updateTutorialKey', {name: key, key: 'active', value: true});
                } else {
                    store.commit('system/updateTutorialKey', {name: key, key: 'currentDelay', value: elem.currentDelay + 1});
                }
            }
        }
    },
    unlock: ['debugFeature'],
    stat: {
        longestOfflineTime: {display: 'time'}
    },
    achievement: {
        totalLevel: {
            value: () => store.getters['achievement/totalLevel'] - store.state.achievement.meta_totalLevel.level,
            milestones: lvl => getSequence(5, lvl + 1) * 10,
            relic: {0: 'excavator', 1: 'redCard', 2: 'briefcase', 3: 'strangePlant', 4: 'beneficialVirus'}
        },
        highestGrade: {value: () => store.state.stat.school_highestGrade.total, display: 'grade', cap: 5, milestones: lvl => (lvl + 1) * 500},
        longestOfflineTime: {value: () => store.state.stat.meta_longestOfflineTime.total, secret: true, display: 'time', cap: 3, milestones: lvl => [SECONDS_PER_DAY * 7, SECONDS_PER_DAY * 30, SECONDS_PER_DAY * 365][lvl]}
    },
    note: buildArray(6).map(() => 'g'),
    init() {
        for (const [key, elem] of Object.entries(themes)) {
            store.commit('system/initTheme', {name: key, ...elem});
        }
        for (const [key, elem] of Object.entries({
            '1.0.0': v1_0_0,
        })) {
            store.commit('system/initPatchnote', {name: key, ...elem});
        }
        for (const [key, elem] of Object.entries({
            miningDepth: {
                screen: 'mining',
                delay: 3,
                cssDesktop: 'top: 135px; left: calc(12.5% - 2px);',
                cssTablet: 'top: 135px; left: calc(50% - 2px);',
                cssMobile: 'top: 127px; left: calc(50% - 2px);'
            },
            miningUpgrade: {
                screen: 'mining',
                enableCondition: () => store.state.stat.mining_maxDepth0.total >= 5,
                delay: 0,
                cssDesktop: 'top: 296px; right: 12px;',
                cssTablet: 'top: 92px; left: calc(75% - 36px);',
                cssMobile: 'top: 84px; left: calc(83.3333% - 36px);'
            },
            viewFeature: {
                enableCondition: () => store.state.unlock.gemFeature.see,
                delay: 5,
                cssDesktop: 'top: 30px; left: 100px; rotate: -30deg;',
                cssTablet: 'top: 30px; left: 100px; rotate: -30deg;',
                cssMobile: 'top: 26px; left: 12px; rotate: -30deg;'
            },
            villageJob: {
                screen: 'village',
                delay: 3,
                cssDesktop: 'top: 208px; left: calc(50% - 107px);',
                cssTablet: 'top: 208px; right: 107px;',
                cssMobile: 'top: 84px; left: calc(37.5% - 36px);'
            }
        })) {
            store.commit('system/initTutorial', {name: key, ...elem});
        }
    }
}