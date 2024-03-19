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
            subSkillRadius: 50,
            sprite: {
                domainNode: null
            }
        };
    },
    components: {
        SkillPanel
    },
    created() {
        // Start the Pixi renderer.
        this.$pixiApp.start();
    },
    async mounted() {
        if (this.skillTreeStore.userSkillsSubSkillsSeparate.length == 0) {
            await this.skillTreeStore.getUserSkillsSubSkillsSeparate();
        }

        this.sprite.domainNode = PIXI.Sprite.from(
            'images/skill-tree-nodes/domain.png'
        );

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
        handelNodeSprite(nodeGraphic, node, nodeContainer) {
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
                    name: node.data.skill_name,
                    masteryRequirements: node.data.mastery_requirements,
                    type: node.data.type
                };
                this.skill = skill;

                if (!this.isSkillInfoPanelShown) {
                    this.showInfoPanel();
                }
            });
        },
        getAlgorithm() {
            var skillsNoSubSkills = [];
            skillsNoSubSkills = JSON.parse(JSON.stringify(this.skill.children));

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
            // draw the tree with hierarchy data
            this.drawTree();
        },
        drawTree() {
            /*
             * Central circle.
             */
            // Graphic.
            const centerNodeSprite = PIXI.Sprite.from('center-node.png'); // central node sprite
            centerNodeSprite.x = this.root.x;
            centerNodeSprite.y = this.root.y;
            centerNodeSprite.anchor.set(0.5);

            // Get the data from D3.
            const nodes = this.root.descendants();
            const links = this.root.links();

            // Draw a circle like in the figma design
            this.drawCircle(this.root);

            // Draw the actual shapes.
            for (const link of links) {
                this.drawLink(link);
            }

            // Add to the global variable container for this chart. (we add the center node after the link so it will render above the line)
            this.$radialTreeContainer.addChild(centerNodeSprite);
            for (const node of nodes) {
                this.drawNode(node);
            }
        },
        // Draw skill nodes and names.
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
            // Get node sprite based on it level and state
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
                    name: node.data.skill_name,
                    masteryRequirements: node.data.mastery_requirements,
                    type: node.data.type
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
                            name: node.data.subskills[i].skill_name,
                            masteryRequirements:
                                node.data.subskills[i].mastery_requirements,
                            type: node.data.subskills[i].type
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
                fontSize = 150;
                fill = '#ffffff';
            } else {
                fontSize = 120;
                fill = '#ffffff';
            }

            const style = new PIXI.TextStyle({
                fontFamily: 'Poppins900',
                fontSize: fontSize,
                fill: fill,
                align: 'center',
                strokeThickness: 6,
                stroke: 'black'
            });

            // Center Node use pixi text and have black text
            if (node.depth == 0) {
                const nameText = new PIXI.Text(node.data.skill_name, style);
                nameText.anchor.set(0.5, 0.5);
                nameText.scale.set(0.5, 0.5);

                // Add to the global variable container for this chart.
                nodeContainer.addChild(nameText);
                return;
            }

            PIXI.Assets.load('/font/Poppins Bold White.xml').then(() => {
                const nameText = new PIXI.BitmapText(node.data.skill_name, {
                    fontName: 'Poppins-White-Bold',
                    fontSize: fontSize,
                    align: 'right'
                });

                // const nameText = new PIXI.Text(node.data.skill_name, style);
                // Rotate skill name base on if their are parent or not
                if (node.depth == 0 || node.depth == 1) {
                    // and not rotated.
                    nameText.anchor.set(0.5, 0.5);
                }
                // The node of depth 2 have a lager sprite than their greater depth node So we have to move it a little bit farther
                else if (node.depth == 2) {
                    // Because this node have bigger sprite so we move them a little farther
                    nameText.angle = (node.x * 180) / Math.PI - 90;
                    if (nodeContainer.x > 0) {
                        nameText.angle = nameText.angle + 90;
                        // If node is a leaf it will be on the outside
                        if (!node.children) {
                            nameText.anchor.set(0, 0.5);
                            // move the tile base on vector math
                            nameText.x =
                                nameText.x + 80 * Math.cos(nameText.rotation);
                            nameText.y =
                                nameText.y + 80 * Math.sin(nameText.rotation);
                            // move the name text toward the middle of the node
                            nameText.x =
                                nameText.x -
                                20 * Math.cos(nameText.rotation + Math.PI / 2);
                            nameText.y =
                                nameText.y -
                                20 * Math.sin(nameText.rotation + Math.PI / 2);
                        } else {
                            nameText.anchor.set(1, 0.5);
                            // move the tile base on vector math
                            nameText.x =
                                nameText.x - 80 * Math.cos(nameText.rotation);
                            nameText.y =
                                nameText.y - 80 * Math.sin(nameText.rotation);
                            // move the name text toward the middle of the node
                            nameText.x =
                                nameText.x -
                                20 * Math.cos(nameText.rotation + Math.PI / 2);
                            nameText.y =
                                nameText.y -
                                20 * Math.sin(nameText.rotation + Math.PI / 2);
                        }
                    } else {
                        nameText.anchor.set(0, 0.5);
                        nameText.angle = nameText.angle - 90;
                        if (!node.children) {
                            nameText.anchor.set(1, 0.5);
                            // move the tile base on vector math
                            nameText.x =
                                nameText.x - 80 * Math.cos(nameText.rotation);
                            nameText.y =
                                nameText.y - 80 * Math.sin(nameText.rotation);
                            // move the name text toward the middle of the node
                            nameText.x =
                                nameText.x +
                                20 * Math.cos(nameText.rotation + Math.PI / 2);
                            nameText.y =
                                nameText.y +
                                20 * Math.sin(nameText.rotation + Math.PI / 2);
                        } else {
                            // move the tile base on vector math
                            nameText.x =
                                nameText.x + 80 * Math.cos(nameText.rotation);
                            nameText.y =
                                nameText.y + 80 * Math.sin(nameText.rotation);
                            // move the name text toward the middle of the node
                            nameText.x =
                                nameText.x -
                                20 * Math.cos(nameText.rotation + Math.PI / 2);
                            nameText.y =
                                nameText.y -
                                20 * Math.sin(nameText.rotation + Math.PI / 2);
                        }
                    }
                } else if (node.depth > 2) {
                    // For all the outer nodes, the text is only partly centred,
                    // and it is rotated.
                    nameText.angle = (node.x * 180) / Math.PI - 90;
                    // Right side of the circle
                    if (nodeContainer.x > 0) {
                        nameText.angle = nameText.angle + 90;
                        // If node is a leaf it will be on the outside
                        if (!node.children) {
                            nameText.anchor.set(0, 0.5);
                            // move the tile base on vector math
                            nameText.x =
                                nameText.x + 50 * Math.cos(nameText.rotation);
                            nameText.y =
                                nameText.y + 50 * Math.sin(nameText.rotation);
                            // move the name text toward the middle of the node
                            nameText.x =
                                nameText.x -
                                20 * Math.cos(nameText.rotation + Math.PI / 2);
                            nameText.y =
                                nameText.y -
                                20 * Math.sin(nameText.rotation + Math.PI / 2);
                        }
                        // If the name skill of the node that have children it will be on the inside
                        else {
                            nameText.anchor.set(1, 0.5);
                            // move the tile base on vector math
                            nameText.x =
                                nameText.x - 50 * Math.cos(nameText.rotation);
                            nameText.y =
                                nameText.y - 50 * Math.sin(nameText.rotation);
                            // move the name text toward the middle of the node
                            nameText.x =
                                nameText.x +
                                20 * Math.cos(nameText.rotation + Math.PI / 2);
                            nameText.y =
                                nameText.y -
                                20 * Math.sin(nameText.rotation + Math.PI / 2);
                        }
                    }
                    // Left side of the circle
                    else {
                        nameText.anchor.set(0, 0.5);
                        nameText.angle = nameText.angle - 90;
                        // Leaf node
                        if (!node.children) {
                            nameText.anchor.set(1, 0.5);
                            // move the tile base on vector math
                            nameText.x =
                                nameText.x - 50 * Math.cos(nameText.rotation);
                            nameText.y =
                                nameText.y - 50 * Math.sin(nameText.rotation);
                            // move the name text toward the middle of the node
                            nameText.x =
                                nameText.x -
                                20 * Math.cos(nameText.rotation + Math.PI / 2);
                            nameText.y =
                                nameText.y -
                                20 * Math.sin(nameText.rotation + Math.PI / 2);
                        } else {
                            // move the tile base on vector math
                            nameText.x =
                                nameText.x + 50 * Math.cos(nameText.rotation);
                            nameText.y =
                                nameText.y + 50 * Math.sin(nameText.rotation);
                            // move the name text toward the middle of the node
                            nameText.x =
                                nameText.x -
                                20 * Math.cos(nameText.rotation + Math.PI / 2);
                            nameText.y =
                                nameText.y -
                                20 * Math.sin(nameText.rotation + Math.PI / 2);
                        }
                    }
                }

                nameText.scale.set(0.5, 0.5);

                // Add to the global variable container for this chart.
                nodeContainer.addChild(nameText);
            });
        },
        drawLink(link) {
            const nodeLink = new PIXI.Graphics();
            let lineWidth = 0;
            let color = 0x71717a;
            // If skill is mastered, make line thicker.
            if (link.target.data.is_mastered == '1') {
                lineWidth = 23;
                color = 0xffffff;
            } else {
                lineWidth = 15;
            }

            nodeLink.lineStyle(lineWidth, color, 0.85);

            // Source node.
            var sourceX = Math.cos(link.source.x) * link.source.y;
            var sourceY = Math.sin(link.source.x) * link.source.y;
            nodeLink.moveTo(sourceX, sourceY);

            // Target node.
            var targetX = Math.cos(link.target.x) * link.target.y;
            var targetY = Math.sin(link.target.x) * link.target.y;
            //nodeLink.lineTo(targetX, targetY);

            // Some mathematic equation to calculate control point
            /**
             *  A(a, b), B(c, d)
             *  -- Equation of Line create by two point A and B
             *  (b-d)(x-a)+(c-a)(y-b)=0
             *  ------------------------
             * FIND Y
             *   (y-b) = -((b-d)(x-a))/(c-a)
             *   y = -((0-d)(x-0))/(c-0)
             *   y = dx/c
             * -------------------------
             * FIND X
             * (x-a) = {-(c-a)(y-b)} / (b-d)
             *  x - 0 = (-cy) / (-d)
             *  x = cy/d
             * -------------------------
             *
             * ** calculate angle between two vector
             *
             * Normal Vector
             * m((b-d),(c-a)) => m(-d,c)
             *
             * Normal Vector of the default line
             * dm(-1,0)
             * -------------------------
             *  angel of the current line with default line
             *  alpha = (absolute(d)) / sqrt(d^2 + c^2) || radiant
             *  degree = alpha * 180/pi
             */

            // we have to handle each radiant quadrant separately

            let c1x, c1y, c2x, c2y;

            // Calculate the angle of the point in circle (this to determine the position of point in radiant circle)
            const angle =
                (Math.abs(targetY) /
                    Math.sqrt(targetY * targetY + targetX * targetX)) *
                (180 / Math.PI);

            // Root Node
            if (sourceX === 0) {
                c1x = sourceX;
                c1y = 4500;
                c2x = targetX - 800;
                c2y = (targetY * c2x) / targetX;
                // top or bottom part of the radiant circle
                if (angle > 45 && angle < 90) {
                    if (targetY < 0) {
                        c2y = targetY + 1500;
                        c2x = (c2y * targetX) / targetY;
                    } else {
                        c2y = targetY - 1500;
                        c2x = (c2y * targetX) / targetY;
                    }
                }
            } else if (sourceX > 0) {
                // right side of the circle graph
                c1x = sourceX + 1500;
                c1y = (sourceY * c1x) / sourceX;
                c2x = targetX - 2000;
                if (targetX < 0) {
                    c2x = targetX + 2000;
                }
                c2y = (targetY * c2x) / targetX;
                if (angle > 45 && angle < 90) {
                    if (targetY < 0) {
                        c1y = sourceY - 1500;
                        c1x = (c1y * sourceX) / sourceY;
                        c2y = targetY + 2000;
                        if (targetY > 0) {
                            targetY = targetY - 2000;
                        }
                        c2x = (c2y * targetX) / targetY;
                    } else {
                        c1y = sourceY + 1500;
                        c1x = (c1y * sourceX) / sourceY;
                        c2y = targetY - 2000;
                        if (targetY < 0) {
                            targetY = targetY + 2000;
                        }
                        c2x = (c2y * targetX) / targetY;
                    }
                }
            } else {
                // left side of the circle
                c1x = sourceX - 1500;
                c1y = (sourceY * c1x) / sourceX;
                c2x = targetX + 2000;
                if (targetX > 0) {
                    c2x = targetX - 2000;
                }
                c2y = (targetY * c2x) / targetX;
                if (angle > 45 && angle < 90) {
                    if (targetY < 0) {
                        c1y = sourceY - 1500;
                        c1x = (c1y * sourceX) / sourceY;
                        c2y = targetY + 2000;
                        if (targetY > 0) {
                            targetY = targetY - 2000;
                        }
                        c2x = (c2y * targetX) / targetY;
                    } else {
                        c1y = sourceY + 1500;
                        c1x = (c1y * sourceX) / sourceY;
                        c2y = targetY - 2000;
                        if (targetY < 0) {
                            targetY = targetY + 2000;
                        }
                        c2x = (c2y * targetX) / targetY;
                    }
                }
            }

            // use Pixi function to draw the beizer
            nodeLink.bezierCurveTo(c1x, c1y, c2x, c2y, targetX, targetY);

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
        drawCircle(root) {
            let node = root;
            const childNode = node.children.find((e) => e.children);
            /**
             * Calculate distance between two point A(x1,y1) B(x2,y2)
             * d(A,B) = sqrt((x2-x1)^2 + (y2-y1)^2)
             *
             */
            const distance = Math.sqrt(
                (childNode.x - root.x) * (childNode.x - root.x) +
                    (childNode.y - root.y) * (childNode.y - root.y)
            );
            for (let index = 0; index < root.height; index++) {
                const gr = new PIXI.Graphics();
                gr.lineStyle(30, 0x334155, 0.9);
                gr.drawCircle(0, 0, distance * (index + 1));
                gr.endFill();
                node = childNode;
                this.$radialTreeContainer.addChild(gr);
            }
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
