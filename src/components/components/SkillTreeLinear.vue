<script>
// Import the stores.
import { useUserDetailsStore } from '../../stores/UserDetailsStore'
import { useSkillTreeStore } from '../../stores/SkillTreeStore'
import { useSkillTagsStore } from '../../stores/SkillTagsStore'

// Nested component.
import SkillTreeFilter from './SkillTreeFilter.vue';
import SkillPanel from './SkillPanel.vue';

// Import Pixi JS.
import * as PIXI from 'pixi.js';
// Import Pixi Viewprt.
import { Viewport } from 'pixi-viewport'
// For pixi to use custom fonts.
import FontFaceObserver from 'fontfaceobserver'

import * as d3 from 'd3'

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const skillTreeStore = useSkillTreeStore();
        const skillTagsStore = useSkillTagsStore();
        return {
            userDetailsStore, skillTreeStore, skillTagsStore
        }
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
            isRecentered: false
        }
    },
    components: {
        SkillTreeFilter,
        SkillPanel
    },
    async mounted() {

        // TODO: cleanup this file, there is unused code.

        // Get the data from the API.
        // if (this.skillTreeStore.userSkillsNoSubSkills.length == 0) {
        //     await this.skillTreeStore.getUserSkillsNoSubSkills()
        // }
        // Delete the record in the store and the API call for the abve? Not used now.

        if (this.skillTreeStore.userSkills.length == 0) {
            await this.skillTreeStore.getUserSkills()
        }

        // Specify the chart’s dimensions.
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.radius = Math.min(this.width, this.height) / 2;

        const centerNodeSprite = PIXI.Sprite.from('center-node.png');
        this.skill = {
            name: "SKILLS",
            sprite: centerNodeSprite,
            children: this.skillTreeStore.userSkills
        }

        this.getAlgorithm();
    },
    methods: {
        getAlgorithm() {
            var skillsNoSubSkills = [];
            skillsNoSubSkills = JSON.parse(JSON.stringify(this.skill.children));

            // Remove subskills, in order to allow D3 to calculate the positioning properly.
            function removeSubSkills(parentChildren) {
                var i = parentChildren.length
                while (i--) {
                    if (parentChildren[i].type == "sub") {
                        parentChildren.splice(i, 1);
                    }

                    // Dont run if this element was just spliced.
                    if (typeof parentChildren[i] !== 'undefined') {
                        /*
                        * Run the above function again recursively.
                        */
                        if (parentChildren[i].children && Array.isArray(parentChildren[i].children) && parentChildren[i].children.length > 0)
                            removeSubSkills(parentChildren[i].children)
                    }
                }
            }

            removeSubSkills(skillsNoSubSkills);

            var data = {
                name: null,
                children: skillsNoSubSkills
            }

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
            root.each(d => {
                if (d.x > x1) x1 = d.x;
                if (d.x < x0) x0 = d.x;
            });

            // Compute the adjusted height of the tree.
            const height = x1 - x0 + dx * 2;

            const svg = d3.create("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [-dy / 3, x0 - dx, width, height])
                .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

            const g = svg.append("g")

            g.append("g")
                .attr("fill", "none")
                .attr("stroke", "#FFF")
                .attr("stroke-opacity", 1)
                .selectAll()
                .data(root.links())
                .join("path")
                .attr("d", d3.linkHorizontal()
                    .x(d => d.y)
                    .y(d => d.x))
                .attr("stroke-width", function (d) {
                    if (d.target.data.is_mastered == 1) {
                        return 8
                    }
                    else
                        return 1.5
                });

            const node = g.append("g")
                .attr("stroke-linejoin", "round")
                .attr("stroke-width", 3)
                .selectAll()
                .data(root.descendants())
                .join("g")
                .attr("transform", d => `translate(${d.y},${d.x})`);

            node.append("circle")
                .attr("fill", d => d.children ? "#555" : "#999")
                .attr("r", 2.5);

            node.append("text")
                .attr("dy", "0.31em")
                .attr("x", d => d.children ? -6 : 6)
                .attr("text-anchor", d => d.children ? "end" : "start")
                .text(d => d.data.skill_name)
                .clone(true).lower()
                .attr("stroke", "white");


            svg.call(d3.zoom()
                .extent([[0, 0], [this.width, this.height]])
                .scaleExtent([0.1, 20])
                .on("zoom", zoomed));


            function zoomed({ transform }) {
                g.attr("transform", transform);
            }

            // Append the SVG element.
            document.querySelector('#skilltree').append(svg.node());
        }
    }
}

</script> 

<template>
    <div class="flex-container skill-tree-container">
        <SkillTreeFilter id="filter" />
        <button v-show="isRecentered" id="reset-button" class="btn btn-info">Reset</button>
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
    height: calc(100% - 20px - 66px)
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
    opacity: .5;
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


#reset-button {
    width: 100px;
    position: absolute;
    padding-left: 1%;
    z-index: 1;
    margin-top: 10px;
    right: 10px
}

#skilltree {
    width: 100%;
    height: 100%;
    overflow: hidden;
    /* This is for the positioning of the information panel. */
    position: relative;
    background-color: black;
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