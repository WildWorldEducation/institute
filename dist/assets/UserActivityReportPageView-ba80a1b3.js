import{_ as S,g as M,r as f,o as l,c as n,d as e,F as v,k as g,s as d,t as a,i as p,b as r,l as b,m as k,e as m,x as N,T as $}from"./main-794a1e66.js";import{u as D,a as U,b as I}from"./EssayQuestionsStore-f07681b4.js";const Q={props:["userId"],setup(){const i=M(),t=D(),_=U(),h=I();return{skillsStore:i,resourcesStore:t,mcQuestionsStore:_,essayQuestionsStore:h}},data(){return{contentFlags:[],rows:[],currentChooseSkill:"",showActionWarnModal:!1,showSkillWarnModal:!1}},components:{},async created(){},async mounted(){await this.getContentFlagLogs(),this.contentFlags.forEach(i=>{const t=JSON.parse(i.content_obj),_=new Date(i.create_date),h=_.toLocaleString("en-gb",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),c={date:_.toLocaleTimeString()+` (${h})`,action:i.action,question:t.question,questionName:t.question_name,skillName:t.name,skillUrl:t.skill_url,id:i.id,skill_deleted:t.skill_deleted,is_deleted:i.is_deleted};switch(i.flag_type){case"mc_question":c.type="mc_question",c.questionId=t.question_id,c.skillId=t.skill_id,c.skillUrl=t.skill_url;break;case"resource":c.type="resource",c.skillId=t.skill_id,c.skillUrl=t.skill_url;break;case"skill":c.type="skill",c.skillId=t.skill_id,c.skillUrl=t.skill_url;break;case"essay_question":c.type="essay_question",c.skillId=t.skill_id,c.skillUrl=t.skill_url;break;case"image_question":c.type="image_question",c.questionId=t.question_id,c.skillId=t.skill_id,c.skillUrl=t.skill_url;break;default:c.type="delete";break}this.rows.push(c)})},methods:{async getContentFlagLogs(){const i=await fetch(`/user-actions/${this.userId}/flag`);this.contentFlags=await i.json()},actionColor(i){switch(i){case"create":return"create-action";case"update":return"update-action";default:return"delete-action"}},handleNoneLinkClick(i,t){i==="delete"?this.showActionWarnModal=!0:(this.showSkillWarnModal=!0,this.currentChooseSkill=t)}}},W={key:0,class:"container-md main-container"},j={class:"d-flex flex-column gap-3"},A={key:0},L={key:0},q=["onClick"],O={key:3,class:"text-danger"},T={key:1},R=["onClick"],B={key:2,class:"text-danger"},E={key:2},K=["onClick"],z={key:2,class:"text-danger"},V={key:3},H=["onClick"],J={key:2,class:"text-danger"},P={key:4},G=["onClick"],X={key:2,class:"text-danger"},Y={key:5},Z={key:0,class:"text-danger"},F={key:1,class:"shake"},ss={key:2},es={id:"myModal",class:"modal"},ts={class:"modal-content skill-modal"},os={class:"mb-4"},ls={class:"modal-label"},is={class:"skill-modal-text"},ns={class:"d-flex justify-content-center"},as=e("div",null,"OK",-1),cs=[as],ds={key:3},rs={id:"myModal",class:"modal"},_s={class:"modal-content skill-modal"},us={class:"mb-4"},ks={class:"modal-label"},hs={class:"skill-modal-text"},ms={class:"d-flex justify-content-center"},ps=e("div",null,"OK",-1),ws=[ps],fs={key:4},vs={id:"myModal",class:"modal"},ys={class:"modal-content"},bs=e("div",{class:"d-flex gap-4 justify-content-center mb-4"},[e("div",{class:"modal-label"},"this flag is deleted !!")],-1),Ss={class:"d-flex justify-content-center"},$s=e("div",null,"OK",-1),gs=[$s];function xs(i,t,_,h,o,c){const u=f("router-link");return l(),n(v,null,[o.rows.length?(l(),n("div",W,[e("div",j,[(l(!0),n(v,null,g(o.rows,s=>(l(),n("div",null,[d(a(s.date)+" ",1),s.type==="skill"?(l(),n("span",A,[e("span",{class:p(c.actionColor(s.action))}," - "+a(s.action),3),s.action=="delete"?(l(),n("span",L," flag with id: "+a(s.id),1)):r("",!0),d(" flag on skill: "),s.action==="delete"||s.skill_deleted===1?(l(),n("span",{key:1,class:"skill-link",onClick:w=>c.handleNoneLinkClick(s.action,s.skillName)},a(s.skillName),9,q)):(l(),b(u,{key:2,class:"skill-link",target:"_blank",to:`/skills/${s.skillUrl}`},{default:k(()=>[d(a(s.skillName),1)]),_:2},1032,["to"])),s.is_deleted?(l(),n("span",O,"[Flag deleted]")):r("",!0)])):r("",!0),s.type==="resource"?(l(),n("span",T,[e("span",{class:p(c.actionColor(s.action))}," - "+a(s.action),3),d(" flag on resource of skill: "),s.action==="delete"||s.skill_deleted===1?(l(),n("span",{key:0,class:"skill-link",onClick:w=>c.handleNoneLinkClick(s.action,s.skillName)},a(s.skillName),9,R)):(l(),b(u,{key:1,class:"skill-link",target:"_blank",to:`/skills/${s.skillUrl}`},{default:k(()=>[d(a(s.skillName),1)]),_:2},1032,["to"])),s.is_deleted?(l(),n("span",B,"[Flag deleted]")):r("",!0)])):r("",!0),s.type==="mc_question"?(l(),n("span",E,[e("span",{class:p(c.actionColor(s.action))}," - "+a(s.action),3),d(" flag on mc_question "+a('"'+s.questionName+'"')+": ",1),m(u,{class:"question-link",target:"_blank",to:`/skills/${s.skillId}/question-bank`},{default:k(()=>[d(a(s.question),1)]),_:2},1032,["to"]),d(" on skill: "),s.action==="delete"||s.skill_deleted===1?(l(),n("span",{key:0,class:"skill-link",onClick:w=>c.handleNoneLinkClick(s.action,s.skillName)},a(s.skillName),9,K)):(l(),b(u,{key:1,class:"skill-link",target:"_blank",to:`/skills/${s.skillUrl}`},{default:k(()=>[d(a(s.skillName),1)]),_:2},1032,["to"])),s.is_deleted?(l(),n("span",z,"[Flag deleted]")):r("",!0)])):r("",!0),s.type==="essay_question"?(l(),n("span",V,[e("span",{class:p(c.actionColor(s.action))}," - "+a(s.action),3),d(" flag on essay question "+a('"'+s.questionName+'"')+": ",1),m(u,{class:"question-link",target:"_blank",to:`/skills/${s.skillId}/question-bank`},{default:k(()=>[d(a(s.question),1)]),_:2},1032,["to"]),d(" on skill: "),s.action==="delete"||s.skill_deleted===1?(l(),n("span",{key:0,class:"skill-link",onClick:w=>c.handleNoneLinkClick(s.action,s.skillName)},a(s.skillName),9,H)):(l(),b(u,{key:1,class:"skill-link",target:"_blank",to:`/skills/${s.skillUrl}`},{default:k(()=>[d(a(s.skillName),1)]),_:2},1032,["to"])),s.is_deleted?(l(),n("span",J,"[Flag deleted]")):r("",!0)])):r("",!0),s.type==="image_question"?(l(),n("span",P,[e("span",{class:p(c.actionColor(s.action))}," - "+a(s.action),3),d(" flag on image question "+a('"'+s.questionName+'"')+": ",1),m(u,{class:"question-link",target:"_blank",to:`/skills/${s.skillId}/question-bank`},{default:k(()=>[d(a(s.question),1)]),_:2},1032,["to"]),d(" on skill: "),s.action==="delete"||s.skill_deleted===1?(l(),n("span",{key:0,class:"skill-link",onClick:w=>c.handleNoneLinkClick(s.action,s.skillName)},a(s.skillName),9,G)):(l(),b(u,{key:1,class:"skill-link",target:"_blank",to:`/skills/${s.skillUrl}`},{default:k(()=>[d(a(s.skillName),1)]),_:2},1032,["to"])),s.is_deleted?(l(),n("span",X,"[Flag deleted]")):r("",!0)])):r("",!0),s.type==="delete"?(l(),n("span",Y,[e("span",{class:p(c.actionColor(s.action))}," - "+a(s.action),3),d(" flag with id "+a(s.id)+" ",1),s.is_deleted?(l(),n("span",Z,"[Flag deleted]")):r("",!0)])):r("",!0)]))),256))])])):(l(),n("div",F,"The user has no action on flags")),o.showSkillWarnModal?(l(),n("div",ss,[e("div",es,[e("div",ts,[e("div",os,[e("div",ls,[d(" Skill "),e("span",is,a(o.currentChooseSkill),1),d(" is deleted !! ")])]),e("div",ns,[e("button",{type:"button",class:"btn green-btn w-fit",onClick:t[0]||(t[0]=s=>o.showSkillWarnModal=!1)},cs)])])])])):r("",!0),o.showSkillWarnModal?(l(),n("div",ds,[e("div",rs,[e("div",_s,[e("div",us,[e("div",ks,[d(" Skill "),e("span",hs,a(o.currentChooseSkill),1),d(" is deleted !! ")])]),e("div",ms,[e("button",{type:"button",class:"btn green-btn w-fit",onClick:t[1]||(t[1]=s=>o.showSkillWarnModal=!1)},ws)])])])])):r("",!0),o.showActionWarnModal?(l(),n("div",fs,[e("div",vs,[e("div",ys,[bs,e("div",Ss,[e("button",{type:"button",class:"btn green-btn w-fit",onClick:t[2]||(t[2]=s=>o.showActionWarnModal=!1)},gs)])])])])):r("",!0)],64)}const Cs=S(Q,[["render",xs]]),Ms={props:["userId"],data(){return{resourcesData:[],rows:[],showWarnModal:!1,currentChooseSkill:"",showActionWarnModal:!1,showSkillWarnModal:!1}},components:{},async created(){await this.getResourceLogs(),this.resourcesData.forEach(i=>{const t=JSON.parse(i.content_obj),_=new Date(i.create_date),h=_.toLocaleString("en-gb",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),o=_.toLocaleTimeString();this.rows.push({skillName:t.skill_name,resourceId:i.content_id,action:i.action,date:h,time:o,id:i.id,skillDeleted:t.skill_deleted,skillUrl:t.skill_url,resourceDeleted:t.resource_deleted})})},methods:{async getResourceLogs(){const i=await fetch(`/user-actions/${this.userId}/resource`);this.resourcesData=await i.json()},actionColor(i){switch(i){case"create":return"create-action";case"update":return"update-action";default:return"delete-action"}},handleNoneLinkClick(i,t,_){i==="delete"?this.showActionWarnModal=!0:_?this.showActionWarnModal=!0:(this.showSkillWarnModal=!0,this.currentChooseSkill=t)}}},Ns={key:0,class:"container-md main-container"},Ds={class:"d-flex flex-column"},Us=["onClick"],Is={key:1,class:"shake"},Qs={key:2},Ws={id:"myModal",class:"modal"},js={class:"modal-content skill-modal"},As={class:"modal-label"},Ls={class:"skill-modal-text"},qs={class:"d-flex justify-content-center"},Os=e("div",null,"OK",-1),Ts=[Os],Rs={key:3},Bs={id:"myModal",class:"modal"},Es={class:"modal-content"},Ks=e("div",{class:"d-flex gap-4 justify-content-center mb-4"},[e("div",{class:"modal-label"},"Resource is deleted !!")],-1),zs={class:"d-flex justify-content-center"},Vs=e("div",null,"OK",-1),Hs=[Vs];function Js(i,t,_,h,o,c){const u=f("router-link");return l(),n(v,null,[o.rows.length?(l(),n("div",Ns,[e("div",Ds,[(l(!0),n(v,null,g(o.rows,s=>(l(),n("div",null,[d(a(s.time)+" ("+a(s.date)+") - ",1),e("span",{class:p(c.actionColor(s.action))},a(s.action),3),d("  "),e("span",null,[m(u,{class:"skill-link",target:"_blank",to:"/users/"+_.userId+"/activity-report/source/"+s.id},{default:k(()=>[d("source")]),_:2},1032,["to"]),d(" in forum of skill: ")]),s.action==="delete"||s.skillDeleted===1||s.resourceDeleted===1?(l(),n("span",{key:0,class:"skill-link",onClick:w=>c.handleNoneLinkClick(s.action,s.skillName,s.resourceDeleted)},a(s.skillName),9,Us)):(l(),b(u,{key:1,class:"skill-link",target:"_blank",to:`/skills/${s.skillUrl}`},{default:k(()=>[d(a(s.skillName),1)]),_:2},1032,["to"]))]))),256))])])):(l(),n("div",Is,"The user has no action on resource")),o.showSkillWarnModal?(l(),n("div",Qs,[e("div",Ws,[e("div",js,[e("div",As,[d(" Skill "),e("span",Ls,a(o.currentChooseSkill),1),d(" is deleted !! ")]),e("div",qs,[e("button",{type:"button",class:"btn green-btn w-fit",onClick:t[0]||(t[0]=s=>o.showSkillWarnModal=!1)},Ts)])])])])):r("",!0),o.showActionWarnModal?(l(),n("div",Rs,[e("div",Bs,[e("div",Es,[Ks,e("div",zs,[e("button",{type:"button",class:"btn green-btn w-fit",onClick:t[1]||(t[1]=s=>o.showActionWarnModal=!1)},Hs)])])])])):r("",!0)],64)}const Ps=S(Ms,[["render",Js]]),Gs={props:["userId"],data(){return{questionsData:[],rows:[],showSkillWarnModal:!1,showActionWarnModal:!1,currentChooseSkill:""}},components:{},async created(){await this.getMcQuestionsLog(),this.questionsData.forEach(i=>{const t=JSON.parse(i.content_obj),_=new Date(i.create_date),h=_.toLocaleString("en-gb",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),o=_.toLocaleTimeString();this.rows.push({question_name:t.question_name,skillName:t.skill_name,resourceId:i.content_id,action:i.action,date:h,time:o,id:i.id,studentName:t.student_name,studentId:t.student_id,type:i.content_type,skillDeleted:t.skill_deleted,skillUrl:t.skill_url,questionDeleted:t.question_deleted})})},methods:{async getMcQuestionsLog(){const i=await fetch(`/user-actions/${this.userId}/question`);this.questionsData=await i.json(),console.log("QUESTION ACTION: "),console.log(this.questionsData)},handleNoneLinkClick(i,t,_){i==="delete"||_?this.showActionWarnModal=!0:(this.showSkillWarnModal=!0,this.currentChooseSkill=t)},actionColor(i){switch(i){case"create":return"create-action";case"update":return"update-action";case"bulk-create":return"bulk-create-action";case"submit_update_for_review":return"submit_update_for_review";case"approve":return"approve-action";case"edit_and_approve":return"edit-and-approve-action";default:return"delete-action"}}}},Xs={key:0,class:"container-md main-container"},Ys={class:"d-flex flex-column"},Zs={key:0},Fs={key:1},se={key:2},ee=["onClick"],te={key:1,class:"shake"},oe={key:2},le={id:"myModal",class:"modal"},ie={class:"modal-content skill-modal"},ne={class:"mb-4"},ae={class:"modal-label"},ce={class:"skill-modal-text"},de={class:"d-flex justify-content-center"},re=e("div",null,"OK",-1),_e=[re],ue={key:3},ke={id:"myModal",class:"modal"},he={class:"modal-content"},me=e("div",{class:"d-flex gap-4 justify-content-center mb-4"},[e("div",{class:"modal-label"},"Question is deleted !!")],-1),pe={class:"d-flex justify-content-center"},we=e("div",null,"OK",-1),fe=[we];function ve(i,t,_,h,o,c){const u=f("router-link");return l(),n(v,null,[o.rows.length>0?(l(),n("div",Xs,[e("div",Ys,[(l(!0),n(v,null,g(o.rows,s=>(l(),n("div",null,[d(a(s.time)+" ("+a(s.date)+") ",1),e("span",{class:p(c.actionColor(s.action))}," - "+a(s.action.replace(/_/g," ")),3),s.type==="mc_question"?(l(),n("span",Zs,a(' "'+s.question_name+'"')+" in question bank of skill: ",1)):r("",!0),s.type==="essay_question"?(l(),n("span",Fs," essay question "+a(' "'+s.question_name+'"')+" in question bank of skill: ",1)):r("",!0),s.type==="image_question"?(l(),n("span",se," image question "+a(' "'+s.question_name+'"')+" in question bank of skill: ",1)):r("",!0),s.action==="delete"||s.skillDeleted===1||s.questionDeleted===1?(l(),n("span",{key:3,class:"skill-link",onClick:w=>c.handleNoneLinkClick(s.action,s.skillName,s.questionDeleted)},a(s.skillName),9,ee)):(l(),b(u,{key:4,class:"skill-link",target:"_blank",to:`/skills/${s.skillUrl}`},{default:k(()=>[d(a(s.skillName),1)]),_:2},1032,["to"]))]))),256))])])):(l(),n("div",te," The user has no action on multiple-choice questions ")),o.showSkillWarnModal?(l(),n("div",oe,[e("div",le,[e("div",ie,[e("div",ne,[e("div",ae,[d(" Skill "),e("span",ce,a(o.currentChooseSkill),1),d(" is deleted !! ")])]),e("div",de,[e("button",{type:"button",class:"btn green-btn w-fit",onClick:t[0]||(t[0]=s=>o.showSkillWarnModal=!1)},_e)])])])])):r("",!0),o.showActionWarnModal?(l(),n("div",ue,[e("div",ke,[e("div",he,[me,e("div",pe,[e("button",{type:"button",class:"btn green-btn w-fit",onClick:t[1]||(t[1]=s=>o.showActionWarnModal=!1)},fe)])])])])):r("",!0)],64)}const ye=S(Gs,[["render",ve]]),be={props:["userId"],data(){return{skillsData:[],rows:[],showWarnModal:!1,currentChooseSkill:""}},components:{},async created(){await this.getSkillLogs(),this.skillsData.forEach(i=>{const t=JSON.parse(i.content_obj),_=new Date(i.create_date),h=_.toLocaleString("en-gb",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),o=_.toLocaleTimeString();this.rows.push({skillName:t.skill_name,resourceId:i.content_id,action:i.action,date:h,time:o,id:i.id,skillUrl:t.skill_url,is_deleted:t.is_deleted})})},methods:{async getSkillLogs(){const i=await fetch(`/user-actions/${this.userId}/skill`);this.skillsData=await i.json()},actionColor(i){switch(i){case"create":return"create-action";case"update":return"update-action";default:return"delete-action"}}}},Se={key:0,class:"container-md main-container"},$e={class:"d-flex flex-column"},ge=e("span",null," skill: ",-1),xe=["onClick"],Ce={key:1,class:"shake"},Me={key:2},Ne={id:"myModal",class:"modal"},De={class:"modal-content skill-modal"},Ue={class:"modal-label"},Ie={class:"skill-modal-text"},Qe={class:"d-flex justify-content-center"},We=e("div",null,"OK",-1),je=[We];function Ae(i,t,_,h,o,c){const u=f("router-link");return l(),n(v,null,[o.rows.length?(l(),n("div",Se,[e("div",$e,[(l(!0),n(v,null,g(o.rows,s=>(l(),n("div",null,[d(a(s.time)+" ("+a(s.date)+") - ",1),e("span",{class:p(c.actionColor(s.action))},a(s.action),3),ge,s.action==="delete"||s.is_deleted===1?(l(),n("span",{key:0,class:"skill-link",onClick:w=>{o.showWarnModal=!0,o.currentChooseSkill=s.skillName}},a(s.skillName),9,xe)):(l(),b(u,{key:1,class:"skill-link",target:"_blank",to:`/skills/${s.skillUrl}`},{default:k(()=>[d(a(s.skillName),1)]),_:2},1032,["to"]))]))),256))])])):(l(),n("div",Ce,"The user has no recorded actions on skills")),o.showWarnModal?(l(),n("div",Me,[e("div",Ne,[e("div",De,[e("div",Ue,[d(" Skill "),e("span",Ie,a(o.currentChooseSkill),1),d(" is deleted !! ")]),e("div",Qe,[e("button",{type:"button",class:"btn green-btn w-fit",onClick:t[0]||(t[0]=s=>o.showWarnModal=!1)},je)])])])])):r("",!0)],64)}const Le=S(be,[["render",Ae]]),qe={props:["userId","deleteMcQuestion"],data(){return{questionsData:[],rows:[],showWarnModal:!1}},components:{},async created(){await this.getMcQuestionsLog(),this.questionsData.forEach(i=>{const t=JSON.parse(i.content_obj),_=new Date(i.create_date),h=_.toLocaleString("en-gb",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),o=_.toLocaleTimeString();this.rows.push({skillName:t.skill_name,skillUrl:t.skill_url,resourceId:i.content_id,action:i.action,date:h,time:o,id:i.id,studentName:t.student_name,studentId:t.student_id,skill_deleted:t.skill_deleted})})},methods:{async getMcQuestionsLog(){const i=await fetch(`/user-actions/${this.userId}/student_mc_question`);this.questionsData=await i.json()},actionColor(i){switch(i){case"create":return"create-action";case"update":return"update-action";default:return"delete-action"}}}},Oe={key:0,class:"container-md main-container"},Te={class:"d-flex flex-column"},Re={key:0},Be={key:1},Ee={key:2},Ke={key:1,class:"shake"},ze={key:2},Ve={id:"myModal",class:"modal"},He={class:"modal-content"},Je=e("div",{class:"d-flex gap-4 justify-content-center mb-4"},[e("div",{class:"modal-label"},"This skill is deleted !!")],-1),Pe={class:"d-flex justify-content-center"},Ge=e("div",null,"OK",-1),Xe=[Ge];function Ye(i,t,_,h,o,c){const u=f("router-link");return l(),n(v,null,[o.rows.length>0?(l(),n("div",Oe,[e("div",Te,[(l(!0),n(v,null,g(o.rows,s=>(l(),n("div",null,[d(a(s.time)+" ("+a(s.date)+") ",1),e("span",{class:p(c.actionColor(s.action))}," - "+a(s.action),3),s.action==="delete"?(l(),n("span",Re," student mc_question with id "+a(s.id),1)):s.action==="create"?(l(),n("span",Be," student mc_question for skill: ")):(l(),n("span",Ee,[d(" mc question of student "),m(u,{class:"user-link",target:"_blank",to:"/users"},{default:k(()=>[d(a(s.studentName),1)]),_:2},1024),d(" on skill: ")])),s.action==="delete"||s.skill_deleted===1?(l(),n("span",{key:3,class:"skill-link",onClick:t[0]||(t[0]=w=>o.showWarnModal=!0)},a(s.skillName),1)):(l(),b(u,{key:4,class:"skill-link",target:"_blank",to:`/skills/${s.skillUrl}`},{default:k(()=>[d(a(s.skillName),1)]),_:2},1032,["to"]))]))),256))])])):(l(),n("div",Ke," The user has no recorded actions on multiple-choice questions ")),o.showWarnModal?(l(),n("div",ze,[e("div",Ve,[e("div",He,[Je,e("div",Pe,[e("button",{type:"button",class:"btn green-btn w-25",onClick:t[1]||(t[1]=s=>o.showWarnModal=!1)},Xe)])])])])):r("",!0)],64)}const Ze=S(qe,[["render",Ye]]);const Fe={setup(){return{usersStore:N()}},data(){return{user:{id:this.$route.params.id,firstName:null,lastName:null,username:null,role:null,avatar:null},showFlags:!1,showSources:!1,showMcQuestions:!1,showStudentMcQuestions:!1,showSkills:!1,mcQuestions:[],resources:[],flags:[],skillEdits:[]}},components:{UserFlagActions:Cs,UserResourceActions:Ps,UserQuestionActions:ye,UserStudentMcQuestionActions:Ze,UserSkillActions:Le},async created(){await this.getUserDetails()},methods:{async getUserDetails(){this.usersStore.users.length<1&&await this.usersStore.getUsers();for(let i=0;i<this.usersStore.users.length;i++)this.usersStore.users[i].id==this.user.id&&(this.user.firstName=this.usersStore.users[i].first_name,this.user.lastName=this.usersStore.users[i].last_name,this.user.username=this.usersStore.users[i].username,this.user.role=this.usersStore.users[i].role,this.user.avatar=this.usersStore.users[i].avatar)}}},st={class:"container"},et=e("div",{class:"mt-4 mb-4"},[e("div",{class:"page-title"},"User Activity Report")],-1),tt={class:"row"},ot={class:"d-flex flex-column flex-md-row gap-3"},lt=["src"],it={class:"d-flex flex-column"},nt={id:"user-name"},at={id:"role"},ct={class:"d-flex flex-column"},dt={class:"d-flex flex-row justify-content-between"},rt=["title"],_t=e("span",null," Flags ",-1),ut=e("path",{d:"M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"},null,-1),kt=[ut],ht={key:0},mt=e("hr",{class:"mt-5 mb-3"},null,-1),pt={class:"d-flex flex-column"},wt={class:"d-flex flex-row justify-content-between"},ft=["title"],vt=e("span",null,"Questions ",-1),yt=e("path",{d:"M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"},null,-1),bt=[yt],St={key:0},$t={key:0,class:"mt-5 mb-3"},gt={class:"d-flex flex-column"},xt={class:"d-flex flex-row justify-content-between"},Ct=["title"],Mt=e("span",null,"Student MC Questions ",-1),Nt=e("path",{d:"M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"},null,-1),Dt=[Nt],Ut={key:0},It=e("hr",{class:"mt-5 mb-3"},null,-1),Qt={class:"d-flex flex-column"},Wt={class:"d-flex flex-row justify-content-between"},jt=["title"],At=e("span",null," Sources ",-1),Lt=e("path",{d:"M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"},null,-1),qt=[Lt],Ot={key:0},Tt=e("hr",{class:"mt-5 mb-3"},null,-1),Rt={class:"d-flex flex-column"},Bt={class:"d-flex flex-row justify-content-between"},Et=["title"],Kt=e("span",null," Skills ",-1),zt=e("path",{d:"M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"},null,-1),Vt=[zt],Ht={key:0},Jt=e("hr",{class:"mt-5 mb-3"},null,-1);function Pt(i,t,_,h,o,c){const u=f("UserFlagActions"),s=f("UserQuestionActions"),w=f("UserStudentMcQuestionActions"),x=f("UserResourceActions"),C=f("UserSkillActions");return l(),n("div",st,[et,e("div",tt,[e("div",ot,[e("img",{id:"activity-report-user-avatar",src:o.user.avatar},null,8,lt),e("div",it,[e("div",nt,a(o.user.username),1),e("div",at,a(o.user.role),1)])])]),e("div",null,[e("div",ct,[e("div",dt,[e("div",{class:"log-type",onClick:t[0]||(t[0]=y=>o.showFlags=!o.showFlags),"b-on-hover":"",title:o.showFlags?"collapse":"expand"},[_t,(l(),n("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 320 512",width:"22",height:"22",fill:"#667085",class:p([o.showFlags?"arrow-point-down mb-2":"arrow-point-up "])},kt,2))],8,rt)]),m($,{name:"dropdown"},{default:k(()=>[o.showFlags?(l(),n("div",ht,[m(u,{ref:"contentFlagsPerUser",userId:o.user.id,onCloseFlagDiv:t[1]||(t[1]=y=>o.showFlags=!1)},null,8,["userId"])])):r("",!0)]),_:1})]),mt,e("div",pt,[e("div",wt,[e("div",{class:"log-type",onClick:t[2]||(t[2]=y=>o.showMcQuestions=!o.showMcQuestions),"b-on-hover":"",title:o.showMcQuestions?"collapse":"expand"},[vt,(l(),n("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 320 512",width:"22",height:"22",fill:"#667085",class:p([o.showMcQuestions?"arrow-point-down mb-2":"arrow-point-up"])},bt,2))],8,ft)]),m($,{name:"dropdown"},{default:k(()=>[o.showMcQuestions?(l(),n("div",St,[m(s,{userId:o.user.id,onCloseMcQuestionDiv:t[3]||(t[3]=y=>o.showMcQuestions=!1)},null,8,["userId"])])):r("",!0)]),_:1})]),o.user.role==="admin"?(l(),n("hr",$t)):r("",!0),e("div",gt,[e("div",xt,[e("div",{class:"log-type",onClick:t[4]||(t[4]=y=>o.showStudentMcQuestions=!o.showStudentMcQuestions),"b-on-hover":"",title:o.showStudentMcQuestions?"collapse":"expand"},[Mt,(l(),n("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 320 512",width:"22",height:"22",fill:"#667085",class:p([o.showStudentMcQuestions?"arrow-point-down mb-2":"arrow-point-up"])},Dt,2))],8,Ct)]),m($,{name:"dropdown"},{default:k(()=>[o.showStudentMcQuestions?(l(),n("div",Ut,[m(w,{userId:o.user.id,onCloseMcQuestionDiv:t[5]||(t[5]=y=>o.showStudentMcQuestions=!1)},null,8,["userId"])])):r("",!0)]),_:1})]),It,e("div",Qt,[e("div",Wt,[e("div",{class:"log-type",onClick:t[6]||(t[6]=y=>o.showSources=!o.showSources),"b-on-hover":"",title:o.showSources?"collapse":"expand"},[At,(l(),n("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 320 512",width:"22",height:"22",fill:"#667085",class:p([o.showSources?"arrow-point-down mb-2":"arrow-point-up "])},qt,2))],8,jt)]),m($,{name:"dropdown"},{default:k(()=>[o.showSources?(l(),n("div",Ot,[m(x,{userId:o.user.id,onCloseResourceDiv:t[7]||(t[7]=y=>o.showSources=!1)},null,8,["userId"])])):r("",!0)]),_:1})]),Tt,e("div",Rt,[e("div",Bt,[e("div",{class:"log-type",onClick:t[8]||(t[8]=y=>o.showSkills=!o.showSkills),"b-on-hover":"",title:o.showSkills?"collapse":"expand"},[Kt,(l(),n("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 320 512",width:"22",height:"22",fill:"#667085",class:p([o.showSkills?"arrow-point-down mb-2":"arrow-point-up "])},Vt,2))],8,Et)]),m($,{name:"dropdown"},{default:k(()=>[o.showSkills?(l(),n("div",Ht,[m(C,{userId:o.user.id,onCloseResourceDiv:t[9]||(t[9]=y=>o.showSkills=!1)},null,8,["userId"])])):r("",!0)]),_:1})]),Jt])])}const Yt=S(Fe,[["render",Pt]]);export{Yt as default};