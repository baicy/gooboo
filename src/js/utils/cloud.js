import axios from 'axios';
import store from '../../store';
import { cleanStore } from '../savefile';
import { loadGame } from "@/js/init";

const instance = axios.create({
    baseURL: "https://gamesaves.ggff.eu.org",
    timeout: 30000
});

let saving = false;

instance.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {

        if (error.response) {
            return Promise.reject({
                ...error,
                data: error.response.data
            });
        } else {
            return Promise.reject(error);
        }
    }
);

function cloudNotify(action, err) {
    let message = '';
    let icon = 'mdi-cloud-arrow-up';
    if (action === 'incomplete') {
        message = '用户名或者密码未填写完整';
        icon = 'mdi-cloud-alert';
    }
    if (action === 'local') {
        message = '未找到本地存档，请先进行本地保存';
        icon = 'mdi-content-save-alert';
    }
    if (action === 'list') {
        message = '云存档列表获取失败';
        icon = 'mdi-cloud-arrow-down';
    }
    if (action === 'upload') {
        if (err) {
            message = '云存档上传失败';
        } else {
            message = '云存档上传成功';
        }
    }
    if (action === 'download') {
        if (err) {
            message = '云存档加载失败';
            icon = 'mdi-cloud-alert';
        } else {
            message = '云存档加载成功';
            icon = 'mdi-cloud-alert';
        }
    }
    if (action === 'remark') {
        message = '云存档备注更新失败';
        icon = 'mdi-cloud-alert';
    }
    if (action === 'delete') {
        message = '云存档删除失败';
        icon = 'mdi-cloud-alert';
    }
    store.commit('system/addNotification', {
        color: err ? 'error' : 'info',
        timeout: err ? 5000 : 3000,
        message: { type: 'common', message, icon }
    });
}

function getToken() {
    const user = store.state.system.cloudSave.user;
    const token = store.state.system.cloudSave.pwd;

    if (!user || !token) {
        cloudNotify('incomplete', true);
        return { res: false };
    }
    return {
        res: true,
        data: { user, token }
    }
}

export async function getCloudList() {
    const {res, data} = getToken();
    if (!res) return;
    const response = await instance({
        url: '/list',
        method: 'post',
        data: {
            userId: data.user,
            tokenId: data.token,
            gameId: window.location.hostname
        }
    });
    if (response.success && response.saves) {
        return response.saves;
    } else {
        cloudNotify('list', true);
        return [];
    }
}

export async function saveCloud() {
    if (saving) return;
    const {res, data} = getToken();
    if (!res) return;
    saving = true;
    const saveData = localStorage.getItem('goobooSavefile');
    if (!saveData) {
        cloudNotify('local', true);
        saving = false;
        return;
    }
    const response = await instance({
        url: '/save',
        method: 'post',
        data: {
            userId: data.user,
            tokenId: data.token,
            gameId: window.location.hostname,
            saveData
        }
    });
    saving = false;
    cloudNotify('upload', !response.success);
}

export async function loadCloud(id) {
    const {res, data} = getToken();
    if (!res) return;
    const response = await instance({
        url: '/download',
        method: 'post',
        data: {
            userId: data.user,
            tokenId: data.token,
            gameId: window.location.hostname,
            saveId: parseInt(id)
        }
    });
    if (response.success && response.save && response.save.save_data) {
        cloudNotify('download');
        cleanStore();
        loadGame(response.save.save_data);
    } else {
        cloudNotify('download', true);
    }
}

export async function updateRemark(id, remark) {
    const {res, data} = getToken();
    if (!res) return;
    const response = await instance({
        url: '/listweb',
        method: 'post',
        data: {
            userId: data.user,
            tokenId: data.token,
            gameId: window.location.hostname,
            saveId: parseInt(id),
            action: 'update_memo',
            memo: remark
        }
    });
    if (!response.success) {
        cloudNotify('remark', true);
    }
}

export async function deleteCloud(id) {
    const {res, data} = getToken();
    if (!res) return;
    const response = await instance({
        url: '/del',
        method: 'post',
        data: {
            userId: data.user,
            tokenId: data.token,
            gameId: window.location.hostname,
            saveId: parseInt(id)
        }
    });
    if (!response.success) {
        cloudNotify('delete', true);
    }
}

export default instance;