import{u as d}from"./TagsStore-02d61c0d.js";import{_ as i,e as u,o as s,c as o,a as t,h as p,g as m,i as g,F as r,r as h,t as b,f}from"./main-fd74996d.js";const k={setup(){const e=d();return e.getTagsList(),{tagsStore:e}},data(){return{}},computed:{},methods:{}},v={class:"topnav"},T={class:"container mt-3"},x=t("h1",null,"Tag List",-1),L={class:"table_div"},S={class:"skilltree-table table-bordered"},B=t("tr",null,[t("th",null,"name"),t("th")],-1),C=["onClick"];function V(e,c,l,a,N,w){const _=u("router-link");return s(),o(r,null,[t("div",v,[p(_,{to:"/tags/add"},{default:m(()=>[g("Add")]),_:1})]),t("div",T,[x,t("div",L,[t("table",S,[B,(s(!0),o(r,null,h(a.tagsStore.tagsList,n=>(s(),o("tr",null,[t("td",null,b(n.name),1),t("td",null,[t("button",{type:"button",onClick:y=>a.tagsStore.deleteTag(n.id),class:"btn btn-danger delete-btn"},"Delete",8,C)])]))),256))])])])],64)}const $=i(k,[["render",V]]),A={__name:"TagsView",setup(e){return(c,l)=>(s(),f($))}};export{A as default};