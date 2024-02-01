import{_ as b,u as N,S as L,r as j,o as m,c as v,b as p,a as w,p as z,d as I,e as R,f as y,g as U,F as $}from"./main-9e950be5.js";import{u as B}from"./SkillTreeStore-2701a7f7.js";import{u as P,S as A,h as M}from"./transform-a6d6848e.js";import{S as O}from"./fontfaceobserver.standalone-2885f38f.js";import{c as F,a as D,z as H,s as q}from"./zoom-d657277b.js";import{t as E}from"./tree-c8b9f3a5.js";function V(t,n){return t==null||n==null?NaN:t<n?-1:t>n?1:t>=n?0:NaN}const J={setup(){const t=N(),n=B(),o=P();return{userDetailsStore:t,skillTreeStore:n,skillTagsStore:o}},data(){return{stageContents:[],isSkillInfoPanelShown:!1,regularLockedUnmasteredNodeSprite:null,radius:0,width:null,height:null,radiusMultiplier:64,firstLevelNodeSize:100,regularNodeSize:50,subSkillRadius:50,skill:{id:null,children:[],isMastered:null,isUnlocked:null,container:null,name:null,description:null,tagIDs:[],sprite:null},isRecentered:!1,svg:null}},components:{SkillTreeFilter:A,SkillPanel:O},async mounted(){this.skillTreeStore.userSkills.length==0&&await this.skillTreeStore.getUserSkills(),this.width=window.innerWidth,this.height=window.innerHeight,this.radius=Math.min(this.width,this.height)/2;const t=L.from("center-node.png");this.skill={name:"SKILLS",sprite:t,children:this.skillTreeStore.userSkills},this.getAlgorithm()},methods:{getAlgorithm(){var t=[];t=JSON.parse(JSON.stringify(this.skill.children));function n(e){for(var s=e.length;s--;){if(e[s].type=="super"&&e[s].position!="end"){var S=[],_=[];for(let a=0;a<e[s].children.length;a++)e[s].children[a].type=="sub"?S.push(e[s].children[a]):_.push(e[s].children[a]);var T={skill_name:e[s].skill_name,type:"super",position:"end",children:S};e[s].children=[],e[s].children.push(T);for(let a=0;a<_.length;a++)e[s].children.push(_[a])}typeof e[s]<"u"&&e[s].children&&Array.isArray(e[s].children)&&e[s].children.length>0&&n(e[s].children)}}n(t);var o={name:null,children:t};const c=8e3,r=M(o),d=30,u=c/(r.height+1),l=E().nodeSize([d,u]);r.sort((e,s)=>V(e.data.name,s.data.name)),l(r);let i=1/0,h=-i;r.each(e=>{e.x>h&&(h=e.x),e.x<i&&(i=e.x)});const f=h-i+d*2;this.svg=F("svg").attr("id","linearTree").attr("width",c).attr("height",f).attr("viewBox",[-u/3,i-d,c,f]).attr("style","max-width: 100%; height: auto; font: 10px sans-serif;");const g=this.svg.append("g");g.append("g").attr("fill","none").attr("stroke-opacity",1).selectAll().data(r.links()).join("path").attr("d",D().x(e=>e.y).y(e=>e.x)).attr("stroke",function(e){return"#000"}).attr("stroke-width",function(e){return e.target.data.is_mastered==1?8:1.5}).style("stroke-dasharray",function(e){if(e.source.data.type=="super"&&e.target.data.position=="end"||e.target.data.type=="sub")return 5});const k=g.append("g").attr("stroke-linejoin","round").attr("stroke-width",3).selectAll().data(r.descendants()).join("g").attr("transform",e=>`translate(${e.y},${e.x})`);k.append("circle").attr("fill",e=>e.children?"#555":"#000").attr("r",2.5),k.append("text").style("font-weight",function(e){return e.data.type=="super"?"700":"400"}).style("font-style",function(e){if(e.data.type=="sub")return"italic"}).attr("dy","0.31em").attr("x",e=>e.children?-6:6).attr("text-anchor",e=>e.children?"end":"start").text(function(e){return e.data.position=="end"?"":e.data.skill_name}).clone(!0).lower().attr("stroke",function(e){return"white"}),this.svg.call(H().extent([[0,0],[this.width,this.height]]).scaleExtent([.1,20]).on("zoom",x));function x({transform:e}){g.attr("transform",e)}document.querySelector("#skilltree").append(this.svg.node())},printPDF(){var t=document.getElementById("linearTree"),n=q(t),o=n.node(),c=new XMLSerializer,r=c.serializeToString(o),d={svg:r,treeType:"linear"},u=JSON.stringify(d),l=new XMLHttpRequest;l.responseType="arraybuffer",l.open("POST","/skilltree/print-pdf",!0),l.setRequestHeader("Content-type","application/json;charset=UTF-8"),l.setRequestHeader("Accept","application/json, text/plain, */*"),l.send(u),l.onload=function(){if(this.readyState==4&&this.status==200){let h=new Blob([l.response],{type:"application/pdf"});const f=window.URL.createObjectURL(h);var i=document.createElement("a");document.body.appendChild(i),i.style="display: none",i.href=f,i.download="My-Skill-Tree.pdf",i.click(),window.URL.revokeObjectURL(f)}}}}},W=t=>(z("data-v-cb133569"),t=t(),I(),t),X={class:"flex-container skill-tree-container"},K={id:"wrapper"},G={id:"skilltree"},Q=W(()=>p("div",{id:"sidepanel-backdrop"},null,-1));function Y(t,n,o,c,r,d){const u=j("SkillPanel");return m(),v("div",X,[p("button",{id:"print-btn",class:"btn btn-info",onClick:n[0]||(n[0]=l=>d.printPDF())}," Print "),p("div",K,[p("div",G,[w(u,{skill:r.skill},null,8,["skill"])]),Q])])}const Z=b(J,[["render",Y],["__scopeId","data-v-cb133569"]]);const C=p("div",{id:"purple-banner"},null,-1),ee=p("span",null,"Loading...",-1),ae={__name:"TidyTreeView",setup(t){return(n,o)=>(m(),v($,null,[C,(m(),R(U,null,{default:y(()=>[w(Z)]),fallback:y(()=>[ee]),_:1}))],64))}};export{ae as default};