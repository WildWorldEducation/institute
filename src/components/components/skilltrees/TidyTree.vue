<script>
// Import the stores.
import { useUserDetailsStore } from "../../../stores/UserDetailsStore";
import { useSkillTreeStore } from "../../../stores/SkillTreeStore";
import { useSkillTagsStore } from "../../../stores/SkillTagsStore";

// Nested component.
import SkillTreeFilter from "./../SkillTreeFilter.vue";
import SkillPanel from "./../SkillPanel.vue";

// Import Pixi JS.
import * as PIXI from "pixi.js";
// Import Pixi Viewprt.
import { Viewport } from "pixi-viewport";
// For pixi to use custom fonts.
import FontFaceObserver from "fontfaceobserver";

import * as d3 from "d3";

export default {
  setup() {
    const userDetailsStore = useUserDetailsStore();
    const skillTreeStore = useSkillTreeStore();
    const skillTagsStore = useSkillTagsStore();
    return {
      userDetailsStore,
      skillTreeStore,
      skillTagsStore,
    };
  },
  data() {
    return {
      stageContents: [],
      isSkillInfoPanelShown: false,
      regularLockedUnmasteredNodeSprite: null,
      // D3 radius, maybe delete?
      radius: 0,
      width: null,
      height: null,
      // D3 radius multiplier
      radiusMultiplier: 64,
      firstLevelNodeSize: 100,
      regularNodeSize: 50,
      subSkillRadius: 50,
      skill: {
        id: null,
        children: [],
        isMastered: null,
        isUnlocked: null,
        container: null,
        name: null,
        description: null,
        tagIDs: [],
        sprite: null,
      },
      isRecentered: false,
      svg: null,
    };
  },
  components: {
    SkillTreeFilter,
    SkillPanel,
  },
  async mounted() {
    // TODO: cleanup this file, there is unused code.

    // Get the data from the API.
    // if (this.skillTreeStore.userSkillsNoSubSkills.length == 0) {
    //     await this.skillTreeStore.getUserSkillsNoSubSkills()
    // }
    // Delete the record in the store and the API call for the abve? Not used now.

    if (this.skillTreeStore.userSkills.length == 0) {
      await this.skillTreeStore.getUserSkills();
    }

    // Specify the chart’s dimensions.
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.radius = Math.min(this.width, this.height) / 2;

    const centerNodeSprite = PIXI.Sprite.from("center-node.png");
    this.skill = {
      name: "SKILLS",
      sprite: centerNodeSprite,
      children: this.skillTreeStore.userSkills,
    };

    this.getAlgorithm();
  },
  methods: {
    getAlgorithm() {
      var skillsWithSubSkillsMoved = [];
      skillsWithSubSkillsMoved = JSON.parse(
        JSON.stringify(this.skill.children)
      );

      // Duplicate super skill node, and make second one a child of the first.
      // Put all the subskills of the node in the second version.
      // This is an attempt to show the subskills using only D3.
      // Other options, such as having them circle around the super skill,
      // like the D3 and Pixi version, were too complex.
      function moveSubSkills(parentChildren) {
        var i = parentChildren.length;
        while (i--) {
          // If the skill is a super skill, and not an "end" super skill.
          if (
            parentChildren[i].type == "super" &&
            parentChildren[i].position != "end"
          ) {
            // Separate the child nodes.
            var subSkills = [];
            var regularChildSkills = [];
            for (let j = 0; j < parentChildren[i].children.length; j++) {
              if (parentChildren[i].children[j].type == "sub") {
                subSkills.push(parentChildren[i].children[j]);
              } else {
                regularChildSkills.push(parentChildren[i].children[j]);
              }
            }

            // Create a new child node, with the subskills in it.
            var superSkillEndNode = {
              skill_name: parentChildren[i].skill_name,
              type: "super",
              position: "end",
              children: subSkills,
            };

            // Empty the child nodes.
            parentChildren[i].children = [];
            // Add the new node.
            parentChildren[i].children.push(superSkillEndNode);
            // Add the other child nodes, excluding subskills.
            for (let j = 0; j < regularChildSkills.length; j++) {
              parentChildren[i].children.push(regularChildSkills[j]);
            }
          }

          if (typeof parentChildren[i] !== "undefined") {
            /*
             * Run the above function again recursively.
             */
            if (
              parentChildren[i].children &&
              Array.isArray(parentChildren[i].children) &&
              parentChildren[i].children.length > 0
            )
              moveSubSkills(parentChildren[i].children);
          }
        }
      }

      moveSubSkills(skillsWithSubSkillsMoved);

      //   console.log(skillsNoSubSkills);

      var data = {
        name: null,
        children: skillsWithSubSkillsMoved,
      };

      const width = 8000;

      // Compute the tree height; this approach will allow the height of the
      // SVG to scale according to the breadth (width) of the tree layout.
      const root = d3.hierarchy(data);
      const dx = 30;
      const dy = width / (root.height + 1);

      // Create a tree layout.
      const tree = d3.tree().nodeSize([dx, dy]);

      // Sort the tree and apply the layout.
      root.sort((a, b) => d3.ascending(a.data.name, b.data.name));
      tree(root);

      // Compute the extent of the tree. Note that x and y are swapped here
      // because in the tree layout, x is the breadth, but when displayed, the
      // tree extends right rather than down.
      let x0 = Infinity;
      let x1 = -x0;
      root.each((d) => {
        if (d.x > x1) x1 = d.x;
        if (d.x < x0) x0 = d.x;
      });

      // Compute the adjusted height of the tree.
      const height = x1 - x0 + dx * 2;

      this.svg = d3
        .create("svg")
        // Add ID for the printing to PDF.
        .attr("id", "linearTree")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-dy / 3, x0 - dx, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

      const g = this.svg.append("g");

      // Links or connecting lines.
      g.append("g")
        .attr("fill", "none")
        .attr("stroke-opacity", 1)
        .selectAll()
        .data(root.links())
        .join("path")
        .attr(
          "d",
          d3
            .linkHorizontal()
            .x((d) => d.y)
            .y((d) => d.x)
        )
        .attr("stroke", function (d) {
          // If the link is between a super node start and end.
          if (d.target.data.position == "end") {
            return "#FF0000";
          } else {
            return "#000";
          }
        })
        .attr("stroke-width", function (d) {
          if (d.target.data.position == "end") {
            return 4;
          }

          if (d.target.data.is_mastered == 1) {
            return 8;
          } else return 1.5;
        });

      const node = g
        .append("g")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .selectAll()
        .data(root.descendants())
        .join("g")
        .attr("transform", (d) => `translate(${d.y},${d.x})`);

      node
        .append("circle")
        .attr("fill", (d) => (d.children ? "#555" : "#000"))
        .attr("r", 2.5);

      // Labels.
      node
        .append("text")
        .attr("dy", "0.31em")
        .attr("x", (d) => (d.children ? -6 : 6))
        .attr("text-anchor", (d) => (d.children ? "end" : "start"))
        .text((d) => d.data.skill_name)
        .clone(true)
        .lower()
        .attr("stroke", function (d) {
          // If the node is a super node end node.
          if (d.data.position == "end") {
            return "red";
          } else return "white";
        });

      // Zoom feature.
      this.svg.call(
        d3
          .zoom()
          .extent([
            [0, 0],
            [this.width, this.height],
          ])
          .scaleExtent([0.1, 20])
          .on("zoom", zoomed)
      );

      function zoomed({ transform }) {
        g.attr("transform", transform);
      }

      // Append the SVG element.
      document.querySelector("#skilltree").append(this.svg.node());
    },
    printPDF() {
      // Select the element from the DOM.
      var svg = document.getElementById("linearTree");
      // Then select with D3
      var d3Svg = d3.select(svg);
      // Then select the SVG code with D3
      var d3SvgNode = d3Svg.node();

      // Make it a string, to send to server.
      var s = new XMLSerializer();
      var str = s.serializeToString(d3SvgNode);

      // Create a JSON object.
      var dataObject = { svg: str, treeType: "linear" };
      var data = JSON.stringify(dataObject);

      // POST request.
      var xhttp = new XMLHttpRequest();
      xhttp.responseType = "arraybuffer";
      xhttp.open("POST", "/skilltree/print-pdf", true);
      xhttp.setRequestHeader("Content-type", "application/json;charset=UTF-8");
      xhttp.setRequestHeader("Accept", "application/json, text/plain, */*");
      xhttp.send(data);

      // To download the file client side.
      xhttp.onload = function () {
        if (this.readyState == 4 && this.status == 200) {
          // Typical action to be performed when the document is ready:
          let pdfBlob = new Blob([xhttp.response], { type: "application/pdf" });
          const url = window.URL.createObjectURL(pdfBlob);

          // To download and name the file.
          var a = document.createElement("a");
          document.body.appendChild(a);
          a.style = "display: none";
          a.href = url;
          a.download = "My-Skill-Tree.pdf";
          a.click();
          window.URL.revokeObjectURL(url);
        }
      };
    },
  },
};
</script>

<template>
  <div class="flex-container skill-tree-container">
    <!-- <SkillTreeFilter id="filter" /> -->

    <button id="print-btn" class="btn btn-info" @click="printPDF()">
      Print
    </button>
    <!-- Wrapper is for the dark overlay, when the sidepanel is displayed -->
    <div id="wrapper">
      <div id="skilltree">
        <SkillPanel :skill="skill" />
      </div>
      <div id="sidepanel-backdrop"></div>
    </div>
  </div>
</template>

<style scoped>
.dashed {
  fill: none;
  stroke: #ff0000;
  stroke-width: 1.5px;
  stroke-dasharray: 20, 10, 5, 5, 5, 10;
}
.skill-tree-container {
  /* Subtract the purple banner and the navigation bar. */
  height: calc(100% - 20px - 66px);
}

#wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

#sidepanel-backdrop {
  display: none;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1040;
  background-color: #000;
  opacity: 0.5;
  width: 100%;
  height: 100%;
}

#filter {
  width: 300px;
  position: absolute;
  padding-left: 1%;
  z-index: 1;
  margin-top: 10px;
}

#print-btn {
  position: absolute;
  right: 0;
  z-index: 1;
  margin-top: 10px;
  margin-right: 10px;
}

#reset-button {
  width: 100px;
  position: absolute;
  padding-left: 1%;
  z-index: 1;
  margin-top: 10px;
  right: 10px;
}

#skilltree {
  width: 100%;
  height: 100%;
  overflow: hidden;
  /* This is for the positioning of the information panel. */
  position: relative;
  background-color: white;
}

.flex-container {
  display: flex;
  flex-direction: row;
}

@media (max-width: 800px) {
  .flex-container {
    flex-direction: column;
  }
}
</style>
