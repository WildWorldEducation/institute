<script>
import router from "../../router";

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
            firstLevelCircleRadius: 200,
            secondLevelNodeDistance: 300,
            thirdLevelNodeDistance: 300,
            fourthLevelNodeDistance: 300,
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
            isSkillInfoPanelShown: false
        }
    },
    computed: {
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
                    //backgroundColor: 0xffffff
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
                //   console.log("theta " + theta)
                var angle = (theta * i);
                //   console.log("angle " + angle * 60)

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

                // Add the appropriate tags to the skill node and connecting line, for the filters.
                for (let j = 0; j < this.skillTagsStore.skillTagsList.length; j++) {
                    if (firstLevelSkill.id == this.skillTagsStore.skillTagsList[j].skill_id) {
                        firstLevelSkill.tagIDs.push(this.skillTagsStore.skillTagsList[j].tag_id)
                        firstLevelSkillConnectingLine.tagIDs.push(this.skillTagsStore.skillTagsList[j].tag_id)
                    }
                }

                // Add the first level skills to the array, for the filter.
                this.firstLevelSkillsArray.push(firstLevelSkill)
                // Add the first level skills connecting lines to the array, for the filter.
                this.firstLevelSkillsConnectingLinesArray.push(firstLevelSkillConnectingLine)

                /*
                 * Recursive function to render all descendant nodes.
                 */

                function renderDescendantNodes(userSkillChildren, parentContainer, parentAngle) {
                    for (let [index, child] of userSkillChildren.entries()) {
                        // console.log(child)

                        let nodeContainer = new PIXI.Container();
                        let nodeDistance = 200
                        let subNodeDistance = 75
                        let nodeRadius = 17

                        // Sort the children into subskills and actual child skills.                        
                        let numChildren = 0
                        let numSubSkills = 0
                        for (let i = 0; i < userSkillChildren.length; i++) {
                            if (userSkillChildren[i].is_sub_skill == 0) {
                                numChildren++
                            }
                            else {
                                numSubSkills++
                            }
                        }

                        /*
                         * The angle of the node from its parent.
                         */
                        let nodeAngle = 0;
                        if (child.is_sub_skill == 0) {
                            // Working out the placement of the nodes, in relation to their parent.

                            // Work out the increment.
                            // 90 degrees is the total range outwards the tree angles can go,
                            // from the previous node.
                            let increment = 90 / numChildren

                            // Get the correct index number, excluding sub skills.
                            let mainSkillsIndex = index - numSubSkills
                            // Work out each chind node angle, based on the parent angle, and the increment, and which child it is.
                            nodeAngle = parentAngle + increment * mainSkillsIndex

                            // This is the placement of the first of the child nodes.
                            // We have to change the angle so that the child nodes dont start incrememting
                            // from the parent node angle.
                            nodeAngle = nodeAngle - 45 + (45 / numChildren)

                            let rads = nodeAngle * Math.PI / 180
                            let x = nodeContainer.x + nodeDistance * Math.cos(rads)
                            let y = nodeContainer.y + nodeDistance * Math.sin(rads)

                            nodeContainer.x = nodeContainer.x + x
                            nodeContainer.y = nodeContainer.y + y
                        }
                        // For subskills, they just go around the super skill (360 degrees).
                        else {
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
                        if (userSkillChildren[index].is_mastered == 1) {
                            color = '0x' + userSkill.mastered_color;
                        }
                        else if (userSkillChildren[index].is_accessible == 1) {
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

                        // Make the second-level skill a child of the first-level skill.
                        parentContainer.addChild(nodeContainer);

                        /*
                         * Connecting lines.
                         */
                        const connectingLine = new PIXI.Graphics();
                        connectingLine.lineStyle(2, color, 1);
                        // Need to make this recursive maybe?                                                
                        // First x and y values to add are for second level skills, then next is for thrird, etc
                        connectingLine.position.x = parentContainer.x + parentContainer.parent.x + parentContainer.parent.parent.x
                        connectingLine.position.y = parentContainer.y + parentContainer.parent.y + parentContainer.parent.parent.y
                        connectingLine.lineTo(nodeContainer.x, nodeContainer.y);
                        // Put the connecting line behind the skill nodes.
                        connectingLine.zIndex = -1
                        viewport.addChild(connectingLine);


                        /*
                         * Run the above function again recursively.
                         */
                        if (child.children && Array.isArray(child.children) && child.children.length > 0)
                            renderDescendantNodes(child.children, nodeContainer, nodeAngle)
                    }
                }

                renderDescendantNodes(userSkill.children, firstLevelSkillContainer, angle * 60);

                /* Second level skills.*/
                // for (let j = 0; j < userSkill.children.length; j++) {
                //     var secondLevelSkillContainer = new PIXI.Container();

                //     // Working out the placement of the nodes, in relation to their parent.
                //     // They need to spread outwards, like a tree.
                //     // Currently, if there is one child, the angle will copy that of the parent,
                //     // If there are 2 children, there will be and offset of 45 degrees.
                //     // The offset changes the more nodes there are.
                //     var increment = 90 / userSkill.children.length

                //     // The parent skill's angle.
                //     var startAngle = (angle * 60)

                //     // This is the placement of the first of the child nodes.
                //     startAngle = startAngle - 45 + (45 / userSkill.children.length)
                //     // Each child node is then placed.
                //     var newAngle = startAngle + increment * j

                //     var rads = newAngle * Math.PI / 180
                //     var x = secondLevelSkillContainer.x + this.secondLevelNodeDistance * Math.cos(rads)
                //     var y = secondLevelSkillContainer.y + this.secondLevelNodeDistance * Math.sin(rads)

                //     secondLevelSkillContainer.x = secondLevelSkillContainer.x + x
                //     secondLevelSkillContainer.y = secondLevelSkillContainer.y + y
                //     // -----------------------------------------------


                //     // Draw the circles.
                //     let secondLevelSkillNodeGraphic = new PIXI.Graphics();
                //     // Colour depending on mastery and whether skill is unlocked.
                //     var color;
                //     if (userSkill.children[j].is_mastered == 1) {
                //         color = '0x' + userSkill.mastered_color;
                //     }
                //     else if (userSkill.children[j].is_accessible == 1) {
                //         secondLevelSkillNodeGraphic.lineStyle(1, '0x' + userSkill.mastered_color, 1);
                //         color = '0x' + userSkill.unlocked_color;
                //     }
                //     else {
                //         color = '0xD9D9D9';
                //     }
                //     secondLevelSkillNodeGraphic.beginFill(color);
                //     secondLevelSkillNodeGraphic.drawCircle(0, 0, this.otherLevelNodeRadius);

                //     // Write the skill names. ---------------------------------
                //     fontSize = 40;
                //     //Working on having a smaller font size, if any one word is too long-------------------.
                //     // Split name into an array.
                //     const skillNameArray = userSkill.children[j].skill_name.split(" ");
                //     for (let p = 0; p < skillNameArray.length; p++) {
                //         // Check if any of the strings are too long.
                //         if (skillNameArray[p].length > 9) {
                //             fontSize = 37;
                //         }
                //     }

                //     // Add line break if skill name is more than one word.
                //     userSkill.children[j].skill_name = userSkill.children[j].skill_name.replace(/(.*?\s)/g, '$1' + '\n')
                //     // Note that the fontSize is 5 times higher than encessary, to deal with pixellation on zoom.
                //     let secondLevelSkillNodeName = new PIXI.Text(userSkill.children[j].skill_name.toUpperCase(),
                //         { fontFamily: 'Poppins900', fontSize: fontSize, fill: 0xffffff, align: 'center' });
                //     // Text to centre of container.
                //     secondLevelSkillNodeName.anchor.set(0.5)

                //     // This is to deal with the artificially high fontSize mentioned above.
                //     secondLevelSkillNodeName.scale.x = 0.1
                //     secondLevelSkillNodeName.scale.y = 0.1

                //     // Add components to the container.
                //     secondLevelSkillContainer.addChild(secondLevelSkillNodeGraphic);
                //     secondLevelSkillContainer.addChild(secondLevelSkillNodeName);

                //     // Make the second-level skill a child of the first-level skill.
                //     firstLevelSkillContainer.addChild(secondLevelSkillContainer);

                //     // Create the second level skill object:
                //     let secondLevelSkill = {
                //         id: userSkill.children[j].id,
                //         isMastered: userSkill.children[j].is_mastered,
                //         isUnlocked: userSkill.children[j].is_accessible,
                //         isParentMastered: userSkill.is_mastered,
                //         isParentUnlocked: userSkill.is_accessible,
                //         color: color,
                //         container: secondLevelSkillContainer,
                //         name: userSkill.children[j].skill_name,
                //         description: userSkill.children[j].description,
                //         tagIDs: [],
                //         parentTagIDs: firstLevelSkill.tagIDs,
                //         angle: newAngle
                //     }

                //     // Add interactivity.            
                //     // This is added to the graphic and text, and not the container,
                //     // as it would otherwise effect all the container's child skills.
                //     secondLevelSkillNodeGraphic.eventMode = 'static';
                //     secondLevelSkillNodeName.eventMode = 'static';
                //     secondLevelSkillNodeGraphic.cursor = 'pointer';
                //     secondLevelSkillNodeName.cursor = 'pointer';
                //     secondLevelSkillNodeName.on('pointerdown', (event) => {
                //         if (!this.isSkillInfoPanelShown)
                //             this.showInfoPanel(secondLevelSkill)
                //         else
                //             this.updateInfoPanel(secondLevelSkill)
                //     });
                //     secondLevelSkillNodeGraphic.on('pointerdown', (event) => {
                //         if (!this.isSkillInfoPanelShown)
                //             this.showInfoPanel(secondLevelSkill)
                //         else
                //             this.updateInfoPanel(secondLevelSkill)
                //     });

                //     // Add the appropriate tags to the skill node, for the filters.
                //     for (let j = 0; j < this.skillTagsStore.skillTagsList.length; j++) {
                //         if (secondLevelSkill.id == this.skillTagsStore.skillTagsList[j].skill_id) {
                //             secondLevelSkill.tagIDs.push(this.skillTagsStore.skillTagsList[j].tag_id)
                //         }
                //     }

                //     // Connecting lines.
                //     const connectingLine = new PIXI.Graphics();
                //     connectingLine.lineStyle(2, color, 1);
                //     connectingLine.position.x = firstLevelSkillContainer.x;
                //     connectingLine.position.y = firstLevelSkillContainer.y;
                //     connectingLine.lineTo(secondLevelSkillContainer.x, secondLevelSkillContainer.y);
                //     // Put the connecting line behind the skill nodes.
                //     connectingLine.zIndex = -1
                //     viewport.addChild(connectingLine);

                //     this.secondLevelSkillsConnectingLinesArray.push(connectingLine)
                //     // We add the second level skills to this array, as their position is independant of the 
                //     // first level skills.
                //     this.secondLevelSkillsArray.push(secondLevelSkill);

                //     /* Third level skills.*/
                //     for (let k = 0; k < userSkill.children[j].children.length; k++) {
                //         var thirdLevelSkillContainer = new PIXI.Container();
                //         // The parent skill's angle.
                //         var startAngle = secondLevelSkill.angle
                //         // This is the placement of the first of the child nodes.
                //         startAngle = startAngle - 45 + (45 / userSkill.children[j].children.length)
                //         // If not a sub skill, nodes go around 90 degrees forward.
                //         // The distance is further.
                //         if (userSkill.children[j].children[k].is_sub_skill == 0) {
                //             // Working out the placement of the nodes, in relation to their parent.
                //             // They need to spread outwards, like a tree.
                //             // Currently, if there is one child, the angle will copy that of the parent,
                //             // If there are 2 children, there will be and offset of 45 degrees.
                //             // The offset changes the more nodes there are.
                //             var increment = 90 / userSkill.children[j].children.length
                //             // Each child node is then placed.
                //             var newAngle = startAngle + increment * k
                //             var rads = newAngle * Math.PI / 180
                //             var x = thirdLevelSkillContainer.x + this.thirdLevelNodeDistance * Math.cos(rads)
                //             var y = thirdLevelSkillContainer.y + this.thirdLevelNodeDistance * Math.sin(rads)
                //         }
                //         // If is a subskill, the nodes go around 30 degrees
                //         // The distance is nearer.
                //         else {
                //             var increment = 360 / userSkill.children[j].children.length
                //             // Each child node is then placed.
                //             var newAngle = startAngle + increment * k
                //             var rads = newAngle * Math.PI / 180
                //             var x = thirdLevelSkillContainer.x + this.subSkillDistance * Math.cos(rads)
                //             var y = thirdLevelSkillContainer.y + this.subSkillDistance * Math.sin(rads)
                //         }

                //         thirdLevelSkillContainer.x = thirdLevelSkillContainer.x + x
                //         thirdLevelSkillContainer.y = thirdLevelSkillContainer.y + y

                //         // ---------------------------------------------------

                //         // Draw the circles.
                //         let thirdLevelSkillNodeGraphic = new PIXI.Graphics();
                //         // Colour depending on mastery and whether skill is unlocked.
                //         var color;
                //         if (userSkill.children[j].children[k].is_mastered == 1) {
                //             color = '0x' + userSkill.mastered_color;
                //         }
                //         else if (userSkill.children[j].children[k].is_accessible == 1) {
                //             color = '0x' + userSkill.unlocked_color;
                //             thirdLevelSkillNodeGraphic.lineStyle(1, '0x' + userSkill.mastered_color, 1);
                //         }
                //         else {
                //             color = '0xD9D9D9';
                //         }
                //         thirdLevelSkillNodeGraphic.beginFill(color);
                //         thirdLevelSkillNodeGraphic.drawCircle(0, 0, this.otherLevelNodeRadius);

                //         // Write the skill names. ---------------------------------
                //         fontSize = 40;
                //         //Working on having a smaller font size, if any one word is too long-------------------.
                //         // Split name into an array.
                //         const skillNameArray = userSkill.children[j].children[k].skill_name.split(" ");
                //         for (let p = 0; p < skillNameArray.length; p++) {
                //             // Check if any of the strings are too long.
                //             if (skillNameArray[p].length > 9) {
                //                 fontSize = 37;
                //             }
                //         }

                //         // Add line break if skill name is more than one word.
                //         userSkill.children[j].children[k].skill_name = userSkill.children[j].children[k].skill_name.replace(/(.*?\s)/g, '$1' + '\n')
                //         // Note that the fontSize is 5 times higher than encessary, to deal with pixellation on zoom.
                //         let thirdLevelSkillNodeName = new PIXI.Text(userSkill.children[j].children[k].skill_name.toUpperCase(),
                //             { fontFamily: 'Poppins900', fontSize: fontSize, fill: 0xffffff, align: 'center' });
                //         // Text to centre of container.
                //         thirdLevelSkillNodeName.anchor.set(0.5)

                //         // This is to deal with the artificially high fontSize mentioned above.
                //         thirdLevelSkillNodeName.scale.x = 0.1
                //         thirdLevelSkillNodeName.scale.y = 0.1

                //         // Add component to the container.
                //         thirdLevelSkillContainer.addChild(thirdLevelSkillNodeGraphic);
                //         thirdLevelSkillContainer.addChild(thirdLevelSkillNodeName);
                //         // We make the node a child of the second level skill.
                //         secondLevelSkillContainer.addChild(thirdLevelSkillContainer);

                //         // Create the third level skill object:
                //         let thirdLevelSkill = {
                //             id: userSkill.children[j].children[k].id,
                //             isMastered: userSkill.children[j].children[k].is_mastered,
                //             isUnlocked: userSkill.children[j].children[k].is_accessible,
                //             isParentMastered: userSkill.children[j].is_mastered,
                //             isParentUnlocked: userSkill.children[j].is_accessible,
                //             color: color,
                //             container: thirdLevelSkillContainer,
                //             name: userSkill.children[j].children[k].skill_name,
                //             description: userSkill.children[j].children[k].description,
                //             tagIDs: [],
                //             parentTagIDs: secondLevelSkill.tagIDs,
                //             angle: newAngle
                //         }

                //         // Add interactivity.     
                //         // This is added to the graphic, and not the container,
                //         // as it would otherwise effect all the container's child skills.       
                //         thirdLevelSkillNodeGraphic.eventMode = 'static';
                //         thirdLevelSkillNodeGraphic.cursor = 'pointer';
                //         thirdLevelSkillNodeGraphic.on('pointerdown', (event) => {
                //             if (!this.isSkillInfoPanelShown)
                //                 this.showInfoPanel(thirdLevelSkill)
                //             else
                //                 this.updateInfoPanel(thirdLevelSkill)
                //         });

                //         // Add the appropriate tags to the skill node, for the filters.
                //         for (let j = 0; j < this.skillTagsStore.skillTagsList.length; j++) {
                //             if (thirdLevelSkill.id == this.skillTagsStore.skillTagsList[j].skill_id) {
                //                 thirdLevelSkill.tagIDs.push(this.skillTagsStore.skillTagsList[j].tag_id)
                //             }
                //         }

                //         // Connecting lines.
                //         const connectingLine = new PIXI.Graphics();
                //         connectingLine.lineStyle(2, color, 1);
                //         connectingLine.position.x = firstLevelSkillContainer.x + secondLevelSkillContainer.x;
                //         connectingLine.position.y = firstLevelSkillContainer.y + secondLevelSkillContainer.y;
                //         connectingLine.lineTo(thirdLevelSkillContainer.x, thirdLevelSkillContainer.y);
                //         // Put the connecting line behind the skill nodes.
                //         connectingLine.zIndex = -1
                //         viewport.addChild(connectingLine);

                //         this.thirdLevelSkillsConnectingLinesArray.push(connectingLine)
                //         // We add the third level skills to this array, as their position is independant of the 
                //         // first second skills.
                //         this.thirdLevelSkillsArray.push(thirdLevelSkill);


                //         /* Fourth level skills.*/
                //         for (let l = 0; l < userSkill.children[j].children[k].children.length; l++) {
                //             var fourthLevelSkillContainer = new PIXI.Container();

                //             // Sort the children into subskills and actual child skills.
                //             let parentSkill = userSkill.children[j].children[k]
                //             let numChildren = 0
                //             let numSubSkills = 0
                //             for (let i = 0; i < parentSkill.children.length; i++) {
                //                 if (parentSkill.children[i].is_sub_skill == 0) {
                //                     numChildren++
                //                 }
                //                 else {
                //                     numSubSkills++
                //                 }
                //             }

                //             // The parent skill's angle.
                //             var startAngle = thirdLevelSkill.angle
                //             // This is the placement of the first of the child nodes.
                //             startAngle = startAngle - 45 + (45 / numChildren)

                //             // If not a sub skill, nodes go around 90 degrees forward.
                //             // The distance is further.
                //             if (userSkill.children[j].children[k].children[l].is_sub_skill == 0) {
                //                 // Working out the placement of the nodes, in relation to their parent.
                //                 // They need to spread outwards, like a tree.
                //                 // Currently, if there is one child, the angle will copy that of the parent,
                //                 // If there are 2 children, there will be and offset of 45 degrees.
                //                 // The offset changes the more nodes there are.
                //                 //var increment = 90 / userSkill.children[j].children[k].children.length
                //                 var increment = 90 / numChildren
                //                 //console.log(increment)
                //                 // Each child node is then placed.
                //                 var newAngle = startAngle + increment * l
                //                 //console.log(newAngle)

                //                 var rads = newAngle * Math.PI / 180
                //                 var x = fourthLevelSkillContainer.x + this.fourthLevelNodeDistance * Math.cos(rads)
                //                 var y = fourthLevelSkillContainer.y + this.fourthLevelNodeDistance * Math.sin(rads)
                //             }
                //             // If is a subskill, the nodes go around 30 degrees
                //             // The distance is nearer.
                //             else {
                //                 var increment = 360 / numSubSkills
                //                 // Each child node is then placed.
                //                 var angle = increment * l
                //                 var rads = angle * Math.PI / 180
                //                 var x = fourthLevelSkillContainer.x + this.subSkillDistance * Math.cos(rads)
                //                 var y = fourthLevelSkillContainer.y + this.subSkillDistance * Math.sin(rads)
                //             }

                //             fourthLevelSkillContainer.x = fourthLevelSkillContainer.x + x
                //             fourthLevelSkillContainer.y = fourthLevelSkillContainer.y + y

                //             // ---------------------------------------------------

                //             // Draw the circles.
                //             let fourthLevelSkillNodeGraphic = new PIXI.Graphics();
                //             // Colour depending on mastery and whether skill is unlocked.
                //             var color;
                //             if (userSkill.children[j].children[k].children[l].is_mastered == 1) {
                //                 color = '0x' + userSkill.mastered_color;
                //             }
                //             else if (userSkill.children[j].children[k].children[l].is_accessible == 1) {
                //                 color = '0x' + userSkill.unlocked_color;
                //                 fourthLevelSkillNodeGraphic.lineStyle(1, '0x' + userSkill.mastered_color, 1);
                //             }
                //             else {
                //                 color = '0xD9D9D9';
                //             }
                //             fourthLevelSkillNodeGraphic.beginFill(color);
                //             fourthLevelSkillNodeGraphic.drawCircle(0, 0, this.otherLevelNodeRadius);

                //             // Write the skill names. ---------------------------------
                //             fontSize = 40;
                //             //Working on having a smaller font size, if any one word is too long-------------------.
                //             // Split name into an array.
                //             const skillNameArray = userSkill.children[j].children[k].children[l].skill_name.split(" ");
                //             for (let p = 0; p < skillNameArray.length; p++) {
                //                 // Check if any of the strings are too long.
                //                 if (skillNameArray[p].length > 9) {
                //                     fontSize = 37;
                //                 }
                //             }

                //             // Add line break if skill name is more than one word.
                //             userSkill.children[j].children[k].children[l].skill_name = userSkill.children[j].children[k].children[l].skill_name.replace(/(.*?\s)/g, '$1' + '\n')
                //             // Note that the fontSize is 5 times higher than encessary, to deal with pixellation on zoom.
                //             let fourthLevelSkillNodeName = new PIXI.Text(userSkill.children[j].children[k].children[l].skill_name.toUpperCase(),
                //                 { fontFamily: 'Poppins900', fontSize: fontSize, fill: 0xffffff, align: 'center' });
                //             // Text to centre of container.
                //             fourthLevelSkillNodeName.anchor.set(0.5)

                //             // This is to deal with the artificially high fontSize mentioned above.
                //             fourthLevelSkillNodeName.scale.x = 0.1
                //             fourthLevelSkillNodeName.scale.y = 0.1

                //             // Add components to the container.
                //             fourthLevelSkillContainer.addChild(fourthLevelSkillNodeGraphic);
                //             fourthLevelSkillContainer.addChild(fourthLevelSkillNodeName);
                //             // We make the node a child of the third level skill.
                //             thirdLevelSkillContainer.addChild(fourthLevelSkillContainer);

                //             // Create the fourth level skill object:
                //             let fourthLevelSkill = {
                //                 id: userSkill.children[j].children[k].children[l].id,
                //                 isMastered: userSkill.children[j].children[k].children[l].is_mastered,
                //                 isUnlocked: userSkill.children[j].children[k].children[l].is_accessible,
                //                 color: color,
                //                 container: fourthLevelSkillContainer,
                //                 name: userSkill.children[j].children[k].children[l].skill_name,
                //                 description: userSkill.children[j].children[k].children[l].description,
                //                 tagIDs: [],
                //                 parentTagIDs: thirdLevelSkill.tagIDs
                //             }

                //             // Add interactivity.     
                //             // This is added to the graphic, and not the container,
                //             // as it would otherwise effect all the container's child skills.       
                //             fourthLevelSkillNodeGraphic.eventMode = 'static';
                //             fourthLevelSkillNodeGraphic.cursor = 'pointer';
                //             fourthLevelSkillNodeGraphic.on('pointerdown', (event) => {
                //                 if (!this.isSkillInfoPanelShown)
                //                     this.showInfoPanel(fourthLevelSkill)
                //                 else
                //                     this.updateInfoPanel(fourthLevelSkill)
                //             });

                //             // Add the appropriate tags to the skill node, for the filters.
                //             for (let j = 0; j < this.skillTagsStore.skillTagsList.length; j++) {
                //                 if (fourthLevelSkill.id == this.skillTagsStore.skillTagsList[j].skill_id) {
                //                     fourthLevelSkill.tagIDs.push(this.skillTagsStore.skillTagsList[j].tag_id)
                //                 }
                //             }

                //             // Connecting lines.
                //             const connectingLine = new PIXI.Graphics();
                //             connectingLine.lineStyle(2, color, 1);
                //             connectingLine.position.x = firstLevelSkillContainer.x + secondLevelSkillContainer.x + thirdLevelSkillContainer.x;
                //             connectingLine.position.y = firstLevelSkillContainer.y + secondLevelSkillContainer.y + thirdLevelSkillContainer.y;
                //             connectingLine.lineTo(fourthLevelSkillContainer.x, fourthLevelSkillContainer.y);
                //             // Put the connecting line behind the skill nodes.
                //             connectingLine.zIndex = -1
                //             viewport.addChild(connectingLine);

                //             this.fourthLevelSkillsConnectingLinesArray.push(connectingLine)

                //             // We add the fourth level skills to this array, as their position is independant of the 
                //             // first second skills.
                //             this.fourthLevelSkillsArray.push(fourthLevelSkill);
                //         }
                //     }
                // }
            }
        }, () => {
            // Failed load, log the error or display a message to the user
            console.log('Unable to load required font!');
        });
    },
    methods: {
        // Display everything.
        clearFilter() {
            // Cycle through nodes.
            // First level skill nodes.
            for (let i = 0; i < this.firstLevelSkillsArray.length; i++) {
                // First level node graphic.
                this.firstLevelSkillsArray[i].container.children[0].alpha = 1
                this.firstLevelSkillsArray[i].container.children[0].eventMode = "static"
                // First level node text.
                this.firstLevelSkillsArray[i].container.children[1].alpha = 1;
                this.firstLevelSkillsArray[i].container.children[1].eventMode = "static"
                // First level connecting lines.
                this.firstLevelSkillsConnectingLinesArray[i].graphic.alpha = 1
            }
            // Second level skills.                    
            for (let i = 0; i < this.secondLevelSkillsArray.length; i++) {
                // Graphic.
                this.secondLevelSkillsArray[i].container.children[0].alpha = 1
                this.secondLevelSkillsArray[i].container.children[0].eventMode = "static"
                // Text.
                this.secondLevelSkillsArray[i].container.children[1].alpha = 1
                this.secondLevelSkillsArray[i].container.children[1].eventMode = "static"
                // Second level connecting lines.
                this.secondLevelSkillsConnectingLinesArray[i].alpha = 1
            }
            // Third level skills.                    
            for (let i = 0; i < this.thirdLevelSkillsArray.length; i++) {
                // Graphic.
                this.thirdLevelSkillsArray[i].container.children[0].alpha = 1
                this.thirdLevelSkillsArray[i].container.children[0].eventMode = "static"
                // Text.
                this.thirdLevelSkillsArray[i].container.children[1].alpha = 1
                this.thirdLevelSkillsArray[i].container.children[1].eventMode = "static"
                // Connecting lines.
                this.thirdLevelSkillsConnectingLinesArray[i].alpha = 1
            }
            // Fourth level skills.                    
            for (let i = 0; i < this.fourthLevelSkillsArray.length; i++) {
                // Graphic.
                this.fourthLevelSkillsArray[i].container.children[0].alpha = 1
                this.fourthLevelSkillsArray[i].container.children[0].eventMode = "static"
                // Text.
                this.fourthLevelSkillsArray[i].container.children[1].alpha = 1
                this.fourthLevelSkillsArray[i].container.children[1].eventMode = "static"
                // Connecting lines.
                this.fourthLevelSkillsConnectingLinesArray[i].alpha = 1
            }
        },

        // Hide everything.
        totalFilter() {
            // Cycle through nodes.
            // First level skill nodes.
            for (let i = 0; i < this.firstLevelSkillsArray.length; i++) {
                // First level node graphic.
                this.firstLevelSkillsArray[i].container.children[0].alpha = 0
                this.firstLevelSkillsArray[i].container.children[0].eventMode = "none"
                // First level node text.
                this.firstLevelSkillsArray[i].container.children[1].alpha = 0;
                this.firstLevelSkillsArray[i].container.children[1].eventMode = "none"
                // First level connecting lines.
                this.firstLevelSkillsConnectingLinesArray[i].graphic.alpha = 0
            }
            // Second level skills.                    
            for (let i = 0; i < this.secondLevelSkillsArray.length; i++) {
                // Graphic.
                this.secondLevelSkillsArray[i].container.children[0].alpha = 0
                this.secondLevelSkillsArray[i].container.children[0].eventMode = "none"
                // Text.
                this.secondLevelSkillsArray[i].container.children[1].alpha = 0
                this.secondLevelSkillsArray[i].container.children[1].eventMode = "none"
                // Second level connecting lines.
                this.secondLevelSkillsConnectingLinesArray[i].alpha = 0
            }
            // Third level skills.                    
            for (let i = 0; i < this.thirdLevelSkillsArray.length; i++) {
                // Graphic.
                this.thirdLevelSkillsArray[i].container.children[0].alpha = 0
                this.thirdLevelSkillsArray[i].container.children[0].eventMode = "none"
                // Text.
                this.thirdLevelSkillsArray[i].container.children[1].alpha = 0
                this.thirdLevelSkillsArray[i].container.children[1].eventMode = "none"
                // Connecting lines.
                this.thirdLevelSkillsConnectingLinesArray[i].alpha = 0
            }
            // Fourth level skills.                    
            for (let i = 0; i < this.fourthLevelSkillsArray.length; i++) {
                // Graphic.
                this.fourthLevelSkillsArray[i].container.children[0].alpha = 0
                this.fourthLevelSkillsArray[i].container.children[0].eventMode = "none"
                // Text.
                this.fourthLevelSkillsArray[i].container.children[1].alpha = 0
                this.fourthLevelSkillsArray[i].container.children[1].eventMode = "none"
                // Connecting lines.
                this.fourthLevelSkillsConnectingLinesArray[i].alpha = 0
            }
        },

        // Fired from the child component select element.
        applyFilter(selectedFilters) {

            this.totalFilter()

            // Clear filter and show all skills.
            if (selectedFilters.length == 0) {
                this.clearFilter()
            }
            // For the built in filter, to show mastered and unlocked skills.
            else {
                for (let i = 0; i < selectedFilters.length; i++) {
                    if (selectedFilters[i] == 0) {
                        // First level skills.                     
                        for (let i = 0; i < this.firstLevelSkillsArray.length; i++) {
                            // Filter through user skills.
                            if (this.firstLevelSkillsArray[i].isMastered == "1" || this.firstLevelSkillsArray[i].isUnlocked == "1") {
                                // Clear the graphic.
                                this.firstLevelSkillsArray[i].container.children[0].alpha = 1;
                                this.firstLevelSkillsArray[i].container.children[0].eventMode = "static"
                                this.firstLevelSkillsArray[i].container.children[1].alpha = 1;
                                this.firstLevelSkillsArray[i].container.children[1].eventMode = "static"
                                // For the connecting lines.                       
                                this.firstLevelSkillsConnectingLinesArray[i].graphic.alpha = 1
                            }
                        }
                        // Second level skills.                    
                        for (let i = 0; i < this.secondLevelSkillsArray.length; i++) {
                            if (this.secondLevelSkillsArray[i].isMastered == "1" || this.secondLevelSkillsArray[i].isUnlocked == "1") {
                                // Clear the graphic and redraw in appropriate colour.
                                this.secondLevelSkillsArray[i].container.children[0].alpha = 1
                                this.secondLevelSkillsArray[i].container.children[0].eventMode = "static"
                                this.secondLevelSkillsArray[i].container.children[1].alpha = 1
                                this.secondLevelSkillsArray[i].container.children[1].eventMode = "static"
                                // For the connecting lines.                            
                                this.secondLevelSkillsConnectingLinesArray[i].alpha = 1
                            }
                        }
                        // Third level skills.                    
                        for (let i = 0; i < this.thirdLevelSkillsArray.length; i++) {
                            if (this.thirdLevelSkillsArray[i].isMastered == "1" || this.thirdLevelSkillsArray[i].isUnlocked == "1") {
                                // Clear the graphic and redraw in appropriate colour.
                                this.thirdLevelSkillsArray[i].container.children[0].alpha = 1
                                this.thirdLevelSkillsArray[i].container.children[0].eventMode = "static"
                                this.thirdLevelSkillsArray[i].container.children[1].alpha = 1
                                this.thirdLevelSkillsArray[i].container.children[1].eventMode = "static"
                                // For the connecting lines.                            
                                this.thirdLevelSkillsConnectingLinesArray[i].alpha = 1
                            }
                        }
                        // Fourth level skills.                    
                        for (let i = 0; i < this.fourthLevelSkillsArray.length; i++) {
                            if (this.fourthLevelSkillsArray[i].isMastered == "1" || this.fourthLevelSkillsArray[i].isUnlocked == "1") {
                                // Clear the graphic and redraw in appropriate colour.
                                this.fourthLevelSkillsArray[i].container.children[0].alpha = 1
                                this.fourthLevelSkillsArray[i].container.children[0].eventMode = "static"
                                this.fourthLevelSkillsArray[i].container.children[1].alpha = 1
                                this.fourthLevelSkillsArray[i].container.children[1].eventMode = "static"
                                // For the connecting lines.                            
                                this.fourthLevelSkillsConnectingLinesArray[i].alpha = 1
                            }
                        }
                    }
                }

                // Custom filters.

                // Check all first level skill nodes.
                for (let i = 0; i < this.firstLevelSkillsArray.length; i++) {
                    // Check if the skill has a tag.
                    if (this.firstLevelSkillsArray[i].tagIDs.length > 0) {
                        // Cycle through all of the tags the skill has.
                        for (let j = 0; j < this.firstLevelSkillsArray[i].tagIDs.length; j++) {
                            // Cycle through all the selected tag filters.
                            for (let k = 0; k < selectedFilters.length; k++) {
                                // Check if the selected tag is one of them.
                                if (this.firstLevelSkillsArray[i].tagIDs[j] == selectedFilters[k]) {
                                    // Add and enable the graphic and text.
                                    this.firstLevelSkillsArray[i].container.children[0].alpha = 1;
                                    this.firstLevelSkillsArray[i].container.children[0].eventMode = "static"
                                    this.firstLevelSkillsArray[i].container.children[1].alpha = 1;
                                    this.firstLevelSkillsArray[i].container.children[1].eventMode = "static"
                                    // Add the parent connecting lines.
                                    this.firstLevelSkillsConnectingLinesArray[i].graphic.alpha = 1;
                                }
                            }
                        }
                    }
                }
                // Check all second level skill nodes.
                // Check if filter tag applies to the second level skill.
                for (let i = 0; i < this.secondLevelSkillsArray.length; i++) {
                    // Check if the skill has a tag.
                    if (this.secondLevelSkillsArray[i].tagIDs.length > 0) {
                        // Cycle through all of the tags the skill has.
                        for (let j = 0; j < this.secondLevelSkillsArray[i].tagIDs.length; j++) {
                            // Cycle through all the selected tag filters.
                            for (let k = 0; k < selectedFilters.length; k++) {
                                // Check if the selected tag is one of them.
                                if (this.secondLevelSkillsArray[i].tagIDs[j] == selectedFilters[k]) {
                                    // Add and enable the graphic and text.
                                    this.secondLevelSkillsArray[i].container.children[0].alpha = 1;
                                    this.secondLevelSkillsArray[i].container.children[0].eventMode = "static"
                                    this.secondLevelSkillsArray[i].container.children[1].alpha = 1;
                                    this.secondLevelSkillsArray[i].container.children[1].eventMode = "static"
                                    // Add the connecting line.
                                    //   this.secondLevelSkillsConnectingLinesArray[i].alpha = 1;
                                }
                            }
                        }
                    }
                    // Check if filter tag applies to the parent of the second level skill, so as to show the relevant connecting lines.
                    if (this.secondLevelSkillsArray[i].parentTagIDs.length > 0) {
                        // Cycle through all the parent skill node's tags.
                        for (let j = 0; j < this.secondLevelSkillsArray[i].parentTagIDs.length; j++) {
                            // Cycle through all the selected tag filters.
                            for (let k = 0; k < selectedFilters.length; k++) {
                                // Check if the selected tag is one of them.
                                if (this.secondLevelSkillsArray[i].parentTagIDs[j] == selectedFilters[k]) {
                                    // If both the node has a filter tag selected, as well as its parent, show the connecting line.
                                    if (this.secondLevelSkillsArray[i].container.children[0].alpha == 1) {
                                        // Show the connecting line.  
                                        this.secondLevelSkillsConnectingLinesArray[i].alpha = 1;
                                    }
                                }
                            }
                        }
                    }
                }
                // Check all third level skill nodes.
                for (let i = 0; i < this.thirdLevelSkillsArray.length; i++) {
                    // Check if the skill has a tag.
                    if (this.thirdLevelSkillsArray[i].tagIDs.length > 0) {
                        // Cycle through all of the tags the skill has.
                        for (let j = 0; j < this.thirdLevelSkillsArray[i].tagIDs.length; j++) {
                            // Cycle through all the selected tag filters.
                            for (let k = 0; k < selectedFilters.length; k++) {
                                // Check if the selected tag is one of them.
                                if (this.thirdLevelSkillsArray[i].tagIDs[j] == selectedFilters[k]) {
                                    // Add and enable the graphic and text.
                                    this.thirdLevelSkillsArray[i].container.children[0].alpha = 1;
                                    this.thirdLevelSkillsArray[i].container.children[0].eventMode = "static"
                                    this.thirdLevelSkillsArray[i].container.children[1].alpha = 1;
                                    this.thirdLevelSkillsArray[i].container.children[1].eventMode = "static"
                                    // Add the connecting line.
                                    //    this.thirdLevelSkillsConnectingLinesArray[i].alpha = 1;
                                }
                            }
                        }
                    }
                    // Check if filter tag applies to the parent of the third level skill, so as to show the relevant connecting lines.
                    if (this.thirdLevelSkillsArray[i].parentTagIDs.length > 0) {
                        // Cycle through all the parent skill node's tags.
                        for (let j = 0; j < this.thirdLevelSkillsArray[i].parentTagIDs.length; j++) {
                            // Cycle through all the selected tag filters.
                            for (let k = 0; k < selectedFilters.length; k++) {
                                // Check if the selected tag is one of them.
                                if (this.thirdLevelSkillsArray[i].parentTagIDs[j] == selectedFilters[k]) {
                                    // If both the node has a filter tag selected, as well as its parent, show the connecting line.
                                    if (this.thirdLevelSkillsArray[i].container.children[0].alpha == 1) {
                                        // Show the connecting lines.                              
                                        this.thirdLevelSkillsConnectingLinesArray[i].alpha = 1;
                                    }
                                }
                            }
                        }
                    }
                }
                // Check all fourth level skill nodes.
                for (let i = 0; i < this.fourthLevelSkillsArray.length; i++) {
                    // Check if the skill has a tag.
                    if (this.fourthLevelSkillsArray[i].tagIDs.length > 0) {
                        // Cycle through all of the tags the skill has.
                        for (let j = 0; j < this.fourthLevelSkillsArray[i].tagIDs.length; j++) {
                            // Cycle through all the selected tag filters.
                            for (let k = 0; k < selectedFilters.length; k++) {
                                // Check if the selected tag is one of them.
                                if (this.fourthLevelSkillsArray[i].tagIDs[j] == selectedFilters[k]) {
                                    // Add and enable the graphic and text.
                                    this.fourthLevelSkillsArray[i].container.children[0].alpha = 1;
                                    this.fourthLevelSkillsArray[i].container.children[0].eventMode = "static";
                                    this.fourthLevelSkillsArray[i].container.children[1].alpha = 1;
                                    this.fourthLevelSkillsArray[i].container.children[1].eventMode = "static";
                                }
                            }
                        }
                    }
                    // Check if filter tag applies to the parent of the fourth level skill, so as to show the relevant connecting lines.
                    if (this.fourthLevelSkillsArray[i].parentTagIDs.length > 0) {
                        // Cycle through all the parent skill node's tags.
                        for (let j = 0; j < this.fourthLevelSkillsArray[i].parentTagIDs.length; j++) {
                            // Cycle through all the selected tag filters.
                            for (let k = 0; k < selectedFilters.length; k++) {
                                // Check if the selected tag is one of them.
                                if (this.fourthLevelSkillsArray[i].parentTagIDs[j] == selectedFilters[k]) {
                                    // If both the node has a filter tag selected, as well as its parent, show the connecting line.
                                    if (this.fourthLevelSkillsArray[i].container.children[0].alpha == 1) {
                                        // Show the connecting lines.                              
                                        this.fourthLevelSkillsConnectingLinesArray[i].alpha = 1;
                                    }
                                }
                            }
                        }
                    }
                }
            }
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
        updateInfoPanel(skill) {
            // If panel is showing.
            if (this.isSkillInfoPanelShown) {
                // Populate the skill heading.
                var skillHeading = document.getElementById("skillHeading");
                skillHeading.innerHTML = ""
                var name = document.createTextNode(skill.name);
                skillHeading.appendChild(name);
                // Populate the skill description.
                var skillDescription = document.getElementById("skillDescription");
                skillDescription.innerHTML = ""
                var description = document.createTextNode(skill.description);
                skillDescription.appendChild(description);
                // Populate the skill panel check box.             
                if (skill.isMastered == "1") {
                    document.getElementById("skillIsMastered").checked = true;
                }
                else
                    document.getElementById("skillIsMastered").checked = false;
                // Populate the skill link button.        
                var skillLink = document.getElementById("skillLink");
                skillLink.setAttribute("href", "/skills/" + skill.id);
            }
        }
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