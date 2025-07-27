<template>
  <div class="app-container">
    这儿是项目的详情页
  </div>
</template>

<script>
  import Myflow from "../myflow/index";
  import {selectAllUserList} from  "@/api/system/user"
  import { selectProjectBaseList } from "@/api/project/project"

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
    }
  },
  created() {
    const id = this.$route.params.id;
    this.queryParams.projectBaseId=id;
  },

  mounted(){
    this.selectProjectBaseList();
  },
  methods: {
    selectProjectBaseList(){
      selectProjectBaseList(this.queryParams).then(response=>{
        alert(JSON.stringify(response.data))
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">

</style>


