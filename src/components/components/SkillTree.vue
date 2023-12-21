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

        }
    },
    components: {
        SkillTreeFilter,
        SkillPanel
    },
    async mounted() {
        // Get the data from the API.
        await this.skillTreeStore.getUserSkillsNoSubSkills()
        var nestedSkillNodesNoSubSkills = this.skillTreeStore.userSkillsNoSubSkills

        await this.skillTreeStore.getUserSkills()
        var nestedSkillNodes = this.skillTreeStore.userSkills

        var data = {
            name: "test",
            children: nestedSkillNodesNoSubSkills
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

        /*
        * Central circle.
        */

        // Graphic.
        const centerNode = PIXI.Sprite.from('center-node.png');
        centerNode.x = root.x
        centerNode.y = root.y
        centerNode.anchor.set(0.5)
        centerNode.scale.set(0.10)
        viewport.addChild(centerNode)

        // Text.
        // Font size is set artificially high, then scaed down, to improve resolution.
        let centerNodeText = new PIXI.Text("SKILLS",
            { fontFamily: 'Poppins900', fontSize: 65, fill: 0x000000, align: 'center' });
        centerNodeText.anchor.set(0.5)
        // Center it.
        centerNodeText.x = root.x
        centerNodeText.y = root.y
        // This is to deal with the artificially high font size mentioned above.
        centerNodeText.scale.x = 0.2
        centerNodeText.scale.y = 0.2
        viewport.addChild(centerNodeText)

        // Nodes.    
        function renderDescendantNodes(parentChildren, depth) {
            // Increase the depth each recursion.
            depth++

            for (let [index, child] of parentChildren.entries()) {
                for (let i = 0; i < root.descendants().length; i++) {
                    if (root.descendants()[i].data.id == child.id) {
                        child.x = root.descendants()[i].x
                        child.y = root.descendants()[i].y
                    }
                }

                /*
                * Create the skill node container.
                * Using the D3 algorithm to get the position.
                */
                let nodeContainer = new PIXI.Container();
                var angle = Math.random() * Math.PI * 2;
                nodeContainer.x = Math.cos(child.x) * child.y;
                nodeContainer.y = Math.sin(child.x) * child.y;

                /*
                * Draw the skill node.
                */
                const graphics = new PIXI.Graphics();
                // Circle              
                // Colour depending on mastery and whether skill is unlocked.
                var color;
                if (child.is_mastered == "1") {
                    color = '0x' + child.mastered_color;
                }
                else if (child.is_accessible == "1") {
                    graphics.lineStyle(1, '0x' + child.mastered_color, 1);
                    color = '0x' + child.unlocked_color;
                }
                else {
                    color = '0xD9D9D9';
                }
                graphics.beginFill(color);
                // Size, depending on depth.
                if (depth == 0) {
                    graphics.drawCircle(0, 0, 30);
                }
                else if (depth == 1) {
                    graphics.drawCircle(0, 0, 15);
                }
                else
                    graphics.drawCircle(0, 0, 10);
                graphics.endFill();
                nodeContainer.addChild(graphics);

                /*
                * Write the skill name.
                */
                let fontSize = 40;
                // Split name into an array.
                const nodeNameArray = child.skill_name.split(" ");
                for (let i = 0; i < nodeNameArray.length; i++) {
                    // Check if any of the strings are too long.
                    if (nodeNameArray[i].length > 9) {
                        fontSize = 37;
                    }
                }

                // Add line break if skill name is more than one word.
                child.skill_name = child.skill_name.replace(/(.*?\s)/g, '$1' + '\n')
                // Note that the fontSize is 5 times higher than encessary, to deal with pixellation on zoom.
                let nodeName = new PIXI.Text(child.skill_name.toUpperCase(),
                    { fontFamily: 'Poppins900', fontSize: fontSize, fill: 0xffffff, align: 'center' });
                // Text to centre of container.
                nodeName.anchor.set(0.5)

                // This is to deal with the artificially high fontSize mentioned above.
                nodeName.scale.x = 0.1
                nodeName.scale.y = 0.1

                // Add components to the container.                        
                nodeContainer.addChild(nodeName);
                viewport.addChild(nodeContainer);

                /*
                * Subskills.
                */
                // Sort the children into subskills and actual child skills.                        
                let numChildren = 0
                let numSubSkills = 0
                for (let i = 0; i < child.children.length; i++) {
                    if (child.children[i].type != 'sub') {
                        numChildren++
                    }
                    else {
                        numSubSkills++
                    }
                }
                for (let i = 0; i < child.children.length; i++) {
                    //console.log(child.children[i].type)
                    if (child.children[i].type == "sub") {
                        let subNodeContainer = new PIXI.Container();

                        // Calculate the increment of the subskills, around a circle.
                        let increment = 360 / numSubSkills
                        // Get the correct index number, excluding sub skills.
                        let subSkillsIndex = i - numChildren
                        // Calculate the nodes angle.
                        let angle = increment * subSkillsIndex
                        let rads = angle * Math.PI / 180
                        let x = 25 * Math.cos(rads)
                        let y = 25 * Math.sin(rads)

                        subNodeContainer.x = x
                        subNodeContainer.y = y

                        const graphics = new PIXI.Graphics();
                        var color;
                        if (child.children[i].is_mastered == "1") {
                            color = '0x' + child.children[i].mastered_color;
                        }
                        else if (child.children[i].is_accessible == "1") {
                            graphics.lineStyle(1, '0x' + child.children[i].mastered_color, 1);
                            color = '0x' + child.children[i].unlocked_color;
                        }
                        else {
                            color = '0xD9D9D9';
                        }
                        graphics.beginFill(color);
                        // Size, depending on depth.
                        graphics.drawCircle(0, 0, 5);
                        graphics.endFill();
                        subNodeContainer.addChild(graphics);
                        nodeContainer.addChild(subNodeContainer);
                    }
                }

                /*
                * Run the above function again recursively.
                */
                if (child.children && Array.isArray(child.children) && child.children.length > 0)
                    renderDescendantNodes(child.children, depth)
            }
        }

        renderDescendantNodes(nestedSkillNodes, 0);
    },
    methods: {
    }
}

</script> 

<template>
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