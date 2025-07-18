<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" label-width="68px">
      <el-form-item label="项目名称" prop="noticeTitle">
        <el-input
          v-model="queryParams.projectName"
          placeholder="项目名称"
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

      <el-table-column  label="项目名称" align="center" :show-overflow-tooltip="true">
        <template slot-scope="scope"> {{scope.row.projectName}} </template>
      </el-table-column>

      <el-table-column  label="备注" align="center" :show-overflow-tooltip="true">
        <template slot-scope="scope"> {{scope.row.remark}} </template>
      </el-table-column>

      <el-table-column label="创建者" align="center" prop="createBy" width="100" />
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

    <el-dialog title="流程图" :visible.sync="liuChengTuGraphVisible" width="1400px" top="5vh" append-to-body  :destroy-on-close="true">
      <myflow :parentCellsJsonStr="parentCellsJsonStr" @saveFromMyflow="saveFromMyflow"></myflow>
    </el-dialog>


    <!-- 添加或修改岗位对话框 -->
    <el-dialog id="ffff" :title="addOrUpdateProjectBaseDialogTitle" :visible.sync="addOrUpdateProjectBaseVisible" width="500px" append-to-body>
      <el-form ref="addOrUpdateProjectBaseForm" :model="addOrUpdateProjectBaseForm" :rules="addOrUpdateProjectBaseFormRules" label-width="80px">
        <el-form-item label="项目名称" prop="postName">
          <el-input v-model="addOrUpdateProjectBaseForm.projectName" placeholder="项目名称" />
        </el-form-item>
        <el-form-item label="备注" prop="postCode">
          <el-input v-model="addOrUpdateProjectBaseForm.remark" placeholder="备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancelAddOrUpdateProjectBase">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import Myflow from "../myflow/index";
  import { selectProjectBaseList,selectProjectLiuChengTuTemplateList, selectProjectLiuChengTuDataLogList,insertLiuChengTuDataLog,insertProjectBase,updateProjectBase,deleteProjectBase } from "@/api/project/project"

export default {
  name: "ProjectBase",
  components: { Myflow },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 公告表格数据
      tableData: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        projectName: "",
      },
      // 表单参数
      addOrUpdateProjectBaseForm: {},
      // 表单校验
      addOrUpdateProjectBaseFormRules: {
        templateName: [
          { required: true, message: "项目名称不能为空", trigger: "blur" }
        ]
      },
      liuChengTuGraphVisible:false,
      curRow:null,
      //打开新增模板dialog
      addOrUpdateProjectBaseDialogTitle:"",
      addOrUpdateProjectBaseVisible:false,
      parentCellsJsonStr:"",
    }
  },
  created() {
    this.getList()
  },
  methods: {
    saveFromMyflow(data){
      let param={
        "projectBaseId":this.curRow.id,
        "currentCellsJsonStr":JSON.stringify(data["cells"])
      }
      insertLiuChengTuDataLog(param).then(response => {
        alert("已保存成功")
      })
    },
    
    /** 查询列表数据 */
    getList() {
      this.loading = true
      selectProjectBaseList(this.queryParams).then(response => {
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
      this.addOrUpdateProjectBaseForm={};
      this.addOrUpdateProjectBaseDialogTitle="新增项目";
      this.addOrUpdateProjectBaseVisible = true;
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.addOrUpdateProjectBaseForm={
        "projectName":row.projectName,
        "remark":row.remark,
        "id":row.id
      }
      this.addOrUpdateProjectBaseDialogTitle="修改项目";
      this.addOrUpdateProjectBaseVisible = true;
    },

    /** 提交按钮 */
    submitForm: function() {
      this.$refs["addOrUpdateProjectBaseForm"].validate(valid => {
        if (valid) {
          if (this.addOrUpdateProjectBaseForm.id != undefined) {
            updateProjectBase(this.addOrUpdateProjectBaseForm).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.addOrUpdateProjectBaseVisible = false
              this.getList()
            })
          } else {
            insertProjectBase(this.addOrUpdateProjectBaseForm).then(response => {
              this.$modal.msgSuccess("新增成功")
              this.addOrUpdateProjectBaseVisible = false
              this.getList()
            })
          }
        }
      })
    },

    //取消新增或修改
    cancelAddOrUpdateProjectBase(){
      this.addOrUpdateProjectBaseVisible=false;
      this.addOrUpdateProjectBaseForm={};
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      let curObj=this;
      curObj.$modal.confirm('是否确认删除："' + row.projectName + '"？').then(function() {
        deleteProjectBase({"id":row.id}).then(response => {
          curObj.$modal.msgSuccess("删除成功");
          curObj.getList()
        })
      })
    },

    openLiuChengTuGraph(row){
      this.curRow=row;
      this.parentCellsJsonStr=row.cellsJsonStr;
      this.liuChengTuGraphVisible=true;
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


