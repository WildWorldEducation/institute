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
            isSkillInfoPanelShown: false,
            dx: null,
            dy: null,
            data: {}
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

            this.data = {
                skill_name: 'My skills',
                children: skillsWithSubSkillsMoved
            };

            this.width = 8000;
            // Compute the tree height; this approach will allow the height of the
            // SVG to scale according to the breadth (width) of the tree layout.
            this.root = d3.hierarchy(this.data);
            this.dx = 35;
            this.dy = this.width / (this.root.height + 1);
            // Create a tree layout.
            this.tree = d3.tree().nodeSize([this.dx, this.dy]);
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
            basicText.x = node.y + 15;
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

                // Check the box on the skill panel, if the skill is mastered.
                if (this.skill.isMastered == '1')
                    document.getElementById('mastery-checkbox').checked = true;
                else
                    document.getElementById('mastery-checkbox').checked = false;
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
        async printPDF() {
            // Build the SVG tree.
            await this.createSVGTree();

            // Select the element from the DOM.
            var svg = document.getElementById('linearTree');
            // Then select with D3
            var d3Svg = d3.select(svg);
            // Then select the SVG code with D3
            var d3SvgNode = d3Svg.node();

            // Make it a string, to send to server.
            var s = new XMLSerializer();
            var str = s.serializeToString(d3SvgNode);

            // Create a JSON object.
            var dataObject = { svg: str, treeType: 'linear' };
            var data = JSON.stringify(dataObject);

            // POST request.
            var xhttp = new XMLHttpRequest();
            xhttp.responseType = 'arraybuffer';
            xhttp.open('POST', '/skilltree/print-pdf', true);
            xhttp.setRequestHeader(
                'Content-type',
                'application/json;charset=UTF-8'
            );
            xhttp.setRequestHeader(
                'Accept',
                'application/json, text/plain, */*'
            );
            xhttp.send(data);

            // To download the file client side.
            xhttp.onload = function () {
                if (this.readyState == 4 && this.status == 200) {
                    // Typical action to be performed when the document is ready:
                    let pdfBlob = new Blob([xhttp.response], {
                        type: 'application/pdf'
                    });
                    const url = window.URL.createObjectURL(pdfBlob);

                    // To download and name the file.
                    var a = document.createElement('a');
                    document.body.appendChild(a);
                    a.style = 'display: none';
                    a.href = url;
                    a.download = 'My-Skill-Tree.pdf';
                    a.click();
                    window.URL.revokeObjectURL(url);
                }
            };
        },
        createSVGTree() {
            // Redo D3 algorithm.
            const root = d3.hierarchy(this.data);
            // Different node size for the PDF, as doesnt need to be clickable.
            const dx = 15;
            const dy = this.width / (root.height + 1);
            // Create a tree layout.
            const tree = d3.tree().nodeSize([dx, dy]);
            // Sort the tree and apply the layout.
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
            const height = x1 - x0 + this.dx * 2;

            let svg = d3
                .create('svg')
                // Add ID for the printing to PDF.
                .attr('id', 'linearTree')
                .attr('width', this.width)
                .attr('height', height)
                .attr('viewBox', [-dy / 3, x0 - dx, this.width, height])
                .attr(
                    'style',
                    'max-width: 100%; height: auto; font: 10px sans-serif;'
                );

            const g = svg.append('g');

            // Links or connecting lines.
            g.append('g')
                .attr('fill', 'none')
                .attr('stroke-opacity', 1)
                .selectAll()
                .data(root.links())
                .join('path')
                .attr(
                    'd',
                    d3
                        .linkHorizontal()
                        .x((d) => d.y)
                        .y((d) => d.x)
                )
                .attr('stroke', function (d) {
                    return '#000';
                })
                .attr('stroke-width', function (d) {
                    if (d.target.data.is_mastered == 1) {
                        return 8;
                    } else return 1.5;
                })
                .style('stroke-dasharray', function (d) {
                    // If the node is a sub node.
                    if (
                        (d.source.data.type == 'super' &&
                            d.target.data.position == 'end') ||
                        d.target.data.type == 'sub'
                    ) {
                        return 5;
                    }
                });

            const node = g
                .append('g')
                .attr('stroke-linejoin', 'round')
                .attr('stroke-width', 3)
                .selectAll()
                .data(root.descendants())
                .join('g')
                .attr('transform', (d) => `translate(${d.y},${d.x})`);

            node.append('circle')
                .attr('fill', (d) => (d.children ? '#555' : '#000'))
                .attr('r', 2.5);

            // Labels.
            node.append('text')
                .style('font-weight', function (d) {
                    // If the node is a super node.
                    if (d.data.type == 'super') {
                        return '700';
                    } else return '400';
                })
                .style('font-style', function (d) {
                    // If the node is a sub node.
                    if (d.data.type == 'sub') {
                        return 'italic';
                    }
                })
                .attr('dy', '0.31em')
                .attr('x', (d) => (d.children ? -6 : 6))
                .attr('text-anchor', (d) => (d.children ? 'end' : 'start'))
                .text(function (d) {
                    // If the node is a super node end node.
                    if (d.data.position == 'end') {
                        return '';
                    } else return d.data.skill_name;
                })
                .clone(true)
                .lower()
                .attr('stroke', function (d) {
                    return 'white';
                });

            // Append the SVG element.
            document.querySelector('#SVGskilltree').append(svg.node());
        }
    }
};
</script>

<template>
    <button id="print-btn" class="btn btn-info" @click="printPDF()">
        Print
    </button>
    <!-- Wrapper is for the dark overlay, when the sidepanel is displayed -->
    <div id="wrapper">
        <SkillPanel :skill="skill" />
        <div id="skilltree"></div>
        <div id="SVGskilltree"></div>
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
    overflow: hidden;
    /* This is for the positioning of the information panel. */
    position: relative;
    background-color: white;
}

.flex-container {
    display: flex;
    flex-direction: row;
}

#SVGskilltree {
    /* height: 54500px; */
}

@media (max-width: 800px) {
    .flex-container {
        flex-direction: column;
    }
}
</style>
