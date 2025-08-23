<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb v-if="!topNav" id="breadcrumb-container" class="breadcrumb-container" />
    <top-nav v-if="topNav" id="topmenu-container" class="topmenu-container" />

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <el-tooltip v-if="noticeCount>0" effect="dark" placement="bottom">
          <div slot="content">
            <div>
              <div>
                <span>部门{{noticeCount}}条进行中任务</span>
              </div>
            </div>

          </div>

          <el-badge :value="noticeCount" class="right-menu-item hover-effect" :class="{'badge-custom':noticeCount>0}" >
            <i class="el-icon-message-solid" @click="toNoticePage"></i>
          </el-badge>
        </el-tooltip>
      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="hover">
        <div class="avatar-wrapper">
          <img :src="avatar" class="user-avatar">
          <span class="user-nickname"> {{ nickName }} </span>
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/user/profile">
            <el-dropdown-item>个人中心</el-dropdown-item>
          </router-link>
          <el-dropdown-item divided @click.native="logout">
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <div class="right-menu-item hover-effect setting" @click="setLayout" v-if="setting">
        <svg-icon icon-class="more-up" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'
import RuoYiGit from '@/components/RuoYi/Git'
import RuoYiDoc from '@/components/RuoYi/Doc'
import { listNotice } from "@/api/system/notice";
import {queryProjectLiuChengTuNodeByParam} from "@/api/project/project";
import Cookies from 'js-cookie'
import {getToken} from "../../utils/auth";
import {formatTimeByPattern} from '@/utils'

export default {
  emits: ['setLayout'],
  components: {
    Breadcrumb,
    TopNav,
    Hamburger,
    Screenfull,
    SizeSelect,
    Search,
    RuoYiGit,
    RuoYiDoc
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'device',
      'nickName',
      'deptId'
    ]),
    setting: {
      get() {
        return this.$store.state.settings.showSettings
      }
    },
    topNav: {
      get() {
        return this.$store.state.settings.topNav
      }
    }
  },


  created(){
    this.poll();
  },
  mounted() {
    // 启动轮询
    //this.startPolling();
  },
  beforeDestroy() {
    // 在组件销毁之前清除定时器，防止内存泄漏
    //this.stopPolling();
  },

  data(){
    return{
      noticeContent:'',//通知内容
      noticeCount:0,//通知数量
      intervalId: null,
      doingProjectLiuChengTuNodeList:[],
    }
  },

  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    setLayout(event) {
      this.$emit('setLayout')
    },
    logout() {
      this.$confirm('确定注销并退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('LogOut').then(() => {
          location.href = process.env.NODE_ENV === "production" ?'/jiaoyun':'/index'
        })
      }).catch(() => {})
    },


    toNoticePage(){
      //前往通知公告管理页面
      let curDay=formatTimeByPattern(new Date(),'yyyy-MM-dd');
      Cookies.set("LastNoticeDay",curDay);
      this.doingProjectLiuChengTuNodeList=[];
      this.noticeCount=0;
      this.$router.push("/projectManage/tasklist");
    },
    startPolling() {
      // 每隔一定时间执行轮询任务
      this.intervalId = setInterval(() => {
        this.poll();
      }, 5000); // 5秒钟轮询一次，根据需要调整间隔时间
    },
    stopPolling() {
      // 清除定时器，停止轮询任务    ！！！！重要，防止内存泄露
      clearInterval(this.intervalId);
    },
    poll() {
      let curObj=this;
      setTimeout(()=>{
        //获取自己deptId 正在进行中的任务
        let param={
          "pageNum":1,
          "pageSize":1000,
          "chargeDeptId":this.deptId,
          "status":1
        }
        queryProjectLiuChengTuNodeByParam(param).then(response =>{
          //如果上次提醒时的token与现在的token不同，则需要重新提醒
          let curDay=formatTimeByPattern(new Date(),'yyyy-MM-dd');
          let lastNoticeDay=Cookies.get("LastNoticeDay");
          if(typeof lastNoticeDay=='undefined' || lastNoticeDay==null || curDay!=lastNoticeDay){
            curObj.doingProjectLiuChengTuNodeList=response.data;
            curObj.noticeCount=curObj.doingProjectLiuChengTuNodeList.length;
          }else{
            console.log("今天已经提醒过了，不再提醒")
          }
        })
      },2000)
    }
  }

}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 0px;
      padding-right: 0px;

      .avatar-wrapper {
        margin-top: 10px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 30px;
          height: 30px;
          border-radius: 50%;
        }

        .user-nickname{
          position: relative;
          bottom: 10px;
          font-size: 14px;
          font-weight: bold;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }

    ::v-deep .el-badge__content {
      margin-top: 9px;/* 调整一下上下左右你喜欢的位置 */
      margin-right: 7px;
    }

    .badge-custom {
      animation: blink-animation 0.5s infinite alternate; /* 设置闪烁动画 */
    }

    @keyframes blink-animation {
      0% { opacity: 1; } /* 定义动画起始状态 */
      100% { opacity: 0.1; } /* 定义动画结束状态 */
    }
  }
}
</style>

