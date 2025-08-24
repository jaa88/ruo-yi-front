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
          <el-option label="不再关注" value="4" />
        </el-select>
      </el-form-item>

      <el-form-item label="项目类型" prop="noticeTitle">
        <el-select style="width:150px" v-model="queryParams.xiangMuLeiXing" @change="handleQuery"  clearable placeholder="项目类型">
          <el-option label="类型1" value="1" />
          <el-option label="类型2" value="2" />
          <el-option label="类型3" value="3" />
          <el-option label="类型4" value="4" />
        </el-select>
      </el-form-item>

      <el-form-item label="建设性质" prop="noticeTitle">
        <el-select style="width:150px" v-model="queryParams.jianSheXingZhi" @change="handleQuery" clearable  placeholder="建设性质">
          <el-option label="建设性质1" value="1" />
          <el-option label="建设性质2" value="2" />
          <el-option label="建设性质3" value="3" />
          <el-option label="建设性质4" value="4" />
        </el-select>
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

        <el-table-column  label="目前阶段" align="center" min-width="120px" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{getMuQianJieDuanName(scope.row.muQianJieDuan)}}</span>
          </template>
        </el-table-column>

        <el-table-column  label="建设单位" align="center" min-width="120px" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{scope.row.jianSheDanWei}}</span>
          </template>
        </el-table-column>

        <el-table-column  label="总投资（万元）" align="center" min-width="120px" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{scope.row.zongTouZi}}</span>
          </template>
        </el-table-column>

        <el-table-column label="责任部门" align="center" prop="createTime" min-width="120px"  :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span v-for="item in scope.row.deptList">{{ item.deptName+";" }}</span>
          </template>
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

        <el-table-column  label="近期完成任务" min-width="120px" align="center" :show-overflow-tooltip="true">
          <template slot-scope="scope"> 具体实现逻辑还需考虑 </template>
        </el-table-column>

        <el-table-column  label="备注" min-width="120px" align="center">
          <template slot-scope="scope"> {{scope.row.remark}} </template>
        </el-table-column>

        <!--<el-table-column label="更新时间" align="center" prop="createTime" width="100">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>-->

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
        <myflow :parentCellsJsonStr="parentCellsJsonStr" :projectCanEditProjectDeptList="allDeptList"  @saveFromMyflow="saveFromMyflow" @closeMyflowDialog="closeMyflowDialog"></myflow>
      </el-dialog>
    </div>

    <!-- 添加或修改岗位对话框 -->
    <el-dialog id="ffff" :title="addOrUpdateProjectBaseDialogTitle" :visible.sync="addOrUpdateProjectBaseVisible" width="1200px" append-to-body  @close="cancelAddOrUpdateProjectBase">
      <div style="padding-top: 20px">
        <el-form ref="addOrUpdateProjectBaseForm" :model="addOrUpdateProjectBaseForm" :rules="addOrUpdateProjectBaseFormRules" label-width="120px">
          <el-row>
            <el-col :span="12">
              <div style="padding-right: 20px">
                <el-form-item label="项目名称" prop="projectName">
                  <el-input v-model="addOrUpdateProjectBaseForm.projectName" placeholder="项目名称" />
                </el-form-item>

                <el-form-item label="项目代码" prop="xiangMuDaiMa">
                  <el-input v-model="addOrUpdateProjectBaseForm.xiangMuDaiMa" placeholder="项目投资代码" />
                </el-form-item>

                <el-form-item label="目前阶段" prop="muQianJieDuan">
                  <el-select style="width:150px" v-model="addOrUpdateProjectBaseForm.muQianJieDuan" placeholder="目前阶段">
                    <el-option label="前期" value="1" />
                    <el-option label="施工" value="2" />
                    <el-option label="试运营" value="3" />
                    <el-option label="不再关注" value="4" />
                  </el-select>
                </el-form-item>

                <el-form-item label="项目主图" style="margin-bottom: 10px !important;margin-top: 30px !important;">
                  <el-upload style="" list-type="picture-card"
                             :file-list="addOrUpdateProjectBaseForm.fileList"
                             :limit="1"
                             :on-success="onSuccess" :on-error="onError" :on-remove="handleRemove"
                             :action="uploadUrl" :headers="headers" accept=".jpg,.jpeg,.png"
                             :on-preview="handlePictureCardPreview"
                  >
                       <el-button size="small" type="primary">导入</el-button>
                  </el-upload>
                </el-form-item>

                <el-form-item label="项目地址" prop="zongTouZi">
                  <el-input type="textarea" :rows="3" v-model="addOrUpdateProjectBaseForm.xiangMuDiZhi" placeholder="项目地址" />
                </el-form-item>
              </div>
            </el-col>

            <el-col :span="12">
              <div style="padding-right: 20px">
                <el-form-item label="项目类型" prop="xiangMuLeiXing">
                  <el-select style="width:150px" v-model="addOrUpdateProjectBaseForm.xiangMuLeiXing" placeholder="项目类型">
                    <el-option label="类型1" value="1" />
                    <el-option label="类型2" value="2" />
                    <el-option label="类型3" value="3" />
                    <el-option label="类型4" value="4" />
                  </el-select>
                </el-form-item>

                <el-form-item label="建设性质" prop="jianSheXingZhi">
                  <el-select style="width:150px" v-model="addOrUpdateProjectBaseForm.jianSheXingZhi" placeholder="建设性质">
                    <el-option label="建设性质1" value="1" />
                    <el-option label="建设性质2" value="2" />
                    <el-option label="建设性质3" value="3" />
                    <el-option label="建设性质4" value="4" />
                  </el-select>
                </el-form-item>

                <el-form-item label="总投资" prop="zongTouZi">
                  <el-input v-model="addOrUpdateProjectBaseForm.zongTouZi" placeholder="总投资" />
                </el-form-item>

                <el-form-item label="拟开工日期" prop="zongTouZi">
                  <el-date-picker
                    v-model="addOrUpdateProjectBaseForm.niKaiGongRiQi"
                    type="date"
                    placeholder="拟开工日期">
                  </el-date-picker>
                </el-form-item>

                <el-form-item label="拟开工日期" prop="zongTouZi">
                  <el-date-picker
                    v-model="addOrUpdateProjectBaseForm.niWanGongRiQi"
                    type="date"
                    placeholder="拟完工日期">
                  </el-date-picker>
                </el-form-item>

                <el-form-item label="建设单位" prop="projectName">
                  <el-input v-model="addOrUpdateProjectBaseForm.jianSheDanWei" placeholder="建设单位" />
                </el-form-item>

                <el-form-item label="项目负责人" prop="projectName">
                  <el-input v-model="addOrUpdateProjectBaseForm.xiangMuFuZeRen" placeholder="项目负责人" />
                </el-form-item>

                <el-form-item label="联系方式" prop="projectName">
                  <el-input v-model="addOrUpdateProjectBaseForm.lianXiFangShi" placeholder="联系方式" />
                </el-form-item>

              </div>
            </el-col>
          </el-row>

          <el-form-item label="主要建设内容" prop="zongTouZi">
            <el-input type="textarea" :rows="3" v-model="addOrUpdateProjectBaseForm.zhuYaoJianSheNeiRong" placeholder="主要建设内容" />
          </el-form-item>

          <el-form-item label="拟新增用地情况" prop="zongTouZi">
            <el-input type="textarea" :rows="3"  v-model="addOrUpdateProjectBaseForm.niXinZenYongDiQingKuang" placeholder="拟新增用地情况" />
          </el-form-item>

          <el-form-item label="备注" prop="remark">
            <el-input type="textarea" :rows="3"  v-model="addOrUpdateProjectBaseForm.remark" placeholder="备注" />
          </el-form-item>

          <el-form-item label="目录配置" prop="remark">
            <el-input type="textarea" :rows="3"  v-model="addOrUpdateProjectBaseForm.contentsSetStr" placeholder="类似如下“1:前期,2:中期,3:后期”，英文符号" />
          </el-form-item>

          <el-form-item v-if="addOrUpdateProjectBaseDialogTitle=='新增项目'" label="初始模板" prop="projectName">
            <el-select v-model="addOrUpdateProjectBaseForm.cellsJsonStr" filterable placeholder="请选择">
              <el-option
                v-for="item in allTemplateList"
                :key="item.id"
                :label="item.templateName"
                :value="item.cellsJsonStr">
              </el-option>
            </el-select>
          </el-form-item>

        </el-form>
        <div slot="footer" class="dialog-footer" style="text-align: right">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancelAddOrUpdateProjectBase">取 消</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>

  </div>
</template>

<script>
  import { getToken } from "@/utils/auth"
  import Myflow from "../myflow/index";
  import {selectAllDeptList} from  "@/api/system/dept"
  import { selectProjectBaseList,selectProjectLiuChengTuTemplateList, selectProjectLiuChengTuDataLogList,insertLiuChengTuDataLog,insertProjectBase,updateProjectBase,deleteProjectBase } from "@/api/project/project"

export default {
  name: "ProjectBase",
  components: { Myflow },
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
      allTemplateList:[],
      //新增项目时选择的初始模板
      choosedInitCellsJsonStr:"",
      dialogImageUrl: '',
      dialogVisible: false
    }
  },
  created() {
    this.getList()
  },

  mounted(){
    this.selectAllDeptList();
    this.selectAllTemplateList();
  },
  methods: {
    handlePictureCardPreview(file){
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },

    /**
     * 上传失败回调函数
     */
    onError(err, file, fileList) {
      this.$message({
        message: "上传失败",
        type: "error"
      });
    },

    /**
     * 上传成功回调函数
     */
    onSuccess(response, file, fileList) {
      if(response.code==500){
        this.$message({
          message: "上传失败:"+response.msg,
          type: "error"
        });
        return;
      }

      this.$message({
        message: "上传成功",
        type: "info"
      });
      let returnUploadFile=response;
      this.addOrUpdateProjectBaseForm.returnUploadFileList.push(returnUploadFile);
      this.addOrUpdateProjectBaseForm.projectMainImagePathAndName=returnUploadFile["fileName"];
    },

    //删除文件回调
    handleRemove(file,fileList){
      for(let i=this.addOrUpdateProjectBaseForm.returnUploadFileList.length-1;i>0;i--){
        if(file.name===this.addOrUpdateProjectBaseForm.returnUploadFileList[i]["originalFilename"]){
          this.addOrUpdateProjectBaseForm.returnUploadFileList.slice(i,1);
          break;
        }
      }
    },

    selectAllTemplateList(){
      selectProjectLiuChengTuTemplateList({"pageNum":1,"pageSize":1000}).then(response => {
        this.allTemplateList = response.data
      })
    },

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
      this.addOrUpdateProjectBaseForm={
        fileList:[],
        returnUploadFileList:[]
      };
      this.addOrUpdateProjectBaseDialogTitle="新增项目";
      this.addOrUpdateProjectBaseVisible = true;
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.addOrUpdateProjectBaseForm={
        "projectName":row.projectName,
        "remark":row.remark,
        "contentsSetStr":row.contentsSetStr,
        "id":row.id,
        fileList:row.projectMainImagePathAndName!=null && row.projectMainImagePathAndName!=''?[{"projectMainImagePathAndName":row.projectMainImagePathAndName,"url":process.env.VUE_APP_BASE_API+row.projectMainImagePathAndName}]:[],
        projectMainImagePathAndName:row.projectMainImagePathAndName,
        returnUploadFileList:[],
        //补充
        xiangMuDaiMa:row.xiangMuDaiMa,
        muQianJieDuan:row.muQianJieDuan+'',
        xiangMuDiZhi:row.xiangMuDiZhi,
        xiangMuLeiXing:row.xiangMuLeiXing+'',
        jianSheXingZhi:row.jianSheXingZhi+'',
        zongTouZi:row.zongTouZi,
        niKaiGongRiQi:row.niKaiGongRiQi,
        niWanGongRiQi:row.niWanGongRiQi,
        jianSheDanWei:row.jianSheDanWei,
        xiangMuFuZeRen:row.xiangMuFuZeRen,
        lianXiFangShi:row.lianXiFangShi,
        zhuYaoJianSheNeiRong:row.zhuYaoJianSheNeiRong,
        niXinZenYongDiQingKuang:row.niXinZenYongDiQingKuang,
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
      }
      if(code==2){
        return "施工";
      }
      if(code==3){
        return "试运营";
      }
      if(code==4){
        return "不再关注";
      }
    },

    //项目类型翻译
    getXiangMuLeiXingName(code){
      if(code==null || code==''){
        return "--";
      }
      if(code==1){
        return "类型1";
      }
      if(code==2){
        return "类型2";
      }
      if(code==3){
        return "类型3";
      }
      if(code==4){
        return "类型4";
      }
    },

    //建设性质翻译
    getJianSheXingZhiName(code){
      if(code==null || code==''){
        return "--";
      }
      if(code==1){
        return "性质1";
      }
      if(code==2){
        return "性质2";
      }
      if(code==3){
        return "性质3";
      }
      if(code==4){
        return "性质4";
      }
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

  #projectBaseTableDiv .custom-class .el-table__row{
    height: 80px;
  }
</style>


