<template>
  <el-dialog
    title="保存为模板"
    :visible.sync="visible"
    width="500px"
    append-to-body
  >
    <el-form :inline="true" class="demo-form-inline" label-width="120px" label-position="left">
      <el-form-item label="模板名称">
        <el-input v-model="templateName" placeholder="模板名称"></el-input>
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
  import {insertProjectTemplate } from "@/api/project/project"

export default {
  name: "dialogMysql",

  data() {
    return {
      visible: false,
      templateName:"",//模板名称
      remark:"",//备注
      cellsJsonStr:"",//当前的json
    };
  },

  mounted() {

  },

  methods: {
    init(data) {
      let curObj=this;
      //我转一下，把所有的status 都赋1
      let cells=data["cells"];
      if(typeof cells!='undefined' && cells.length>0){
        for(let i=0;i<cells.length;i++){
          let tempObj=cells[i];
          if(tempObj["shape"]=="dag-commonTaskNode"){
            let tempData=tempObj["data"];
            if(typeof tempData["status"] !='undefined'){
              cells[i]["data"]["status"]="1"
            }
          }
        }
      }
      curObj.cellsJsonStr=JSON.stringify(cells);
    },

    submit() {
      let curObj=this;
      let param={
        "templateName":curObj.templateName,
        "remark":curObj.remark,
        "cellsJsonStr":curObj.cellsJsonStr
      }
      insertProjectTemplate(param).then(response => {
        alert("已保存成功")
        curObj.visible = false;
      })
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
