import{_ as p,o as a,c as r,d as s,b as m,p as b,f as y,w as F,x as P,l as h,t as d,z as L,e as u,j as q,F as z,y as E,T as G,r as _,N as O,a as Z,g as V,m as I,i as J}from"./main-cbc273cc.js";import{c as K,g as Q,d as X}from"./index.es6-593402c1.js";import{d as D}from"./dayjs.min-d6bc37a0.js";import{H as ss}from"./htmldiff.min-310ee87f.js";import{u as es}from"./ShowSkillStore-14b96d94.js";const ts={props:["showConfirmModal","closeModal","openCommentModal"]},x=e=>(b("data-v-b82f25f3"),e=e(),y(),e),is={key:0,class:"modal"},os={class:"modal-content asking-modal"},ns=x(()=>s("div",{class:"d-flex gap-4"},[s("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",fill:"grey",width:"45",height:"45"},[s("path",{d:"M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"})]),s("p",null," Are you sure you want to revert the skill to this version? ")],-1)),ls={class:"d-flex justify-content-lg-between justify-content-md-end justify-content-between gap-2"},as=x(()=>s("span",{class:"d-none d-md-block"}," No ",-1)),rs=x(()=>s("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",width:"18",height:"18",fill:"white",class:"d-md-none"},[s("path",{d:"M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"})],-1)),cs=[as,rs],ds=x(()=>s("span",{class:"d-none d-md-block"}," Yes ",-1)),hs=x(()=>s("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",width:"18",height:"18",fill:"white",class:"d-md-none"},[s("path",{d:"M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"})],-1)),ms=[ds,hs];function _s(e,o,n,c,i,t){return n.showConfirmModal?(a(),r("div",is,[s("div",os,[ns,s("div",ls,[s("button",{type:"button",class:"btn red-btn",onClick:o[0]||(o[0]=(...l)=>n.closeModal&&n.closeModal(...l))},cs),s("button",{type:"button",class:"btn green-btn",onClick:o[1]||(o[1]=(...l)=>n.openCommentModal&&n.openCommentModal(...l))},ms)])])])):m("",!0)}const us=p(ts,[["render",_s],["__scopeId","data-v-b82f25f3"]]);const vs={props:["showCommentModal","closeModal","revert"],data(){return{revertComment:""}}},C=e=>(b("data-v-5b10b579"),e=e(),y(),e),ps={key:0,id:"myModal",class:"modal"},fs={class:"modal-content"},gs={class:"d-flex flex-column"},ws=C(()=>s("div",{class:"pb-3"},"Please add a comment to explain.",-1)),ks={class:"d-flex justify-content-lg-between justify-content-md-end justify-content-between gap-2 mt-2"},bs=C(()=>s("span",{class:"d-none d-md-block"}," Cancel ",-1)),ys=C(()=>s("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",width:"18",height:"18",fill:"white",class:"d-md-none"},[s("path",{d:"M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"})],-1)),Ds=[bs,ys],Ms=C(()=>s("span",{class:"d-none d-md-block"}," Submit ",-1)),xs=C(()=>s("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",width:"18",height:"18",fill:"white",class:"d-md-none"},[s("path",{d:"M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"})],-1)),Cs=[Ms,xs];function Rs(e,o,n,c,i,t){return n.showCommentModal?(a(),r("div",ps,[s("div",fs,[s("div",gs,[ws,F(s("textarea",{class:"revert-comment",rows:"5",cols:"33",autofocus:"","onUpdate:modelValue":o[0]||(o[0]=l=>e.$parent.revertComment=l)},`\r
                `,512),[[P,e.$parent.revertComment]])]),s("div",ks,[s("button",{type:"button",class:"btn red-btn modal-btn",onClick:o[1]||(o[1]=(...l)=>n.closeModal&&n.closeModal(...l))},Ds),s("button",{type:"button",class:"btn green-btn modal-btn",onClick:o[2]||(o[2]=l=>n.revert(i.revertComment))},Cs)])])])):m("",!0)}const Ss=p(vs,[["render",Rs],["__scopeId","data-v-5b10b579"]]);var Y={exports:{}};(function(e,o){(function(n,c){e.exports=c()})(K,function(){var n={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"};return function(c,i,t){var l=i.prototype,w=l.format;t.en.formats=n,l.format=function(v){v===void 0&&(v="YYYY-MM-DDTHH:mm:ssZ");var k=this.$locale().formats,S=function(W,H){return W.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,function(Kt,U,R){var j=R&&R.toUpperCase();return U||H[R]||n[R]||H[j].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,function(Qt,B,A){return B||A.slice(1)})})}(v,k===void 0?{}:k);return w.call(this,S)}}})})(Y);var Ls=Y.exports;const $=Q(Ls);const $s={data(){return{showDropDown:!1}},props:["skillRevisionHistory","currentShowingVersion","updateCompareWithRevision","compareWithRevision"],methods:{formatDate(e){return D.extend($),D(e).format("lll")},formatDatePhone(e){return D.extend($),D(e).format("LL")}},computed:{compareWithVersion(){return this.compareWithRevision?this.compareWithRevision:!1},skillRevisionHistoryMinusCurrentRevision(){let e=[];for(let o=0;o<this.skillRevisionHistory.length;o++)this.skillRevisionHistory[o].version_number!=this.currentShowingVersion&&e.push(this.skillRevisionHistory[o]);return e}}},N=e=>(b("data-v-ea7427ba"),e=e(),y(),e),Ws={class:"position-relative mb-4"},Hs={class:"d-flex"},zs={key:0},Vs={key:1},Is={class:"d-flex d-none d-md-block ms-1"},Ys={class:"revision-strong-text"},Ns={class:"revision-strong-text"},Ts={class:"revision-strong-text"},Us={class:"d-md-none"},js={class:"revision-strong-text"},Bs=N(()=>s("path",{d:"M14.2929 8.70711C14.9229 8.07714 14.4767 7 13.5858 7H6.41421C5.52331 7 5.07714 8.07714 5.70711 8.70711L9.29289 12.2929C9.68342 12.6834 10.3166 12.6834 10.7071 12.2929L14.2929 8.70711Z",fill:"#344054"},null,-1)),As=[Bs],Fs={key:0,class:"history-versions-dropdown"},Ps=["onClick"],qs={class:"d-none d-md-block"},Es={class:"revision-strong-text"},Gs={class:"revision-strong-text"},Os={class:"revision-strong-text"},Zs={class:"d-md-none"},Js={class:"revision-strong-text"},Ks={class:"revision-strong-text"},Qs={key:0,class:"version-badge ms-2"},Xs=N(()=>s("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",fill:"white",width:"20",height:"20",class:"hand-icon"},[s("path",{d:"M64 128l177.6 0c-1 5.2-1.6 10.5-1.6 16l0 16-32 0L64 160c-8.8 0-16-7.2-16-16s7.2-16 16-16zm224 16c0-17.7 14.3-32 32-32c0 0 0 0 0 0l24 0c66.3 0 120 53.7 120 120l0 48c0 52.5-33.7 97.1-80.7 113.4c.5-3.1 .7-6.2 .7-9.4c0-20-9.2-37.9-23.6-49.7c4.9-9 7.6-19.4 7.6-30.3c0-15.1-5.3-29-14-40c8.8-11 14-24.9 14-40l0-40c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-40 0-40zm32-80s0 0 0 0c-18 0-34.6 6-48 16L64 80C28.7 80 0 108.7 0 144s28.7 64 64 64l82 0c-1.3 5.1-2 10.5-2 16c0 25.3 14.7 47.2 36 57.6c-2.6 7-4 14.5-4 22.4c0 20 9.2 37.9 23.6 49.7c-4.9 9-7.6 19.4-7.6 30.3c0 35.3 28.7 64 64 64l64 0 24 0c92.8 0 168-75.2 168-168l0-48c0-92.8-75.2-168-168-168l-24 0zM256 400c-8.8 0-16-7.2-16-16s7.2-16 16-16l48 0 16 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-64 0zM240 224c0 5.5 .7 10.9 2 16l-2 0-32 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l32 0 0 16zm24 64l40 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-48 0-16 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l24 0z"})],-1));function se(e,o,n,c,i,t){return a(),r("div",Ws,[s("div",{class:L(["d-flex flex-column compare-dropdown-div",[i.showDropDown?"button-focus":"button-unfocus"]])},[s("button",{onClick:o[0]||(o[0]=l=>i.showDropDown=!i.showDropDown),class:"dropdown-btn"},[s("div",Hs,[h(" Compare with:  "),t.compareWithVersion?(a(),r("div",Vs,[s("div",Is,[h(" Version "),s("span",Ys,d(t.compareWithVersion.version_number),1),h(", edit date: "),s("span",Ns,d(t.formatDate(t.compareWithVersion.edited_date)),1),h(", by "),s("span",Ts,d(t.compareWithVersion.user_name),1)]),s("div",Us,[h(" Version: "),s("span",js,d(t.compareWithVersion.version_number),1)])])):(a(),r("div",zs,"none"))]),(a(),r("svg",{class:L({"expand-arrow":i.showDropDown,"minimize-arrow":!i.showDropDown}),width:"20",height:"20",viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg"},As,2))]),u(G,{name:"dropdown"},{default:q(()=>[i.showDropDown?(a(),r("div",Fs,[(a(!0),r(z,null,E(t.skillRevisionHistoryMinusCurrentRevision,l=>(a(),r("div",{class:"revision-row d-flex flex-column flex-lg-row align-items-lg-center align-items-start justify-content-start",onClick:w=>{n.updateCompareWithRevision(l),i.showDropDown=!1}},[s("div",qs,[h(" Version: "),s("span",Es,d(l.version_number),1),h(", edit date: "),s("span",Gs,d(t.formatDate(l.edited_date)),1),h(", by "),s("span",Os,d(l.user_name),1)]),s("div",Zs,[h(" Version: "),s("span",Js,d(l.version_number),1),h(" , edit date: "),s("span",Ks,d(t.formatDatePhone(l.edited_date)),1)]),l.version_number===n.currentShowingVersion?(a(),r("div",Qs,[Xs,h(" You are in this version ")])):m("",!0)],8,Ps))),256)),s("div",{class:"revision-row",onClick:o[1]||(o[1]=l=>{n.updateCompareWithRevision(null),i.showDropDown=!1})}," None ")])):m("",!0)]),_:1})],2)])}const T=p($s,[["render",se],["__scopeId","data-v-ea7427ba"]]);const ee={setup(){},data(){return{addCount:0,removeCount:0,innerHtmlDisplay:""}},props:["diffString"],async created(){this.diffString&&(this.innerHtmlDisplay='<div class="inner-div">',this.diffString.forEach((e,o)=>{e.added&&!e.removed&&(this.innerHtmlDisplay=this.innerHtmlDisplay+`<span class="add">${e.value}</span>`),!e.added&&e.removed&&(this.innerHtmlDisplay=this.innerHtmlDisplay+`<span class="remove">${e.value}</span>`),!e.added&&!e.removed&&(this.innerHtmlDisplay=this.innerHtmlDisplay+e.value),o===this.diffString.length&&(this.innerHtmlDisplay=this.innerHtmlDisplay+"</div>")}))},methods:{}},te={class:"d-flex flex-row align-items-center flex-wrap"},ie=["innerHTML"];function oe(e,o,n,c,i,t){return a(),r("div",te,[s("div",{innerHTML:i.innerHtmlDisplay},null,8,ie)])}const ne=p(ee,[["render",oe],["__scopeId","data-v-ac01d899"]]);const le={props:["viewingRevision","compareWithRevision","skillRevisionHistory","updateCompareWithRevision"],components:{CompareString:ne,CompareWithDropdown:T},computed:{compareData(){if(!this.compareWithRevision)return;const e=ss.execute(this.viewingRevision.mastery_requirements,this.compareWithRevision.mastery_requirements),o=X(this.viewingRevision.name,this.compareWithRevision.name);return{masteryDiff:e,nameDiff:o,skillData:this.compareWithRevision,currentViewingRevision:this.viewingRevision}}},methods:{formatDate(e){return D.extend($),D(e).format("lll")}}},f=e=>(b("data-v-2b5d3b00"),e=e(),y(),e),ae={class:"container mt-3"},re={id:"skill-info-container"},ce={class:"d-flex justify-content-between"},de={class:"skill-name"},he={class:"revision-version"},me=f(()=>s("hr",{class:"border border-2 opacity-100 hr"},null,-1)),_e={class:"d-flex flex-column"},ue={class:"alert alert-warning d-flex gap-2 align-items-center",role:"alert"},ve={class:"d-flex flex-column ms-2"},pe=f(()=>s("strong",null,"You are comparing:",-1)),fe={class:"warning-date"},ge=f(()=>s("strong",null,"with:",-1)),we={class:"warning-date"},ke=f(()=>s("div",{class:"space-between"},null,-1)),be=f(()=>s("hr",{class:"border border-1 opacity-100 hr"},null,-1)),ye={class:"d-flex flex-column-reverse flex-md-row gap-4"},De={class:"mastery-requirements"},Me=["innerHTML"],xe={class:"col-md-4 order-1 order-md-2"},Ce={class:"info-box p-2 mb-2"},Re={key:0},Se=["href"],Le=["src"],$e={key:2,class:"d-flex flex-column align-items-center"},We={class:"no-image-warn"},He=f(()=>s("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",width:"80",height:"80"},[s("path",{d:"M448 80c8.8 0 16 7.2 16 16l0 319.8-5-6.5-136-176c-4.5-5.9-11.6-9.3-19-9.3s-14.4 3.4-19 9.3L202 340.7l-30.5-42.7C167 291.7 159.8 288 152 288s-15 3.7-19.5 10.1l-80 112L48 416.3l0-.3L48 96c0-8.8 7.2-16 16-16l384 0zM64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zm80 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"})],-1)),ze={class:"mt-3",style:{color:"#a48be6"}},Ve=f(()=>s("h2",{class:"h4 title"},"Level",-1)),Ie={key:0},Ye={key:1},Ne={key:2},Te={key:3},Ue={key:4},je=f(()=>s("p",null," ",-1));function Be(e,o,n,c,i,t){var v;const l=_("CompareString"),w=_("CompareWithDropdown");return a(),r("div",ae,[s("div",re,[s("div",ce,[s("h1",de,[u(l,{diffString:t.compareData.nameDiff},null,8,["diffString"]),s("span",he,"(Ver: "+d(t.compareData.skillData.version_number)+")",1)])]),me,s("div",_e,[s("div",ue,[s("div",ve,[s("p",null,[pe,s("span",null,[h(" Revision "+d(t.compareData.currentViewingRevision.version_number)+" edited by ",1),s("em",null,d(t.compareData.currentViewingRevision.userName),1),h(" on "),s("span",fe,d(t.formatDate(t.compareData.currentViewingRevision.edited_date)),1)])]),s("p",null,[ge,s("span",null,[h(" Revision "+d(t.compareData.skillData.version_number)+" edited by ",1),s("em",null,d(t.compareData.skillData.user_name),1),h(" on "),s("span",we,d(t.formatDate((v=t.compareData.skillData)==null?void 0:v.edited_date)),1)])])])]),u(w,{skillRevisionHistory:n.skillRevisionHistory,currentShowingVersion:t.compareData.skillData.version_number,updateCompareWithRevision:n.updateCompareWithRevision,compareWithRevision:n.compareWithRevision},null,8,["skillRevisionHistory","currentShowingVersion","updateCompareWithRevision","compareWithRevision"])]),ke,be,s("div",ye,[s("div",De,[s("div",{innerHTML:t.compareData.masteryDiff},null,8,Me)]),s("div",xe,[s("div",Ce,[t.compareData.skillData.icon_image?(a(),r("div",Re," Icon Image Of Version "+d(t.compareData.skillData.version_number),1)):m("",!0),t.compareData.skillData.icon_image?(a(),r("a",{key:1,href:"https://institute-skill-infobox-images.s3.amazonaws.com/"+t.compareData.skillData.icon_image},[s("img",{src:"https://institute-skill-infobox-image-thumbnails.s3.amazonaws.com/"+t.compareData.skillData.icon_image,onError:o[0]||(o[0]=(...k)=>e.imageUrlAlternative&&e.imageUrlAlternative(...k)),class:"rounded img-fluid"},null,40,Le)],8,Se)):(a(),r("div",$e,[s("div",We," Version "+d(t.compareData.skillData.version_number)+" Does Not Change Icon Image. ",1),He])),s("div",ze,[Ve,t.compareData.skillData.level=="grade_school"?(a(),r("span",Ie,"Grade School")):t.compareData.skillData.level=="middle_school"?(a(),r("span",Ye,"Middle School")):t.compareData.skillData.level=="high_school"?(a(),r("span",Ne,"High School")):t.compareData.skillData.level=="college"?(a(),r("span",Te,"College")):t.compareData.skillData.level=="phd"?(a(),r("span",Ue,"PHD")):m("",!0)])])])])]),s("button",{class:"btn primary-btn mt-4",onClick:o[1]||(o[1]=k=>n.updateCompareWithRevision(null))},[s("div",null," Go back to version "+d(t.compareData.currentViewingRevision.version_number),1)]),je])}const Ae=p(le,[["render",Be],["__scopeId","data-v-2b5d3b00"]]);const Fe={props:["loadingStatus","showLoadingModal","skillUrl","closeModal"],components:{LoadingSpinner:O},computed:{revertResult(){switch(this.loadingStatus){case"fails":return"fails";case"success":return setTimeout(()=>{this.$router.push("/skills/"+this.skillUrl)},2500),"success";default:return"waiting"}}}},M=e=>(b("data-v-cdb2413b"),e=e(),y(),e),Pe={key:0,class:"modal"},qe={key:0,class:"d-flex flex-column gap-4 align-items-center"},Ee=M(()=>s("p",null,"Please wait",-1)),Ge={key:1,class:"d-flex flex-column"},Oe=M(()=>s("div",{class:"d-flex success-text align-items-center"},[s("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",class:"me-1",height:"18",width:"18",fill:"#16a34a"},[s("path",{d:"M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"})]),h(" Revert Success ")],-1)),Ze=M(()=>s("div",null,"You will go back to skill forum soon.",-1)),Je=[Oe,Ze],Ke={key:2,class:"d-flex flex-column"},Qe=M(()=>s("div",{class:"d-flex fails-text align-items-center"},[s("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",class:"me-1",width:"16",height:"16",fill:"#dc2626"},[s("path",{d:"M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"})]),h(" Revert Fails! ")],-1)),Xe=M(()=>s("div",null,"Some thing went wrong !!",-1)),st=M(()=>s("span",{class:"d-none d-md-block"}," Ok ",-1)),et=[st];function tt(e,o,n,c,i,t){const l=_("LoadingSpinner");return n.showLoadingModal?(a(),r("div",Pe,[s("div",{class:L(["modal-content loading-modal",{"success-modal":t.revertResult==="success"}])},[t.revertResult==="waiting"?(a(),r("div",qe,[u(l),Ee])):m("",!0),t.revertResult==="success"?(a(),r("div",Ge,Je)):m("",!0),t.revertResult==="fails"?(a(),r("div",Ke,[Qe,Xe,s("button",{type:"button",class:"btn green-btn modal-btn mx-auto mt-2",onClick:o[0]||(o[0]=w=>n.closeModal())},et)])):m("",!0)],2)])):m("",!0)}const it=p(Fe,[["render",tt],["__scopeId","data-v-cdb2413b"]]);const ot={setup(){const e=Z(),o=V(),n=I(),c=es();return{userDetailsStore:e,skillsStore:o,usersStore:n,showSkillStore:c}},data(){return{skillUrl:this.$route.params.skillUrl,versionNumber:this.$route.params.versionNumber,skillRevision:{},skillRevisionHistory:[],currentVersionNumber:null,isCurrentVersion:!1,showConfirmModal:!1,showCommentModal:!1,showLoadingModal:!1,skill:{},compareWithRevision:null,currentCompareWithRevision:null,loadingStatus:""}},components:{ConfirmModal:us,CommentModal:Ss,CompareWithDropdown:T,CompareWithContent:Ae,LoadingModal:it},async mounted(){this.skillsStore.skillsList.length==0&&await this.skillsStore.getSkillsList(),this.usersStore.usersIncludingDeleted.length==0&&await this.usersStore.getUsersIncludingDeleted(),await this.getSkill(),await this.getSkillRevisionHistory()},methods:{async getSkill(){const e=await fetch("/skills/url/"+this.skillUrl);this.skill=await e.json(),this.currentVersionNumber=this.skill.version_number,await this.getSkillVersion()},async getSkillVersion(){let e="/skill-history/"+this.skill.id+"/"+this.versionNumber;const o=await fetch(e);this.skillRevision=await o.json(),this.skillRevision.version_number==this.currentVersionNumber&&(this.isCurrentVersion=!0);for(let l=0;l<this.skillsStore.skillsList.length;l++)this.skillsStore.skillsList[l].id==this.skillRevision.parent&&(this.skillRevision.parentName=this.skillsStore.skillsList[l].name);for(let l=0;l<this.usersStore.usersIncludingDeleted.length;l++)this.usersStore.usersIncludingDeleted[l].id==this.skillRevision.user_id&&(this.skillRevision.userName=this.usersStore.usersIncludingDeleted[l].username);var n=this.skillRevision.edited_date.replace("T"," ");n=n.replace("Z"," ");let c=n.split(/[- :]/);var i=new Date(Date.UTC(c[0],c[1]-1,c[2],c[3],c[4],c[5])),t={weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"numeric",minute:"numeric"};this.skillRevision.date=i.toLocaleDateString("en-US",t)},async getSkillRevisionHistory(){const e="/skill-history/"+this.skill.id+"/list",n=await(await fetch(e)).json();this.skillRevisionHistory=n.map(c=>{const i=this.usersStore.usersIncludingDeleted.find(t=>t.id===c.user_id);return{...c,user_name:i.username}})},confirmRevert(){this.showConfirmModal=!0},closeModal(){this.showConfirmModal=!1,this.showCommentModal=!1},openCommentModal(){this.closeModal(),this.showCommentModal=!0},revert(e){this.showCommentModal=!1,this.showLoadingModal=!0;const o={method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({comment:e})};var n="/skill-history/"+this.skill.id+"/revert-to/"+this.versionNumber;fetch(n,o).then(async c=>{if(!c.ok){this.loadingStatus="fails";return}this.loadingStatus="success",await this.showSkillStore.findSkill(this.skillUrl)})},closeModal(){this.showCommentModal=!1,this.showConfirmModal=!1,this.showLoadingModal=!1},updateCompareWithRevision(e){(e==null?void 0:e.version_number)!==this.skillRevision.version_number&&(this.compareWithRevision=e)},imageUrlAlternative(e){e.target.src="/images/skill-avatar/recurso.png"}}},g=e=>(b("data-v-b4866619"),e=e(),y(),e),nt={class:"d-flex"},lt={key:0,class:"mt-3"},at={id:"skill-info-container"},rt={class:"d-flex justify-content-between"},ct={class:"skill-name"},dt={class:"revision-version"},ht=g(()=>s("hr",{class:"border border-2 opacity-100 hr"},null,-1)),mt={class:"d-flex flex-column"},_t={class:"alert alert-warning d-flex",role:"alert"},ut=g(()=>s("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",width:"20",height:"20"},[s("path",{d:"M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480L40 480c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24l0 112c0 13.3 10.7 24 24 24s24-10.7 24-24l0-112c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"})],-1)),vt={key:0,class:"ms-2"},pt={class:"warning-date"},ft={key:1,class:"ms-2"},gt={class:"warning-date"},wt=g(()=>s("hr",{class:"border border-1 opacity-100 hr mt-md-4 mt-5"},null,-1)),kt={class:"d-flex flex-column-reverse flex-md-row gap-4"},bt={class:"d-flex flex-column"},yt={class:"mastery-requirements"},Dt=["innerHTML"],Mt={class:"col-md-4 order-1 order-md-2"},xt={class:"info-box p-2 mb-2"},Ct=["href"],Rt=["src"],St={key:1,class:"d-flex flex-column align-items-center"},Lt={class:"no-image-warn"},$t=g(()=>s("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",width:"80",height:"80"},[s("path",{d:"M448 80c8.8 0 16 7.2 16 16l0 319.8-5-6.5-136-176c-4.5-5.9-11.6-9.3-19-9.3s-14.4 3.4-19 9.3L202 340.7l-30.5-42.7C167 291.7 159.8 288 152 288s-15 3.7-19.5 10.1l-80 112L48 416.3l0-.3L48 96c0-8.8 7.2-16 16-16l384 0zM64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zm80 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"})],-1)),Wt={class:"mt-2"},Ht=g(()=>s("h2",{class:"h4 title"},"Level",-1)),zt={key:0},Vt={key:1},It={key:2},Yt={key:3},Nt={key:4},Tt=g(()=>s("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",fill:"white",height:"25",width:"25",class:"me-2"},[s("path",{d:"M75 75L41 41C25.9 25.9 0 36.6 0 57.9L0 168c0 13.3 10.7 24 24 24l110.1 0c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24l0 104c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65 0-94.1c0-13.3-10.7-24-24-24z"})],-1)),Ut=g(()=>s("div",null,"Revert to this version",-1)),jt=[Tt,Ut],Bt=g(()=>s("p",null," ",-1));function At(e,o,n,c,i,t){const l=_("CompareWithDropdown"),w=_("CompareWithContent"),v=_("ConfirmModal"),k=_("CommentModal"),S=_("LoadingModal");return a(),r(z,null,[s("div",nt,[i.compareWithRevision?(a(),J(w,{key:1,skillRevisionHistory:i.skillRevisionHistory,viewingRevision:i.skillRevision,compareWithRevision:i.compareWithRevision,updateCompareWithRevision:t.updateCompareWithRevision},null,8,["skillRevisionHistory","viewingRevision","compareWithRevision","updateCompareWithRevision"])):(a(),r("div",lt,[s("div",at,[s("div",rt,[s("h1",ct,[h(d(i.skill.name)+" ",1),s("span",dt,"(revision "+d(i.skillRevision.version_number)+")",1)])]),ht,s("div",mt,[s("div",_t,[ut,i.isCurrentVersion?(a(),r("span",ft,[h(" This is the current revision of this skill, as edited by "+d(i.skillRevision.userName)+", at ",1),s("span",gt,d(i.skillRevision.date),1),h(". ")])):(a(),r("span",vt,[h(" This is an old revision of this skill, as edited by "+d(i.skillRevision.userName)+", at ",1),s("span",pt,d(i.skillRevision.date),1),h(". ")]))]),u(l,{skillRevisionHistory:i.skillRevisionHistory,currentShowingVersion:i.skillRevision.version_number,updateCompareWithRevision:t.updateCompareWithRevision,compareWithRevision:i.compareWithRevision},null,8,["skillRevisionHistory","currentShowingVersion","updateCompareWithRevision","compareWithRevision"])]),wt,s("div",kt,[s("div",bt,[s("div",yt,[s("div",{innerHTML:i.skillRevision.mastery_requirements},null,8,Dt)])]),s("div",Mt,[s("div",xt,[i.skillRevision.icon_image?(a(),r("a",{key:0,href:"https://institute-skill-infobox-images.s3.amazonaws.com/"+i.skillRevision.icon_image},[s("img",{src:"https://institute-skill-infobox-image-thumbnails.s3.amazonaws.com/"+i.skillRevision.icon_image,class:"rounded img-fluid"},null,8,Rt)],8,Ct)):(a(),r("div",St,[s("div",Lt," Version "+d(i.skillRevision.version_number)+" Does Not Change Icon Image. ",1),$t])),s("div",Wt,[Ht,i.skill.level=="grade_school"?(a(),r("span",zt,"Grade School")):i.skill.level=="middle_school"?(a(),r("span",Vt,"Middle School")):i.skill.level=="high_school"?(a(),r("span",It,"High School")):i.skill.level=="college"?(a(),r("span",Yt,"College")):i.skill.level=="phd"?(a(),r("span",Nt,"PHD")):m("",!0)])])])]),!i.isCurrentVersion&&(c.userDetailsStore.role=="admin"||c.userDetailsStore.role=="editor")?(a(),r("button",{key:0,class:"btn primary-btn mt-4",onClick:o[0]||(o[0]=W=>t.confirmRevert())},jt)):m("",!0),Bt])]))]),u(v,{showConfirmModal:i.showConfirmModal,closeModal:t.closeModal,openCommentModal:t.openCommentModal},null,8,["showConfirmModal","closeModal","openCommentModal"]),u(k,{showCommentModal:i.showCommentModal,closeModal:t.closeModal,revert:t.revert},null,8,["showCommentModal","closeModal","revert"]),u(S,{skillUrl:i.skillUrl,showLoadingModal:i.showLoadingModal,loadingStatus:i.loadingStatus,closeModal:t.closeModal},null,8,["skillUrl","showLoadingModal","loadingStatus","closeModal"])],64)}const Ft=p(ot,[["render",At],["__scopeId","data-v-b4866619"]]),Pt="/images/banners/institute-collins-2.png";const qt={setup(){const e=V(),o=I();return{skillsStore:e,userDetailsStore:o}},data(){return{skillId:this.$route.params.skillId,bannerImage:null}},async mounted(){this.skillsStore.skillsList.length==0&&await this.skillsStore.getSkillsList();for(let e=0;e<this.skillsStore.skillsList.length;e++)this.skillId==this.skillsStore.skillsList[e].id&&(this.bannerImage=this.skillsStore.skillsList[e].banner_image)},components:{ShowSkillRevision:Ft}},Et=e=>(b("data-v-d52c84f9"),e=e(),y(),e),Gt={class:"position-relative d-flex"},Ot={class:"container-lg container-fluid show-skill-ctnr"},Zt=Et(()=>s("div",{id:"banner"},[s("img",{src:Pt,class:"img-fluid"})],-1));function Jt(e,o,n,c,i,t){const l=_("ShowSkillRevision");return a(),r("div",Gt,[s("div",Ot,[u(l)]),Zt])}const oi=p(qt,[["render",Jt],["__scopeId","data-v-d52c84f9"]]);export{oi as default};