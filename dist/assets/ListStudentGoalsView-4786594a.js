import{_ as g,H as w,q as p,o,c as i,d as e,t as h,F as d,z as _,m,l as v,b as S}from"./main-711259c2.js";const f={setup(){const s=w(),l=p();return{userSkillsStore:s,usersStore:l}},data(){return{studentId:this.$route.params.studentId,studentName:"",goals:[]}},async created(){this.usersStore.users.length==0&&await this.usersStore.getUsers();for(let s=0;s<this.usersStore.users.length;s++)if(this.usersStore.users[s].id==this.studentId){this.studentName=this.usersStore.users[s].username;break}await this.userSkillsStore.getFilteredUnnestedList(this.studentId),await this.getGoals()},methods:{async getGoals(){const s=await fetch("/goals/"+this.studentId+"/list");this.goals=await s.json();for(let l=0;l<this.goals.length;l++)await this.getGoalSteps(this.goals[l]);this.prepareGoals()},async getGoalSteps(s){const l=await fetch("/goals/"+s.id+"/goal-steps/list");s.steps=await l.json()},prepareGoals(){for(let s=0;s<this.goals.length;s++){let l=this.userSkillsStore.filteredUnnestedList.find(t=>t.id===this.goals[s].skill_id);this.goals[s].name=l.name,this.goals[s].level=l.level,this.goals[s].showSteps=!1;for(let t=0;t<this.goals[s].steps.length;t++){let r=this.userSkillsStore.filteredUnnestedList.find(c=>c.id==this.goals[s].steps[t].skill_id);this.goals[s].steps[t].name=r.name,this.goals[s].steps[t].level=r.level,this.goals[s].steps[t].url=r.url,this.goals[s].steps[t].isMastered=r.is_mastered}}},async deleteGoal(s){if(confirm("Are you sure you want to delete this goal?")==!0){const t=await fetch("/goals/"+s,{method:"DELETE"});t.error&&console.log(t.error),await this.getGoals()}}}},k={class:"container p-3 bg-light rounded"},L={class:"heading"},y={id:"goal-list"},x={class:"d-flex"},G={class:"goal secondary-heading h4"},z=["onClick"],M={key:0,width:"18",height:"18",class:"primary-icon",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 448 512"},C=e("path",{d:"M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"},null,-1),b=[C],V={key:1,width:"18",height:"18",class:"primary-icon",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 448 512"},B=e("path",{d:"M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"},null,-1),N=[B],U=["onClick"],j=e("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 448 512",width:"18",height:"18",class:"primary-icon"},[e("path",{d:"M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"})],-1),H=[j],I={key:0},E={key:0,xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 448 512",class:"primary-icon",width:"20",height:"20"},$=e("path",{d:"M384 80c8.8 0 16 7.2 16 16l0 320c0 8.8-7.2 16-16 16L64 432c-8.8 0-16-7.2-16-16L48 96c0-8.8 7.2-16 16-16l320 0zM64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32z"},null,-1),F=[$],D={key:1,xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 448 512",class:"primary-icon",width:"20",height:"20"},O=e("path",{d:"M64 80c-8.8 0-16 7.2-16 16l0 320c0 8.8 7.2 16 16 16l320 0c8.8 0 16-7.2 16-16l0-320c0-8.8-7.2-16-16-16L64 80zM0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM337 209L209 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L303 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"},null,-1),T=[O];function q(s,l,t,r,c,u){return o(),i("div",k,[e("h1",L,h(c.studentName)+": Goal Progress",1),e("div",y,[(o(!0),i(d,null,_(c.goals,n=>(o(),i("div",null,[e("div",x,[e("h2",G,[m(h(n.name)+" ",1),e("button",{class:"btn",onClick:a=>n.showSteps=!n.showSteps},[n.showSteps?(o(),i("svg",V,N)):(o(),i("svg",M,b))],8,z),e("button",{class:"btn",onClick:a=>u.deleteGoal(n.id)},H,8,U)])]),n.showSteps?(o(),i("ul",I,[(o(!0),i(d,null,_(n.steps,a=>(o(),i("li",null,[a.isMastered!=1?(o(),i("svg",E,F)):(o(),i("svg",D,T)),e("span",{class:v(["rounded pe-2",{"grade-school":a.level=="grade_school","middle-school":a.level=="middle_school","high-school":a.level=="high_school",college:a.level=="college",phd:a.level=="phd"}])},"  "+h(a.name),3)]))),256))])):S("",!0)]))),256))])])}const P=g(f,[["render",q]]);export{P as default};