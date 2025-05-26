import { getSequence } from "../../../utils/math";
import store from "../../../../store"

const extra = () => store.state.system.settings.cheat.items.eventExtraShop.value;

export default {
    juicyBait: {type: 'weatherChaos', price(lvl) {
        return {event_algae: Math.pow(1.35 + 0.08 * lvl, lvl) * 500};
    }, effect: [
        {name: 'weatherChaosFishSizeMax', type: 'base', value: lvl => lvl * 0.1},
        {name: 'weatherChaosFishSizeMax', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    incubator: {type: 'weatherChaos', price(lvl) {
        return {event_driftwood: Math.pow(1.25 + 0.065 * lvl, lvl) * 250};
    }, effect: [
        {name: 'weatherChaosFishSizeAverage', type: 'base', value: lvl => lvl * 0.2},
        {name: 'weatherChaosFishSizeAverage', type: 'mult', value: lvl => lvl * 0.05 + 1}
    ]},
    fishWhistle: {type: 'weatherChaos', price(lvl) {
        return {event_plastic: Math.pow(1.15 + 0.015 * lvl, lvl) * 100};
    }, effect: [
        {name: 'weatherChaosFishingPower', type: 'base', value: lvl => getSequence(1, lvl) * 0.1 + lvl}
    ]},
    pollution: {type: 'weatherChaos', price(lvl) {
        return {event_slime: Math.pow(1.35, lvl) * 100};
    }, effect: [
        {name: 'weatherChaosTrashGain', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    goldenHook: {type: 'weatherChaos', cap: 4, price(lvl) {
        return {gem_topaz: lvl * 250 + 500};
    }, effect: [
        {name: 'weatherChaosFishingTime', type: 'mult', value: lvl => 1 / (lvl * 0.25 + 1)}
    ]},
    silverHook: {type: 'weatherChaos', cap: 6, requirement: extra, cheat: true, price(lvl) {
        return {event_cloud: Math.pow(1.25, lvl) * 10};
    }, effect: [
        {name: 'weatherChaosFishingTime', type: 'base', value: lvl => lvl * -20}
    ]},
    trashRecycle: {type: 'weatherChaos', cap: 5, requirement: extra, cheat: true, price(lvl) {
        return {event_algae: Math.pow(2 + 0.08 * lvl, lvl) * 100000, event_driftwood: Math.pow(2 + 0.08 * lvl, lvl) * 100000, event_plastic: Math.pow(2 + 0.08 * lvl, lvl) * 100000};
    }, effect: [
        {name: 'weatherChaosTreasureChance', type: 'base', value: lvl => lvl * + 0.005}
    ]},
    rodIronclad: {type: 'weatherChaos', cap: 50, requirement: extra, cheat: true, price(lvl) {
        return {event_driftwood: Math.pow(1 + 0.01 * lvl, lvl) * 150, event_plastic: Math.pow(1 + 0.01 * lvl, lvl) * 180};
    }, effect: [
        {name: 'weatherChaosFishingPower', type: 'base', value: lvl => lvl * 1}
    ]},
    baitBonus: {type: 'weatherChaos', cap: 5, requirement: extra, cheat: true, price(lvl) {
        return {event_algae: Math.pow(1.5 + 0.025 * lvl, lvl) * 500, event_driftwood: Math.pow(1.5 + 0.025 * lvl, lvl) * 600};
    }, effect: [
        {name: 'weatherChaosFishDoubleChance', type: 'base', value: lvl => lvl * 0.05}
    ]},
    entangle: {type: 'weatherChaos', requirement: extra, cheat:true, price(lvl) {
        return {event_algae: Math.pow(1.5, lvl) * 100, event_plastic: Math.pow(1.5, lvl) * 120};
    }, effect: [
        {name: 'currencyEventSlimeGain', type: 'mult', value: lvl => lvl * 0.05 + 1}
    ]},
    incredibleTrip: {type: 'weatherChaos', cap: 1, requirement: ()=> extra && !store.state.weatherChaos.location.ocean.owned, cheat: true, price() {
        return {event_cloud: 500};
    }, effect: [
        {name: 'weatherChaosLocationOcean', type: 'unlock', value: () => true},
    ], onBuy() {
        store.commit('weatherChaos/updateSubkey', {name: 'location', key: 'ocean', subkey: 'owned', value: true});
    }},
}
