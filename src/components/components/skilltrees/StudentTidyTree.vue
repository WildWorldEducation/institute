<script>
// Import the stores.
import { useSkillTreeStore } from '../../../stores/SkillTreeStore';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';
// Nested components.
import SkillPanel from './../SkillPanel.vue';
import NewSkillPanel from '../NewSkillPanel.vue';
import ZoomControl from './ZoomControl.vue';
import JoystickControl from './JoystickControl.vue';

// Algorithm.
import * as d3 from 'd3';

export default {
    setup() {
        const skillTreeStore = useSkillTreeStore();
        const userDetailsStore = useUserDetailsStore();
        return {
            skillTreeStore,
            userDetailsStore
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
                container: null,
                name: null,
                description: null,
                tagIDs: [],
                sprite: null,
                type: null
            },
            tree: {},
            root: {},
            context: {},
            r: 1.5,
            nodes: [],
            nextCol: 1,
            colToNode: {},
            isSkillInfoPanelShown: false,
            scale: 0.3,
            panX: 0,
            panY: 0,
            // Printing
            data: {},
            // We store the d3 zoom call so the slider can call it
            d3Zoom: null,
            // For the loading animation.
            isLoading: true,
            showSkillPanel: false,
            // transform object use to translate canvas context
            transformData: {
                x: 0,
                y: 0,
                k: 0
            }
        };
    },
    props: ['studentId', 'studentName', 'restartTutorial'],
    components: {
        SkillPanel,
        NewSkillPanel,
        ZoomControl,
        JoystickControl
    },
    async mounted() {
        await this.skillTreeStore.getStudentSkillTree(
            this.studentId,
            this.$parent.gradeFilter,
            this.$parent.subjectFilters,
            this.$parent.isUnlockedSkillsOnlyFilter
        );

        // Specify the chart’s dimensions.
        this.height = window.innerHeight;
        this.width = window.innerWidth;

        this.skill = {
            name: 'SKILLS',
            sprite: null,
            children: this.skillTreeStore.studentSkillTree
        };

        this.getAlgorithm();

        // Zoom and pan with mouse
        // We have to construct the d3 zoom function and assign the zoom event
        this.d3Zoom = d3
            .zoom()
            .scaleExtent([0.1, 5])
            .on('zoom', ({ transform }) => {
                this.drawTree(transform);
                // update slider percent ( Handle by us not d3 but will invoke when the d3 zoom event is call )
            });

        // Bind the above object to canvas so it can zoom the tree
        d3.select(this.context.canvas).call(this.d3Zoom);

        // Set initial zoom value.
        this.resetPos();

        // For the loading animation.
        this.isLoading = false;
    },
    methods: {
        getAlgorithm() {
            this.data = {
                skill_name: 'My skills',
                children: this.skill.children
            };

            // Compute the tree height; this approach will allow the height of the
            // SVG to scale according to the breadth (width) of the tree layout.
            this.root = d3.hierarchy(this.data);

            // Node width and height
            // Height
            const dx = 24;
            // Width
            const dy = 270;

            // Create a tree layout.
            this.tree = d3.tree().nodeSize([dx, dy]);

            // Sort the tree and apply the layout.
            this.root.sort((a, b) => d3.ascending(a.data.name, b.data.name));
            this.tree(this.root);

            // Compute the extent of the tree. Note that x and y are swapped here
            // because in the tree layout, x is the breadth, but when displayed, the
            // tree extends right rather than down.
            let x0 = Infinity;
            let x1 = -x0;
            this.root.each((d) => {
                if (d.x > x1) x1 = d.x;
                if (d.x < x0) x0 = d.x;
            });

            var canvas = document.getElementById('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            this.context = canvas.getContext('2d');

            this.drawTree(d3.zoomIdentity);
        },
        drawTree(transform) {
            this.nodes = this.root.descendants();

            // Zoom and pan.
            this.context.save();
            // Clear canvases.
            this.context.clearRect(
                0,
                0,
                this.context.canvas.width,
                this.context.canvas.height
            );
            this.context.translate(transform.x, transform.y);
            this.context.scale(transform.k, transform.k);

            // For node labels to appear at correct zoom level.
            this.scale = transform.k;
            this.panX = transform.x;
            this.panY = transform.y;

            // Draw links.
            const links = this.root.links();
            this.context.beginPath();
            for (const link of links) {
                // Commented out as is buggy, lines that should be showing are disappearing on pan or zoom
                // Check if the links are in view.
                // Dont render them if they are not, for performance benefit.
                // const targetNodeInView = this.checkingIfNodeInView(
                //     link.target,
                //     transform
                // );
                // const sourceNodeInView = this.checkingIfNodeInView(
                //     link.source,
                //     transform
                // );
                // if (!targetNodeInView && !sourceNodeInView) {
                //     continue;
                // }

                this.drawLink(link);
            }

            // Draw nodes.
            this.context.beginPath();
            for (const node of this.nodes) {
                // Check if the nodes are in view.
                // Dont render them if they are not, for performance benefit.
                const nodeInView = this.checkingIfNodeInView(node, transform);
                if (!nodeInView) {
                    continue;
                }

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
                // Draw the actual shape
                this.drawNode(node);
            }

            this.context.restore();
        },
        drawNode(node) {
            // Make sure the nodes have solid outlines
            this.context.setLineDash([]);

            let ctx1 = this.context;

            // Visible context.
            // If not a domain, make node a circle.
            if (node.data.type != 'domain') {
                ctx1.beginPath();
                // Node size
                let radius;
                if (node.data.type == 'sub') {
                    radius = 7.5;
                } else {
                    radius = 10;
                }
                ctx1.arc(node.y, node.x, radius, 0, 2 * Math.PI);
                // get the color associate with skill level
                const skillColor = node.data.level
                    ? this.hexColor(node.data.level)
                    : '#000';

                // If mastered, make a solid shape.
                if (node.data.is_mastered == 1) {
                    ctx1.fillStyle = skillColor;
                    ctx1.fill();
                    const outlineColor = this.hexBorderColor(node.data.level);
                    ctx1.lineWidth = 2;
                    ctx1.strokeStyle = outlineColor;
                    ctx1.stroke();
                }
                // If not, just an outline.
                else {
                    ctx1.lineWidth = 2;
                    ctx1.fillStyle = '#FFF';
                    ctx1.fill();
                    ctx1.strokeStyle = skillColor;
                    ctx1.stroke();
                }
            } else {
                // Domain node styling
                ctx1.beginPath();
                // Make domain nodes visually different - larger, semi-translucent
                const radius = 12;
                ctx1.arc(node.y, node.x, radius, 0, 2 * Math.PI);

                // Semi-translucent fill to indicate "don't click here first"
                ctx1.fillStyle = 'rgba(220, 220, 220, 0.6)';
                ctx1.fill();

                // Lighter border
                ctx1.lineWidth = 1.5;
                ctx1.strokeStyle = '#a0a0a0';
                ctx1.setLineDash([3, 2]); // Dotted line to indicate "container"
                ctx1.stroke();
            }

            // Text.
            if (this.scale > 0.6) {
                // to avoid sharp artifacts with the stroke of the text.
                ctx1.lineJoin = 'bevel';

                // we move the skill name to the left and change the color if it a domain node
                // using the non domain as if condition will save us some compute time as none domain node is more common
                if (node.data.type != 'domain') {
                    ctx1.beginPath();
                    ctx1.strokeStyle = '#FFF';
                    ctx1.lineWidth = 4;
                    ctx1.fillStyle = '#000';
                    ctx1.font = 'normal';
                    ctx1.direction = 'ltr';
                    // Font size
                    ctx1.font = '12px Arial';
                    if (node.data.type == 'sub') {
                        ctx1.font = '10px Arial';
                    }
                    ctx1.strokeText(
                        node.data.skill_name,
                        node.y + 15,
                        node.x + 2
                    );
                    ctx1.fillText(
                        node.data.skill_name,
                        node.y + 15,
                        node.x + 2
                    );
                } else {
                    ctx1.beginPath();
                    ctx1.strokeStyle = '#FFF';
                    ctx1.lineWidth = 4;
                    // Changed domain text color to be darker (previously #849cab/ #aabbc5)
                    ctx1.fillStyle = '#546673';
                    ctx1.direction = 'rtl';
                    ctx1.strokeText(
                        node.data.skill_name,
                        node.y - 5,
                        node.x + 2
                    );
                    ctx1.fillText(node.data.skill_name, node.y - 5, node.x + 2);
                }
            }
        },
        drawLink(link) {
            const linkGenerator = d3
                .linkHorizontal()
                .x((d) => d.y)
                .y((d) => d.x)
                .context(this.context);

            // If skill is mastered.
            if (link.target.data.is_mastered == 1) {
                this.context.lineWidth = 2;
                this.context.strokeStyle = '#8d6ce7';
            } else {
                this.context.lineWidth = 2;
                // Determine colour of links based on user's theme
                if (this.userDetailsStore.theme == 'original')
                    this.context.strokeStyle = '#000';
                else if (this.userDetailsStore.theme == 'instructor') {
                    this.context.strokeStyle = '#000';
                } else this.context.strokeStyle = '#000';
            }

            if (
                (link.source.data.type == 'super' &&
                    link.target.data.position == 'end') ||
                link.target.data.type == 'sub'
            ) {
                this.context.setLineDash([5, 3]);
            } else {
                this.context.setLineDash([]);
            }

            this.context.beginPath();
            linkGenerator(link);
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
            const height = x1 - x0 + dx * 2;

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
        },
        resetPos() {
            d3.select(this.context.canvas)
                .transition()
                .duration(700)
                .call(
                    this.d3Zoom.transform,
                    d3.zoomIdentity
                        .translate(
                            this.context.canvas.width / 2,
                            this.context.canvas.height / 2
                        )
                        .scale(0.3)
                );
        },
        // programmatic d3 zoom
        zoomInD3(scale, panX, panY) {
            d3.select(this.context.canvas).call(
                this.d3Zoom.transform,
                d3.zoomIdentity.translate(panX, panY).scale(scale)
            );
        },
        // Pan with arrow keys.
        panInD3() {
            d3.select(this.context.canvas).call(
                this.d3Zoom.transform,
                d3.zoomIdentity
                    .translate(this.panX, this.panY)
                    .scale(this.scale)
            );
        },
        // Return the hex code for each skill base on it education grade ( eg: primary school, high school ...)
        hexColor(skillLevel) {
            switch (skillLevel) {
                case 'college':
                    return '#ab94e3';
                case 'grade_school':
                    return '#36bbaa';
                case 'high_school':
                    return '#3983dd';
                case 'middle_school':
                    return '#97c8f7';
                case 'phd':
                    return '#a48be5';
                default:
                    break;
            }
        },
        // We using a darker color for node border when it is mastered
        hexBorderColor(skillLevel) {
            switch (skillLevel) {
                case 'college':
                    return '#8271ab';
                case 'grade_school':
                    return '#2a9184';
                case 'high_school':
                    return '#2d67ad';
                case 'middle_school':
                    return '#769dc2';
                case 'phd':
                    return '#826eb5';
                default:
                    break;
            }
        },
        checkingIfNodeInView(node, transformData) {
            // Calculate max visible range
            // Visible range is the rectangle with width and height equal to canvas context
            // Every time context is translate the visible range is changing too

            const visibleRangeY = transformData.y - this.height;
            // Calculate real position of node with current scale
            let realPositionX = node.y * transformData.k;
            let realPositionY = -node.x * transformData.k;

            // I acctually come up with this fomula base on obserse the changing of translate and node position when translate context
            // It dosen`t make sense to me but some how woking correctly
            let combinePosition = transformData.x + realPositionX;
            if (
                combinePosition > 0 &&
                combinePosition < this.width &&
                transformData.y > realPositionY &&
                realPositionY > visibleRangeY
            ) {
                return true;
            }
            return false;
        },
        async reloadTree(
            studentId,
            gradeFilter,
            subjectFilters,
            isUnlockedSkillsOnlyFilter
        ) {
            await this.skillTreeStore.getStudentSkillTree(
                studentId,
                gradeFilter,
                subjectFilters,
                isUnlockedSkillsOnlyFilter
            );

            this.skill = {
                name: 'SKILLS',
                sprite: null,
                children: this.skillTreeStore.studentSkillTree
            };

            this.getAlgorithm();

            // Zoom and pan with mouse
            // We have to construct the d3 zoom function and assign the zoom event
            this.d3Zoom = d3
                .zoom()
                .scaleExtent([0.1, 5])
                .on('zoom', ({ transform }) => {
                    this.drawTree(transform);
                    // update slider percent ( Handle by us not d3 but will invoke when the d3 zoom event is call )
                });

            // Bind the above object to canvas so it can zoom the tree
            d3.select(this.context.canvas).call(this.d3Zoom);

            // Set initial zoom value.
            this.resetPos();

            // For the loading animation.
            this.isLoading = false;
        },
        // Grade level, root subject, unlocked skills filters
        async filter(
            studentId,
            gradeFilter,
            subjectFilters,
            isUnlockedSkillsOnlyFilter
        ) {
            this.skill.children = await this.reloadTree(
                studentId,
                gradeFilter,
                subjectFilters,
                isUnlockedSkillsOnlyFilter
            );
        },
        async findHiddenSkill(searchString) {
            // if we cant find the node it mean the node is hide in children
            var url =
                '/user-skills/find-hidden-skill/' +
                this.userDetailsStore.userId;

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    skillName: searchString
                })
            });
            const data = await res.json();
            if (data?.mess === 'ok') {
                await this.reloadTree();

                try {
                    const resultNode = this.findNodeWithName(searchString);
                    this.goToLocation(resultNode);
                } catch (error) {
                    // Skill get filter by user instead of being hidden
                    // Handle filtered case
                    this.removeFilterForHiddenSkill(searchString);
                }
            }
        }
    }
};
</script>

<template>
    <!-- Loading animation -->
    <div
        v-if="isLoading == true"
        class="loading-animation d-flex justify-content-center align-items-center py-4"
    >
        <span class="loader"></span>
    </div>
    <!-- Wrapper is for the dark overlay, when the sidepanel is displayed -->
    <div v-show="isLoading == false" id="wrapper">
        <!-- <SkillPanel :skill="skill" /> -->
        <SkillPanel :skill="skill" :showSkillPanel="showSkillPanel" />
        <canvas
            id="canvas"
            width="1500"
            height="1500"
            ref="canvas"
            tabindex="1"
        ></canvas>
        <canvas id="hidden-canvas" width="1500" height="1500"></canvas>
        <div id="SVGskilltree"></div>
        <ZoomControl ref="ZoomControl" />
        <div id="sidepanel-backdrop"></div>
        <JoystickControl class="d-none" />
    </div>
</template>

<style scoped>
.skilltree-btns {
    top: 72px;
}

#overlay {
    z-index: 2;
}

canvas {
    cursor: pointer;
    background-color: var(--skill-tree-background-color);
}

.loader {
    width: 48px;
    height: 48px;
    border: 5px solid var(--primary-color);
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

/* ___________ Button Style ___________ */
#controlsWrapper {
    position: absolute;
    width: 200px;
    bottom: 2px;
    left: 2px;
}

.slidecontainer {
    width: 100%; /* Width of the outside container */
}

.slider {
    -webkit-appearance: none;
    width: 100%;
    height: 200px;
    border-radius: 5px;
    background: #d3d3d3;
    outline: none;
    opacity: 0.7;
    -webkit-transition: 0.2s;
    transition: opacity 0.2s;
}

.slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    cursor: pointer;
}

.slider::-moz-range-thumb {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    cursor: pointer;
}
/* Mouse-over effects */
.slider:hover {
    opacity: 1; /* Fully shown on mouse-over */
}

#wrapper {
    width: 100%;
    height: 100%;
    height: 100%;
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

/* ___________ End of Button Style ___________ */

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
    background-color: #184e80;
    border: #184e80;
    color: white;
}

#print-btn:hover {
    background-color: #133b61;
}

#reset-btn {
    position: absolute;
    right: 80px;
    z-index: 1;
    margin-top: 10px;
    margin-right: 10px;
    background-color: #c4d2df;
    border-color: #c4d2df;
    color: black;
}

#reset-btn:hover {
    background-color: #9da7b1;
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
}
/* Loading animation */
.loading-animation {
    min-height: 100%;
    position: fixed;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
}
</style>
