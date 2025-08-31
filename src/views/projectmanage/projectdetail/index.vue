<template>
  <div class="app-container">

    <div>
      <el-row :gutter="20">
        <el-col :span="7">
          <div class="sss">

          </div>
        </el-col>
        <el-col :span="10">
          <div style="text-align: center;width: 100%">
            <span style="font-size: 24px;font-weight: bold;">{{curPageProjectBaseInfo.projectName}}</span>
          </div>
        </el-col>
        <el-col :span="7">
          <div  style="text-align: right;margin-bottom: 20px">
            <el-button type="primary" v-if="curPageName==='detail-1'"  @click="openProjectBaseEditPage">修改</el-button>

            <el-button type="primary" v-if="curPageName==='detail-1'"  @click="changePage('detail-2')">切换至任务页</el-button>

            <el-button type="primary"  v-if="curPageName==='detail-2'"   @click="changePage('detail-1')">切换至详情页</el-button>

            <el-button type="primary"  v-if="curPageName==='detail-2'"   @click="openLiuChengTuGraph">打开流程图</el-button>
          </div>
        </el-col>
      </el-row>
    </div>

    <div id="nodeTableDiv">
      <!--详情页-->
      <div v-if="curPageName==='detail-1'" style="height: 720px">
        <el-row :gutter="20">
          <el-col :span="7">
            <div style="box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);width: 100%;height: 720px;padding: 5px 0 0 10px">
              <div style="height: 400px">
                <div>
                  <span style="font-size: 18px;font-weight: bold">项目推进情况：</span>
                </div>

                <div style="height: 145px">
                  <div style="font-size: 14px;font-weight: bold;margin-top: 5px">
                    <el-row >
                      <el-col :span="14">
                        <div>
                          <span>已完成任务</span>
                        </div>
                      </el-col>

                      <el-col :span="10">
                        <div>
                          <span>完成时间</span>
                        </div>
                      </el-col>
                    </el-row>
                  </div>

                  <div style="white-space: pre-line;font-size: 14px;line-height: 1.8">
                    <div v-for="(item,index) in lastWanChengList" :key="'lastWanChengList'+index">
                      <el-row>
                        <el-col :span="14">
                          <div style="">
                            {{item.taskName}}
                          </div>
                        </el-col>

                        <el-col :span="10">
                          <div>
                            {{parseTime(item.endTime, '{y}-{m}-{d}')}}
                          </div>
                        </el-col>
                      </el-row>
                    </div>
                  </div>
                </div>

                <div>
                  <div style="font-size: 14px;font-weight: bold;margin-top: 5px">
                    <el-row >
                      <el-col :span="14">
                        <div>
                          <span>进行中任务</span>
                        </div>
                      </el-col>

                      <el-col :span="10">
                        <div>
                          <span>预计完成时间</span>
                        </div>
                      </el-col>
                    </el-row>
                  </div>


                  <div style="white-space: pre-line;font-size: 14px;line-height: 1.8;overflow-y: scroll;height: 195px">
                    <div v-for="(item,index) in doingList" :key="'doingList'+index">
                      <el-row >
                        <el-col :span="14">
                          <div style="">
                            {{item.taskName}}
                          </div>
                        </el-col>

                        <el-col :span="10">
                          <div style="padding-left: 3px">
                            {{typeof item.expectedEndTime=='undefined' || item.expectedEndTime==null?'--':parseTime(item.expectedEndTime, '{y}-{m}-{d}')}}
                          </div>
                        </el-col>
                      </el-row>
                    </div>
                  </div>
                </div>

              </div>


              <div style="border-top: 1px solid #e7eaec;">
                <div>
                  <span style="font-size: 18px;font-weight: bold">需协调解决事项：</span>
                </div>

                <div style="white-space: pre-line;font-size: 14px;line-height: 1.8;overflow-y: auto;height: 270px" v-html="formatContent(curPageProjectBaseInfo.remark)">

                </div>
              </div>
            </div>

          </el-col>

          <el-col :span="10">
            <div style="width: 100%;height: 250px;">
              <div>
                <el-descriptions :labelStyle="{'width' : '80px'}" :contentStyle="{'min-width': '120px','text-align': 'left'}" :column="3" border >
                  <el-descriptions-item  label="项目类型">{{getXiangMuLeiXingName(curPageProjectBaseInfo.xiangMuLeiXing)}}</el-descriptions-item>
                  <el-descriptions-item label="建设性质">{{getJianSheXingZhiName(curPageProjectBaseInfo.jianSheXingZhi)}}</el-descriptions-item>
                  <el-descriptions-item label="投资(万)">{{curPageProjectBaseInfo.zongTouZi?curPageProjectBaseInfo.zongTouZi:'--'}}</el-descriptions-item>
                  <el-descriptions-item label="目前阶段">{{getMuQianJieDuanName(curPageProjectBaseInfo.muQianJieDuan)}}</el-descriptions-item>
                  <el-descriptions-item label="拟开工">{{curPageProjectBaseInfo.niKaiGongRiQi?parseTime(curPageProjectBaseInfo.niKaiGongRiQi, '{y}-{m}-{d}'):'--'}}</el-descriptions-item>
                  <el-descriptions-item label="拟完工">{{curPageProjectBaseInfo.niWanGongRiQi?parseTime(curPageProjectBaseInfo.niWanGongRiQi, '{y}-{m}-{d}'):'--'}}</el-descriptions-item>
                  <el-descriptions-item :span="3" label="项目地址" :contentStyle="{'text-align': 'left'}">
                    <div v-if="checkHasHuanHangFu(curPageProjectBaseInfo.xiangMuDiZhi)|| (curPageProjectBaseInfo.xiangMuDiZhi!=null && curPageProjectBaseInfo.xiangMuDiZhi.length>20)">
                      <el-popover
                        placement="right"
                        width="400"
                        trigger="hover">
                        <div style="white-space: pre-line" v-html="curPageProjectBaseInfo.xiangMuDiZhi">
                        </div>
                        <span slot="reference" style="color:#409EFF " >{{getFirstLineOrLimitNumStr(curPageProjectBaseInfo.xiangMuDiZhi,20)+'(...)'}}</span>
                      </el-popover>
                    </div>

                    <div v-else>
                      {{curPageProjectBaseInfo.xiangMuDiZhi}}
                    </div>
                  </el-descriptions-item>
                  <el-descriptions-item :span="3" label="建设单位" :contentStyle="{'text-align': 'left'}">
                    <div v-if="checkHasHuanHangFu(curPageProjectBaseInfo.jianSheDanWei)|| (curPageProjectBaseInfo.jianSheDanWei!=null && curPageProjectBaseInfo.jianSheDanWei.length>20)">
                      <el-popover
                        placement="right"
                        width="400"
                        trigger="hover">
                        <div style="white-space: pre-line" v-html="curPageProjectBaseInfo.jianSheDanWei">
                        </div>
                        <span slot="reference" style="color:#409EFF " >{{getFirstLineOrLimitNumStr(curPageProjectBaseInfo.jianSheDanWei,20)+'(...)'}}</span>
                      </el-popover>
                    </div>

                    <div v-else>
                      {{curPageProjectBaseInfo.jianSheDanWei}}
                    </div>
                  </el-descriptions-item>
                </el-descriptions>

                <div class="extraDiv1">
                  <el-descriptions  :labelStyle="{'width' : '80px'}" :contentStyle="{'min-width': '120px','text-align': 'left'}" :column="2" border >
                    <el-descriptions-item label="设计单位">
                      <div v-if="checkHasHuanHangFu(curPageProjectBaseInfo.sheJiDanWei)|| (curPageProjectBaseInfo.sheJiDanWei!=null && curPageProjectBaseInfo.sheJiDanWei.length>20)">
                        <el-popover
                          placement="right"
                          width="400"
                          trigger="hover">
                          <div style="white-space: pre-line" v-html="curPageProjectBaseInfo.sheJiDanWei">
                          </div>
                          <span slot="reference" style="color:#409EFF " >{{getFirstLineOrLimitNumStr(curPageProjectBaseInfo.sheJiDanWei,20)+'(...)'}}</span>
                        </el-popover>
                      </div>

                      <div v-else>
                        {{curPageProjectBaseInfo.sheJiDanWei}}
                      </div>
                    </el-descriptions-item>
                    
                    <el-descriptions-item label="监理单位">
                      <div v-if="checkHasHuanHangFu(curPageProjectBaseInfo.jianLiDanWei)|| (curPageProjectBaseInfo.jianLiDanWei!=null && curPageProjectBaseInfo.jianLiDanWei.length>20)">
                        <el-popover
                          placement="right"
                          width="400"
                          trigger="hover">
                          <div style="white-space: pre-line" v-html="curPageProjectBaseInfo.jianLiDanWei">
                          </div>
                          <span slot="reference" style="color:#409EFF " >{{getFirstLineOrLimitNumStr(curPageProjectBaseInfo.jianLiDanWei,20)+'(...)'}}</span>
                        </el-popover>
                      </div>

                      <div v-else>
                        {{curPageProjectBaseInfo.jianLiDanWei}}
                      </div>
                    </el-descriptions-item>

                    <el-descriptions-item label="施工单位">
                      <div v-if="checkHasHuanHangFu(curPageProjectBaseInfo.shiGongDanWei)|| (curPageProjectBaseInfo.shiGongDanWei!=null && curPageProjectBaseInfo.shiGongDanWei.length>20)">
                        <el-popover
                          placement="right"
                          width="400"
                          trigger="hover">
                          <div style="white-space: pre-line" v-html="curPageProjectBaseInfo.shiGongDanWei">
                          </div>
                          <span slot="reference" style="color:#409EFF " >{{getFirstLineOrLimitNumStr(curPageProjectBaseInfo.shiGongDanWei,20)+'(...)'}}</span>
                        </el-popover>
                      </div>

                      <div v-else>
                        {{curPageProjectBaseInfo.shiGongDanWei}}
                      </div>
                    </el-descriptions-item>

                    <el-descriptions-item label="接养单位">
                      <div v-if="checkHasHuanHangFu(curPageProjectBaseInfo.jieYangDanWei)|| (curPageProjectBaseInfo.jieYangDanWei!=null && curPageProjectBaseInfo.jieYangDanWei.length>20)">
                        <el-popover
                          placement="right"
                          width="400"
                          trigger="hover">
                          <div style="white-space: pre-line" v-html="curPageProjectBaseInfo.jieYangDanWei">
                          </div>
                          <span slot="reference" style="color:#409EFF " >{{getFirstLineOrLimitNumStr(curPageProjectBaseInfo.jieYangDanWei,20)+'(...)'}}</span>
                        </el-popover>
                      </div>

                      <div v-else>
                        {{curPageProjectBaseInfo.jieYangDanWei}}
                      </div>
                    </el-descriptions-item>
                  </el-descriptions>
                </div>

              </div>
            </div>

            <div style="margin-top:20px;box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);width: 100%;height: 450px;padding: 5px 0 0 10px">
              <div style="height: 100%" >
                <el-carousel trigger="click" height="450px">
                  <el-carousel-item v-for="item in fileList" :key="item.url">
                    <el-image
                      :src="item.url"
                      fit="cover"
                      style="width: 99%;height: 440px"
                      :preview-src-list="fileUrlList"
                    >
                    </el-image>
                  </el-carousel-item>
                </el-carousel>
              </div>
            </div>
          </el-col>

          <el-col :span="7">
            <div style="box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);width: 100%;height: 720px;padding: 5px 0 0 10px">
              <div style="height: 400px">
                <div>
                  <span style="font-size: 18px;font-weight: bold">主要建设内容：</span>
                </div>

                <div style="white-space: pre-line;font-size: 14px;line-height: 1.8;overflow-y: auto;height: 365px" v-html="formatContent(curPageProjectBaseInfo.zhuYaoJianSheNeiRong)">

                </div>
              </div>

              <div style="border-top: 1px solid #e7eaec;">
                <div>
                  <span style="font-size: 18px;font-weight: bold">拟新增用地情况：</span>
                </div>

                <div style="white-space: pre-line;font-size: 14px;line-height: 1.8;overflow-y: auto;height: 270px" v-html="formatContent(curPageProjectBaseInfo.niXinZenYongDiQingKuang)">

                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!--表格流程图-->
      <div v-if="curPageName==='detail-2'">
        <el-table v-loading="loading" :data="sortedNodeTableData"  class="custom-class" :span-method="objectSpanMethod"  border>

          <el-table-column v-for="item in maxContentsNum-1" :key="item"   label="" align="center" min-width="100px" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <div v-if="item==1" style="font-size:24px;font-weight: bold" >{{scope.row.data["contentsTableColumn"+(item-1)]}}</div>
              <div v-else style="font-size:18px;font-weight: bold" >{{scope.row.data["contentsTableColumn"+(item-1)]}}</div>
            </template>
          </el-table-column>


          <el-table-column label="任务名称" align="center" prop="createTime" min-width="120px"  :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span style="color: #36a3f7;cursor:pointer" @click="openTaskItemEditPage(scope.row)">{{ scope.row.data.taskName }}</span>
            </template>
          </el-table-column>

          <!--1 未开始 2 进行中 3 完成 4 不再关注 5 部分完成-->
          <el-table-column label="完成情况" align="center"  min-width="70px">
            <template slot-scope="scope">
              <el-tag :color="scope.row.data.status==1?'#5f95ff':scope.row.data.status==2?'#FF3333':scope.row.data.status==3?'#7FFF00':scope.row.data.status==4?'#878787':scope.row.data.status==5?'#C9DD23':''">{{getStatusName(scope.row)}}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="负责部门" align="left" prop="createTime" min-width="90px"  :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <div>
                <span >{{ scope.row.data.allChargeDeptNameStr }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="任务开始时间" align="center" prop="startTime" min-width="90px">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.data.startTime, '{y}-{m}-{d}') }}</span>
            </template>
          </el-table-column>

          <el-table-column label="任务结束时间" align="center" prop="endTime" min-width="90px">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.data.endTime, '{y}-{m}-{d}') }}</span>
            </template>
          </el-table-column>

          <el-table-column label="预期开始时间" align="center" prop="expectedStartTime" min-width="90px">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.data.expectedStartTime, '{y}-{m}-{d}') }}</span>
            </template>
          </el-table-column>

          <el-table-column label="预期结束时间" align="center" prop="expectedEndTime" min-width="90px">
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
            <myflow :parentCellsJsonStr="parentCellsJsonStr" :projectCanEditProjectDeptList="allDeptList"  @saveFromMyflow="saveFromMyflow" @closeMyflowDialog="closeMyflowDialog"></myflow>
          </el-dialog>
        </div>

        <EditTaskInfoDialog ref="editTaskInfoDialog" whereComeFrom="projectDetail"></EditTaskInfoDialog>
      </div>
    </div>

    <EditProjectBaseDialog  ref="editProjectBaseDialog" addOrUpdateProjectBaseDialogTitle="修改项目"></EditProjectBaseDialog>
  </div>
</template>

<script>
  import Myflow from "../myflow/index";
  import {selectAllDeptList} from  "@/api/system/dept"
  import { selectProjectBaseList,selectProjectLiuChengTuTemplateList, selectProjectLiuChengTuDataLogList,insertLiuChengTuDataLog,insertProjectBase,updateProjectBase,deleteProjectBase } from "@/api/project/project"
  import EditTaskInfoDialog from "../myflow/components/dialog/editTaskInfoDialog.vue";
  import EditProjectBaseDialog from "../projectdetail/editProjectBaseDialog";

export default {
  name: "ProjectBase",
  components: { Myflow ,EditTaskInfoDialog,EditProjectBaseDialog},
  data() {
    return {
      //当前页名 detail-1 详情页 detail-2 表格、流程图
      curPageName:"detail-1",
      curPageProjectBaseInfo:{},

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
      spanArr0:[],
      spanArr1:[],
      position0:0,
      position1:0,
      //原始目录配置
      contentsSetStr:"",
      //原始目录配置map
      contentsSetMap:{},
      allDeptList:[],
      allDeptMap:{},
      //流程图是否可见
      liuChengTuGraphVisible:false,
      parentCellsJsonStr:"",
      parentCellsObjectList:null,
      curRowCanEditProjectDeptList:[],
      //当前最大目录数
      maxContentsNum:0,
      fileList:[],
      fileUrlList:[],
      //最新完成的任务
      lastWanChengList:[],
      //进行中任务
      doingList:[],


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
    changePage(name){
      this.curPageName=name;
    },

    //打开编辑项目详情页
    openProjectBaseEditPage(){
      this.$refs.editProjectBaseDialog.addOrUpdateProjectBaseVisible=true;
      this.$refs.editProjectBaseDialog.init(this.curPageProjectBaseInfo);
    },

    //打开子任务节点的编辑页面
    openTaskItemEditPage(node){
      this.$refs.editTaskInfoDialog.visible=true;
      this.$refs.editTaskInfoDialog.init({ type: "node", item: node,"projectCanEditProjectDeptList":this.curRowCanEditProjectDeptList });
    },

    saveFromEditTaskInfoDialog(tempObj){
      let curObj=this;
      let node=tempObj["item"];
      for(let i=0;i<this.parentCellsObjectList.length;i++){
        if(this.parentCellsObjectList[i]["id"]==node.id){
          this.parentCellsObjectList[i]=node;
        }
      }
      let param={
        "projectBaseId":this.queryParams.projectBaseId,
        "currentCellsJsonStr":JSON.stringify(this.parentCellsObjectList)
      }
      insertLiuChengTuDataLog(param).then(response => {
        curObj.$message({
          message: "上传成功",
          type: "success"
        });
      })
    },

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
            curObj.curPageProjectBaseInfo=tempList[0];
            //生成文件列表
            curObj.generateDefaultFileList();
            let tempObj=tempList[0];
            //获取节点信息
            let cellsJsonStr=tempObj["cellsJsonStr"];
            this.parentCellsJsonStr=cellsJsonStr;
            this.parentCellsObjectList=JSON.parse(cellsJsonStr);
            //对节点进行排序
            curObj.sortedNodeTableData=curObj.getNodeDataAndSort(cellsJsonStr);
            //根据配置好的目录，生成对象（其实非map）
            curObj.generateContentsSetMap(tempObj["contentsSetStr"]);
            //补充所有目录单元格
            curObj.supplyContentsSetNumStr();
            //确定哪些单元格要合并
            curObj.rowspan();
            //补充所有的部门信息
            curObj.supplyNodeChargeDeptName()
            //获取最新完成任务
            curObj.generateLastSeveralDayRenWuJieDian();
            //获取正在进行中的任务
            curObj.generateDoingRenWuJieDian();
          }
        }
      })
    },

    //补充目录名字
    supplyContentsSetNumStr(){
      for(let i=0;i<this.sortedNodeTableData.length;i++){
        let tempObj=this.sortedNodeTableData[i]["data"];
        //获取当前的节点目录信息例如【1,1,0】
        let splitContentsNumArr=tempObj["splitContentsNumArr"];
        for(let j=0;j<this.maxContentsNum-1;j++){
          //获取当前的key,例如1 例如1.1
          let key="contentsNumStr";
          for(let k=0;k<=j;k++){
            key+=splitContentsNumArr[k];
            if(k!=j){
              key+=".";
            }
          }
          //如果不带0，则赋值
          if(splitContentsNumArr[j]=='0'){
            this.sortedNodeTableData[i]["data"]["contentsTableColumn"+j]="-";
          }else{
            this.sortedNodeTableData[i]["data"]["contentsTableColumn"+j]=this.contentsSetMap[key];
          }
        }
      }
    },

    //补充部门名字
    supplyNodeChargeDeptName() {
      if (!this.allDeptMap) {
        return
      }
      this.sortedNodeTableData.forEach(item => {
        const { data } = item
        const chargeDeptIdList = data.chargeDeptIdList || []

        if (chargeDeptIdList.length > 0) {
          data.allChargeDeptNameStr = chargeDeptIdList
            .map(id => this.allDeptMap[id] || "未知部门")
            .join(";")
        }
      })
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
            this.$set(this.contentsSetMap, "contentsNumStr"+temArr[0], temArr[1]);
          }
        }
      }else{
        this.contentsSetMap=new Map();
      }
    },

    getNodeDataAndSort(cellsJsonStr){
      let tempList=JSON.parse(cellsJsonStr);
      let returnArr=[];
      //循环以后，先计算获取最大目录层级
      let maxContentsNum=0;
      if(tempList.length>0){
        for(let i=0;i<tempList.length;i++){
          let tempObj=tempList[i];
          if(tempObj["shape"]==="dag-commonTaskNode"){
            if(typeof tempObj.data.contentsNumStr !='undefined'){
              //目录可以是1.1.1.2.3   或者4.1之类
              let curContentsNum=tempObj.data["contentsNumStr"].split(".").length;
              if(maxContentsNum<curContentsNum){
                maxContentsNum=curContentsNum;
              }
            }
          }
        }
        this.maxContentsNum=maxContentsNum;
        //遍历每个目录，组装所有的目录，并补全到最多层级
        for(let i=0;i<tempList.length;i++){
          let tempObj=tempList[i];
          if(tempObj["shape"]==="dag-commonTaskNode"){
            if(typeof tempObj.data.contentsNumStr !='undefined'){
              //目录可以是1.1.1.2.3   或者4.1之类，反正第一个必须是
              //加入最高4层，那就是整一个数组【1,1,2,30】
              //如果只有1.1 那就是【1,1,0,0】
              let splitContentsNumArr=tempObj.data["contentsNumStr"].split(".");
              let originContentsNumArrLength=splitContentsNumArr.length;
              for(let j=0;j<maxContentsNum-originContentsNumArrLength;j++){
                splitContentsNumArr.push(0);
              }
              tempObj.data["splitContentsNumArr"]=splitContentsNumArr;
            }
            returnArr.push(tempObj)
          }
        }
      }

      //开始排序
      //多层排序，一层一层来
      for(let i=0;i<maxContentsNum;i++){
        returnArr.sort((a, b) => {
          for(let i=0; i<maxContentsNum; i++) {
            const valA = a.data.splitContentsNumArr[i] || 0;
            const valB = b.data.splitContentsNumArr[i] || 0;
            if(valA !== valB) {
              return valA - valB;
            }
          }
          return 0;
        });
      }
      return returnArr;
    },

    // 纵向相同项合并
    rowspan() {
      this.sortedNodeTableData.forEach((item, index) => {
        if (index === 0) {
          for(let i=0;i<this.maxContentsNum-1;i++){
            this["spanArr"+i].push(1)
            this["position"+i] = 0
          }
        } else {
          for(let i=0;i<this.maxContentsNum-1;i++){
            if (this.sortedNodeTableData[index].data["contentsTableColumn"+i] == this.sortedNodeTableData[ index-1 ].data["contentsTableColumn"+i] ) {
              this["spanArr"+i][this["position"+i]] += 1
              this["spanArr"+i].push(0)
            } else {
              this["spanArr"+i].push(1)
              this["position"+i]= index
            }
          }
        }
      })
    },


    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        const _row = this.spanArr0[rowIndex]
        const _col = _row > 0 ? 1: 0
        return {
          rowspan: _row,
          colspan: _col
        }
      }
      if (columnIndex === 1) {
        const _row = this.spanArr1[rowIndex]
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

    //编辑项目详情 后的回调
    fromEditProjectBaseDialog(){
      window.location.reload()
    },

    closeMyflowDialog(){
      this.liuChengTuGraphVisible=false;
    },

    //目前阶段翻译
    getMuQianJieDuanName(code){
      if(code==null || code==''){
        return "--";
      }else if(code==1){
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

    /**
     * 获取字符串第一行内容，并限制最大长度
     * @param {string} str - 可能包含换行符的字符串
     * @param {number} num - 最大允许字符数
     * @returns {string} 处理后的字符串
     */
    getFirstLineOrLimitNumStr(str, num) {
    if (!str || typeof str !== 'string') return '';

    // 获取第一行内容（以换行符分割）
    const firstLine = str.split(/\r?\n/)[0];

    // 限制最大长度
    return firstLine.length > num
      ? firstLine.substring(0, num)
      : firstLine;
    },

    checkHasHuanHangFu(str){
      if(typeof str =='undefined' || str==null){
        return false;
      }
      str+="";
      return str.includes('\n') || str.includes('\r') || str.includes('\r\n');
    },

    //从数据库中生成文件
    generateDefaultFileList(){
      let originFileNameListStr=this.curPageProjectBaseInfo.originFileNameListStr;
      let curFilePathAndNameListStr=this.curPageProjectBaseInfo.curFilePathAndNameListStr;
      if(typeof originFileNameListStr!='undefined' && originFileNameListStr!=null && originFileNameListStr!=''){
        this.curPageProjectBaseInfo.originFileNameList=originFileNameListStr.split("*@*");
        this.curPageProjectBaseInfo.curFilePathAndNameList=curFilePathAndNameListStr.split("*@*");
        let returnArr=[];
        let fileUrlList=[];
        if(this.curPageProjectBaseInfo.originFileNameList.length>0){
          for(let i=0;i<this.curPageProjectBaseInfo.originFileNameList.length;i++){
            let tempObj={
              name:this.curPageProjectBaseInfo.originFileNameList[i],
              url:process.env.VUE_APP_BASE_API+this.curPageProjectBaseInfo.curFilePathAndNameList[i]
            }
            returnArr.push(tempObj);
            fileUrlList.push(tempObj['url']);
          }
        }
        this.fileList=returnArr;
        this.fileUrlList=fileUrlList;
      }else{
        this.fileList=[]
        this.fileUrlList=[]
      }
    },

    // 在组件methods或setup中添加：
    formatContent(text) {
      if(typeof text!='undefined'){
        return text.replace(/ /g, '&nbsp;').replace(/\n/g, '<br/>')
      }else {
        return "--"
      }
    },

    //根据需要产生最近一些天的任务情况
    generateLastSeveralDayRenWuJieDian(){
      let relationList=this.curPageProjectBaseInfo.relationList;
      if(typeof relationList!='undefined' && relationList.length>0){
        //先获取所有的事完成的，且有完成时间的任务
        let wanChengList=[];
        for(let i=0;i<relationList.length;i++){
          let tempRelation=relationList[i];
          if(typeof tempRelation['status'] !='undefined' &&  typeof tempRelation['endTime'] !='undefined' &&   tempRelation['status']==3 && tempRelation['endTime']!=null){
            wanChengList.push(tempRelation)
          }
        }
        //再排个序
        wanChengList.sort((a, b) => {
          const valA = new Date(a.endTime).getTime() || 0;
          const valB = new Date(b.endTime).getTime() || 0;
          if(valA !== valB) {
            return valB-valA;
          }
          return 0;
        });
        this.lastWanChengList=wanChengList.slice(0,5)
      }
    },

    generateDoingRenWuJieDian() {
      let relationList = this.curPageProjectBaseInfo.relationList;

      // 1. 过滤出状态为2的进行中任务
      if (relationList?.length > 0) {
        let doingList = relationList.filter(item =>
          item.status === 2 && !item.completed
        );

        // 2. 改进排序逻辑（处理undefined/null/空字符串）
        this.doingList = doingList.sort((a, b) => {
          // 将无效日期统一转为最大时间戳
          const timeA = getValidTime(a.expectedEndTime) || Infinity;
          const timeB = getValidTime(b.expectedEndTime) || Infinity;

          // 比较时间戳
          return timeA - timeB;
        });
      } else {
        this.doingList = [];
      }
    }

  }
}

  function getValidTime(time) {
    if (!time) return null;

    const date = new Date(time);
    return isNaN(date) ? null : date.getTime();
  }

</script>

<style rel="stylesheet/scss" lang="scss">
  #nodeTableDiv .el-tag {
    color:white !important;
  }

  .el-dialog__header {
    display: none !important;
  }

  .el-dialog__body{
    padding: 10px 20px !important;
  }

  .sss::before {
    content: "";
    display: block;
    width: 100%; /* 占满整个宽度 */
    height: 50px; /* 指定高度 */
  }

  .extraDiv1 .el-descriptions .is-bordered .el-descriptions-item__cell{
    border-top: 0px !important;
  }
</style>


