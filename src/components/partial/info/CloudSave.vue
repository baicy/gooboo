<template>
  <v-card class="default-card" elevation="5">
    <v-card-title primary-title class="title">
      <span v-if="config.user && config.pwd">当前用户：{{ config.user }}</span>
      <span v-else>请设置云存档用户信息</span>
    </v-card-title>
    <v-card-text>
      <div v-if="loading" class="d-flex justify-center align-center" style="height: 250px;">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </div>
      <v-list v-else-if="files.length" style="max-height: 250px; overflow-y: auto;">
        <v-list-item
          v-for="file in files"
          :key="file.id"
          :input-value="selectedFile.id === file.id"
          @click="selectedFile = file"
          active-class="primary--text"
        >
          <span>{{ file.memo || '无'  }}</span>
          <v-icon class="ml-1" @click="showEditRemark(file.id, file.memo)">mdi-comment-edit</v-icon>
          <v-spacer></v-spacer>
          <span>{{ file.created_at }}</span>
        </v-list-item>
      </v-list>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-btn color="info" target="_blank" href="https://gamesaves.ggff.eu.org/listweb">管理</v-btn>
      <v-btn color="info" @click="showSetting">设置</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="error" @click="$emit('close')">{{ $vuetify.lang.t('$vuetify.gooboo.cancel') }}</v-btn>
      <v-btn color="primary" @click="loadFile" :disabled="selectedFile.id===-1">加载</v-btn>
      <v-dialog v-model="setting" max-width="400">
        <v-card class="default-card pa-2">
          <v-card-text>
            <alert-text v-if="!config.user || !config.pwd" type="info" class="mt-2">第一次使用即自动注册</alert-text>
            <alert-text type="warning" class="mt-2">请谨记，不提供找回</alert-text>
            <v-text-field v-model.trim="user" label="用户名" outlined dense hide-details clearable class="mt-2"></v-text-field>
            <v-text-field
              v-model.trim="pwd"
              label="密码"
              outlined dense hide-details clearable
              class="mt-2"
              :type="showPwd ? 'text' : 'password'"
              :append-icon="showPwd ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showPwd = !showPwd"
            ></v-text-field>
            <v-text-field v-model.number="autoTime" :step="10" label="自动上传" outlined dense hide-details clearable class="mt-2" suffix="s" type="number"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" @click="setting = false">{{ $vuetify.lang.t('$vuetify.gooboo.cancel') }}</v-btn>
            <v-btn color="primary" @click="saveSetting" :disabled="!!autoTime && autoTime < 0">{{ $vuetify.lang.t('$vuetify.gooboo.saveManual') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="editing" max-width="400">
        <v-card class="default-card">
          <v-card-actions class="">
            <v-text-field v-model.trim="remark" label="备注" dense outlined hide-details clearable></v-text-field>
            <v-btn color="error" class="ml-2" @click="editing = false">{{ $vuetify.lang.t('$vuetify.gooboo.cancel') }}</v-btn>
            <v-btn color="primary" @click="editRemark()" :loading="loading">{{ $vuetify.lang.t('$vuetify.gooboo.saveManual') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState } from 'vuex';
import AlertText from '../render/AlertText.vue';
import { getCloudList, loadCloud, updateRemark } from '@/js/utils/cloud';

export default {
  components: { AlertText },
  data: () => ({
    loading: true,
    files: [],
    selectedFile: { id: -1 },
    setting: false,
    showPwd: false,
    user: null,
    pwd: null,
    autoTime: null,
    editing: false,
    remark: '',
    editId: -1
  }),
  computed: {
    ...mapState({
      config: state => state.system.cloudSave
    })
  },
   mounted() {
    if (!this.config.user) return;
    this.loadList();
  },
  methods: {
    showSetting() {
      this.user = this.config.user;
      this.pwd = this.config.pwd;
      this.autoTime = this.config.autoTime;
      this.setting = true;
    },
    saveSetting() {
      this.$store.commit('system/updateKey', {key: 'cloudSave', value: {
        user: this.user,
        pwd: this.pwd,
        autoTime: this.autoTime
      }});
      this.$store.commit('system/resetCloudAutosaveTimer');
      this.setting = false;
      if (this.user && this.pwd) {
        this.loadList();
      } else {
        this.files = [];
      }
    },
    async loadList() {
      this.files = (await getCloudList()) || [];
      this.loading = false;
    },
    loadFile() {
      loadCloud(this.selectedFile.id);
      this.$emit('close');
    },
    showEditRemark(id, remark) {
      this.editing = true;
      this.editId = id;
      this.remark = remark;
    },
    async editRemark() {
      this.loading = true;
      await updateRemark(this.editId, this.remark);
      this.editing = false;
      this.loadList();
    }
  }
}
</script>