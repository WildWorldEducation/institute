<script>
// Import the stores.
import { useSkillTreeStore } from '../../../stores/SkillTreeStore';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';
// Nested components.
import SkillPanel from './../SkillPanel.vue';
import SliderControl from './SliderControl.vue';
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
            nodeWidth: 60,
            nodeHeight: 200,
            skill: {
                id: null,
                children: [],
                isMastered: null,
                isUnlocked: null,
                container: null,
                name: null,
                url: null,
                description: null,
                tagIDs: [],
                sprite: null,
                type: null,
                hasChildren: false
            },
            tree: {},
            root: {},
            context: {},
            hiddenCanvasContext: {},
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
            xPos: 0,
            yPos: 0,
            showAnimation: false,
            showSkillPanel: false,
            resultNode: null,
            clickMode: 'showPanel',
            base64Image:
                'data:image/png;base64,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',
            transformData: {
                x: 0,
                y: 0,
                k: 0
            },
            currentNodeX: 0,
            currentNodeY: 0,
            visibleRangeX: 0,
            visibleRangeY: 0,
            iconDictionary: [],
            nodeDrew: 0
        };
    },
    components: {
        SkillPanel,
        SliderControl,
        JoystickControl
    },
    async mounted() {
        // Check if store is empty,
        // or if grade level filter has been changed on the other tree (they need to be the same).
        if (this.skillTreeStore.verticalTreeUserSkills.length == 0) {
            await this.skillTreeStore.getVerticalTreeUserSkills(
                this.userDetailsStore.gradeFilter,
                this.userDetailsStore.subjectFilters
            );
        }

        let userSkills = '';
        if (this.userDetailsStore.gradeFilter == 'grade_school') {
            userSkills = this.skillTreeStore.gradeSchoolVerticalTreeUserSkills;
        } else if (this.userDetailsStore.gradeFilter == 'middle_school') {
            userSkills = this.skillTreeStore.middleSchoolVerticalTreeUserSkills;
        } else if (this.userDetailsStore.gradeFilter == 'high_school') {
            userSkills = this.skillTreeStore.highSchoolVerticalTreeUserSkills;
        } else if (this.userDetailsStore.gradeFilter == 'college') {
            userSkills = this.skillTreeStore.collegeVerticalTreeUserSkills;
        } else {
            userSkills = this.skillTreeStore.verticalTreeUserSkills;
        }

        // Specify the chart’s dimensions.
        this.height = window.innerHeight;
        this.width = window.innerWidth;

        this.skill = {
            name: 'SKILLS',
            sprite: null,
            children: userSkills
        };

        this.getAlgorithm();

        // Set up the Hidden Canvas for Interactivity.
        let hiddenCanvas = document.getElementById('hidden-canvas');
        this.hiddenCanvasContext = hiddenCanvas.getContext('2d', {
            willReadFrequently: true
        });
        hiddenCanvas.style.display = 'none';

        // Listen for clicks on the main canvas
        canvas.addEventListener('click', async (e) => {
            // We actually only need to draw the hidden canvas when
            // there is an interaction. This sketch can draw it on
            // each loop, but that is only for demonstration.

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

            if (node && node.data.id) {
                // We clicked on something, lets set the color of the node
                // we also have access to the data associated with it, which in
                // this case is just its original index in the data array.
                node.renderCol = node.__pickColor;
                this.currentNodeX = node.x;
                this.currentNodeY = node.y;

                //Update the display with some data
                this.skill.name = node.data.skill_name;
                this.skill.id = node.data.id;
                this.skill.type = node.data.type;
                // For the collapsing nodes
                this.skill.show_children = node.data.show_children;
                this.skill.hasChildren = false;
                if (
                    node.data.children.length > 0 ||
                    (this.skill.show_children && this.skill.show_children == 0)
                ) {
                    this.skill.hasChildren = true;
                }
                this.skill.x = node.x;
                this.skill.y = node.y;

                // Get the mastery requirements data separately.
                // Because this is so much data, we do not send it with the rest of the skill tree,
                // or it will slow the load down too much.
                const result = await fetch(
                    '/skills/mastery-requirements-and-url/' + this.skill.id
                );
                const result2 = await result.json();
                this.skill.masteryRequirements = result2.mastery_requirements;
                this.skill.url = result2.url;
                this.showSkillPanel = true;
            }
        });

        // Zoom and pan with mouse
        // We have to construct the d3 zoom function and assign the zoom event
        this.d3Zoom = d3
            .zoom()
            .scaleExtent([0.1, 5])
            .on('zoom', ({ transform }) => {
                this.transformData = transform;
                this.drawTree(transform);
                // update slider percent ( Handle by us not d3 but will invoke when the d3 zoom event is call )
                this.$refs.sliderControl.changeGradientBG();
            });

        // Bind the above object to canvas so it can zoom the tree
        d3.select(this.context.canvas).call(this.d3Zoom);

        // Set initial zoom value.
        this.resetPos();

        // =================================================================================
        // For the loading animation.
        // this.getIconPath()

        this.isLoading = false;
    },
    methods: {
        getAlgorithm() {
            /* Determine width of tree, based on how many nodes are showing
             * used for the various types of filters,
             * including: collapsable nodes, grade level filter, and instructors filters skills for students
             *
             * The fewer nodes, the less wide the tree should be, otherwise nodes are too far spaced apart.
             */
            let count = 0;
            // Height: remains constant
            const dx = 24;

            // Create a tree layout.
            this.data = {
                skill_name: 'My skills',
                children: this.skill.children
            };

            this.root = d3.hierarchy(this.data);

            //Shorten lines based on truncate level.
            let multiplyBy = 10;
            if (count < 70) {
                multiplyBy = 1;
            } else if (count < 300) {
                multiplyBy = 3;
            } else if (
                this.userDetailsStore.gradeFilter == 'grade_school' ||
                count < 1000
            ) {
                multiplyBy = 5;
            } else if (this.userDetailsStore.gradeFilter == 'middle_school') {
                multiplyBy = 7;
            } else if (this.userDetailsStore.gradeFilter == 'high_school') {
                multiplyBy = 8;
            } else if (
                this.userDetailsStore.gradeFilter == 'college' ||
                count < 2000
            ) {
                multiplyBy = 9;
            }
            const dy = (this.width / (this.root.height + 1)) * multiplyBy;

            // THIS NEEDED TO BE REFACTOR LATER
            this.tree = d3.tree().nodeSize([this.nodeWidth, this.nodeHeight]);

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
            let hiddenCanvas = document.getElementById('hidden-canvas');
            this.hiddenCanvasContext = hiddenCanvas.getContext('2d');

            this.drawTree(d3.zoomIdentity);
        },
        drawTree(transform) {
            this.nodes = this.root.descendants();
            this.transformData = transform;
            // Zoom and pan.
            this.context.save();
            this.hiddenCanvasContext.save();
            // Clear canvases.
            this.context.clearRect(
                0,
                0,
                this.context.canvas.width,
                this.context.canvas.height
            );
            this.hiddenCanvasContext.clearRect(
                0,
                0,
                this.hiddenCanvasContext.canvas.width,
                this.hiddenCanvasContext.canvas.height
            );
            this.context.translate(transform.x, transform.y);
            this.hiddenCanvasContext.translate(transform.x, transform.y);
            this.context.scale(transform.k, transform.k);
            this.hiddenCanvasContext.scale(transform.k, transform.k);

            // For node labels to appear at correct zoom level.
            this.scale = transform.k;
            this.panX = transform.x;
            this.panY = transform.y;

            // Draw links.
            const links = this.root.links();
            this.context.beginPath();
            for (const link of links) {
                this.drawLink(link);
            }

            // Draw nodes.
            this.context.beginPath();

            // Calculate max visible range
            this.nodeDrew = 0;
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

                if (this.checkingIfNodeInView(node)) {
                    this.drawNode(node);
                }
                // this.checkingIfNodeInView(node);
                // this.drawNode(node);
            }

            this.context.restore();
            this.hiddenCanvasContext.restore();
        },
        drawNode(node) {
            // Make sure the nodes have solid outlines
            this.context.setLineDash([]);
            let ctx1 = this.context;
            let ctx2 = this.hiddenCanvasContext;
            // A flag to determine if this node was searched by user
            const isSearched =
                node.data.skill_name === this.resultNode?.data.skill_name;
            // Visible context.
            // If not a domain, make node a circle.
            if (node.data.type != 'domain') {
                // Node size
                let radius;
                if (node.data.type == 'sub') {
                    radius = 7.5;
                } else {
                    radius = 10;
                }

                // If child nodes are collapsed.
                if (node.data.show_children) {
                    if (node.data.show_children == 0) {
                        radius = 20;
                    }
                }
                ctx1.beginPath();
                // ctx1.arc(node.y, node.x, radius * 1.5, 0, 2 * Math.PI);
                ctx1.roundRect(node.y, node.x - 20, 180, 40, 5);
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
                    ctx1.lineWidth = 4;
                    ctx1.fillStyle = '#FFF';
                    ctx1.fill();
                    ctx1.strokeStyle = skillColor;
                    ctx1.stroke();
                }
            }
            // If child nodes are collapsed.
            if (node.data.show_children) {
                if (node.data.show_children == 0) {
                    // Set line properties
                    ctx1.lineWidth = 2;
                    ctx1.strokeStyle = 'black';

                    // Draw vertical line
                    ctx1.beginPath();
                    ctx1.moveTo(node.y - 10, node.x);
                    ctx1.lineTo(node.y + 10, node.x); // Draw to the bottom-middle
                    ctx1.stroke();

                    // Draw horizontal line
                    ctx1.beginPath();
                    ctx1.moveTo(node.y, node.x - 10);
                    ctx1.lineTo(node.y, node.x + 10); // Draw to the middle-right
                    ctx1.stroke();
                }
            }

            // Drawing Image
            if (this.scale >= 0.75 && this.iconDictionary) {
                // find path in skill icon dictionary
                // const path = this.iconDictionary[node.data.url];

                const img = new Image();

                // img.src = 'data:image/png;base64,' + path;
                img.src = this.base64Image;
                ctx1.drawImage(img, node.y + 10, node.x - 15, 30, 30);
            }

            // Text.
            if (this.scale > 0.6) {
                // to avoid sharp artifacts with the stroke of the text.
                ctx1.lineJoin = 'bevel';
                // we move the skill name to the left and change the color if it a domain node
                // using the non domain as if condition will save us some compute time as none domain node is more common
                if (node.data.type != 'domain') {
                    ctx1.beginPath();
                    // Background stroke
                    ctx1.strokeStyle = '#FFF';
                    ctx1.lineWidth = 4;
                    // Font size
                    // ctx1.font = '12px Arial';
                    // if (node.data.type == 'sub') {
                    //     ctx1.font = '10px Arial';
                    // }

                    // High light the text if user search for it
                    ctx1.fillStyle = isSearched ? '#ff0000' : '#000';
                    ctx1.font = isSearched ? 'bold' : 'normal';
                    ctx1.direction = 'ltr';

                    //  also added a triangle to the end of skill name
                    const showName = isSearched
                        ? `${node.data.skill_name} ◀`
                        : node.data.skill_name;
                    ctx1.strokeText(showName, node.y + 45, node.x + 2, 120);
                    ctx1.fillText(showName, node.y + 45, node.x + 2, 120);
                } else {
                    ctx1.beginPath();
                    ctx1.strokeStyle = '#FFF';
                    ctx1.lineWidth = 4;
                    ctx1.fillStyle = isSearched ? '#ff0000' : '#849cab';
                    ctx1.direction = 'rtl';
                    const showName = isSearched
                        ? `${node.data.skill_name} ▶`
                        : node.data.skill_name;
                    ctx1.strokeText(showName, node.y - 5, node.x + 2);
                    ctx1.fillText(showName, node.y - 5, node.x + 2);
                }
            }

            // Hidden context.
            if (node.data.type != 'domain') {
                ctx2.beginPath();
                ctx2.moveTo(node.y, node.x);
                //ctx2.arc(node.y, node.x, 20, 0, 2 * Math.PI);
                ctx2.roundRect(node.y, node.x - 20, 180, 40, 5);
                ctx2.fill();
            } else {
                ctx2.beginPath();
                ctx2.moveTo(node.y, node.x - 10);
                // top left edge.
                ctx2.lineTo(node.y - 20 / 2, node.x - 10 + 20 / 2);
                // bottom left edge.
                ctx2.lineTo(node.y, node.x - 10 + 20);
                // bottom right edge.
                ctx2.lineTo(node.y + 20 / 2, node.x - 10 + 20 / 2);
                // closing the path automatically creates the top right edge.
                ctx2.closePath();
                ctx2.lineWidth = 2;
                ctx2.fill();
                ctx2.stroke();
            }
        },
        drawLink(link) {
            const linkGenerator = d3
                .linkHorizontal()
                .x((d) => d.y)
                .y((d) => d.x)
                .context(this.context);

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

            // If skill is mastered.
            if (link.target.data.is_mastered == 1) {
                this.context.lineWidth = 4;
                this.context.strokeStyle = '#8d6ce7';
            } else {
                this.context.lineWidth = 2;
                // Determine colour of links based on user's theme
                if (this.userDetailsStore.theme == 'original')
                    this.context.strokeStyle = '#000';
                else if (this.userDetailsStore.theme == 'apprentice') {
                    this.context.strokeStyle = '#000';
                } else this.context.strokeStyle = '#fff';
            }

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
            const tree = d3.tree().nodeSize([this.nodeWidth, this.nodeHeight]);
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
            let screenWidth = window.innerWidth;
            let shift = 143;
            if (screenWidth > 480) {
                shift = 100;
            }
            if (screenWidth > 1024) {
                shift = 10;
            }
            d3.select(this.context.canvas)
                .transition()
                .duration(700)
                .call(
                    this.d3Zoom.transform,
                    d3.zoomIdentity
                        .translate(0, this.context.canvas.height / 2 - shift)
                        .scale(0.3)
                );
            this.$refs.sliderControl.showScaleLabel();
        },
        // programmatic d3 zoom
        zoomInD3(scale, panX, panY) {
            d3.select(this.context.canvas).call(
                this.d3Zoom.transform,
                d3.zoomIdentity.translate(panX, panY).scale(scale)
            );
            this.$refs.sliderControl.showScaleLabel();
        },
        // zoom and pan to a node
        goToLocation(node) {
            const skillTreeHeight = this.$refs.wrapper.clientHeight;
            const skillTreeWidth = this.$refs.wrapper.clientWidth;
            const zoomedScale = skillTreeWidth > 480 ? 1.75 : 1.2;
            const centerYOffset = skillTreeWidth > 480 ? 2.5 : 2.8;
            const centerXOffset = 2;
            this.resultNode = node;
            const translateX =
                -node.y * zoomedScale + skillTreeWidth / centerXOffset;
            const translateY =
                -node.x * zoomedScale + skillTreeHeight / centerYOffset;

            d3.select(this.context.canvas)
                .transition()
                .duration(2000)
                .call(
                    this.d3Zoom.transform,
                    d3.zoomIdentity
                        .translate(translateX, translateY)
                        .scale(zoomedScale)
                );
        },
        // Pan with arrow keys and joystick.
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
                    return '#FFA500';
                case 'grade_school':
                    return '#40E0D0';
                case 'high_school':
                    return '#FFD700';
                case 'middle_school':
                    return '#33A133';
                case 'phd':
                    return '#FF0000';
                default:
                    break;
            }
        },
        // We using a darker color for node border when it is mastered
        hexBorderColor(skillLevel) {
            switch (skillLevel) {
                case 'college':
                    return '#CC8400';
                case 'grade_school':
                    return '#33B3A6';
                case 'high_school':
                    return '#CCAC00';
                case 'middle_school':
                    return '#006400';
                case 'phd':
                    return '#CC0000';
                default:
                    break;
            }
        },
        // Find node with name include
        findNodeWithName(searchString) {
            // D3
            let breakLoop = false;
            let resultNode = null;
            this.root.each(function (node) {
                if (breakLoop) {
                    return;
                }
                if (node.data.skill_name === searchString) {
                    resultNode = node;
                    breakLoop = true;
                }
            });
            return resultNode;
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
        },
        // if search skill get filtered out by level or subject we remove it
        async removeFilterForHiddenSkill(searchName) {
            const node = await this.skillTreeStore.findInStudentSkill(
                searchName,
                this.userDetailsStore.userId
            );
            this.userDetailsStore.gradeFilter = node.level;
            try {
                await this.reloadTree();
                const resultNode = this.findNodeWithName(searchName);
                this.$parent.gradeFilter = node.level;

                this.goToLocation(resultNode);
            } catch (error) {
                console.log('error: ' + error);
                // Error mean the skill oldest ancestors is get filtering out
                await this.removeSubjectFilterForSkill(searchName, node);
            }
        },
        async removeSubjectFilterForSkill(searchName, node) {
            const parentNode = await this.skillTreeStore.findFatherSubject(
                node
            );

            this.userDetailsStore.subjectFilters.push(parentNode.skill_name);
            await this.reloadTree();

            const resultNode = this.findNodeWithName(searchName);
            this.toggleParentSubjectFilter();
            this.goToLocation(resultNode);
        },
        toggleParentSubjectFilter() {
            for (
                let i = 0;
                i < this.userDetailsStore.subjectFilters.length;
                i++
            ) {
                if (this.userDetailsStore.subjectFilters[i] == 'Language') {
                    this.$parent.isLanguage = true;
                }
                if (this.userDetailsStore.subjectFilters[i] == 'Mathematics') {
                    this.$parent.isMathematics = true;
                }
                if (
                    this.userDetailsStore.subjectFilters[i] ==
                    'Science & Invention'
                ) {
                    this.$parent.isScienceAndInvention = true;
                }
                if (
                    this.userDetailsStore.subjectFilters[i] ==
                    'Computer Science'
                ) {
                    this.$parent.isComputerScience = true;
                }
                if (this.userDetailsStore.subjectFilters[i] == 'History') {
                    this.$parent.isHistory = true;
                }
                if (this.userDetailsStore.subjectFilters[i] == 'Life') {
                    this.$parent.isLife = true;
                }
                if (
                    this.userDetailsStore.subjectFilters[i] == 'Dangerous Ideas'
                ) {
                    this.$parent.isDangerousIdeas = true;
                }
            }
        },

        async redrawTree(level, subject) {
            this.showSkillPanel = false;
            await this.skillTreeStore.getVerticalTreeUserSkills(level, subject);

            // If the student clicks a button on the grade level key,
            // this will truncate the tree to that level.
            let userSkills = [];
            if (this.truncateLevel == 'grade_school') {
                userSkills =
                    this.skillTreeStore.gradeSchoolVerticalTreeUserSkills;
            } else if (this.truncateLevel == 'middle_school') {
                userSkills =
                    this.skillTreeStore.middleSchoolVerticalTreeUserSkills;
            } else if (this.truncateLevel == 'high_school') {
                userSkills =
                    this.skillTreeStore.highSchoolVerticalTreeUserSkills;
            } else if (this.truncateLevel == 'college') {
                userSkills = this.skillTreeStore.collegeVerticalTreeUserSkills;
            } else {
                userSkills = this.skillTreeStore.verticalTreeUserSkills;
            }

            this.skill = {
                name: 'SKILLS',
                sprite: null,
                children: userSkills
            };

            var skillsWithSubSkillsMoved = [];
            skillsWithSubSkillsMoved = JSON.parse(
                JSON.stringify(this.skill.children)
            );

            // Duplicate super skill node, and make second one a child of the first.
            // Put all the subskills of the node in the second version.
            // This is an attempt to show the subskills using D3.
            function moveSubSkills(parentChildren) {
                var i = parentChildren.length;
                while (i--) {
                    // If the skill is a super skill, and not an "end" super skill.
                    if (
                        parentChildren[i].type == 'super' &&
                        parentChildren[i].position != 'end'
                    ) {
                        if (parentChildren[i].show_children) {
                            if (parentChildren[i].show_children == 0) {
                                return;
                            }
                        }
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

            // Height is constant
            const dx = 24;

            //Shorten lines based on truncate level.
            let multiplyBy = 5;
            if (this.truncateLevel == 'grade_school') {
                multiplyBy = 1;
            } else if (this.truncateLevel == 'middle_school') {
                multiplyBy = 2;
            } else if (this.truncateLevel == 'high_school') {
                multiplyBy = 3;
            } else if (this.truncateLevel == 'college') {
                multiplyBy = 4;
            }
            const dy = (this.width / (this.root.height + 1)) * multiplyBy;

            // Create a tree layout.
            this.tree = d3.tree().nodeSize([this.nodeWidth, this.nodeHeight]);

            // Sort the tree and apply the layout.
            this.root.sort((a, b) => d3.ascending(a.data.name, b.data.name));
            this.tree(this.root);

            this.zoomInD3(this.scale, this.panX, this.panY);
            console.log('Tree get redraw, here is the context: ');
            console.log(this.context);
        },

        toggleHideChildren(node) {
            var url =
                '/user-skills/hide-children/' +
                this.userDetailsStore.userId +
                '/' +
                node.id;
            fetch(url).then(() => {
                this.reloadTree(node, this.truncateLevel, this.subjectFilters);
            });
        },
        toggleShowChildren(node) {
            var url =
                '/user-skills/show-children/' +
                this.userDetailsStore.userId +
                '/' +
                node.id;
            fetch(url).then(() => {
                this.reloadTree(node, this.truncateLevel, this.subjectFilters);
            });
        },
        async reloadTree(node) {
            this.showSkillPanel = false;
            await this.skillTreeStore.getVerticalTreeUserSkills(
                this.userDetailsStore.gradeFilter,
                this.userDetailsStore.subjectFilters
            );

            // If the student clicks a button on the grade level key,
            // this will truncate the tree to that level.
            let userSkills = [];
            if (this.userDetailsStore.gradeFilter == 'grade_school') {
                userSkills =
                    this.skillTreeStore.gradeSchoolVerticalTreeUserSkills;
            } else if (this.userDetailsStore.gradeFilter == 'middle_school') {
                userSkills =
                    this.skillTreeStore.middleSchoolVerticalTreeUserSkills;
            } else if (this.userDetailsStore.gradeFilter == 'high_school') {
                userSkills =
                    this.skillTreeStore.highSchoolVerticalTreeUserSkills;
            } else if (this.userDetailsStore.gradeFilter == 'college') {
                userSkills = this.skillTreeStore.collegeVerticalTreeUserSkills;
            } else {
                userSkills = this.skillTreeStore.verticalTreeUserSkills;
            }

            this.skill = {
                name: 'SKILLS',
                sprite: null,
                children: userSkills
            };

            this.data = {
                skill_name: 'My skills',
                children: this.skill.children
            };

            // Compute the tree height; this approach will allow the height of the
            // SVG to scale according to the breadth (width) of the tree layout.
            this.root = d3.hierarchy(this.data);

            // Height is constant
            const dx = 24;

            //Shorten lines based on truncate level.
            let multiplyBy = 5;
            if (this.userDetailsStore.gradeFilter == 'grade_school') {
                multiplyBy = 1;
            } else if (this.userDetailsStore.gradeFilter == 'middle_school') {
                multiplyBy = 2;
            } else if (this.userDetailsStore.gradeFilter == 'high_school') {
                multiplyBy = 3;
            } else if (this.userDetailsStore.gradeFilter == 'college') {
                multiplyBy = 4;
            }
            const dy = (this.width / (this.root.height + 1)) * multiplyBy;

            // Create a tree layout.
            this.tree = d3.tree().nodeSize([this.nodeWidth, this.nodeHeight]);

            // Sort the tree and apply the layout.
            this.root.sort((a, b) => d3.ascending(a.data.name, b.data.name));
            this.tree(this.root);

            this.zoomInD3(this.scale, this.panX, this.panY);

            let translateX = 0;
            let translateY = 0;
            if (typeof node !== 'undefined' && node != null) {
                translateX =
                    -node.y * this.scale +
                    (window.innerWidth / (2 * this.scale)) * this.scale;
                translateY =
                    -node.x * this.scale +
                    (window.innerHeight / (2 * this.scale)) * this.scale;
            }

            d3.select(this.context.canvas)
                .transition()
                .duration(1000)
                .call(
                    this.d3Zoom.transform,
                    d3.zoomIdentity
                        .translate(translateX, translateY)
                        .scale(this.scale)
                );
            this.resetPos();
        },
        expandAllChildren() {
            var url =
                '/user-skills/expand-all-children/' +
                this.userDetailsStore.userId;
            fetch(url).then(() => {
                this.reloadTree();
            });
        },
        // Grade level and root subject filter
        async filter() {
            this.skill.children = await this.reloadTree(null);
            this.saveSkillTreeFilters();
        },
        saveSkillTreeFilters() {
            // Update the DB
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    level: this.userDetailsStore.gradeFilter,
                    is_language_filter: this.$parent.isLanguage,
                    is_math_filter: this.$parent.isMathematics,
                    is_history_filter: this.$parent.isHistory,
                    is_life_filter: this.$parent.isLife,
                    is_computer_science_filter: this.$parent.isComputerScience,
                    is_science_and_invention_filter:
                        this.$parent.isScienceAndInvention,
                    is_dangerous_ideas_filter: this.$parent.isDangerousIdeas
                })
            };
            var url =
                '/users/' +
                this.userDetailsStore.userId +
                '/skill-tree-filters';
            fetch(url, requestOptions);
        },
        checkingIfNodeInView(node) {
            let scale = 1;
            if (this.transformData.k > 1) {
                scale = this.transformData.k;
            }
            // Calculate max visible range
            this.visibleRangeX = this.transformData.x + this.width * scale;

            this.visibleRangeY = this.transformData.y - this.height * scale;
            // Calculate real position of node with current scale
            let realPositionX = node.y * this.transformData.k;
            let realPositionY = -node.x * this.transformData.k;
            let combinePosition = this.transformData.x + realPositionX;
            if (
                combinePosition > 0 &&
                combinePosition < this.width &&
                this.transformData.y > realPositionY &&
                realPositionY > this.visibleRangeY
            ) {
                this.nodeDrew += 1;
                return true;
            }
            return false;
        },
        async generatePath() {
            const res = await fetch('/skills/generate-dummy-path');
            const resData = await res.json();
        },
        async getIconPath() {
            const res = await fetch('/skills/icon-list');
            const resData = await res.json();
            // Prepare the icon path array into a hashmap/dictionary for even better performant
            this.iconDictionary = Object.fromEntries(
                resData.map((icon) => [icon.skill_url, icon.path])
            );
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
    <div ref="wrapper" v-show="isLoading == false" id="wrapper">
        <SkillPanel :skill="skill" :showSkillPanel="showSkillPanel" />
        <div
            v-if="showAnimation"
            :style="{ top: `${yPos}px`, left: `${xPos}px` }"
            class="click-animation"
        ></div>
        <canvas
            id="canvas"
            width="1500"
            height="1500"
            ref="canvas"
            tabindex="1"
        ></canvas>
        <canvas id="hidden-canvas" width="1500" height="1500"></canvas>
        <div id="SVGskilltree"></div>
        <SliderControl ref="sliderControl" />
        <div id="sidepanel-backdrop"></div>
        <JoystickControl class="d-lg-none" />
        <div class="debug-console">
            <!-- <div class="d-flex">
                <div>Translate X:</div>
                <div>{{ transformData.x }}</div>
                ||
                <div>Translate Y:</div>
                <div>{{ transformData.y }}</div>
                ||
                <div>scale:</div>
                <div>{{ transformData.k }}</div>
            </div>
            <div class="d-flex">
                <div>Node X:</div>
                <div>{{ currentNodeY * transformData.k }}</div>
                ||
                <div>Node Y:</div>
                <div>{{ -currentNodeX * transformData.k }}</div>
            </div>
            <div class="d-flex">
                <div>Visible X:</div>
                <div>{{ visibleRangeX }}</div>
                ||
                <div>Visible Y:</div>
                <div>{{ visibleRangeY }}</div>
                <button type="button" @click="generatePath">
                    Click me !!!
                </button>
            </div> -->
            <div class="d-flex">node drew: {{ nodeDrew }}</div>
        </div>
    </div>
</template>

<style scoped>
.loader {
    width: 48px;
    height: 48px;
    border: 5px solid var(--loading-animation-colour);
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

.debug-console {
    position: absolute;
    left: 400px;
    bottom: 100px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    background-color: rgb(127, 255, 212);
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
    /* height: calc(100% - 130px); */
    height: calc(100%);
    overflow: hidden;
    position: relative;
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
canvas {
    cursor: pointer;
    background-color: var(--skill-tree-background-color);
}
.click-animation {
    position: absolute;
    width: 20px;
    height: 20px;
    background-color: var(--primary-color); /* Color of the animation */
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
        /* height: calc(100% - 130px); */
        height: calc(100%);
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
