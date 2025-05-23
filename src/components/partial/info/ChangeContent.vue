<template>
  <v-card class="ma-2">
    <v-card-title class="justify-center">修改版声明</v-card-title>
    <v-card-subtitle class="text-center">修改者是 Whiteberry Lee</v-card-subtitle>
    <v-card-text>汉化继承自锅巴汉化组，功能修改点可在下方查看。</v-card-text>
    <v-card-actions class="flex-wrap justify-end">
      <v-spacer></v-spacer>
      <v-badge :value="importantNotice" color="red" overlap dot>
        <v-btn class="ma-1" color="primary" @click="viewChange">
          <v-icon class="mr-2">mdi-vector-difference</v-icon>
          修改点
        </v-btn>
      </v-badge>
      <v-btn class="ma-1" color="primary" target="_blank" href="https://github.com/baicy/gooboo/">
        <v-icon class="mr-2">mdi-github</v-icon>
        {{ $vuetify.lang.t("$vuetify.info.socials.viewCode") }}
      </v-btn>
    </v-card-actions>
    <v-dialog max-width="400" v-model="viewed">
      <v-sheet class="overflow-auto pa-4" max-height="calc(60vh)">
        <div v-for="logs in changeLogs" :key="logs.day">
          <div>{{ logs.day }}</div>
          <div>
            <template v-for="(content, type) in logs.content">
              <span v-for="(log, index) in content" :key="`${logs.day}${type}${index}`" class="d-flex mt-2" :class="{ 'flex-wrap': $vuetify.breakpoint.xsOnly }">
                <v-chip label small class="flex-shrink-0 mr-2 px-2" :color="labels[type].color">
                  <v-icon class="mr-1">{{ labels[type].icon }}</v-icon>
                  {{ labels[type].text }}
                </v-chip>
                <span>{{ log }}</span>
              </span>
            </template>
          </div>
        </div>
      </v-sheet>
    </v-dialog>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';

const changeLogs = [
    {
    day: '2025-05-24',
    content: {
      cheat: [
        '天气混乱事件150云更改天气从随机改为可选',
      ]
    },
  },
  {
    day: 'xxxx-xx-xx',
    content: {
      qol: [
        '购买列表可按是否可购买和容量是否足够筛选',
        '在画廊声望页显示画廊的全局等级进度',
        '显示画廊的灵感每层已使用数',
        '画廊的形状游戏显示各个形状的个数',
        '村庄-工匠显示每个制品的基础价格和预计销售时间之比和当前里程碑升级所需时间（以不间断制作计算）',
        '冷冻实验室显示升级所需天数',
        '采矿冶炼可自定义输入个数',
        '可直接复制存档文本，避免无法导出文件',
      ],
      cheat: [
        '部落2可以重置技能点分配',
        '画廊虚空生产加速器（解锁完所有形状后出现）',
        '村庄冻结收益 40% -> 100%（作者于v1.5.0削弱）',
        '学校点击“参加考试”即可以满分通过考试',
        '未采用v1.5.5的画廊重大削弱（画布等级和灵感“订购大量保险箱”提供的鼓数量和画布速度）',
      ],
    }
  }
];
const labels = {
  qol: { text:'体验', color: 'teal', icon: 'mdi-sofa' },
  cheat: { text:'作弊', color: 'red', icon: 'mdi-screwdriver' },
};

export default {
  data: () => ({
    changeLogs,
    labels,
    viewed: false,
  }),
  computed: {
    ...mapGetters({
      importantNotice: 'system/importantNotice',
    }),
  },
  methods: {
    viewChange() {
      this.viewed = !this.viewed;
      this.$store.commit('system/removeImportantNotice');
    },
  },
};
</script>
