<template>
  <div style="padding-top: 20px">
    <el-dialog
      title="编辑任务"
      :visible.sync="addOrUpdateProjectBaseVisible"
      width="1000px"
      append-to-body
    >
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

              <el-form-item label="项目图片" style="margin-bottom: 10px !important;margin-top: 30px !important;">
                <el-upload style="" list-type="picture-card"
                           :file-list="addOrUpdateProjectBaseForm.fileList"
                           :limit="10"
                           :on-success="onSuccess" :on-error="onError" :on-remove="handleRemove"
                           :action="uploadUrl"
                           :data="baseDirObj"
                           :headers="headers" accept=".jpg,.jpeg,.png"
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
    </el-dialog>

    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </div>
</template>

<script>
  import { getToken } from "@/utils/auth"
  import {deleteAndInsertFunctionAndUploadFileRelation} from "@/api/common"
  import { selectProjectBaseList,selectProjectLiuChengTuTemplateList, selectProjectLiuChengTuDataLogList,insertLiuChengTuDataLog,insertProjectBase,updateProjectBase,deleteProjectBase } from "@/api/project/project"

export default {
  name: "editProjectBaseDialog",

  props:["addOrUpdateProjectBaseDialogTitle","row"],

  data() {
    return {
      //上传文件url
      uploadUrl:process.env.VUE_APP_BASE_API+"/common/upload",
      baseDirObj:{
        baseDirStr:'ssssssssssssss'
      },
      uploadUrlPrefix:process.env.VUE_APP_BASE_API,
      headers: {
        Authorization: "Bearer " + getToken()
      },
      // 表单参数
      addOrUpdateProjectBaseForm: {},
      // 表单校验
      addOrUpdateProjectBaseFormRules: {
        templateName: [
          { required: true, message: "项目名称不能为空", trigger: "blur" }
        ]
      },
      curRow:null,
      //打开新增模板dialog
      addOrUpdateProjectBaseVisible:false,
      parentCellsJsonStr:"",
      allTemplateList:[],
      dialogImageUrl:"",
      dialogVisible:false,
    };
  },

  created() {
    this.selectAllTemplateList();
  },

  methods: {
    init(row) {
      if(row==null){
        this.addOrUpdateProjectBaseForm={
          "projectName":"",
          "remark":"",
          "contentsSetStr":"",
          "id":"",
          projectMainImagePathAndName:"",
          returnUploadFileList:[],
          //补充
          xiangMuDaiMa:"",
          muQianJieDuan:"",
          xiangMuDiZhi:"",
          xiangMuLeiXing:"",
          jianSheXingZhi:"",
          zongTouZi:"",
          niKaiGongRiQi:"",
          niWanGongRiQi:"",
          jianSheDanWei:"",
          xiangMuFuZeRen:"",
          lianXiFangShi:"",
          zhuYaoJianSheNeiRong:"",
          niXinZenYongDiQingKuang:"",

          //文件上传
          fileList:[],//文件上传后的
          originFileNameList:[],//每一个上传的文件对的原始名字
          curFilePathAndNameList:[],//每一个上传文件的相对路径

        }
      }else {
        this.addOrUpdateProjectBaseForm={
          "projectName":row.projectName,
          "remark":row.remark,
          "contentsSetStr":row.contentsSetStr,
          "id":row.id,
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
          //文件上传
          fileList:[],//文件上传后的
          originFileNameList:[],//每一个上传的文件对的原始名字
          curFilePathAndNameList:[],//每一个上传文件的相对路径
        };
        //补充文件相关
        this.addOrUpdateProjectBaseForm.originFileNameListStr=row.originFileNameListStr;
        this.addOrUpdateProjectBaseForm.curFilePathAndNameListStr=row.curFilePathAndNameListStr;
        this.generateDefaultFileList();
      }
    },

    /** 提交按钮 */
    submitForm: function() {
      let curObj=this;
      curObj.$refs["addOrUpdateProjectBaseForm"].validate(valid => {
        if (valid) {
          this.addOrUpdateProjectBaseForm.originFileNameListStr=this.getOriginFileNameListStr();
          this.addOrUpdateProjectBaseForm.curFilePathAndNameListStr=this.getCurFilePathAndNameListStr();

          if (this.addOrUpdateProjectBaseDialogTitle==='修改项目') {
            updateProjectBase(this.addOrUpdateProjectBaseForm).then(response => {
              curObj.$modal.msgSuccess("修改成功")
              curObj.addOrUpdateProjectBaseVisible = false
              curObj.$parent.fromEditProjectBaseDialog();
            })
          } else {
            insertProjectBase(this.addOrUpdateProjectBaseForm).then(response => {
              curObj.$modal.msgSuccess("新增成功")
              curObj.addOrUpdateProjectBaseVisible = false
              curObj.$parent.fromEditProjectBaseDialog();
            })
          }
        }
      })
    },

    cancelAddOrUpdateProjectBase(){
      this.addOrUpdateProjectBaseVisible=false;
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
      this.addOrUpdateProjectBaseForm.curFilePathAndNameList.push(returnUploadFile["fileName"])
      this.addOrUpdateProjectBaseForm.originFileNameList.push(returnUploadFile["originalFilename"])
    },

    //删除文件回调
    handleRemove(file,fileList){
      let curFilePathAndNameList=this.addOrUpdateProjectBaseForm.curFilePathAndNameList;
      let originFileNameList=this.addOrUpdateProjectBaseForm.originFileNameList;
      for(let i=originFileNameList.length-1;i>=0;i--){
        if(file.name==originFileNameList[i]){
          curFilePathAndNameList.splice(i,1);
          originFileNameList.splice(i,1);
          break;
        }
      }
      this.addOrUpdateProjectBaseForm.curFilePathAndNameList=curFilePathAndNameList;
      this.addOrUpdateProjectBaseForm.originFileNameList=originFileNameList;
    },

    getOriginFileNameListStr(){
      let returnStr="";
      let originFileNameList=this.addOrUpdateProjectBaseForm.originFileNameList;
      if(typeof originFileNameList!='undefined' && originFileNameList.length>0){
        for(let i=0;i<originFileNameList.length;i++){
          returnStr+=originFileNameList[i];
          if(i!=originFileNameList.length-1){
            returnStr+="*@*";
          }
        }
      }
      return returnStr;
    },

    getCurFilePathAndNameListStr(){
      let returnStr="";
      let curFilePathAndNameList=this.addOrUpdateProjectBaseForm.curFilePathAndNameList;
      if(typeof curFilePathAndNameList!='undefined' && curFilePathAndNameList.length>0){
        for(let i=0;i<curFilePathAndNameList.length;i++){
          returnStr+=curFilePathAndNameList[i];
          if(i!=curFilePathAndNameList.length-1){
            returnStr+="*@*";
          }
        }
      }
      return returnStr;
    },

    //从数据库中生成文件
    generateDefaultFileList(){
      let originFileNameListStr=this.addOrUpdateProjectBaseForm.originFileNameListStr;
      let curFilePathAndNameListStr=this.addOrUpdateProjectBaseForm.curFilePathAndNameListStr;
      if(typeof originFileNameListStr!='undefined' && originFileNameListStr!=null && originFileNameListStr!=''){
        this.addOrUpdateProjectBaseForm.originFileNameList=originFileNameListStr.split("*@*");
        this.addOrUpdateProjectBaseForm.curFilePathAndNameList=curFilePathAndNameListStr.split("*@*");
        let returnArr=[];
        if(this.addOrUpdateProjectBaseForm.originFileNameList.length>0){
          for(let i=0;i<this.addOrUpdateProjectBaseForm.originFileNameList.length;i++){
            let tempObj={
              name:this.addOrUpdateProjectBaseForm.originFileNameList[i],
              url:process.env.VUE_APP_BASE_API+this.addOrUpdateProjectBaseForm.curFilePathAndNameList[i]
            }
            returnArr.push(tempObj);
          }
        }
        this.addOrUpdateProjectBaseForm.fileList=returnArr;
      }else{
        this.addOrUpdateProjectBaseForm.fileList=[]
      }
    },

    handlePictureCardPreview(file){
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },

    selectAllTemplateList(){
      selectProjectLiuChengTuTemplateList({"pageNum":1,"pageSize":1000}).then(response => {
        this.allTemplateList = response.data
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
