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
            // The user's id.
            userId: this.userDetailsStore.userId,

            // Sizes of the nodes, per level.
            firstLevelNodeRadius: 36,
            otherLevelNodeRadius: 17,
            // Radius's of the different skill levels.
            firstLevelCircleRadius: 300,
            nodeDistance: 300,
            subSkillDistance: 75,
            // Arrays to position the nodes and for the filters.            
            firstLevelSkillsArray: [],
            firstLevelSkillsConnectingLinesArray: [],
            secondLevelSkillsArray: [],
            secondLevelSkillsConnectingLinesArray: [],
            thirdLevelSkillsArray: [],
            thirdLevelSkillsConnectingLinesArray: [],
            fourthLevelSkillsArray: [],
            fourthLevelSkillsConnectingLinesArray: [],
            isSkillInfoPanelShown: false,
            domains: []
        }
    },
    components: {
        SkillTreeFilter,
        SkillPanel
    },

    async mounted() {
        // Need to load these 2 stores before the asynchronous call to load the fonts.
        // Load the user skills.
        await this.skillTreeStore.getUserSkills()
        // Load the skill tags.
        await this.skillTagsStore.getSkillTagsList()

        // Need to make sure the font is loaded before loading the app, or font wont load at first.
        // Create font the loader.
        let font = new FontFaceObserver('Poppins900', {});
        // Once font has loaded, load PIXI app.
        font.load().then(() => {

            const skilltreeDiv = document.getElementById("skilltree");
            const app = new PIXI.Application(
                {
                    // Take up whole div.
                    resizeTo: skilltreeDiv,
                    antialias: true,
                    // Background colour.
                    backgroundColor: 0xffffff
                })

            // Work out the width and height of the div, for the zooming and panning.
            var skillTreeDivStyle = window.getComputedStyle(document.getElementById("skilltree"), null);
            var skillTreeDivWidth = skillTreeDivStyle.getPropertyValue("width");
            var skillTreeDivHeight = skillTreeDivStyle.getPropertyValue("height");

            // Create viewport.
            const viewport = new Viewport({
                screenWidth: window.innerWidth,
                screenHeight: window.innerHeight,
                worldWidth: skillTreeDivWidth,
                worldHeight: skillTreeDivHeight,

                events: app.renderer.events // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
            })
            // So that the z-index of the elements can be changed (NB for the connecting lines).
            viewport.sortableChildren = true

            // Add the viewport to the stage.
            app.stage.addChild(viewport)

            // Activate viewport plugins.
            viewport
                .drag()
                .pinch()
                .wheel()
                // Restrict amount of zoom in and out.
                .clampZoom({ minScale: 0.2, maxScale: 4 })

            skilltreeDiv.appendChild(app.view);

            // Center Circle Halo
            let centerNodeHalo = new PIXI.Graphics();
            centerNodeHalo.lineStyle(3, 0xC8D7DA, 1);
            centerNodeHalo.beginFill(0xFFFFFF, 1);
            centerNodeHalo.drawCircle(window.innerWidth / 2, window.innerHeight / 2, 65);
            centerNodeHalo.endFill();
            viewport.addChild(centerNodeHalo)

            // Center circle. ------
            // Graphic.
            const centerNode = PIXI.Sprite.from('center-node.png');
            centerNode.x = window.innerWidth / 2
            centerNode.y = window.innerHeight / 2
            centerNode.anchor.set(0.5)
            centerNode.scale.set(0.15)
            viewport.addChild(centerNode)

            // Text.
            // Font size is set artificially high, then scaed down, to improve resolution.
            let centerNodeText = new PIXI.Text("SKILLS",
                { fontFamily: 'Poppins900', fontSize: 90, fill: 0x000000, align: 'center' });
            centerNodeText.anchor.set(0.5)
            // Center it.
            centerNodeText.x = window.innerWidth / 2
            centerNodeText.y = window.innerHeight / 2
            // This is to deal with the artificially high font size mentioned above.
            centerNodeText.scale.x = 0.2
            centerNodeText.scale.y = 0.2
            viewport.addChild(centerNodeText)

            // Number of skills in first level.
            var firstLevelSkillsNum = this.skillTreeStore.userSkills.length;

            for (let i = 0; i < firstLevelSkillsNum; i++) {
                let userSkill = this.skillTreeStore.userSkills[i]

                // Draw the circles.
                let firstLevelSkillNodeGraphic = new PIXI.Graphics();

                // Colour depending on mastery, date of mastery, and whether skill is unlocked.
                var color;
                if (userSkill.is_mastered == 1) {
                    color = '0x' + userSkill.mastered_color;
                }
                else if (userSkill.is_accessible == 1) {
                    firstLevelSkillNodeGraphic.lineStyle(1, '0x' + userSkill.mastered_color, 1);
                    color = '0x' + userSkill.unlocked_color;
                }
                else {
                    color = '0xD9D9D9';
                }

                // Calculate the spacing and position of the first level skills around a circle path.
                var theta = ((Math.PI * 2) / firstLevelSkillsNum);
                var angle = (theta * i);

                /* Smaller circles around the halo.*/
                var smallCircleX = 65 * Math.cos(angle);
                var smallCircleY = 65 * Math.sin(angle);

                let haloGraphic = new PIXI.Graphics();
                // Position is half the width of canvas plus x, half the height of canvas plus y.
                haloGraphic.x = window.innerWidth / 2 + smallCircleX
                haloGraphic.y = window.innerHeight / 2 + smallCircleY
                // Draw the circles.
                haloGraphic.beginFill(color);
                haloGraphic.drawCircle(0, 0, 7.5);
                viewport.addChild(haloGraphic)

                /* First level skills.*/
                // Calculate node spacing.           
                var spacing = 1.5

                // Calculate the radius of the first level of skills.
                //this.firstLevelCircleRadius = (firstLevelSkillsNum * this.firstLevelNodeRadius) / spacing


                // Calculate the spacing and position of the first level skills around a circle path.       
                var x = this.firstLevelCircleRadius * Math.cos(angle);
                var y = this.firstLevelCircleRadius * Math.sin(angle);

                var firstLevelSkillContainer = new PIXI.Container();
                // Position is half the width of canvas plus x, half the height of canvas plus y.
                firstLevelSkillContainer.x = window.innerWidth / 2 + x
                firstLevelSkillContainer.y = window.innerHeight / 2 + y

                // Halo.
                // TODO - correct colours.
                //firstLevelSkillNodeGraphic.lineStyle(6, 0xC8D7DA, 1);

                firstLevelSkillNodeGraphic.beginFill(color);
                firstLevelSkillNodeGraphic.drawCircle(0, 0, this.firstLevelNodeRadius);
                firstLevelSkillNodeGraphic.endFill();

                // Lines connecting the center node with the first level skills.
                const connectingLineGraphic = new PIXI.Graphics();
                connectingLineGraphic.lineStyle(2, color, 1);
                connectingLineGraphic.position.x = firstLevelSkillContainer.x;
                connectingLineGraphic.position.y = firstLevelSkillContainer.y;
                connectingLineGraphic.lineTo(haloGraphic.x - firstLevelSkillContainer.x, haloGraphic.y - firstLevelSkillContainer.y);

                viewport.addChild(connectingLineGraphic);
                // Add the first level skills to the array, for the filter.
                var firstLevelSkillConnectingLine = {
                    graphic: connectingLineGraphic,
                    x: connectingLineGraphic.position.x,
                    y: connectingLineGraphic.position.y,
                    lineToX: haloGraphic.x - firstLevelSkillContainer.x,
                    lineToY: haloGraphic.y - firstLevelSkillContainer.y,
                    tagIDs: []
                }

                // Write the skill names---------------------------------------.
                var fontSize = 60;
                //Working on having a smaller font size, if any one word is too long-------------------.
                // Split name into an array.
                const skillNameArray = userSkill.skill_name.split(" ");
                for (let p = 0; p < skillNameArray.length; p++) {
                    // Check if any of the strings are too long.
                    if (skillNameArray[p].length > 8) {
                        fontSize = 45;
                    }
                }

                // Add line break if skill name is more than one word.
                userSkill.skill_name = userSkill.skill_name.replace(/(.*?\s)/g, '$1' + '\n')
                // Note that the fontSize is 5 times higher than encessary, to deal with pixellation on zoom.
                let firstLevelSkillNodeName = new PIXI.Text(userSkill.skill_name.toUpperCase(),
                    { fontFamily: 'Poppins900', fontSize: fontSize, fill: 0xffffff, align: 'center' });


                // Text to centre of container.
                firstLevelSkillNodeName.anchor.set(0.5)

                // This is to deal with the artificially high fontSize mentioned above.
                firstLevelSkillNodeName.scale.x = 0.2
                firstLevelSkillNodeName.scale.y = 0.2

                // Add the graphic and text to the container.
                firstLevelSkillContainer.addChild(firstLevelSkillNodeGraphic);
                firstLevelSkillContainer.addChild(firstLevelSkillNodeName);

                // Add the first level skills to the viewport.
                viewport.addChild(firstLevelSkillContainer)

                // Create the first level skill object:
                let firstLevelSkill = {
                    id: userSkill.id,
                    isMastered: userSkill.is_mastered,
                    isUnlocked: userSkill.is_accessible,
                    color: color,
                    container: firstLevelSkillContainer,
                    tagIDs: [],
                    name: userSkill.skill_name,
                    description: userSkill.description
                }

                // Add interactivity.        
                // This is added to the graphic and text, and not the container,
                // as it would otherwise effect all the container's child skills.
                firstLevelSkillNodeGraphic.eventMode = 'static';
                firstLevelSkillNodeName.eventMode = 'static';
                firstLevelSkillNodeGraphic.cursor = 'pointer';
                firstLevelSkillNodeName.cursor = 'pointer';
                firstLevelSkillNodeGraphic.on('pointerdown', (event) => {
                    if (!this.isSkillInfoPanelShown)
                        this.showInfoPanel(firstLevelSkill)
                    else
                        this.updateInfoPanel(firstLevelSkill)
                });
                firstLevelSkillNodeName.on('pointerdown', (event) => {
                    if (!this.isSkillInfoPanelShown)
                        this.showInfoPanel(firstLevelSkill)
                    else
                        this.updateInfoPanel(firstLevelSkill)
                });

                // Add the first level skills connecting lines to the array, for the filter.
                this.firstLevelSkillsConnectingLinesArray.push(firstLevelSkillConnectingLine)

                /*
                 * Recursive function to render all descendant nodes.
                 */
                // Creating an object for each skill domain,
                //to store non-sub-skill nodes, to calculate their positions later.                
                let domainObject = { domain: userSkill.skill_name, skills: [] }
                function renderDescendantNodes(parentChildren, parentContainer, depth, context) {
                    // Increase the depth each recursion.
                    depth++

                    // Orbit circles
                    const orbitCircle = new PIXI.Graphics
                    orbitCircle.lineStyle(2, 0xC8D7DA, 0.1);
                    orbitCircle.drawCircle(window.innerWidth / 2, window.innerHeight / 2, 300 * depth);
                    orbitCircle.endFill();
                    viewport.addChild(orbitCircle);

                    // Parameters                    
                    let subNodeDistance = 30
                    var nodeRadius

                    for (let [index, child] of parentChildren.entries()) {
                        let skillObject = {
                            depth: depth,
                            container: null,
                            name: '',
                            id: child.id,
                            parent: child.parent,
                        }

                        let nodeContainer = new PIXI.Container();
                        // Sort the children into subskills and actual child skills.                        
                        let numChildren = 0
                        let numSubSkills = 0
                        for (let i = 0; i < parentChildren.length; i++) {
                            if (parentChildren[i].type != 'sub') {
                                numChildren++
                            }
                            else {
                                numSubSkills++
                            }
                        }

                        /*
                         * If the node is not a subskill,
                         it is added to an array.
                         Its position will be determined later, by its depth level.
                         */
                        if (child.type != 'sub') {
                            nodeRadius = 17
                            skillObject.container = nodeContainer
                            skillObject.name = child.skill_name
                            domainObject.skills.push(skillObject)
                        }
                        // For subskills, they just go around the super skill (360 degrees).
                        else {
                            // Make the subskills smaller.
                            nodeRadius = 10
                            // Calculate the increment of the subskills, around a circle.
                            let increment = 360 / numSubSkills
                            // Get the correct index number, excluding sub skills.
                            let subSkillsIndex = index - numChildren
                            // Calculate the nodes angle.
                            let angle = increment * subSkillsIndex
                            let rads = angle * Math.PI / 180
                            let x = nodeContainer.x + subNodeDistance * Math.cos(rads)
                            let y = nodeContainer.y + subNodeDistance * Math.sin(rads)

                            nodeContainer.x = nodeContainer.x + x
                            nodeContainer.y = nodeContainer.y + y
                        }

                        /*
                         * Draw the nodes
                         */
                        let nodeGraphic = new PIXI.Graphics();
                        // Colour depending on mastery and whether skill is unlocked.
                        var color;
                        if (parentChildren[index].is_mastered == 1) {
                            color = '0x' + userSkill.mastered_color;
                        }
                        else if (parentChildren[index].is_accessible == 1) {
                            nodeGraphic.lineStyle(1, '0x' + userSkill.mastered_color, 1);
                            color = '0x' + userSkill.unlocked_color;
                        }
                        else {
                            color = '0xD9D9D9';
                        }
                        nodeGraphic.beginFill(color);
                        nodeGraphic.drawCircle(0, 0, nodeRadius);
                        // Add components to the container.
                        nodeContainer.addChild(nodeGraphic);

                        /*
                         * Write the skill names.
                         */
                        let fontSize = 40;
                        // Split name into an array.
                        const nodeNameArray = parentChildren[index].skill_name.split(" ");
                        for (let i = 0; i < nodeNameArray.length; i++) {
                            // Check if any of the strings are too long.
                            if (nodeNameArray[i].length > 9) {
                                fontSize = 37;
                            }
                        }

                        // Add line break if skill name is more than one word.
                        parentChildren[index].skill_name = parentChildren[index].skill_name.replace(/(.*?\s)/g, '$1' + '\n')
                        // Note that the fontSize is 5 times higher than encessary, to deal with pixellation on zoom.
                        let nodeName = new PIXI.Text(parentChildren[index].skill_name.toUpperCase(),
                            { fontFamily: 'Poppins900', fontSize: fontSize, fill: 0xffffff, align: 'center' });
                        // Text to centre of container.
                        nodeName.anchor.set(0.5)

                        // This is to deal with the artificially high fontSize mentioned above.
                        nodeName.scale.x = 0.1
                        nodeName.scale.y = 0.1

                        // Add components to the container.                        
                        nodeContainer.addChild(nodeName);

                        // Create the  skill object:
                        let skill = {
                            id: child.id,
                            isMastered: child.is_mastered,
                            isUnlocked: child.is_accessible,
                            color: color,
                            container: nodeContainer,
                            name: child.skill_name,
                            description: child.description,
                        }

                        // Add interactivity.            
                        // This is added to the graphic and text, and not the container,
                        // as it would otherwise effect all the container's child skills.
                        // nodeContainer.eventMode = 'static';
                        //   nodeName.eventMode = 'static';
                        // nodeGraphic.cursor = 'pointer';
                        // nodeName.cursor = 'pointer';
                        // nodeName.on('pointerdown', (event) => {
                        //     if (!context.isSkillInfoPanelShown)
                        //         context.showInfoPanel(skill)
                        //     else
                        //         context.updateInfoPanel(skill)
                        // });
                        // nodeGraphic.on('pointerdown', (event) => {
                        //     if (!context.isSkillInfoPanelShown)
                        //         context.showInfoPanel(skill)
                        //     else
                        //         context.updateInfoPanel(skill)
                        // });

                        if (child.type == 'sub') {
                            // Add the child node to the parent node.
                            parentContainer.addChild(nodeContainer);
                        }

                        /*
                         * Run the above function again recursively.
                         */
                        if (child.children && Array.isArray(child.children) && child.children.length > 0)
                            renderDescendantNodes(child.children, nodeContainer, depth, context)
                    }
                }

                // Run the recursive function.
                // For each first level skill...
                // Pass the child nodes, the container, the angle.
                // The 2 zeros are to begin to tally the sum of all the ancestor position values, for the connecting lines.
                // The other zero is for the depth.
                renderDescendantNodes(userSkill.children, firstLevelSkillContainer, 0, this);

                /*
                 * For the placement of the skill nodes around a circle,
                    in concentric rings by depth.
                 */

                // Here, we find the depth that the skill domain goes.
                let lowestDepth = 0
                for (let i = 0; i < domainObject.skills.length; i++) {
                    if (domainObject.skills[i].depth > lowestDepth) {
                        lowestDepth = domainObject.skills[i].depth
                    }
                }

                // We create an empty array for each level.
                let skillLevelsArray = []
                for (let j = 0; j < lowestDepth; j++) {
                    skillLevelsArray.push([])
                }

                // We populate these arrays with the skills within the domain that are at that relevant depth level.
                for (let i = 0; i < domainObject.skills.length; i++) {
                    for (let j = 0; j < lowestDepth; j++) {
                        if (domainObject.skills[i].depth == j + 1) {
                            skillLevelsArray[j].push(domainObject.skills[i])
                        }
                    }
                }

                domainObject.skillsByDepthLevel = skillLevelsArray
                domainObject.domainX = firstLevelSkillContainer.x
                domainObject.domainY = firstLevelSkillContainer.y
                this.domains.push(domainObject)
            }

            /*
             * Starting to position the skills.
             */
            var xValues = [];
            var yValues = [];

            // Function to rotate the skill nodes.
            // They should be rotated, so as to be in the 60 degree segment for each skill domain.
            function rotate(cx, cy, x, y, angle) {
                var radians = (Math.PI / 180) * angle,
                    cos = Math.cos(radians),
                    sin = Math.sin(radians),
                    nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
                    ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
                return [nx, ny];
            }

            let additionalRadius = 300
            for (var i = 0; i < this.domains.length; i++) {
                if (this.domains[i].skillsByDepthLevel.length > 0) {
                    for (var j = 0; j < this.domains[i].skillsByDepthLevel.length; j++) {
                        for (var k = 0; k < this.domains[i].skillsByDepthLevel[j].length; k++) {
                            var skillsPerDomainPerLevel = this.domains[i].skillsByDepthLevel[j]
                            // Work out the x and y coordinates, using the radius (600) and the number of skills.
                            // Math.PI is divided by 3, as the skills should be arrayed around only one sixth of a circle.
                            // (Math.PI * 2 would be a whole circle.)
                            xValues[k] = (window.innerWidth / 2 + (300 + (additionalRadius * (j + 1))) * Math.cos((Math.PI / 3) * k / skillsPerDomainPerLevel.length));
                            yValues[k] = (window.innerHeight / 2 + (300 + (additionalRadius * (j + 1))) * Math.sin((Math.PI / 3) * k / skillsPerDomainPerLevel.length));
                            // Rotate skills from each domain by 60 degrees (because 360 degrees / 6 domains = 60),
                            // so skills are in the correct segment for their domain.
                            var coords = []
                            coords = rotate(window.innerWidth / 2, window.innerHeight / 2, xValues[k], yValues[k], i * -60)

                            // Once all the skills have been roated to fit in their domain segment,
                            // They then need to be offset (if there is more than one per level).
                            // This is because otehrwise, they will start the 0 position (same angle as the domain parent),
                            // and then space along the circle. The need rather to have the center of the group of skills 
                            // have the 0 angle (same angle as the domain parent).

                            var coords2 = []
                            var angle
                            angle = 30
                            var offset = 0
                            offset = 30 / skillsPerDomainPerLevel.length
                            angle = angle - offset
                            coords2 = rotate(window.innerWidth / 2, window.innerHeight / 2, coords[0], coords[1], angle)
                            // Apply the x and y coordinates to the PIXI containers.
                            if (skillsPerDomainPerLevel.length > 1) {
                                skillsPerDomainPerLevel[k].container.x = coords2[0]
                                skillsPerDomainPerLevel[k].container.y = coords2[1]
                            }
                            // If there is only one skill in the level for the domain, no offset is needed.
                            else {
                                skillsPerDomainPerLevel[k].container.x = coords[0]
                                skillsPerDomainPerLevel[k].container.y = coords[1]
                            }

                            // Add to the PIXI viewport.
                            viewport.addChild(skillsPerDomainPerLevel[k].container);
                        }
                    }
                }
            }

            // Connecting lines.
            for (var i = 0; i < this.domains.length; i++) {
                if (this.domains[i].skillsByDepthLevel.length > 0) {
                    for (var j = 0; j < this.domains[i].skillsByDepthLevel.length; j++) {
                        //console.log(this.domains[i].skillsByDepthLevel[j])
                        for (var k = 0; k < this.domains[i].skillsByDepthLevel[j].length; k++) {
                            var skillsPerDomainPerLevel = this.domains[i].skillsByDepthLevel[j]
                            // Find the parent coordinates.
                            var parentId = skillsPerDomainPerLevel[k].parent
                            var parentX
                            var parentY

                            // Make the first level skill connecting lines start from the domain node locations.
                            if (j == 0) {
                                parentX = this.domains[i].domainX
                                parentY = this.domains[i].domainY
                            }
                            // Look for the skill parents.
                            for (var l = 0; l < this.domains[i].skills.length; l++) {
                                if (this.domains[i].skills[l].id == parentId) {
                                    parentX = this.domains[i].skills[l].container.x
                                    parentY = this.domains[i].skills[l].container.y
                                }
                            }

                            /*
                            * Connecting lines.
                            */
                            const connectingLine = new PIXI.Graphics();
                            connectingLine.lineStyle(4, color, 1);
                            connectingLine.moveTo(parentX, parentY)
                            connectingLine.lineTo(skillsPerDomainPerLevel[k].container.x, skillsPerDomainPerLevel[k].container.y);
                            // Put the connecting line behind the skill nodes.
                            connectingLine.zIndex = -1
                            viewport.addChild(connectingLine);
                        }
                    }
                }
            }


        }, () => {
            // Failed load, log the error or display a message to the user
            console.log('Unable to load required font!');
        });

    },
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