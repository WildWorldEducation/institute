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
            // De radius, maybe delete?
            radius: 0,
            width: null,
            height: null,
            // D3 radius multiplier
            radiusMultiplier: 4,
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
        // Get the data from the API.
        // if (this.skillTreeStore.userSkillsNoSubSkills.length == 0) {
        //     await this.skillTreeStore.getUserSkillsNoSubSkills()
        // }
        // Delete the record in the store and the API call for the abve? Not used now.


        document.getElementById("reset-button").addEventListener("click", () => {
            this.resetTree()
        });


        if (this.skillTreeStore.userSkills.length == 0) {
            await this.skillTreeStore.getUserSkills()
        }

        // Specify the chart’s dimensions.
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.radius = Math.min(this.width, this.height) / 2;

        document.querySelector('#skilltree').appendChild(this.$pixiApp.view);

        const viewport = new Viewport({
            screenWidth: this.width,
            screenHeight: this.height,
            worldWidth: this.width,
            worldHeight: this.height,
            events: this.$pixiApp.renderer.events,
        });

        this.$pixiApp.stage.addChild(viewport);

        viewport.center = new PIXI.Point(0, 0);
        viewport
            .drag().pinch().wheel().decelerate()
            .clampZoom({ minScale: 0.2, maxScale: 5 });

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

            // Create a radial tree layout. The layout’s first dimension (x)
            // is the angle, while the second (y) is the radius.
            const tree = d3.tree()
                // increase the radius to space out the nodes.
                .size([2 * Math.PI, this.radius * this.radiusMultiplier])
                .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);

            // Sort the tree and apply the layout.
            const root = tree(d3.hierarchy(data))

            this.drawChart(root)
        },
        drawChart(root) {
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

                this.$pixiApp.stage.children[0].addChild(link);
                // Add to array, so can be deleted when skill tree is recentered.
                this.stageContents.push(link)
            }

            /*
            * Central circle.
            */
            // Graphic.
            const centerNode = this.skill.sprite
            centerNode.x = root.x
            centerNode.y = root.y
            centerNode.anchor.set(0.5)
            if (this.isRecentered == false)
                centerNode.scale.set(0.10)
            else
                centerNode.scale.set(0.25)

            this.$pixiApp.stage.children[0].addChild(centerNode)
            // Add to array, so can be deleted when skill tree is recentered.
            this.stageContents.push(centerNode)

            // Text.
            // Font size is set artificially high, then scaed down, to improve resolution.
            let centerNodeText = new PIXI.Text(this.skill.name,
                { fontFamily: 'Poppins900', fontSize: 40, fill: 0x000000, align: 'center' });
            centerNodeText.anchor.set(0.5)
            // Center it.
            centerNodeText.x = root.x
            centerNodeText.y = root.y
            // This is to deal with the artificially high font size mentioned above.
            centerNodeText.scale.x = 0.2
            centerNodeText.scale.y = 0.2
            this.$pixiApp.stage.children[0].addChild(centerNodeText)
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
                    //   var angle = Math.random() * Math.PI * 2;
                    nodeContainer.x = Math.cos(child.x) * child.y;
                    nodeContainer.y = Math.sin(child.x) * child.y;

                    /*
                    * Draw the skill node.
                    */
                    var nodeGraphic = new PIXI.Sprite();
                    if (child.level == "grade_school") {
                        if (child.is_mastered)
                            nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/grade-school-mastered.png');
                        else if (child.is_accessible)
                            nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/grade-school-unlocked.png');
                        else
                            nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/grade-school-locked.png');
                    }
                    else if (child.level == "middle_school") {
                        if (child.is_mastered)
                            nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/middle-school-mastered.png');
                        else if (child.is_accessible)
                            nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/middle-school-unlocked.png');
                        else
                            nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/middle-school-locked.png');
                    }
                    else if (child.level == "high_school") {
                        if (child.is_mastered)
                            nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/high-school-mastered.png');
                        else if (child.is_accessible)
                            nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/middle-school-unlocked.png');
                        else
                            nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/middle-school-locked.png');
                    }
                    else if (child.level == "college") {
                        if (child.is_mastered)
                            nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/college-mastered.png');
                        else if (child.is_accessible)
                            nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/middle-school-unlocked.png');
                        else
                            nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/middle-school-locked.png');
                    }
                    else if (child.level == "phd") {
                        if (child.is_mastered)
                            nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/phd-mastered.png');
                        else if (child.is_accessible)
                            nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/middle-school-unlocked.png');
                        else
                            nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/middle-school-locked.png');
                    }
                    else if (child.level == "domain") {
                        nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/domain.png');
                    }

                    nodeGraphic.width = 30
                    nodeGraphic.height = 30
                    nodeGraphic.anchor.set(0.5);
                    nodeContainer.addChild(nodeGraphic);
                    /*
                    * Write the skill name.
                    */
                    let fontSize = 40;
                    // Split name into an array.
                    const nodeNameArray = child.skill_name.split(" ");
                    for (let i = 0; i < nodeNameArray.length; i++) {
                        // Check if any of the strings are too long.
                        if (nodeNameArray[i].length > 9) {
                            fontSize = 30;
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

                    // This is added to the graphic and text, and not the container,
                    // as it would otherwise effect all the container's child skills.
                    nodeGraphic.eventMode = 'static';
                    nodeName.eventMode = 'static';
                    nodeGraphic.cursor = 'pointer';
                    nodeName.cursor = 'pointer';

                    nodeName.on('pointerdown', (event) => {
                        // Create the  skill object:
                        var skill = {
                            id: child.id,
                            children: child.children,
                            isMastered: child.is_mastered,
                            isUnlocked: child.is_accessible,
                            container: nodeContainer,
                            name: child.skill_name,
                            description: child.description,
                            tagIDs: [],
                            sprite: nodeGraphic
                        }
                        context.skill = skill

                        if (!context.isSkillInfoPanelShown) {
                            context.skill = skill
                            context.showInfoPanel()

                            function recenterTree() {
                                context.recenterTree()
                            }
                            document.getElementById("recenterTree").addEventListener("click", recenterTree);
                        }
                        // else
                        //     context.updateInfoPanel(skill)
                    });
                    nodeGraphic.on('pointerdown', (event) => {
                        // Create the  skill object:
                        var skill = {
                            id: child.id,
                            children: child.children,
                            isMastered: child.is_mastered,
                            isUnlocked: child.is_accessible,
                            container: nodeContainer,
                            name: child.skill_name,
                            description: child.description,
                            tagIDs: [],
                            sprite: nodeGraphic
                        }
                        context.skill = skill

                        if (!context.isSkillInfoPanelShown) {
                            context.skill = skill
                            context.showInfoPanel()

                            function recenterTree() {
                                context.recenterTree()
                            }
                            document.getElementById("recenterTree").addEventListener("click", recenterTree);
                        }
                        // else
                        //     context.updateInfoPanel(skill)
                    });

                    context.$pixiApp.stage.children[0].addChild(nodeContainer);
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

                            var nodeGraphic = new PIXI.Sprite();
                            if (child.level == "grade_school") {
                                if (child.is_mastered)
                                    nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/grade-school-small-mastered.png');
                                else if (child.is_accessible)
                                    nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/grade-school-small-unlocked.png');
                                else
                                    nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/grade-school-small-locked.png');
                            }
                            else if (child.level == "middle_school") {
                                if (child.is_mastered)
                                    nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/middle-school-small-mastered.png');
                                else if (child.is_accessible)
                                    nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/middle-school-small-unlocked.png');
                                else
                                    nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/middle-school-small-locked.png');
                            }
                            else if (child.level == "high_school") {
                                if (child.is_mastered)
                                    nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/high-school-small-mastered.png');
                                else if (child.is_accessible)
                                    nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/high-school-small-unlocked.png');
                                else
                                    nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/high-school-small-locked.png');
                            }
                            else if (child.level == "college") {
                                if (child.is_mastered)
                                    nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/college-smal-mastered.png');
                                else if (child.is_accessible)
                                    nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/college-small-unlocked.png');
                                else
                                    nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/college-small-locked.png');
                            }
                            else if (child.level == "phd") {
                                if (child.is_mastered)
                                    nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/phd-small-mastered.png');
                                else if (child.is_accessible)
                                    nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/phd-small-unlocked.png');
                                else
                                    nodeGraphic = PIXI.Sprite.from('images/skill-tree-nodes/phd-small-locked.png');
                            }
                            nodeGraphic.width = 10
                            nodeGraphic.height = 10
                            nodeGraphic.anchor.set(0.5);

                            subNodeContainer.addChild(nodeGraphic);
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

            renderDescendantNodes(this.skill.children, 0, this);
        },
        recenterTree() {
            this.isRecentered = true

            // Otherwise, the new chart is too spread out.
            this.radiusMultiplier = 1

            for (let i = 0; i < this.stageContents.length; i++) {
                this.stageContents[i].destroy()
            }

            // Hide the side panel again.
            this.hideInfoPanel()

            this.getAlgorithm()
        },
        resetTree() {
            this.isRecentered = false

            this.radiusMultiplier = 4

            this.$pixiApp.stage.children[0].removeChildren()

            const centerNodeSprite = PIXI.Sprite.from('center-node.png');
            this.skill = {
                name: "SKILLS",
                sprite: centerNodeSprite,
                children: this.skillTreeStore.userSkills
            }

            this.getAlgorithm();
        },
        showInfoPanel() {
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
                // Populate the skill description.
                var skillDescription = document.getElementById("skillDescription");
                // Populate the skill panel check box.             
                // if (skill.isMastered == "1") {
                //     document.getElementById("skillIsMastered").checked = true;
                // }
                // Populate the skill link button.        
                var skillLink = document.getElementById("skillLink");
                //skillLink.setAttribute("href", "/skills/" + skill.id);
            }
        },
        hideInfoPanel() {
            // If panel is showing.
            if (this.isSkillInfoPanelShown) {
                // Responsive.
                // Laptop etc.
                if (screen.width > 800) {
                    document.getElementById("skillInfoPanel").style.width = "0px";
                }
                // Mobile device.
                else {
                    document.getElementById("skillInfoPanel").style.height = "0px";
                }
                // Hide the background.
                document.getElementById("sidepanel-backdrop").style.display = "none";

                this.isSkillInfoPanelShown = false;
            }
        },
        filterSkills(level) {
            // Recursive algorithm to remove skills not in the filter.
            var filteredSkills = []
            function filterSkills(children, level) {
                // Go through each nested level of the array.
                for (let i = 0; i < children.length; i++) {
                    // If there isa  match for the filter, add it to the new array.
                    if (children[i].level == level || children[i].level == "domain") {
                        filteredSkills.push(children[i])
                    }

                    // If the element has children, run the function on that array.
                    if (children[i].children.length > 0)
                        filterSkills(children[i].children, level)
                }
            }
            filterSkills(this.skill.children, level);

            // To convert the regular array to a nested one.
            for (var i = 0; i < filteredSkills.length; i++) {
                filteredSkills[i].children = [];
                if (filteredSkills[i].parent != null && filteredSkills[i].parent != 0) {
                    var parentId = filteredSkills[i].parent;

                    // go through all rows again, add children
                    for (let j = 0; j < filteredSkills.length; j++) {
                        if (filteredSkills[j].id == parentId) {
                            filteredSkills[j].children.push(filteredSkills[i]);
                        }
                    }
                }
            }

            let studentSkills = [];
            for (var i = 0; i < filteredSkills.length; i++) {
                if (filteredSkills[i].parent == null || filteredSkills[i].parent == 0) {
                    studentSkills.push(filteredSkills[i]);
                }
            }

            this.skill.children = studentSkills

            for (let i = 0; i < this.stageContents.length; i++) {
                this.stageContents[i].destroy()
            }
            this.applyFilter();
        },
        applyFilter() {
            this.$pixiApp.stage.children[0].removeChildren()
            this.radiusMultiplier = 2

            const centerNodeSprite = PIXI.Sprite.from('center-node.png');
            this.skill = {
                name: "SKILLS",
                sprite: centerNodeSprite,
                children: this.skill.children
            }

            this.getAlgorithm();
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