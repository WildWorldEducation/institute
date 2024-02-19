<script>
// Import the stores.
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useSkillTreeStore } from '../../../stores/SkillTreeStore';
// Nested component.
import SkillPanel from './../SkillPanel.vue';

import * as d3 from 'd3';
// Import Pixi JS.
//import * as PIXI from 'pixi.js';
// Using pixi legacy because we are using the canvas, not WebGL.
import * as PIXI from 'pixi.js-legacy';
// Import Pixi Viewprt.
import { Viewport } from 'pixi-viewport';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const skillTreeStore = useSkillTreeStore();
        return {
            userDetailsStore,
            skillTreeStore
        };
    },
    data() {
        return {
            width: 800,
            height: 600,
            skill: {
                id: null,
                children: [],
                isMastered: null,
                isUnlocked: null,
                name: null
            },
            tree: {},
            root: {},
            isSkillInfoPanelShown: false
        };
    },
    components: {
        SkillPanel
    },
    async mounted() {
        if (this.skillTreeStore.userSkills.length == 0) {
            await this.skillTreeStore.getUserSkills();
        }

        this.skill = {
            name: 'SKILLS',
            sprite: null,
            children: this.skillTreeStore.userSkills
        };

        const viewport = new Viewport({
            screenWidth: this.width,
            screenHeight: this.height,
            worldWidth: this.width,
            worldHeight: this.height,
            events: this.$pixiApp.renderer.events
        });

        this.$pixiApp.stage.addChild(viewport);

        viewport.center = new PIXI.Point(100, 0);
        viewport.setZoom(0.1);
        viewport
            .drag({
                wheelScroll: 2,
                factor: 2
            })
            .pinch({
                percent: 2,
                factor: 2
            })
            .wheel()
            .decelerate()
            .clampZoom({ minScale: 0.001, maxScale: 10 });

        document.querySelector('#skilltree').appendChild(this.$pixiApp.view);

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
                        parentChildren[i].type == 'super' &&
                        parentChildren[i].position != 'end'
                    ) {
                        // Separate the child nodes.
                        var subSkills = [];
                        var regularChildSkills = [];
                        for (
                            let j = 0;
                            j < parentChildren[i].children.length;
                            j++
                        ) {
                            if (parentChildren[i].children[j].type == 'sub') {
                                subSkills.push(parentChildren[i].children[j]);
                            } else {
                                regularChildSkills.push(
                                    parentChildren[i].children[j]
                                );
                            }
                        }

                        // Create a new child node, with the subskills in it.
                        var superSkillEndNode = {
                            skill_name: parentChildren[i].skill_name,
                            type: 'super',
                            position: 'end',
                            children: subSkills
                        };

                        // Empty the child nodes.
                        parentChildren[i].children = [];
                        // Add the new node.
                        parentChildren[i].children.push(superSkillEndNode);
                        // Add the other child nodes, excluding subskills.
                        for (let j = 0; j < regularChildSkills.length; j++) {
                            parentChildren[i].children.push(
                                regularChildSkills[j]
                            );
                        }
                    }

                    if (typeof parentChildren[i] !== 'undefined') {
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

            var data = {
                skill_name: 'My skills',
                children: skillsWithSubSkillsMoved
            };

            const width = 8000;
            // Compute the tree height; this approach will allow the height of the
            // SVG to scale according to the breadth (width) of the tree layout.
            this.root = d3.hierarchy(data);
            const dx = 35;
            const dy = width / (this.root.height + 1);
            // Create a tree layout.
            this.tree = d3.tree().nodeSize([dx, dy]);
            // Sort the tree and apply the layout.
            this.tree(this.root);
            this.drawTree();
        },
        drawTree() {
            // Get the data from D3.
            var nodes = this.root.descendants();
            const links = this.root.links();
            // Draw the actual shapes.
            for (const link of links) {
                this.drawLink(link);
            }
            for (const node of nodes) {
                this.drawNode(node);
            }
        },
        drawNode(node) {
            // Skill node.
            const nodeGraphic = new PIXI.Graphics();
            nodeGraphic.lineStyle(0);
            nodeGraphic.beginFill(0x000, 1);
            nodeGraphic.drawCircle(node.y, node.x, 15);
            nodeGraphic.endFill();
            this.$pixiApp.stage.children[0].addChild(nodeGraphic);

            // Interactivity.
            nodeGraphic.eventMode = 'static';
            nodeGraphic.cursor = 'pointer';
            nodeGraphic.on('pointerdown', (event) => {
                // Create the  skill object:
                var skill = {
                    id: node.data.id,
                    isMastered: node.data.is_mastered,
                    isUnlocked: node.data.is_accessible,
                    name: node.data.skill_name
                };
                this.skill = skill;

                if (!this.isSkillInfoPanelShown) {
                    this.showInfoPanel();
                }
            });

            // Skill names.
            const style = new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 12,
                fill: '#000',
                stroke: '#fff',
                strokeThickness: 3
            });

            const basicText = new PIXI.Text(node.data.skill_name, style);
            basicText.anchor.set(0, 0.5);
            basicText.x = node.y + 10;
            basicText.y = node.x;
            this.$pixiApp.stage.children[0].addChild(basicText);
        },
        drawLink(link) {
            // D3 function to generate the link path data.
            const linkGenerator = d3
                .linkHorizontal()
                .x((d) => {
                    return d.y;
                })
                .y((d) => {
                    return d.x;
                });
            // Convert the path data into an array for starting point values,
            // and an array for the rest of the points.
            var pathData = linkGenerator(link);
            var startingPoint = pathData.substring(
                pathData.indexOf('M') + 1,
                pathData.lastIndexOf('C')
            );
            const startingPointArray = startingPoint.split(',');
            var otherPoints = pathData.split('C')[1];
            var otherPointsArray = otherPoints.split(',');

            // Draw the bezier curve with Pixi.
            const nodeLink = new PIXI.Graphics();
            // If skill is mastered.
            var lineWidth;
            if (link.target.data.is_mastered == 1) lineWidth = 4;
            else lineWidth = 2;
            // If skill is a subskill.
            if (
                (link.source.data.type == 'super' &&
                    link.target.data.position == 'end') ||
                link.target.data.type == 'sub'
            ) {
                lineWidth = 1;
            }

            nodeLink.lineStyle(lineWidth, 0x000, 1);
            nodeLink.position.x = startingPointArray[0];
            nodeLink.position.y = startingPointArray[1];
            // This PIXI function is additive, therefore must subtract the starting point.
            nodeLink.bezierCurveTo(
                otherPointsArray[0] - startingPointArray[0],
                otherPointsArray[1] - startingPointArray[1],
                otherPointsArray[2] - startingPointArray[0],
                otherPointsArray[3] - startingPointArray[1],
                otherPointsArray[4] - startingPointArray[0],
                otherPointsArray[5] - startingPointArray[1]
            );
            this.$pixiApp.stage.children[0].addChild(nodeLink);
        },
        showInfoPanel() {
            // If panel is not showing.
            if (!this.isSkillInfoPanelShown) {
                this.isSkillInfoPanelShown = true;
                // To display the panel.
                // Responsive.
                // Laptop etc.
                if (screen.width > 800) {
                    document.getElementById('skillInfoPanel').style.width =
                        '474px';
                }
                // Mobile device.
                else {
                    document.getElementById('skillInfoPanel').style.height =
                        '474px';
                }
            }
        },
        hideInfoPanel() {
            // If panel is showing.
            if (this.isSkillInfoPanelShown) {
                // Responsive.
                // Laptop etc.
                if (screen.width > 800) {
                    document.getElementById('skillInfoPanel').style.width =
                        '0px';
                }
                // Mobile device.
                else {
                    document.getElementById('skillInfoPanel').style.height =
                        '0px';
                }
                // Hide the background.
                document.getElementById('sidepanel-backdrop').style.display =
                    'none';

                this.isSkillInfoPanelShown = false;
            }
        },
        zoomed(transform) {
            // For the regular canvas.
            this.context.save();
            this.context.clearRect(
                0,
                0,
                this.context.canvas.width,
                this.context.canvas.height
            );
            this.context.translate(transform.x, transform.y);
            this.context.scale(transform.k, transform.k);

            this.drawTree(false);

            this.context.fill();
            this.context.restore();

            // For the hidden canvas.
            this.hiddenCanvasContext.save();
            this.hiddenCanvasContext.clearRect(
                0,
                0,
                this.hiddenCanvasContext.canvas.width,
                this.hiddenCanvasContext.canvas.height
            );
            this.hiddenCanvasContext.translate(transform.x, transform.y);
            this.hiddenCanvasContext.scale(transform.k, transform.k);

            this.drawTree(true);

            this.hiddenCanvasContext.fill();
            this.hiddenCanvasContext.restore();
        }
    }
};
</script>

<template>
    <div id="wrapper">
        <SkillPanel :skill="skill" />
        <div id="skilltree"></div>
        <div id="sidepanel-backdrop"></div>
    </div>
</template>

<style scoped>
#buttonWrapper {
    position: absolute;
    width: 30px;
    top: 90px;
    right: 2px;
}

input[type='button'] {
    padding: 5px;
    width: 30px;
    margin: 0px 0px 2px 0px;
}
.skill-tree-container {
    /* Subtract the purple banner and the navigation bar. */
    height: calc(100% - 20px - 66px);
}

#wrapper {
    width: 100%;
    height: calc(100% - 86px);
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
    /*  overflow: hidden; */
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
