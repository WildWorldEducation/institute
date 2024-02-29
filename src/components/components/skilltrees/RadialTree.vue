<script>
// Import the stores.
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useSkillTreeStore } from '../../../stores/SkillTreeStore';
// Nested component.
import SkillPanel from './../SkillPanel.vue';

import * as d3 from 'd3';
// Import Pixi JS.
import * as PIXI from 'pixi.js';

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
            width: null,
            height: null,
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
            data: {},
            radius: 0,
            radiusMultiplier: 256,
            firstLevelNodeSize: 400,
            // Max size before overlap.
            secondLevelNodeSize: 100,
            regularNodeSize: 50,
            subSkillRadius: 50
        };
    },
    components: {
        SkillPanel
    },
    created() {
        // Start the Pixi renderer.
        this.$pixiApp.start();
        // Show this tree.
        this.$radialTreeContainer.visible = true;
        // Hide the tidy tree.
        this.$tidyTreeContainer.visible = false;
        // Set the background colour.
        this.$pixiApp.renderer.background.color = 0x000000;
    },
    async mounted() {
        if (this.skillTreeStore.userSkillsSubSkillsSeparate.length == 0) {
            await this.skillTreeStore.getUserSkillsSubSkillsSeparate();
        }

        // Only generate this chart, if it has not already been generated.
        if (this.$radialTreeContainer.children.length == 0) {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.radius = Math.min(this.width, this.height) / 2 - 30;

            this.skill = {
                name: 'SKILLS',
                sprite: null,
                children: this.skillTreeStore.userSkillsSubSkillsSeparate
            };
            this.getAlgorithm();
        }
        // Add the canvas to the DOM.
        document.querySelector('#skilltree').appendChild(this.$pixiApp.view);
    },
    methods: {
        getAlgorithm() {
            var skillsNoSubSkills = [];
            skillsNoSubSkills = JSON.parse(JSON.stringify(this.skill.children));

            // Remove subskills, in order to allow D3 to calculate the positioning properly.
            function removeSubSkills(parentChildren) {
                var i = parentChildren.length;
                while (i--) {
                    if (parentChildren[i].type == 'sub') {
                        parentChildren.splice(i, 1);
                    }

                    // Dont run if this element was just spliced.
                    if (typeof parentChildren[i] !== 'undefined') {
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

            //      removeSubSkills(skillsNoSubSkills);

            this.data = {
                skill_name: 'My skills',
                children: skillsNoSubSkills
            };

            // Create a radial tree layout. The layout’s first dimension (x)
            // is the angle, while the second (y) is the radius.
            const tree = d3
                .tree()
                // increase the radius to space out the nodes.
                .size([2 * Math.PI, this.radius * this.radiusMultiplier])
                // Max separation between sibling nodes.
                .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);

            // Sort the tree and apply the layout.
            this.root = tree(d3.hierarchy(this.data));
            this.drawTree();
        },
        drawTree() {
            /*
             * Central circle.
             */
            // Graphic.
            const centerNodeSprite = PIXI.Sprite.from('center-node.png');
            centerNodeSprite.x = this.root.x;
            centerNodeSprite.y = this.root.y;
            centerNodeSprite.anchor.set(0.5);
            // Add to the global variable container for this chart.
            this.$radialTreeContainer.addChild(centerNodeSprite);

            // Get the data from D3.
            const nodes = this.root.descendants();
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
            /*
             * Create the skill node container.
             * Using the D3 algorithm to get the position.
             */
            let nodeContainer = new PIXI.Container();
            nodeContainer.x = Math.cos(node.x) * node.y;
            nodeContainer.y = Math.sin(node.x) * node.y;
            // Add to the global variable container for this chart.
            this.$radialTreeContainer.addChild(nodeContainer);

            /*
             * Draw the skill node.
             */
            var nodeGraphic = new PIXI.Sprite();
            if (node.data.level == 'grade_school') {
                if (node.data.is_mastered)
                    nodeGraphic = PIXI.Sprite.from(
                        'images/skill-tree-nodes/grade-school-mastered.png'
                    );
                else if (node.data.is_accessible)
                    nodeGraphic = PIXI.Sprite.from(
                        'images/skill-tree-nodes/grade-school-unlocked.png'
                    );
                else
                    nodeGraphic = PIXI.Sprite.from(
                        'images/skill-tree-nodes/grade-school-locked.png'
                    );
            } else if (node.data.level == 'middle_school') {
                if (node.data.is_mastered)
                    nodeGraphic = PIXI.Sprite.from(
                        'images/skill-tree-nodes/middle-school-mastered.png'
                    );
                else if (node.data.is_accessible)
                    nodeGraphic = PIXI.Sprite.from(
                        'images/skill-tree-nodes/middle-school-unlocked.png'
                    );
                else
                    nodeGraphic = PIXI.Sprite.from(
                        'images/skill-tree-nodes/middle-school-locked.png'
                    );
            } else if (node.data.level == 'high_school') {
                if (node.data.is_mastered)
                    nodeGraphic = PIXI.Sprite.from(
                        'images/skill-tree-nodes/high-school-mastered.png'
                    );
                else if (node.data.is_accessible)
                    nodeGraphic = PIXI.Sprite.from(
                        'images/skill-tree-nodes/middle-school-unlocked.png'
                    );
                else
                    nodeGraphic = PIXI.Sprite.from(
                        'images/skill-tree-nodes/middle-school-locked.png'
                    );
            } else if (node.data.level == 'college') {
                if (node.data.is_mastered)
                    nodeGraphic = PIXI.Sprite.from(
                        'images/skill-tree-nodes/college-mastered.png'
                    );
                else if (node.data.is_accessible)
                    nodeGraphic = PIXI.Sprite.from(
                        'images/skill-tree-nodes/middle-school-unlocked.png'
                    );
                else
                    nodeGraphic = PIXI.Sprite.from(
                        'images/skill-tree-nodes/middle-school-locked.png'
                    );
            } else if (node.data.level == 'phd') {
                if (node.data.is_mastered)
                    nodeGraphic = PIXI.Sprite.from(
                        'images/skill-tree-nodes/phd-mastered.png'
                    );
                else if (node.data.is_accessible)
                    nodeGraphic = PIXI.Sprite.from(
                        'images/skill-tree-nodes/middle-school-unlocked.png'
                    );
                else
                    nodeGraphic = PIXI.Sprite.from(
                        'images/skill-tree-nodes/middle-school-locked.png'
                    );
            } else if (node.data.level == 'domain') {
                nodeGraphic = PIXI.Sprite.from(
                    'images/skill-tree-nodes/domain.png'
                );
            }
            nodeGraphic.anchor.set(0.5);
            // Increase the size of the first level nodes.
            if (node.depth == 1) {
                nodeGraphic.width = this.firstLevelNodeSize;
                nodeGraphic.height = this.firstLevelNodeSize;
            } else if (node.depth == 2) {
                nodeGraphic.width = this.secondLevelNodeSize;
                nodeGraphic.height = this.secondLevelNodeSize;
            } else {
                nodeGraphic.width = this.regularNodeSize;
                nodeGraphic.height = this.regularNodeSize;
            }
            nodeContainer.addChild(nodeGraphic);

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

            /*
             * Subskills.
             */
            if (node.data.subskills) {
                for (let i = 0; i < node.data.subskills.length; i++) {
                    let subNodeContainer = new PIXI.Container();
                    // Calculate the increment of the subskills, around a circle.
                    let increment = 360 / node.data.subskills.length;
                    // Get the correct index number.
                    let subSkillsIndex = i;
                    // Calculate the nodes angle.
                    let angle = increment * subSkillsIndex;
                    let rads = (angle * Math.PI) / 180;

                    let x = this.subSkillRadius * Math.cos(rads);
                    let y = this.subSkillRadius * Math.sin(rads);
                    subNodeContainer.x = x;
                    subNodeContainer.y = y;

                    var nodeGraphic = new PIXI.Sprite();

                    if (node.data.level == 'grade_school') {
                        if (node.data.is_mastered)
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/grade-school-small-mastered.png'
                            );
                        else if (node.data.is_accessible)
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/grade-school-small-unlocked.png'
                            );
                        else
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/grade-school-small-locked.png'
                            );
                    } else if (node.data.level == 'middle_school') {
                        if (node.data.is_mastered)
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/middle-school-small-mastered.png'
                            );
                        else if (node.data.is_accessible)
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/middle-school-small-unlocked.png'
                            );
                        else
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/middle-school-small-locked.png'
                            );
                    } else if (node.data.level == 'high_school') {
                        if (node.data.is_mastered)
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/high-school-small-mastered.png'
                            );
                        else if (node.data.is_accessible)
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/high-school-small-unlocked.png'
                            );
                        else
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/high-school-small-locked.png'
                            );
                    } else if (node.data.level == 'college') {
                        if (node.data.is_mastered)
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/college-smal-mastered.png'
                            );
                        else if (node.data.is_accessible)
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/college-small-unlocked.png'
                            );
                        else
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/college-small-locked.png'
                            );
                    } else if (node.data.level == 'phd') {
                        if (node.data.is_mastered)
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/phd-small-mastered.png'
                            );
                        else if (node.data.is_accessible)
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/phd-small-unlocked.png'
                            );
                        else
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/phd-small-locked.png'
                            );
                    }
                    nodeGraphic.width = 15;
                    nodeGraphic.height = 15;
                    nodeGraphic.anchor.set(0.5);

                    // Interactivity.
                    nodeGraphic.eventMode = 'static';
                    nodeGraphic.cursor = 'pointer';
                    nodeGraphic.on('pointerdown', (event) => {
                        // Create the  skill object:
                        var skill = {
                            id: node.data.subskills[i].id,
                            isMastered: node.data.subskills[i].is_mastered,
                            isUnlocked: node.data.subskills[i].is_accessible,
                            name: node.data.subskills[i].skill_name
                        };
                        this.skill = skill;

                        if (!this.isSkillInfoPanelShown) {
                            this.showInfoPanel();
                        }
                    });

                    subNodeContainer.addChild(nodeGraphic);

                    const style = new PIXI.TextStyle({
                        fontFamily: 'Poppins900',
                        fontSize: '10',
                        fill: 'white',
                        align: 'center',
                        strokeThickness: 2,
                        stroke: 'black'
                    });

                    const nameText = new PIXI.Text(
                        node.data.subskills[i].skill_name,
                        style
                    );
                    nameText.angle = angle;
                    subNodeContainer.addChild(nameText);
                    nodeContainer.addChild(subNodeContainer);
                }
            }

            /*
             * Skill names.
             */
            let fontSize;
            let fill;
            if (node.depth == 0) {
                fontSize = 200;
                fill = '#000000';
            } else if (node.depth == 1) {
                fontSize = 100;
                fill = '#ffffff';
            } else {
                fontSize = 50;
                fill = '#ffffff';
            }

            const style = new PIXI.TextStyle({
                fontFamily: 'Poppins900',
                fontSize: fontSize,
                fill: fill,
                align: 'center',
                strokeThickness: 4,
                stroke: 'black'
            });

            const nameText = new PIXI.Text(node.data.skill_name, style);
            if (node.depth == 0 || node.depth == 1) {
                // For the centre and first elvel nodes, the text is centred,
                // and not rotated.
                nameText.anchor.set(0.5, 0.5);
            } else if (node.depth > 1) {
                // For all the outer nodes, the text is only partly centred,
                // and it is rotated.
                nameText.anchor.set(0, 0.5);
                nameText.angle = (node.x * 180) / Math.PI - 90;
                if (nodeContainer.x > 0) {
                    nameText.angle = nameText.angle + 90;
                } else {
                    nameText.angle = nameText.angle - 90;
                }
            }

            nameText.scale.set(0.5, 0.5);

            // Add to the global variable container for this chart.
            nodeContainer.addChild(nameText);
        },
        drawLink(link) {
            const nodeLink = new PIXI.Graphics();
            // If skill is mastered, make line thicker.
            if (link.target.data.is_mastered == '1') {
                nodeLink.lineStyle(16, 0xffffff, 1);
            } else {
                nodeLink.lineStyle(2, 0xffffff, 1);
            }

            // Source node.
            var sourceX = Math.cos(link.source.x) * link.source.y;
            var sourceY = Math.sin(link.source.x) * link.source.y;
            nodeLink.moveTo(sourceX, sourceY);

            // Target node.
            var targetX = Math.cos(link.target.x) * link.target.y;
            var targetY = Math.sin(link.target.x) * link.target.y;
            nodeLink.lineTo(targetX, targetY);

            // Add to the global variable container for this chart.
            this.$radialTreeContainer.addChild(nodeLink);

            // Tidy tree bezier curves - for reference.
            // D3 function to generate the link path data.

            // let radialData = {
            //     source: {
            //         x: link.source.x,
            //         y: link.source.y
            //     },
            //     target: {
            //         x:
            //             Math.atan2(
            //                 link.target.y - link.source.y,
            //                 link.target.x - link.source.x
            //             ) - Math.PI,
            //         y: Math.sqrt(
            //             (link.target.x - link.source.x) *
            //                 (link.target.x - link.source.x) +
            //                 (link.target.y - link.source.y) *
            //                     (link.target.y - link.source.y)
            //         )
            //     }
            // };

            // var linkRadial = d3
            //     .linkRadial()
            //     .angle(function (d) {
            //         return d.x;
            //     })
            //     .radius(function (d) {
            //         return d.y;
            //     });

            // // Convert the path data into an array for starting point values,
            // // and an array for the rest of the points.
            // var pathData = linkRadial(radialData);

            // var startingPoint = pathData.substring(
            //     pathData.indexOf('M') + 1,
            //     pathData.lastIndexOf('C')
            // );
            // const startingPointArray = startingPoint.split(',');
            // console.log(startingPointArray);

            // var otherPoints = pathData.split('C')[1];
            // var otherPointsArray = otherPoints.split(',');
            // console.log(otherPointsArray);

            // // Draw the bezier curve with Pixi.
            // const nodeLink = new PIXI.Graphics();
            // // If skill is mastered.
            // var lineWidth;
            // if (link.target.data.is_mastered == 1) lineWidth = 16;
            // else lineWidth = 8;
            // nodeLink.lineStyle({ width: lineWidth, color: 0xffffff });

            // nodeLink.position.x = startingPointArray[0];
            // nodeLink.position.y = startingPointArray[1];
            // // This PIXI function is additive, therefore must subtract the starting point.
            // nodeLink.bezierCurveTo(
            //     otherPointsArray[0] - startingPointArray[0],
            //     otherPointsArray[1] - startingPointArray[1],
            //     otherPointsArray[2] - startingPointArray[0],
            //     otherPointsArray[3] - startingPointArray[1],
            //     otherPointsArray[4] - startingPointArray[0],
            //     otherPointsArray[5] - startingPointArray[1]
            // );
            // // Add to the global variable container for this chart.
            // this.$radialTreeContainer.addChild(nodeLink);
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

@media (max-width: 800px) {
    .flex-container {
        flex-direction: column;
    }
}
</style>
