import{_ as b,u as L,S as j,r as z,o as _,c as v,b as p,a as w,p as N,d as I,e as R,f as y,g as U,F as $}from"./main-d5a9e164.js";import{u as B}from"./SkillTreeStore-f6a96295.js";import{u as P,S as A}from"./SkillTreeFilter-6e2d7f69.js";import{S as M}from"./SkillPanel-06c3a9db.js";import"./fontfaceobserver.standalone-8358d40e.js";import"./transform-9f729428.js";import{a as O,z as F,s as D}from"./zoom-d4b7039c.js";import{h as H}from"./index-0536990b.js";import{a as q}from"./ascending-3ff63084.js";import{t as E}from"./tree-6e85cfa8.js";import{c as V}from"./create-94a19cff.js";const J={setup(){const s=L(),n=B(),l=P();return{userDetailsStore:s,skillTreeStore:n,skillTagsStore:l}},data(){return{stageContents:[],isSkillInfoPanelShown:!1,regularLockedUnmasteredNodeSprite:null,radius:0,width:null,height:null,radiusMultiplier:64,firstLevelNodeSize:100,regularNodeSize:50,subSkillRadius:50,skill:{id:null,children:[],isMastered:null,isUnlocked:null,container:null,name:null,description:null,tagIDs:[],sprite:null},isRecentered:!1,svg:null}},components:{SkillTreeFilter:A,SkillPanel:M},async mounted(){this.skillTreeStore.userSkills.length==0&&await this.skillTreeStore.getUserSkills(),this.width=window.innerWidth,this.height=window.innerHeight,this.radius=Math.min(this.width,this.height)/2;const s=j.from("center-node.png");this.skill={name:"SKILLS",sprite:s,children:this.skillTreeStore.userSkills},this.getAlgorithm()},methods:{getAlgorithm(){var s=[];s=JSON.parse(JSON.stringify(this.skill.children));function n(e){for(var t=e.length;t--;){if(e[t].type=="super"&&e[t].position!="end"){var S=[],g=[];for(let a=0;a<e[t].children.length;a++)e[t].children[a].type=="sub"?S.push(e[t].children[a]):g.push(e[t].children[a]);var T={skill_name:e[t].skill_name,type:"super",position:"end",children:S};e[t].children=[],e[t].children.push(T);for(let a=0;a<g.length;a++)e[t].children.push(g[a])}typeof e[t]<"u"&&e[t].children&&Array.isArray(e[t].children)&&e[t].children.length>0&&n(e[t].children)}}n(s);var l={name:null,children:s};const c=8e3,r=H(l),d=30,u=c/(r.height+1),o=E().nodeSize([d,u]);r.sort((e,t)=>q(e.data.name,t.data.name)),o(r);let i=1/0,h=-i;r.each(e=>{e.x>h&&(h=e.x),e.x<i&&(i=e.x)});const f=h-i+d*2;this.svg=V("svg").attr("id","linearTree").attr("width",c).attr("height",f).attr("viewBox",[-u/3,i-d,c,f]).attr("style","max-width: 100%; height: auto; font: 10px sans-serif;");const m=this.svg.append("g");m.append("g").attr("fill","none").attr("stroke-opacity",1).selectAll().data(r.links()).join("path").attr("d",O().x(e=>e.y).y(e=>e.x)).attr("stroke",function(e){return"#000"}).attr("stroke-width",function(e){return e.target.data.is_mastered==1?8:1.5}).style("stroke-dasharray",function(e){if(e.source.data.type=="super"&&e.target.data.position=="end"||e.target.data.type=="sub")return 5});const k=m.append("g").attr("stroke-linejoin","round").attr("stroke-width",3).selectAll().data(r.descendants()).join("g").attr("transform",e=>`translate(${e.y},${e.x})`);k.append("circle").attr("fill",e=>e.children?"#555":"#000").attr("r",2.5),k.append("text").style("font-weight",function(e){return e.data.type=="super"?"700":"400"}).style("font-style",function(e){if(e.data.type=="sub")return"italic"}).attr("dy","0.31em").attr("x",e=>e.children?-6:6).attr("text-anchor",e=>e.children?"end":"start").text(function(e){return e.data.position=="end"?"":e.data.skill_name}).clone(!0).lower().attr("stroke",function(e){return"white"}),this.svg.call(F().extent([[0,0],[this.width,this.height]]).scaleExtent([.1,20]).on("zoom",x));function x({transform:e}){m.attr("transform",e)}document.querySelector("#skilltree").append(this.svg.node())},printPDF(){var s=document.getElementById("linearTree"),n=D(s),l=n.node(),c=new XMLSerializer,r=c.serializeToString(l),d={svg:r,treeType:"linear"},u=JSON.stringify(d),o=new XMLHttpRequest;o.responseType="arraybuffer",o.open("POST","/skilltree/print-pdf",!0),o.setRequestHeader("Content-type","application/json;charset=UTF-8"),o.setRequestHeader("Accept","application/json, text/plain, */*"),o.send(u),o.onload=function(){if(this.readyState==4&&this.status==200){let h=new Blob([o.response],{type:"application/pdf"});const f=window.URL.createObjectURL(h);var i=document.createElement("a");document.body.appendChild(i),i.style="display: none",i.href=f,i.download="My-Skill-Tree.pdf",i.click(),window.URL.revokeObjectURL(f)}}}}},W=s=>(N("data-v-cb133569"),s=s(),I(),s),X={class:"flex-container skill-tree-container"},K={id:"wrapper"},G={id:"skilltree"},Q=W(()=>p("div",{id:"sidepanel-backdrop"},null,-1));function Y(s,n,l,c,r,d){const u=z("SkillPanel");return _(),v("div",X,[p("button",{id:"print-btn",class:"btn btn-info",onClick:n[0]||(n[0]=o=>d.printPDF())}," Print "),p("div",K,[p("div",G,[w(u,{skill:r.skill},null,8,["skill"])]),Q])])}const Z=b(J,[["render",Y],["__scopeId","data-v-cb133569"]]);const C=p("div",{id:"purple-banner"},null,-1),ee=p("span",null,"Loading...",-1),pe={__name:"TidyTreeView",setup(s){return(n,l)=>(_(),v($,null,[C,(_(),R(U,null,{default:y(()=>[w(Z)]),fallback:y(()=>[ee]),_:1}))],64))}};export{pe as default};