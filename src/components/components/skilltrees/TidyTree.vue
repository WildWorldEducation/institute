<script>
// Import the stores.
import { useSkillTreeStore } from '../../../stores/SkillTreeStore';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';
// Nested components.
import SkillPanel from './../SkillPanel.vue';
import ZoomControl from './ZoomControl.vue';
import JoystickControl from './JoystickControl.vue';

import * as d3 from 'd3';
import TidyTreeTooltip from './TidyTreeTooltip.vue';

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
            nodeWidth: 80,
            nodeHeight: 800,
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
                hasChildren: false,
                subskills: []
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
            // Default skill icon to show if the skill don`t have any
            defaultIconImage:
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAB2AAAAdgB+lymcgAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAcKSURBVHic7dp7sJVVGcfxz+EcUdME0TAFSs0ms6lEMdAmzbTSIrqJdrxN6gw6U45M+odOpNukDMguTjV20coCQ9NKC9PSCbNsMO2iWXZRk0kzrXS0RkQ4/fHbJ96zr+8+ZwMy7u/MHjjrXe961/usZz239dKjR48ePXr0eL7St7kn0AET8Va8BVOxK8bh7/gbbsb1+Ecng24JAtgD52MOVspL/llefD0m42UimMNxKxbgrs0x2W4yDgtlRRdg+xL3jMfpeAhfxDYbbXYbmR3wffwIO4/i/u1xBX4hW6UprbbAjtXfpmYrLJXJz8ezDfoMYC950X/jAayr6dOHs3EyZuGfjR7WSACvxyWYUh18U7MnvoVjMVRoH4/3Yh72xWNi/HbBJKzAx/GnmvEWY4YY0LXtHj4FD+PIsbzBGJiLX2HbBte+gEfwPryg5tpOOKt6/UM11/pxA84sM4F5+HL5+XaVbXA/3tjk+i64G+e1GGM33I6LatpfIcZ0UrtJVKq/zcHxslJFBsQbDDNZhFBpMc6Eap8Ta9q/gnPaTaLSZvCNyfU4pqZtabW96M4mi4+vtBjrtWIfXlhoO0i2V0sqbQYeZltRt61L9C3DePxHor1hho3wVfhBzbOGhXB+izGvwvsLf/fLNphW7FRUrzLMxI14VPbao7ha9thY2Bt/xOOFtrfLiw/iKXxbBEVe5E14t+ZCuEYs/zDrxLXuU+zUiQDm4ju4XIKTKaIFK6u/N3QwVi17SWhb5ADcInHAcViDKyVOIMI/TITw0QZj3qN+YR7Gy4sNZQXwEnweb8Y38XS1/SlcLD77CuXC1UYMiF8vMgUPVv//rGjCeixXL4R3qRfCM4V+wzxmgxahvABOw1fxuybXb8bPRBCjYb36qPNZIwO1tRID9GOZCI0NQngnLij03029Vu1ow+KhvABmyd5vxQ04sOR4tdyPF9e03adGXWVV54pXWKpeCHMkgSJW/zc19++qRihlBTBe9mArnlajXh3wezGExQjvJ5jdoO8zOEpc3OWiEUS9D6ves1Bc6nWF+/okJP5lcbCyArgbr2vTZ6bR5+D/xZ3yAsOsEKHMbNB/Dd4jkd3XjBTC4TYI7pbCPfvKVntQCyoaxwEH4K+aZ4d7iBpOa3K9DKeKlS9ytFjzifXdkXjkRnzdyMWcWJ1TkYuUiHEqLTpdiFXq9+UMycBObTd4G3aQ/Tm9pv2TuA0vanLftrgJl2mu0VPxRPXfllS0ltLpEoT8VFbrdqyWleoGp8ne7y+09eFcCW1P0bjKM11e8Owm4y4z0kM0paK9mmyDQ8UaH2SDJe4G/bKan2pwbT9cK4WNH8sCXCfe4iFR8UYrPB/3Khm2V2y+ZGiYSTLhs5pcnygp81y8Qwxls8rWoMQPy5o9rJurV2RvvFJWrLZU1Y5/iSX/Ll4l26Logh+XbdKKfnxM3OVi9Qbx/3SaDJVhuuQGH5bK7GhYLbnFgMQIJyo/1zn4tbi9meLCS1Mxti0wQTzCMdiu+vCTxzAesTMrJVq8GEeIJ9pOPMCeEj8sEmHdibcV7h+0ibZAHy7FDyVhISp4C+5QH5aW5ec4RNLY2VLbmybJ0jgxgMMnQ8eLAIYajtSAbgrgDMkajyu0/QEflFx+hriq0XJP9bd4DGPU0S0bMEt88NHqc4YrJVG6zOiO4gZwghx9dZ1uCGAnqePPkwOKRpwpPnp+h2NvJUWYk/A50aauMtYtMLzvl4vLa8YasQerJHq8tcTY/ZLtrZPS1m4SEt8lRrErjFUDzpF6/YISfVdLKLtcfe5fS5+cTu0sRZC1koydIBa9bUxflrEI4BBRyaOUOHKqskIqS0uNjPeL9Im67yP1vmIF5yZ8Ft/T+PSoY0YrgMlSGzxJXFAnnCtq/ZEm1y8Uj3GE1BxrWSKxxiUdPrchoxHAOHn5S9Wf5JRhvfjrU+Qli1QkiDkSTza5f6h6737GnoLXUdE+ErxAgo5mKlyWAyX/37369xmSBLWzD8PsLmXuduX4rkaCR8hpy/46T3JquU3S3qvlQ4i5OFh9JbcZD4gmLJOKVdn7RtDJFpgqBuxYHX6I1IIlcho9ICvZqT1ZgS/JMVjtGUApymrAgBx8fFqqQd1iyNiN2UK8RubWcaBUVgMWSRy/pNMHbAKGJOM8VLZER5TRgNnyacr+OsiyNjFPSpl8JX4r0WYp2mnAS+XDgkFNPjJ6DnGv5CNXSZxSilYC2Fos9EKx2FsC1+IbMu9SRrGVAD6Dv0hYuiVxntirT5TpXGsDhiQWH5QPEA7o6tQ2DeslaVollaiO7NYJUoJ6RFzLlsyrJV65RotDkdoKzQSp3d2BD2h/IvxcZkDs16BUiO9r1qnIE3LosEiOkWs/SNySWCsF0oM1efkePXr06NGjx/Ob/wGkh2+bBzkMywAAAABJRU5ErkJggg==',
            transformData: {
                x: 0,
                y: 0,
                k: 0
            },
            handIcon:
                'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAMAAADDpiTIAAAB+FBMVEUAAAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD///+5InsqAAAApnRSTlMAAQIDBAUGBwgJCgsMDQ4PEBESExQVFxkaGxwdHyAjJCgpKisuMTI2ODlBQkhJSktOT1VXWF1eYWJkZWZnaGlvcHJzdHd4eXp8fX6AgYOFiouMkZKTlJWWmJmbnJ2en6CipaqrrK2usLGytLW2t7i5uru8vb6/wMHCw8TFxsnKzc/Q0dLV2Nna29zd3t/g4+Xm5+jp6uvs7fDx8vP09fb3+fr7/P3+vGYUqgAAAAFiS0dEp8C3KwMAAAi2SURBVHja7dxnd5VFGEZhSUBOCAQL9oLYG/besLegolEUbKjYQVARFAuCLVYUsSCgiDK/04TlFxUkWW/OO+eZufYvuNfsPXOSkHDYYQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHJIjhuyvkmln3Pjo2q92pTF+GV09cvV8+ytixsXPbE//Yuvy8/vsr4ITH/wxHZCtw/PsL55TntqTDsrukWPtL5qB23em/+Xn2w+3v1zO/SIdks0L7C/1K/9Fe9IE+G2R/UXSeT5NkMf67S+POWvThHlxwP7SmLc5TYI3Oz33vf+62Ptzc8yWNClemt5j/l+IvT/7/Z+k/5SWhvbfa/uj3f9xrgztv7f2R/Sfdp0W2n8v7Y/3/u/ng77I/ntof8j7P851of33zP6w/tNPR4f23yP7g77/+7k/tP/e2B/3/o//09rc0P57YX/k+z/GraH998D+0Pd/jE9i+8++P7r/lM4O7T/3/uDv/zhLYvvPuz/+/U9pS2z/WfeX4D/tOzq0/5z7C3j/x7k0tP+M+4u4/2PcHdt/tv2l+E9Px/afa38h7/8Y78b2n2l/Mfc/pc9i+8+zvyD/6bvY/rPsL+f9H/+9mtj+c+wv6f6P/fF9bP8Z9pflP22N7b/9/YX5T5/G9t/6/tL8pw2x/be9vzj/6fHY/lveX57/dEds/+3uL+r7v79ZGNt/q/sLvP9p71Bs/3uH+G/EB7H9t7m/xPc/pcWx/be4v8j7n9Lpsf23t79Q/5uC+9/EfzOuj+2/tf2l+t82ENv/tkr+r6h5XfLf1k9RuuW/lp8Cdev+p28GY/tvaX+x/tNlsf23tL/Y9z+9Htz/6+5/I7YfH9t/O/vL9b/vktj+29lf7vuf7o3tv5395d7/tCy4/2XufyNW9sf2v7Lf/W/CKzNj+29lP//8888///zzzz///PPPfwH+Xw3u/1X++eeff/75559//vnnn3/++eeff/75559//g/IquD+V/HPP//8888///zzzz///PPPP//8888///zzzz///z2/TnD/Hf75559//vnnn3/+J8Pq4P5X888///zzzz///PPPP//8888///zzzz///PPPP//8888///zzzz//6bXg/l/jn3/++eeff/75559//vnnn3/++eeff/755/+ArAnufw3//PPPP//8888///zzzz//Ezu/geD+B/jnn3/++eeff/75559//vnnn3/++eef/4OxNrj/tfzzzz///PPPP//8888///zzzz///PPPP//8888///z/gw2Dsf23sp9//vnnn3/++eeff/75559//vnnn3/+o/qfHdz/bP75559//vnnf7K8Hdz/2/zzzz///PPPP//8888///zzXwr967p2futmtbF/Zez92Xk4+P152P1vxOLg92ex+9+Ihfti35/o+3Nzwg+xzy/6/uy80a3ze2uW/QG4Ivj9ucL9b8Ssr2OfX/T92bmrW+/noP0R6HzXnfN7Z7b9Ibgp+PndxH8zNgc/v838N2JB8PNbwH8z7gv+9dN9vv5rxqbg92eT+9+IoT9in1/0/dlZOPXnt37Q/jjcGfz+3On+N+PJ4Of3JP/N2Bj8/Dby34zR4Oc3yn8zpvYH6e/MsT8YO4Of307+m7FrKg8ww3+gE31/drZN6RO6cY79wfg8xT7B6Puz894UfxvV9isafX92Vkz1D1JavkPR92fnnhT7BKPvz84lU/+PKa2+otH3Z+eoP1PoOxR9f34+SrFPMPr+7DzQjV+pavEVjb4/O2d15Zcq27tD0ffn5+PgJ/ixAppxS3f+sKK1VzT6/uwM/phC36Ho+/Nzf4p9h6Lvz86R21PoOxR9f36uT7FPMPr+7PS9n0K/otH352f+jth3KPr+/FyeYp9g9P35WZpiv6LR9+f/MuDZ2Hco+v78dN6KfYei78/PrHWx71D0/QpQgAIUoAAFKEABClCAAhSgAAUoQAEKUIACFKAABShAAQpQgAIUoAAFKEABTlABTlABTlABTlABTlABTlABTlABTlABTlABTlABTlABTlABTlABTlABTlABTlABTlABClCAAhSgAAUoQAEKUIACFKAABShAAQpQgAIUoAAFKEABClCAAhSgAAUoQAEKUIACFKAABShAAQpQgAIUoAAFKEABClCAAhSgAAUoQAEKUIACFKAABShAAQpQgAIUoAAFKEABClCAAhSgAAUoQAEKUIACFKAABShAAQpQgAIUoAAFKEABClCAAhSgAAUoQAEKUIACFKAABShAAQpQgAIUoAAFKEABClCAAhSgAAUoQAEKUIACFKAABShAAQpQgAIUoAAFKEABClCAAhSgAAUoQAEKUIACFKAABdjf+wxu6NoJru/YX/cb8PJ0++t+A5bZX/kbcK39dRfw25n21/0psGWG/XW/ATfbX3cBO46zv+5PgRH7634Ddh9jf90FDNtfdwHf9ttfdwEX2F/3V4LL7a/7DfjW/soLONX+uj8FrrG/7jfgIfvrLmCV/XUXMGp/3QX8Yn/dBfzZZ3/dBcy2v+7vBufYX/UbsK/P/qoL2Gl/3Z8CX9pf9xuwxv66C3jE/ro/BW6wv+434DT7qy5g+zT7q/4UWGF/3W/AhfZXXcAPM+yv+lNgif1VvwG/n2R/1W/AE/ZX/Qb8eor9VRdwj/1Vfwp83rG/5jdg73n2V13AbfZX/Snw3DT7a34Deu0/242+vwfu0PrJnN+Hc+0vjZnPTuL+zLW/PPqXTfjzc6b9RXLVrgl9/zTcZ3+hnL5lAj8/Ocf+cpm+6OdD/Px8uGN/0Rw7svvgx7fniZPtL555w1sP8vszS06wvwr6Llj+nzP8fsVFM+yviPlXj6we3bH/7ye/XLP0hgX218nQXPsBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAN3nLw3s+6qhCaLsAAAAAElFTkSuQmCC',
            currentNodeX: 0,
            currentNodeY: 0,
            visibleRangeX: 0,
            visibleRangeY: 0,
            iconDictionary: [],
            tooltipData: {
                showing: false,
                xPosition: 0,
                yPosition: 0,
                skillName: '',
                skillLevel: '',
                borderColor: '',
                thumbnail: ''
            }
        };
    },
    components: {
        SkillPanel,
        ZoomControl,
        JoystickControl,
        TidyTreeTooltip
    },
    async mounted() {
        // Check if store is empty,
        // or if grade level filter has been changed on the other tree (they need to be the same).
        if (this.skillTreeStore.verticalTreeUserSkills.length == 0) {
            await this.skillTreeStore.getVerticalTreeUserSkills(
                this.userDetailsStore.gradeFilter,
                this.userDetailsStore.subjectFilters,
                this.userDetailsStore.isUnlockedSkillsOnlyFilter
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

        // Update sub-subject filter object with root subject in filterSubject
        this.userDetailsStore.subjectFilters.forEach((subject) => {
            const rightSkillName =
                this.$parent.transformToOriginalName(subject);
            const filterObject = {
                skillName: rightSkillName,
                parent: 0
            };
            this.userDetailsStore.updateSubSubjectFilter(filterObject);
        });

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

        var canvas = document.getElementById('canvas');
        this.context = canvas.getContext('2d', {
            willReadFrequently: true
        });

        // Skill panel - touch screen devices only
        // Listen for clicks on the main canvas
        canvas.addEventListener('click', async (e) => {
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
                //   this.skill.show_children = node.data.show_children;
                this.skill.hasChildren = false;
                if (
                    node.data.children.length > 0 ||
                    (this.skill.show_children && this.skill.show_children == 0)
                ) {
                    this.skill.hasChildren = true;
                }
                this.skill.x = node.x;
                this.skill.y = node.y;

                // only open on touch screen devices
                if (e.sourceCapabilities.firesTouchEvents == true) {
                    // Get the intro data separately.
                    // Because this is so much data, we do not send it with the rest of the skill tree,
                    // or it will slow the load down too much.
                    const result = await fetch(
                        '/skills/intro-sentence-and-url/' + this.skill.id
                    );
                    const result2 = await result.json();
                    if (this.skill.type == 'super') {
                        // Get urls of subskills, if a super skill
                        const subSkillsResult = await fetch(
                            '/skills/sub-skills/' + this.skill.id
                        );
                        const subSkillsResultJson =
                            await subSkillsResult.json();
                        this.skill.subskills = subSkillsResultJson;
                    }
                    this.skill.introduction = result2.intro_sentence;
                    this.skill.url = result2.url;
                    this.skill.image_thumbnail_url =
                        result2.image_thumbnail_url;
                    this.showSkillPanel = true;
                } else {
                    const result = await fetch(
                        '/skills/url-only/' + this.skill.id
                    );
                    const resultData = await result.json();
                    const routeData = this.$router.resolve({
                        path: '/skills/' + resultData.url
                    });
                    window.open(routeData.href, '_blank');
                }
            }
        });

        // Tool tip - laptop/desktop only
        // MOUSE MOVE EVENT LISTENER
        d3.select('#canvas').on('mousemove', (event) => {
            // Prevent this from showing on touch device
            if (event.sourceCapabilities.firesTouchEvents == false) {
                // Get mouse positions from the main canvas.
                const [mouseX, mouseY] = d3.pointer(event);

                const node = this.getMouseOverNode(mouseX, mouseY);

                if (node) {
                    let tooltipTopPosition = mouseY + 20;
                    let tooltipLeftPosition = mouseX;
                    const borderColor = this.hexBorderColor(node.data.level);
                    // Make sure position alway visible
                    if (tooltipTopPosition)
                        this.tooltipData = {
                            showing: true,
                            xPosition: `${tooltipTopPosition}`,
                            yPosition: `${tooltipLeftPosition}`,
                            skillName: node.data.skill_name,
                            skillLevel: node.data.level,
                            borderColor: borderColor,
                            thumbnail: node.data.thumbnail,
                            skillId: node.data.id
                        };
                } else {
                    this.tooltipData.showing = false;
                }
            }
        });

        // Open skill page
        canvas.addEventListener('dblclick', async (e) => {
            //Figure out where the mouse click occurred.
            var mouseX = e.layerX;
            var mouseY = e.layerY;

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
                this.skill.id = node.data.id;
            }

            const result = await fetch('/skills/url-only/' + this.skill.id);
            const resultData = await result.json();
            const routeData = this.$router.resolve({
                path: '/skills/' + resultData.url
            });
            window.open(routeData.href, '_blank');
        });

        // Zoom and pan with mouse
        // We have to construct the d3 zoom function and assign the zoom event
        this.d3Zoom = d3
            .zoom()
            .scaleExtent([0.05, 4])
            .on('zoom', ({ transform }) => {
                this.transformData = transform;
                this.drawTree(transform);
                // update slider percent ( Handle by us not d3 but will invoke when the d3 zoom event is call )
            });

        // Bind the above object to canvas so it can zoom the tree
        d3.select(this.context.canvas).call(this.d3Zoom);

        // Set initial zoom value.
        this.resetPos();

        this.getIconData();

        // For the loading animation.

        this.isLoading = false;
    },
    methods: {
        getAlgorithm() {
            // Create a tree layout.
            this.data = {
                skill_name: 'My skills',
                children: this.skill.children
            };

            this.root = d3.hierarchy(this.data);

            // Node height and width
            // Height
            const dx = 24;
            // Width
            const dy = 270;

            // THIS NEEDED TO BE REFACTOR LATER
            this.tree = d3.tree().nodeSize([this.nodeWidth, this.nodeHeight]);

            // Sort the tree and apply the layout.
            this.root.sort((a, b) => d3.ascending(a.x, b.x));
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
                // Do not render parts of tree not in the canvas
                // to improve performance.
                if (!this.checkIfLinkInViews(link, transform)) {
                    continue;
                }

                this.drawLink(link);
            }

            // Draw nodes.
            this.context.beginPath();

            // Calculate max visible range
            for (const node of this.nodes) {
                // Do not render parts of tree not in the canvas
                // to improve performance.
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
                //  should get its own color.
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

                this.drawNode(node);
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

            if (this.scale > 0.6) {
                this.drawRoundRectNode(ctx1, node);
            } else {
                this.drawNodeCircle(ctx1, node);
            }

            // Drawing Image
            if (this.scale >= 0.75 && this.iconDictionary) {
                this.drawImage(node, ctx1);
            }

            // Drawing Text.
            if (this.scale > 0.6) {
                this.drawNodeText(node, ctx1, isSearched);
            }

            // If user currently searching for the node we draw addition details
            if (isSearched) {
                this.drawPointingHand(node, ctx1);
            }

            // Hidden context.
            if (this.scale > 0.6) {
                this.drawNodeOnHiddenCanvas(ctx2, node);
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
                this.context.lineWidth = 5;
                this.context.strokeStyle = '#8d6ce7';
            } else {
                this.context.lineWidth = 4;
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
            this.createSVGTree();

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
            const isMobile = window.innerWidth <= 767; // Adjust breakpoint if needed
            const scale = isMobile ? 0.05 : 0.1; // Reduce scale for mobile view
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
                        .scale(scale)
                );
        },
        // programmatic d3 zoom
        zoomInD3(scale, panX, panY) {
            d3.select(this.context.canvas).call(
                this.d3Zoom.transform,
                d3.zoomIdentity.translate(panX, panY).scale(scale)
            );
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
        hexBackGroundColor(skillLevel) {
            const opacity = 0.7;
            switch (skillLevel) {
                case 'college':
                    return `rgba(204, 132, 0, ${opacity})`;
                case 'grade_school':
                    return `rgba(51, 1 79, 166, ${opacity})`;
                case 'high_school':
                    return `rgba(204, 172, 0, ${opacity})`;
                case 'middle_school':
                    return `rgba(0, 100, 0, ${opacity})`;
                case 'phd':
                    return `rgba(204, 0, 0, ${opacity})`;
                default:
                    break;
            }
        },
        // Find node with name include
        findNodeWithName(searchString) {
            // Because D3 has it own search node function so we will use it
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
            // Handle skill is inaccessible case
            if (data?.mess === 'inaccessible') {
                await this.drawInaccessibleNodes(data.inaccessiblePath);
                try {
                    const resultNode = this.findNodeWithName(searchString);
                    this.goToLocation(resultNode);
                } catch (error) {
                    // Skill get filter by user instead of being hidden
                    // Handle filtered case
                    this.removeFilterForHiddenSkill(searchString);
                }
            }

            // Handle skill get hidden case
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
        // If searched for skill gets filtered out by level or subject we remove it:
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
        // Redraw the tree with inaccessible skill path that user search (This is done in client and will not interact with database)
        async drawInaccessibleNodes(inaccessiblePath) {
            this.showSkillPanel = false;
            await this.skillTreeStore.getVerticalTreeUserSkills(
                this.userDetailsStore.gradeFilter,
                this.userDetailsStore.subjectFilters,
                this.userDetailsStore.isUnlockedSkillsOnlyFilter
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
            // Add inaccessible path to userSkill
            let updateOldSkill = false;
            const newUserSkills = userSkills.map((skill) => {
                if (skill.skill_name === inaccessiblePath.skill_name) {
                    updateOldSkill = true;
                    return inaccessiblePath;
                } else return skill;
            });

            if (!updateOldSkill) newUserSkills.push(inaccessiblePath);

            this.skill = {
                name: 'SKILLS',
                sprite: null,
                children: newUserSkills
            };

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
        async reloadTree(node) {
            this.showSkillPanel = false;
            await this.skillTreeStore.getVerticalTreeUserSkills(
                this.userDetailsStore.gradeFilter,
                this.userDetailsStore.subjectFilters,
                this.userDetailsStore.isUnlockedSkillsOnlyFilter
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

            if (!this.skillTreeStore.studentSkills.length) {
                this.skillTreeStore.getStudentSkills();
            }

            // ADDITIONAL FILTER FOR SUB-SKILL
            if (this.userDetailsStore.subSubjectsFilters.length > 0) {
                const newUserSkill =
                    this.skillTreeStore.buildUserSkillTreeBaseOnFilterObject(
                        this.userDetailsStore.subSubjectsFilters,
                        this.skillTreeStore.studentSkills
                    );
                if (newUserSkill.length) {
                    this.data = {
                        skill_name: 'My skills',
                        children: newUserSkill
                    };
                }
            }

            // Compute the tree height; this approach will allow the height of the
            // SVG to scale according to the breadth (width) of the tree layout.
            this.root = d3.hierarchy(this.data);

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
        // Grade level, root subject, unlocked skills filters
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
                    is_language_filter:
                        this.userDetailsStore.subjectFilters.includes(
                            'Language'
                        ),
                    is_math_filter:
                        this.userDetailsStore.subjectFilters.includes(
                            'Mathematics'
                        ),
                    is_history_filter:
                        this.userDetailsStore.subjectFilters.includes(
                            'History'
                        ),
                    is_life_filter:
                        this.userDetailsStore.subjectFilters.includes('Life'),
                    is_computer_science_filter:
                        this.userDetailsStore.subjectFilters.includes(
                            'Computer Science'
                        ),
                    is_science_and_invention_filter:
                        this.userDetailsStore.subjectFilters.includes(
                            'Science and Invention'
                        ),
                    is_dangerous_ideas_filter:
                        this.userDetailsStore.subjectFilters.includes(
                            'Dangerous Ideas'
                        ),
                    is_unlocked_skills_only_filter:
                        this.userDetailsStore.isUnlockedSkillsOnlyFilter
                })
            };
            var url =
                '/users/' +
                this.userDetailsStore.userId +
                '/skill-tree-filters';
            fetch(url, requestOptions);
        },
        checkingIfNodeInView(node, transformData) {
            const point = {
                x: node.x,
                y: node.y
            };
            return this.checkIfPointInViews(point, transformData);
        },
        checkIfLinkInViews(link, transformData) {
            const targetNode = link.target;
            const sourceNode = link.source;
            const targetNodeCounterPoint = {
                x: targetNode.x,
                y: sourceNode.y
            };

            const sourceNodeCounterPoint = {
                x: sourceNode.x,
                y: targetNode.y
            };

            // The idea is we will draw a rectangle with target node and source node surely this rectangle will contains the links
            // => mean target and source point is two point on a rectangle with it diagonal line is source node and target node
            // => That mean ours job is to find other two point on the other diagonal line to form a rectangle
            // Then we can check if the rectangle is in view zone to see if the link is in view zone
            // ( can also improve in the future to find even a smaller limit area that contain the links )
            const rectangle = this.createRectangle(
                targetNode,
                sourceNode,
                targetNodeCounterPoint,
                sourceNodeCounterPoint
            );

            const isLinkInView = this.checkIfRectangleInView(
                rectangle,
                transformData
            );

            return isLinkInView;
        },
        checkIfPointInViews(point, transformData) {
            if (!point) {
                return false;
            }
            // Calculate max visible range
            // Visible range is the rectangle with width and height equal to canvas context
            // Every time context is translate the visible range is changing too

            const visibleRangeY = transformData.y - this.height;
            // Calculate real position of node with current scale
            let realPositionX = point.y * transformData.k;
            let realPositionY = -point.x * transformData.k;

            // I actually come up with this formula base on observe the changing of translate and node position when translate context
            // It doesn`t make sense to me but some how working correctly
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
        checkIfLineIsInView(point1, point2, transformData) {
            if (!point1 || !point2) {
                return false;
            }
            // Calculate max visible range
            // Visible range is the rectangle with width and height equal to canvas context
            // Every time context is translate the visible range is changing too

            const visibleRangeY = transformData.y - this.height;
            // Calculate real position of node with current scale
            let realPosition1X = point1.y * transformData.k;
            let realPosition1Y = -point1.x * transformData.k;

            let realPosition2X = point2.y * transformData.k;
            let realPosition2Y = -point2.x * transformData.k;

            // I actually come up with this formula base on observe the changing of translate and node position when translate context
            // It doesn`t make sense to me but some how working correctly
            let combinePosition1 = transformData.x + realPosition1X;
            let combinePosition2 = transformData.x + realPosition2X;

            if (combinePosition1 < 0 && combinePosition2 > this.width) {
                return true;
            }
            if (
                realPosition1Y > transformData.y &&
                realPosition2Y < visibleRangeY
            ) {
                return true;
            }

            return false;
        },
        createRectangle(point1, point2, point3, point4) {
            const rectangleConner = {
                topLeft: null,
                topRight: null,
                bottomLeft: null,
                bottomRight: null
            };

            const points = [point1, point2, point3, point4];

            const bottomRightPoint = {
                x: point1.x,
                y: point1.y
            };

            points.forEach((point) => {
                if (point.x > bottomRightPoint.x) {
                    bottomRightPoint.x = point.x;
                }
                if (point.y > bottomRightPoint.y) {
                    bottomRightPoint.y = point.y;
                }
            });

            points.forEach((point) => {
                if (
                    point.x === bottomRightPoint.x &&
                    point.y === bottomRightPoint.y
                ) {
                    rectangleConner.bottomRight = point;
                }
                if (
                    point.x === bottomRightPoint.x &&
                    point.y < bottomRightPoint.y
                ) {
                    rectangleConner.topRight = point;
                }
                if (
                    point.x < bottomRightPoint.x &&
                    point.y === bottomRightPoint.y
                ) {
                    rectangleConner.bottomLeft = point;
                }
                if (
                    point.x < bottomRightPoint.x &&
                    point.y < bottomRightPoint.y
                ) {
                    rectangleConner.topLeft = point;
                }
            });
            return rectangleConner;
        },
        checkIfRectangleInView(rectangle, transformData) {
            try {
                // normal case where all four point is inView
                const point1InView = this.checkIfPointInViews(
                    rectangle.topLeft,
                    transformData
                );
                if (point1InView) {
                    return true;
                }

                const point2InView = this.checkIfPointInViews(
                    rectangle.topRight,
                    transformData
                );
                if (point2InView) {
                    return true;
                }

                const point3InView = this.checkIfPointInViews(
                    rectangle.bottomLeft,
                    transformData
                );
                if (point3InView) {
                    return true;
                }

                const point4InView = this.checkIfPointInViews(
                    rectangle.bottomRight,
                    transformData
                );
                if (point4InView) {
                    return true;
                }

                // Special case when fourPoint is out of view but the rectangle still in view
                // By check for the rectangle width and height to see if their are bigger than the viewBox
                if (
                    this.checkIfLineIsInView(
                        rectangle.topLeft,
                        rectangle.topRight,
                        transformData
                    )
                ) {
                    return true;
                }

                if (
                    this.checkIfLineIsInView(
                        rectangle.topLeft,
                        rectangle.bottomLeft,
                        transformData
                    )
                ) {
                    return true;
                }

                if (
                    this.checkIfLineIsInView(
                        rectangle.bottomLeft,
                        rectangle.bottomRight,
                        transformData
                    )
                ) {
                    return true;
                }

                if (
                    this.checkIfLineIsInView(
                        rectangle.topRight,
                        rectangle.bottomRight,
                        transformData
                    )
                ) {
                    return true;
                }

                return false;
            } catch (error) {
                console.error(error);
                return false;
            }
        },
        async getIconData() {
            const res = await fetch('/skills/icon-list');
            const resData = await res.json();
            // Prepare the icon path array into a hashmap/dictionary for even better performant
            this.iconDictionary = Object.fromEntries(
                resData.map((icon) => [icon.url, icon.icon])
            );
        },
        drawNodeCircle(ctx, node) {
            const ctx1 = ctx;

            // Node size
            let radius;
            if (node.data.type == 'sub') {
                radius = 7.5;
            } else if (node.data.type == 'domain') {
                radius = 12; // Make domain nodes slightly larger
            } else {
                radius = 10;
            }

            ctx1.beginPath();
            ctx1.arc(node.y, node.x, radius, 0, 2 * Math.PI);

            // Get the color associate with skill level
            const skillColor = node.data.level
                ? this.hexColor(node.data.level)
                : '#000';

            // Special styling for domain nodes
            if (node.data.type == 'domain') {
                // Use a semi-translucent fill for domain nodes
                ctx1.fillStyle = 'rgba(220, 220, 220, 0.6)';
                ctx1.fill();
                ctx1.lineWidth = 1.5;
                ctx1.strokeStyle = '#a0a0a0'; // Lighter border color
                ctx1.stroke();
                return;
            }

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
        },
        drawNodeOnHiddenCanvas(ctx, node) {
            const ctx2 = ctx;

            ctx2.beginPath();
            ctx2.moveTo(node.y, node.x);
            //ctx2.arc(node.y, node.x, 20, 0, 2 * Math.PI);
            let xPosition = node.y;
            if (node.data.children.length > 0) {
                xPosition = xPosition - 180;
            }
            ctx2.roundRect(xPosition, node.x - 20, 180, 40, 20);
            ctx2.fill();
        },
        // Draw round rectangle node
        drawRoundRectNode(ctx, node) {
            const ctx1 = ctx;

            // Node size
            let radius;
            if (node.data.type == 'sub') {
                radius = 7.5;
            } else if (node.data.type == 'domain') {
                radius = 12; // Make domain nodes slightly larger
            } else {
                radius = 10;
            }

            ctx1.beginPath();
            let xPosition = node.y;
            if (node.data.children.length > 0) {
                xPosition = xPosition - 180;
            }
            ctx1.roundRect(xPosition, node.x - 20, 180, 40, 20);

            // Get the color associate with skill level
            const skillColor = node.data.level
                ? this.hexColor(node.data.level)
                : '#000';

            // Special styling for domain nodes - semi-translucent with a different visual style
            if (node.data.type == 'domain') {
                ctx1.fillStyle = 'rgba(230, 230, 230, 0.7)'; // Light semi-translucent fill
                ctx1.fill();
                ctx1.lineWidth = 1.5;
                ctx1.strokeStyle = '#b0b0b0'; // Lighter border
                ctx1.setLineDash([3, 2]); // Dotted line to visually indicate "container"
                ctx1.stroke();
                return;
            }

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
                if (node.data.type == 'domain') {
                    ctx1.fillStyle = '#eee';
                } else {
                    ctx1.fillStyle = '#fff';
                }
                ctx1.fill();
                ctx1.strokeStyle = skillColor;
                ctx1.stroke();
            }
        },

        // Draw a round rectangle and using clip to make image rounded
        roundedImage(ctx, x, y, width, height, radius) {
            ctx.beginPath();

            ctx.roundRect(x, y, width, height, radius);

            ctx.closePath();
        },
        // draw skill name based on it lenght
        drawSkillName(node, ctx, isSearched) {
            if (node.data.skill_name.length < 19) {
                this.drawShortSkillName(node, ctx, isSearched);
            } else if (
                node.data.skill_name.length >= 19 &&
                node.data.skill_name.length < 33
            ) {
                this.drawMediumSkillName(node, ctx, isSearched);
            } else {
                this.drawLargeSkillName(node, ctx, isSearched);
            }
        },
        drawShortSkillName(node, ctx, isSearched) {
            const ctx1 = ctx;
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
                ctx1.font = '11px Verdana';
                if (node.data.type == 'sub') {
                    ctx1.font = '11px Verdana';
                }

                // High light the text if user search for it
                ctx1.fillStyle = isSearched ? '#ff0000' : '#000';
                ctx1.font = isSearched ? 'bold' : 'normal';
                ctx1.direction = 'ltr';

                //  also added a triangle to the end of skill name

                let xPosition = node.y + 45;
                if (node.data.children.length > 0) {
                    xPosition = xPosition - 180;
                }
                ctx1.strokeText(node.data.skill_name, xPosition, node.x + 4);
                ctx1.fillText(node.data.skill_name, xPosition, node.x + 4);
            } else {
                ctx1.beginPath();
                ctx1.strokeStyle = '#FFF';
                ctx1.lineWidth = 4;
                ctx1.fillStyle = isSearched ? '#ff0000' : '#849cab';
                ctx1.direction = 'rtl';

                let xPosition = node.y + 5;

                ctx1.strokeText(node.data.skill_name, xPosition, node.x + 2);
                ctx1.fillText(node.data.skill_name, xPosition, node.x + 2);
            }
        },
        drawMediumSkillName(node, ctx, isSearched) {
            // Number use to fit text into node
            const textDrawData = {
                // Maximum lenght for text to be consider a short name
                shortTextMaxLenght: 19,

                firstLineYposition: node.x - 5,
                secondLineYposition: node.x + 12
            };
            const ctx1 = ctx;
            const splitIndex = node.data.skill_name.lastIndexOf(
                ' ',
                textDrawData.shortTextMaxLenght
            );
            const string1 = node.data.skill_name.substring(0, splitIndex);
            const string2 = node.data.skill_name.substring(splitIndex + 1);

            ctx1.beginPath();
            // Background stroke
            ctx1.strokeStyle = '#FFF';
            ctx1.lineWidth = 4;
            // Font size
            ctx1.font = '11px Verdana';
            if (node.data.type == 'sub') {
                ctx1.font = '11px Verdana';
            }

            // High light the text if user search for it
            ctx1.fillStyle = isSearched ? '#ff0000' : '#000';
            ctx1.font = isSearched ? 'bold' : 'normal';
            ctx1.direction = 'ltr';

            //  also added a triangle to the end of skill name

            let xPosition = node.y + 45;
            if (node.data.children.length > 0) {
                xPosition = xPosition - 180;
            }

            ctx1.strokeText(
                string1,
                xPosition,
                textDrawData.firstLineYposition
            );
            ctx1.fillText(string1, xPosition, textDrawData.firstLineYposition);

            //

            ctx1.strokeText(
                string2,
                xPosition,
                textDrawData.secondLineYposition
            );
            ctx1.fillText(string2, xPosition, textDrawData.secondLineYposition);
        },
        drawLargeSkillName(node, ctx, isSearched) {
            // Number use to fit text into node
            const textDrawData = {
                // Maximum lenght for text to be consider a short name
                mediumTextMaxLenght: 19,

                firstLineYposition: node.x - 5,
                secondLineYposition: node.x + 12,
                lengthRatio: node.data.skill_name.length / 19
            };

            const ctx1 = ctx;
            const splitIndex = node.data.skill_name.lastIndexOf(
                ' ',
                Math.floor(node.data.skill_name.length / 1.5)
            );
            const string1 = node.data.skill_name.substring(0, splitIndex);
            const string2 = node.data.skill_name.substring(splitIndex + 1);

            ctx1.beginPath();
            // Background stroke
            ctx1.strokeStyle = '#FFF';
            ctx1.lineWidth = 4;
            // Font size
            const largeSkillFontSize =
                Math.floor(11 / textDrawData.lengthRatio) + 4;

            ctx1.font = `${largeSkillFontSize}px Verdana`;
            if (node.data.type == 'sub') {
                ctx1.font = `${largeSkillFontSize}px Verdana`;
            }

            // High light the text if user search for it
            ctx1.fillStyle = isSearched ? '#ff0000' : '#000';
            ctx1.font = isSearched ? 'bold' : 'normal';
            ctx1.direction = 'ltr';

            //  also added a triangle to the end of skill name

            let xPosition = node.y + 45;
            if (node.data.children.length > 0) {
                xPosition = xPosition - 180;
            }

            // draw the first line of text
            ctx1.strokeText(
                string1,
                xPosition,
                textDrawData.firstLineYposition
            );
            ctx1.fillText(string1, xPosition, textDrawData.firstLineYposition);

            // draw second line of text

            ctx1.strokeText(
                string2,
                xPosition,
                textDrawData.secondLineYposition
            );
            ctx1.fillText(string2, xPosition, textDrawData.secondLineYposition);
        },
        drawPointingHand(node, ctx) {
            const img = new Image();
            img.src = this.handIcon;
            if (this.scale > 0.6) {
                if (node.children) {
                    ctx.drawImage(img, node.y + 6, node.x - 10, 20, 20);
                } else {
                    ctx.drawImage(img, node.y + 185, node.x - 10, 20, 20);
                }
            } else {
                ctx.drawImage(img, node.y + 13, node.x - 10, 20, 20);
            }
        },
        drawImage(node, ctx1) {
            // find path in skill icon dictionary
            let path = this.iconDictionary[node.data.url];

            if (!path) {
                path = this.defaultIconImage;
                const img = new Image();

                img.src = path;

                let xPosition = node.y + 2;
                if (node.data.children.length > 0) {
                    xPosition = xPosition - 178;
                }
                ctx1.save();
                this.roundedImage(ctx1, xPosition, node.x - 18, 36, 36, 20);
                ctx1.clip();
                ctx1.drawImage(img, xPosition + 7, node.x - 10, 20, 20);
                ctx1.restore();
            }
            // Draw a default error image if skill do not have icon
            else {
                const img = new Image();

                img.src = path;

                let xPosition = node.y + 2;
                if (node.data.children.length > 0) {
                    xPosition = xPosition - 178;
                }
                ctx1.save();
                this.roundedImage(ctx1, xPosition, node.x - 18, 36, 36, 20);
                ctx1.clip();
                ctx1.drawImage(img, xPosition - 3, node.x - 18, 38, 38);
                ctx1.restore();
            }
        },
        drawNodeText(node, ctx1, isSearched) {
            // to avoid sharp artifacts with the stroke of the text.
            ctx1.lineJoin = 'bevel';
            // we move the skill name to the left and change the color if it a domain node
            // using the non domain as if condition will save us some compute time as none domain node is more common
            if (node.data.type != 'domain') {
                this.drawSkillName(node, ctx1, isSearched);
            } else {
                ctx1.beginPath();
                ctx1.strokeStyle = '#FFF';
                ctx1.lineWidth = 4;
                // Updated domain text color to be lighter gray (previously #849cab)
                ctx1.fillStyle = isSearched ? '#ff0000' : '#aabbc5';
                ctx1.direction = 'ltr';

                let xPosition = node.y - 140;

                ctx1.strokeText(node.data.skill_name, xPosition, node.x + 2);
                ctx1.fillText(node.data.skill_name, xPosition, node.x + 2);
            }
        },
        // check if current mouse position is over any node (return false if not on node)
        getMouseOverNode(mouseX, mouseY) {
            // Get the corresponding pixel color on the hidden canvas
            // and look up the node in our map.
            const ctx = this.hiddenCanvasContext;

            // This will return that pixel's color
            const col = ctx.getImageData(mouseX, mouseY, 1, 1).data;

            //Our map uses these rgb strings as keys to nodes.
            const colString =
                'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
            const node = this.colToNode[colString];
            return node;
        },
        imageUrlAlternative(event) {
            event.target.src = '';
        }
    }
};
</script>

<template>
    <!-- Loading animation -->
    <div
        v-if="isLoading == true"
        class="d-flex align-items-center justify-content-center loading-animation py-4"
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
        <ZoomControl ref="ZoomControl" />
        <div id="sidepanel-backdrop"></div>
        <JoystickControl class="d-none" />
        <TidyTreeTooltip :tooltipData="tooltipData" />
    </div>
</template>

<style scoped>
/* Loading animation */
.loading-animation {
    min-height: 100%;
    position: fixed;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
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
</style>
