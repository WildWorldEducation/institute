<script>
// Import the stores.
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useSkillTreeStore } from '../../../stores/SkillTreeStore';
// Nested component.
import SkillPanel from './../SkillPanel.vue';

// Algorithm.
import * as d3 from 'd3';

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
            width: 6000,
            height: null,
            radius: 0,
            radiusMultiplier: 96,
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
                type: null,
                subskills: []
            },
            tree: {},
            root: {},
            context: {},
            hiddenCanvasContext: {},
            scaleMultiplier: 0.8,
            startDragOffset: { x: 0, y: 0 },
            mouseDown: false,
            nodes: [],
            nextCol: 1,
            colToNode: {},
            isSkillInfoPanelShown: false,
            scale: 1,
            panX: 0,
            panY: 0,
            // D3 zoom class
            d3Zoom: null,
            // Printing
            data: {},
            // For the loading animation.
            isLoading: true
        };
    },
    components: {
        SkillPanel
    },
    async mounted() {
        if (this.skillTreeStore.userSkillsSubSkillsSeparate.length == 0) {
            await this.skillTreeStore.getUserSkillsSubSkillsSeparate();
        }

        // Specify the chart’s dimensions.
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.radius = Math.min(this.width, this.height) / 2 - 30;

        this.skill = {
            name: 'SKILLS',
            sprite: null,
            children: this.skillTreeStore.userSkillsSubSkillsSeparate
        };

        this.getAlgorithm();

        // Zoom and pan.
        // store the d3 zoom object so it can be use for programmatic zoom later on
        this.d3Zoom = d3
            .zoom()
            .scaleExtent([0.05, 8])
            .on('zoom', ({ transform }) => this.zoomed(transform));
        d3.select(this.context.canvas).call(this.d3Zoom);

        // Zoom and move the tree to it initial position
        this.defaultPosition();

        // Listen for clicks on the main canvas
        canvas.addEventListener('click', async (e) => {
            // We actually only need to draw the hidden canvas when
            // there is an interaction. This sketch can draw it on
            // each loop, but that is only for demonstration.

            var data = this.nodes;
            //Figure out where the mouse click occurred.
            var mouseX = e.layerX;
            var mouseY = e.layerY;

            // Get the corresponding pixel color on the hidden canvas
            // and look up the node in our map.
            var ctx = this.hiddenCanvasContext;

            // This will return that pixel's color
            var col = ctx.getImageData(mouseX, mouseY, 1, 1).data;
            //var col = ctx.getImageData(mouseX, mouseY, 1, 1);

            //Our map uses these rgb strings as keys to nodes.
            var colString = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
            var node = this.colToNode[colString];

            // console.log(this.colToNode);

            if (node) {
                // We clicked on something, lets set the color of the node
                // we also have access to the data associated with it, which in
                // this case is just its original index in the data array.
                node.renderCol = node.__pickColor;

                //Update the display with some data
                this.skill.name = node.data.skill_name;
                this.skill.id = node.data.id;
                this.skill.type = node.data.type;
                this.skill.subskills = node.data.subskills;

                // Get the mastery requirements data separately.
                // Because this is so much data, we do not send it with the rest of the skill tree,
                // or it will slow the load down too much.
                const result = await fetch(
                    '/skills/mastery-requirements/' + this.skill.id
                );
                const masteryRequirements = await result.json();
                this.skill.masteryRequirements = masteryRequirements;

                this.showInfoPanel();
            }
        });

        // For the loading animation.
        this.isLoading = false;
    },
    methods: {
        getAlgorithm() {
            var skillsNoSubSkills = [];
            skillsNoSubSkills = JSON.parse(JSON.stringify(this.skill.children));

            this.data = {
                skill_name: '',
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
            this.root = tree(
                d3
                    .hierarchy(this.data)
                    .sort((a, b) => d3.ascending(a.data.name, b.data.name))
            );

            var canvas = document.getElementById('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            this.context = canvas.getContext('2d');

            // Background colour.
            this.context.fillStyle = '#1e293b';
            this.context.fillRect(0, 0, this.width, this.height);
            // Set up the Hidden Canvas for Interactivity.
            let hiddenCanvas = document.getElementById('hidden-canvas');
            this.hiddenCanvasContext = hiddenCanvas.getContext('2d', {
                willReadFrequently: true
            });
            hiddenCanvas.style.display = 'none';

            // Centre chart.
            this.context.translate(this.width / 2, this.height / 2);
            this.hiddenCanvasContext.translate(this.width / 2, this.height / 2);

            this.drawTree();
        },
        drawTree() {
            this.nodes = this.root.descendants();

            // Concentric circles.
            // for (let i = 50; i > 5; i = i - 5) {
            //     this.context.beginPath();
            //     this.context.arc(
            //         0,
            //         0,
            //         i * (this.radius * this.radiusMultiplier),
            //         0,
            //         2 * Math.PI,
            //         false
            //     );

            //     this.context.lineWidth = 3;
            //     this.context.strokeStyle = 'red';
            //     this.context.stroke();
            // }

            // Draw links.
            const links = this.root.links();
            this.context.beginPath();
            for (const link of links) {
                this.drawLink(link);
            }

            // Draw nodes.
            this.context.beginPath();
            for (const node of this.nodes) {
                if (node.renderCol) {
                    // Render clicked nodes in the color of their corresponding node
                    // on the hidden canvas.
                    this.context.fillStyle = node.renderCol;
                } else {
                    this.context.fillStyle = 'RGBA(105, 105, 105, 0.8)';
                }
                //
                //  If we are rendering to the hidden canvas each element
                // should get its own color.
                //
                if (node.__pickColor === undefined) {
                    // If we have never drawn the node to the hidden canvas get a new
                    // color for it and put it in the dictionary. genColor returns a new color
                    // every time it is called.
                    node.__pickColor = this.genColor();
                    this.colToNode[node.__pickColor] = node;
                }
                // On the hidden canvas each rectangle gets a unique color.
                this.hiddenCanvasContext.fillStyle = node.__pickColor;
                // Draw the actual shape
                this.drawNode(node);
            }

            // Draw center node.
            this.context.beginPath();
            this.context.moveTo(0, 0);
            this.context.arc(0, 0, 20, 0, 2 * Math.PI);
            this.context.fillStyle = 'lightgreen';
            this.context.fill();

            //smiley
            this.context.fillStyle = 'LawnGreen';
            this.context.strokeStyle = 'black';
            this.context.lineWidth = 5;
            this.context.beginPath();
            this.context.arc(0, 0, 50, 0, 2 * Math.PI);
            this.context.fill();
            this.context.stroke();
            this.context.closePath();

            //eyes
            this.context.fillStyle = 'cyan';
            this.context.beginPath();
            this.context.arc(-12.5, -16.5, 7.5, 0, 2 * Math.PI);
            this.context.fill();
            this.context.stroke();
            this.context.closePath();

            this.context.beginPath();
            this.context.arc(12.5, -16.5, 7.5, 0, 2 * Math.PI);
            this.context.fill();
            this.context.stroke();
            this.context.closePath();

            //mouth
            this.context.fillStyle = 'LawnGreen';
            this.context.strokeStyle = 'black';
            this.context.lineWidth = 5;
            this.context.beginPath();
            this.context.arc(0, 0, 37.5, 0, -1 * Math.PI);
            this.context.stroke();
            this.context.closePath();
        },
        drawNode(node) {
            let ctx1 = this.context;
            let ctx2 = this.hiddenCanvasContext;

            // Because it is a radial chart - need to convert values.
            let x = Math.cos(node.x) * node.y;
            let y = Math.sin(node.x) * node.y;

            // Need to rotate all nodes 90 degrees for some reason, to match the links.
            let pos = rotate(0, 0, x, y, 90);
            function rotate(cx, cy, x, y, angle) {
                var radians = (Math.PI / 180) * angle,
                    cos = Math.cos(radians),
                    sin = Math.sin(radians),
                    nx = cos * (x - cx) + sin * (y - cy) + cx,
                    ny = cos * (y - cy) - sin * (x - cx) + cy;
                return [nx, ny];
            }

            // Node colour.
            let color;
            if (node.data.type == 'domain') {
                color = 'black';
            } else if (node.data.level == 'grade_school') {
                color = '#40E0D0';
            } else if (node.data.level == 'middle_school') {
                color = '#33A133';
            } else if (node.data.level == 'high_school') {
                color = '#FFD700';
            } else if (node.data.level == 'college') {
                color = '#FFA500';
            } else if (node.data.level == 'phd') {
                color = '#FF0000';
            }

            let size;
            if (node.depth == 1) size = 20;
            else size = 10;
            // Visible context.
            // Only draw node that not domain type
            if (node.data.type !== 'domain') {
                ctx1.beginPath();
                ctx1.moveTo(pos[0], pos[1]);
                ctx1.arc(pos[0], pos[1], size, 0, 2 * Math.PI);
                ctx1.fillStyle = color;
                ctx1.fill();
            }

            function angle(cx, cy, ex, ey) {
                var dy = ey - cy;
                var dx = ex - cx;
                var theta = Math.atan2(dy, dx);

                return theta;
            }

            // Take in the radians of the nodes.
            var angle = angle(0, 0, pos[0], pos[1]);

            // Text.
            if (this.scale > 0.6) {
                // Get the text's angle. Rotate it.
                ctx1.save();
                ctx1.translate(pos[0], pos[1]);
                ctx1.rotate(angle);

                let moveX = 0;
                let moveY = 0;
                // handle special case where label is on the very top and bottom quarter of the circle
                // we move the label along side the Y axis instead of X
                if ((2 * Math.PI) / 3 > Math.abs(angle) >= Math.PI / 3) {
                    moveY = pos[0] > 0 ? 15 : -15;
                    moveX = 0;
                } else {
                    moveX = pos[0] > 0 ? 15 : -15;
                    moveY = 0;
                }

                // Flip if on left side of chart.
                if (pos[0] < 0) {
                    ctx1.textAlign =
                        node.data.level !== 'domain' ? 'end' : 'start';

                    ctx1.rotate(Math.PI);
                } else {
                    ctx1.textAlign =
                        node.data.level !== 'domain' ? 'start' : 'end';
                }

                ctx1.strokeStyle = '#1e293b';
                ctx1.lineWidth = 4;

                ctx1.strokeText(node.data.skill_name, moveX, moveY);
                // domain label will have lighter tone color
                ctx1.fillStyle =
                    node.data.level !== 'domain' ? '#FFF' : '#afb9c9';
                ctx1.fillText(node.data.skill_name, moveX, moveY);
                ctx1.restore();
            }

            // Hidden context.
            ctx2.beginPath();
            ctx2.moveTo(pos[0], pos[1]);
            ctx2.arc(pos[0], pos[1], size, 0, 2 * Math.PI);
            ctx2.fill();

            // Render sub skills.
            if (node.data.type == 'super') {
                for (let i = 0; i < node.data.subskills.length; i++) {
                    // Calculate the increment of the subskills, around a circle.
                    let increment = 360 / node.data.subskills.length;
                    // Get the correct index number.
                    let subSkillsIndex = i;
                    // Calculate the nodes angle.
                    let angle = increment * subSkillsIndex;
                    let rads = (angle * Math.PI) / 180;
                    let x = 20 * Math.cos(rads);
                    let y = 20 * Math.sin(rads);
                    ctx1.beginPath();
                    ctx1.moveTo(pos[0], pos[1]);
                    ctx1.arc(pos[0] + x, pos[1] + y, 5, 0, 2 * Math.PI);
                    ctx1.fillStyle = color;
                    ctx1.fill();

                    ctx2.beginPath();
                    ctx2.moveTo(pos[0], pos[1]);
                    ctx2.arc(pos[0] + x, pos[1] + y, 5, 0, 2 * Math.PI);
                    ctx2.fill();
                }
            }
        },
        drawLink(link) {
            const linkGenerator = d3
                .linkRadial()
                .angle((d) => d.x)
                .radius((d) => d.y)
                .context(this.context);

            // If skill is mastered.
            let color = '#71717a';
            if (link.target.data.is_mastered == 1) {
                this.context.lineWidth = 4;
                color = '#ffffff';
            } else this.context.lineWidth = 1;

            this.context.beginPath();
            linkGenerator(link);
            this.context.strokeStyle = color;
            this.context.stroke();
        },
        genColor() {
            var ret = [];
            // via http://stackoverflow.com/a/15804183
            if (this.nextCol < 16777215) {
                ret.push(this.nextCol & 0xff); // R
                ret.push((this.nextCol & 0xff00) >> 8); // G
                ret.push((this.nextCol & 0xff0000) >> 16); // B

                this.nextCol += 100; // This is exagerated for this example and would ordinarily be 1.
            }
            var col = 'rgb(' + ret.join(',') + ')';
            return col;
        },
        zoomed(transform) {
            // For the regular canvas.
            this.context.save();
            this.hiddenCanvasContext.save();
            // Clear all content and repaint background colour.
            this.context.fillStyle = '#1e293b';
            this.context.fillRect(
                (this.width / 2) * -1,
                (this.height / 2) * -1,
                this.width,
                this.height
            );

            this.hiddenCanvasContext.clearRect(
                (this.width / 2) * -1,
                (this.height / 2) * -1,
                this.width,
                this.height
            );
            this.context.translate(transform.x, transform.y);
            this.context.scale(transform.k, transform.k);

            this.hiddenCanvasContext.translate(transform.x, transform.y);
            this.hiddenCanvasContext.scale(transform.k, transform.k);

            this.drawTree();
            this.context.fill();
            this.context.restore();
            this.hiddenCanvasContext.fill();
            this.hiddenCanvasContext.restore();
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
        async printPDF() {
            // Get the data for the print version (different to the digital version).
            await this.getPrintAlgorithm();

            // Select the element from the DOM.
            var svg = document.getElementById('radialTree');
            // Then select with D3
            var d3Svg = d3.select(svg);
            // Then select the SVG code with D3
            var d3SvgNode = d3Svg.node();

            // Make it a string, to send to server.
            var s = new XMLSerializer();
            var str = s.serializeToString(d3SvgNode);

            // Create a JSON object.
            var dataObject = { svg: str, treeType: 'radial' };
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
        async getPrintAlgorithm() {
            await this.skillTreeStore.getUserSkills();
            const skill = {
                name: 'SKILLS',
                sprite: null,
                children: this.skillTreeStore.userSkills
            };
            var skillsWithSubSkillsMoved = [];
            skillsWithSubSkillsMoved = JSON.parse(
                JSON.stringify(skill.children)
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

            const data = {
                skill_name: 'My skills',
                children: skillsWithSubSkillsMoved
            };

            // Build the SVG tree.
            await this.createSVGTree(data);
        },
        async createSVGTree(data) {
            const width = 24000;
            const height = 24000;
            const cx = width * 0.55;
            const cy = height * 0.59;
            // Create a radial tree layout. The layout’s first dimension (x)
            // is the angle, while the second (y) is the radius.
            const tree = d3
                .tree()
                // increase the radius to space out the nodes.
                .size([2 * Math.PI, this.radius * 50])
                // Max separation between sibling nodes.
                .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);

            // Sort the tree and apply the layout.
            const root = tree(d3.hierarchy(data));

            let svg = d3
                .create('svg')
                // Add ID for the printing to PDF.
                .attr('id', 'radialTree')
                .attr('width', width)
                .attr('height', height)
                .attr('viewBox', [-cx, -cy, width, height])
                .attr(
                    'style',
                    'max-width: 100%; height: auto; font: 10px sans-serif;'
                );

            // Links or connecting lines.
            svg.append('g')
                .attr('fill', 'none')
                .attr('stroke-opacity', 1)
                .selectAll()
                .data(root.links())
                .join('path')
                .attr(
                    'd',
                    d3
                        .linkRadial()
                        .angle((d) => d.x)
                        .radius((d) => d.y)
                )
                .attr('stroke', function (d) {
                    return '#000';
                })
                .attr('stroke-width', function (d) {
                    if (d.target.data.is_mastered == 1) {
                        return 4;
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

            svg.append('g')
                .selectAll()
                .data(root.descendants())
                .join('circle')
                .attr(
                    'transform',
                    (d) =>
                        `rotate(${(d.x * 180) / Math.PI - 90}) translate(${
                            d.y
                        },0)`
                )
                .attr('fill', '#000')
                .attr('r', 2.5);

            // Labels.
            svg.append('g')
                .attr('stroke-linejoin', 'round')
                .attr('stroke-width', 1)
                .selectAll()
                .data(root.descendants())
                .join('text')
                .attr(
                    'transform',
                    (d) =>
                        `rotate(${(d.x * 180) / Math.PI - 90}) translate(${
                            d.y
                        },0) rotate(${d.x >= Math.PI ? 180 : 0})`
                )
                .attr('dy', '0.31em')
                .attr('x', (d) => (d.x < Math.PI === !d.children ? 6 : -6))
                .attr('text-anchor', (d) =>
                    d.x < Math.PI === !d.children ? 'start' : 'end'
                )
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
                .style('paint-order', function (d) {
                    return 'stroke';
                })
                // TODO: Add white stroke to labels.
                // .style('stroke', function (d) {
                //     return '#000000';
                // })

                .clone(true)
                .lower()
                .style('stroke-width', function (d) {
                    return '1px';
                })
                .text(function (d) {
                    // If the node is a super node end node.
                    if (d.data.position == 'end') {
                        return '';
                    } else return d.data.skill_name;
                });

            // Append the SVG element.
            document.querySelector('#SVGskilltree').append(svg.node());
        },
        // zoom and move the tree to it initial position
        defaultPosition() {
            d3.select(this.context.canvas)
                .transition()
                .duration(300)
                .call(
                    this.d3Zoom.transform,
                    d3.zoomIdentity.translate(0, 0).scale(0.08)
                );
        }
    }
};
</script>

<template>
    <!-- <button id="print-btn" class="btn btn-info" @click="printPDF()">
        Print
    </button> -->
    <!-- Loading animation -->
    <div
        v-if="isLoading == true"
        class="loading-animation d-flex justify-content-center align-items-center py-4"
    >
        <span class="loader"></span>
    </div>
    <!-- Wrapper is for the dark overlay, when the sidepanel is displayed -->
    <div v-show="isLoading == false" id="wrapper">
        <SkillPanel :skill="skill" />
        <canvas id="canvas" width="1500" height="1500"></canvas>
        <canvas id="hidden-canvas" width="1500" height="1500"></canvas>
        <div id="SVGskilltree"></div>

        <div id="sidepanel-backdrop"></div>
    </div>
</template>

<style scoped>
.loader {
    width: 48px;
    height: 48px;
    border: 5px solid #a48be5;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
/* End of loading animation */

#wrapper {
    width: 100%;
    height: 100%;
    height: calc(100% - 53px);
    overflow: hidden;
    position: relative;
}

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

/* #print-btn {
    position: absolute;
    right: 0;
    z-index: 1;
    margin-top: 10px;
    margin-right: 10px;
} */

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

@media (max-width: 820px) {
    .flex-container {
        flex-direction: column;
    }
    #wrapper {
        height: calc(100% - 66px);
    }
}

@media screen and (min-width: 992px) {
    /* Loading animation */
    .loading-animation {
        min-height: 100%;
        position: fixed;
        top: 50%;
        left: 50%;
        -webkit-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
    }
}
</style>
