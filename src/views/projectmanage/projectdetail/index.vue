<template>
  <div class="app-container">

    <div style="text-align: right;margin-bottom: 20px">
      <el-button type="primary"  @click="openLiuChengTuGraph">打开流程图</el-button>
    </div>

    <div id="testJi">
      <el-table v-loading="loading" :data="sortedNodeTableData"  class="custom-class"  :span-method="objectSpanMethod" border>
        <el-table-column  label="分期" align="center" min-width="120px" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <div style="font-size:24px;font-weight: bold" >{{scope.row.data.parentContentsNumSetName}}</div>
          </template>
        </el-table-column>

        <el-table-column label="任务名称" align="center" prop="createTime" min-width="120px"  :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span >{{ scope.row.data.taskName }}</span>
          </template>
        </el-table-column>

        <!--1 未开始 2 进行中 3 完成 4 不再关注 5 部分完成-->
        <el-table-column label="完成情况" align="center"  min-width="120px">
          <template slot-scope="scope">
            <el-tag :color="scope.row.data.status==1?'#5f95ff':scope.row.data.status==2?'#FF3333':scope.row.data.status==3?'#7FFF00':scope.row.data.status==4?'#878787':scope.row.data.status==5?'#C9DD23':''">{{getStatusName(scope.row)}}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="负责部门" align="left" prop="createTime" min-width="100px"  :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <div>
              <span >{{ scope.row.data.allChargeDeptNameStr }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="任务开始时间" align="center" prop="startTime" width="100">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.data.startTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>

        <el-table-column label="预期结束时间" align="center" prop="expectedEndTime" width="100">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.data.expectedEndTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>

        <el-table-column label="备注" align="center" min-width="150px" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <span >{{ scope.row.data.remark }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="liuChengTuGraphVisible">
        <el-dialog title="流程图" :visible.sync="liuChengTuGraphVisible" width="1400px" top="5vh" append-to-body :close-on-click-modal="false">
          <myflow :parentCellsJsonStr="parentCellsJsonStr" :projectCanEditProjectDeptList="curRowCanEditProjectDeptList"  @saveFromMyflow="saveFromMyflow" @closeMyflowDialog="closeMyflowDialog"></myflow>
        </el-dialog>
      </div>
    </div>
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
        pageNum:1,
        pageSize:10,
        projectBaseId:""
      },

      sortedNodeTableData:[],
      spanArr:[],
      position:0,
      //原始目录配置
      contentsSetStr:"",
      //原始目录配置map
      contentsSetMap:{},
      allDeptList:[],
      allDeptMap:{},
      //流程图是否可见
      liuChengTuGraphVisible:false,
      parentCellsJsonStr:"",
      curRowCanEditProjectDeptList:[],

    }
  },
  created() {
    const id = this.$route.params.id;
    this.queryParams.projectBaseId=id;
    this.selectAllDeptList();
  },

  mounted(){

  },
  methods: {
    openLiuChengTuGraph(){
      this.liuChengTuGraphVisible=true;
    },


    getStatusName(row){
      let status=row.data.status;
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

    selectProjectBaseList(){
      let curObj=this;
      curObj.loading=true;
      selectProjectBaseList(curObj.queryParams).then(response=>{
        /*alert(JSON.stringify(response.data))*/
        if(response.data){
          curObj.loading=false;
          let tempList=response.data;
          if(tempList.length==1){
            let tempObj=tempList[0];
            //获取节点信息
            let cellsJsonStr=tempObj["cellsJsonStr"];
            this.parentCellsJsonStr=cellsJsonStr;
            this.curRowCanEditProjectDeptList=tempObj["canEditProjectDeptList"]
            curObj.generateContentsSetMap(tempObj["contentsSetStr"]);
            curObj.sortedNodeTableData=curObj.getNodeDataAndSort(cellsJsonStr);
            curObj.supplyContentsSetNumStr();
            //确定哪些单元格要合并
            curObj.rowspan();
            //补充所有的部门信息
            curObj.supplyNodeChargeDeptName()
          }
        }
      })
    },

    //补充目录名字
    supplyContentsSetNumStr(){
      for(let i=0;i<this.sortedNodeTableData.length;i++){
        let tempObj=this.sortedNodeTableData[i]["data"];
        let parentContentsNumStr=tempObj["parentContentsNumStr"];
        if(typeof parentContentsNumStr!='undefined' && parentContentsNumStr!=null){
          this.sortedNodeTableData[i]["data"]["parentContentsNumSetName"]=this.contentsSetMap[parentContentsNumStr];
        }
      }
    },

    //补充部门名字
    supplyNodeChargeDeptName(){
      for(let i=0;i<this.sortedNodeTableData.length;i++){
        let tempObj=this.sortedNodeTableData[i]["data"];
        let chargeDeptIdList=tempObj["chargeDeptIdList"];
        if(typeof chargeDeptIdList!='undefined' && chargeDeptIdList.length>0){
          for(let j=0;j<chargeDeptIdList.length;j++){
            console.log(JSON.stringify(this.allDeptMap))
            if(typeof this.sortedNodeTableData[i]["data"]["allChargeDeptNameStr"]=='undefined'){
              this.sortedNodeTableData[i]["data"]["allChargeDeptNameStr"]="";
            }
            this.sortedNodeTableData[i]["data"]["allChargeDeptNameStr"]+=this.allDeptMap[chargeDeptIdList[j]]+";";
          }
        }
      }
    },

    //生成目录配置
    generateContentsSetMap(contentsSetStr){
      if(typeof contentsSetStr == 'undefined' || contentsSetStr==null || contentsSetStr.trim()==""){
        this.contentsSetMap=new Map();
        return ;
      }
      let arr=contentsSetStr.split(",");
      if(arr.length>0){
        for(let i=0;i<arr.length;i++){
          let temObj=arr[i];
          let temArr=temObj.split(":");
          if(temArr.length==2){
            this.$set(this.contentsSetMap, temArr[0], temArr[1]);
          }
        }
      }else{
        this.contentsSetMap=new Map();
      }
    },

    getNodeDataAndSort(cellsJsonStr){
      let tempList=JSON.parse(cellsJsonStr);
      let returnArr=[];
      if(tempList.length>0){
        for(let i=0;i<tempList.length;i++){
          let tempObj=tempList[i];
          if(tempObj["shape"]==="dag-commonTaskNode"){
            if(typeof tempObj.data.contentsNumStr !='undefined'){
              tempObj.data["parentContentsNumStr"]=tempObj.data["contentsNumStr"].split(".")[0];
              tempObj.data["childContentsNumStr"]=tempObj.data["contentsNumStr"].split(".")[1];
            }
            returnArr.push(tempObj)
          }
        }
      }
      returnArr.sort((a, b) => a.data.parentContentsNumStr - b.data.parentContentsNumStr);
      returnArr.sort((a, b) => {
        if (a.data.parentContentsNumStr === b.data.parentContentsNumStr) {
          return a.data.childContentsNumStr - b.data.childContentsNumStr;
        }
        // 否则，按年龄排序
        return a.data.parentContentsNumStr - b.data.parentContentsNumStr;
      });
      return returnArr;
    },

    // 纵向相同项合并
    rowspan() {
      this.sortedNodeTableData.forEach((item, index) => {
        if (index === 0) {
          this.spanArr.push(1)
          this.position = 0
        } else {
          if (this.sortedNodeTableData[index].data.parentContentsNumStr == this.sortedNodeTableData[ index-1 ].data.parentContentsNumStr) {
            this.spanArr[this.position] += 1
            this.spanArr.push(0)
          } else {
            this.spanArr.push(1)
            this.position = index
          }
        }
      })
    },


    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        const _row = this.spanArr[rowIndex]
        const _col = _row > 0 ? 1: 0
        return {
          rowspan: _row,
          colspan: _col
        }
      }
    },

    //所有的deptList
    selectAllDeptList(){
      let curObj=this;
      selectAllDeptList().then(response=>{
          curObj.allDeptList=response.data;
        this.allDeptMap=new Map();
          if(curObj.allDeptList.length>0){
            for(let i=0;i<curObj.allDeptList.length;i++){
              let temObj=curObj.allDeptList[i];
              this.$set(this.allDeptMap, temObj["deptId"], temObj["deptName"]);
            }
          }
        curObj.selectProjectBaseList();
        }
      )
    },

    saveFromMyflow(data){
      let curObj=this;
      let param={
        "projectBaseId":curObj.queryParams.projectBaseId,
        "currentCellsJsonStr":JSON.stringify(data["cells"])
      }
      insertLiuChengTuDataLog(param).then(response => {
        alert("已保存成功")
        location.reload(true);
      })
    },

    closeMyflowDialog(){
      this.liuChengTuGraphVisible=false;
    },
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
  #testJi .el-tag {
    color:white !important;
  }

  .el-dialog__header {
    display: none !important;
  }

  .el-dialog__body{
    padding: 10px 20px !important;
  }
</style>


