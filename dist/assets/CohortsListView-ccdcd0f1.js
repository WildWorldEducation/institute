import{F as I,u as L,C as D}from"./CohortView-f07671ed.js";import{_ as y,a as M,r as m,o as l,c as r,d as t,t as f,l as w,e as c,j as u,F as p,z as x,w as k,I as B,b as _,T as C,m as S,p as F,f as V,v as j}from"./main-f71fcfe1.js";const $={setup(){return{userDetailsStore:M()}},data(){return{showFilters:!1,showMembers:!1,students:[],unavailableStudents:[],members:[]}},async created(){await this.getMembers(),await this.getUnavailableStudents(),this.students.length==0&&await this.getStudents()},components:{FilterParent:I},props:{cohort:{type:Object,required:!0}},methods:{async getMembers(){fetch(`/cohorts/${this.cohort.id}/members`).then(e=>e.json()).then(e=>{this.members=e})},async getUnavailableStudents(){fetch(`/cohorts/unavailable/${this.cohort.id}/list`).then(e=>e.json()).then(e=>{this.unavailableStudents=e})},async getStudents(){fetch(`/instructor-students/${this.userDetailsStore.userId}/list`).then(e=>e.json()).then(e=>{this.students=e;for(let s=0;s<this.students.length;s++)this.students[s].isMember=this.members.some(a=>a.id===this.students[s].id),this.students[s].unavailable=this.unavailableStudents.some(a=>a.user_id===this.students[s].id)})},submit(){let e=0;this.updateCohortMembers(e)},async updateCohortMembers(e){const s={method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({studentId:this.students[e].id,isMember:this.students[e].isMember})};fetch(`/cohorts/edit/${this.cohort.id}`,s).then(()=>{e+1<this.students.length?this.updateCohortMembers(e+1):(alert("Cohort updated"),this.getMembers())})},async deleteCohort(){if(confirm("Are you sure you want to delete this cohort?"))if(this.members.length>0)alert("Please remove all members from this cohort before deleting it.");else{const e=await fetch(`/cohorts/${this.cohort.id}`,{method:"DELETE"});e.error&&console.error(e.error),this.$router.push("/cohorts")}}}},d=e=>(F("data-v-6cf8b34b"),e=e(),V(),e),z={id:"cohort-information",class:"container bg-light rounded p-4"},E={class:"d-flex flex-column"},P={class:"d-flex flex-row justify-content-between"},T=["title"],U={class:"d-flex mt-2"},N=d(()=>t("h2",{class:"secondary-heading h4"}," Available Students ",-1)),A=d(()=>t("path",{d:"M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"},null,-1)),O=[A],q=d(()=>t("p",null,[t("em",null,"Please note that a student can only be in one cohort.")],-1)),H={key:0},G={style:{"list-style":"none"}},J={class:"form-check"},Y={class:"control control-checkbox"},Z=["value","onUpdate:modelValue","disabled"],K=d(()=>t("div",{class:"control_indicator"},null,-1)),Q={class:"students"},R={class:"d-flex flex-column mt-4"},W={class:"d-flex flex-row justify-content-between"},X=["title"],tt={class:"d-flex"},et=d(()=>t("h2",{class:"secondary-heading h4"},"Filters",-1)),st=d(()=>t("path",{d:"M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"},null,-1)),ot=[st],nt={key:0},it={class:"btn-link-container"};function lt(e,s,a,g,n,i){const b=m("FilterParent"),h=m("router-link");return l(),r("div",z,[t("h2",null,f(a.cohort.name),1),t("div",null,[t("div",E,[t("div",P,[t("div",{class:"log-type",onClick:s[0]||(s[0]=o=>n.showMembers=!n.showMembers),"b-on-hover":"",title:n.showMembers?"collapse":"expand"},[t("div",U,[N,(l(),r("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 320 512",width:"22",height:"22",fill:"#667085",class:w([n.showMembers?"arrow-point-down mb-2":"arrow-point-up "])},O,2))]),q],8,T)])]),c(C,{name:"dropdown"},{default:u(()=>[n.showMembers?(l(),r("div",H,[t("ul",G,[(l(!0),r(p,null,x(n.students,o=>(l(),r("li",null,[t("div",J,[t("label",Y,[k(t("input",{type:"checkbox",value:o.id,"onUpdate:modelValue":v=>o.isMember=v,disabled:!!o.unavailable},null,8,Z),[[B,o.isMember]]),K]),t("span",Q,f(o.username),1)])]))),256))]),t("button",{class:"green-btn btn",onClick:s[1]||(s[1]=(...o)=>i.submit&&i.submit(...o))}," Submit ")])):_("",!0)]),_:1})]),t("div",R,[t("div",W,[t("div",{class:"log-type",onClick:s[2]||(s[2]=o=>n.showFilters=!n.showFilters),"b-on-hover":"",title:n.showFilters?"collapse":"expand"},[t("div",tt,[et,(l(),r("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 320 512",width:"22",height:"22",fill:"#667085",class:w([n.showFilters?"arrow-point-down mb-2":"arrow-point-up "])},ot,2))])],8,X)])]),c(C,{name:"dropdown"},{default:u(()=>[n.showFilters?(l(),r("div",nt,[c(b)])):_("",!0)]),_:1}),t("div",it,[c(h,{to:"/cohort/"+a.cohort.id,class:"btn primary-btn"},{default:u(()=>[S(" Go to Cohort ")]),_:1},8,["to"])])])}const rt=y($,[["render",lt],["__scopeId","data-v-6cf8b34b"]]);const at={setup(){const e=L(),s=M();return{cohortsStore:e,userDetailsStore:s}},components:{CohortView:D,CohortDetail:rt},data(){return{showInformationModal:!1,selectedCohortId:null,showDetails:!1}},async created(){await this.cohortsStore.getCohorts(this.userDetailsStore.userId),localStorage.getItem("hasVisited")||(this.showInformationModal=!0,localStorage.setItem("hasVisited","true"))},mounted(){document.getElementById("myModal").addEventListener("click",e=>{e.target.classList.contains("modal-content")||(this.showInformationModal=!1)}),document.getElementById("modal-content").addEventListener("click",function(e){e.stopPropagation()},!1)},computed:{getSelectedCohort(){return this.cohortsStore.cohorts.find(e=>e.id===this.selectedCohortId)}},methods:{toggleInformationModal(){this.showInformationModal=!this.showInformationModal},selectCohort(e){this.selectedCohortId!==e&&(this.selectedCohortId=e,this.showDetails=!0)},closeMobileDetail(){this.showDetails=!1}}},ct={class:"container-fluid mobile-container"},dt={class:"d-flex justify-content-between mb-2"},ht=t("svg",{width:"18",height:"18",viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg"},[t("path",{d:"M6.34811 20.0423L6.34811 13.6494L-0.0358702 13.6583C-0.320945 13.6579 -0.594203 13.5444 -0.795782 13.3428C-0.997361 13.1412 -1.11082 12.868 -1.11132 12.5829L-1.11729 7.41477C-1.1168 7.1297 -1.00334 6.85644 -0.801757 6.65486C-0.600179 6.45328 -0.326921 6.33982 -0.0418461 6.33933L6.3481 6.34231L6.3481 -0.0506238C6.34659 -0.193451 6.3736 -0.335145 6.42756 -0.467396C6.48152 -0.599646 6.56134 -0.719794 6.66234 -0.820794C6.76334 -0.921794 6.88349 -1.00161 7.01574 -1.05557C7.14799 -1.10953 7.28969 -1.13655 7.43251 -1.13503L12.5827 -1.12308C12.8678 -1.12259 13.141 -1.00913 13.3426 -0.807549C13.5442 -0.60597 13.6577 -0.332713 13.6582 -0.047637L13.6552 6.34231L20.0481 6.34231C20.3325 6.34248 20.6052 6.45552 20.8063 6.65661C21.0074 6.8577 21.1204 7.13039 21.1206 7.41477L21.1325 12.565C21.1324 12.8494 21.0193 13.122 20.8182 13.3231C20.6171 13.5242 20.3444 13.6373 20.0601 13.6374L13.6552 13.6494L13.6641 20.0334C13.6636 20.3184 13.5502 20.5917 13.3486 20.7933C13.147 20.9948 12.8738 21.1083 12.5887 21.1088L7.43252 21.1267C7.28969 21.1282 7.148 21.1012 7.01575 21.0473C6.88349 20.9933 6.76335 20.9135 6.66235 20.8125C6.56135 20.7115 6.48153 20.5913 6.42757 20.4591C6.37361 20.3268 6.34659 20.1851 6.34811 20.0423Z",fill:"white"})],-1),ut=t("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 192 512",width:"20",height:"20",fill:"white"},[t("path",{d:"M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 224 32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0 0-192-32 0c-17.7 0-32-14.3-32-32z"})],-1),mt=[ut],_t={class:"row gx-1"},bt={class:"col-lg-3 col-md-4"},ft=["onClick"],wt={class:"col-lg-9 col-md-8 d-none d-md-block"},pt={key:0},gt={key:0,class:"col-md-8 d-block d-md-none modal"},vt={class:"modal-content contact-modal-content",id:"cohort-details-container"},Ct=t("span",{"aria-hidden":"true"},[t("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 384 512",width:"25",height:"25"},[t("path",{d:"M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z",fill:"black"})])],-1),yt=[Ct],Mt={id:"myModal",class:"modal"},xt={id:"modal-content",class:"modal-content contact-modal-content"},kt=t("span",{"aria-hidden":"true"},[t("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 384 512",width:"25",height:"25"},[t("path",{d:"M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z",fill:"black"})])],-1),St=[kt],It=t("section",null,[t("p",null," Cohorts allow you, as an instructor, to present the same filtered version of a skill tree to a selective group of handpicked students. For example, if you are guiding students through a math class, each student can create a math-specific account and you can add those accounts to your math class cohort, updating the nodes as your instruction progresses. "),t("p",null," To leverage this feature, create a cohort, add relevant students, and filter the tree they are to see as desired. You can update the filtered skill tree nodes in your cohort, plus the cohort's members, whenever you please. "),t("p",null," Before adding a student to your cohort, make sure they are in no other cohorts; students can only be in one cohort at a time. ")],-1);function Lt(e,s,a,g,n,i){const b=m("router-link"),h=m("CohortDetail");return l(),r(p,null,[t("div",ct,[t("div",dt,[c(b,{class:"btn primary-btn",to:"/cohorts/add"},{default:u(()=>[S("Add  "),ht]),_:1}),t("button",{class:"btn primary-btn me-1",onClick:s[0]||(s[0]=(...o)=>i.toggleInformationModal&&i.toggleInformationModal(...o))},mt)]),t("div",_t,[t("div",bt,[(l(!0),r(p,null,x(g.cohortsStore.cohorts,o=>(l(),r("button",{key:o.id,class:w([o.id===n.selectedCohortId?"isCurrentlySelected":"cohort-buttons","mb-1"]),onClick:v=>i.selectCohort(o.id)},f(o.name),11,ft))),128))]),t("div",wt,[n.selectedCohortId?(l(),r("div",pt,[t("div",null,[c(h,{cohort:i.getSelectedCohort},null,8,["cohort"])])])):_("",!0)]),n.showDetails?(l(),r("div",gt,[t("div",vt,[t("button",{type:"button",onClick:s[1]||(s[1]=(...o)=>i.closeMobileDetail&&i.closeMobileDetail(...o)),class:"close closeBtn","aria-label":"Close"},yt),c(h,{cohort:i.getSelectedCohort},null,8,["cohort"])])])):_("",!0)])]),k(t("div",null,[t("div",Mt,[t("div",xt,[t("button",{type:"button",onClick:s[2]||(s[2]=(...o)=>i.toggleInformationModal&&i.toggleInformationModal(...o)),class:"close closeBtn","aria-label":"Close"},St),It])])],512),[[j,n.showInformationModal]])],64)}const Ft=y(at,[["render",Lt]]);export{Ft as default};