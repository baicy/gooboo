<style scoped>
.qrcode {
  background-size: contain;
  width: 200px;
  height: 275px;
}
.alipay-qrcode {
  background-image: url('/public/img/alipay.png');
}
.wxpay-qrcode {
  background-image: url('/public/img/wxpay.png');
}
</style>

<template>
  <v-card class="ma-2">
    <v-card-title class="justify-center">修改版声明</v-card-title>
    <v-card-subtitle class="text-center">修改者是 Whiteberry Lee</v-card-subtitle>
    <v-card-text>具体内容请查看公告，有重要通知时也会提醒您。如果觉得有帮助到您的话可以请我喝一杯柠檬水哦。</v-card-text>
    <v-card-actions class="flex-wrap justify-end">
      <v-spacer></v-spacer>
      <v-badge :value="importantNotice" color="red" overlap dot>
        <v-btn class="ma-1" color="primary" @click="viewChange">
          <v-icon class="mr-2">mdi-bulletin-board</v-icon>
          公告
        </v-btn>
      </v-badge>
      <v-btn class="ma-1" color="primary" target="_blank" href="https://github.com/baicy/gooboo/">
        <v-icon class="mr-2">mdi-github</v-icon>
        {{ $vuetify.lang.t("$vuetify.info.socials.viewCode") }}
      </v-btn>
      <v-btn class="ma-1" color="primary" id="reward-coffee"><v-icon class="mr-2">mdi-coffee</v-icon>打赏</v-btn>
      <v-dialog activator="#reward-coffee" max-width="400">
          <v-card class="default-card d-flex">
            <v-sheet class="qrcode alipay-qrcode"></v-sheet>
            <v-sheet class="qrcode wxpay-qrcode"></v-sheet>
          </v-card>
        </v-dialog>
    </v-card-actions>
    <v-dialog max-width="400" v-model="viewed">
      <v-sheet class="overflow-auto pa-8" max-height="calc(60vh)">
        本网站属于个人网站，所有对gooboo游戏的修改的目的都参考自身需求。<br/>
        默认情况下，本网站只有不会影响任何游戏本身的辅助显示优化。<br/>
        修改功能请在“设置 - 修改”里自选是否开启。<br/>
        默认开启的显示如果您不满意，可以使用其他网站或者联系我进行修改。<br/>
        联系方式可选源码按钮去Github留言，或者加入QQ群468760729。<br/>
        本网站有2个地址可以访问：<br/>
        <a href="https://baicy.github.io/gooboo/" target="_blank">https://baicy.github.io/gooboo/</a><br/>
        <a href="https://gooboo.terrakeeper.top" target="_blank">https://gooboo.terrakeeper.top</a><br/>
        可以根据您的网络情况选择访问。（存档需要重新导入，也可以使用云存档）<br/>
        云存档功能是群友Zding提供的API，另外他也提供了一个非常棒的在线Gooboo <a href="https://gooboo.0nz.de/" target="_blank">https://gooboo.0nz.de/</a> <br>
        汉化继承自锅巴汉化组版本，链接在下方“社交”。<br/>
        感谢阅读。
      </v-sheet>
    </v-dialog>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data: () => ({
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
