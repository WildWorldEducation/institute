import{_ as S,r as _,o as n,c as o,b as e,F as h,n as w,d as k,g as b,q as $,t as c,a as v,p as C,e as y,j as p,w as m,m as f,i as M,s as Q,f as g}from"./main-60221089.js";import{u as j}from"./AssessmentsStore-4adcd4f8.js";import{u as D}from"./InstructorStudentsStore-d29f7c25.js";import{u as q}from"./StudentMCQuestionsStore-f10d3045.js";import{_ as A}from"./general-banner-1c13aca4.js";const P={data(){return{userSkills:[],noSkills:!0}},props:["userId"],async created(){const s=await fetch("/user-skills/unnested-list/"+this.userId);this.userSkills=await s.json()},computed:{availableSkills(){const s=[];for(let t=0;t<this.userSkills.length;t++)this.userSkills[t].is_accessible==1&this.userSkills[t].is_mastered!=1&this.userSkills[t].type!="domain"&&s.push({name:this.userSkills[t].name,id:this.userSkills[t].id});return s.length>0&&(this.noSkills=!1),s}},methods:{}},L=s=>(C("data-v-b569c594"),s=s(),y(),s),T=L(()=>e("div",{class:"table-responsive"},null,-1)),B=L(()=>e("div",{id:"tile"},"Available Skills",-1)),O={id:"skill-list"},R={key:0,id:"no-skill-cell"};function F(s,t,u,l,i,a){const r=_("router-link");return n(),o(h,null,[T,B,e("div",O,[(n(!0),o(h,null,w(a.availableSkills,d=>(n(),o("div",null,[k(r,{class:"skill-link",to:`/skills/${d.id}`,target:"_blank"},{default:b(()=>[$(c(d.name),1)]),_:2},1032,["to"])]))),256)),i.noSkills?(n(),o("div",R)):v("",!0)])],64)}const H=S(P,[["render",F],["__scopeId","data-v-b569c594"]]);const J={data(){return{visitedSkills:[],noSkills:!0}},props:["userId"],async created(){const s=await fetch("/skills/last-visited/");this.visitedSkills=await s.json(),this.visitedSkills.length>0&&(this.noSkills=!1)}},N=s=>(C("data-v-9631d77b"),s=s(),y(),s),E=N(()=>e("div",{class:"table-responsive"},null,-1)),z=N(()=>e("div",{id:"tile"},"Last visited Skills",-1)),G={id:"skill-list"},K={key:0,id:"no-skill-cell"};function W(s,t,u,l,i,a){const r=_("router-link");return n(),o(h,null,[E,z,e("div",G,[(n(!0),o(h,null,w(i.visitedSkills,d=>(n(),o("div",null,[k(r,{class:"skill-link",to:`/skills/${d.id}`,target:"_blank"},{default:b(()=>[$(c(d.name),1)]),_:2},1032,["to"])]))),256)),i.noSkills?(n(),o("div",K)):v("",!0)])],64)}const X=S(J,[["render",W],["__scopeId","data-v-9631d77b"]]);const Y={setup(){const s=p();return s.getUserDetails(),{userDetailsStore:s}},data(){return{notifications:[]}},computed:{},async created(){await this.getNotifications()},methods:{getNotifications(){fetch("/notifications/list").then(function(s){return s.json()}).then(s=>this.notifications=s)},SaveChange(){const s={method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({notification1:this.notifications.notification_1,notification2:this.notifications.notification_2})};var t="/notifications/edit";fetch(t,s)}}},Z=s=>(C("data-v-1b87a8b3"),s=s(),y(),s),ss={class:"table table-bordered"},ts=Z(()=>e("thead",null,[e("tr",null,[e("th",{scope:"col"},"Notifications")])],-1)),es={key:0},ns={key:1},is={key:0},os={key:1};function rs(s,t,u,l,i,a){return n(),o("table",ss,[ts,e("tbody",null,[e("tr",null,[l.userDetailsStore.role!="admin"?(n(),o("td",es,c(i.notifications.notification_1),1)):(n(),o("td",ns,[m(e("textarea",{onChange:t[0]||(t[0]=r=>a.SaveChange()),"onUpdate:modelValue":t[1]||(t[1]=r=>i.notifications.notification_1=r),class:"form-control",rows:"3"},null,544),[[f,i.notifications.notification_1]])]))]),e("tr",null,[l.userDetailsStore.role!="admin"?(n(),o("td",is,c(i.notifications.notification_2),1)):(n(),o("td",os,[m(e("textarea",{onChange:t[2]||(t[2]=r=>a.SaveChange()),"onUpdate:modelValue":t[3]||(t[3]=r=>i.notifications.notification_2=r),class:"form-control",rows:"3"},null,544),[[f,i.notifications.notification_2]])]))])])])}const ls=S(Y,[["render",rs],["__scopeId","data-v-1b87a8b3"]]);const ds={setup(){const s=p();return s.getUserDetails(),{userDetailsStore:s}},data(){return{news:[]}},computed:{},async created(){await this.getNews()},methods:{getNews(){fetch("/news/list").then(function(s){return s.json()}).then(s=>this.news=s)},SaveChange(){const s={method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({news1:this.news.news_1,news2:this.news.news_2,news3:this.news.news_3,news4:this.news.news_4})};var t="/news/edit";fetch(t,s)}}},us=s=>(C("data-v-3fd6bf6b"),s=s(),y(),s),as={class:""},cs={class:"table table-bordered"},_s=us(()=>e("thead",null,[e("tr",null,[e("th",null,"News")])],-1)),hs={class:"row border"},Ss={id:"first-cell",class:"col-lg-3 border col-md-6 news-cell"},ms={key:0},fs={class:"col-lg-3 col-md-6 border news-cell"},ks={key:0},ps={class:"col-lg-3 col-md-6 border news-cell"},gs={key:0},vs={id:"last-cell",class:"col-lg-3 border col-md-6 news-cell"},ws={key:0};function bs(s,t,u,l,i,a){return n(),o("div",as,[e("table",cs,[_s,e("tbody",null,[e("tr",null,[e("div",hs,[e("div",Ss,[l.userDetailsStore.role!="admin"?(n(),o("p",ms,c(i.news.news_1),1)):m((n(),o("textarea",{key:1,onChange:t[0]||(t[0]=r=>a.SaveChange()),"onUpdate:modelValue":t[1]||(t[1]=r=>i.news.news_1=r),class:"form-control",rows:"3"},null,544)),[[f,i.news.news_1]])]),e("div",fs,[l.userDetailsStore.role!="admin"?(n(),o("p",ks,c(i.news.news_2),1)):m((n(),o("textarea",{key:1,onChange:t[2]||(t[2]=r=>a.SaveChange()),"onUpdate:modelValue":t[3]||(t[3]=r=>i.news.news_2=r),class:"form-control",rows:"3"},null,544)),[[f,i.news.news_2]])]),e("div",ps,[l.userDetailsStore.role!="admin"?(n(),o("p",gs,c(i.news.news_3),1)):m((n(),o("textarea",{key:1,onChange:t[4]||(t[4]=r=>a.SaveChange()),"onUpdate:modelValue":t[5]||(t[5]=r=>i.news.news_3=r),class:"form-control",rows:"3"},null,544)),[[f,i.news.news_3]])]),e("div",vs,[l.userDetailsStore.role!="admin"?(n(),o("p",ws,c(i.news.news_4),1)):m((n(),o("textarea",{key:1,onChange:t[6]||(t[6]=r=>a.SaveChange()),"onUpdate:modelValue":t[7]||(t[7]=r=>i.news.news_4=r),class:"form-control",rows:"3"},null,544)),[[f,i.news.news_4]])])])])])])])}const Cs=S(ds,[["render",bs],["__scopeId","data-v-3fd6bf6b"]]);const ys={setup(){const s=j(),t=M(),u=Q(),l=p(),i=D();return{usersStore:t,skillsStore:u,assessmentsStore:s,userDetailsStore:l,instructorStudentsStore:i}},data(){return{assessments:[],studentIds:[]}},async created(){await this.assessmentsStore.getAssessments(),this.instructorStudentsStore.instructorStudentsList.length==0&&await this.instructorStudentsStore.getInstructorStudentsList();for(let s=0;s<this.instructorStudentsStore.instructorStudentsList.length;s++)this.userDetailsStore.userId==this.instructorStudentsStore.instructorStudentsList[s].instructor_id&&this.studentIds.push(this.instructorStudentsStore.instructorStudentsList[s].student_id);for(let s=0;s<this.assessmentsStore.assessments.length;s++)for(let t=0;t<this.studentIds.length;t++)this.assessmentsStore.assessments[s].student_id==this.studentIds[t]&&this.assessments.push(this.assessmentsStore.assessments[s]);for(let s=0;s<this.assessments.length;s++){let t=new Date(this.assessments[s].date).toDateString();this.assessments[s].date=t}this.usersStore.users.length==0&&await this.usersStore.getUsers();for(let s=0;s<this.assessments.length;s++)for(let t=0;t<this.usersStore.users.length;t++)this.assessments[s].student_id==this.usersStore.users[t].id&&(this.assessments[s].studentUsername=this.usersStore.users[t].username);this.skillsStore.skillsList.length==0&&await this.skillsStore.getSkillsList();for(let s=0;s<this.assessments.length;s++)for(let t=0;t<this.skillsStore.skillsList.length;t++)this.assessments[s].skill_id==this.skillsStore.skillsList[t].id&&(this.assessments[s].skillName=this.skillsStore.skillsList[t].name)},computed:{},methods:{}},$s={class:"container-fluid"},Ms=e("div",{id:"question-header"},[e("div",{id:"assessment-tile"},"Assessments")],-1),Qs={id:"list-body"},Ds={class:"assessment"},Ls={id:"student-name"},Ns={id:"skill-name"},Is={id:"date"};function xs(s,t,u,l,i,a){const r=_("RouterLink");return n(),o("div",$s,[Ms,e("div",Qs,[(n(!0),o(h,null,w(this.assessments,d=>(n(),o("div",Ds,[k(r,{class:"assessment-link",to:"/mark-assessment/"+d.id},{default:b(()=>[e("span",Ls,c(d.studentUsername)+", ",1),e("span",Ns,c(d.skillName)+", ",1),e("span",Is,c(d.date),1)]),_:2},1032,["to"])]))),256))])])}const Us=S(ys,[["render",xs]]);const Vs={setup(){const s=q(),t=D(),u=M(),l=Q(),i=p();return{studentMCQuestionsStore:s,instructorStudentsStore:t,usersStore:u,skillsStore:l,userDetailsStore:i}},data(){return{questions:[]}},async created(){await this.studentMCQuestionsStore.getStudentMCQuestions(),this.usersStore.users.length==0&&await this.usersStore.getUsers();for(let s=0;s<this.studentMCQuestionsStore.studentMCQuestions.length;s++)for(let t=0;t<this.usersStore.users.length;t++)this.studentMCQuestionsStore.studentMCQuestions[s].student_id==this.usersStore.users[t].id&&(this.studentMCQuestionsStore.studentMCQuestions[s].studentName=this.usersStore.users[t].username);for(let s=0;s<this.studentMCQuestionsStore.studentMCQuestions.length;s++)typeof this.studentMCQuestionsStore.studentMCQuestions[s].studentName>"u"&&(this.studentMCQuestionsStore.studentMCQuestions[s].studentName="Deleted student");this.skillsStore.skillsList.length==0&&await this.skillsStore.getSkillsList();for(let s=0;s<this.studentMCQuestionsStore.studentMCQuestions.length;s++)for(let t=0;t<this.skillsStore.skillsList.length;t++)this.studentMCQuestionsStore.studentMCQuestions[s].skill_id==this.skillsStore.skillsList[t].id&&(this.studentMCQuestionsStore.studentMCQuestions[s].skillName=this.skillsStore.skillsList[t].name);if(this.userDetailsStore.role=="instructor"){this.instructorStudentsStore.instructorStudentsList.length==0&&await this.instructorStudentsStore.getInstructorStudentsList();let s=[];for(let t=0;t<this.instructorStudentsStore.instructorStudentsList.length;t++)this.$parent.userDetailsStore.userId==this.instructorStudentsStore.instructorStudentsList[t].instructor_id&&s.push(this.instructorStudentsStore.instructorStudentsList[t].student_id);for(let t=0;t<this.studentMCQuestionsStore.studentMCQuestions.length;t++)for(let u=0;u<s.length;u++)this.studentMCQuestionsStore.studentMCQuestions[t].student_id==s[u]&&this.questions.push(this.studentMCQuestionsStore.studentMCQuestions[t])}else this.questions=this.studentMCQuestionsStore.studentMCQuestions},computed:{},methods:{}},js={class:"container-fluid"},qs=e("div",{id:"question-header"},[e("div",{id:"assessment-tile"},"Student Questions")],-1),As={id:"list-body"},Ps={class:"assessment"};function Ts(s,t,u,l,i,a){const r=_("RouterLink");return n(),o("div",js,[qs,e("div",As,[(n(!0),o(h,null,w(this.questions,d=>(n(),o("div",Ps,[k(r,{to:"/check-student-question/"+d.id,class:"assessment-link"},{default:b(()=>[$(c(d.studentName)+", "+c(d.skillName),1)]),_:2},1032,["to"])]))),256))])])}const Bs=S(Vs,[["render",Ts]]),Os="/images/post-login.png";const Rs={setup(){const s=p();return s.getUserDetails(),{userDetailsStore:s}},data(){return{}},components:{News:Cs,Notifications:ls,StudentProgress:H,MarkAssessment:Us,CheckStudentQuestions:Bs,LastVisitedSkills:X},computed:{name(){return this.userDetailsStore.firstName+" "+this.userDetailsStore.lastName}},methods:{}},Fs=e("div",{id:"banner"},[e("img",{src:A,class:""})],-1),Hs={class:"container post-login-container min-vh-100"},Js={class:"row text-center text-md-start"},Es={id:"user-name"},zs={class:"row content-row"},Gs={class:"col-lg-4 col-md-5 mb-4 pb-4 column mx-0"},Ks=["src"],Ws={class:"col-lg-4 col-md-7 mb-4 pb-4"},Xs={class:"col-lg-4 col-md-7 mb-4 pb-4"},Ys={class:"col-lg-3 col-md-5 mb-4 pb-4 column"},Zs=e("div",{class:"col-lg-9 col-md-6 mb-4 pb-4 column d-none d-lg-block"},[e("img",{src:Os,class:"img-fluid"})],-1),st={id:"news-row",class:"row"};function tt(s,t,u,l,i,a){const r=_("StudentProgress"),d=_("MarkAssessment"),I=_("LastVisitedSkills"),x=_("CheckStudentQuestions"),U=_("Notifications"),V=_("News");return n(),o(h,null,[Fs,e("div",Hs,[e("div",Js,[e("h1",Es,c(a.name),1)]),e("div",zs,[e("div",Gs,[e("img",{id:"profile-img",src:l.userDetailsStore.avatar,class:"img-fluid rounded"},null,8,Ks)]),e("div",Ws,[l.userDetailsStore.role=="student"?(n(),g(r,{key:0,userId:l.userDetailsStore.userId},null,8,["userId"])):l.userDetailsStore.role=="instructor"?(n(),g(d,{key:1})):v("",!0)]),e("div",Xs,[l.userDetailsStore.role=="student"?(n(),g(I,{key:0,userId:l.userDetailsStore.userId},null,8,["userId"])):l.userDetailsStore.role=="instructor"||l.userDetailsStore.role=="admin"?(n(),g(x,{key:1})):v("",!0)]),e("div",Ys,[k(U)]),Zs]),e("div",st,[k(V)])])],64)}const lt=S(Rs,[["render",tt]]);export{lt as default};