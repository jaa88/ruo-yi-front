<template>
  <div class="app-container home">
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
      </el-form-item>
    </el-form>

    <div>
      <el-row :gutter="20">
        <el-col
          v-for="(item, index) in tableData"
          :key="index"
          :span="6"
          style="margin-bottom:20px"
        >
          <el-card shadow="hover">
            <div slot="header" class="clearfix">
              <a style="font-weight: bold" @click="openProjectDetailPage(item)">{{item.projectName}}</a>
            </div>

            <div>
              <div>
                <el-progress :text-inside="true" :stroke-width="26" :percentage="item.percentage"></el-progress>
              </div>

              <div>
                <span>建设性质：</span>
                <span>{{item.jianSheXingZhi?item.jianSheXingZhi:'--'}}</span>
              </div>

              <div>
                <span>共</span>
                <span style="color: #409EFF">{{item.allPayAttentionNodeCount}}</span>
                <span>个阶段，已完成</span>
                <span style="color: #409EFF">{{item.allDoneNodeCount}}</span>
                <span>个阶段,进行中</span>
                <span style="color: #F56C6C">{{item.allDoingNodeCount}}</span>
                <span>个阶段</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

    </div>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :page-sizes="[16, 24,36]"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import {queryProjectLiuChengTuNodeByParam} from "@/api/project/project";
  import Cookies from 'js-cookie'
  import {getToken} from "../utils/auth";
  import {formatTimeByPattern} from '@/utils'
  import { selectProjectBaseList,selectProjectLiuChengTuTemplateList, selectProjectLiuChengTuDataLogList,insertLiuChengTuDataLog,insertProjectBase,updateProjectBase,deleteProjectBase } from "@/api/project/project"

export default {
  name: "Index",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 查询参数
      tableData:[],
      queryParams: {
        pageNum: 1,
        pageSize: 16,
        projectName:"",
        jianSheXingZhi:"",
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

  mounted(){
    this.getList();
  },

  methods: {
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
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
          let allDoingNodeCount=0;
          if(row.cellsJsonStr!=null && row.cellsJsonStr.length>10){
            JSON.parse(row.cellsJsonStr).forEach(item => {
              //1 未开始 2 进行中 3 完成 4 不再关注 5 部分完成
              if (item.shape == 'dag-commonTaskNode' && item.data?.status != 4) {
                allPayAttentionNodeCount+=1;
                if(item.data?.status == 3){
                  allDoneNodeCount+=1;
                }
                if(item.data?.status ==2){
                  allDoingNodeCount+=1;
                }
              }
            });
            tableData[i]["allPayAttentionNodeCount"]=allPayAttentionNodeCount;
            tableData[i]["allDoneNodeCount"]=allDoneNodeCount;
            tableData[i]["allDoingNodeCount"]=allDoingNodeCount;
            tableData[i]["percentage"]=allPayAttentionNodeCount!==0?Math.floor((allDoneNodeCount / allPayAttentionNodeCount) * 100):0;
          }else{
            tableData[i]["allPayAttentionNodeCount"]=0;
            tableData[i]["allDoneNodeCount"]=0;          }
        }
        this.tableData = response.data;
        this.total = response.total
        this.loading = false
      })
    },

    openProjectDetailPage(row){
      this.$tab.openPage(row.projectName, '/projectmanage/projectdetail/index/' +row.id, row)
    },
  }
}
</script>

<style scoped lang="scss">


</style>

