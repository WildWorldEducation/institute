import{_ as F,u as X,a as H,r as S,o as v,c as g,b as w,w as M,v as B,d as a,e as T,n as z,F as D,p as G,f as j,g as Y,h as q,S as E,i as x,j as I,k as R,l as J}from"./main-44ae81b4.js";import{S as L,z as W,s as p,h as C,t as b,a as P,i as k,l as N,c as U}from"./zoom-ee8f2b73.js";import{S as V,J as O}from"./JoystickControl-14c19d63.js";const Z={setup(){const e=X(),t=H();return{skillTreeStore:e,userDetailsStore:t}},data(){return{width:null,height:null,skill:{id:null,children:[],isMastered:null,isUnlocked:null,container:null,name:null,url:null,description:null,tagIDs:[],sprite:null,type:null,hasChildren:!1},tree:{},root:{},context:{},hiddenCanvasContext:{},r:1.5,nodes:[],nextCol:1,colToNode:{},isSkillInfoPanelShown:!1,scale:.3,panX:0,panY:0,data:{},d3Zoom:null,isLoading:!0,xPos:0,yPos:0,showAnimation:!1,showSkillPanel:!1,resultNode:null,clickMode:"showPanel",truncateLevel:"phd"}},components:{SkillPanel:L,SliderControl:V,JoystickControl:O,SkillPanel:L},async mounted(){this.truncateLevel=this.userDetailsStore.skillTreeLevel,this.skillTreeStore.verticalTreeUserSkills.length==0&&await this.skillTreeStore.getVerticalTreeUserSkills(this.truncateLevel);let e="";this.truncateLevel=="grade_school"?e=this.skillTreeStore.gradeSchoolVerticalTreeUserSkills:this.truncateLevel=="middle_school"?e=this.skillTreeStore.middleSchoolVerticalTreeUserSkills:this.truncateLevel=="high_school"?e=this.skillTreeStore.highSchoolVerticalTreeUserSkills:this.truncateLevel=="college"?e=this.skillTreeStore.collegeVerticalTreeUserSkills:e=this.skillTreeStore.verticalTreeUserSkills,this.height=window.innerHeight,this.width=window.innerWidth,this.skill={name:"SKILLS",sprite:null,children:e},this.getAlgorithm();let t=document.getElementById("hidden-canvas");this.hiddenCanvasContext=t.getContext("2d",{willReadFrequently:!0}),t.style.display="none",canvas.addEventListener("click",async i=>{var c=i.layerX,n=i.layerY;this.xPos=c,this.yPos=n,this.showAnimation=!0,setTimeout(()=>{this.showAnimation=!1},500);var r=this.hiddenCanvasContext,d=r.getImageData(c,n,1,1).data,h="rgb("+d[0]+","+d[1]+","+d[2]+")",o=this.colToNode[h];if(o&&o.data.id){o.renderCol=o.__pickColor,this.skill.name=o.data.skill_name,this.skill.id=o.data.id,this.skill.type=o.data.type,this.skill.show_children=o.data.show_children,this.skill.hasChildren=!1,(o.data.children.length>0||this.skill.show_children&&this.skill.show_children==0)&&(this.skill.hasChildren=!0),this.skill.x=o.x,this.skill.y=o.y;const s=await(await fetch("/skills/mastery-requirements-and-url/"+this.skill.id)).json();this.skill.masteryRequirements=s.mastery_requirements,this.skill.url=s.url,this.showSkillPanel=!0}}),this.d3Zoom=W().scaleExtent([.1,5]).on("zoom",({transform:i})=>{this.debugScale=i.k,this.transformX=i.x,this.transformY=i.y,this.drawTree(i),this.$refs.sliderControl.changeGradientBG()}),p(this.context.canvas).call(this.d3Zoom),this.resetPos(),this.isLoading=!1},methods:{getAlgorithm(){var e=[];e=JSON.parse(JSON.stringify(this.skill.children));let t=0;function i(s){for(var u=s.length;u--;){if(t++,s[u].type=="super"&&s[u].position!="end"){if(s[u].show_children&&s[u].show_children==0)return;var m=[],f=[];for(let _=0;_<s[u].children.length;_++)s[u].children[_].type=="sub"?m.push(s[u].children[_]):f.push(s[u].children[_]);var y={skill_name:s[u].skill_name,type:"super",position:"end",children:m};s[u].children=[],s[u].children.push(y);for(let _=0;_<f.length;_++)s[u].children.push(f[_])}typeof s[u]<"u"&&s[u].children&&Array.isArray(s[u].children)&&s[u].children.length>0&&i(s[u].children)}}i(e);const c=24;this.data={skill_name:"My skills",children:e},this.root=C(this.data);let n=5;this.truncateLevel=="grade_school"||t<1e3?n=1:this.truncateLevel=="middle_school"?n=2:this.truncateLevel=="high_school"?n=3:(this.truncateLevel=="college"||t<2e3)&&(n=4);const r=this.width/(this.root.height+1)*n;console.log(n),this.tree=b().nodeSize([c,r]),this.root.sort((s,u)=>P(s.data.name,u.data.name)),this.tree(this.root);let d=1/0,h=-d;this.root.each(s=>{s.x>h&&(h=s.x),s.x<d&&(d=s.x)});var o=document.getElementById("canvas");o.width=this.width,o.height=this.height,this.context=o.getContext("2d");let l=document.getElementById("hidden-canvas");this.hiddenCanvasContext=l.getContext("2d"),this.drawTree(k)},drawTree(e){this.nodes=this.root.descendants(),this.context.save(),this.hiddenCanvasContext.save(),this.context.clearRect(0,0,this.context.canvas.width,this.context.canvas.height),this.hiddenCanvasContext.clearRect(0,0,this.hiddenCanvasContext.canvas.width,this.hiddenCanvasContext.canvas.height),this.context.translate(e.x,e.y),this.hiddenCanvasContext.translate(e.x,e.y),this.context.scale(e.k,e.k),this.hiddenCanvasContext.scale(e.k,e.k),this.scale=e.k,this.panX=e.x,this.panY=e.y;const t=this.root.links();this.context.beginPath();for(const i of t)this.drawLink(i);this.context.beginPath();for(const i of this.nodes)i.renderCol?this.context.fillStyle=i.renderCol:this.context.fillStyle="RGBA(105, 105, 105, 0.8)",i.__pickColor===void 0&&(i.__pickColor=this.genColor(),this.colToNode[i.__pickColor]=i),this.hiddenCanvasContext.fillStyle=i.__pickColor,this.drawNode(i);this.context.restore(),this.hiddenCanvasContext.restore()},drawNode(e){var n;this.context.setLineDash([]);let t=this.context,i=this.hiddenCanvasContext;const c=e.data.skill_name===((n=this.resultNode)==null?void 0:n.data.skill_name);if(e.data.type!="domain"){let r=10;e.data.show_children&&e.data.show_children==0&&(r=20),t.beginPath(),t.arc(e.y,e.x,r,0,2*Math.PI);const d=e.data.level?this.hexColor(e.data.level):"#000";if(e.data.is_mastered==1){t.fillStyle=d,t.fill();const h=this.hexBorderColor(e.data.level);t.lineWidth=2,t.strokeStyle=h,t.stroke()}else t.lineWidth=2,t.fillStyle="#FFF",t.fill(),t.strokeStyle=d,t.stroke()}if(e.data.show_children&&e.data.show_children==0&&(t.lineWidth=2,t.strokeStyle="black",t.beginPath(),t.moveTo(e.y-10,e.x),t.lineTo(e.y+10,e.x),t.stroke(),t.beginPath(),t.moveTo(e.y,e.x-10),t.lineTo(e.y,e.x+10),t.stroke()),this.scale>.6)if(e.data.type!="domain"){t.beginPath(),t.strokeStyle="#FFF",t.lineWidth=4,t.fillStyle=c?"#ff0000":"#000",t.font=c?"bold":"normal",t.direction="ltr";const r=c?`${e.data.skill_name} ◀`:e.data.skill_name;t.strokeText(r,e.y+15,e.x+2),t.fillText(r,e.y+15,e.x+2)}else{t.beginPath(),t.strokeStyle="#FFF",t.lineWidth=4,t.fillStyle=c?"#ff0000":"#849cab",t.direction="rtl";const r=c?`${e.data.skill_name} ▶`:e.data.skill_name;t.strokeText(r,e.y-5,e.x+2),t.fillText(r,e.y-5,e.x+2)}e.data.type!="domain"?(i.beginPath(),i.moveTo(e.y,e.x),i.arc(e.y,e.x,10,0,2*Math.PI),i.fill()):(i.beginPath(),i.moveTo(e.y,e.x-10),i.lineTo(e.y-20/2,e.x-10+20/2),i.lineTo(e.y,e.x-10+20),i.lineTo(e.y+20/2,e.x-10+20/2),i.closePath(),i.lineWidth=2,i.fill(),i.stroke())},drawLink(e){const t=N().x(i=>i.y).y(i=>i.x).context(this.context);e.target.data.is_mastered==1?this.context.lineWidth=4:this.context.lineWidth=1,e.source.data.type=="super"&&e.target.data.position=="end"||e.target.data.type=="sub"?this.context.setLineDash([5,3]):this.context.setLineDash([]),this.context.beginPath(),t(e),this.context.strokeStyle="#000",this.context.stroke()},genColor(){var e=[];this.nextCol<16777215&&(e.push(this.nextCol&255),e.push((this.nextCol&65280)>>8),e.push((this.nextCol&16711680)>>16),this.nextCol+=100);var t="rgb("+e.join(",")+")";return t},async printPDF(){await this.createSVGTree();var e=document.getElementById("linearTree"),t=p(e),i=t.node(),c=new XMLSerializer,n=c.serializeToString(i),r={svg:n,treeType:"linear"},d=JSON.stringify(r),h=new XMLHttpRequest;h.responseType="arraybuffer",h.open("POST","/skilltree/print-pdf",!0),h.setRequestHeader("Content-type","application/json;charset=UTF-8"),h.setRequestHeader("Accept","application/json, text/plain, */*"),h.send(d),h.onload=function(){if(this.readyState==4&&this.status==200){let l=new Blob([h.response],{type:"application/pdf"});const s=window.URL.createObjectURL(l);var o=document.createElement("a");document.body.appendChild(o),o.style="display: none",o.href=s,o.download="My-Skill-Tree.pdf",o.click(),window.URL.revokeObjectURL(s)}}},createSVGTree(){const e=C(this.data),t=15,i=this.width/(e.height+1);b().nodeSize([t,i])(e);let n=1/0,r=-n;e.each(s=>{s.x>r&&(r=s.x),s.x<n&&(n=s.x)});const d=r-n+t*2;let h=U("svg").attr("id","linearTree").attr("width",this.width).attr("height",d).attr("viewBox",[-i/3,n-t,this.width,d]).attr("style","max-width: 100%; height: auto; font: 10px sans-serif;");const o=h.append("g");o.append("g").attr("fill","none").attr("stroke-opacity",1).selectAll().data(e.links()).join("path").attr("d",N().x(s=>s.y).y(s=>s.x)).attr("stroke",function(s){return"#000"}).attr("stroke-width",function(s){return s.target.data.is_mastered==1?8:1.5}).style("stroke-dasharray",function(s){if(s.source.data.type=="super"&&s.target.data.position=="end"||s.target.data.type=="sub")return 5});const l=o.append("g").attr("stroke-linejoin","round").attr("stroke-width",3).selectAll().data(e.descendants()).join("g").attr("transform",s=>`translate(${s.y},${s.x})`);l.append("circle").attr("fill",s=>s.children?"#555":"#000").attr("r",2.5),l.append("text").style("font-weight",function(s){return s.data.type=="super"?"700":"400"}).style("font-style",function(s){if(s.data.type=="sub")return"italic"}).attr("dy","0.31em").attr("x",s=>s.children?-6:6).attr("text-anchor",s=>s.children?"end":"start").text(function(s){return s.data.position=="end"?"":s.data.skill_name}).clone(!0).lower().attr("stroke",function(s){return"white"}),document.querySelector("#SVGskilltree").append(h.node())},resetPos(){p(this.context.canvas).transition().duration(1700).call(this.d3Zoom.transform,k.translate(0,0).scale(.3)),this.$refs.sliderControl.showScaleLabel()},zoomInD3(e,t,i){p(this.context.canvas).call(this.d3Zoom.transform,k.translate(t,i).scale(e)),this.$refs.sliderControl.showScaleLabel()},goToLocation(e){const t=this.$refs.wrapper.clientHeight,i=this.$refs.wrapper.clientWidth,c=i>480?1.75:1.2,n=i>480?2.5:2.8,r=2;this.resultNode=e;const d=-e.y*c+i/r,h=-e.x*c+t/n;p(this.context.canvas).transition().duration(2e3).call(this.d3Zoom.transform,k.translate(d,h).scale(c))},panInD3(){p(this.context.canvas).call(this.d3Zoom.transform,k.translate(this.panX,this.panY).scale(this.scale))},hexColor(e){switch(e){case"college":return"#FFA500";case"grade_school":return"#40E0D0";case"high_school":return"#FFD700";case"middle_school":return"#33A133";case"phd":return"#FF0000"}},hexBorderColor(e){switch(e){case"college":return"#CC8400";case"grade_school":return"#33B3A6";case"high_school":return"#CCAC00";case"middle_school":return"#006400";case"phd":return"#CC0000"}},findNodeWithName(e){let t=!1,i=null;return this.root.each(function(c){t||c.data.skill_name===e&&(i=c,t=!0)}),i},toggleHideChildren(e){var t="/user-skills/hide-children/"+this.userDetailsStore.userId+"/"+e.id;fetch(t).then(()=>{this.reloadTree(e)})},toggleShowChildren(e){var t="/user-skills/show-children/"+this.userDetailsStore.userId+"/"+e.id;fetch(t).then(()=>{this.reloadTree(e)})},async reloadTree(e){this.showSkillPanel=!1,await this.skillTreeStore.getVerticalTreeUserSkills();let t=[];this.truncateLevel=="grade_school"?t=this.skillTreeStore.gradeSchoolVerticalTreeUserSkills:this.truncateLevel=="middle_school"?t=this.skillTreeStore.middleSchoolVerticalTreeUserSkills:this.truncateLevel=="high_school"?t=this.skillTreeStore.highSchoolVerticalTreeUserSkills:this.truncateLevel=="college"?t=this.skillTreeStore.collegeVerticalTreeUserSkills:t=this.skillTreeStore.verticalTreeUserSkills,this.skill={name:"SKILLS",sprite:null,children:t};var i=[];i=JSON.parse(JSON.stringify(this.skill.children));function c(l){for(var s=l.length;s--;){if(l[s].type=="super"&&l[s].position!="end"){if(l[s].show_children&&l[s].show_children==0)return;var u=[],m=[];for(let y=0;y<l[s].children.length;y++)l[s].children[y].type=="sub"?u.push(l[s].children[y]):m.push(l[s].children[y]);var f={skill_name:l[s].skill_name,type:"super",position:"end",children:u};l[s].children=[],l[s].children.push(f);for(let y=0;y<m.length;y++)l[s].children.push(m[y])}typeof l[s]<"u"&&l[s].children&&Array.isArray(l[s].children)&&l[s].children.length>0&&c(l[s].children)}}c(i),this.data={skill_name:"My skills",children:i},this.root=C(this.data);const n=24;let r=5;this.truncateLevel=="grade_school"?r=1:this.truncateLevel=="middle_school"?r=2:this.truncateLevel=="high_school"?r=3:this.truncateLevel=="college"&&(r=4);const d=this.width/(this.root.height+1)*r;this.tree=b().nodeSize([n,d]),this.root.sort((l,s)=>P(l.data.name,s.data.name)),this.tree(this.root),this.zoomInD3(this.scale,this.panX,this.panY);let h=0,o=0;typeof e<"u"&&(h=-e.y*this.scale+window.innerWidth/(2*this.scale)*this.scale,o=-e.x*this.scale+window.innerHeight/(2*this.scale)*this.scale),p(this.context.canvas).transition().duration(1e3).call(this.d3Zoom.transform,k.translate(h,o).scale(this.scale))},expandAllChildren(){var e="/user-skills/expand-all-children/"+this.userDetailsStore.userId;fetch(e).then(()=>{this.reloadTree()})},async truncateToGradeLevel(e){this.truncateLevel=e,await this.skillTreeStore.getVerticalTreeUserSkills(e),await this.reloadTree(),this.saveSkillTreeGradeLevel()},saveSkillTreeGradeLevel(){const e={method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({level:this.truncateLevel})};var t="/users/"+this.userDetailsStore.userId+"/skill-tree-level";fetch(t,e).then}}},$=e=>(G("data-v-b6645fa7"),e=e(),j(),e),K={key:0,class:"loading-animation d-flex justify-content-center align-items-center py-4"},Q=$(()=>a("span",{class:"loader"},null,-1)),ee=[Q],te={ref:"wrapper",id:"wrapper"},se={id:"canvas",width:"1500",height:"1500",ref:"canvas",tabindex:"1"},ie=$(()=>a("canvas",{id:"hidden-canvas",width:"1500",height:"1500"},null,-1)),le=$(()=>a("div",{id:"SVGskilltree"},null,-1)),oe=$(()=>a("div",{id:"sidepanel-backdrop"},null,-1));function ne(e,t,i,c,n,r){const d=S("SkillPanel"),h=S("SliderControl"),o=S("JoystickControl");return v(),g(D,null,[n.isLoading==!0?(v(),g("div",K,ee)):w("",!0),M(a("div",te,[T(d,{skill:n.skill,showSkillPanel:n.showSkillPanel},null,8,["skill","showSkillPanel"]),n.showAnimation?(v(),g("div",{key:0,style:z({top:`${n.yPos}px`,left:`${n.xPos}px`}),class:"click-animation"},null,4)):w("",!0),a("canvas",se,null,512),ie,le,T(h,{ref:"sliderControl"},null,512),oe,T(o)],512),[[B,n.isLoading==!1]])],64)}const ae=F(Z,[["render",ne],["__scopeId","data-v-b6645fa7"]]);const re={setup(){return{skillsStore:Y()}},data(){return{width:6e3,height:null,skill:{id:null,children:[],isMastered:null,isUnlocked:null,container:null,name:null,url:null,description:null,tagIDs:[],sprite:null,type:null},tree:{},root:{},context:{},hiddenCanvasContext:{},r:1.5,nodes:[],nextCol:1,colToNode:{},isSkillInfoPanelShown:!1,scale:.3,panX:0,panY:0,data:{},d3Zoom:null,isLoading:!0,xPos:0,yPos:0,showAnimation:!1,showSkillPanel:!1,resultNode:null,truncateLevel:"phd"}},components:{SkillPanel:L,SkillPanel:L,SliderControl:V,JoystickControl:O},async mounted(){this.skillsStore.filteredNestedSkillsList.length==0&&await this.skillsStore.getFilteredNestedSkillsList(),this.height=window.innerHeight,this.skill={name:"SKILLS",sprite:null,children:this.skillsStore.filteredNestedSkillsList},this.getAlgorithm();let e=document.getElementById("hidden-canvas");this.hiddenCanvasContext=e.getContext("2d",{willReadFrequently:!0}),e.style.display="none",canvas.addEventListener("click",async t=>{this.nodes;var i=t.layerX,c=t.layerY;this.xPos=i,this.yPos=c,this.showAnimation=!0,setTimeout(()=>{this.showAnimation=!1},500);var n=this.hiddenCanvasContext,r=n.getImageData(i,c,1,1).data,d="rgb("+r[0]+","+r[1]+","+r[2]+")",h=this.colToNode[d];if(h&&h.data.id){h.renderCol=h.__pickColor,this.skill.name=h.data.name,this.skill.id=h.data.id,this.skill.type=h.data.type;const l=await(await fetch("/skills/mastery-requirements-and-url/"+this.skill.id)).json();this.skill.masteryRequirements=l.mastery_requirements,this.skill.url=l.url,this.showSkillPanel=!0}}),this.d3Zoom=W().scaleExtent([.1,5]).on("zoom",({transform:t})=>{this.drawTree(t),this.$refs.sliderControl.changeGradientBG()}),p(this.context.canvas).call(this.d3Zoom),this.resetPos(),this.isLoading=!1},methods:{getAlgorithm(){var e=[];e=JSON.parse(JSON.stringify(this.skill.children));function t(o){for(var l=o.length;l--;){if(o[l].type=="super"&&o[l].position!="end"){var s=[],u=[];for(let f=0;f<o[l].children.length;f++)o[l].children[f].type=="sub"?s.push(o[l].children[f]):u.push(o[l].children[f]);var m={name:o[l].name,type:"super",position:"end",children:s};o[l].children=[],o[l].children.push(m);for(let f=0;f<u.length;f++)o[l].children.push(u[f])}typeof o[l]<"u"&&o[l].children&&Array.isArray(o[l].children)&&o[l].children.length>0&&t(o[l].children)}}t(e),this.data={skill_name:"My skills",children:e},this.root=C(this.data);const i=24,c=this.width/(this.root.height+1);this.tree=b().nodeSize([i,c]),this.root.sort((o,l)=>P(o.data.name,l.data.name)),this.tree(this.root);let n=1/0,r=-n;this.root.each(o=>{o.x>r&&(r=o.x),o.x<n&&(n=o.x)});var d=document.getElementById("canvas");d.width=this.width,d.height=this.height,this.context=d.getContext("2d");let h=document.getElementById("hidden-canvas");this.hiddenCanvasContext=h.getContext("2d"),this.drawTree(k)},drawTree(e){this.nodes=this.root.descendants(),this.context.save(),this.hiddenCanvasContext.save(),this.context.clearRect(0,0,this.context.canvas.width,this.context.canvas.height),this.hiddenCanvasContext.clearRect(0,0,this.hiddenCanvasContext.canvas.width,this.hiddenCanvasContext.canvas.height),this.context.translate(e.x,e.y),this.hiddenCanvasContext.translate(e.x,e.y),this.context.scale(e.k,e.k),this.hiddenCanvasContext.scale(e.k,e.k),this.scale=e.k,this.panX=e.x,this.panY=e.y;const t=this.root.links();this.context.beginPath();for(const i of t)this.drawLink(i);this.context.beginPath();for(const i of this.nodes)i.renderCol?this.context.fillStyle=i.renderCol:this.context.fillStyle="RGBA(105, 105, 105, 0.8)",i.__pickColor===void 0&&(i.__pickColor=this.genColor(),this.colToNode[i.__pickColor]=i),this.hiddenCanvasContext.fillStyle=i.__pickColor,this.drawNode(i);this.context.restore(),this.hiddenCanvasContext.restore()},drawNode(e){var n;let t=this.context,i=this.hiddenCanvasContext;const c=e.data.name===((n=this.resultNode)==null?void 0:n.data.skill_name);if(e.data.type!="domain"){t.beginPath(),t.arc(e.y,e.x,10,0,2*Math.PI);const r=e.data.level?this.hexColor(e.data.level):"#000";t.lineWidth=2,t.fillStyle="#FFF",t.fill(),t.strokeStyle=r,t.stroke()}if(this.scale>.6)if(e.data.type!="domain"){t.beginPath(),t.strokeStyle="#FFF",t.lineWidth=4,t.fillStyle=c?"#ff0000":"#000",t.font=c?"bold":"normal",t.font="normal",t.direction="ltr";const r=c?`${e.data.name} ◀`:e.data.name;t.strokeText(r,e.y+15,e.x+2),t.fillText(r,e.y+15,e.x+2)}else{t.beginPath(),t.strokeStyle="#FFF",t.lineWidth=4,t.fillStyle=c?"#ff0000":"#849cab",t.direction="rtl";const r=c?`${e.data.name} ▶`:e.data.name;t.strokeText(r,e.y-5,e.x+2),t.fillText(r,e.y-5,e.x+2)}e.data.type!="domain"?(i.beginPath(),i.moveTo(e.y,e.x),i.arc(e.y,e.x,10,0,2*Math.PI),i.fill()):(i.beginPath(),i.moveTo(e.y,e.x-10),i.lineTo(e.y-20/2,e.x-10+20/2),i.lineTo(e.y,e.x-10+20),i.lineTo(e.y+20/2,e.x-10+20/2),i.closePath(),i.lineWidth=2,i.fill(),i.stroke())},drawLink(e){const t=N().x(i=>i.y).y(i=>i.x).context(this.context);this.context.lineWidth=1,e.source.data.type=="super"&&e.target.data.position=="end"||e.target.data.type=="sub"?this.context.setLineDash([5,3]):this.context.setLineDash([]),this.context.beginPath(),t(e),this.context.strokeStyle="#000",this.context.stroke()},genColor(){var e=[];this.nextCol<16777215&&(e.push(this.nextCol&255),e.push((this.nextCol&65280)>>8),e.push((this.nextCol&16711680)>>16),this.nextCol+=100);var t="rgb("+e.join(",")+")";return t},async printPDF(){await this.createSVGTree();var e=document.getElementById("linearTree"),t=p(e),i=t.node(),c=new XMLSerializer,n=c.serializeToString(i),r={svg:n,treeType:"linear"},d=JSON.stringify(r),h=new XMLHttpRequest;h.responseType="arraybuffer",h.open("POST","/skilltree/print-pdf",!0),h.setRequestHeader("Content-type","application/json;charset=UTF-8"),h.setRequestHeader("Accept","application/json, text/plain, */*"),h.send(d),h.onload=function(){if(this.readyState==4&&this.status==200){let l=new Blob([h.response],{type:"application/pdf"});const s=window.URL.createObjectURL(l);var o=document.createElement("a");document.body.appendChild(o),o.style="display: none",o.href=s,o.download="Skill-Tree.pdf",o.click(),window.URL.revokeObjectURL(s)}}},createSVGTree(){const e=C(this.data),t=15,i=this.width/(e.height+1);b().nodeSize([t,i])(e);let n=1/0,r=-n;e.each(s=>{s.x>r&&(r=s.x),s.x<n&&(n=s.x)});const d=r-n+t*2;let h=U("svg").attr("id","linearTree").attr("width",this.width).attr("height",d).attr("viewBox",[-i/3,n-t,this.width,d]).attr("style","max-width: 100%; height: auto; font: 10px sans-serif;");const o=h.append("g");o.append("g").attr("fill","none").attr("stroke-opacity",1).selectAll().data(e.links()).join("path").attr("d",N().x(s=>s.y).y(s=>s.x)).attr("stroke",function(s){return"#000"}).attr("stroke-width",function(s){return 1.5}).style("stroke-dasharray",function(s){if(s.source.data.type=="super"&&s.target.data.position=="end"||s.target.data.type=="sub")return 5});const l=o.append("g").attr("stroke-linejoin","round").attr("stroke-width",3).selectAll().data(e.descendants()).join("g").attr("transform",s=>`translate(${s.y},${s.x})`);l.append("circle").attr("fill",s=>s.children?"#555":"#000").attr("r",2.5),l.append("text").style("font-weight",function(s){return s.data.type=="super"?"700":"400"}).style("font-style",function(s){if(s.data.type=="sub")return"italic"}).attr("dy","0.31em").attr("x",s=>s.children?-6:6).attr("text-anchor",s=>s.children?"end":"start").text(function(s){return s.data.position=="end"?"":s.data.skill_name}).clone(!0).lower().attr("stroke",function(s){return"white"}),document.querySelector("#SVGskilltree").append(h.node())},resetPos(){p(this.context.canvas).transition().duration(700).call(this.d3Zoom.transform,k.translate(0,0).scale(.3)),this.$refs.sliderControl.showScaleLabel()},zoomInD3(e,t,i){p(this.context.canvas).call(this.d3Zoom.transform,k.translate(t,i).scale(e)),this.$refs.sliderControl.showScaleLabel()},panInD3(){p(this.context.canvas).call(this.d3Zoom.transform,k.translate(this.panX,this.panY).scale(this.scale))},hexColor(e){switch(e){case"college":return"#FFA500";case"grade_school":return"#40E0D0";case"high_school":return"#FFD700";case"middle_school":return"#33A133";case"phd":return"#FF0000"}},hexBorderColor(e){switch(e){case"college":return"#CC8400";case"grade_school":return"#33B3A6";case"high_school":return"#CCAC00";case"middle_school":return"#006400";case"phd":return"#CC0000"}},goToLocation(e){const t=this.$refs.wrapper.clientHeight,i=this.$refs.wrapper.clientWidth,c=i>480?2.5:2.8,n=2;this.resultNode=e;const r=i>480?1.75:1.2,d=-e.y*r+i/n,h=-e.x*r+t/c;p(this.context.canvas).transition().duration(2e3).call(this.d3Zoom.transform,k.translate(d,h).scale(r))},findNodeWithName(e){let t=[];return this.root.each(function(i){var c,n,r,d;if(e.length<2){if(((n=(c=i.data)==null?void 0:c.name)==null?void 0:n.toLowerCase().substring(0,e.length))===e){const h={...i.data,skill_name:i.data.name};t.push({...i,data:h})}}else if((d=(r=i.data)==null?void 0:r.name)!=null&&d.toLowerCase().includes(e)){const h={...i.data,skill_name:i.data.name};t.push({...i,data:h})}}),t},async truncateToGradeLevel(e){this.truncateLevel=e,await this.skillsStore.getFilteredNestedSkillsList(e),await this.reloadTree()},async reloadTree(){this.showSkillPanel=!1;let e=[];this.truncateLevel=="grade_school"?e=this.skillsStore.gradeSchoolFilteredNestedSkillsList:this.truncateLevel=="middle_school"?e=this.skillsStore.middleSchoolFilteredNestedSkillsList:this.truncateLevel=="high_school"?e=this.skillsStore.highSchoolFilteredNestedSkillsList:this.truncateLevel=="college"?e=this.skillsStore.collegeFilteredNestedSkillsList:e=this.skillsStore.filteredNestedSkillsList,this.skill={name:"SKILLS",sprite:null,children:e};var t=[];t=JSON.parse(JSON.stringify(this.skill.children));function i(o){for(var l=o.length;l--;){if(o[l].type=="super"&&o[l].position!="end"){if(o[l].show_children&&o[l].show_children==0)return;var s=[],u=[];for(let f=0;f<o[l].children.length;f++)o[l].children[f].type=="sub"?s.push(o[l].children[f]):u.push(o[l].children[f]);var m={name:o[l].name,type:"super",position:"end",children:s};o[l].children=[],o[l].children.push(m);for(let f=0;f<u.length;f++)o[l].children.push(u[f])}typeof o[l]<"u"&&o[l].children&&Array.isArray(o[l].children)&&o[l].children.length>0&&i(o[l].children)}}i(t),this.data={skill_name:"My skills",children:t},this.root=C(this.data);const c=24;let n=1;this.truncateLevel=="grade_school"?n=5:this.truncateLevel=="middle_school"?n=4:this.truncateLevel=="high_school"?n=3:this.truncateLevel=="college"&&(n=2);const r=this.width/(this.root.height+1)/n;this.tree=b().nodeSize([c,r]),this.root.sort((o,l)=>P(o.data.name,l.data.name)),this.tree(this.root),this.zoomInD3(this.scale,this.panX,this.panY);let d=0,h=0;typeof node<"u"&&(d=-node.y*this.scale+window.innerWidth/(2*this.scale)*this.scale,h=-node.x*this.scale+window.innerHeight/(2*this.scale)*this.scale),p(this.context.canvas).transition().duration(1e3).call(this.d3Zoom.transform,k.translate(d,h).scale(this.scale))}}},A=e=>(G("data-v-c4520994"),e=e(),j(),e),he={key:0,class:"loading-animation d-flex justify-content-center align-items-center py-4"},ce=A(()=>a("span",{class:"loader"},null,-1)),de=[ce],ue={id:"wrapper",ref:"wrapper"},fe={id:"canvas",width:"1500",height:"1500",ref:"canvas",tabindex:"1"},ve=A(()=>a("canvas",{id:"hidden-canvas",width:"1500",height:"1500"},null,-1)),pe=A(()=>a("div",{id:"SVGskilltree"},null,-1)),ge=A(()=>a("div",{id:"sidepanel-backdrop"},null,-1));function ke(e,t,i,c,n,r){const d=S("SkillPanel"),h=S("SliderControl"),o=S("JoystickControl");return v(),g(D,null,[n.isLoading==!0?(v(),g("div",he,de)):w("",!0),M(a("div",ue,[T(d,{skill:n.skill,showSkillPanel:n.showSkillPanel},null,8,["skill","showSkillPanel"]),n.showAnimation?(v(),g("div",{key:0,style:z({top:`${n.yPos}px`,left:`${n.xPos}px`}),class:"click-animation"},null,4)):w("",!0),a("canvas",fe,null,512),ve,pe,T(h,{ref:"sliderControl"},null,512),ge,T(o)],512),[[B,n.isLoading==!1]])],64)}const ye=F(re,[["render",ke],["__scopeId","data-v-c4520994"]]);const me={setup(){return{sessionDetailsStore:q()}},data(){return{searchText:"",lastChooseResult:"",showResult:!1,showConfirmModal:!1}},created(){},mounted(){this.GetGoogleLoginResult()},components:{TidyTree:ae,TidyTreeNoAccount:ye,SkillTreeSearchBar:E},methods:{resetPos(){this.$refs.childComponent.resetPos()},handleChooseResult(e){this.lastChooseResult=e;const t=this.$refs.childComponent.findNodeWithName(e);if(!t)return console.error("Cannot find node with name: "+e),!1;this.$refs.childComponent.goToLocation(t)},expandAllNodesWarning(){this.showConfirmModal=!0},expandAllNodes(){this.showConfirmModal=!1,this.$refs.childComponent.expandAllChildren()},GetGoogleLoginResult(){fetch("/google-login-result").then(function(e){return e.json()}).then(e=>{e.account=="new account"&&alert("Your account has been created!")})},clearResult(){this.$refs.childComponent.resetPos()}}},xe={id:"legend",class:"collapsible-tree-legend container-fluid p-2 position-relative"},_e={class:"position-absolute legend-div"},we={id:"mobile-legend"},Se={class:"legend row"},Te={class:"col-8"},Ce={class:"col"},be=a("span",{class:"grade-school"},null,-1),Le={class:"col"},Pe=a("span",{class:"middle-school"},null,-1),Ne={class:"col"},$e=a("span",{class:"high-school"},null,-1),Ae={class:"col"},Ie=a("span",{class:"college"},null,-1),Fe=a("button",{class:"btn"},[a("span",{class:"phd"}),x(" PHD ")],-1),De=[Fe],Re={class:"col-4 d-flex flex-column align-items-end"},Me=a("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 448 512",width:"20",height:"20"},[a("path",{d:"M32 32C14.3 32 0 46.3 0 64l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96z",fill:"white"})],-1),Be=[Me],ze=a("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",width:"19",height:"18"},[a("path",{d:"M128 0C92.7 0 64 28.7 64 64l0 96 64 0 0-96 226.7 0L384 93.3l0 66.7 64 0 0-66.7c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0L128 0zM384 352l0 32 0 64-256 0 0-64 0-16 0-16 256 0zm64 32l32 0c17.7 0 32-14.3 32-32l0-96c0-35.3-28.7-64-64-64L64 192c-35.3 0-64 28.7-64 64l0 96c0 17.7 14.3 32 32 32l32 0 0 64c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-64zM432 248a24 24 0 1 1 0 48 24 24 0 1 1 0-48z",fill:"white"})],-1),Ge=[ze],je={class:"search-mobile-row"},We={id:"tablet-and-up-legend"},Ue={class:"legend row"},Ve={class:"col d-flex align-items-center"},Oe=a("span",{class:"grade-school"},null,-1),Xe={class:"col d-flex align-items-center"},He=a("span",{class:"middle-school"},null,-1),Ye={class:"col d-flex align-items-center"},qe=a("span",{class:"high-school"},null,-1),Ee={class:"col d-flex align-items-center"},Je=a("span",{class:"college"},null,-1),Ze={class:"col d-flex align-items-center"},Ke=a("span",{class:"phd"},null,-1),Qe={class:"col-12 col-lg-4 d-flex justify-content-end align-items-center gap-2 mt-0 mt-md-2 mt-lg-0"},et=a("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 448 512",width:"20",height:"20"},[a("path",{d:"M32 32C14.3 32 0 46.3 0 64l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96z",fill:"white"})],-1),tt=[et],st={class:"modal-content asking-modal"},it=a("div",{class:"d-flex gap-4"},[a("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",fill:"grey",width:"45",height:"45"},[a("path",{d:"M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"})]),a("p",null,"Are you sure you want to expand all skills?")],-1),lt={class:"d-flex justify-content-end gap-2"},ot=a("span",null," No ",-1),nt=[ot],at=a("span",null," OK ",-1),rt=[at],ht=a("span",null,"Loading...",-1);function ct(e,t,i,c,n,r){const d=S("SkillTreeSearchBar"),h=S("TidyTree"),o=S("TidyTreeNoAccount");return v(),g(D,null,[a("div",xe,[a("div",_e,[a("div",we,[a("div",Se,[a("div",Te,[a("div",Ce,[a("button",{class:"btn",onClick:t[0]||(t[0]=l=>e.$refs.childComponent.truncateToGradeLevel("grade_school"))},[be,x("Grade school ")])]),a("div",Le,[a("button",{class:"btn",onClick:t[1]||(t[1]=l=>e.$refs.childComponent.truncateToGradeLevel("middle_school"))},[Pe,x(" Middle school ")])]),a("div",Ne,[a("button",{class:"btn",onClick:t[2]||(t[2]=l=>e.$refs.childComponent.truncateToGradeLevel("high_school"))},[$e,x(" High school ")])]),a("div",Ae,[a("button",{class:"btn",onClick:t[3]||(t[3]=l=>e.$refs.childComponent.truncateToGradeLevel("college"))},[Ie,x(" College ")])]),a("div",{class:"col",onClick:t[4]||(t[4]=l=>e.$refs.childComponent.truncateToGradeLevel("phd"))},De)]),a("div",Re,[a("button",{id:"reset-btn",class:"btn btn-primary me-3",onClick:t[5]||(t[5]=l=>r.resetPos())}," Reset "),c.sessionDetailsStore.isLoggedIn?(v(),g("button",{key:0,class:"btn legend-btn me-3 mt-1",onClick:t[6]||(t[6]=l=>r.expandAllNodesWarning())},Be)):w("",!0),c.sessionDetailsStore.isLoggedIn?(v(),g("button",{key:1,class:"legend-btn btn mt-1 me-3",onClick:t[7]||(t[7]=l=>e.$refs.childComponent.printPDF())},Ge)):w("",!0)])]),a("div",je,[T(d,{findNode:r.handleChooseResult,clearResults:r.clearResult},null,8,["findNode","clearResults"])])]),a("div",We,[a("div",Ue,[a("div",Ve,[a("button",{class:"btn",onClick:t[8]||(t[8]=l=>e.$refs.childComponent.truncateToGradeLevel("grade_school"))},[Oe,x("Grade school ")])]),a("div",Xe,[a("button",{class:"btn",onClick:t[9]||(t[9]=l=>e.$refs.childComponent.truncateToGradeLevel("middle_school"))},[He,x(" Middle school ")])]),a("div",Ye,[a("button",{class:"btn",onClick:t[10]||(t[10]=l=>e.$refs.childComponent.truncateToGradeLevel("high_school"))},[qe,x(" High school ")])]),a("div",Ee,[a("button",{class:"btn",onClick:t[11]||(t[11]=l=>e.$refs.childComponent.truncateToGradeLevel("college"))},[Je,x(" College ")])]),a("div",Ze,[a("button",{class:"btn",onClick:t[12]||(t[12]=l=>e.$refs.childComponent.truncateToGradeLevel("phd"))},[Ke,x(" PHD ")])]),a("div",Qe,[T(d,{findNode:r.handleChooseResult,clearResults:r.clearResult},null,8,["findNode","clearResults"]),a("button",{id:"reset-btn",class:"btn btn-primary me-1",onClick:t[13]||(t[13]=l=>r.resetPos())}," Reset "),c.sessionDetailsStore.isLoggedIn?(v(),g("button",{key:0,class:"btn legend-btn me-1",onClick:t[14]||(t[14]=l=>r.expandAllNodesWarning())},tt)):w("",!0),c.sessionDetailsStore.isLoggedIn?(v(),g("button",{key:1,class:"btn legend-btn me-3",onClick:t[15]||(t[15]=l=>e.$refs.childComponent.printPDF())}," Print ")):w("",!0)])])])])]),n.showConfirmModal?(v(),g("div",{key:0,onClick:t[18]||(t[18]=l=>n.showConfirmModal=!1),class:"modal"},[a("div",st,[it,a("div",lt,[a("button",{type:"button",class:"btn red-btn modal-btn",onClick:t[16]||(t[16]=l=>n.showConfirmModal=!1)},nt),a("button",{type:"button",class:"btn green-btn modal-btn",onClick:t[17]||(t[17]=l=>r.expandAllNodes())},rt)])])])):w("",!0),(v(),I(J,null,{default:R(()=>[c.sessionDetailsStore.isLoggedIn?(v(),I(h,{key:0,ref:"childComponent"},null,512)):(v(),I(o,{key:1,ref:"childComponent"},null,512))]),fallback:R(()=>[ht]),_:1}))],64)}const vt=F(me,[["render",ct]]);export{vt as default};