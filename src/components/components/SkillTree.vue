<script>
// Import the stores.
import { useUserDetailsStore } from '../../stores/UserDetailsStore'
import { useSkillTreeStore } from '../../stores/SkillTreeStore'
import { useUserSkillsStore } from '../../stores/UserSkillsStore'
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
        const userSkillsStore = useUserSkillsStore();
        return {
            userDetailsStore, skillTreeStore, skillTagsStore, userSkillsStore
        }
    },
    data() {
        return {

        }
    },
    components: {
        SkillTreeFilter,
        SkillPanel
    },
    async mounted() {
        // Get the data from the API.
        await this.skillTreeStore.getUserSkillsNoSubSkills()
        var nestedSkillNodes = this.skillTreeStore.userSkillsNoSubSkills

        await this.userSkillsStore.getUnnestedList(this.userDetailsStore.userId)
        var unnestedUserSkills = this.userSkillsStore.unnestedList

        var unnestedUserSkillsNoSubSkills = []
        for (let i = 0; i < unnestedUserSkills.length; i++) {
            if (unnestedUserSkills[i].type != "sub")
                unnestedUserSkillsNoSubSkills.push(unnestedUserSkills[i])
        }

        var data = {
            name: "test",
            children: nestedSkillNodes
        }

        // Specify the chart’s dimensions.
        const width = window.innerWidth
        const height = window.innerHeight
        const cx = width * 0.5; // adjust as needed to fit
        const cy = height * 0.59; // adjust as needed to fit
        const radius = Math.min(width, height) / 2;

        // Create a radial tree layout. The layout’s first dimension (x)
        // is the angle, while the second (y) is the radius.
        const tree = d3.tree()
            // increase the radius to space out the nodes.
            .size([2 * Math.PI, radius * 6])
            .separation((a, b) => (a.parent == b.parent ? 1 : 4) / a.depth);

        // Sort the tree and apply the layout.
        const root = tree(d3.hierarchy(data))
        console.log(root)

        // Creates the SVG container.
        // const svg = d3.create("svg")
        //     .attr("width", width)
        //     .attr("height", height)
        //     .attr("viewBox", [-cx, -cy, width, height])
        //     .attr("style", "width: 100%; height: auto; font: 10px sans-serif;");


        // Append links.
        // svg.append("g")
        //     .attr("fill", "none")
        //     .attr("stroke", "#555")
        //     .attr("stroke-opacity", 0.4)
        //     .attr("stroke-width", 1.5)
        //     .selectAll()
        //     .data(root.links())
        //     .join("path")
        //     .attr("d", d3.linkRadial()
        //         .angle(d => d.x)
        //         .radius(d => d.y));

        //console.log(root.links())

        // Append nodes.
        // svg.append("g")
        //     .selectAll()
        //     .data(root.descendants())
        //     .join("circle")
        //     .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
        //     //  .attr("fill", d => d.children ? "#555" : "#999")
        //     .attr("r", 2.5);


        //        document.getElementById('svg').appendChild(svg.node());


        const app = new PIXI.Application({
            width,
            height,
            resolution: 2,
            transparent: true,
            antialias: true,
            autoDensity: true,
            autoStart: true,
        });

        document.querySelector('#app').appendChild(app.view);

        const viewport = new Viewport({
            screenWidth: width,
            screenHeight: height,
            worldWidth: width,
            worldHeight: height,
            events: app.renderer.events,
        });
        app.stage.addChild(viewport);
        viewport.center = new PIXI.Point(0, 0);
        viewport
            .drag().pinch().wheel().decelerate()
            .clampZoom({ minScale: 0.2, maxScale: 5 });


        // Links.
        for (let i = 0; i < root.links().length; i++) {
            const link = new PIXI.Graphics();
            link.lineStyle(2, 0xFFFFFF, 1);

            var angle = Math.random() * Math.PI * 2;

            // Source node.
            var sourceX = Math.cos(root.links()[i].source.x) * root.links()[i].source.y;
            var sourceY = Math.sin(root.links()[i].source.x) * root.links()[i].source.y;
            link.moveTo(sourceX, sourceY)

            // Target node.
            var targetX = Math.cos(root.links()[i].target.x) * root.links()[i].target.y;
            var targetY = Math.sin(root.links()[i].target.x) * root.links()[i].target.y;
            link.lineTo(targetX, targetY);

            viewport.addChild(link);
        }

        // Nodes.    
        // for (let i = 0; i < root.descendants().length; i++) {
        //     const graphics = new PIXI.Graphics();
        //     // Circle
        //     graphics.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
        //     graphics.beginFill(0xDE3249, 1);

        //     var angle = Math.random() * Math.PI * 2;
        //     var x = Math.cos(root.descendants()[i].x) * root.descendants()[i].y;
        //     var y = Math.sin(root.descendants()[i].x) * root.descendants()[i].y;
        //     if (i == 0) {
        //         graphics.drawCircle(x, y, 30);
        //     }
        //     else if (i < 7) {
        //         graphics.drawCircle(x, y, 15);
        //     }
        //     else
        //         graphics.drawCircle(x, y, 10);
        //     graphics.endFill();

        //     viewport.addChild(graphics);
        // }

        function renderDescendantNodes(parentChildren, depth) {
            // Increase the depth each recursion.
            depth++

            for (let [index, child] of parentChildren.entries()) {
                console.log(child)

                const graphics = new PIXI.Graphics();
                // Circle
                graphics.lineStyle(0);
                graphics.beginFill(0xDE3249, 1);
                var angle = Math.random() * Math.PI * 2;
                var x = Math.cos(child.x) * child.y;
                var y = Math.sin(child.x) * child.y;
                if (depth == 0) {
                    graphics.drawCircle(x, y, 30);
                }
                else if (depth < 7) {
                    graphics.drawCircle(x, y, 15);
                }
                else
                    graphics.drawCircle(x, y, 10);
                graphics.endFill();

                viewport.addChild(graphics);

                /*
                * Run the above function again recursively.
                */
                if (child.children && Array.isArray(child.children) && child.children.length > 0)
                    renderDescendantNodes(child.children, depth)
            }
        }

        renderDescendantNodes(root.children, 0);
    },
    methods: {
    }
}

</script> 

<template>
    <hr>
    <!-- <div id="svg" class="flex-container skill-tree-container"> </div> -->
</template>


<style scoped>
.skill-tree-container {
    /* Subtract the purple banner and the navigation bar. */
    height: calc(100% - 77px - 66px)
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

#skilltree {
    width: 100%;
    height: 100%;
    overflow: hidden;
    /* This is for the positioning of the information panel. */
    position: relative;
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