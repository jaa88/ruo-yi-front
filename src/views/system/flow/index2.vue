<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="super-flow-base-demo">
    <super-flow
      ref="superFlow"
      :node-list="nodeList"
      :link-list="linkList"
      :origin="origin"
      :graph-menu="graphMenuList"
      :node-menu="nodeMenuList"
      :link-menu="linkMenuList"
      :enter-intercept="enterIntercept"
      :output-intercept="outputIntercept"
      :link-desc="linkDesc">
      <template v-slot:node="{meta}">
        <div :class="`flow-node flow-node-${meta.prop}`">
         <!-- <header class="ellipsis">
            {{ meta.name }}
          </header>-->
   <!--       <section>
            {{ meta.desc }}
          </section>-->


          <el-popover v-if="meta.desc !=null && meta.desc !=''"
            placement="top-start"
            title="标题"
            width="200"
            trigger="hover"
            :content="meta.desc">
            <span slot="reference">查看详情</span>
          </el-popover>


        </div>
      </template>
    </super-flow>

    <el-dialog
      :title="drawerConf.title"
      :visible.sync="drawerConf.visible"
      :close-on-click-modal="false"
      width="500px">
      <el-form
        @keyup.native.enter="settingSubmit"
        @submit.native.prevent
        v-show="drawerConf.type === drawerType.node"
        ref="nodeSetting"
        :model="nodeSetting">
        <el-form-item
          label="节点名称"
          prop="name">
          <el-input
            v-model="nodeSetting.name"
            placeholder="请输入节点名称"
            maxlength="30">
          </el-input>
        </el-form-item>
        <el-form-item
          label="节点描述"
          prop="desc">
          <el-input
            v-model="nodeSetting.desc"
            placeholder="请输入节点描述"
            maxlength="30">
          </el-input>
        </el-form-item>
      </el-form>
      <el-form
        @keyup.native.enter="settingSubmit"
        @submit.native.prevent
        v-show="drawerConf.type === drawerType.link"
        ref="linkSetting"
        :model="linkSetting">
        <el-form-item
          label="连线描述"
          prop="desc">
          <el-input
            v-model="linkSetting.desc"
            placeholder="请输入连线描述">
          </el-input>
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer">
        <el-button
          @click="drawerConf.cancel">
          取 消
        </el-button>
        <el-button
          type="primary"
          @click="settingSubmit">
          确 定
        </el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>

  const drawerType = {
    node: 0,
    link: 1
  }

  export default {
    data () {
      return {
        drawerType,
        drawerConf: {
          title: '',
          visible: false,
          type: null,
          info: null,
          open: (type, info) => {
            const conf = this.drawerConf
            conf.visible = true
            conf.type = type
            conf.info = info
            if (conf.type === drawerType.node) {
              conf.title = '节点'
              if (this.$refs.nodeSetting) this.$refs.nodeSetting.resetFields()
              this.$set(this.nodeSetting, 'name', info.meta.name)
              this.$set(this.nodeSetting, 'desc', info.meta.desc)
            } else {
              conf.title = '连线'
              if (this.$refs.linkSetting) this.$refs.linkSetting.resetFields()
              this.$set(this.linkSetting, 'desc', info.meta ? info.meta.desc : '')
            }
          },
          cancel: () => {
            this.drawerConf.visible = false
            if (this.drawerConf.type === drawerType.node) {
              this.$refs.nodeSetting.clearValidate()
            } else {
              this.$refs.linkSetting.clearValidate()
            }
          }
        },
        linkSetting: {
          desc: ''
        },
        nodeSetting: {
          name: '',
          desc: ''
        },

        origin: [2000, 2000],
        nodeList: [],
        linkList: [],

        graphMenuList: [
          [
            {
              label: '开始节点',
              disable (graph) {
                return !!graph.nodeList.find(node => node.meta.prop === 'start')
              },
              selected: (graph, coordinate) => {
                const start = graph.nodeList.find(node => node.meta.prop === 'start')
                if (!start) {
                  graph.addNode({
                    width: 100,
                    height: 80,
                    coordinate: coordinate,
                    meta: {
                      prop: 'start',
                      name: '开始节点'
                    }
                  })
                }
              }
            },
            {
              label: '条件节点',
              disable: false,
              selected: (graph, coordinate) => {
                graph.addNode({
                  width: 160,
                  height: 80,
                  coordinate: coordinate,
                  meta: {
                    prop: 'condition',
                    name: '条件节点'
                  }
                })
              }
            },
            {
              label: '审批节点',
              disable: false,
              selected: (graph, coordinate) => {
                graph.addNode({
                  width: 160,
                  height: 80,
                  coordinate: coordinate,
                  meta: {
                    prop: 'approval',
                    name: '审批节点'
                  }
                })
              }
            },
            {
              label: '抄送节点',
              disable: false,
              selected: (graph, coordinate) => {
                graph.addNode({
                  width: 160,
                  height: 80,
                  coordinate: coordinate,
                  meta: {
                    prop: 'cc',
                    name: '抄送节点'
                  }
                })
              }
            },
            {
              label: '结束节点',
              disable (graph) {
                return !!graph.nodeList.find(point => point.meta.prop === 'end')
              },
              selected: (graph, coordinate) => {
                graph.addNode({
                  width: 80,
                  height: 50,
                  coordinate: coordinate,
                  meta: {
                    prop: 'end',
                    name: '结束节点'
                  }
                })
              }
            }
          ],
          [
            {
              label: '打印数据',
              selected: (graph, coordinate) => {
                console.log(JSON.stringify(graph.toJSON(), null, 2))
              }
            },
            {
              label: '全选',
              selected: (graph, coordinate) => {
                graph.selectAll()
              }
            }
          ]
        ],
        nodeMenuList: [
          [
            {
              label: '删除',
              disable: false,
              hidden (node) {
                return node.meta.prop === 'start'
              },
              selected (node, coordinate) {
                node.remove()
              }
            }
          ],
          [
            {
              label: '编辑',
              selected: (node, coordinate) => {
                this.drawerConf.open(drawerType.node, node)
              }
            }
          ]
        ],
        linkMenuList: [
          [
            {
              label: '删除',
              disable: false,
              selected: (link, coordinate) => {
                link.remove()
              }
            }
          ],
          [
            {
              label: '编辑',
              disable: false,
              selected: (link, coordinate) => {
                this.drawerConf.open(drawerType.link, link)
              }
            }
          ]
        ]
      }
    },
    created () {
      const nodeList = [
        {
          "id": "nodeS3WgFnzCI15X58Qw",
          "width": 100,
          "height": 80,
          "coordinate": [
            -844,
            -148
          ],
          "meta": {
            "prop": "start",
            "name": "开始节点",
            "desc": "项目启动，这是必要的好贵好贵好回购啊更换"
          }
        },
        {
          "id": "nodefHsy9uJObPtdHZv1",
          "width": 160,
          "height": 80,
          "coordinate": [
            -200,
            -148
          ],
          "meta": {
            "prop": "approval",
            "name": "审批节点",
            "desc": "111111"
          }
        },

        {
          "id": "nodeni9QOqT3mI7hsMau",
          "width": 160,
          "height": 80,
          "coordinate": [
            -442,
            -275
          ],
          "meta": {
            "prop": "condition",
            "name": "条件节点"
          }
        },
        {
          "id": "nodeZBK0ZPpgMe1exezE",
          "width": 160,
          "height": 80,
          "coordinate": [
            -200,
            -275
          ],
          "meta": {
            "prop": "approval",
            "name": "审批节点"
          }
        },
        {
          "id": "nodeqkK9zjcDz53xKRlK",
          "width": 160,
          "height": 80,
          "coordinate": [
            34,
            -209
          ],
          "meta": {
            "prop": "cc",
            "name": "抄送节点"
          }
        },
        {
          "id": "node0aiA9VuhjkiAdZCs",
          "width": 160,
          "height": 80,
          "coordinate": [
            -200,
            -2
          ],
          "meta": {
            "prop": "approval",
            "name": "审批节点"
          }
        },
        {
          "id": "nodeG3WeFnzCI15X58Qw",
          "width": 160,
          "height": 80,
          "coordinate": [
            -442,
            -2
          ],
          "meta": {
            "prop": "condition",
            "name": "条件节点"
          }
        },
        {
          "id": "node7WXbwOR6kSFD53Hf",
          "width": 160,
          "height": 80,
          "coordinate": [
            -442,
            -148
          ],
          "meta": {
            "prop": "condition",
            "name": "条件节点"
          }
        },
        {
          "id": "nodeDhVU6w2KbEnJCjZs",
          "width": 80,
          "height": 50,
          "coordinate": [
            -116,
            339
          ],
          "meta": {
            "prop": "end",
            "name": "结束节点"
          }
        },
        {
          "id": "nodesyxisLH1hJDdPsxx",
          "width": 160,
          "height": 80,
          "coordinate": [
            -414,
            228
          ],
          "meta": {
            "prop": "cc",
            "name": "抄送节点"
          }
        }
      ]
      const linkList = [
        {
          "id": "linkFDGJmyXteCzryL1H",
          "startId": "nodeS3WgFnzCI15X58Qw",
          "endId": "nodeni9QOqT3mI7hsMau",
          "startAt": [
            100,
            40
          ],
          "endAt": [
            0,
            40
          ],
          "meta": null
        },
        {
          "id": "linkd0YbAyCa9fInFrlO",
          "startId": "nodefHsy9uJObPtdHZv1",
          "endId": "nodeqkK9zjcDz53xKRlK",
          "startAt": [
            160,
            40
          ],
          "endAt": [
            0,
            40
          ],
          "meta": null
        },
        {
          "id": "linkARaGQadhqr3zETCE",
          "startId": "node7WXbwOR6kSFD53Hf",
          "endId": "nodefHsy9uJObPtdHZv1",
          "startAt": [
            160,
            40
          ],
          "endAt": [
            0,
            40
          ],
          "meta": null
        },
        {
          "id": "linkKsYEpCgQH2anWTCr",
          "startId": "nodeS3WgFnzCI15X58Qw",
          "endId": "nodeG3WeFnzCI15X58Qw",
          "startAt": [
            100,
            40
          ],
          "endAt": [
            0,
            40
          ],
          "meta": null
        },
        {
          "id": "linkNAhWxDck6ahukhCU",
          "startId": "nodeZBK0ZPpgMe1exezE",
          "endId": "nodeqkK9zjcDz53xKRlK",
          "startAt": [
            160,
            40
          ],
          "endAt": [
            0,
            40
          ],
          "meta": null
        },
        {
          "id": "linkgbdcckNQ0MMtagkE",
          "startId": "nodeG3WeFnzCI15X58Qw",
          "endId": "node0aiA9VuhjkiAdZCs",
          "startAt": [
            160,
            40
          ],
          "endAt": [
            0,
            40
          ],
          "meta": null
        },
        {
          "id": "linkoVf8jP6TYdoDRrrT",
          "startId": "nodeS3WgFnzCI15X58Qw",
          "endId": "node7WXbwOR6kSFD53Hf",
          "startAt": [
            100,
            40
          ],
          "endAt": [
            0,
            40
          ],
          "meta": null
        },
        {
          "id": "link3xuHmsoUOuNo1qUj",
          "startId": "node0aiA9VuhjkiAdZCs",
          "endId": "nodesyxisLH1hJDdPsxx",
          "startAt": [
            160,
            40
          ],
          "endAt": [
            0,
            40
          ],
          "meta": null
        },
        {
          "id": "linkWPHgxcUj1XYGVnTp",
          "startId": "nodeni9QOqT3mI7hsMau",
          "endId": "nodeZBK0ZPpgMe1exezE",
          "startAt": [
            160,
            40
          ],
          "endAt": [
            0,
            40
          ],
          "meta": null
        }
      ]

      setTimeout(() => {
        this.nodeList = nodeList
        this.linkList = linkList
      }, 100)
    },
    mounted () {
      this.$nextTick(() => {
        this.$el.scrollBy({
          left: (this.$el.scrollWidth - this.$el.clientWidth) / 2,
          top: (this.$el.scrollHeight - this.$el.clientHeight) / 2
        })
      })
    },
    methods: {
      //从一个节点到另一个节点的限制
      enterIntercept (formNode, toNode, graph) {
        const formType = formNode.meta.prop
        switch (toNode.meta.prop) {
          case 'start':
            return false
          case 'approval':
            return [
              'start',
              'approval',
              'condition',
              'cc'
            ].includes(formType)
          case 'condition':
            return [
              'start',
              'approval',
              'condition',
              'cc'
            ].includes(formType)
          case 'end':
            return [
              'approval',
              'cc'
            ].includes(formType)
          default:
            return true
        }
      },
      outputIntercept (node, graph) {
        return !(node.meta.prop === 'end')
      },
      linkDesc (link) {
        return link.meta ? link.meta.desc : ''
      },
      settingSubmit () {
        const conf = this.drawerConf
        if (this.drawerConf.type === drawerType.node) {
          if (!conf.info.meta) conf.info.meta = {}
          Object.keys(this.nodeSetting).forEach(key => {
            this.$set(conf.info.meta, key, this.nodeSetting[key])
          })
          this.$refs.nodeSetting.resetFields()
        } else {
          if (!conf.info.meta) conf.info.meta = {}
          Object.keys(this.linkSetting).forEach(key => {
            this.$set(conf.info.meta, key, this.linkSetting[key])
          })
          this.$refs.linkSetting.resetFields()
        }
        conf.visible = false
      }
    }
  }
</script>

<style lang="sass">
  .ellipsis
    white-space: nowrap
    text-overflow: ellipsis
    overflow: hidden
    word-wrap: break-word

  .super-flow-base-demo
    width: 100%
    height: 800px
    margin: 0 auto
    background-color: #f5f5f5
    overflow: scroll

    .super-flow
      width: 4000px
      height: 4000px

    .super-flow__node
      .flow-node
        > header
          font-size: 14px
          height: 32px
          line-height: 32px
          padding: 0 12px
          color: #ffffff

        > section
          text-align: center
          line-height: 20px
          overflow: hidden
          padding: 6px 12px
          word-break: break-all

        &.flow-node-start
          > header
            background-color: #55abfc

        &.flow-node-condition
          > header
            background-color: #BC1D16

        &.flow-node-approval
          > header
            background-color: rgba(188, 181, 58, 0.76)

        &.flow-node-cc
          > header
            background-color: #30b95c

        &.flow-node-end
          > header
            height: 50px
            line-height: 50px
            background-color: rgb(0, 0, 0)
</style>
