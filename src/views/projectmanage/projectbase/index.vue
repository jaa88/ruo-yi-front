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

      <el-form-item label="目前阶段" prop="noticeTitle">
        <el-select style="width:150px" v-model="queryParams.muQianJieDuan" @change="handleQuery" clearable placeholder="目前阶段" >
          <el-option label="前期" value="1" />
          <el-option label="施工" value="2" />
          <el-option label="试运营" value="3" />
        </el-select>
      </el-form-item>

      <el-form-item label="项目类型" prop="noticeTitle">
        <el-select style="width:150px" v-model="queryParams.xiangMuLeiXing" @change="handleQuery"  clearable placeholder="项目类型">
          <el-option label="公路" value="1" />
          <el-option label="水运" value="2" />
          <el-option label="铁路轨道" value="3" />
          <el-option label="航空" value="4" />
          <el-option label="其他" value="5" />
        </el-select>
      </el-form-item>

      <el-form-item label="建设性质" prop="noticeTitle">
        <el-select style="width:150px" v-model="queryParams.jianSheXingZhi" @change="handleQuery" clearable  placeholder="建设性质">
          <el-option label="新建" value="1" />
          <el-option label="改建" value="2" />
          <el-option label="扩建" value="3" />
          <el-option label="改扩建" value="4" />
          <el-option label="维护养护" value="5" />
          <el-option label="其他" value="6" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleAddOrUpdateProjectBase('add',null)">新增</el-button>
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

        <el-table-column  label="目前阶段" align="center" min-width="80px" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{getMuQianJieDuanName(scope.row.muQianJieDuan)}}</span>
          </template>
        </el-table-column>

        <el-table-column  label="建设单位" align="center" min-width="160px">
          <template slot-scope="scope">
            <div v-if="typeof scope.row.jianSheDanWei =='undefined' || scope.row.jianSheDanWei==null || scope.row.jianSheDanWei==''" style="white-space: pre-line;text-align: left"  >--</div>
            <div v-else-if="scope.row.jianSheDanWei.length<=60" style="white-space: pre-line;text-align: left"  v-html="scope.row.jianSheDanWei" ></div>
            <div v-else>
              <el-popover
                placement="top-start"
                width="200"
                trigger="hover"
              >
                <div style="white-space: pre-line;text-align: left" v-html="scope.row.jianSheDanWei">

                </div>
                <a style="color:#1890ff" slot="reference">{{scope.row.jianSheDanWei.slice(0,60)+'(...)'}}</a>
              </el-popover>
            </div>
          </template>
        </el-table-column>

        <el-table-column  label="总投资(万)" align="center" min-width="70px" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{scope.row.zongTouZi}}</span>
          </template>
        </el-table-column>

        <el-table-column label="责任部门" align="center" prop="createTime" min-width="80px"  :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <div>
              <div v-for="item in scope.row.deptList">{{ item.deptName }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="任务进度" align="center"  min-width="80px">
          <template slot-scope="scope">
            <el-tag>{{scope.row.allDoneNodeCount+'/'+scope.row.allPayAttentionNodeCount}}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="进行中任务" align="left" prop="createTime" min-width="160px"  :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <div v-if="hasValidTasks(scope.row.cellsJsonStr)">
              <div v-for="(task, idx) in getNumberedTasks(scope.row.cellsJsonStr)"
                   :key="idx">
                {{ task }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column  label="近期完成任务" min-width="200px" align="left">
          <template slot-scope="scope">
            <div v-if="scope.row.lastWanChengList.length==0">
              --
            </div>

            <div v-else>
              <div v-for="(item,index) in scope.row.lastWanChengList" :key="'lastWanChengList'+index">
                <div style="display: inline-block">
                  {{parseTime(item.endTime, '{y}-{m}-{d}')}}
                </div>

                <div style="margin-left:2px;display: inline-block">
                  {{item.taskName}}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column  label="需协调解决事项" min-width="120px" align="center">
          <template slot-scope="scope">
            <div v-if="typeof scope.row.remark =='undefined' || scope.row.remark==null || scope.row.remark==''" style="white-space: pre-line;text-align: left"  >--</div>
            <div v-else-if="scope.row.remark.length<=60" style="white-space: pre-line;text-align: left"  v-html="scope.row.remark" ></div>
            <div v-else>
              <el-popover
                          placement="top-start"
                          width="200"
                          trigger="hover"
                          >
                <div style="white-space: pre-line;text-align: left" v-html="scope.row.remark">

                </div>
                <a style="color:#1890ff" slot="reference">{{scope.row.remark.slice(0,60)+'(...)'}}</a>
              </el-popover>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center" min-width="100px" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleAddOrUpdateProjectBase('update',scope.row)"
            >修改</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
            >删除</el-button>
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
        <myflow :parentCellsJsonStr="parentCellsJsonStr" :projectCanEditProjectDeptList="allDeptList"  @saveFromMyflow="saveFromMyflow" @closeMyflowDialog="closeMyflowDialog"></myflow>
      </el-dialog>
    </div>

    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>

    <EditProjectBaseDialog  ref="editProjectBaseDialog" :addOrUpdateProjectBaseDialogTitle="addOrUpdateProjectBaseDialogTitle"></EditProjectBaseDialog>
  </div>
</template>

<script>
  import { getToken } from "@/utils/auth"
  import Myflow from "../myflow/index";
  import {selectAllDeptList} from  "@/api/system/dept"
  import { selectProjectBaseList,selectProjectLiuChengTuTemplateList, selectProjectLiuChengTuDataLogList,insertLiuChengTuDataLog,insertProjectBase,updateProjectBase,deleteProjectBase } from "@/api/project/project"
  import EditProjectBaseDialog from "../projectdetail/editProjectBaseDialog";


export default {
  name: "ProjectBase",
  components: { Myflow,EditProjectBaseDialog },
  data() {
    return {
      //上传文件url
      uploadUrl:process.env.VUE_APP_BASE_API+"/common/upload",
      uploadUrlPrefix:process.env.VUE_APP_BASE_API,
      headers: {
        Authorization: "Bearer " + getToken()
      },
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
        muQianJieDuan: "",
        jianSheXingZhi: "",
        xiangMuLeiXing: ""
      },

      liuChengTuGraphVisible:false,
      curRow:null,
      //打开新增模板dialog
      addOrUpdateProjectBaseDialogTitle:"",
      addOrUpdateProjectBaseVisible:false,
      parentCellsJsonStr:"",
      //所有的dept
      allDeptList:[],
      allTemplateList:[],

      dialogImageUrl: '',
      dialogVisible: false
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
        this.total = response.total;
        this.loading = false;
        this.generateTableDataLastSeveralDayRenWuJieDian();
      })
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },

    /** 新增按钮操作 */
    handleAddOrUpdateProjectBase(addOrUpdate,row) {
      this.addOrUpdateProjectBaseDialogTitle=addOrUpdate==='add'?"新增项目":"修改项目";
      this.$refs.editProjectBaseDialog.addOrUpdateProjectBaseVisible=true;
      this.$refs.editProjectBaseDialog.init(row);
    },

    //新增或修改项目详情后的回调
    fromEditProjectBaseDialog(){
      this.getList()
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
    },


    //所有的deptList
    selectAllDeptList(){
      let curObj=this;
      selectAllDeptList().then(response=>{
          curObj.allDeptList=response.data;
        }
      )
    },

    //目前阶段翻译
    getMuQianJieDuanName(code){
      if(code==null || code==''){
        return "--";
      }
      if(code==1){
        return "前期";
      }else if(code==2){
        return "施工";
      }else if(code==3){
        return "试运营";
      }else{
        return "--"
      }
    },

    //项目类型翻译
    getXiangMuLeiXingName(code){
      if(code==null || code==''){
        return "--";
      }else if(code==1){
        return "公路";
      }else if(code==2){
        return "水运";
      }else if(code==3){
        return "铁路轨道";
      }else if(code==4){
        return "航空";
      }else if(code==5){
        return "其他";
      }else{
        return "--"
      }
    },

    //建设性质翻译
    getJianSheXingZhiName(code){
      if(code==null || code==''){
        return "--";
      }else if(code==1){
        return "新建";
      }else if(code==2){
        return "改建";
      }else if(code==3){
        return "扩建";
      }else if(code==4){
        return "改扩建";
      }else if(code==5){
        return "维护养护";
      }else if(code==6){
        return "其他";
      }else{
        return "--"
      }
    },

    //根据需要产生最近一些天的任务情况
    generateTableDataLastSeveralDayRenWuJieDian() {
      for(let k=0;k<this.tableData.length;k++){
        let relationList = this.tableData[k]['relationList'];
        if (typeof relationList != 'undefined' && relationList!=null && relationList.length > 0) {
          //先获取所有的事完成的，且有完成时间的任务
          let wanChengList = [];
          for (let i = 0; i < relationList.length; i++) {
            let tempRelation = relationList[i];
            if (typeof tempRelation['status'] != 'undefined' && typeof tempRelation['endTime'] != 'undefined' && tempRelation['status'] == 3 && tempRelation['endTime'] != null) {
              wanChengList.push(tempRelation)
            }
          }
          //再排个序
          wanChengList.sort((a, b) => {
            const valA = new Date(a.endTime).getTime() || 0;
            const valB = new Date(b.endTime).getTime() || 0;
            if (valA !== valB) {
              return valB - valA;
            }
            return 0;
          });
          this.tableData[k]['lastWanChengList'] = wanChengList.slice(0, 5)
        }else{
          this.tableData[k]['lastWanChengList']=[];
        }
        console.log(this.tableData[k]['lastWanChengList'])
      }

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


