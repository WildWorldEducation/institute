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
            isLoading: true,
            xPos: 0,
            yPos: 0,
            showAnimation: false,
            showSkillPanel: false,
            userAvatarImg: null,
            currentZoom: 1,
            resultNode: null
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
            children: this.skillTreeStore.userSkillsSubSkillsSeparate.skills
        };

        this.userAvatarImg = new Image();
        this.userAvatarImg.src = this.userDetailsStore.avatar;
        this.userAvatarImg.onload = () => {
            this.getAlgorithm();

            // Zoom and pan.
            // store the d3 zoom object so it can be use for programmatic zoom later on
            this.d3Zoom = d3
                .zoom()
                .scaleExtent([0.05, 8])
                .on('zoom', ({ transform }) => {
                    // For line thickness
                    this.currentZoom = transform.k;
                    this.zoomed(transform);
                });
            d3.select(this.context.canvas).call(this.d3Zoom);
            // Zoom and move the tree to it initial position
            this.defaultPosition();
        };

        // Listen for clicks on the main canvas
        canvas.addEventListener('click', async (e) => {
            // We actually only need to draw the hidden canvas when
            // there is an interaction. This sketch can draw it on
            // each loop, but that is only for demonstration.

            var data = this.nodes;
            //Figure out where the mouse click occurred.
            var mouseX = e.layerX;
            var mouseY = e.layerY;

            this.xPos = mouseX;
            this.yPos = mouseY;

            this.showAnimation = true;
            // Hide animation after 0.5 seconds (adjust as needed)
            setTimeout(() => {
                this.showAnimation = false;
            }, 500);

            // Get the corresponding pixel color on the hidden canvas
            // and look up the node in our map.
            var ctx = this.hiddenCanvasContext;

            // This will return that pixel's color
            var col = ctx.getImageData(mouseX, mouseY, 1, 1).data;

            //Our map uses these rgb strings as keys to nodes.
            var colString = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
            var node = this.colToNode[colString];

            if (node) {
                // We clicked on something, lets set the color of the node
                // we also have access to the data associated with it, which in
                // this case is just its original index in the data array.
                node.renderCol = node.__pickColor;

                //Update the display
                this.skill.name = node.data.skill_name;
                this.skill.id = node.data.id;
                this.skill.type = node.data.type;
                this.skill.subskills = node.data.subskills;

                // Get the mastery requirements data separately.
                // Because this is so much data, we do not send it with the rest of the skill tree,
                // or it will slow the load down too much.
                const result = await fetch(
                    '/skills/mastery-requirements-and-url/' + this.skill.id
                );
                const result2 = await result.json();

                if (this.skill.type == 'super') {
                    // Get urls of subskills, if a super skill
                    const subSkillsResult = await fetch(
                        '/skills/sub-skills/' + this.skill.id
                    );
                    const subSkillsResultJson = await subSkillsResult.json();
                    this.skill.subskills = subSkillsResultJson;
                }

                this.skill.masteryRequirements = result2.mastery_requirements;
                this.skill.url = result2.url;
                this.showSkillPanel = true;
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

            // To determine the size of the skill tree based on the number of skills showing.
            // It should not be too big, compared to the number of nodes,
            // or the nodes will be too far a part.
            const skillCount =
                this.skillTreeStore.userSkillsSubSkillsSeparate.count;
            if (skillCount > 2000) {
                this.radiusMultiplier = 96;
            } else if (skillCount > 1000) {
                this.radiusMultiplier = 32;
            } else {
                this.radiusMultiplier = 6;
            }

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

            // Draw user avatar in center.
            this.context.fillStyle = 'transparent';
            this.context.save();
            this.context.beginPath();
            this.context.moveTo(0, 0);
            this.context.arc(0, 0, 20, 0, 2 * Math.PI);
            this.context.stroke();
            this.context.clip();
            this.context.drawImage(this.userAvatarImg, -20, -20, 40, 40);
            this.context.restore();
        },
        // rotate node 90 degrees because d3 use a weird
        rotateNode(cx, cy, x, y, angle) {
            var radians = (Math.PI / 180) * angle,
                cos = Math.cos(radians),
                sin = Math.sin(radians),
                nx = cos * (x - cx) + sin * (y - cy) + cx,
                ny = cos * (y - cy) - sin * (x - cx) + cy;
            return [nx, ny];
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

                // Write sub skills length in node center.
                if (node.data.type == 'super') {
                    let currentFont = ctx1.font;
                    ctx1.fillStyle = 'black'; // Set the text color (if needed)
                    ctx1.font = `bold ${size}px Arial`; // Set the font size based on circle size
                    ctx1.textAlign = 'center'; // Center the text horizontally
                    ctx1.textBaseline = 'middle'; // Center the text vertically
                    ctx1.fillText(
                        node.data.subskills.length,
                        pos[0],
                        pos[1] + 1
                    );
                    ctx1.font = currentFont;
                }
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

                let drawText = node.data.skill_name;
                // we add ◀ if text is the result node
                if (node.data.skill_name === this.resultNode?.data.skill_name) {
                    drawText = '▶ ' + drawText + ' ◀';
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
                ctx1.fillStyle = this.textFillColor(
                    node.data.skill_name,
                    node.data.level
                );

                ctx1.fillText(drawText, moveX, moveY);
                ctx1.restore();
            }

            // Hidden context.
            ctx2.beginPath();
            ctx2.moveTo(pos[0], pos[1]);
            ctx2.arc(pos[0], pos[1], size, 0, 2 * Math.PI);
            ctx2.fill();
        },
        textFillColor(skillName, level) {
            if (skillName === this.resultNode?.data.skill_name) {
                return '#FFAE00';
            }
            if (level === 'domain') {
                return '#FFF';
            }
            return '#afb9c9';
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
                this.context.lineWidth =
                    4 + parseInt(3 * (1 / this.currentZoom));
                color = '#ffffff';
            } else
                this.context.lineWidth = parseInt(3 * (1 / this.currentZoom));

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
            // Update scale value for moving to node function
            this.scale = transform.k;
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
            this.context.translate(
                transform.x - this.width / 2,
                transform.y - this.height / 2
            );
            this.context.scale(transform.k, transform.k);

            this.hiddenCanvasContext.translate(
                transform.x - this.width / 2,
                transform.y - this.height / 2
            );
            this.hiddenCanvasContext.scale(transform.k, transform.k);

            this.drawTree();
            this.context.fill();
            this.context.restore();
            this.hiddenCanvasContext.fill();
            this.hiddenCanvasContext.restore();
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
                    d3.zoomIdentity
                        .translate(this.width / 2, this.height / 3)
                        .scale(0.1)
                );
        },
        // Find node with name include
        findNodeWithName(searchString) {
            let results = [];
            // D3
            //let breakLoop = false;
            this.root.each(function (node) {
                // search only first letter if search string is less than 2
                if (searchString.length < 3) {
                    if (
                        node.data.skill_name
                            .toLowerCase()
                            .substring(0, searchString.length) === searchString
                    ) {
                        results.push(node);
                    }
                }
                // search whole skill name if search text is greater than two
                else {
                    if (
                        node.data.skill_name
                            .toLowerCase()
                            .includes(searchString)
                    ) {
                        results.push(node);
                    }
                }
            });
            return results;
        },
        // zoom and pan to a node
        goToLocation(node) {
            const skillTreeHeight = this.$refs.wrapper.clientHeight;
            const skillTreeWidth = this.$refs.wrapper.clientWidth;
            const fixedScale = skillTreeWidth > 480 ? 1.75 : 1.45;
            const centerYOffset = skillTreeWidth > 480 ? 2 : 2.3;
            const centerXOffset = 2;
            this.resultNode = node;
            // Because it is a radial chart - need to convert values.
            let radX = Math.cos(node.x) * node.y;
            let radY = Math.sin(node.x) * node.y;

            let pos = this.rotateNode(0, 0, radX, radY, 90);
            const translateX =
                -pos[0] * fixedScale + skillTreeWidth / centerXOffset;
            const translateY =
                -pos[1] * fixedScale + skillTreeHeight / centerYOffset;

            d3.select(this.context.canvas)
                .transition()
                .duration(2000)
                .call(
                    this.d3Zoom.transform,
                    d3.zoomIdentity
                        .translate(translateX, translateY)
                        .scale(fixedScale)
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
    <div v-show="isLoading == false" id="wrapper" ref="wrapper">
        <SkillPanel :skill="skill" :showSkillPanel="showSkillPanel" />
        <div
            v-if="showAnimation"
            :style="{ top: `${yPos}px`, left: `${xPos}px` }"
            class="click-animation"
        ></div>
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
canvas {
    cursor: pointer;
}
.click-animation {
    position: absolute;
    width: 20px;
    height: 20px;
    background-color: #ffffff; /* Color of the animation */
    border-radius: 50%;
    transform: translate(-50%, -50%); /* Center the circle on click */
    animation: clickEffect 0.7s infinite ease-out;
}

@keyframes clickEffect {
    0% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
    }
    100% {
        transform: translate(-50%, -50%) scale(3);
        opacity: 0;
    }
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
