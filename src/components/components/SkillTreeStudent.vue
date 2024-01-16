<script>
// Import Pixi JS.
import * as PIXI from 'pixi.js';
// Import Pixi Viewprt.
import { Viewport } from 'pixi-viewport';
// For pixi to use custom fonts.
import FontFaceObserver from 'fontfaceobserver';

// Nested component.
import SkillPanel from './SkillPanel.vue';

export default {
  setup() {},
  data() {
    return {
      // The student's id.
      userId: this.$route.params.id,
      // Sizes of the nodes, per level.
      firstLevelNodeRadius: 36,
      otherLevelNodeRadius: 17,
      // Radius's of the different skill levels.
      firstLevelCircleRadius: 300,
      nodeDistance: 300,
      // Arrays to position the nodes and for the filters.
      isSkillInfoPanelShown: false,
    };
  },
  components: {
    SkillPanel,
  },
  async mounted() {
    // Get the nested list of user skills, of the student.
    const result = await fetch('/user-skills/' + this.userId);
    this.userSkills = await result.json();
    // Need to make sure the font is loaded before loading the app, or font wont load at first.
    // Create font the loader.
    let font = new FontFaceObserver('Poppins900', {});
    // Once font has loaded, load PIXI app.

    font.load().then(
      () => {
        const skilltreeDiv = document.getElementById('skilltree');
        const app = new PIXI.Application({
          // Take up whole div.
          resizeTo: skilltreeDiv,
          // Otherwise nodes and lines are blocky.
          antialias: true,
          // May reduce resources used.
          useContextAlpha: false,
          // Background colour.
          //backgroundColor: 0xffffff
        });

        // Work out the width and height of the div, for the zooming and panning.
        var skillTreeDivStyle = window.getComputedStyle(
          document.getElementById('skilltree'),
          null
        );
        var skillTreeDivWidth = skillTreeDivStyle.getPropertyValue('width');
        var skillTreeDivHeight = skillTreeDivStyle.getPropertyValue('height');

        // Create viewport.
        const viewport = new Viewport({
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight,
          worldWidth: skillTreeDivWidth,
          worldHeight: skillTreeDivHeight,

          events: app.renderer.events, // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
        });
        // So that the z-index of the elements can be changed (NB for the connecting lines).
        viewport.sortableChildren = true;

        // Add the viewport to the stage.
        app.stage.addChild(viewport);

        // Activate viewport plugins.
        viewport
          .drag()
          .pinch()
          .wheel()
          // Restrict amount of zoom in and out.
          .clampZoom({ minScale: 0.2, maxScale: 4 });

        skilltreeDiv.appendChild(app.view);

        // Center Circle Halo
        let centerNodeHalo = new PIXI.Graphics();
        centerNodeHalo.lineStyle(3, 0xc8d7da, 1);
        centerNodeHalo.beginFill(0xffffff, 1);
        centerNodeHalo.drawCircle(
          window.innerWidth / 2,
          window.innerHeight / 2,
          65
        );
        centerNodeHalo.endFill();
        viewport.addChild(centerNodeHalo);

        // Center circle. ------
        // Graphic.
        // const centerNode = PIXI.Sprite.from('center-node.png');
        // centerNode.x = window.innerWidth / 2
        // centerNode.y = window.innerHeight / 2
        // centerNode.anchor.set(0.5)
        // centerNode.scale.set(0.15)
        // viewport.addChild(centerNode)

        // Text.
        // Font size is set artificially high, then scaed down, to improve resolution.
        let centerNodeText = new PIXI.Text('SKILLS', {
          fontFamily: 'Poppins900',
          fontSize: 90,
          fill: 0x000000,
          align: 'center',
        });
        centerNodeText.anchor.set(0.5);
        // Center it.
        centerNodeText.x = window.innerWidth / 2;
        centerNodeText.y = window.innerHeight / 2;
        // This is to deal with the artificially high font size mentioned above.
        centerNodeText.scale.x = 0.2;
        centerNodeText.scale.y = 0.2;
        viewport.addChild(centerNodeText);

        // Number of skills in first level.
        var firstLevelSkillsNum = this.userSkills.length;

        for (let i = 0; i < firstLevelSkillsNum; i++) {
          let userSkill = this.userSkills[i];

          // Draw the circles.
          let firstLevelSkillNodeGraphic = new PIXI.Graphics();

          // Colour depending on mastery, date of mastery, and whether skill is unlocked.
          var color;
          if (userSkill.is_mastered == 1) {
            color = '0x' + userSkill.mastered_color;
          } else if (userSkill.is_accessible == 1) {
            firstLevelSkillNodeGraphic.lineStyle(
              1,
              '0x' + userSkill.mastered_color,
              1
            );
            color = '0x' + userSkill.unlocked_color;
          } else {
            color = '0xD9D9D9';
          }

          // Calculate the spacing and position of the first level skills around a circle path.
          var theta = (Math.PI * 2) / firstLevelSkillsNum;
          var angle = theta * i;

          /* Smaller circles around the halo.*/
          var smallCircleX = 65 * Math.cos(angle);
          var smallCircleY = 65 * Math.sin(angle);

          let haloGraphic = new PIXI.Graphics();
          // Position is half the width of canvas plus x, half the height of canvas plus y.
          haloGraphic.x = window.innerWidth / 2 + smallCircleX;
          haloGraphic.y = window.innerHeight / 2 + smallCircleY;
          // Draw the circles.
          haloGraphic.beginFill(color);
          haloGraphic.drawCircle(0, 0, 7.5);
          viewport.addChild(haloGraphic);

          /* First level skills.*/
          // Calculate node spacing.
          var spacing = 1.5;

          // Calculate the radius of the first level of skills.
          //this.firstLevelCircleRadius = (firstLevelSkillsNum * this.firstLevelNodeRadius) / spacing

          // Calculate the spacing and position of the first level skills around a circle path.
          var x = this.firstLevelCircleRadius * Math.cos(angle);
          var y = this.firstLevelCircleRadius * Math.sin(angle);

          var firstLevelSkillContainer = new PIXI.Container();
          // Position is half the width of canvas plus x, half the height of canvas plus y.
          firstLevelSkillContainer.x = window.innerWidth / 2 + x;
          firstLevelSkillContainer.y = window.innerHeight / 2 + y;

          // Halo.
          // TODO - correct colours.
          //firstLevelSkillNodeGraphic.lineStyle(6, 0xC8D7DA, 1);

          firstLevelSkillNodeGraphic.beginFill(color);
          firstLevelSkillNodeGraphic.drawCircle(
            0,
            0,
            this.firstLevelNodeRadius
          );
          firstLevelSkillNodeGraphic.endFill();

          // Lines connecting the center node with the first level skills.
          const connectingLineGraphic = new PIXI.Graphics();
          connectingLineGraphic.lineStyle(2, color, 1);
          connectingLineGraphic.position.x = firstLevelSkillContainer.x;
          connectingLineGraphic.position.y = firstLevelSkillContainer.y;
          connectingLineGraphic.lineTo(
            haloGraphic.x - firstLevelSkillContainer.x,
            haloGraphic.y - firstLevelSkillContainer.y
          );

          viewport.addChild(connectingLineGraphic);
          // Add the first level skills to the array, for the filter.
          var firstLevelSkillConnectingLine = {
            graphic: connectingLineGraphic,
            x: connectingLineGraphic.position.x,
            y: connectingLineGraphic.position.y,
            lineToX: haloGraphic.x - firstLevelSkillContainer.x,
            lineToY: haloGraphic.y - firstLevelSkillContainer.y,
            tagIDs: [],
          };

          // Write the skill names---------------------------------------.
          var fontSize = 60;
          //Working on having a smaller font size, if any one word is too long-------------------.
          // Split name into an array.
          const skillNameArray = userSkill.skill_name.split(' ');
          for (let p = 0; p < skillNameArray.length; p++) {
            // Check if any of the strings are too long.
            if (skillNameArray[p].length > 8) {
              fontSize = 45;
            }
          }

          // Add line break if skill name is more than one word.
          userSkill.skill_name = userSkill.skill_name.replace(
            /(.*?\s)/g,
            '$1' + '\n'
          );
          // Note that the fontSize is 5 times higher than encessary, to deal with pixellation on zoom.
          let firstLevelSkillNodeName = new PIXI.Text(
            userSkill.skill_name.toUpperCase(),
            {
              fontFamily: 'Poppins900',
              fontSize: fontSize,
              fill: 0xffffff,
              align: 'center',
            }
          );

          // Text to centre of container.
          firstLevelSkillNodeName.anchor.set(0.5);

          // This is to deal with the artificially high fontSize mentioned above.
          firstLevelSkillNodeName.scale.x = 0.2;
          firstLevelSkillNodeName.scale.y = 0.2;

          // Add the graphic and text to the container.
          firstLevelSkillContainer.addChild(firstLevelSkillNodeGraphic);
          firstLevelSkillContainer.addChild(firstLevelSkillNodeName);

          // Add the first level skills to the viewport.
          viewport.addChild(firstLevelSkillContainer);

          // Create the first level skill object:
          let firstLevelSkill = {
            id: userSkill.id,
            isMastered: userSkill.is_mastered,
            isUnlocked: userSkill.is_accessible,
            color: color,
            container: firstLevelSkillContainer,
            tagIDs: [],
            name: userSkill.skill_name,
            description: userSkill.description,
          };

          // Add interactivity.
          // This is added to the graphic and text, and not the container,
          // as it would otherwise effect all the container's child skills.
          firstLevelSkillNodeGraphic.eventMode = 'static';
          firstLevelSkillNodeName.eventMode = 'static';
          firstLevelSkillNodeGraphic.cursor = 'pointer';
          firstLevelSkillNodeName.cursor = 'pointer';
          firstLevelSkillNodeGraphic.on('pointerdown', (event) => {
            if (!this.isSkillInfoPanelShown)
              this.showInfoPanel(firstLevelSkill);
            else this.updateInfoPanel(firstLevelSkill);
          });
          firstLevelSkillNodeName.on('pointerdown', (event) => {
            if (!this.isSkillInfoPanelShown)
              this.showInfoPanel(firstLevelSkill);
            else this.updateInfoPanel(firstLevelSkill);
          });

          /*
           * Recursive function to render all descendant nodes.
           */
          let arrayOfLevels = [];
          let skillNodeObject = {
            domain: userSkill.skill_name,
            skillNodeLevels: arrayOfLevels,
          };
          function renderDescendantNodes(
            parentChildren,
            parentContainer,
            parentAngle,
            totalAncestorXPos,
            totalAncestorYPos,
            depth,
            context
          ) {
            // Increase the depth each recursion.
            depth++;

            let skillsObject = { depth: depth, skills: [] };

            // We tally the ancestor node positions to calculate the connecting lines.
            totalAncestorXPos = totalAncestorXPos + parentContainer.x;
            totalAncestorYPos = totalAncestorYPos + parentContainer.y;

            // Parameters
            let nodeDistance = 300;
            let subNodeDistance = 75;
            let nodeRadius = 17;

            for (let [index, child] of parentChildren.entries()) {
              let nodeContainer = new PIXI.Container();

              // Sort the children into subskills and actual child skills.
              let numChildren = 0;
              let numSubSkills = 0;
              for (let i = 0; i < parentChildren.length; i++) {
                if (parentChildren[i].type != 'sub') {
                  numChildren++;
                } else {
                  numSubSkills++;
                }
              }

              /*
               * The angle of the node from its parent.
               */
              let nodeAngle = 0;
              if (child.type != 'sub') {
                // Working out the placement of the nodes, in relation to their parent.

                // Work out the increment.
                // 90 degrees is the total range outwards the tree angles can go,
                // from the previous node.
                let increment = 0;
                if (depth == 1) increment = 135 / numChildren;
                else increment = 90 / numChildren;

                // Get the correct index number, excluding sub skills.
                let mainSkillsIndex = index - numSubSkills;
                // // Work out each chind node angle, based on the parent angle, and the increment, and which child it is.
                nodeAngle = parentAngle + increment * mainSkillsIndex;

                // This is the placement of the first of the child nodes.
                // We have to change the angle so that the child nodes dont start incrememting
                // from the parent node angle.
                if (depth == 1)
                  nodeAngle = nodeAngle - 67.5 + 67.5 / numChildren;
                else nodeAngle = nodeAngle - 45 + 45 / numChildren;

                let rads = (nodeAngle * Math.PI) / 180;
                let x = nodeContainer.x + nodeDistance * Math.cos(rads);
                let y = nodeContainer.y + nodeDistance * Math.sin(rads);

                nodeContainer.x = nodeContainer.x + x;
                nodeContainer.y = nodeContainer.y + y;
                skillsObject.skills.push(nodeContainer);
              }
              // For subskills, they just go around the super skill (360 degrees).
              else {
                // Calculate the increment of the subskills, around a circle.
                let increment = 360 / numSubSkills;
                // Get the correct index number, excluding sub skills.
                let subSkillsIndex = index - numChildren;
                // Calculate the nodes angle.
                let angle = increment * subSkillsIndex;
                let rads = (angle * Math.PI) / 180;
                let x = nodeContainer.x + subNodeDistance * Math.cos(rads);
                let y = nodeContainer.y + subNodeDistance * Math.sin(rads);

                nodeContainer.x = nodeContainer.x + x;
                nodeContainer.y = nodeContainer.y + y;
              }

              /*
               * Draw the nodes
               */
              let nodeGraphic = new PIXI.Graphics();
              // Colour depending on mastery and whether skill is unlocked.
              var color;
              if (parentChildren[index].is_mastered == 1) {
                color = '0x' + userSkill.mastered_color;
              } else if (parentChildren[index].is_accessible == 1) {
                nodeGraphic.lineStyle(1, '0x' + userSkill.mastered_color, 1);
                color = '0x' + userSkill.unlocked_color;
              } else {
                color = '0xD9D9D9';
              }
              nodeGraphic.beginFill(color);
              nodeGraphic.drawCircle(0, 0, nodeRadius);
              // Add components to the container.
              nodeContainer.addChild(nodeGraphic);

              /*
               * Write the skill names.
               */
              let fontSize = 40;
              // Split name into an array.
              const nodeNameArray = parentChildren[index].skill_name.split(' ');
              for (let i = 0; i < nodeNameArray.length; i++) {
                // Check if any of the strings are too long.
                if (nodeNameArray[i].length > 9) {
                  fontSize = 37;
                }
              }

              // Add line break if skill name is more than one word.
              parentChildren[index].skill_name = parentChildren[
                index
              ].skill_name.replace(/(.*?\s)/g, '$1' + '\n');
              // Note that the fontSize is 5 times higher than encessary, to deal with pixellation on zoom.
              let nodeName = new PIXI.Text(
                parentChildren[index].skill_name.toUpperCase(),
                {
                  fontFamily: 'Poppins900',
                  fontSize: fontSize,
                  fill: 0xffffff,
                  align: 'center',
                }
              );
              // Text to centre of container.
              nodeName.anchor.set(0.5);

              // This is to deal with the artificially high fontSize mentioned above.
              nodeName.scale.x = 0.1;
              nodeName.scale.y = 0.1;

              // Add components to the container.
              nodeContainer.addChild(nodeName);

              // Create the  skill object:
              let skill = {
                id: child.id,
                isMastered: child.is_mastered,
                isUnlocked: child.is_accessible,
                //  isParentMastered: userSkill.is_mastered,
                //   isParentUnlocked: userSkill.is_accessible,
                color: color,
                container: nodeContainer,
                name: child.skill_name,
                description: child.description,
                tagIDs: [],
                //parentTagIDs: firstLevelSkill.tagIDs,
                //angle: newAngle
              };

              // Add interactivity.
              // This is added to the graphic and text, and not the container,
              // as it would otherwise effect all the container's child skills.
              nodeGraphic.eventMode = 'static';
              nodeName.eventMode = 'static';
              nodeGraphic.cursor = 'pointer';
              nodeName.cursor = 'pointer';
              nodeName.on('pointerdown', (event) => {
                if (!context.isSkillInfoPanelShown)
                  context.showInfoPanel(skill);
                else context.updateInfoPanel(skill);
              });
              nodeGraphic.on('pointerdown', (event) => {
                if (!context.isSkillInfoPanelShown)
                  context.showInfoPanel(skill);
                else context.updateInfoPanel(skill);
              });

              // Add the child node to the parent node.
              parentContainer.addChild(nodeContainer);

              /*
               * Connecting lines.
               */
              const connectingLine = new PIXI.Graphics();
              connectingLine.lineStyle(2, color, 1);

              connectingLine.position.x = totalAncestorXPos;
              connectingLine.position.y = totalAncestorYPos;
              connectingLine.lineTo(nodeContainer.x, nodeContainer.y);
              // Put the connecting line behind the skill nodes.
              connectingLine.zIndex = -1;
              viewport.addChild(connectingLine);

              arrayOfLevels.push(skillsObject);
              /*
               * Run the above function again recursively.
               */
              if (
                child.children &&
                Array.isArray(child.children) &&
                child.children.length > 0
              )
                renderDescendantNodes(
                  child.children,
                  nodeContainer,
                  nodeAngle,
                  totalAncestorXPos,
                  totalAncestorYPos,
                  depth,
                  context
                );
            }
          }

          // Run the recursive function.
          // For each first level skill...
          // Pass the child nodes, the container, the angle.
          // The 2 zeros are to begin to tally the sum of all the ancestor position values, for the connecting lines.
          // The other zero is for the depth.
          renderDescendantNodes(
            userSkill.children,
            firstLevelSkillContainer,
            angle * 60,
            0,
            0,
            0,
            this
          );
        }
      },
      () => {
        // Failed load, log the error or display a message to the user
        console.log('Unable to load required font!');
      }
    );
  },
  methods: {
    showInfoPanel(skill) {
      // If panel is not showing.
      if (!this.isSkillInfoPanelShown) {
        // To display the panel.
        // Responsive.
        // Laptop etc.
        if (screen.width > 800) {
          document.getElementById('skillInfoPanel').style.width = '474px';
        }
        // Mobile device.
        else {
          document.getElementById('skillInfoPanel').style.height = '474px';
        }
        // Make the background dark and disabled.
        document.getElementById('sidepanel-backdrop').style.display = 'block';

        this.isSkillInfoPanelShown = true;
        // Populate the skill heading.
        var skillHeading = document.getElementById('skillHeading');
        var name = document.createTextNode(skill.name);
        skillHeading.appendChild(name);
        // Populate the skill description.
        var skillDescription = document.getElementById('skillDescription');
        var description = document.createTextNode(skill.description);
        skillDescription.appendChild(description);
        // Populate the skill panel check box.
        if (skill.isMastered == '1') {
          document.getElementById('skillIsMastered').checked = true;
        }
        // Populate the skill link button.
        var skillLink = document.getElementById('skillLink');
        skillLink.setAttribute('href', '/skills/' + skill.id);
      }
    },
    updateInfoPanel(skill) {
      // If panel is showing.
      if (this.isSkillInfoPanelShown) {
        // Populate the skill heading.
        var skillHeading = document.getElementById('skillHeading');
        skillHeading.innerHTML = '';
        var name = document.createTextNode(skill.name);
        skillHeading.appendChild(name);
        // Populate the skill description.
        var skillDescription = document.getElementById('skillDescription');
        skillDescription.innerHTML = '';
        var description = document.createTextNode(skill.description);
        skillDescription.appendChild(description);
        // Populate the skill panel check box.
        if (skill.isMastered == '1') {
          document.getElementById('skillIsMastered').checked = true;
        } else document.getElementById('skillIsMastered').checked = false;
        // Populate the skill link button.
        var skillLink = document.getElementById('skillLink');
        skillLink.setAttribute('href', '/skills/' + skill.id);
      }
    },
  },
};
</script>

<template>
  <div class="flex-container skill-tree-container">
    <!-- Wrapper is for the dark overlay, when the sidepanel is displayed -->
    <div id="wrapper">
      <div id="skilltree">
        <SkillPanel />
      </div>
      <div id="sidepanel-backdrop"></div>
    </div>
  </div>
</template>

<style scoped>
.skill-tree-container {
  /* Subtract the purple banner and the navigation bar. */
  height: calc(100% - 77px - 66px);
}

#wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

#skilltree {
  width: 100%;
  height: 100%;
  overflow: hidden;
  /* This is for the positioning of the information panel. */
  position: relative;
}
</style>
