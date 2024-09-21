<script>
// Import the stores.
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useSkillTreeStore } from '../../../stores/SkillTreeStore';
import { useSkillTagsStore } from '../../../stores/SkillTagsStore';

// Nested component.
import SkillTreeFilter from './../SkillTreeFilter.vue';
import SkillPanel from './../SkillPanel.vue';

// Import Pixi JS.
import * as PIXI from 'pixi.js';
// For pixi to use custom fonts.
import FontFaceObserver from 'fontfaceobserver';

import * as d3 from 'd3';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const skillTreeStore = useSkillTreeStore();
        const skillTagsStore = useSkillTagsStore();
        return {
            userDetailsStore,
            skillTreeStore,
            skillTagsStore
        };
    },
    data() {
        return {
            stageContents: [],
            isSkillInfoPanelShown: false,
            regularLockedUnmasteredNodeSprite: null,
            // D3 radius, maybe delete?
            radius: 0,
            width: null,
            height: null,
            // D3 radius multiplier
            radiusMultiplier: 256,
            firstLevelNodeSize: 500,
            // Max size before overlap.
            secondLevelNodeSize: 100,
            regularNodeSize: 50,
            subSkillRadius: 50,
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
            isRecentered: false
        };
    },
    components: {
        SkillTreeFilter,
        SkillPanel
    },
    created() {
        // Hide the tidy tree.
        this.$tidyTreeContainer.visible = false;
        // Show this tree.
        this.$radialTreeContainer.visible = true;
        // Set the background colour.
        this.$pixiApp.renderer.background.color = 0x000;
    },
    async mounted() {
        // Get the data from the API.

        document
            .getElementById('reset-button')
            .addEventListener('click', () => {
                this.resetTree();
            });

        if (this.skillTreeStore.userSkills.length == 0) {
            await this.skillTreeStore.getUserSkills();
        }

        // Only generate this chart, if it has not already been generated.
        if (this.$radialTreeContainer.children.length == 0) {
            // Specify the chart’s dimensions.
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.radius = Math.min(this.width, this.height) / 2;
            const centerNodeSprite = PIXI.Sprite.from('center-node.png');
            this.skill = {
                name: 'SKILLS',
                sprite: centerNodeSprite,
                children: this.skillTreeStore.userSkills
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

            removeSubSkills(skillsNoSubSkills);

            var data = {
                name: null,
                children: skillsNoSubSkills
            };

            // Create a radial tree layout. The layout’s first dimension (x)
            // is the angle, while the second (y) is the radius.
            const tree = d3
                .tree()
                // increase the radius to space out the nodes.
                .size([2 * Math.PI, this.radius * this.radiusMultiplier])
                // Max separation between sibling nodes.
                .separation((a, b) => (a.parent == b.parent ? 1 : 1) / a.depth);

            // Sort the tree and apply the layout.
            const root = tree(d3.hierarchy(data));

            // We need to get the x and y values from the D3 algorithm (root)
            // and assign them to the nested skills list.

            // First.
            // Flatten the nested array that we are using for the skill tree, first.
            var flattenedSkillChildren = [];
            // Recursive function for nested array.
            function flattenNestedArray(children, context) {
                // Check if any child skills. If so, delete them.
                for (let i = 0; i < children.length; i++) {
                    if (children[i].type != 'sub') {
                        flattenedSkillChildren.push(children[i]);
                    }
                    // Run the above function again recursively.
                    flattenNestedArray(children[i].children, context);
                }
            }
            flattenNestedArray(skillsNoSubSkills, this);

            // Need to first sort the root.descendants() array on the data.id property.
            // This seems to optimise the load time considerable, though not sure.
            let sortedRootDescendants = root
                .descendants()
                .sort((a, b) => a.data.id - b.data.id);
            // Then assign the values.
            for (let i = 0; i < flattenedSkillChildren.length; i++) {
                for (let j = 0; j < sortedRootDescendants.length; j++) {
                    if (
                        flattenedSkillChildren[i].id ==
                        sortedRootDescendants[j].data.id
                    ) {
                        flattenedSkillChildren[i].x =
                            sortedRootDescendants[j].x;
                        flattenedSkillChildren[i].y =
                            sortedRootDescendants[j].y;
                    }
                }
            }

            // We then convert the flat array back to a nested one.
            for (var i = 0; i < flattenedSkillChildren.length; i++) {
                flattenedSkillChildren[i].children = [];
                if (
                    flattenedSkillChildren[i].parent != null &&
                    flattenedSkillChildren[i].parent != 0
                ) {
                    var parentId = flattenedSkillChildren[i].parent;
                    // go through all rows again, add children
                    for (let j = 0; j < flattenedSkillChildren.length; j++) {
                        if (flattenedSkillChildren[j].id == parentId) {
                            flattenedSkillChildren[j].children.push(
                                flattenedSkillChildren[i]
                            );
                        }
                    }
                }
            }
            let studentSkills = [];
            for (var i = 0; i < flattenedSkillChildren.length; i++) {
                if (
                    flattenedSkillChildren[i].parent == null ||
                    flattenedSkillChildren[i].parent == 0
                ) {
                    studentSkills.push(flattenedSkillChildren[i]);
                }
            }

            // Then assign the new array to the original skill tree array.
            this.skill.children = studentSkills;

            this.drawChart(root);
        },
        drawChart(root) {
            // Links.
            for (let i = 0; i < root.links().length; i++) {
                const link = new PIXI.Graphics();
                if (root.links()[i].target.data.is_mastered == '1') {
                    link.lineStyle(16, 0xffffff, 1);
                } else {
                    link.lineStyle(2, 0xffffff, 1);
                }

                // Source node.
                var sourceX =
                    Math.cos(root.links()[i].source.x) *
                    root.links()[i].source.y;
                var sourceY =
                    Math.sin(root.links()[i].source.x) *
                    root.links()[i].source.y;
                link.moveTo(sourceX, sourceY);

                // Target node.
                var targetX =
                    Math.cos(root.links()[i].target.x) *
                    root.links()[i].target.y;
                var targetY =
                    Math.sin(root.links()[i].target.x) *
                    root.links()[i].target.y;
                link.lineTo(targetX, targetY);

                // Add to the global variable container for this chart.
                this.$radialTreeContainer.addChild(link);
                // Add to array, so can be deleted when skill tree is recentered.
                this.stageContents.push(link);
            }

            /*
             * Central circle.
             */
            // Graphic.
            const centerNode = this.skill.sprite;
            centerNode.x = root.x;
            centerNode.y = root.y;
            centerNode.anchor.set(0.5);
            if (this.isRecentered == false) centerNode.scale.set(0.5);
            else centerNode.scale.set(1);

            // Add to the global variable container for this chart.
            this.$radialTreeContainer.addChild(centerNode);

            // Add to array, so can be deleted when skill tree is recentered.
            this.stageContents.push(centerNode);

            // Text.
            // Font size is set artificially high, then scaed down, to improve resolution.
            let centerNodeText = new PIXI.Text(this.skill.name, {
                fontFamily: 'Poppins900',
                fontSize: 200,
                fill: 0x000000,
                align: 'center'
            });
            centerNodeText.anchor.set(0.5);
            // Center it.
            centerNodeText.x = root.x;
            centerNodeText.y = root.y;
            // This is to deal with the artificially high font size mentioned above.
            centerNodeText.scale.x = 0.2;
            centerNodeText.scale.y = 0.2;
            // Add to the global variable container for this chart.
            this.$radialTreeContainer.addChild(centerNodeText);
            // Add to array, so can be deleted when skill tree is recentered.
            this.stageContents.push(centerNodeText);

            // Nodes.
            function renderDescendantNodes(parentChildren, depth, context) {
                // Increase the depth each recursion.
                depth++;

                for (let [index, child] of parentChildren.entries()) {
                    /*
                     * Create the skill node container.
                     * Using the D3 algorithm to get the position.
                     */
                    let nodeContainer = new PIXI.Container();
                    //   var angle = Math.random() * Math.PI * 2;
                    nodeContainer.x = Math.cos(child.x) * child.y;
                    nodeContainer.y = Math.sin(child.x) * child.y;

                    /*
                     * Draw the skill node.
                     */
                    var nodeGraphic = new PIXI.Sprite();
                    if (child.level == 'grade_school') {
                        if (child.is_mastered)
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/grade-school-mastered.png'
                            );
                        else if (child.is_accessible)
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/grade-school-unlocked.png'
                            );
                        else
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/grade-school-locked.png'
                            );
                    } else if (child.level == 'middle_school') {
                        if (child.is_mastered)
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/middle-school-mastered.png'
                            );
                        else if (child.is_accessible)
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/middle-school-unlocked.png'
                            );
                        else
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/middle-school-locked.png'
                            );
                    } else if (child.level == 'high_school') {
                        if (child.is_mastered)
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/high-school-mastered.png'
                            );
                        else if (child.is_accessible)
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/middle-school-unlocked.png'
                            );
                        else
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/middle-school-locked.png'
                            );
                    } else if (child.level == 'college') {
                        if (child.is_mastered)
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/college-mastered.png'
                            );
                        else if (child.is_accessible)
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/middle-school-unlocked.png'
                            );
                        else
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/middle-school-locked.png'
                            );
                    } else if (child.level == 'phd') {
                        if (child.is_mastered)
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/phd-mastered.png'
                            );
                        else if (child.is_accessible)
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/middle-school-unlocked.png'
                            );
                        else
                            nodeGraphic = PIXI.Sprite.from(
                                'images/skill-tree-nodes/middle-school-locked.png'
                            );
                    } else if (child.level == 'domain') {
                        nodeGraphic = PIXI.Sprite.from(
                            'images/skill-tree-nodes/domain.png'
                        );
                    }

                    // Determine if node has children or subskills.
                    let numChildren = 0;
                    let numSubSkills = 0;
                    for (let i = 0; i < child.children.length; i++) {
                        if (child.children[i].type != 'sub') {
                            numChildren++;
                        } else {
                            numSubSkills++;
                        }
                    }

                    // Increase the size of the first level nodes.
                    if (depth == 1) {
                        nodeGraphic.width = context.firstLevelNodeSize;
                        nodeGraphic.height = context.firstLevelNodeSize;
                    } else if (depth == 2) {
                        nodeGraphic.width = context.secondLevelNodeSize;
                        nodeGraphic.height = context.secondLevelNodeSize;
                    } else {
                        nodeGraphic.width = context.regularNodeSize;
                        nodeGraphic.height = context.regularNodeSize;
                    }

                    nodeGraphic.anchor.set(0.5);
                    nodeContainer.addChild(nodeGraphic);
                    /*
                     * Write the skill name.
                     */
                    // Increase the size of the first level nodes.
                    let fontSize;
                    if (depth == 1) {
                        fontSize = 300;
                    } else if (depth == 2) {
                        fontSize = 100;
                    } else {
                        fontSize = 50;
                    }

                    // Split name into an array.
                    const nodeNameArray = child.skill_name.split(' ');
                    for (let i = 0; i < nodeNameArray.length; i++) {
                        // Check if any of the strings are too long.
                        if (nodeNameArray[i].length > 9) {
                            if (depth == 1) {
                                fontSize = 250;
                            } else if (depth == 2) {
                                fontSize = 90;
                            } else {
                                fontSize = 40;
                            }
                        }
                    }

                    // Add line break if skill name is more than one word.
                    child.skill_name = child.skill_name.replace(
                        /(.*?\s)/g,
                        '$1' + '\n'
                    );
                    // Note that the fontSize is 5 times higher than encessary, to deal with pixellation on zoom.
                    let nodeName = new PIXI.Text(
                        child.skill_name.toUpperCase(),
                        {
                            fontFamily: 'Poppins900',
                            fontSize: fontSize,
                            fill: 0xffffff,
                            align: 'center'
                        }
                    );
                    // Text to centre of container.
                    nodeName.anchor.set(0.5);

                    // This is to deal with the artificially high fontSize mentioned above.
                    nodeName.scale.x = 0.2;
                    nodeName.scale.y = 0.2;

                    // Add components to the container.
                    nodeContainer.addChild(nodeName);

                    // Add interactivity.

                    // This is added to the graphic and text, and not the container,
                    // as it would otherwise effect all the container's child skills.
                    nodeGraphic.eventMode = 'static';
                    nodeName.eventMode = 'static';
                    nodeGraphic.cursor = 'pointer';
                    nodeName.cursor = 'pointer';

                    nodeName.on('pointerdown', (event) => {
                        // Create the  skill object:
                        var skill = {
                            id: child.id,
                            children: child.children,
                            isMastered: child.is_mastered,
                            isUnlocked: child.is_accessible,
                            container: nodeContainer,
                            name: child.skill_name,
                            description: child.description,
                            tagIDs: [],
                            sprite: nodeGraphic
                        };
                        context.skill = skill;

                        if (!context.isSkillInfoPanelShown) {
                            context.skill = skill;
                            context.showInfoPanel();

                            function recenterTree() {
                                context.recenterTree();
                            }
                            document
                                .getElementById('recenterTree')
                                .addEventListener('click', recenterTree);
                        }
                        // else
                        //     context.updateInfoPanel(skill)
                    });
                    nodeGraphic.on('pointerdown', (event) => {
                        // Create the  skill object:
                        var skill = {
                            id: child.id,
                            children: child.children,
                            isMastered: child.is_mastered,
                            isUnlocked: child.is_accessible,
                            container: nodeContainer,
                            name: child.skill_name,
                            description: child.description,
                            tagIDs: [],
                            sprite: nodeGraphic
                        };
                        context.skill = skill;

                        if (!context.isSkillInfoPanelShown) {
                            context.skill = skill;
                            context.showInfoPanel();

                            function recenterTree() {
                                context.recenterTree();
                            }
                            document
                                .getElementById('recenterTree')
                                .addEventListener('click', recenterTree);
                        }
                        // else
                        //     context.updateInfoPanel(skill)
                    });

                    // Add to the global variable container for this chart.
                    context.$radialTreeContainer.addChild(nodeContainer);
                    // Add to array, so can be deleted when skill tree is recentered.
                    context.stageContents.push(nodeContainer);

                    /*
                     * Subskills.
                     */
                    // Sort the children into subskills and actual child skills.
                    for (let i = 0; i < child.children.length; i++) {
                        if (child.children[i].type == 'sub') {
                            let subNodeContainer = new PIXI.Container();

                            // Calculate the increment of the subskills, around a circle.
                            let increment = 360 / numSubSkills;
                            // Get the correct index number, excluding sub skills.
                            let subSkillsIndex = i - numChildren;
                            // Calculate the nodes angle.
                            let angle = increment * subSkillsIndex;
                            let rads = (angle * Math.PI) / 180;
                            let x;
                            let y;
                            x = context.subSkillRadius * Math.cos(rads);
                            y = context.subSkillRadius * Math.sin(rads);

                            subNodeContainer.x = x;
                            subNodeContainer.y = y;

                            var nodeGraphic = new PIXI.Sprite();
                            if (child.level == 'grade_school') {
                                if (child.is_mastered)
                                    nodeGraphic = PIXI.Sprite.from(
                                        'images/skill-tree-nodes/grade-school-small-mastered.png'
                                    );
                                else if (child.is_accessible)
                                    nodeGraphic = PIXI.Sprite.from(
                                        'images/skill-tree-nodes/grade-school-small-unlocked.png'
                                    );
                                else
                                    nodeGraphic = PIXI.Sprite.from(
                                        'images/skill-tree-nodes/grade-school-small-locked.png'
                                    );
                            } else if (child.level == 'middle_school') {
                                if (child.is_mastered)
                                    nodeGraphic = PIXI.Sprite.from(
                                        'images/skill-tree-nodes/middle-school-small-mastered.png'
                                    );
                                else if (child.is_accessible)
                                    nodeGraphic = PIXI.Sprite.from(
                                        'images/skill-tree-nodes/middle-school-small-unlocked.png'
                                    );
                                else
                                    nodeGraphic = PIXI.Sprite.from(
                                        'images/skill-tree-nodes/middle-school-small-locked.png'
                                    );
                            } else if (child.level == 'high_school') {
                                if (child.is_mastered)
                                    nodeGraphic = PIXI.Sprite.from(
                                        'images/skill-tree-nodes/high-school-small-mastered.png'
                                    );
                                else if (child.is_accessible)
                                    nodeGraphic = PIXI.Sprite.from(
                                        'images/skill-tree-nodes/high-school-small-unlocked.png'
                                    );
                                else
                                    nodeGraphic = PIXI.Sprite.from(
                                        'images/skill-tree-nodes/high-school-small-locked.png'
                                    );
                            } else if (child.level == 'college') {
                                if (child.is_mastered)
                                    nodeGraphic = PIXI.Sprite.from(
                                        'images/skill-tree-nodes/college-smal-mastered.png'
                                    );
                                else if (child.is_accessible)
                                    nodeGraphic = PIXI.Sprite.from(
                                        'images/skill-tree-nodes/college-small-unlocked.png'
                                    );
                                else
                                    nodeGraphic = PIXI.Sprite.from(
                                        'images/skill-tree-nodes/college-small-locked.png'
                                    );
                            } else if (child.level == 'phd') {
                                if (child.is_mastered)
                                    nodeGraphic = PIXI.Sprite.from(
                                        'images/skill-tree-nodes/phd-small-mastered.png'
                                    );
                                else if (child.is_accessible)
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

                            subNodeContainer.addChild(nodeGraphic);
                            nodeContainer.addChild(subNodeContainer);
                        }
                    }

                    /*
                     * Run the above function again recursively.
                     */
                    if (
                        child.children &&
                        Array.isArray(child.children) &&
                        child.children.length > 0
                    )
                        renderDescendantNodes(child.children, depth, context);
                }
            }

            renderDescendantNodes(this.skill.children, 0, this);
        },
        recenterTree() {
            this.isRecentered = true;

            // Otherwise, the new chart is too spread out.
            this.radiusMultiplier = 1;

            for (let i = 0; i < this.stageContents.length; i++) {
                this.stageContents[i].destroy();
            }

            // Hide the side panel again.
            this.hideInfoPanel();

            this.getAlgorithm();
        },
        resetTree() {
            this.isRecentered = false;

            this.radiusMultiplier = 4;

            // Clear the global variable container for this chart.
            this.$radialTreeContainer.removeChildren();

            const centerNodeSprite = PIXI.Sprite.from('center-node.png');
            this.skill = {
                name: 'SKILLS',
                sprite: centerNodeSprite,
                children: this.skillTreeStore.userSkills
            };

            this.getAlgorithm();
        },
        showInfoPanel() {
            // If panel is not showing.
            if (!this.isSkillInfoPanelShown) {
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
                // Make the background dark and disabled.
                document.getElementById('sidepanel-backdrop').style.display =
                    'block';
                this.isSkillInfoPanelShown = true;
                // Populate the skill description.
                var skillDescription =
                    document.getElementById('skillDescription');
                // Populate the skill panel check box.
                // if (skill.isMastered == "1") {
                //     document.getElementById("skillIsMastered").checked = true;
                // }
                // Populate the skill link button.
                var skillLink = document.getElementById('skillLink');
                //skillLink.setAttribute("href", "/skills/" + skill.id);
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
        // To filter the skill tree based on level.
        // At the moment, it simply removes the chosen level.
        // This does not make sense from a user perspective, as what we want is for
        // the user to choose all the elvels they want to see.
        // TODO: change to checkboxes, that start out checked.
        // levels are removed when they are unchecked.
        async filterSkills(level) {
            // Flatten the nested array that we are using for the skill tree, first.
            var flattenedSkillChildren = [];
            // Recursive function for nested array.
            function flattenNestedArray(children, context) {
                // Check if any child skills. If so, delete them.
                for (let i = 0; i < children.length; i++) {
                    flattenedSkillChildren.push(children[i]);
                    // Run the above function again recursively.
                    flattenNestedArray(children[i].children, context);
                }
            }
            flattenNestedArray(this.skill.children, this);

            // Before we filter, we need to change the parent nodes to ones that will
            // not be filtered out.
            var newParent = 0;
            for (let i = 0; i < flattenedSkillChildren.length; i++) {
                let skill = flattenedSkillChildren[i];
                reassignParentLevels(skill, skill.parent, level, 0);
                flattenedSkillChildren[i].parent = newParent;
            }
            // Recursive function.
            function reassignParentLevels(skill, parent, level, depth) {
                depth++;
                for (let i = 0; i < flattenedSkillChildren.length; i++) {
                    if (flattenedSkillChildren[i].id == parent) {
                        let parent = flattenedSkillChildren[i];
                        if (parent.level == level) {
                            newParent = parent.parent;
                            reassignParentLevels(
                                skill,
                                newParent,
                                level,
                                depth
                            );
                        } else {
                            newParent = parent.id;
                        }
                    }
                }
            }

            // Next we copy the flattened user-skill array, ommitting any filtered skills.
            let filteredSkills2 = [];
            for (var i = 0; i < flattenedSkillChildren.length; i++) {
                if (flattenedSkillChildren[i].level != level) {
                    filteredSkills2.push(flattenedSkillChildren[i]);
                }
            }

            // We then convert the flat array back to a nested one.
            for (var i = 0; i < filteredSkills2.length; i++) {
                filteredSkills2[i].children = [];
                if (
                    filteredSkills2[i].parent != null &&
                    filteredSkills2[i].parent != 0
                ) {
                    var parentId = filteredSkills2[i].parent;
                    // go through all rows again, add children
                    for (let j = 0; j < filteredSkills2.length; j++) {
                        if (filteredSkills2[j].id == parentId) {
                            filteredSkills2[j].children.push(
                                filteredSkills2[i]
                            );
                        }
                    }
                }
            }
            let studentSkills = [];
            for (var i = 0; i < filteredSkills2.length; i++) {
                if (
                    filteredSkills2[i].parent == null ||
                    filteredSkills2[i].parent == 0
                ) {
                    studentSkills.push(filteredSkills2[i]);
                }
            }

            // Then assign the new array to the original skill tre array.
            this.skill.children = studentSkills;

            // We delete the stage contents.
            for (let i = 0; i < this.stageContents.length; i++) {
                this.stageContents[i].destroy();
            }

            this.applyFilter();
        },
        applyFilter() {
            // Another attempt to clear the stage.
            // Not sure if both are needed.
            this.$pixiApp.stage.children[0].removeChildren();

            // Recreate the skill object.
            const centerNodeSprite = PIXI.Sprite.from('center-node.png');
            this.skill = {
                name: 'SKILLS',
                sprite: centerNodeSprite,
                children: this.skill.children
            };

            // Make the tree again.
            this.getAlgorithm();
        }
    }
};
</script>

<template>
    <div class="flex-container skill-tree-container">
        <SkillTreeFilter id="filter" />
        <button v-show="isRecentered" id="reset-button" class="btn btn-info">
            Reset
        </button>
        <!-- Wrapper is for the dark overlay, when the sidepanel is displayed -->
        <div id="wrapper">
            <div id="skilltree">
                <SkillPanel :skill="skill" />
            </div>
            <div id="sidepanel-backdrop"></div>
        </div>
    </div>
</template>

<style scoped>
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
