<script>
// Import the stores.
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useSkillTreeStore } from '../../../stores/SkillTreeStore';

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
            hiddenCanvasContext: {},
            scaleMultiplier: 0.8,
            startDragOffset: { x: 0, y: 0 },
            mouseDown: false,
            r: 1.5,
            nodes: [],
            nextCol: 1,
            colToNode: {},
            isSkillInfoPanelShown: false,
            //  firstRender: true,
            scale: 0.3,
            panX: 0,
            panY: 0,
            hiddenCanvasInitiated: false,
            // Printing
            data: {},
            // We store the d3 zoom call so the slider can call it
            d3Zoom: null
        };
    },
    components: {},
    async mounted() {
        // ------------

        if (this.skillTreeStore.userSkills.length == 0) {
            await this.skillTreeStore.getUserSkills();
        }

        // Specify the chart’s dimensions.
        //  this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.skill = {
            name: 'SKILLS',
            sprite: null,
            children: this.skillTreeStore.userSkills
        };

        this.getAlgorithm();

        //Zoom.
        d3.select(this.context.canvas).call(
            d3
                .zoom()
                .scaleExtent([0.1, 5])
                .on('zoom', ({ transform }) => this.drawTree(transform))
        );
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

            // Compute the tree height; this approach will allow the height of the
            // SVG to scale according to the breadth (width) of the tree layout.
            this.root = d3.hierarchy(this.data);
            const dx = 24;
            const dy = this.width / (this.root.height + 1);

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

            // Draw links.
            const links = this.root.links();
            this.context.beginPath();
            for (const link of links) {
                this.drawLink(link);
            }

            // Draw nodes.
            this.context.beginPath();
            for (const node of this.nodes) {
                // Draw the actual shape
                this.drawNode(node);
            }

            this.context.restore();
        },
        drawNode(node) {
            let ctx1 = this.context;

            // Visible context.
            // If not a domain, make node a circle.
            // console.log(node.data.is_mastered);
            if (node.data.type != 'domain') {
                ctx1.beginPath();
                ctx1.arc(node.y, node.x, 10, 0, 2 * Math.PI);
                // If mastered, make a solid shape.
                if (node.data.is_mastered == 1) {
                    ctx1.fillStyle = '#000';
                    ctx1.fill();
                }
                // If not, just an outline.
                else {
                    ctx1.lineWidth = 2;
                    ctx1.fillStyle = '#FFF';
                    ctx1.fill();
                    ctx1.strokeStyle = '#000';
                    ctx1.stroke();
                }
            }
            // If is a domain, make node a diamond.
            else {
                ctx1.beginPath();
                ctx1.moveTo(node.y, node.x - 10);
                // top left edge.
                ctx1.lineTo(node.y - 20 / 2, node.x - 10 + 20 / 2);
                // bottom left edge.
                ctx1.lineTo(node.y, node.x - 10 + 20);
                // bottom right edge.
                ctx1.lineTo(node.y + 20 / 2, node.x - 10 + 20 / 2);
                // closing the path automatically creates the top right edge.
                ctx1.closePath();
                // If mastered, make a solid shape.
                if (node.data.is_mastered == 1) {
                    ctx1.fillStyle = '#000';
                    ctx1.fill();
                }
                // If unlocked, light grey.
                else if (node.data.is_accessible == 1) {
                    ctx1.lineWidth = 2;
                    ctx1.fillStyle = '#D3D3D3';
                    ctx1.fill();
                    ctx1.strokeStyle = '#000';
                    ctx1.stroke();
                }
                // If not, just an outline.
                else {
                    ctx1.lineWidth = 2;
                    ctx1.fillStyle = '#FFF';
                    ctx1.fill();
                    ctx1.strokeStyle = '#000';
                    ctx1.stroke();
                }
            }

            // Text.
            if (this.scale > 0.6) {
                ctx1.beginPath();
                ctx1.strokeStyle = '#FFF';
                ctx1.lineWidth = 4;
                ctx1.strokeText(node.data.skill_name, node.y + 15, node.x + 2);
                ctx1.fillStyle = '#000';
                ctx1.fillText(node.data.skill_name, node.y + 15, node.x + 2);
            }
        },
        drawLink(link) {
            const linkGenerator = d3
                .linkHorizontal()
                .x((d) => d.y)
                .y((d) => d.x)
                .context(this.context);

            // If skill is mastered.
            if (link.target.data.is_mastered == 1) this.context.lineWidth = 4;
            else this.context.lineWidth = 1;

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
            this.context.strokeStyle = '#000';
            this.context.stroke();
        },

        // handle mouse zoom
        handleMouseZoom() {}
    }
};
</script>

<template>
    <button id="print-btn" class="btn btn-info" @click="printPDF()">
        Print
    </button>
    <button id="reset-btn" class="btn btn-primary" @click="resetPos()">
        Reset
    </button>
    <!-- Wrapper is for the dark overlay, when the sidepanel is displayed -->
    <div id="wrapper">
        <canvas
            id="canvas"
            width="1500"
            height="1500"
            ref="canvas"
            tabindex="1"
        ></canvas>
        <canvas id="hidden-canvas" width="1500" height="1500"></canvas>
        <div id="SVGskilltree"></div>
        <div id="sidepanel-backdrop"></div>
    </div>
</template>

<style scoped>
/* ___________ Button Style ___________ */
#controlsWrapper {
    position: absolute;
    width: 200px;
    bottom: 2px;
    left: 2px;
}

#panJoystick {
    width: 100px;
    height: 100px;
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
    height: calc(100% - 92px);
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
    /* overflow: hidden; */
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
