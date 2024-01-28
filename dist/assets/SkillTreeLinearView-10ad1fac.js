import{_ as y,u as w,S as x,r as T,o as k,c as g,b as p,a as m,p as b,d as L,e as N,f as _,g as z,F as I}from"./main-a8c6d2bf.js";import{u as R}from"./SkillTreeStore-0035da50.js";import{u as U,S as $,h as j,t as B}from"./transform-0f688244.js";import{S as P}from"./fontfaceobserver.standalone-086224a1.js";import{c as A,a as O,z as F,s as M}from"./zoom-9242008d.js";function D(t,s){return t==null||s==null?NaN:t<s?-1:t>s?1:t>=s?0:NaN}const H={setup(){const t=w(),s=R(),a=U();return{userDetailsStore:t,skillTreeStore:s,skillTagsStore:a}},data(){return{stageContents:[],isSkillInfoPanelShown:!1,regularLockedUnmasteredNodeSprite:null,radius:0,width:null,height:null,radiusMultiplier:64,firstLevelNodeSize:100,regularNodeSize:50,subSkillRadius:50,skill:{id:null,children:[],isMastered:null,isUnlocked:null,container:null,name:null,description:null,tagIDs:[],sprite:null},isRecentered:!1,svg:null}},components:{SkillTreeFilter:$,SkillPanel:P},async mounted(){this.skillTreeStore.userSkills.length==0&&await this.skillTreeStore.getUserSkills(),this.width=window.innerWidth,this.height=window.innerHeight,this.radius=Math.min(this.width,this.height)/2;const t=x.from("center-node.png");this.skill={name:"SKILLS",sprite:t,children:this.skillTreeStore.userSkills},this.getAlgorithm()},methods:{getAlgorithm(){var t=[];t=JSON.parse(JSON.stringify(this.skill.children));function s(e){for(var l=e.length;l--;)e[l].type=="sub"&&e.splice(l,1),typeof e[l]<"u"&&e[l].children&&Array.isArray(e[l].children)&&e[l].children.length>0&&s(e[l].children)}s(t);var a={name:null,children:t};const d=8e3,n=j(a),o=30,c=d/(n.height+1),r=B().nodeSize([o,c]);n.sort((e,l)=>D(e.data.name,l.data.name)),r(n);let i=1/0,u=-i;n.each(e=>{e.x>u&&(u=e.x),e.x<i&&(i=e.x)});const h=u-i+o*2;this.svg=A("svg").attr("id","linearTree").attr("width",d).attr("height",h).attr("viewBox",[-c/3,i-o,d,h]).attr("style","max-width: 100%; height: auto; font: 10px sans-serif;");const S=this.svg.append("g");S.append("g").attr("fill","none").attr("stroke","#000").attr("stroke-opacity",1).selectAll().data(n.links()).join("path").attr("d",O().x(e=>e.y).y(e=>e.x)).attr("stroke-width",function(e){return e.target.data.is_mastered==1?8:1.5});const f=S.append("g").attr("stroke-linejoin","round").attr("stroke-width",3).selectAll().data(n.descendants()).join("g").attr("transform",e=>`translate(${e.y},${e.x})`);f.append("circle").attr("fill",e=>e.children?"#555":"#000").attr("r",2.5),f.append("text").attr("dy","0.31em").attr("x",e=>e.children?-6:6).attr("text-anchor",e=>e.children?"end":"start").text(e=>e.data.skill_name).clone(!0).lower().attr("stroke","none"),this.svg.call(F().extent([[0,0],[this.width,this.height]]).scaleExtent([.1,20]).on("zoom",v));function v({transform:e}){S.attr("transform",e)}document.querySelector("#skilltree").append(this.svg.node())},printPDF(){var t=document.getElementById("linearTree"),s=M(t),a=s.node(),d=new XMLSerializer,n=d.serializeToString(a),o={svg:n,treeType:"linear"},c=JSON.stringify(o),r=new XMLHttpRequest;r.responseType="arraybuffer",r.open("POST","/skilltree/print-pdf",!0),r.setRequestHeader("Content-type","application/json;charset=UTF-8"),r.setRequestHeader("Accept","application/json, text/plain, */*"),r.send(c),r.onload=function(){if(this.readyState==4&&this.status==200){let u=new Blob([r.response],{type:"application/pdf"});const h=window.URL.createObjectURL(u);var i=document.createElement("a");document.body.appendChild(i),i.style="display: none",i.href=h,i.download="My-Skill-Tree.pdf",i.click(),window.URL.revokeObjectURL(h)}}}}},q=t=>(b("data-v-50ce455b"),t=t(),L(),t),E={class:"flex-container skill-tree-container"},V={id:"wrapper"},J={id:"skilltree"},X=q(()=>p("div",{id:"sidepanel-backdrop"},null,-1));function K(t,s,a,d,n,o){const c=T("SkillPanel");return k(),g("div",E,[p("button",{id:"print-btn",class:"btn btn-info",onClick:s[0]||(s[0]=r=>o.printPDF())},"Print"),p("div",V,[p("div",J,[m(c,{skill:n.skill},null,8,["skill"])]),X])])}const W=y(H,[["render",K],["__scopeId","data-v-50ce455b"]]);const G=p("div",{id:"purple-banner"},null,-1),Q=p("span",null,"Loading...",-1),se={__name:"SkillTreeLinearView",setup(t){return(s,a)=>(k(),g(I,null,[G,(k(),N(z,null,{default:_(()=>[m(W)]),fallback:_(()=>[Q]),_:1}))],64))}};export{se as default};