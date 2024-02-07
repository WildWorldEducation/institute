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
            panX: 5,
            panY: 0,
            scale: 0.5,
            translatePos: { x: 50, y: 50 },
            scaleMultiplier: 0.8,
            startDragOffset: { x: 0, y: 0 },
            mouseDown: false
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

        // add event listeners to handle screen drag
        canvas.addEventListener('mousedown', (evt) => {
            this.mouseDown = true;
            this.startDragOffset.x = evt.clientX - this.translatePos.x;
            this.startDragOffset.y = evt.clientY - this.translatePos.y;
        });
        canvas.addEventListener('mouseup', (evt) => {
            this.mouseDown = false;
        });

        canvas.addEventListener('mouseover', (evt) => {
            this.mouseDown = false;
        });

        canvas.addEventListener('mouseout', (evt) => {
            this.mouseDown = false;
        });

        canvas.addEventListener('mousemove', (evt) => {
            if (this.mouseDown) {
                this.translatePos.x = evt.clientX - this.startDragOffset.x;
                this.translatePos.y = evt.clientY - this.startDragOffset.y;
                this.drawTree(this.scale, this.translatePos);
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
            const dx = 12;
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

            this.drawTree(this.scale, this.translatePos);
        },
        drawTree(scale, translatePos) {
            // clear canvas
            this.context.clearRect(
                0,
                0,
                this.context.canvas.width,
                this.context.canvas.height
            );
            this.context.save();
            this.context.translate(this.translatePos.x, this.translatePos.y);
            this.context.scale(scale, scale);

            const links = this.root.links();
            const nodes = this.root.descendants();

            this.context.beginPath();
            for (const link of links) {
                this.drawLink(link);
            }

            this.context.beginPath();
            for (const node of nodes) {
                this.drawNode(node);
            }

            this.context.restore();
        },
        drawNode(node) {
            //   console.log(node);
            this.context.beginPath();
            this.context.moveTo(node.y, node.x + 500);
            this.context.arc(node.y, node.x + 500, 4, 0, 2 * Math.PI);
            this.context.fillStyle = '#000';
            this.context.fill();

            this.context.beginPath();
            this.context.strokeStyle = '#FFF';
            this.context.lineWidth = 4;
            this.context.strokeText(
                node.data.skill_name,
                node.y + 10,
                node.x + 502
            );
            this.context.fillStyle = '#000';
            this.context.fillText(
                node.data.skill_name,
                node.y + 10,
                node.x + 502
            );
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
    <button @click="panDown">pan down</button> -->
    <div id="buttonWrapper">
        <input type="button" @click="zoomOut" value="+" />
        <input type="button" @click="zoomIn" value="-" />
    </div>
    <!-- <button @click="zoomOut">zoom out</button>
    <button @click="zoomIn">zoom in</button> -->
    <canvas id="canvas" width="1500" height="1500"></canvas>
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
