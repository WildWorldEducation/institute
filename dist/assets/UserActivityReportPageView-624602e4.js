import{_ as b,g as x,r as v,o as i,c as n,d as s,F as w,z as $,m as r,t as a,l as p,b as d,i as S,j as k,e as m,q as U,a as D,T as g}from"./main-d71c4edc.js";import{u as I,a as T,b as j}from"./EssayQuestionsStore-a173e45f.js";const A={props:["userId"],setup(){const l=x(),t=I(),u=T(),h=j();return{skillsStore:l,resourcesStore:t,mcQuestionsStore:u,essayQuestionsStore:h}},data(){return{contentFlags:[],rows:[],currentChooseSkill:"",showActionWarnModal:!1,showSkillWarnModal:!1}},components:{},async created(){},async mounted(){await this.getContentFlagLogs(),this.contentFlags.forEach(l=>{const t=JSON.parse(l.content_obj),u=new Date(l.create_date),h=u.toLocaleString("en-gb",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),c={date:u.toLocaleTimeString()+` (${h})`,action:l.action,question:t.question,questionName:t.question_name,skillName:t.name,skillUrl:t.skill_url,id:l.id,skill_deleted:t.skill_deleted,is_deleted:l.is_deleted};switch(l.flag_type){case"mc_question":c.type="mc_question",c.questionId=t.question_id,c.skillId=t.skill_id,c.skillUrl=t.skill_url;break;case"resource":c.type="resource",c.skillId=t.skill_id,c.skillUrl=t.skill_url;break;case"skill":c.type="skill",c.skillId=t.skill_id,c.skillUrl=t.skill_url;break;case"essay_question":c.type="essay_question",c.skillId=t.skill_id,c.skillUrl=t.skill_url;break;case"image_question":c.type="image_question",c.questionId=t.question_id,c.skillId=t.skill_id,c.skillUrl=t.skill_url;break;default:c.type="delete";break}this.rows.push(c)})},methods:{async getContentFlagLogs(){const l=await fetch(`/user-actions/${this.userId}/flag`);this.contentFlags=await l.json()},actionColor(l){switch(l){case"create":return"create-action";case"update":return"update-action";default:return"delete-action"}},handleNoneLinkClick(l,t){l==="delete"?this.showActionWarnModal=!0:(this.showSkillWarnModal=!0,this.currentChooseSkill=t)}}},W={key:0,class:"container-md main-container"},L={class:"d-flex flex-column gap-3"},Q={key:0},q={key:0},O=["onClick"],B={key:3,class:"text-danger"},R={key:1},E=["onClick"],K={key:2,class:"text-danger"},z={key:2},H=["onClick"],J={key:2,class:"text-danger"},V={key:3},P=["onClick"],G={key:2,class:"text-danger"},X={key:4},Y=["onClick"],Z={key:2,class:"text-danger"},F={key:5},ee={key:0,class:"text-danger"},se={key:1,class:"shake"},te={key:2},oe={id:"myModal",class:"modal"},le={class:"modal-content skill-modal"},ie={class:"mb-4"},ne={class:"modal-label"},ae={class:"skill-modal-text"},re={class:"d-flex justify-content-center"},ce=s("div",null,"OK",-1),de=[ce],ue={key:3},_e={id:"myModal",class:"modal"},he={class:"modal-content skill-modal"},ke={class:"mb-4"},me={class:"modal-label"},pe={class:"skill-modal-text"},we={class:"d-flex justify-content-center"},fe=s("div",null,"OK",-1),ve=[fe],ye={key:4},Se={id:"myModal",class:"modal"},be={class:"modal-content"},ge=s("div",{class:"d-flex gap-4 justify-content-center mb-4"},[s("div",{class:"modal-label"},"this flag is deleted !!")],-1),$e={class:"d-flex justify-content-center"},xe=s("div",null,"OK",-1),Ce=[xe];function Me(l,t,u,h,o,c){const _=v("router-link");return i(),n(w,null,[o.rows.length?(i(),n("div",W,[s("div",L,[(i(!0),n(w,null,$(o.rows,e=>(i(),n("div",null,[r(a(e.date)+" ",1),e.type==="skill"?(i(),n("span",Q,[s("span",{class:p(c.actionColor(e.action))}," - "+a(e.action),3),e.action=="delete"?(i(),n("span",q," flag with id: "+a(e.id),1)):d("",!0),r(" flag on skill: "),e.action==="delete"||e.skill_deleted===1?(i(),n("span",{key:1,class:"skill-link",onClick:y=>c.handleNoneLinkClick(e.action,e.skillName)},a(e.skillName),9,O)):(i(),S(_,{key:2,class:"skill-link",target:"_blank",to:`/skills/${e.skillUrl}`},{default:k(()=>[r(a(e.skillName),1)]),_:2},1032,["to"])),e.is_deleted?(i(),n("span",B,"[Flag deleted]")):d("",!0)])):d("",!0),e.type==="resource"?(i(),n("span",R,[s("span",{class:p(c.actionColor(e.action))}," - "+a(e.action),3),r(" flag on resource of skill: "),e.action==="delete"||e.skill_deleted===1?(i(),n("span",{key:0,class:"skill-link",onClick:y=>c.handleNoneLinkClick(e.action,e.skillName)},a(e.skillName),9,E)):(i(),S(_,{key:1,class:"skill-link",target:"_blank",to:`/skills/${e.skillUrl}`},{default:k(()=>[r(a(e.skillName),1)]),_:2},1032,["to"])),e.is_deleted?(i(),n("span",K,"[Flag deleted]")):d("",!0)])):d("",!0),e.type==="mc_question"?(i(),n("span",z,[s("span",{class:p(c.actionColor(e.action))}," - "+a(e.action),3),r(" flag on mc_question "+a('"'+e.questionName+'"')+": ",1),m(_,{class:"question-link",target:"_blank",to:`/skills/${e.skillId}/question-bank`},{default:k(()=>[r(a(e.question),1)]),_:2},1032,["to"]),r(" on skill: "),e.action==="delete"||e.skill_deleted===1?(i(),n("span",{key:0,class:"skill-link",onClick:y=>c.handleNoneLinkClick(e.action,e.skillName)},a(e.skillName),9,H)):(i(),S(_,{key:1,class:"skill-link",target:"_blank",to:`/skills/${e.skillUrl}`},{default:k(()=>[r(a(e.skillName),1)]),_:2},1032,["to"])),e.is_deleted?(i(),n("span",J,"[Flag deleted]")):d("",!0)])):d("",!0),e.type==="essay_question"?(i(),n("span",V,[s("span",{class:p(c.actionColor(e.action))}," - "+a(e.action),3),r(" flag on essay question "+a('"'+e.questionName+'"')+": ",1),m(_,{class:"question-link",target:"_blank",to:`/skills/${e.skillId}/question-bank`},{default:k(()=>[r(a(e.question),1)]),_:2},1032,["to"]),r(" on skill: "),e.action==="delete"||e.skill_deleted===1?(i(),n("span",{key:0,class:"skill-link",onClick:y=>c.handleNoneLinkClick(e.action,e.skillName)},a(e.skillName),9,P)):(i(),S(_,{key:1,class:"skill-link",target:"_blank",to:`/skills/${e.skillUrl}`},{default:k(()=>[r(a(e.skillName),1)]),_:2},1032,["to"])),e.is_deleted?(i(),n("span",G,"[Flag deleted]")):d("",!0)])):d("",!0),e.type==="image_question"?(i(),n("span",X,[s("span",{class:p(c.actionColor(e.action))}," - "+a(e.action),3),r(" flag on image question "+a('"'+e.questionName+'"')+": ",1),m(_,{class:"question-link",target:"_blank",to:`/skills/${e.skillId}/question-bank`},{default:k(()=>[r(a(e.question),1)]),_:2},1032,["to"]),r(" on skill: "),e.action==="delete"||e.skill_deleted===1?(i(),n("span",{key:0,class:"skill-link",onClick:y=>c.handleNoneLinkClick(e.action,e.skillName)},a(e.skillName),9,Y)):(i(),S(_,{key:1,class:"skill-link",target:"_blank",to:`/skills/${e.skillUrl}`},{default:k(()=>[r(a(e.skillName),1)]),_:2},1032,["to"])),e.is_deleted?(i(),n("span",Z,"[Flag deleted]")):d("",!0)])):d("",!0),e.type==="delete"?(i(),n("span",F,[s("span",{class:p(c.actionColor(e.action))}," - "+a(e.action),3),r(" flag with id "+a(e.id)+" ",1),e.is_deleted?(i(),n("span",ee,"[Flag deleted]")):d("",!0)])):d("",!0)]))),256))])])):(i(),n("div",se,"The user has no action on flags")),o.showSkillWarnModal?(i(),n("div",te,[s("div",oe,[s("div",le,[s("div",ie,[s("div",ne,[r(" Skill "),s("span",ae,a(o.currentChooseSkill),1),r(" is deleted !! ")])]),s("div",re,[s("button",{type:"button",class:"btn green-btn w-fit",onClick:t[0]||(t[0]=e=>o.showSkillWarnModal=!1)},de)])])])])):d("",!0),o.showSkillWarnModal?(i(),n("div",ue,[s("div",_e,[s("div",he,[s("div",ke,[s("div",me,[r(" Skill "),s("span",pe,a(o.currentChooseSkill),1),r(" is deleted !! ")])]),s("div",we,[s("button",{type:"button",class:"btn green-btn w-fit",onClick:t[1]||(t[1]=e=>o.showSkillWarnModal=!1)},ve)])])])])):d("",!0),o.showActionWarnModal?(i(),n("div",ye,[s("div",Se,[s("div",be,[ge,s("div",$e,[s("button",{type:"button",class:"btn green-btn w-fit",onClick:t[2]||(t[2]=e=>o.showActionWarnModal=!1)},Ce)])])])])):d("",!0)],64)}const Ne=b(A,[["render",Me]]),Ue={props:["userId"],data(){return{resourcesData:[],rows:[],showWarnModal:!1,currentChooseSkill:"",showActionWarnModal:!1,showSkillWarnModal:!1}},components:{},async created(){await this.getResourceLogs(),this.resourcesData.forEach(l=>{const t=JSON.parse(l.content_obj),u=new Date(l.create_date),h=u.toLocaleString("en-gb",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),o=u.toLocaleTimeString();this.rows.push({skillName:t.skill_name,resourceId:l.content_id,action:l.action,date:h,time:o,id:l.id,skillDeleted:t.skill_deleted,skillUrl:t.skill_url,resourceDeleted:t.resource_deleted})})},methods:{async getResourceLogs(){const l=await fetch(`/user-actions/${this.userId}/resource`);this.resourcesData=await l.json()},actionColor(l){switch(l){case"create":return"create-action";case"update":return"update-action";default:return"delete-action"}},handleNoneLinkClick(l,t,u){l==="delete"?this.showActionWarnModal=!0:u?this.showActionWarnModal=!0:(this.showSkillWarnModal=!0,this.currentChooseSkill=t)}}},De={key:0,class:"container-md main-container"},Ie={class:"d-flex flex-column"},Te=["onClick"],je={key:1,class:"shake"},Ae={key:2},We={id:"myModal",class:"modal"},Le={class:"modal-content skill-modal"},Qe={class:"modal-label"},qe={class:"skill-modal-text"},Oe={class:"d-flex justify-content-center"},Be=s("div",null,"OK",-1),Re=[Be],Ee={key:3},Ke={id:"myModal",class:"modal"},ze={class:"modal-content"},He=s("div",{class:"d-flex gap-4 justify-content-center mb-4"},[s("div",{class:"modal-label"},"Resource is deleted !!")],-1),Je={class:"d-flex justify-content-center"},Ve=s("div",null,"OK",-1),Pe=[Ve];function Ge(l,t,u,h,o,c){const _=v("router-link");return i(),n(w,null,[o.rows.length?(i(),n("div",De,[s("div",Ie,[(i(!0),n(w,null,$(o.rows,e=>(i(),n("div",null,[r(a(e.time)+" ("+a(e.date)+") - ",1),s("span",{class:p(c.actionColor(e.action))},a(e.action),3),r("  "),s("span",null,[m(_,{class:"skill-link",target:"_blank",to:"/users/"+u.userId+"/activity-report/source/"+e.id},{default:k(()=>[r("source")]),_:2},1032,["to"]),r(" in forum of skill: ")]),e.action==="delete"||e.skillDeleted===1||e.resourceDeleted===1?(i(),n("span",{key:0,class:"skill-link",onClick:y=>c.handleNoneLinkClick(e.action,e.skillName,e.resourceDeleted)},a(e.skillName),9,Te)):(i(),S(_,{key:1,class:"skill-link",target:"_blank",to:`/skills/${e.skillUrl}`},{default:k(()=>[r(a(e.skillName),1)]),_:2},1032,["to"]))]))),256))])])):(i(),n("div",je,"The user has no action on resource")),o.showSkillWarnModal?(i(),n("div",Ae,[s("div",We,[s("div",Le,[s("div",Qe,[r(" Skill "),s("span",qe,a(o.currentChooseSkill),1),r(" is deleted !! ")]),s("div",Oe,[s("button",{type:"button",class:"btn green-btn w-fit",onClick:t[0]||(t[0]=e=>o.showSkillWarnModal=!1)},Re)])])])])):d("",!0),o.showActionWarnModal?(i(),n("div",Ee,[s("div",Ke,[s("div",ze,[He,s("div",Je,[s("button",{type:"button",class:"btn green-btn w-fit",onClick:t[1]||(t[1]=e=>o.showActionWarnModal=!1)},Pe)])])])])):d("",!0)],64)}const Xe=b(Ue,[["render",Ge]]),Ye={props:["userId"],data(){return{questionsData:[],rows:[],showSkillWarnModal:!1,showActionWarnModal:!1,currentChooseSkill:""}},components:{},async created(){await this.getMcQuestionsLog(),this.questionsData.forEach(l=>{const t=JSON.parse(l.content_obj),u=new Date(l.create_date),h=u.toLocaleString("en-gb",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),o=u.toLocaleTimeString();this.rows.push({question_name:t.question_name,skillName:t.skill_name,resourceId:l.content_id,action:l.action,date:h,time:o,id:l.id,studentName:t.student_name,studentId:t.student_id,type:l.content_type,skillDeleted:t.skill_deleted,skillUrl:t.skill_url,questionDeleted:t.question_deleted})})},methods:{async getMcQuestionsLog(){const l=await fetch(`/user-actions/${this.userId}/question`);this.questionsData=await l.json(),console.log("QUESTION ACTION: "),console.log(this.questionsData)},handleNoneLinkClick(l,t,u){l==="delete"||u?this.showActionWarnModal=!0:(this.showSkillWarnModal=!0,this.currentChooseSkill=t)},actionColor(l){switch(l){case"create":return"create-action";case"update":return"update-action";case"bulk-create":return"bulk-create-action";case"submit_update_for_review":return"submit_update_for_review";case"approve":return"approve-action";case"edit_and_approve":return"edit-and-approve-action";default:return"delete-action"}}}},Ze={key:0,class:"container-md main-container"},Fe={class:"d-flex flex-column"},es={key:0},ss={key:1},ts={key:2},os=["onClick"],ls={key:1,class:"shake"},is={key:2},ns={id:"myModal",class:"modal"},as={class:"modal-content skill-modal"},rs={class:"mb-4"},cs={class:"modal-label"},ds={class:"skill-modal-text"},us={class:"d-flex justify-content-center"},_s=s("div",null,"OK",-1),hs=[_s],ks={key:3},ms={id:"myModal",class:"modal"},ps={class:"modal-content"},ws=s("div",{class:"d-flex gap-4 justify-content-center mb-4"},[s("div",{class:"modal-label"},"Question is deleted !!")],-1),fs={class:"d-flex justify-content-center"},vs=s("div",null,"OK",-1),ys=[vs];function Ss(l,t,u,h,o,c){const _=v("router-link");return i(),n(w,null,[o.rows.length>0?(i(),n("div",Ze,[s("div",Fe,[(i(!0),n(w,null,$(o.rows,e=>(i(),n("div",null,[r(a(e.time)+" ("+a(e.date)+") ",1),s("span",{class:p(c.actionColor(e.action))}," - "+a(e.action.replace(/_/g," ")),3),e.type==="mc_question"?(i(),n("span",es,a(' "'+e.question_name+'"')+" in question bank of skill: ",1)):d("",!0),e.type==="essay_question"?(i(),n("span",ss," essay question "+a(' "'+e.question_name+'"')+" in question bank of skill: ",1)):d("",!0),e.type==="image_question"?(i(),n("span",ts," image question "+a(' "'+e.question_name+'"')+" in question bank of skill: ",1)):d("",!0),e.action==="delete"||e.skillDeleted===1||e.questionDeleted===1?(i(),n("span",{key:3,class:"skill-link",onClick:y=>c.handleNoneLinkClick(e.action,e.skillName,e.questionDeleted)},a(e.skillName),9,os)):(i(),S(_,{key:4,class:"skill-link",target:"_blank",to:`/skills/${e.skillUrl}`},{default:k(()=>[r(a(e.skillName),1)]),_:2},1032,["to"]))]))),256))])])):(i(),n("div",ls," The user has no action on multiple-choice questions ")),o.showSkillWarnModal?(i(),n("div",is,[s("div",ns,[s("div",as,[s("div",rs,[s("div",cs,[r(" Skill "),s("span",ds,a(o.currentChooseSkill),1),r(" is deleted !! ")])]),s("div",us,[s("button",{type:"button",class:"btn green-btn w-fit",onClick:t[0]||(t[0]=e=>o.showSkillWarnModal=!1)},hs)])])])])):d("",!0),o.showActionWarnModal?(i(),n("div",ks,[s("div",ms,[s("div",ps,[ws,s("div",fs,[s("button",{type:"button",class:"btn green-btn w-fit",onClick:t[1]||(t[1]=e=>o.showActionWarnModal=!1)},ys)])])])])):d("",!0)],64)}const bs=b(Ye,[["render",Ss]]),gs={props:["userId"],data(){return{skillsData:[],rows:[],showWarnModal:!1,currentChooseSkill:""}},components:{},async created(){await this.getSkillLogs(),this.skillsData.forEach(l=>{const t=JSON.parse(l.content_obj),u=new Date(l.create_date),h=u.toLocaleString("en-gb",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),o=u.toLocaleTimeString();this.rows.push({skillName:t.skill_name,resourceId:l.content_id,action:l.action,date:h,time:o,id:l.id,skillUrl:t.skill_url,is_deleted:t.is_deleted})})},methods:{async getSkillLogs(){const l=await fetch(`/user-actions/${this.userId}/skill`);this.skillsData=await l.json()},actionColor(l){switch(l){case"create":return"create-action";case"update":return"update-action";default:return"delete-action"}}}},$s={key:0,class:"container-md main-container"},xs={class:"d-flex flex-column"},Cs=s("span",null," skill: ",-1),Ms=["onClick"],Ns={key:1,class:"shake"},Us={key:2},Ds={id:"myModal",class:"modal"},Is={class:"modal-content skill-modal"},Ts={class:"modal-label"},js={class:"skill-modal-text"},As={class:"d-flex justify-content-center"},Ws=s("div",null,"OK",-1),Ls=[Ws];function Qs(l,t,u,h,o,c){const _=v("router-link");return i(),n(w,null,[o.rows.length?(i(),n("div",$s,[s("div",xs,[(i(!0),n(w,null,$(o.rows,e=>(i(),n("div",null,[r(a(e.time)+" ("+a(e.date)+") - ",1),s("span",{class:p(c.actionColor(e.action))},a(e.action),3),Cs,e.action==="delete"||e.is_deleted===1?(i(),n("span",{key:0,class:"skill-link",onClick:y=>{o.showWarnModal=!0,o.currentChooseSkill=e.skillName}},a(e.skillName),9,Ms)):(i(),S(_,{key:1,class:"skill-link",target:"_blank",to:`/skills/${e.skillUrl}`},{default:k(()=>[r(a(e.skillName),1)]),_:2},1032,["to"]))]))),256))])])):(i(),n("div",Ns,"The user has no recorded actions on skills")),o.showWarnModal?(i(),n("div",Us,[s("div",Ds,[s("div",Is,[s("div",Ts,[r(" Skill "),s("span",js,a(o.currentChooseSkill),1),r(" is deleted !! ")]),s("div",As,[s("button",{type:"button",class:"btn green-btn w-fit",onClick:t[0]||(t[0]=e=>o.showWarnModal=!1)},Ls)])])])])):d("",!0)],64)}const qs=b(gs,[["render",Qs]]),Os={props:["userId","deleteMcQuestion"],data(){return{questionsData:[],rows:[],showWarnModal:!1}},components:{},async created(){await this.getMcQuestionsLog(),this.questionsData.forEach(l=>{const t=JSON.parse(l.content_obj),u=new Date(l.create_date),h=u.toLocaleString("en-gb",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),o=u.toLocaleTimeString();this.rows.push({skillName:t.skill_name,skillUrl:t.skill_url,resourceId:l.content_id,action:l.action,date:h,time:o,id:l.id,studentName:t.student_name,studentId:t.student_id,skill_deleted:t.skill_deleted})})},methods:{async getMcQuestionsLog(){const l=await fetch(`/user-actions/${this.userId}/student_mc_question`);this.questionsData=await l.json()},actionColor(l){switch(l){case"create":return"create-action";case"update":return"update-action";default:return"delete-action"}}}},Bs={key:0,class:"container-md main-container"},Rs={class:"d-flex flex-column"},Es={key:0},Ks={key:1},zs={key:2},Hs={key:1,class:"shake"},Js={key:2},Vs={id:"myModal",class:"modal"},Ps={class:"modal-content"},Gs=s("div",{class:"d-flex gap-4 justify-content-center mb-4"},[s("div",{class:"modal-label"},"This skill is deleted !!")],-1),Xs={class:"d-flex justify-content-center"},Ys=s("div",null,"OK",-1),Zs=[Ys];function Fs(l,t,u,h,o,c){const _=v("router-link");return i(),n(w,null,[o.rows.length>0?(i(),n("div",Bs,[s("div",Rs,[(i(!0),n(w,null,$(o.rows,e=>(i(),n("div",null,[r(a(e.time)+" ("+a(e.date)+") ",1),s("span",{class:p(c.actionColor(e.action))}," - "+a(e.action),3),e.action==="delete"?(i(),n("span",Es," student mc_question with id "+a(e.id),1)):e.action==="create"?(i(),n("span",Ks," student mc_question for skill: ")):(i(),n("span",zs,[r(" mc question of student "),m(_,{class:"user-link",target:"_blank",to:"/users"},{default:k(()=>[r(a(e.studentName),1)]),_:2},1024),r(" on skill: ")])),e.action==="delete"||e.skill_deleted===1?(i(),n("span",{key:3,class:"skill-link",onClick:t[0]||(t[0]=y=>o.showWarnModal=!0)},a(e.skillName),1)):(i(),S(_,{key:4,class:"skill-link",target:"_blank",to:`/skills/${e.skillUrl}`},{default:k(()=>[r(a(e.skillName),1)]),_:2},1032,["to"]))]))),256))])])):(i(),n("div",Hs," The user has no recorded actions on multiple-choice questions ")),o.showWarnModal?(i(),n("div",Js,[s("div",Vs,[s("div",Ps,[Gs,s("div",Xs,[s("button",{type:"button",class:"btn green-btn w-25",onClick:t[1]||(t[1]=e=>o.showWarnModal=!1)},Zs)])])])])):d("",!0)],64)}const et=b(Os,[["render",Fs]]);const st={props:["userId"],setup(){return{skillsStore:x()}},data(){return{skillsData:[],rows:[],showWarnModal:!1,currentChooseSkill:""}},components:{},async created(){await this.getSubmittedSkillLogs();const l=[];this.skillsData.forEach(t=>{t.action==="approve"?l.push(this.getApproveSkillData(t)):l.push(this.getStillAwaitingData(t))}),Promise.all(l)},methods:{async getSubmittedSkillLogs(){const l=await fetch(`/user-actions/${this.userId}/new-skill`);this.skillsData=await l.json()},async getApproveSkillData(l){const t=new Date(l.create_date),u=t.toLocaleString("en-gb",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),h=t.toLocaleTimeString(),o=await this.skillsStore.findSkillById(l.content_id);this.rows.push({resourceId:l.content_id,action:l.action,date:u,time:h,id:l.id,skillName:o&&o.name,skillUrl:o.url&&o.url})},async getStillAwaitingData(l){const t=new Date(l.create_date),u=t.toLocaleString("en-gb",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),h=t.toLocaleTimeString(),c=await(await fetch(`/new-skills-awaiting-approval/show/${l.content_id}`)).json(),_=c.name&&c.name;this.rows.push({resourceId:l.content_id,action:l.action,date:u,time:h,id:l.id,skillName:_})},actionColor(l){switch(l){case"create":return"create-action";case"update":return"update-action";default:return"delete-action"}}}},tt={key:0,class:"container-md main-container"},ot={class:"d-flex flex-column"},lt={key:0,class:"ms-1"},it={key:1,class:"shake"},nt={key:2},at={id:"myModal",class:"modal"},rt={class:"modal-content skill-modal"},ct=s("div",{class:"modal-label"},"Skill is deleted !!",-1),dt={class:"d-flex justify-content-center"},ut=s("div",null,"OK",-1),_t=[ut];function ht(l,t,u,h,o,c){const _=v("router-link");return i(),n(w,null,[o.rows.length?(i(),n("div",tt,[s("div",ot,[(i(!0),n(w,null,$(o.rows,e=>(i(),n("div",null,[r(a(e.time)+" ("+a(e.date)+") - ",1),s("span",{class:p(c.actionColor(e.action))},a(e.action),3),e.skillName&&e.action!=="approve"?(i(),n("span",lt," skill: "+a(e.skillName),1)):d("",!0),e.skillName&&e.action==="approve"?(i(),S(_,{key:1,class:"skill-link ms-1",target:"_blank",to:`/skills/${e.skillUrl}`},{default:k(()=>[r(a(e.skillName)+".",1)]),_:2},1032,["to"])):d("",!0),e.skillName?d("",!0):(i(),n("span",{key:2,onClick:t[0]||(t[0]=y=>o.showWarnModal=!0),class:"no-skill-text ms-1"},"skill deleted."))]))),256))])])):(i(),n("div",it,"The user has no recorded actions on skills")),o.showWarnModal?(i(),n("div",nt,[s("div",at,[s("div",rt,[ct,s("div",dt,[s("button",{type:"button",class:"btn green-btn w-fit",onClick:t[1]||(t[1]=e=>o.showWarnModal=!1)},_t)])])])])):d("",!0)],64)}const kt=b(st,[["render",ht]]);const mt={setup(){const l=U(),t=D();return{usersStore:l,userDetailsStore:t}},data(){return{user:{id:this.$route.params.id,firstName:null,lastName:null,username:null,role:null,avatar:null},showFlags:!1,showSources:!1,showMcQuestions:!1,showStudentMcQuestions:!1,showSkills:!1,showSkillSubmittedByUsers:!1,mcQuestions:[],resources:[],flags:[],skillEdits:[],isTutorialComplete:!1,showTutorialTip1:!1}},components:{UserFlagActions:Ne,UserResourceActions:Xe,UserQuestionActions:bs,UserStudentMcQuestionActions:et,UserSkillActions:qs,UserSkillAwaitingForApprovalActions:kt},async created(){await this.getUserDetails(),this.checkIfTutorialComplete()},methods:{async getUserDetails(){this.usersStore.users.length<1&&await this.usersStore.getUsers();for(let l=0;l<this.usersStore.users.length;l++)this.usersStore.users[l].id==this.user.id&&(this.user.firstName=this.usersStore.users[l].first_name,this.user.lastName=this.usersStore.users[l].last_name,this.user.username=this.usersStore.users[l].username,this.user.role=this.usersStore.users[l].role,this.user.avatar=this.usersStore.users[l].avatar)},async checkIfTutorialComplete(){const t=await(await fetch("/users/check-tutorial-progress/user-activity-report/"+this.userDetailsStore.userId)).json();t==0?(this.isTutorialComplete=!1,this.showTutorialTip1=!0):t==1&&(this.isTutorialComplete=!0)},progressTutorial(l){l==1&&(this.showTutorialTip1=!1,this.markTutorialComplete())},markTutorialComplete(){let l="/users/mark-tutorial-complete/user-activity-report/"+this.userDetailsStore.userId;fetch(l,{method:"PUT",headers:{"Content-Type":"application/json"}})}}},pt={class:"container bg-light rounded p-3"},wt=s("h1",{class:"heading mb-2"},"User Activity Report",-1),ft={class:"row"},vt={class:"d-flex flex-column flex-md-row gap-3"},yt=["src"],St={class:"d-flex flex-column"},bt={id:"user-name"},gt={id:"role"},$t={class:"d-flex flex-column"},xt={class:"d-flex flex-row justify-content-between"},Ct=["title"],Mt={class:"secondary-heading h4"},Nt=s("path",{d:"M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"},null,-1),Ut=[Nt],Dt={key:0},It={class:"d-flex flex-column"},Tt={class:"d-flex flex-row justify-content-between"},jt=["title"],At={class:"secondary-heading h4"},Wt=s("path",{d:"M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"},null,-1),Lt=[Wt],Qt={key:0},qt={key:0,class:"mt-5 mb-3"},Ot={class:"d-flex flex-column"},Bt={class:"d-flex flex-row justify-content-between"},Rt=["title"],Et={class:"secondary-heading h4"},Kt=s("path",{d:"M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"},null,-1),zt=[Kt],Ht={key:0},Jt={class:"d-flex flex-column"},Vt={class:"d-flex flex-row justify-content-between"},Pt=["title"],Gt={class:"secondary-heading h4"},Xt=s("path",{d:"M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"},null,-1),Yt=[Xt],Zt={key:0},Ft={class:"d-flex flex-column"},eo={class:"d-flex flex-row justify-content-between"},so=["title"],to={class:"secondary-heading h4"},oo=s("path",{d:"M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"},null,-1),lo=[oo],io={key:0},no={class:"d-flex flex-column mb-3"},ao={class:"d-flex flex-row justify-content-between"},ro=["title"],co={class:"secondary-heading h4"},uo=s("path",{d:"M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"},null,-1),_o=[uo],ho={key:0},ko={key:0,class:"modal"},mo={class:"modal-content"},po={key:0},wo=s("p",null,"This is the User Activity List page.",-1),fo=s("p",null,"It shows what editors have been up to on the site.",-1);function vo(l,t,u,h,o,c){const _=v("UserFlagActions"),e=v("UserQuestionActions"),y=v("UserStudentMcQuestionActions"),C=v("UserResourceActions"),M=v("UserSkillActions"),N=v("UserSkillAwaitingForApprovalActions");return i(),n(w,null,[s("div",pt,[wt,s("div",ft,[s("div",vt,[s("img",{id:"activity-report-user-avatar",src:o.user.avatar},null,8,yt),s("div",St,[s("div",bt,a(o.user.username),1),s("div",gt,a(o.user.role),1)])])]),s("div",null,[s("div",$t,[s("div",xt,[s("div",{class:"log-type",onClick:t[0]||(t[0]=f=>o.showFlags=!o.showFlags),"b-on-hover":"",title:o.showFlags?"collapse":"expand"},[s("h2",Mt,[r(" Flags "),(i(),n("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 320 512",width:"22",height:"22",fill:"#667085",class:p([o.showFlags?"arrow-point-down mb-2":"arrow-point-up "])},Ut,2))])],8,Ct)]),m(g,{name:"dropdown"},{default:k(()=>[o.showFlags?(i(),n("div",Dt,[m(_,{ref:"contentFlagsPerUser",userId:o.user.id,onCloseFlagDiv:t[1]||(t[1]=f=>o.showFlags=!1)},null,8,["userId"])])):d("",!0)]),_:1})]),s("div",It,[s("div",Tt,[s("div",{class:"log-type",onClick:t[2]||(t[2]=f=>o.showMcQuestions=!o.showMcQuestions),"b-on-hover":"",title:o.showMcQuestions?"collapse":"expand"},[s("h2",At,[r(" Questions "),(i(),n("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 320 512",width:"22",height:"22",fill:"#667085",class:p([o.showMcQuestions?"arrow-point-down mb-2":"arrow-point-up"])},Lt,2))])],8,jt)]),m(g,{name:"dropdown"},{default:k(()=>[o.showMcQuestions?(i(),n("div",Qt,[m(e,{userId:o.user.id,onCloseMcQuestionDiv:t[3]||(t[3]=f=>o.showMcQuestions=!1)},null,8,["userId"])])):d("",!0)]),_:1})]),o.user.role==="admin"?(i(),n("hr",qt)):d("",!0),s("div",Ot,[s("div",Bt,[s("div",{class:"log-type",onClick:t[4]||(t[4]=f=>o.showStudentMcQuestions=!o.showStudentMcQuestions),"b-on-hover":"",title:o.showStudentMcQuestions?"collapse":"expand"},[s("h2",Et,[r(" Student Suggested MC Questions "),(i(),n("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 320 512",width:"22",height:"22",fill:"#667085",class:p([o.showStudentMcQuestions?"arrow-point-down mb-2":"arrow-point-up"])},zt,2))])],8,Rt)]),m(g,{name:"dropdown"},{default:k(()=>[o.showStudentMcQuestions?(i(),n("div",Ht,[m(y,{userId:o.user.id,onCloseMcQuestionDiv:t[5]||(t[5]=f=>o.showStudentMcQuestions=!1)},null,8,["userId"])])):d("",!0)]),_:1})]),s("div",Jt,[s("div",Vt,[s("div",{class:"log-type",onClick:t[6]||(t[6]=f=>o.showSources=!o.showSources),"b-on-hover":"",title:o.showSources?"collapse":"expand"},[s("h2",Gt,[r(" Sources "),(i(),n("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 320 512",width:"22",height:"22",fill:"#667085",class:p([o.showSources?"arrow-point-down mb-2":"arrow-point-up "])},Yt,2))])],8,Pt)]),m(g,{name:"dropdown"},{default:k(()=>[o.showSources?(i(),n("div",Zt,[m(C,{userId:o.user.id,onCloseResourceDiv:t[7]||(t[7]=f=>o.showSources=!1)},null,8,["userId"])])):d("",!0)]),_:1})]),s("div",Ft,[s("div",eo,[s("div",{class:"log-type",onClick:t[8]||(t[8]=f=>o.showSkills=!o.showSkills),"b-on-hover":"",title:o.showSkills?"collapse":"expand"},[s("h2",to,[r(" Skills "),(i(),n("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 320 512",width:"22",height:"22",fill:"#667085",class:p([o.showSkills?"arrow-point-down mb-2":"arrow-point-up "])},lo,2))])],8,so)]),m(g,{name:"dropdown"},{default:k(()=>[o.showSkills?(i(),n("div",io,[m(M,{userId:o.user.id,onCloseResourceDiv:t[9]||(t[9]=f=>o.showSkills=!1)},null,8,["userId"])])):d("",!0)]),_:1})]),s("div",no,[s("div",ao,[s("div",{class:"log-type",onClick:t[10]||(t[10]=f=>o.showSkillSubmittedByUsers=!o.showSkillSubmittedByUsers),"b-on-hover":"",title:o.showSkillSubmittedByUsers?"collapse":"expand"},[s("h2",co,[r(" User Suggested New Skills "),(i(),n("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 320 512",width:"22",height:"22",fill:"#667085",class:p([o.showSkillSubmittedByUsers?"arrow-point-down mb-2":"arrow-point-up "])},_o,2))])],8,ro)]),m(g,{name:"dropdown"},{default:k(()=>[o.showSkillSubmittedByUsers?(i(),n("div",ho,[m(N,{userId:o.user.id,onCloseResourceDiv:t[11]||(t[11]=f=>o.showSkillSubmittedByUsers=!1)},null,8,["userId"])])):d("",!0)]),_:1})])])]),o.showTutorialTip1?(i(),n("div",ko,[s("div",mo,[o.showTutorialTip1?(i(),n("div",po,[wo,fo,s("button",{class:"btn primary-btn",onClick:t[12]||(t[12]=f=>c.progressTutorial(1))}," next ")])):d("",!0)])])):d("",!0)],64)}const bo=b(mt,[["render",vo]]);export{bo as default};