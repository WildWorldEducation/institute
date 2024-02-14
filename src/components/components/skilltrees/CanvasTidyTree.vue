<script>
// Import the stores.
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useSkillTreeStore } from '../../../stores/SkillTreeStore';

import * as d3 from 'd3';
// // Import Pixi JS.
// import * as PIXI from 'pixi.js';
// // Import Pixi Viewprt.
// import { Viewport } from 'pixi-viewport';
// // For pixi to use custom fonts.
// import FontFaceObserver from 'fontfaceobserver';

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
                sprite: null
            },
            tree: {},
            root: {},
            context: {},
            hiddenCanvasContext: {},
            panX: 5,
            panY: 0,
            scale: 0.5,
            translatePos: { x: 50, y: 50 },
            scaleMultiplier: 0.8,
            startDragOffset: { x: 0, y: 0 },
            mouseDown: false,
            r: 1.5,
            nodes: [],
            nextCol: 1,
            colToNode: {}
        };
    },
    async mounted() {
        if (this.skillTreeStore.userSkills.length == 0) {
            await this.skillTreeStore.getUserSkills();
        }

        // Specify the chart’s dimensions.
        //  this.width = window.innerWidth;
        this.height = window.innerHeight;

        //  document.querySelector('#skilltree').appendChild(this.$pixiApp.view);
        let canvas = document.getElementById('canvas');
        this.context = canvas.getContext('2d');

        this.skill = {
            name: 'SKILLS',
            sprite: null,
            children: this.skillTreeStore.userSkills
        };

        this.getAlgorithm();

        // Pan and zoom.
        // d3.select(this.context.canvas).call(
        //     d3
        //         .zoom()
        //         .scaleExtent([0.2, 8])
        //         .on('zoom', ({ transform }) => this.zoomed(transform))
        // );

        // Interactivity.
        let hiddenCanvas = document.getElementById('hidden-canvas');
        this.hiddenCanvasContext = hiddenCanvas.getContext('2d');
        //  hiddenCanvas.style.display = 'none';

        // Listen for clicks on the main canvas
        canvas.addEventListener('click', (e) => {
            // We actually only need to draw the hidden canvas when
            // there is an interaction. This sketch can draw it on
            // each loop, but that is only for demonstration.
            this.drawTree(true);

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
            console.log(col);
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
                //  controls.lastClickedIndex = node.index;
                //   lastClicked.updateDisplay();
                //  animateHidden.updateDisplay();
                console.log('Clicked on node with index:', node.index, node);
            }
        });
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

            // Compute the tree height; this approach will allow the height of the
            // SVG to scale according to the breadth (width) of the tree layout.
            this.root = d3.hierarchy(data);
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

            // console.log(this.tree);
            // console.log(root.links());

            this.drawTree(false);
        },
        drawTree(hidden) {
            //  this.context.clearRect(0, 0, this.width, this.height);

            this.nodes = this.root.descendants();

            if (!hidden) {
                const links = this.root.links();
                this.context.beginPath();
                for (const link of links) {
                    this.drawLink(link);
                }
            }

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
                if (hidden) {
                    if (node.__pickColor === undefined) {
                        // If we have never drawn the node to the hidden canvas get a new
                        // color for it and put it in the dictionary. genColor returns a new color
                        // every time it is called.
                        node.__pickColor = this.genColor();
                        this.colToNode[node.__pickColor] = node;
                    }
                    // On the hidden canvas each rectangle gets a unique color.
                    this.hiddenCanvasContext.fillStyle = node.__pickColor;
                }

                // Draw the actual shape
                this.drawNode(hidden, node);
            }

            //    this.context.restore();
        },
        drawNode(hidden, node) {
            //   console.log(node);
            let ctx;
            if (hidden) {
                ctx = this.hiddenCanvasContext;
            } else {
                ctx = this.context;
            }
            ctx.beginPath();
            ctx.moveTo(node.y, node.x + 500);
            ctx.arc(node.y, node.x + 500, 10, 0, 2 * Math.PI);
            //    ctx.fillStyle = '#000';
            ctx.fill();

            ctx.beginPath();
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 4;
            ctx.strokeText(node.data.skill_name, node.y + 10, node.x + 502);
            ctx.fillStyle = '#000';
            ctx.fillText(node.data.skill_name, node.y + 10, node.x + 502);
        },
        drawLink(link) {
            const linkGenerator = d3
                .linkHorizontal()
                .x((d) => d.y)
                .y((d) => d.x + 500)
                .context(this.context);

            this.context.lineWidth = 1;
            this.context.beginPath();
            linkGenerator(link);
            this.context.strokeStyle = '#000';
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
            this.context.save();
            this.context.clearRect(
                0,
                0,
                this.context.canvas.width,
                this.context.canvas.height
            );
            this.context.translate(transform.x, transform.y);
            this.context.scale(transform.k, transform.k);
            this.context.beginPath();

            const links = this.root.links();
            const nodes = this.root.descendants();

            this.drawTree();

            for (let i = 0; i < nodes.length; i++) {
                this.context.moveTo(i.x + this.r, i.y);
                this.context.arc(i.x, i.y, this.r, 0, 2 * Math.PI);
            }

            // for (const [x, y] of data) {
            //     this.context.moveTo(x + this.r, y);
            //     this.context.arc(x, y, this.r, 0, 2 * Math.PI);
            // }
            this.context.fill();
            this.context.restore();
        },
        panRight() {
            this.panX = 0;
            this.panY = 0;
            this.panX = this.panX + 50 / this.scale;
            this.redraw();
        },
        panLeft() {
            this.panX = 0;
            this.panY = 0;
            this.panX = this.panX - 50 / this.scale;
            this.redraw();
        },
        panUp() {
            this.panX = 0;
            this.panY = 0;
            this.panY = this.panY + 50 / this.scale;
            this.redraw();
        },
        panDown() {
            this.panX = 0;
            this.panY = 0;
            this.panY = this.panY - 50 / this.scale;
            this.redraw();
        },
        redraw() {
            // Store the current transformation matrix
            this.context.save();

            // Use the identity matrix while clearing the canvas
            this.context.setTransform(1, 0, 0, 1, 0, 0);
            this.context.clearRect(
                0,
                0,
                this.context.canvas.width,
                this.context.canvas.height
            );
            this.context.beginPath();

            // Restore the transform
            this.context.restore();
            this.drawTree();
        },
        zoomOut() {
            // this.scale = this.scale / 2;
            // this.context.scale(0.5, 0.5);
            // this.redraw();

            this.scale /= this.scaleMultiplier;
            this.drawTree(this.scale, this.translatePos);
        },
        zoomIn() {
            // this.scale = this.scale * 2;
            // this.context.scale(2, 2);
            // this.redraw();

            this.scale *= this.scaleMultiplier;
            this.drawTree(this.scale, this.translatePos);
        }
    }
};
</script>

<template>
    <!-- <button @click="panLeft">pan left</button>
    <button @click="panRight">pan right</button>
    <button @click="panUp">pan up</button>
    <button @click="panDown">pan down</button>
    <div id="buttonWrapper">
        <input type="button" @click="zoomOut" value="+" />
        <input type="button" @click="zoomIn" value="-" />
    </div> -->
    <!-- <button @click="zoomOut">zoom out</button>
    <button @click="zoomIn">zoom in</button> -->
    <canvas id="canvas" width="1500" height="1500"></canvas>
    <canvas id="hidden-canvas" width="1500" height="1500"></canvas>
    <!-- <div id="skilltree"></div> -->
</template>

<style scoped>
#wrapper {
    position: relative;
    border: 1px solid #9c9898;
    width: 578px;
    height: 200px;
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
