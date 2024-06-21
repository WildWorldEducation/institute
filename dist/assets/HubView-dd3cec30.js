import{_ as S,i as _,o as i,c as r,d as e,F as f,l as v,a as p,w as C,m as $,t as c,b as w,p as y,f as b,g,e as h,v as m,n as M,q as Q,k}from"./main-5e6f8c53.js";import{u as U}from"./AssessmentsStore-0c874eb8.js";import{u as D}from"./InstructorStudentsStore-c4c5a0ee.js";import{u as V}from"./StudentMCQuestionsStore-a6e58ed5.js";import{_ as j}from"./general-banner-1c13aca4.js";const q={data(){return{userSkills:[],noSkills:!0}},props:["userId"],async created(){const s=await fetch("/user-skills/unnested-list/"+this.userId);this.userSkills=await s.json()},computed:{availableSkills(){const s=[];for(let t=0;t<this.userSkills.length;t++)this.userSkills[t].is_accessible==1&this.userSkills[t].is_mastered!=1&this.userSkills[t].type!="domain"&&s.push({name:this.userSkills[t].name,id:this.userSkills[t].id});return s.length>0&&(this.noSkills=!1),s}},methods:{}},N=s=>(y("data-v-8e8dc27a"),s=s(),b(),s),A=N(()=>e("div",{class:"table-responsive"},null,-1)),P=N(()=>e("div",{id:"tile"},"Available Skill",-1)),T={id:"skill-list"},B={key:0,id:"no-skill-cell"};function O(s,t,d,l,n,u){const o=_("router-link");return i(),r(f,null,[A,P,e("div",T,[(i(!0),r(f,null,v(u.availableSkills,a=>(i(),r("div",null,[p(o,{class:"skill-link",to:`/skills/${a.id}`,target:"_blank"},{default:C(()=>[$(c(a.name),1)]),_:2},1032,["to"])]))),256)),n.noSkills?(i(),r("div",B)):w("",!0)])],64)}const R=S(q,[["render",O],["__scopeId","data-v-8e8dc27a"]]);const F={setup(){const s=g();return s.getUserDetails(),{userDetailsStore:s}},data(){return{notifications:[]}},computed:{},async created(){await this.getNotifications()},methods:{getNotifications(){fetch("/notifications/list").then(function(s){return s.json()}).then(s=>this.notifications=s)},SaveChange(){const s={method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({notification1:this.notifications.notification_1,notification2:this.notifications.notification_2})};var t="/notifications/edit";fetch(t,s)}}},H=s=>(y("data-v-1b87a8b3"),s=s(),b(),s),J={class:"table table-bordered"},E=H(()=>e("thead",null,[e("tr",null,[e("th",{scope:"col"},"Notifications")])],-1)),z={key:0},G={key:1},K={key:0},W={key:1};function X(s,t,d,l,n,u){return i(),r("table",J,[E,e("tbody",null,[e("tr",null,[l.userDetailsStore.role!="admin"?(i(),r("td",z,c(n.notifications.notification_1),1)):(i(),r("td",G,[h(e("textarea",{onChange:t[0]||(t[0]=o=>u.SaveChange()),"onUpdate:modelValue":t[1]||(t[1]=o=>n.notifications.notification_1=o),class:"form-control",rows:"3"},null,544),[[m,n.notifications.notification_1]])]))]),e("tr",null,[l.userDetailsStore.role!="admin"?(i(),r("td",K,c(n.notifications.notification_2),1)):(i(),r("td",W,[h(e("textarea",{onChange:t[2]||(t[2]=o=>u.SaveChange()),"onUpdate:modelValue":t[3]||(t[3]=o=>n.notifications.notification_2=o),class:"form-control",rows:"3"},null,544),[[m,n.notifications.notification_2]])]))])])])}const Y=S(F,[["render",X],["__scopeId","data-v-1b87a8b3"]]);const Z={setup(){const s=g();return s.getUserDetails(),{userDetailsStore:s}},data(){return{news:[]}},computed:{},async created(){await this.getNews()},methods:{getNews(){fetch("/news/list").then(function(s){return s.json()}).then(s=>this.news=s)},SaveChange(){const s={method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({news1:this.news.news_1,news2:this.news.news_2,news3:this.news.news_3,news4:this.news.news_4})};var t="/news/edit";fetch(t,s)}}},ss=s=>(y("data-v-d23c56fb"),s=s(),b(),s),ts={class:"container"},es={class:"table table-bordered"},ns=ss(()=>e("thead",null,[e("tr",null,[e("th",null,"News")])],-1)),is={class:"row border"},os={id:"first-cell",class:"col-lg-3 border col-md-6 news-cell"},rs={key:0},ls={class:"col-lg-3 col-md-6 border news-cell"},ds={key:0},us={class:"col-lg-3 col-md-6 border news-cell"},as={key:0},cs={id:"last-cell",class:"col-lg-3 border col-md-6 news-cell"},_s={key:0};function hs(s,t,d,l,n,u){return i(),r("div",ts,[e("table",es,[ns,e("tbody",null,[e("tr",null,[e("div",is,[e("div",os,[l.userDetailsStore.role!="admin"?(i(),r("p",rs,c(n.news.news_1),1)):h((i(),r("textarea",{key:1,onChange:t[0]||(t[0]=o=>u.SaveChange()),"onUpdate:modelValue":t[1]||(t[1]=o=>n.news.news_1=o),class:"form-control",rows:"3"},null,544)),[[m,n.news.news_1]])]),e("div",ls,[l.userDetailsStore.role!="admin"?(i(),r("p",ds,c(n.news.news_2),1)):h((i(),r("textarea",{key:1,onChange:t[2]||(t[2]=o=>u.SaveChange()),"onUpdate:modelValue":t[3]||(t[3]=o=>n.news.news_2=o),class:"form-control",rows:"3"},null,544)),[[m,n.news.news_2]])]),e("div",us,[l.userDetailsStore.role!="admin"?(i(),r("p",as,c(n.news.news_3),1)):h((i(),r("textarea",{key:1,onChange:t[4]||(t[4]=o=>u.SaveChange()),"onUpdate:modelValue":t[5]||(t[5]=o=>n.news.news_3=o),class:"form-control",rows:"3"},null,544)),[[m,n.news.news_3]])]),e("div",cs,[l.userDetailsStore.role!="admin"?(i(),r("p",_s,c(n.news.news_4),1)):h((i(),r("textarea",{key:1,onChange:t[6]||(t[6]=o=>u.SaveChange()),"onUpdate:modelValue":t[7]||(t[7]=o=>n.news.news_4=o),class:"form-control",rows:"3"},null,544)),[[m,n.news.news_4]])])])])])])])}const ms=S(Z,[["render",hs],["__scopeId","data-v-d23c56fb"]]);const Ss={setup(){const s=U(),t=M(),d=Q(),l=g(),n=D();return{usersStore:t,skillsStore:d,assessmentsStore:s,userDetailsStore:l,instructorStudentsStore:n}},data(){return{assessments:[],studentIds:[]}},async created(){await this.assessmentsStore.getAssessments(),this.instructorStudentsStore.instructorStudentsList.length==0&&await this.instructorStudentsStore.getInstructorStudentsList();for(let s=0;s<this.instructorStudentsStore.instructorStudentsList.length;s++)this.userDetailsStore.userId==this.instructorStudentsStore.instructorStudentsList[s].instructor_id&&this.studentIds.push(this.instructorStudentsStore.instructorStudentsList[s].student_id);for(let s=0;s<this.assessmentsStore.assessments.length;s++)for(let t=0;t<this.studentIds.length;t++)this.assessmentsStore.assessments[s].student_id==this.studentIds[t]&&this.assessments.push(this.assessmentsStore.assessments[s]);for(let s=0;s<this.assessments.length;s++){let t=new Date(this.assessments[s].date).toDateString();this.assessments[s].date=t}this.usersStore.users.length==0&&await this.usersStore.getUsers();for(let s=0;s<this.assessments.length;s++)for(let t=0;t<this.usersStore.users.length;t++)this.assessments[s].student_id==this.usersStore.users[t].id&&(this.assessments[s].studentUsername=this.usersStore.users[t].username);this.skillsStore.skillsList.length==0&&await this.skillsStore.getSkillsList();for(let s=0;s<this.assessments.length;s++)for(let t=0;t<this.skillsStore.skillsList.length;t++)this.assessments[s].skill_id==this.skillsStore.skillsList[t].id&&(this.assessments[s].skillName=this.skillsStore.skillsList[t].name)},computed:{},methods:{}},fs={class:"container-fluid"},ps=e("div",{id:"question-header"},[e("div",{id:"assessment-tile"},"Assessments")],-1),gs={id:"list-body"},ks={class:"assessment"},ws={id:"student-name"},vs={id:"skill-name"},Cs={id:"date"};function ys(s,t,d,l,n,u){const o=_("RouterLink");return i(),r("div",fs,[ps,e("div",gs,[(i(!0),r(f,null,v(this.assessments,a=>(i(),r("div",ks,[p(o,{class:"assessment-link",to:"/mark-assessment/"+a.id},{default:C(()=>[e("span",ws,c(a.studentUsername)+", ",1),e("span",vs,c(a.skillName)+", ",1),e("span",Cs,c(a.date),1)]),_:2},1032,["to"])]))),256))])])}const bs=S(Ss,[["render",ys]]);const $s={setup(){const s=V(),t=D(),d=M(),l=Q(),n=g();return{studentMCQuestionsStore:s,instructorStudentsStore:t,usersStore:d,skillsStore:l,userDetailsStore:n}},data(){return{questions:[]}},async created(){await this.studentMCQuestionsStore.getStudentMCQuestions(),this.usersStore.users.length==0&&await this.usersStore.getUsers();for(let s=0;s<this.studentMCQuestionsStore.studentMCQuestions.length;s++)for(let t=0;t<this.usersStore.users.length;t++)this.studentMCQuestionsStore.studentMCQuestions[s].student_id==this.usersStore.users[t].id&&(this.studentMCQuestionsStore.studentMCQuestions[s].studentName=this.usersStore.users[t].username);for(let s=0;s<this.studentMCQuestionsStore.studentMCQuestions.length;s++)typeof this.studentMCQuestionsStore.studentMCQuestions[s].studentName>"u"&&(this.studentMCQuestionsStore.studentMCQuestions[s].studentName="Deleted student");this.skillsStore.skillsList.length==0&&await this.skillsStore.getSkillsList();for(let s=0;s<this.studentMCQuestionsStore.studentMCQuestions.length;s++)for(let t=0;t<this.skillsStore.skillsList.length;t++)this.studentMCQuestionsStore.studentMCQuestions[s].skill_id==this.skillsStore.skillsList[t].id&&(this.studentMCQuestionsStore.studentMCQuestions[s].skillName=this.skillsStore.skillsList[t].name);if(this.userDetailsStore.role=="instructor"){this.instructorStudentsStore.instructorStudentsList.length==0&&await this.instructorStudentsStore.getInstructorStudentsList();let s=[];for(let t=0;t<this.instructorStudentsStore.instructorStudentsList.length;t++)this.$parent.userDetailsStore.userId==this.instructorStudentsStore.instructorStudentsList[t].instructor_id&&s.push(this.instructorStudentsStore.instructorStudentsList[t].student_id);for(let t=0;t<this.studentMCQuestionsStore.studentMCQuestions.length;t++)for(let d=0;d<s.length;d++)this.studentMCQuestionsStore.studentMCQuestions[t].student_id==s[d]&&this.questions.push(this.studentMCQuestionsStore.studentMCQuestions[t])}else this.questions=this.studentMCQuestionsStore.studentMCQuestions},computed:{},methods:{}},Ms={class:"container-fluid"},Qs=e("div",{id:"question-header"},[e("div",{id:"assessment-tile"},"Student Questions")],-1),Ds={id:"list-body"},Ns={class:"assessment"};function xs(s,t,d,l,n,u){const o=_("RouterLink");return i(),r("div",Ms,[Qs,e("div",Ds,[(i(!0),r(f,null,v(this.questions,a=>(i(),r("div",Ns,[p(o,{to:"/check-student-question/"+a.id,class:"assessment-link"},{default:C(()=>[$(c(a.studentName)+", "+c(a.skillName),1)]),_:2},1032,["to"])]))),256))])])}const Ls=S($s,[["render",xs]]),Is="/images/post-login.png";const Us={setup(){const s=g();return s.getUserDetails(),{userDetailsStore:s}},data(){return{}},components:{News:ms,Notifications:Y,StudentProgress:R,MarkAssessment:bs,CheckStudentQuestions:Ls},computed:{name(){return this.userDetailsStore.firstName+" "+this.userDetailsStore.lastName}},methods:{}},Vs=e("div",{id:"banner"},[e("img",{src:j,class:""})],-1),js={class:"container post-login-container min-vh-100"},qs={class:"row text-center text-md-start"},As={id:"user-name"},Ps={class:"row content-row"},Ts={id:"profile-image-column",class:"column col-lg-4 col-md-6 mx-0"},Bs=["src"],Os={id:"middle-profile-column",class:"column col-lg-4 col-md-6 mb-5 mb-md-0"},Rs={class:"column col-lg-4 col-md-6"},Fs={id:"notif-col",class:"column col-lg-3 col-md-6"},Hs=e("div",{id:"sub-image",class:"column col-lg-9 col-md-6 d-none d-lg-block"},[e("img",{src:Is,class:"img-fluid"})],-1),Js={id:"news-row",class:"row"};function Es(s,t,d,l,n,u){const o=_("StudentProgress"),a=_("MarkAssessment"),x=_("CheckStudentQuestions"),L=_("Notifications"),I=_("News");return i(),r(f,null,[Vs,e("div",js,[e("div",qs,[e("h1",As,c(u.name),1)]),e("div",Ps,[e("div",Ts,[e("img",{id:"profile-img",src:l.userDetailsStore.avatar,class:"img-fluid"},null,8,Bs)]),e("div",Os,[l.userDetailsStore.role=="student"?(i(),k(o,{key:0,userId:l.userDetailsStore.userId},null,8,["userId"])):l.userDetailsStore.role=="instructor"?(i(),k(a,{key:1})):w("",!0)]),e("div",Rs,[l.userDetailsStore.role=="instructor"||l.userDetailsStore.role=="admin"?(i(),k(x,{key:0})):w("",!0)]),e("div",Fs,[p(L)]),Hs]),e("div",Js,[p(I)])])],64)}const Ys=S(Us,[["render",Es]]);export{Ys as default};