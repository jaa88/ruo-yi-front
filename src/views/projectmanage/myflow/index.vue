<template>
  <div id="coverCot" style="width: 100%;height: 830px;overflow: hidden">
    <section class="section-cot" style="width: 100%; height: 100%">
      <div id="container" @click.stop="hideFn">
        <MenuBar
          v-if="showContextMenu"
          ref="menuBar"
          @callBack="contextMenuFn"
        />
        <header>
          <el-tooltip
            class="item"
            effect="dark"
            content="放大"
            placement="bottom"
          >
            <i class="el-icon-zoom-in" @click="zoomFn(0.2)" />
          </el-tooltip>

          <el-tooltip
            class="item"
            effect="dark"
            content="缩小"
            placement="bottom"
          >
            <i class="el-icon-zoom-out" @click="zoomFn(-0.2)" />
          </el-tooltip>

          <el-tooltip
            class="item"
            effect="dark"
            content="适应屏幕"
            placement="bottom"
          >
            <i class="el-icon-full-screen" @click="centerFn" />
          </el-tooltip>

          <el-tooltip
            class="item"
            effect="dark"
            content="保存"
            placement="bottom"
          >
            <i class="el-icon-upload" @click="saveFn()" />
          </el-tooltip>

          <el-tooltip
            class="item"
            effect="dark"
            content="关闭页面"
            placement="bottom"
          >
            <i class="el-icon-close" @click="closeMyflowDialog()" />
          </el-tooltip>
        </header>
        <div id="draw-cot" />
      </div>
    </section>
    <EditTaskInfoDialog ref="editTaskInfoDialog"></EditTaskInfoDialog>
  </div>
</template>

<script>
import { Graph, Path } from "@antv/x6";
import "@antv/x6-vue-shape";

import commonTaskNode from "./components/nodeTheme/commonTaskNode.vue";
import MenuBar from "./components/menuBar";
import EditTaskInfoDialog from "./components/dialog/editTaskInfoDialog.vue";

export default {
  name: "myflow",
  components: { MenuBar,EditTaskInfoDialog },
  props:{
    parentCellsJsonStr:String,
    projectCanEditProjectUserList:Array,
  },
  data() {
    return {
      graph: "",
      isLock: false,
      showContextMenu: false,
    };
  },
  mounted() {
    // 初始化 graph
    this.initGraph();
    // 按钮绑定
    this.keyBindFn();
    // 执行
    this.startFn();
  },
  methods: {
    getNodeById(id) {
      return this.graph.getCellById(id);
    },
    hideFn() {
      this.showContextMenu = false;
    },
    initGraph() {
      // 注册节点
      Graph.registerNode(
        "dag-commonTaskNode",
        {
          inherit: "vue-shape",
          width: 180,
          height: 36,
          component: {
            template: `<common-task-node />`,
            components: {
              commonTaskNode,
            },
          },
          ports: {
            groups: {
              top: {
                position: "top",
                attrs: {
                  circle: {
                    r: 4,
                    magnet: true,
                    stroke: "#C2C8D5",
                    strokeWidth: 1,
                    fill: "#fff",
                  },
                },
              },
              bottom: {
                position: "bottom",
                attrs: {
                  circle: {
                    r: 4,
                    magnet: true,
                    stroke: "#C2C8D5",
                    strokeWidth: 1,
                    fill: "#fff",
                  },
                },
              },
            },
          },
        },
        true
      );

      Graph.registerEdge(
        "dag-edge",
        {
          inherit: "edge",
          attrs: {
            line: {
              stroke: "#C2C8D5",
              strokeWidth: 2,
              targetMarker: {
                name: "block",
                width: 12,
                height: 8,
              },
            },
          },
        },
        true
      );
      Graph.registerConnector(
        "algo-connector",
        (s, e) => {
          const offset = 4;
          const deltaY = Math.abs(e.y - s.y);
          const control = Math.floor((deltaY / 3) * 2);

          const v1 = { x: s.x, y: s.y + offset + control };
          const v2 = { x: e.x, y: e.y - offset - control };

          return Path.normalize(
            `M ${s.x} ${s.y}
           L ${s.x} ${s.y + offset}
           C ${v1.x} ${v1.y} ${v2.x} ${v2.y} ${e.x} ${e.y - offset}
           L ${e.x} ${e.y}
          `
          );
        },
        true
      );

      const graph = new Graph({
        grid: {
          size: 10,
          visible: true,
          type: "dot", // 'dot' | 'fixedDot' | 'mesh'
          args: {
            color: "#a05410", // 网格线/点颜色
            thickness: 1, // 网格线宽度/网格点大小
          },
        },
        background: {
          //color: "#fffbe6", // 设置画布背景颜色
        },
        container: document.getElementById("draw-cot"),
        panning: {
          enabled: true,
          eventTypes: ["leftMouseDown", "mouseWheel"],
        },
        mousewheel: {
          enabled: true,
          modifiers: "ctrl",
          factor: 1.1,
          maxScale: 1.5,
          minScale: 0.5,
        },
        highlighting: {
          magnetAdsorbed: {
            name: "stroke",
            args: {
              attrs: {
                fill: "#fff",
                stroke: "#31d0c6",
                strokeWidth: 4,
              },
            },
          },
        },
        connecting: {
          snap: true,
          allowBlank: false,
          allowLoop: false,
          highlight: true,
          connector: "algo-connector",
          connectionPoint: "anchor",
          anchor: "center",
          validateMagnet() {
            // return magnet.getAttribute('port-group') !== 'top'

            // 限制连线配置
            return true;
          },
          createEdge() {
            return graph.createEdge({
              shape: "dag-edge",
              attrs: {
                line: {
                  strokeDasharray: "5 5",
                  targetMarker: {
                    name: "block",
                    width: 12,
                    height: 8,
                  },
                },
              },
              zIndex: -1,
            });
          },
        },
        selecting: {
          enabled: true,
          multiple: true,
          rubberEdge: true,
          rubberNode: true,
          modifiers: "shift",
          rubberband: true,
        },
        keyboard: true,
        clipboard: true,
        history: true,
      });
      this.graph = graph;

      graph.on("edge:contextmenu", ({ e, x, y, edge, view }) => {
        console.log(x, y, view);
        this.showContextMenu = true;
        this.$nextTick(() => {
          this.$refs.menuBar.initFn(e.offsetX, e.offsetY, {
            type: "edge",
            item: edge,
          });
        });
      });

      //这儿是鼠标右键后的事件
      graph.on("node:contextmenu", ({ e, x, y, node, view }) => {
        console.log(e, x, y, view);
        this.showContextMenu = true;

        this.$nextTick(() => {
          // this.$refs.menuBar.setItem({ type: 'node', item: node })
          const p = graph.localToPage(x, y);
          this.$refs.menuBar.initFn(p.x, p.y, { type: "node", item: node });
        });
      });

      //画布空白地方，鼠标右键单击事件
      graph.on("blank:contextmenu", ({ e, x, y, node, view }) => {
        console.log(e, x, y, view);
        this.showContextMenu = true;
        x=x-200;
        y=y-100;

        this.$nextTick(() => {
          // this.$refs.menuBar.setItem({ type: 'node', item: node })
          const p = graph.localToPage(x, y);
          console.log("x:"+x+"  p.x:"+p.x);
          console.log("y:"+y+"  p.y:"+p.y)
          this.$refs.menuBar.initFn(p.x, p.y, { type: "blank", item: node });
        });
      });

      //鼠标双击事件 todo
      graph.on("node:dblclick", ({ e, x, y, node, view }) => {
        this.$refs.editTaskInfoDialog.visible=true;
        this.$refs.editTaskInfoDialog.init({ type: "node", item: node,"projectCanEditProjectUserList":this.projectCanEditProjectUserList });
      });

      //连线后的事件
      graph.on("edge:connected", ({ edge }) => {
        const source = graph.getCellById(edge.source.cell);
        const target = graph.getCellById(edge.target.cell);
        edge.attr({
          line: {
            strokeDasharray: "",
          },
        });
      });

      graph.on("node:change:data", ({ node }) => {
        const edges = graph.getIncomingEdges(node);
        const { status } = node.getData();
        edges?.forEach((edge) => {
          if (status === "running") {
            edge.attr("line/strokeDasharray", 5);
            edge.attr(
              "line/style/animation",
              "running-line 30s infinite linear"
            );
          } else {
            edge.attr("line/strokeDasharray", "");
            edge.attr("line/style/animation", "");
          }
        });
      });
    },

    // 初始化节点/边
    init(data = []) {
      const cells = [];
      data.forEach((item) => {
        if (item.shape === "dag-edge") {
          cells.push(this.graph.createEdge(item));
        } else {
          delete item.component;
          cells.push(this.graph.createNode(item));
        }
      });
      this.graph.resetCells(cells);
    },

    zoomFn(num) {
      this.graph.zoom(num);
    },

    centerFn() {
      const num = 1 - this.graph.zoom();
      num > 1 ? this.graph.zoom(num * -1) : this.graph.zoom(num);
      this.graph.centerContent();
    },

    startFn(item) {
      this.init(item || JSON.parse(this.parentCellsJsonStr));
      this.graph.centerContent();
    },

    createMenuFn() {},

    keyBindFn() {
      // copy cut paste
      this.graph.bindKey(["meta+c", "ctrl+c"], () => {
        const cells = this.graph.getSelectedCells();
        if (cells.length) {
          this.graph.copy(cells);
        }
        return false;
      });
      this.graph.bindKey(["meta+x", "ctrl+x"], () => {
        const cells = this.graph.getSelectedCells();
        if (cells.length) {
          this.graph.cut(cells);
        }
        return false;
      });
      this.graph.bindKey(["meta+v", "ctrl+v"], () => {
        if (!this.graph.isClipboardEmpty()) {
          const cells = this.graph.paste({ offset: 32 });
          this.graph.cleanSelection();
          this.graph.select(cells);
        }
        return false;
      });

      // undo redo
      this.graph.bindKey(["meta+z", "ctrl+z"], () => {
        if (this.graph.history.canUndo()) {
          this.graph.history.undo();
        }
        return false;
      });
      // delete
      this.graph.bindKey(["delete"], () => {
        const select = this.graph.getSelectedCells();
        select?.forEach((item) => {
          if (/edge/.test(item.shape)) {
            this.graph.removeEdge(item.id);
          } else {
            this.graph.removeNode(item.id);
          }
        });
        return false;
      });
    },
    saveFn() {
      let curObj=this;
      curObj.$modal.confirm('是否确认保存数据？').then(function() {
        localStorage.setItem(
          "x6Json",
          JSON.stringify(curObj.graph.toJSON({ diff: true }))
        );
        curObj.$emit("saveFromMyflow",curObj.graph.toJSON({ diff: true }))
      })
    },

    closeMyflowDialog() {
      let curObj=this;
      curObj.$modal.confirm('是否确认关闭流程图？').then(function() {
        curObj.$emit("closeMyflowDialog",{})
      });
    },

    //这是右键菜单的回调函数
    contextMenuFn(type, node,value,x,y) {
      switch (type) {
        case "remove":
          if (node.type == "edge") {
            this.graph.removeEdge(node.item.id);
          } else if (node.type == "node") {
            this.graph.removeNode(node.item.id);
          }
          break;
        case "source":
          this.$refs.dialogMysql.visible = true;
          this.$refs.dialogMysql.init(node);
          break;
        case "editTask":
          this.$refs.editTaskInfoDialog.visible=true;
          this.$refs.editTaskInfoDialog.init(node);
          break;
        case "addGraphTaskNode":
          this.addGraphTaskNode(value,x,y)
          break
      }

      this.showContextMenu = false;
    },

    showDrawerFn() {
      this.$refs.drawer.visible = !this.$refs.drawer.visible;
    },
    addNode(option) {
      const p = this.graph.pageToLocal(option.x, option.y);
      console.log(JSON.stringify(option))
      this.graph.addNode(Object.assign({}, option, p));
    },

    addGraphTaskNode(value,x,y){
      const time = new Date().getTime();
      const p = this.graph.pageToLocal(parseInt(x), parseInt(y));

      let commonTaskNodeProperty={
        "x":901,"y":297,"width":180,"height":40,"shape":"dag-commonTaskNode",
        "data": {},
        "ports":
          {"groups":
              {
                "top":{"position":"top","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#C2C8D5","strokeWidth":1,"fill":"#fff"}}},
                "bottom":{"position":"bottom","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#C2C8D5","strokeWidth":1,"fill":"#fff"}}}},
            "items":[{"id":"in-"+time,"group":"top"},{"id":"out-"+time,"group":"bottom"}]
          }}
      this.graph.addNode(Object.assign({}, commonTaskNodeProperty, p));
    }

  },
};
</script>

<style lang="sass" scoped>
  header
    display: flex
    justify-content: flex-end
    width: 100%
    height: 50px
    box-sizing: border-box

    i
      margin: 8px
      font-size: 30px

  .x6-node-selected
    .node
      border-color: #1890ff
      border-radius: 2px
      box-shadow: 0 0 0 4px #d4e8fe

      &.success
        border-color: #52c41a
        box-shadow: 0 0 0 4px #ccecc0

      &.failed
        border-color: #ff4d4f
        box-shadow: 0 0 0 4px #fedcdc

  .x6-edge
    &:hover path:nth-child(2)
      stroke: #1890ff
      stroke-width: 1px

    &-selected path:nth-child(2)
      stroke: #1890ff
      stroke-width: 1.5px !important

  .section-cot
    display: flex

    #container
      position: relative
      flex: 1

      #draw-cot
        width: 100%
        height: 100%

  ::-webkit-scrollbar
    width: 0

</style>
