<template>
  <div style="padding-top: 20px">
    <el-dialog
      title="编辑任务"
      :visible.sync="visible"
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
      visible:false,
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

  },

  methods: {
    init(row) {
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
    },

    /** 提交按钮 */
    submitForm: function() {
      let curObj=this;
      curObj.$refs["addOrUpdateProjectBaseForm"].validate(valid => {
        if (valid) {
          if (this.addOrUpdateProjectBaseForm.id != undefined) {
            updateProjectBase(this.addOrUpdateProjectBaseForm).then(response => {
              curObj.$modal.msgSuccess("修改成功")
              curObj.addOrUpdateProjectBaseVisible = false
              curObj.getList()
            })
          } else {
            insertProjectBase(this.addOrUpdateProjectBaseForm).then(response => {
              curObj.$modal.msgSuccess("新增成功")
              curObj.addOrUpdateProjectBaseVisible = false
              curObj.getList()
            })
          }
          curObj.$parent.fromEditProjectBaseDialog();
        }
      })
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

    cancelAddOrUpdateProjectBase(){
      this.visible=false;
    },

    handlePictureCardPreview(file){
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
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
