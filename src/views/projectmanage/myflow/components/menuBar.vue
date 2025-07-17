<template>
  <el-card
    class="box-card"
    :style="{ left: x + 'px', top: y + 'px' }"
    :stop="11"
    @click.stop=""
    style="padding: 0"
  >
    <div v-if="item.type === 'node'" class="text item" @click.stop="callBack('editTask','')" >编辑任务</div>
    <!--<div class="text item" @click.stop="callBack('source')" v-if="item.type !== 'edge'">配置数据源</div>-->
    <div v-if="item.type !== 'blank'" class="text item" @click.stop="callBack('remove','')">删除</div>

    <div v-if="item.type === 'blank'" class="text item" @click.stop="callBack('addGraphTaskNode','commonTask')">新增任务节点</div>

    <div v-if="item.type === 'blank'" class="text item" @click.stop="callBack('addGraphTaskNode','judgeTask')">新增判断节点</div>
  </el-card>
</template>

<script>
export default {
  name: "MenuBar",
  data() {
    return {
      x: "",
      y: "",
      item: {},
    };
  },
  mounted() {},
  methods: {
    initFn(x, y, item) {
      this.x = parseInt(x) + "";
      this.y = y + "";
      if (item) {
        this.item = item;
      }
    },
    setItem(item) {
      this.item = item;
    },
    callBack(type,value) {
      this.$emit("callBack", type, this.item,value,this.x,this.y);
    },
  },
};
</script>
<style scoped>
.box-card {
  position: absolute;
  z-index: 112;
}

.box-card ::v-deep .el-card__body {
  padding: 0;
}

.text {
  font-size: 14px;
}

.item {
  padding: 10px 0;
  text-align: center;
}

.item:hover {
  color: #ffffff;
  background-color: #409eff;
}

.box-card {
  width: 150px;
}
</style>
