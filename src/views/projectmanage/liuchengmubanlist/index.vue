<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" label-width="68px">
      <el-form-item label="模板名称" prop="noticeTitle">
        <el-input
          v-model="queryParams.templateName"
          placeholder="模板名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleAdd">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="tableData">
      <el-table-column  label="序号" width="60px" align="center">
        <template slot-scope="scope"> {{(queryParams.pageNum-1)*queryParams.pageSize+(scope.$index+1)}} </template>
      </el-table-column>

      <el-table-column  label="模板名称" align="center" :show-overflow-tooltip="true">
        <template slot-scope="scope"> {{scope.row.templateName}} </template>
      </el-table-column>

      <el-table-column  label="备注" align="center" :show-overflow-tooltip="true">
        <template slot-scope="scope"> {{scope.row.remark}} </template>
      </el-table-column>

      <!--<el-table-column label="创建者" align="center" prop="createBy" width="100" />-->
      <el-table-column label="创建时间" align="center" prop="createTime" width="100">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="openLiuChengTuGraph(scope.row)"
          >流程图</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <div v-if="liuChengTuGraphVisible">
      <el-dialog title="流程图" :visible.sync="liuChengTuGraphVisible" width="1400px" top="5vh" append-to-body :close-on-click-modal="false">
        <myflow :parentCellsJsonStr="parentCellsJsonStr" :projectCanEditProjectDeptList="allDeptList"  @saveFromMyflow="saveFromMyflow" @closeMyflowDialog="closeMyflowDialog"></myflow>
      </el-dialog>
    </div>

    <!-- 添加或修改岗位对话框 -->
    <el-dialog :title="addOrUpdateTemplateDialogTitle" :visible.sync="addOrUpdateLiuChengTuTemplateVisible" width="500px" append-to-body>
      <el-form ref="addOrUpdateTemplateForm" :model="addOrUpdateTemplateForm" :rules="addOrUpdateTemplateFormRules" label-width="80px">
        <el-form-item label="模板名称" prop="postName">
          <el-input v-model="addOrUpdateTemplateForm.templateName" placeholder="模板名称" />
        </el-form-item>
        <el-form-item label="备注" prop="postCode">
          <el-input v-model="addOrUpdateTemplateForm.remark" placeholder="备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancelAddOrUpdateTemplate">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import Myflow from "../myflow/index";
  import {selectAllDeptList} from  "@/api/system/dept"
import { selectProjectBaseList,selectProjectLiuChengTuTemplateList, selectProjectLiuChengTuDataLogList,insertLiuChengTuDataLog,insertProjectBase,deleteProjectTemplate} from "@/api/project/project"
  import {insertProjectTemplate} from "../../../api/project/project";

export default {
  name: "ProjectLiuChengTuTemplate",
  components: { Myflow },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 公告表格数据
      tableData: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        templateName: "",
      },
      // 表单参数
      addOrUpdateTemplateForm: {},
      // 表单校验
      addOrUpdateTemplateFormRules: {
        templateName: [
          { required: true, message: "项目名称不能为空", trigger: "blur" }
        ]
      },
      liuChengTuGraphVisible:false,
      curRow:null,
      //打开新增模板dialog
      addOrUpdateTemplateDialogTitle:"",
      addOrUpdateLiuChengTuTemplateVisible:false,
      parentCellsJsonStr:"",
      //能够操作项目的人员
      curRowCanEditProjectDeptList:[],
      //所有部门
      allDeptList:[]
    }
  },
  created() {
    this.selectAllDeptList();
    this.getList()
  },
  methods: {
    closeMyflowDialog(){
      this.liuChengTuGraphVisible=false;
    },

    saveFromMyflow(data){
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

      let param={
        "projectLiuChengTuTemplateId":this.curRow.id,
        "currentCellsJsonStr":JSON.stringify(cells)
      }
      insertLiuChengTuDataLog(param).then(response => {
        alert("已保存成功");
        curObj.getList();
      })
    },

    /** 查询列表数据 */
    getList() {
      this.loading = true
      selectProjectLiuChengTuTemplateList(this.queryParams).then(response => {
        this.tableData = response.data
        this.total = response.total
        this.loading = false
      })
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.addOrUpdateTemplateDialogTitle="新增项目";
      this.addOrUpdateLiuChengTuTemplateVisible = true;
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.addOrUpdateTemplateForm={
        "templateName":row.templateName,
        "remark":row.remark,
        "id":row.id
      }
      this.addOrUpdateTemplateDialogTitle="修改项目";
      this.addOrUpdateLiuChengTuTemplateVisible = true;
    },

    /** 提交按钮 */
    submitForm: function() {
      this.$refs["addOrUpdateTemplateForm"].validate(valid => {
        if (valid) {
          if (this.addOrUpdateTemplateForm.id != undefined) {
            updateProjectTemplate(this.addOrUpdateTemplateForm).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.addOrUpdateLiuChengTuTemplateVisible = false
              this.getList()
            })
          } else {
            insertProjectTemplate(this.addOrUpdateTemplateForm).then(response => {
              this.$modal.msgSuccess("新增成功")
              this.addOrUpdateLiuChengTuTemplateVisible = false
              this.getList()
            })
          }
        }
      })
    },

    //取消新增或修改
    cancelAddOrUpdateTemplate(){
      this.addOrUpdateLiuChengTuTemplateVisible=false;
      this.addOrUpdateTemplateForm={};
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      let templateName=row.templateName;
      this.$modal.confirm('是否确认删除公告编号为"' + templateName + '"的数据项？').then(function() {
        return deleteProjectTemplate({"id":row.id})
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },

    openLiuChengTuGraph(row){
      this.curRow=row;
      this.parentCellsJsonStr=row.cellsJsonStr;
      this.liuChengTuGraphVisible=true;
    },

    //所有的deptList
    selectAllDeptList(){
      let curObj=this;
      selectAllDeptList().then(response=>{
          curObj.allDeptList=response.data;
        }
      )
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss">
  .el-dialog__header {
    display: none !important;
  }

  .el-dialog__body{
    padding: 10px 20px !important;
  }
</style>
