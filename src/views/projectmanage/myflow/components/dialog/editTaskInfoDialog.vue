<template>
  <el-dialog
    title="编辑任务"
    :visible.sync="visible"
    width="1000px"
    append-to-body
  >
    <el-form :inline="true" class="demo-form-inline" label-width="120px" label-position="left">
      <el-row>
        <el-col :span="12">
          <el-form-item label="任务名称">
            <el-input v-model="taskName" placeholder="任务名称"></el-input>
          </el-form-item>

          <el-form-item label="目录">
            <el-input v-model="contentsNumStr" placeholder="目录序号，有小数点"></el-input>
          </el-form-item>

          <el-form-item label="任务开始时间">
            <el-date-picker
              v-model="startTime"
              type="date"
              placeholder="选择日期">
            </el-date-picker>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="任务状态">
            <el-select v-model="status">
              <el-option label="未开始" value="1" />
              <el-option label="进行中" value="2" />
              <el-option label="完成" value="3" />
              <el-option label="不再关注" value="4" />
              <el-option label="部分完成" value="5" />
            </el-select>
          </el-form-item>

          <el-form-item label="负责部门" >
            <el-select v-model="chargeDeptIdList" filterable multiple placeholder="请选择">
              <el-option
                v-for="item in projectCanEditProjectDeptList"
                :key="item.deptId"
                :label="item.deptName"
                :value="item.deptId">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="预计完成时间">
            <el-date-picker
              v-model="expectedEndTime"
              type="date"
              placeholder="选择日期">
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>

      <div>
        <el-form-item label="相关文件" style="margin-bottom: 10px !important;">
          <el-upload style="" :show-file-list="true"
                     :file-list="fileList"
                     :on-success="onSuccess" :on-error="onError" :on-remove="handleRemove" :on-preview="handlePreview"
                     :action="uploadUrl"
                     :data="baseDirObj"

                     :headers="headers" accept=".txt,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.pdf"
          >
               <el-button size="small" type="primary">导入</el-button>
          </el-upload>
        </el-form-item>
      </div>

      <div>
        <el-form-item label="备注">
          <el-input style="width: 600px" type="textarea" :rows="3" v-model="remark" placeholder="备注"></el-input>
        </el-form-item>
      </div>

    </el-form>
    <footer class="footer">
      <el-button type="primary" @click="submit">确定</el-button>
    </footer>
  </el-dialog>
</template>

<script>
  import { getToken } from "@/utils/auth"
  import {deleteAndInsertFunctionAndUploadFileRelation} from "@/api/common"
export default {
  name: "dialogMysql",

  props:["whereComeFrom"],

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
      visible: false,
      bool: true,
      node: {},
      label: "",
      taskName:"",//任务名称
      chargeDeptIdList:"",//负责人
      remark:"",//备注
      startTime:"",// 开始时间
      status:"1",//任务状态
      projectCanEditProjectDeptList:[],//项目能编辑的人员，
      contentsNumStr:"",//有小数点
      expectedEndTime:"",//预计结束时间
      //文件上传
      fileList:[],//文件上传后的
      originFileNameList:[],//每一个上传的文件对的原始名字
      curFilePathAndNameList:[],//每一个上传文件的相对路径
      uploadFileIdList:[],//上传的文件list
      defaultFileList:[],
    };
  },

  mounted() {

  },

  methods: {
    init(item) {
      //初始化数据
      this.node = item;
      this.label = item.item.data.label;
      this.taskName=item.item.data.taskName;
      this.chargeDeptIdList=item.item.data.chargeDeptIdList;
      this.remark=item.item.data.remark;
      this.startTime=item.item.data.startTime;
      this.expectedEndTime=item.item.data.expectedEndTime;
      this.status=item.item.data.status;
      if(typeof this.status ==='undefined' || this.status==null){
        this.status="1";
      }
      this.projectCanEditProjectDeptList=item.projectCanEditProjectDeptList;
      this.contentsNumStr=item.item.data.contentsNumStr;
      //补充文件相关
      this.originFileNameListStr=item.item.data.originFileNameListStr;
      this.curFilePathAndNameListStr=item.item.data.curFilePathAndNameListStr;
      this.generateDefaultFileList();
    },

    submit() {
      if(typeof this.taskName =='undefined' || this.taskName==""){
        alert("请输入任务名")
        return;
      }
      if(typeof this.contentsNumStr =='undefined' || this.contentsNumStr==""){
        alert("请输入目录")
        return;
      }

      if("flow"==this.whereComeFrom){
        var node = this.$parent.getNodeById(this.node.item.id);
        //这个是数组，不能机械的用 Object.assign了
        this.node.item.data.chargeDeptIdList=[];
        node.setData(
          Object.assign({}, this.node.item.data,
            {
              label: this.label,
              taskName:this.taskName,
              chargeDeptIdList:this.chargeDeptIdList,
              remark:this.remark,
              startTime:this.startTime,
              expectedEndTime:this.expectedEndTime,
              status:this.status,
              contentsNumStr:this.contentsNumStr,
              originFileNameListStr:this.getOriginFileNameListStr(),
              curFilePathAndNameListStr:this.getCurFilePathAndNameListStr(),
            })
        );
      }
      if("projectDetail"==this.whereComeFrom){
        this.node.item.data.chargeDeptIdList=[];
        this.node.item.data=
          Object.assign({}, this.node.item.data,
            {
              label: this.label,
              taskName:this.taskName,
              chargeDeptIdList:this.chargeDeptIdList,
              remark:this.remark,
              startTime:this.startTime,
              expectedEndTime:this.expectedEndTime,
              status:this.status,
              contentsNumStr:this.contentsNumStr,
              originFileNameListStr:this.getOriginFileNameListStr(),
              curFilePathAndNameListStr:this.getCurFilePathAndNameListStr(),
            });
        this.$parent.saveFromEditTaskInfoDialog(this.node)
      }
      console.log("fileList:"+this.fileList)
      this.visible = false;
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
      this.curFilePathAndNameList.push(returnUploadFile["fileName"])
      this.originFileNameList.push(returnUploadFile["originalFilename"])
    },

    //删除文件回调
    handleRemove(file,fileList){
      let curFilePathAndNameList=this.curFilePathAndNameList;
      let originFileNameList=this.originFileNameList;
      for(let i=originFileNameList.length-1;i>=0;i--){
        if(file.name==originFileNameList[i]){
          curFilePathAndNameList.splice(i,1);
          originFileNameList.splice(i,1);
          break;
        }
      }
      this.curFilePathAndNameList=curFilePathAndNameList;
      this.originFileNameList=originFileNameList;
    },

    getOriginFileNameListStr(){
      let returnStr="";
      let originFileNameList=this.originFileNameList;
      console.log("originFileNameList"+originFileNameList)
      if(typeof originFileNameList!='undefined' && originFileNameList.length>0){
        for(let i=0;i<originFileNameList.length;i++){
          returnStr+=originFileNameList[i];
          if(i!=originFileNameList.length-1){
            returnStr+="*@*";
          }
        }
      }
      console.log(returnStr)
      return returnStr;
    },

    getCurFilePathAndNameListStr(){
      let returnStr="";
      let curFilePathAndNameList=this.curFilePathAndNameList;
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
      let originFileNameListStr=this.originFileNameListStr;
      let curFilePathAndNameListStr=this.curFilePathAndNameListStr;
      if(typeof originFileNameListStr!='undefined' && originFileNameListStr!=null && originFileNameListStr!=''){
        this.originFileNameList=originFileNameListStr.split("*@*");
        this.curFilePathAndNameList=curFilePathAndNameListStr.split("*@*");
        let returnArr=[];
        if(this.originFileNameList.length>0){
          for(let i=0;i<this.originFileNameList.length;i++){
            let tempObj={
              name:this.originFileNameList[i],
              url:process.env.VUE_APP_BASE_API+this.curFilePathAndNameList[i]
            }
            returnArr.push(tempObj);
          }
        }
        this.fileList=returnArr;
      }else{
        this.fileList=[]
      }
    },

    handlePreview(file){
      window.open(file.url, '_blank');
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
