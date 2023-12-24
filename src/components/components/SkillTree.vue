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
            radius: 0
        }
    },
    components: {
        SkillTreeFilter,
        SkillPanel
    },
    async mounted() {
        // Get the data from the API.
        if (this.skillTreeStore.userSkillsNoSubSkills.length == 0) {
            await this.skillTreeStore.getUserSkillsNoSubSkills()
        }

        if (this.skillTreeStore.userSkills.length == 0) {
            await this.skillTreeStore.getUserSkills()
        }

        // Specify the chart’s dimensions.
        const width = window.innerWidth
        const height = window.innerHeight
        this.radius = Math.min(width, height) / 2;

        var app = new PIXI.Application({
            width,
            height,
            resolution: 2,
            transparent: true,
            antialias: true,
            autoDensity: true,
            autoStart: true,
        });

        document.querySelector('#skilltree').appendChild(app.view);

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


        this.getAlgorithm(this.skillTreeStore.userSkillsNoSubSkills, this.skillTreeStore.userSkills, viewport);
    },
    methods: {
        getAlgorithm(userSkillsNoSubSkills, userSkills, viewport) {
            var data = {
                name: null,
                children: userSkillsNoSubSkills
            }

            // Create a radial tree layout. The layout’s first dimension (x)
            // is the angle, while the second (y) is the radius.
            const tree = d3.tree()
                // increase the radius to space out the nodes.
                .size([2 * Math.PI, this.radius * 6])
                .separation((a, b) => (a.parent == b.parent ? 1 : 4) / a.depth);

            // Sort the tree and apply the layout.
            const root = tree(d3.hierarchy(data))

            this.drawChart(userSkills, root, viewport)
        },
        drawChart(userSkills, root, viewport) {
            // Links.
            for (let i = 0; i < root.links().length; i++) {
                const link = new PIXI.Graphics();
                link.lineStyle(2, 0xFFFFFF, 1);

                // Source node.
                var sourceX = Math.cos(root.links()[i].source.x) * root.links()[i].source.y;
                var sourceY = Math.sin(root.links()[i].source.x) * root.links()[i].source.y;
                link.moveTo(sourceX, sourceY)

                // Target node.
                var targetX = Math.cos(root.links()[i].target.x) * root.links()[i].target.y;
                var targetY = Math.sin(root.links()[i].target.x) * root.links()[i].target.y;
                link.lineTo(targetX, targetY);

                viewport.addChild(link);
                // Add to array, so can be deleted when skill tree is recentered.
                this.stageContents.push(link)
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
            // Add to array, so can be deleted when skill tree is recentered.
            this.stageContents.push(centerNode)

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
            // Add to array, so can be deleted when skill tree is recentered.
            this.stageContents.push(centerNodeText)

            // Nodes.    
            function renderDescendantNodes(parentChildren, depth, context) {
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
                    var nodeGraphic = new PIXI.Sprite();

                    if (depth == 0) {

                    }
                    else if (depth == 1) {
                        if (child.is_mastered == "1") {
                            nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/all-regular-locked-unmastered.png');

                            if (child.first_ancestor == "1") {
                                nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/spoken-language-domain-large-mastered.png');
                            }
                            else if (child.first_ancestor == "2") {
                                nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/written-language-domain-large-mastered.png');
                            }
                            else if (child.first_ancestor == "3") {
                                nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/math-domain-large-mastered.png');
                            }
                            else if (child.first_ancestor == "4") {
                                nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/science-domain-large-mastered.png');
                            }
                            else if (child.first_ancestor == "5") {
                                nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/history-domain-large-mastered.png');
                            }
                            else if (child.first_ancestor == "6") {
                                nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/life-domain-large-mastered.png');
                            }
                            nodeGraphic.anchor.set(0.5);
                            nodeGraphic.width = 30
                            nodeGraphic.height = 30
                            nodeContainer.addChild(nodeGraphic);
                        }
                        else if (child.is_accessible == "1") {

                        }
                    }
                    else {
                        nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/all-regular-locked-unmastered.png');
                        if (child.is_mastered == "1") {
                            if (child.first_ancestor == "1") {
                                nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/spoken-language-domain-regular-mastered.png');
                            }
                            else if (child.first_ancestor == "2") {
                                nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/written-language-domain-regular-mastered.png');
                            }
                            else if (child.first_ancestor == "3") {
                                nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/math-domain-regular-mastered.png');
                            }
                            else if (child.first_ancestor == "4") {
                                nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/science-domain-regular-mastered.png');
                            }
                            else if (child.first_ancestor == "5") {
                                nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/history-domain-regular-mastered.png');
                            }
                            else if (child.first_ancestor == "6") {
                                nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/life-domain-regular-mastered.png');
                            }
                        }
                        else if (child.is_accessible == "1") {
                        }
                        nodeGraphic.anchor.set(0.5);
                        nodeGraphic.width = 20
                        nodeGraphic.height = 20
                        nodeContainer.addChild(nodeGraphic);
                    }

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

                    // Add interactivity.   
                    // Create the  skill object:
                    let skill = {
                        id: child.id,
                        children: child.children,
                        isMastered: child.is_mastered,
                        isUnlocked: child.is_accessible,
                        color: color,
                        container: nodeContainer,
                        name: child.skill_name,
                        description: child.description,
                        tagIDs: [],
                    }
                    // This is added to the graphic and text, and not the container,
                    // as it would otherwise effect all the container's child skills.
                    nodeGraphic.eventMode = 'static';
                    nodeName.eventMode = 'static';
                    nodeGraphic.cursor = 'pointer';
                    nodeName.cursor = 'pointer';
                    nodeName.on('pointerdown', (event) => {
                        if (!context.isSkillInfoPanelShown) {
                            //context.showInfoPanel(skill)                          
                            for (let i = 0; i < context.stageContents.length; i++) {
                                context.stageContents[i].destroy()
                            }
                            context.recenterTree(skill, viewport)
                        }

                        // else
                        //     context.updateInfoPanel(skill)
                    });
                    nodeGraphic.on('pointerdown', (event) => {
                        if (!context.isSkillInfoPanelShown) {
                            //context.showInfoPanel(skill)                            
                            for (let i = 0; i < context.stageContents.length; i++) {
                                context.stageContents[i].destroy()
                            }
                            context.recenterTree(skill, viewport)
                        }
                        //     context.showInfoPanel(skill)
                        // else
                        //     context.updateInfoPanel(skill)
                    });

                    viewport.addChild(nodeContainer);
                    // Add to array, so can be deleted when skill tree is recentered.
                    context.stageContents.push(nodeContainer)

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
                        renderDescendantNodes(child.children, depth, context)
                }
            }

            renderDescendantNodes(userSkills, 0, this);
        },
        recenterTree(skill, viewport) {
            var skillChildrenNoSubSkills = skill.children;
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

            removeSubSkills(skillChildrenNoSubSkills);
            this.getAlgorithm(skillChildrenNoSubSkills, skill.children, viewport)
        },

        showInfoPanel(skill) {
            // If panel is not showing.
            if (!this.isSkillInfoPanelShown) {
                // To display the panel.
                // Responsive.
                // Laptop etc.
                if (screen.width > 800) {
                    document.getElementById("skillInfoPanel").style.width = "474px";
                }
                // Mobile device.
                else {
                    document.getElementById("skillInfoPanel").style.height = "474px";
                }
                // Make the background dark and disabled.
                document.getElementById("sidepanel-backdrop").style.display = "block";

                this.isSkillInfoPanelShown = true;
                // Populate the skill heading.
                var skillHeading = document.getElementById("skillHeading");
                var name = document.createTextNode(skill.name);
                skillHeading.appendChild(name);
                // Populate the skill description.
                var skillDescription = document.getElementById("skillDescription");
                var description = document.createTextNode(skill.description);
                skillDescription.appendChild(description);
                // Populate the skill panel check box.             
                if (skill.isMastered == "1") {
                    document.getElementById("skillIsMastered").checked = true;
                }
                // Populate the skill link button.        
                var skillLink = document.getElementById("skillLink");
                skillLink.setAttribute("href", "/skills/" + skill.id);
            }
        },
    }
}

</script> 

<template>
    <div class="flex-container skill-tree-container">
        <SkillTreeFilter id="filter" />
        <!-- Wrapper is for the dark overlay, when the sidepanel is displayed -->
        <div id="wrapper">
            <div id="skilltree">
                <SkillPanel />
            </div>
            <div id="sidepanel-backdrop"></div>
        </div>
    </div>
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