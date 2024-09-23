import{_ as M,s as N,u as j,r as T,o as k,c as y,a as w,w as D,v as z,b as d,d as $,n as B,F as A,p as O,e as V,k as U,l as b,S as q,m as R}from"./main-7d54577c.js";import{S as E,z as G,s as _,t as P,h as C,a as H,b as I,c as X,i as J}from"./zoom-51f25d70.js";const W={setup(){const t=N(),e=j();return{userDetailsStore:t,skillTreeStore:e}},data(){return{width:6e3,height:null,radius:0,radiusMultiplier:96,skill:{id:null,children:[],isMastered:null,isUnlocked:null,container:null,name:null,description:null,tagIDs:[],sprite:null,type:null,subskills:[]},tree:{},root:{},context:{},hiddenCanvasContext:{},scaleMultiplier:.8,startDragOffset:{x:0,y:0},mouseDown:!1,nodes:[],nextCol:1,colToNode:{},isSkillInfoPanelShown:!1,scale:1,panX:0,panY:0,d3Zoom:null,data:{},isLoading:!0,xPos:0,yPos:0,showAnimation:!1,showSkillPanel:!1,userAvatarImg:null}},components:{SkillPanel:E},async mounted(){this.skillTreeStore.userSkillsSubSkillsSeparate.length==0&&await this.skillTreeStore.getUserSkillsSubSkillsSeparate(),this.width=window.innerWidth,this.height=window.innerHeight,this.radius=Math.min(this.width,this.height)/2-30,this.skill={name:"SKILLS",sprite:null,children:this.skillTreeStore.userSkillsSubSkillsSeparate},this.userAvatarImg=new Image,this.userAvatarImg.src=this.userDetailsStore.avatar,this.userAvatarImg.onload=()=>{this.getAlgorithm(),this.d3Zoom=G().scaleExtent([.05,8]).on("zoom",({transform:t})=>this.zoomed(t)),_(this.context.canvas).call(this.d3Zoom),this.defaultPosition()},canvas.addEventListener("click",async t=>{this.nodes;var e=t.layerX,n=t.layerY;this.xPos=e,this.yPos=n,this.showAnimation=!0,setTimeout(()=>{this.showAnimation=!1},500);var r=this.hiddenCanvasContext,a=r.getImageData(e,n,1,1).data,s="rgb("+a[0]+","+a[1]+","+a[2]+")",o=this.colToNode[s];if(o){o.renderCol=o.__pickColor,this.skill.name=o.data.skill_name,this.skill.id=o.data.id,this.skill.type=o.data.type,this.skill.subskills=o.data.subskills;const i=await(await fetch("/skills/mastery-requirements/"+this.skill.id)).json();this.skill.masteryRequirements=i,this.showSkillPanel=!0}}),this.isLoading=!1},methods:{getAlgorithm(){var t=[];t=JSON.parse(JSON.stringify(this.skill.children)),this.data={skill_name:"",children:t};const e=P().size([2*Math.PI,this.radius*this.radiusMultiplier]).separation((a,s)=>(a.parent==s.parent?1:2)/a.depth);this.root=e(C(this.data).sort((a,s)=>H(a.data.name,s.data.name)));var n=document.getElementById("canvas");n.width=this.width,n.height=this.height,this.context=n.getContext("2d"),this.context.fillStyle="#1e293b",this.context.fillRect(0,0,this.width,this.height);let r=document.getElementById("hidden-canvas");this.hiddenCanvasContext=r.getContext("2d",{willReadFrequently:!0}),r.style.display="none",this.context.translate(this.width/2,this.height/2),this.hiddenCanvasContext.translate(this.width/2,this.height/2),this.drawTree()},drawTree(){this.nodes=this.root.descendants();const t=this.root.links();this.context.beginPath();for(const e of t)this.drawLink(e);this.context.beginPath();for(const e of this.nodes)e.renderCol?this.context.fillStyle=e.renderCol:this.context.fillStyle="RGBA(105, 105, 105, 0.8)",e.__pickColor===void 0&&(e.__pickColor=this.genColor(),this.colToNode[e.__pickColor]=e),this.hiddenCanvasContext.fillStyle=e.__pickColor,this.drawNode(e);this.context.fillStyle="transparent",this.context.save(),this.context.beginPath(),this.context.moveTo(0,0),this.context.arc(0,0,20,0,2*Math.PI),this.context.stroke(),this.context.clip(),this.context.drawImage(this.userAvatarImg,-20,-20,40,40),this.context.restore()},drawNode(t){let e=this.context,n=this.hiddenCanvasContext,r=Math.cos(t.x)*t.y,a=Math.sin(t.x)*t.y,s=o(0,0,r,a,90);function o(c,u,g,m,f){var p=Math.PI/180*f,v=Math.cos(p),S=Math.sin(p),L=v*(g-c)+S*(m-u)+c,F=v*(m-u)-S*(g-c)+u;return[L,F]}let l;t.data.type=="domain"?l="black":t.data.level=="grade_school"?l="#40E0D0":t.data.level=="middle_school"?l="#33A133":t.data.level=="high_school"?l="#FFD700":t.data.level=="college"?l="#FFA500":t.data.level=="phd"&&(l="#FF0000");let i;t.depth==1?i=20:i=10,t.data.type!=="domain"&&(e.beginPath(),e.moveTo(s[0],s[1]),e.arc(s[0],s[1],i,0,2*Math.PI),e.fillStyle=l,e.fill());function h(c,u,g,m){var f=m-u,p=g-c,v=Math.atan2(f,p);return v}var h=h(0,0,s[0],s[1]);if(this.scale>.6){e.save(),e.translate(s[0],s[1]),e.rotate(h);let c=0,u=0;2*Math.PI/3>Math.abs(h)>=Math.PI/3?(u=s[0]>0?15:-15,c=0):(c=s[0]>0?15:-15,u=0),s[0]<0?(e.textAlign=t.data.level!=="domain"?"end":"start",e.rotate(Math.PI)):e.textAlign=t.data.level!=="domain"?"start":"end",e.strokeStyle="#1e293b",e.lineWidth=4,e.strokeText(t.data.skill_name,c,u),e.fillStyle=t.data.level!=="domain"?"#FFF":"#afb9c9",e.fillText(t.data.skill_name,c,u),e.restore()}if(n.beginPath(),n.moveTo(s[0],s[1]),n.arc(s[0],s[1],i,0,2*Math.PI),n.fill(),t.data.type=="super")for(let c=0;c<t.data.subskills.length;c++){let f=360/t.data.subskills.length*c*Math.PI/180,p=20*Math.cos(f),v=20*Math.sin(f);e.beginPath(),e.moveTo(s[0],s[1]),e.arc(s[0]+p,s[1]+v,5,0,2*Math.PI),e.fillStyle=l,e.fill(),n.beginPath(),n.moveTo(s[0],s[1]),n.arc(s[0]+p,s[1]+v,5,0,2*Math.PI),n.fill()}},drawLink(t){const e=I().angle(r=>r.x).radius(r=>r.y).context(this.context);let n="#71717a";t.target.data.is_mastered==1?(this.context.lineWidth=4,n="#ffffff"):this.context.lineWidth=1,this.context.beginPath(),e(t),this.context.strokeStyle=n,this.context.stroke()},genColor(){var t=[];this.nextCol<16777215&&(t.push(this.nextCol&255),t.push((this.nextCol&65280)>>8),t.push((this.nextCol&16711680)>>16),this.nextCol+=100);var e="rgb("+t.join(",")+")";return e},zoomed(t){this.context.save(),this.hiddenCanvasContext.save(),this.context.fillStyle="#1e293b",this.context.fillRect(this.width/2*-1,this.height/2*-1,this.width,this.height),this.hiddenCanvasContext.clearRect(this.width/2*-1,this.height/2*-1,this.width,this.height),this.context.translate(t.x-this.width/2,t.y-this.height/2),this.context.scale(t.k,t.k),this.hiddenCanvasContext.translate(t.x-this.width/2,t.y-this.height/2),this.hiddenCanvasContext.scale(t.k,t.k),this.drawTree(),this.context.fill(),this.context.restore(),this.hiddenCanvasContext.fill(),this.hiddenCanvasContext.restore()},async printPDF(){await this.getPrintAlgorithm();var t=document.getElementById("radialTree"),e=_(t),n=e.node(),r=new XMLSerializer,a=r.serializeToString(n),s={svg:a,treeType:"radial"},o=JSON.stringify(s),l=new XMLHttpRequest;l.responseType="arraybuffer",l.open("POST","/skilltree/print-pdf",!0),l.setRequestHeader("Content-type","application/json;charset=UTF-8"),l.setRequestHeader("Accept","application/json, text/plain, */*"),l.send(o),l.onload=function(){if(this.readyState==4&&this.status==200){let h=new Blob([l.response],{type:"application/pdf"});const c=window.URL.createObjectURL(h);var i=document.createElement("a");document.body.appendChild(i),i.style="display: none",i.href=c,i.download="My-Skill-Tree.pdf",i.click(),window.URL.revokeObjectURL(c)}}},async getPrintAlgorithm(){await this.skillTreeStore.getUserSkills();const t={name:"SKILLS",sprite:null,children:this.skillTreeStore.userSkills};var e=[];e=JSON.parse(JSON.stringify(t.children));function n(a){for(var s=a.length;s--;){if(a[s].type=="super"&&a[s].position!="end"){var o=[],l=[];for(let h=0;h<a[s].children.length;h++)a[s].children[h].type=="sub"?o.push(a[s].children[h]):l.push(a[s].children[h]);var i={skill_name:a[s].skill_name,type:"super",position:"end",children:o};a[s].children=[],a[s].children.push(i);for(let h=0;h<l.length;h++)a[s].children.push(l[h])}typeof a[s]<"u"&&a[s].children&&Array.isArray(a[s].children)&&a[s].children.length>0&&n(a[s].children)}}n(e);const r={skill_name:"My skills",children:e};await this.createSVGTree(r)},async createSVGTree(t){const r=13200.000000000002,a=24e3*.59,o=P().size([2*Math.PI,this.radius*50]).separation((i,h)=>(i.parent==h.parent?1:2)/i.depth)(C(t));let l=X("svg").attr("id","radialTree").attr("width",24e3).attr("height",24e3).attr("viewBox",[-r,-a,24e3,24e3]).attr("style","max-width: 100%; height: auto; font: 10px sans-serif;");l.append("g").attr("fill","none").attr("stroke-opacity",1).selectAll().data(o.links()).join("path").attr("d",I().angle(i=>i.x).radius(i=>i.y)).attr("stroke",function(i){return"#000"}).attr("stroke-width",function(i){return i.target.data.is_mastered==1?4:1.5}).style("stroke-dasharray",function(i){if(i.source.data.type=="super"&&i.target.data.position=="end"||i.target.data.type=="sub")return 5}),l.append("g").selectAll().data(o.descendants()).join("circle").attr("transform",i=>`rotate(${i.x*180/Math.PI-90}) translate(${i.y},0)`).attr("fill","#000").attr("r",2.5),l.append("g").attr("stroke-linejoin","round").attr("stroke-width",1).selectAll().data(o.descendants()).join("text").attr("transform",i=>`rotate(${i.x*180/Math.PI-90}) translate(${i.y},0) rotate(${i.x>=Math.PI?180:0})`).attr("dy","0.31em").attr("x",i=>i.x<Math.PI==!i.children?6:-6).attr("text-anchor",i=>i.x<Math.PI==!i.children?"start":"end").style("font-weight",function(i){return i.data.type=="super"?"700":"400"}).style("font-style",function(i){if(i.data.type=="sub")return"italic"}).style("paint-order",function(i){return"stroke"}).clone(!0).lower().style("stroke-width",function(i){return"1px"}).text(function(i){return i.data.position=="end"?"":i.data.skill_name}),document.querySelector("#SVGskilltree").append(l.node())},defaultPosition(){_(this.context.canvas).transition().duration(300).call(this.d3Zoom.transform,J.translate(this.width/2,this.height/2).scale(.08))}}},x=t=>(O("data-v-3a5139d4"),t=t(),V(),t),Y={key:0,class:"loading-animation d-flex justify-content-center align-items-center py-4"},Z=x(()=>d("span",{class:"loader"},null,-1)),K=[Z],Q={id:"wrapper"},tt=x(()=>d("canvas",{id:"canvas",width:"1500",height:"1500"},null,-1)),et=x(()=>d("canvas",{id:"hidden-canvas",width:"1500",height:"1500"},null,-1)),st=x(()=>d("div",{id:"SVGskilltree"},null,-1)),it=x(()=>d("div",{id:"sidepanel-backdrop"},null,-1));function at(t,e,n,r,a,s){const o=T("SkillPanel");return k(),y(A,null,[a.isLoading==!0?(k(),y("div",Y,K)):w("",!0),D(d("div",Q,[$(o,{skill:a.skill,showSkillPanel:a.showSkillPanel},null,8,["skill","showSkillPanel"]),a.showAnimation?(k(),y("div",{key:0,style:B({top:`${a.yPos}px`,left:`${a.xPos}px`}),class:"click-animation"},null,4)):w("",!0),tt,et,st,it],512),[[z,a.isLoading==!1]])],64)}const lt=M(W,[["render",at],["__scopeId","data-v-3a5139d4"]]);const nt={setup(){},data(){return{}},components:{RadialTree:lt},methods:{}},ot={id:"legend",class:"collapsible-tree-legend container-fluid p-2"},rt={class:"mobile-legend"},ht={class:"legend row"},dt=R('<div class="col-8"><div class="col"><span class="grade-school"></span>Grade school </div><div class="col"><span class="middle-school"></span> Middle school </div><div class="col"><span class="high-school"></span> High school </div><div class="col"><span class="college"></span> College</div><div class="col"><span class="phd"></span> PHD</div></div>',1),ct={class:"col-4 d-flex flex-column align-items-end"},ut={class:"tablet-and-up-legend"},pt={class:"legend row"},vt=R('<div class="col"><span class="grade-school"></span>Grade school </div><div class="col"><span class="middle-school"></span> Middle school </div><div class="col"><span class="high-school"></span> High school </div><div class="col"><span class="college"></span> College</div><div class="col"><span class="phd"></span> PHD</div>',5),ft={class:"col d-flex justify-content-end"},gt=d("div",{id:"thin-purple-banner"},null,-1),mt=d("span",null,"Loading...",-1);function kt(t,e,n,r,a,s){const o=T("RadialTree");return k(),y(A,null,[d("div",ot,[d("div",rt,[d("div",ht,[dt,d("div",ct,[d("button",{id:"print-btn",class:"btn btn-info",onClick:e[0]||(e[0]=l=>t.$refs.childComponent.printPDF())}," Print "),d("button",{id:"reset-btn",class:"btn btn-primary",onClick:e[1]||(e[1]=l=>t.resetPos())}," Reset ")])])]),d("div",ut,[d("div",pt,[vt,d("div",ft,[d("button",{id:"print-btn",class:"btn btn-info me-3",onClick:e[2]||(e[2]=l=>t.$refs.childComponent.printPDF())}," Print ")])])])]),gt,(k(),U(q,null,{default:b(()=>[$(o,{ref:"childComponent"},null,512)]),fallback:b(()=>[mt]),_:1}))],64)}const _t=M(nt,[["render",kt]]);export{_t as default};