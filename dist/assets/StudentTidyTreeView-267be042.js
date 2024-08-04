import{_ as b,u as P,r as y,o as g,c as k,b as h,a as B,w as L,v as $,d as x,F as I,p as D,e as N,i as F,j,t as E,f as R,g as _,S as z}from"./main-c9fafb3f.js";import{S as U,z as V,s as p,h as S,t as w,a as A,i as f,l as C,c as G}from"./zoom-0652042d.js";import{S as M,J as O}from"./JoystickControl-d4a62954.js";const W={setup(){return{skillTreeStore:P()}},data(){return{width:6e3,height:null,skill:{id:null,children:[],isMastered:null,isUnlocked:null,container:null,name:null,description:null,tagIDs:[],sprite:null,type:null},tree:{},root:{},context:{},hiddenCanvasContext:{},r:1.5,nodes:[],nextCol:1,colToNode:{},isSkillInfoPanelShown:!1,scale:.3,panX:0,panY:0,data:{},d3Zoom:null,isLoading:!0}},props:["studentId"],components:{SkillPanel:U,SliderControl:M,JoystickControl:O},async mounted(){await this.skillTreeStore.getStudentSkills(this.studentId),this.height=window.innerHeight,this.skill={name:"SKILLS",sprite:null,children:this.skillTreeStore.studentSkills},this.getAlgorithm();let t=document.getElementById("hidden-canvas");this.hiddenCanvasContext=t.getContext("2d"),t.style.display="none",canvas.addEventListener("click",e=>{this.nodes;var s=e.layerX,c=e.layerY,l=this.hiddenCanvasContext,r=l.getImageData(s,c,1,1).data,d="rgb("+r[0]+","+r[1]+","+r[2]+")",o=this.colToNode[d];o&&(o.renderCol=o.__pickColor,this.skill.name=o.data.skill_name,this.skill.id=o.data.id,this.skill.type=o.data.type,this.skill.masteryRequirements=o.data.mastery_requirements,this.showInfoPanel())}),this.d3Zoom=V().scaleExtent([.1,5]).on("zoom",({transform:e})=>{this.drawTree(e),this.$refs.sliderControl.changeGradientBG()}),p(this.context.canvas).call(this.d3Zoom),this.resetPos(),this.isLoading=!1},methods:{getAlgorithm(){var t=[];t=JSON.parse(JSON.stringify(this.skill.children));function e(n){for(var a=n.length;a--;){if(n[a].type=="super"&&n[a].position!="end"){var i=[],v=[];for(let u=0;u<n[a].children.length;u++)n[a].children[u].type=="sub"?i.push(n[a].children[u]):v.push(n[a].children[u]);var T={skill_name:n[a].skill_name,type:"super",position:"end",children:i};n[a].children=[],n[a].children.push(T);for(let u=0;u<v.length;u++)n[a].children.push(v[u])}typeof n[a]<"u"&&n[a].children&&Array.isArray(n[a].children)&&n[a].children.length>0&&e(n[a].children)}}e(t),this.data={skill_name:"My skills",children:t},this.root=S(this.data);const s=24,c=this.width/(this.root.height+1);this.tree=w().nodeSize([s,c]),this.root.sort((n,a)=>A(n.data.name,a.data.name)),this.tree(this.root);let l=1/0,r=-l;this.root.each(n=>{n.x>r&&(r=n.x),n.x<l&&(l=n.x)});var d=document.getElementById("canvas");d.width=this.width,d.height=this.height,this.context=d.getContext("2d");let o=document.getElementById("hidden-canvas");this.hiddenCanvasContext=o.getContext("2d"),this.drawTree(f)},drawTree(t){this.nodes=this.root.descendants(),this.context.save(),this.hiddenCanvasContext.save(),this.context.clearRect(0,0,this.context.canvas.width,this.context.canvas.height),this.hiddenCanvasContext.clearRect(0,0,this.hiddenCanvasContext.canvas.width,this.hiddenCanvasContext.canvas.height),this.context.translate(t.x,t.y),this.hiddenCanvasContext.translate(t.x,t.y),this.context.scale(t.k,t.k),this.hiddenCanvasContext.scale(t.k,t.k),this.scale=t.k,this.panX=t.x,this.panY=t.y;const e=this.root.links();this.context.beginPath();for(const s of e)this.drawLink(s);this.context.beginPath();for(const s of this.nodes)s.renderCol?this.context.fillStyle=s.renderCol:this.context.fillStyle="RGBA(105, 105, 105, 0.8)",s.__pickColor===void 0&&(s.__pickColor=this.genColor(),this.colToNode[s.__pickColor]=s),this.hiddenCanvasContext.fillStyle=s.__pickColor,this.drawNode(s);this.context.restore(),this.hiddenCanvasContext.restore()},drawNode(t){let e=this.context,s=this.hiddenCanvasContext;if(t.data.type!="domain"){e.beginPath(),e.arc(t.y,t.x,10,0,2*Math.PI);const c=t.data.level?this.hexColor(t.data.level):"#000";if(t.data.is_mastered==1){e.fillStyle=c,e.fill();const l=this.hexBorderColor(t.data.level);e.lineWidth=2,e.strokeStyle=l,e.stroke()}else e.lineWidth=2,e.fillStyle="#FFF",e.fill(),e.strokeStyle=c,e.stroke()}this.scale>.6&&(t.data.type!="domain"?(e.beginPath(),e.strokeStyle="#FFF",e.lineWidth=4,e.fillStyle="#000",e.font="normal",e.direction="ltr",e.strokeText(t.data.skill_name,t.y+15,t.x+2),e.fillText(t.data.skill_name,t.y+15,t.x+2)):(e.beginPath(),e.strokeStyle="#FFF",e.lineWidth=4,e.fillStyle="#849cab",e.direction="rtl",e.strokeText(t.data.skill_name,t.y-5,t.x+2),e.fillText(t.data.skill_name,t.y-5,t.x+2))),t.data.type!="domain"?(s.beginPath(),s.moveTo(t.y,t.x),s.arc(t.y,t.x,10,0,2*Math.PI),s.fill()):(s.beginPath(),s.moveTo(t.y,t.x-10),s.lineTo(t.y-20/2,t.x-10+20/2),s.lineTo(t.y,t.x-10+20),s.lineTo(t.y+20/2,t.x-10+20/2),s.closePath(),s.lineWidth=2,s.fill(),s.stroke())},drawLink(t){const e=C().x(s=>s.y).y(s=>s.x).context(this.context);t.target.data.is_mastered==1?this.context.lineWidth=4:this.context.lineWidth=1,t.source.data.type=="super"&&t.target.data.position=="end"||t.target.data.type=="sub"?this.context.setLineDash([5,3]):this.context.setLineDash([]),this.context.beginPath(),e(t),this.context.strokeStyle="#000",this.context.stroke()},genColor(){var t=[];this.nextCol<16777215&&(t.push(this.nextCol&255),t.push((this.nextCol&65280)>>8),t.push((this.nextCol&16711680)>>16),this.nextCol+=100);var e="rgb("+t.join(",")+")";return e},showInfoPanel(){this.isSkillInfoPanelShown||(this.isSkillInfoPanelShown=!0,screen.width>800?document.getElementById("skillInfoPanel").style.width="474px":document.getElementById("skillInfoPanel").style.height="474px")},hideInfoPanel(){this.isSkillInfoPanelShown&&(screen.width>800?document.getElementById("skillInfoPanel").style.width="0px":document.getElementById("skillInfoPanel").style.height="0px",document.getElementById("sidepanel-backdrop").style.display="none",this.isSkillInfoPanelShown=!1)},async printPDF(){await this.createSVGTree();var t=document.getElementById("linearTree"),e=p(t),s=e.node(),c=new XMLSerializer,l=c.serializeToString(s),r={svg:l,treeType:"linear"},d=JSON.stringify(r),o=new XMLHttpRequest;o.responseType="arraybuffer",o.open("POST","/skilltree/print-pdf",!0),o.setRequestHeader("Content-type","application/json;charset=UTF-8"),o.setRequestHeader("Accept","application/json, text/plain, */*"),o.send(d),o.onload=function(){if(this.readyState==4&&this.status==200){let a=new Blob([o.response],{type:"application/pdf"});const i=window.URL.createObjectURL(a);var n=document.createElement("a");document.body.appendChild(n),n.style="display: none",n.href=i,n.download="My-Skill-Tree.pdf",n.click(),window.URL.revokeObjectURL(i)}}},createSVGTree(){const t=S(this.data),e=15,s=this.width/(t.height+1);w().nodeSize([e,s])(t);let l=1/0,r=-l;t.each(i=>{i.x>r&&(r=i.x),i.x<l&&(l=i.x)});const d=r-l+e*2;let o=G("svg").attr("id","linearTree").attr("width",this.width).attr("height",d).attr("viewBox",[-s/3,l-e,this.width,d]).attr("style","max-width: 100%; height: auto; font: 10px sans-serif;");const n=o.append("g");n.append("g").attr("fill","none").attr("stroke-opacity",1).selectAll().data(t.links()).join("path").attr("d",C().x(i=>i.y).y(i=>i.x)).attr("stroke",function(i){return"#000"}).attr("stroke-width",function(i){return i.target.data.is_mastered==1?8:1.5}).style("stroke-dasharray",function(i){if(i.source.data.type=="super"&&i.target.data.position=="end"||i.target.data.type=="sub")return 5});const a=n.append("g").attr("stroke-linejoin","round").attr("stroke-width",3).selectAll().data(t.descendants()).join("g").attr("transform",i=>`translate(${i.y},${i.x})`);a.append("circle").attr("fill",i=>i.children?"#555":"#000").attr("r",2.5),a.append("text").style("font-weight",function(i){return i.data.type=="super"?"700":"400"}).style("font-style",function(i){if(i.data.type=="sub")return"italic"}).attr("dy","0.31em").attr("x",i=>i.children?-6:6).attr("text-anchor",i=>i.children?"end":"start").text(function(i){return i.data.position=="end"?"":i.data.skill_name}).clone(!0).lower().attr("stroke",function(i){return"white"}),document.querySelector("#SVGskilltree").append(o.node())},resetPos(){p(this.context.canvas).transition().duration(700).call(this.d3Zoom.transform,f.translate(0,0).scale(.3)),this.$refs.sliderControl.showScaleLabel()},zoomInD3(t,e,s){p(this.context.canvas).call(this.d3Zoom.transform,f.translate(e,s).scale(t)),this.$refs.sliderControl.showScaleLabel()},panInD3(){p(this.context.canvas).call(this.d3Zoom.transform,f.translate(this.panX,this.panY).scale(this.scale))},hexColor(t){switch(t){case"college":return"#ab94e3";case"grade_school":return"#36bbaa";case"high_school":return"#3983dd";case"middle_school":return"#97c8f7";case"phd":return"#a48be5"}},hexBorderColor(t){switch(t){case"college":return"#8271ab";case"grade_school":return"#2a9184";case"high_school":return"#2d67ad";case"middle_school":return"#769dc2";case"phd":return"#826eb5"}}}},m=t=>(D("data-v-1ce39361"),t=t(),N(),t),J={key:0,class:"loading-animation d-flex justify-content-center align-items-center py-4"},X=m(()=>h("span",{class:"loader"},null,-1)),q=[X],Z={id:"wrapper"},H={id:"canvas",width:"1500",height:"1500",ref:"canvas",tabindex:"1"},Y=m(()=>h("canvas",{id:"hidden-canvas",width:"1500",height:"1500"},null,-1)),K=m(()=>h("div",{id:"SVGskilltree"},null,-1)),Q=m(()=>h("div",{id:"sidepanel-backdrop"},null,-1));function tt(t,e,s,c,l,r){const d=y("SkillPanel"),o=y("JoystickControl"),n=y("SliderControl");return g(),k(I,null,[h("button",{id:"print-btn",class:"btn btn-info",onClick:e[0]||(e[0]=a=>r.printPDF())}," Print "),h("button",{id:"reset-btn",class:"btn btn-primary",onClick:e[1]||(e[1]=a=>r.resetPos())}," Reset "),l.isLoading==!0?(g(),k("div",J,q)):B("",!0),L(h("div",Z,[x(d,{skill:l.skill},null,8,["skill"]),h("canvas",H,null,512),Y,K,x(o),x(n,{ref:"sliderControl"},null,512),Q],512),[[$,l.isLoading==!1]])],64)}const et=b(W,[["render",tt],["__scopeId","data-v-1ce39361"]]);const st={setup(){const t=F(),e=j();return{usersStore:t,userDetailsStore:e}},data(){return{studentName:""}},async created(){this.userDetailsStore.role=="instructor"||this.userDetailsStore.role=="admin"?this.instructorId=this.userDetailsStore.userId:(alert("Only admin or instructors can access this page."),this.$router.push("/")),this.usersStore.users.length==0&&await this.usersStore.getUsers();for(let t=0;t<this.usersStore.users.length;t++)this.usersStore.users[t].id==this.$route.params.studentId&&(this.studentName=this.usersStore.users[t].username)},components:{StudentTidyTree:et}},it={id:"thin-purple-banner"},nt={class:"container"},at={class:"row"},ot=h("span",null,"Loading...",-1);function lt(t,e,s,c,l,r){const d=y("StudentTidyTree");return g(),k(I,null,[h("div",it,[h("div",nt,[h("div",at,[h("h1",null,E(l.studentName),1)])])]),(g(),R(z,null,{default:_(()=>[x(d,{studentId:t.$route.params.studentId},null,8,["studentId"])]),fallback:_(()=>[ot]),_:1}))],64)}const ct=b(st,[["render",lt]]);export{ct as default};