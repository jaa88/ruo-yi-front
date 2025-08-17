<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" label-width="68px">
      <el-form-item label="任务名称" prop="noticeTitle">
        <el-input
          v-model="queryParams.taskName"
          placeholder="任务名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="任务状态" prop="noticeTitle">
        <el-select style="width:150px" v-model="queryParams.status" placeholder="任务状态" @change="handleQuery">
          <el-option label="未开始" value="1" />
          <el-option label="进行中" value="2" />
          <el-option label="完成" value="3" />
          <el-option label="不再关注" value="4" />
          <el-option label="部分完成" value="5" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
      </el-form-item>
    </el-form>

    <div id="taskListDiv">
      <el-table v-loading="loading" :data="tableData"  class="custom-class" stripe>
        <el-table-column  label="序号" min-width="60px" align="center">
          <template slot-scope="scope"> {{(queryParams.pageNum-1)*queryParams.pageSize+(scope.$index+1)}} </template>
        </el-table-column>

        <el-table-column  label="项目名称" align="center" min-width="120px" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <a style="color:#1890ff" @click="openProjectDetailPage(scope.row)">{{scope.row.projectName}}</a>
          </template>
        </el-table-column>

        <el-table-column  label="任务名称" align="center" min-width="120px" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            {{scope.row.taskName!=null ?scope.row.taskName:'--'}}
          </template>
        </el-table-column>

        <el-table-column  label="负责部门" align="center" min-width="120px" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            {{scope.row.deptName!=null ?scope.row.deptName:'--'}}
          </template>
        </el-table-column>

        <el-table-column  label="状态" align="center" min-width="120px" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <el-tag :color="scope.row.status==1?'#5f95ff':scope.row.status==2?'#FF3333':scope.row.status==3?'#7FFF00':scope.row.status==4?'#878787':scope.row.status==5?'#C9DD23':''">{{getStatusName(scope.row.status)}}</el-tag>
          </template>
        </el-table-column>

        <el-table-column  label="开始时间" align="center" min-width="120px" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            {{ scope.row.startTime!=null?parseTime(scope.row.startTime, '{y}-{m}-{d}'):'--' }}
          </template>
        </el-table-column>

        <el-table-column  label="预期结束时间" align="center" min-width="120px" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            {{ scope.row.expectedEndTime!=null?parseTime(scope.row.expectedEndTime, '{y}-{m}-{d}'):'--' }}
          </template>
        </el-table-column>

        <el-table-column  label="上次更新时间" align="center" min-width="120px" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            {{ scope.row.updateTime!=null?parseTime(scope.row.updateTime, '{y}-{m}-{d}'):'--' }}
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

  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { getToken } from "@/utils/auth"
  import {selectAllDeptList} from  "@/api/system/dept"
  import { selectProjectBaseList, selectProjectLiuChengTuDataLogList,queryProjectLiuChengTuNodeByParam} from "@/api/project/project"

export default {
  name: "TaskList",

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
        taskName: "",
        status:"",
      },
    }
  },

  computed: {
    ...mapGetters([
     'roles',
      'deptId'
    ]),
  },

  created() {
    this.getList()
  },

  mounted(){
    this.selectAllDeptList();
  },
  methods: {
    openProjectDetailPage(row){
      this.$tab.openPage(row.projectName, '/projectmanage/projectdetail/index/' +row.projectBaseId, row)
    },

    /** 查询列表数据 */
    getList() {
      this.loading = true;
      this.queryParams.chargeDeptId=this.deptId;
      //判断是否是管理员 ,如果是管理员则查询所有的
      if(this.roles!=null && this.roles.length){
        for(let i=0;i<this.roles.length;i++){
          if(this.roles[i]=='admin'){
            this.queryParams.chargeDeptId="";
          }
        }
      }
      queryProjectLiuChengTuNodeByParam(this.queryParams).then(response => {
        //补充现在的进度
        this.tableData=response.data;
        this.total = response.total
        this.loading = false
      })
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },

    //所有的deptList
    selectAllDeptList(){
      let curObj=this;
      selectAllDeptList().then(response=>{
          curObj.allDeptList=response.data;
        }
      )
    },

    getStatusName(status){
      /* 1 未开始 2 进行中 3 完成 4 不再关注 5 部分完成*/
      /*'border-left': status == '1' ? '4px solid #5f95ff' :status == '2' ? '4px solid #FF3333':status == '3' ? '4px solid #7FFF00': status == '4' ? '4px solid #878787':'4px solid yellow' */
      if(status==1){
        return "未开始"
      }
      if(status==2){
        return "进行中"
      }
      if(status==3){
        return "完成"
      }
      if(status==4){
        return "不再关注"
      }
      if(status==5){
        return "部分完成"
      }
      return "未知"
    },
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

  #taskListDiv .custom-class .el-table__row{
    height: 80px;
  }

  #taskListDiv .el-tag {
    color:white !important;
  }
</style>


