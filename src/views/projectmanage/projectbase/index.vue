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

    <div id="projectBaseTableDiv">
      <el-table v-loading="loading" :data="tableData"  class="custom-class" stripe>
        <el-table-column  label="序号" min-width="60px" align="center">
          <template slot-scope="scope"> {{(queryParams.pageNum-1)*queryParams.pageSize+(scope.$index+1)}} </template>
        </el-table-column>

        <el-table-column  label="项目名称" align="center" min-width="120px" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <a style="color:#1890ff" @click="openProjectDetailPage(scope.row)">{{scope.row.projectName}}</a>
          </template>
        </el-table-column>

        <el-table-column label="负责部门" align="center" prop="createTime" min-width="120px"  :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span v-for="item in scope.row.canEditProjectDeptList">{{ item.deptName+";" }}</span>
          </template>
        </el-table-column>

        <el-table-column  label="备注" min-width="120px" align="center" :show-overflow-tooltip="true">
          <template slot-scope="scope"> {{scope.row.remark}} </template>
        </el-table-column>

        <el-table-column label="任务进度" align="center"  min-width="120px">
          <template slot-scope="scope">
            <el-tag>{{scope.row.allDoneNodeCount+'/'+scope.row.allPayAttentionNodeCount}}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="进行中任务" align="left" prop="createTime" min-width="200px"  :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <div v-if="hasValidTasks(scope.row.cellsJsonStr)">
              <div v-for="(task, idx) in getNumberedTasks(scope.row.cellsJsonStr)"
                   :key="idx">
                {{ task }}
              </div>
            </div>
          </template>
        </el-table-column>


        <el-table-column label="更新时间" align="center" prop="createTime" width="100">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center" min-width="150px" class-name="small-padding fixed-width">
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
            <!--<el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="openLiuChengTuGraph(scope.row)"
            >流程图</el-button>-->
          </template>
        </el-table-column>
      </el-table>
    </div>


    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <div v-if="liuChengTuGraphVisible">
      <el-dialog title="流程图" :visible.sync="liuChengTuGraphVisible" width="1400px" top="5vh" append-to-body :close-on-click-modal="false">
        <myflow :parentCellsJsonStr="parentCellsJsonStr" :projectCanEditProjectDeptList="curRowCanEditProjectDeptList"  @saveFromMyflow="saveFromMyflow" @closeMyflowDialog="closeMyflowDialog"></myflow>
      </el-dialog>
    </div>

    <!-- 添加或修改岗位对话框 -->
    <el-dialog id="ffff" :title="addOrUpdateProjectBaseDialogTitle" :visible.sync="addOrUpdateProjectBaseVisible" width="500px" append-to-body>
      <el-form ref="addOrUpdateProjectBaseForm" :model="addOrUpdateProjectBaseForm" :rules="addOrUpdateProjectBaseFormRules" label-width="80px">
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="addOrUpdateProjectBaseForm.projectName" placeholder="项目名称" />
        </el-form-item>

        <el-form-item label="相关人员" prop="projectName">
          <el-select v-model="addOrUpdateProjectBaseForm.canEditProjectDeptIdList" filterable multiple placeholder="请选择">
            <el-option
              v-for="item in allDeptList"
              :key="item.deptId"
              :label="item.deptName"
              :value="item.deptId">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="addOrUpdateProjectBaseForm.remark" placeholder="备注" />
        </el-form-item>

        <el-form-item label="目录配置" prop="remark">
          <el-input v-model="addOrUpdateProjectBaseForm.contentsSetStr" placeholder="类似如下“1:前期,2:中期,3:后期”，英文符号" />
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
  import {selectAllDeptList} from  "@/api/system/dept"
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
      //能够操作项目的人员
      curRowCanEditProjectDeptList:[],
      //打开新增模板dialog
      addOrUpdateProjectBaseDialogTitle:"",
      addOrUpdateProjectBaseVisible:false,
      parentCellsJsonStr:"",
      //所有的dept
      allDeptList:[],
    }
  },
  created() {
    this.getList()
  },

  mounted(){
    this.selectAllDeptList();
  },
  methods: {
    openProjectDetailPage(row){
      console.log("row.projectName"+row.projectName)
      this.$tab.openPage(row.projectName, '/projectmanage/projectdetail/index/' +row.id, row)
    },

    closeMyflowDialog(){
      this.liuChengTuGraphVisible=false;
    },

    //进行中的任务
    getNumberedTasks(jsonStr) {
      const result = [];
      JSON.parse(jsonStr).forEach(item => {
        if (item.shape == 'dag-commonTaskNode' && item.data?.status == 2) {
          result.push(`${result.length + 1}.${item.data.taskName}`);
        }
      });
      return result;
    },

    hasValidTasks(jsonStr) {
      return jsonStr!=null && jsonStr.length > 10;
    },

    saveFromMyflow(data){
      let curObj=this;
      let param={
        "projectBaseId":this.curRow.id,
        "currentCellsJsonStr":JSON.stringify(data["cells"])
      }
      insertLiuChengTuDataLog(param).then(response => {
        alert("已保存成功")
        curObj.getList();
      })
    },
    
    /** 查询列表数据 */
    getList() {
      this.loading = true
      selectProjectBaseList(this.queryParams).then(response => {
        //补充现在的进度
        let tableData=response.data;
        for(let i=0;i<tableData.length;i++){
          let row=tableData[i];
          let allPayAttentionNodeCount=0;
          let allDoneNodeCount=0;
          if(row.cellsJsonStr!=null && row.cellsJsonStr.length>10){
            JSON.parse(row.cellsJsonStr).forEach(item => {
              //1 未开始 2 进行中 3 完成 4 不再关注 5 部分完成
              if (item.shape == 'dag-commonTaskNode' && item.data?.status != 4) {
                allPayAttentionNodeCount+=1;
                if(item.data?.status == 3){
                  allDoneNodeCount+=1;
                }
              }
            });
            tableData[i]["allPayAttentionNodeCount"]=allPayAttentionNodeCount;
            tableData[i]["allDoneNodeCount"]=allDoneNodeCount;
          }else{
            tableData[i]["allPayAttentionNodeCount"]=0;
            tableData[i]["allDoneNodeCount"]=0;          }
        }
        this.tableData = response.data;
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
        "canEditProjectDeptIdList":row.canEditProjectDeptIdList,
        "contentsSetStr":row.contentsSetStr,
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
      this.curRowCanEditProjectDeptList=row.canEditProjectDeptList;
      console.log("328:"+JSON.stringify(this.curRowCanEditProjectDeptList))
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

  #projectBaseTableDiv .custom-class .el-table__row{
    height: 80px;
  }
</style>


