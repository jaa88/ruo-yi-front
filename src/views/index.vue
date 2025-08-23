<template>
  <div class="app-container home">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="update-log">
          <div slot="header" class="clearfix">
            <span>节点预警（已过期）</span>
          </div>
          <div>
            <div v-if="nodeList.length === 0">暂无预警节点</div>

            <el-table v-else :data="nodeList"  class="custom-class" stripe>
              <el-table-column  label="序号" min-width="60px" align="center">
                <template slot-scope="scope"> {{scope.$index+1}} </template>
              </el-table-column>

              <el-table-column  label="项目名称" align="center" min-width="120px" :show-overflow-tooltip="true">
                <template slot-scope="scope">
                  <span>{{scope.row.projectName}}</span>
                </template>
              </el-table-column>

              <el-table-column  label="预期结束时间" align="center" min-width="120px" :show-overflow-tooltip="true">
                <template slot-scope="scope">
                  <span>{{parseTime(scope.row.expectedEndTime, '{y}-{m}-{d}')}}</span>
                </template>
              </el-table-column>

              <el-table-column  label="任务名称" align="center" min-width="120px" :show-overflow-tooltip="true">
                <template slot-scope="scope">
                  <span>{{ scope.row.taskName }}</span>
                </template>
              </el-table-column>
            </el-table>

          </div>

        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="update-log">
          <div slot="header" class="clearfix">
            <span>跟进动态</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import {queryProjectLiuChengTuNodeByParam} from "@/api/project/project";
  import Cookies from 'js-cookie'
  import {getToken} from "../utils/auth";
  import {formatTimeByPattern} from '@/utils'

export default {
  name: "Index",
  data() {
    return {
      nodeList:[],
    }
  },

  computed: {
    ...mapGetters([
      'roles',
      'deptId'
    ]),
  },

  created(){
    this.queryProjectLiuChengTuNodeByParam();
  },

  methods: {
    queryProjectLiuChengTuNodeByParam() {
      let curObj=this;
      //获取自己deptId 正在进行中的任务
      let param={
        "pageNum":1,
        "pageSize":1000,
        "chargeDeptId":this.deptId,
        "statusList":[1,2,5]
      }
      //判断是否是管理员 ,如果是管理员则查询所有的
      if(this.roles!=null && this.roles.length){
        for(let i=0;i<this.roles.length;i++){
          if(this.roles[i]=='admin'){
            param.chargeDeptId="";
          }
        }
      }
      queryProjectLiuChengTuNodeByParam(param).then(response =>{
        let nodeList=response.data;
        nodeList.sort((a, b) => {
          return new Date(a.expectedEndTime) - new Date(b.expectedEndTime);
        });

        for(let i=nodeList.length-1;i>=0;i--){
          if(new Date(nodeList[i]["expectedEndTime"])-new Date()>0 || nodeList[i]["expectedEndTime"]==null || nodeList[i]["expectedEndTime"]==0){
            nodeList.splice(i,1);
          }
        }
        curObj.nodeList=nodeList;
      })
    }
  }
}
</script>

<style scoped lang="scss">


</style>

