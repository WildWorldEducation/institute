<script>
// Import the stores.
import { useUserDetailsStore } from "../../stores/UserDetailsStore";
import { useSkillTreeStore } from "../../stores/SkillTreeStore";
import { useSkillTagsStore } from "../../stores/SkillTagsStore";

// Nested component.
import SkillTreeFilter from "./SkillTreeFilter.vue";
import SkillPanel from "./SkillPanel.vue";

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
      width: null,
      height: null,
      // D3 radius multiplier
      radiusMultiplier: 1,
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
    // this.width = window.innerWidth
    // this.height = window.innerHeight
    this.width = 20000;
    this.height = 20000;
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
      var skillsNoSubSkills = [];
      skillsNoSubSkills = JSON.parse(JSON.stringify(this.skill.children));

      // Remove subskills, in order to allow D3 to calculate the positioning properly.
      function removeSubSkills(parentChildren) {
        var i = parentChildren.length;
        while (i--) {
          if (parentChildren[i].type == "sub") {
            parentChildren.splice(i, 1);
          }

          // Dont run if this element was just spliced.
          if (typeof parentChildren[i] !== "undefined") {
            /*
             * Run the above function again recursively.
             */
            if (
              parentChildren[i].children &&
              Array.isArray(parentChildren[i].children) &&
              parentChildren[i].children.length > 0
            )
              removeSubSkills(parentChildren[i].children);
          }
        }
      }

      removeSubSkills(skillsNoSubSkills);

      var data = {
        name: null,
        children: skillsNoSubSkills,
      };

      // Create a radial tree layout. The layout’s first dimension (x)
      // is the angle, while the second (y) is the radius.
      const tree = d3
        .cluster()
        // increase the radius to space out the nodes.
        .size([2 * Math.PI, this.radius * this.radiusMultiplier])
        // Max separation between sibling nodes.
        .separation((a, b) => (a.parent == b.parent ? 1 : 1) / a.depth);

      // Sort the tree and apply the layout.
      const root = tree(d3.hierarchy(data));

      // Creates the SVG container.
      // Set the center.
      const cx = this.width * 0.5;
      const cy = this.height * 0.52;

      const svg = d3
        .create("svg")
        // Add ID for the printing to PDF.
        .attr("id", "radialTree")
        .attr("width", this.width)
        .attr("height", this.height)
        .attr("viewBox", [-cx, -cy, this.width, this.height])
        .attr("style", "width: 100%; height: auto; font: 10px sans-serif;");

      const g = svg.append("g");

      // Append links.
      g.append("g")
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 1)
        .selectAll()
        .data(root.links())
        .join("path")
        .attr(
          "d",
          d3
            .linkRadial()
            .angle((d) => d.x)
            .radius((d) => d.y)
        )
        // Thicker line if the student has mastered the target node.
        .attr("stroke-width", function (d) {
          if (d.target.data.is_mastered == 1) {
            return 8;
          } else return 2;
        });

      // Append nodes.
      g.append("g")
        .selectAll()
        .data(root.descendants())
        .join("circle")
        .attr(
          "transform",
          (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`
        )
        .attr("fill", function (d) {
          //  console.log(d.data)
          if (d.depth == 0) {
            return "lightgreen";
          } else if (d.data.type == "domain") {
            return "orange";
          } else if (d.data.level == "grade_school") {
            return "yellow";
          } else if (d.data.level == "middle_school") {
            return "lightblue";
          } else if (d.data.level == "high_school") {
            return "green";
          } else if (d.data.level == "college") {
            return "red";
          } else if (d.data.level == "phd") {
            return "purple";
          }
        })
        .attr("r", function (d) {
          if (d.depth == 0) {
            return 50;
          } else if (d.data.type == "domain") return 20;
          else return 5;
        });

      // Append labels.
      g.append("g")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .selectAll()
        .data(root.descendants())
        .join("text")
        .attr(
          "transform",
          (d) =>
            `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0) rotate(${
              d.x >= Math.PI ? 180 : 0
            })`
        )
        .attr("dy", "0.31em")
        .attr("x", (d) => (d.x < Math.PI === !d.children ? 6 : -6))
        .attr("text-anchor", (d) =>
          d.x < Math.PI === !d.children ? "start" : "end"
        )
        .attr("paint-order", "stroke")
        .attr("stroke", "white")
        .attr("fill", "currentColor")
        .text((d) => d.data.skill_name);

      svg.call(
        d3
          .zoom()
          .extent([
            [0, 0],
            [this.width, this.height],
          ])
          .scaleExtent([0.0001, 20])
          .on("zoom", zoomed)
      );

      function zoomed({ transform }) {
        g.attr("transform", transform);
      }

      // Append the SVG element.
      document.querySelector("#skilltree").append(svg.node());
    },
    printPDF() {
      // Select the element from the DOM.
      var svg = document.getElementById("radialTree");
      // Then select with D3
      var d3Svg = d3.select(svg);
      // Then select the SVG code with D3
      var d3SvgNode = d3Svg.node();

      // Make it a string, to send to server.
      var s = new XMLSerializer();
      var str = s.serializeToString(d3SvgNode);

      // Create a JSON object.
      var dataObject = { svg: str, treeType: "radial" };
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
    <!-- <SkillTreeFilter id="filter" />
        <button v-show="isRecentered" id="reset-button" class="btn btn-info">Reset</button> -->
    <!--<button id="print-btn" class="btn btn-info" @click="printPDF()">
      Print
    </button> -->
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
