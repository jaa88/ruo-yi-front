<template>
  <el-dialog
    title="编辑任务"
    :visible.sync="visible"
    width="500px"
    append-to-body
  >
    <el-form :inline="true" class="demo-form-inline" label-width="120px" label-position="left">
      <el-form-item label="任务名称">
        <el-input v-model="taskName" placeholder="任务名称"></el-input>
      </el-form-item>

      <el-form-item label="目录">
        <el-input v-model="contentsNumStr" placeholder="目录序号，有小数点"></el-input>
      </el-form-item>

      <el-form-item label="任务状态">
        <el-select v-model="status">
          <el-option label="未开始" value="1" />
          <el-option label="进行中" value="2" />
          <el-option label="完成" value="3" />
          <el-option label="不再关注" value="4" />
          <el-option label="部分完成" value="5" />
        </el-select>
      </el-form-item>

      <el-form-item label="负责部门" >
        <el-select v-model="chargeDeptIdList" filterable multiple placeholder="请选择">
          <el-option
            v-for="item in projectCanEditProjectDeptList"
            :key="item.deptId"
            :label="item.deptName"
            :value="item.deptId">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="任务开始时间">
        <el-date-picker
          v-model="startTime"
          type="date"
          placeholder="选择日期">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="预计完成时间">
        <el-date-picker
          v-model="expectedEndTime"
          type="date"
          placeholder="选择日期">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="备注">
        <el-input v-model="remark" placeholder="备注"></el-input>
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
      chargeDeptIdList:"",//负责人
      remark:"",//备注
      startTime:"",// 开始时间
      status:"1",//任务状态
      projectCanEditProjectDeptList:[],//项目能编辑的人员，
      contentsNumStr:"",//有小数点
      expectedEndTime:null,//预计结束时间
    };
  },

  mounted() {

  },

  methods: {
    init(item) {
      //初始化数据
      console.log("item:"+JSON.stringify(item))
      this.node = item;
      this.label = item.item.data.label;
      this.taskName=item.item.data.taskName;
      this.chargeDeptIdList=item.item.data.chargeDeptIdList;
      this.remark=item.item.data.remark;
      this.startTime=item.item.data.startTime;
      this.expectedEndTime=item.item.data.expectedEndTime;
      this.status=item.item.data.status;
      if(typeof this.status ==='undefined' || this.status==null){
        this.status="1";
      }
      this.projectCanEditProjectDeptList=item.projectCanEditProjectDeptList;
      this.contentsNumStr=item.item.data.contentsNumStr;
    },
    submit() {
      if(typeof this.taskName =='undefined' || this.taskName==""){
        alert("请输入任务名")
        return;
      }
      if(typeof this.contentsNumStr =='undefined' || this.contentsNumStr==""){
        alert("请输入目录")
        return;
      }

      var node = this.$parent.getNodeById(this.node.item.id);
      //这个是数组，不能机械的用 Object.assign了
      this.node.item.data.chargeDeptIdList=[];
      node.setData(
        Object.assign({}, this.node.item.data,
          {
            label: this.label,
            taskName:this.taskName,
            chargeDeptIdList:this.chargeDeptIdList,
            remark:this.remark,
            startTime:this.startTime,
            expectedEndTime:this.expectedEndTime,
            status:this.status,
            contentsNumStr:this.contentsNumStr
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
