<template>
  <el-dialog
    title="编辑任务"
    :visible.sync="visible"
    width="500px"
  >
    <el-form :inline="true" class="demo-form-inline" label-width="120px" label-position="left">
      <el-form-item label="任务名称">
        <el-input v-model="taskName" placeholder="任务名称"></el-input>
      </el-form-item>

      <el-form-item label="负责人">
        <el-input v-model="chargePerson" placeholder="负责人"></el-input>
      </el-form-item>

      <el-form-item label="备注">
        <el-input v-model="remark" placeholder="备注"></el-input>
      </el-form-item>

      <el-form-item label="开始时间">
        <el-input v-model="startTime" placeholder="开始时间"></el-input>
      </el-form-item>

    </el-form>
    <footer class="footer">
      <el-button type="primary" @click="submit">确定</el-button>
    </footer>
  </el-dialog>
</template>

<script>
export default {
  name: "dialogMysql",

  data() {
    return {
      visible: false,
      bool: true,
      node: {},
      label: "",
      taskName:"",//任务名称
      chargePerson:"",//负责人
      remark:"",//备注
      startTime:"",// 开始时间
    };
  },
  mounted() {},
  methods: {
    init(item) {
      //初始化数据
      this.node = item;
      this.label = item.item.data.label;
      this.taskName=item.item.data.taskName;
      this.chargePerson=item.item.data.chargePerson;
      this.remark=item.item.data.remark;
      this.startTime=item.item.data.startTime;
    },
    submit() {
      var node = this.$parent.getNodeById(this.node.item.id);
      node.setData(
        Object.assign({}, this.node.item.data,
          {
            label: this.label,
            taskName:this.taskName,
            chargePerson:this.chargePerson,
            remark:this.remark,
            startTime:this.remark
          })
      );
      this.visible = false;
    },
  },
};
</script>
<style scoped>
section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer {
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
