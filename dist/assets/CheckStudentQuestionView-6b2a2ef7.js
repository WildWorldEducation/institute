import{_ as v,q as k,g as b,a as S,B as p,o as n,c as r,d as t,t as _,w as u,y as f,b as l,F as q,z as g,I as x,v as y,M,p as C,f as Q}from"./main-663818cf.js";import{u as V}from"./StudentMCQuestionsStore-9f9de1c1.js";const E={setup(){const o=V(),s=k(),m=b(),h=S();return{studentMCQuestionsStore:o,usersStore:s,skillsStore:m,userDetailsStore:h}},data(){return{studentQuestionId:this.$route.params.id,question:{},answers:[{text:"",show:!0},{text:"",show:!0},{text:"",show:!0},{text:"",show:!0},{text:"",show:!0}],validate:{validated:!1,name:!1,question:!1,answer:!1,explanation:!1},isEditMode:!1,studentName:null,skillName:null,skillId:null,isMobileCheck:window.innerWidth}},async created(){this.usersStore.users.length==0&&await this.usersStore.getUsers(),this.skillsStore.skillsList.length==0&&await this.skillsStore.getSkillsList(),await this.getStudentQuestion()},methods:{async getStudentQuestion(){fetch("/questions/student-mc-questions/"+this.studentQuestionId).then(function(o){return o.json()}).then(o=>{this.question=o.question,this.answers=o.answers;for(let s=0;s<this.usersStore.users.length;s++)this.question.student_id==this.usersStore.users[s].id&&(this.studentName=this.usersStore.users[s].username);for(let s=0;s<this.skillsStore.skillsList.length;s++)this.question.skill_id==this.skillsStore.skillsList[s].id&&(this.skillName=this.skillsStore.skillsList[s].name)})},deleteStudentQuestion(){confirm("Delete this question?")&&(this.studentMCQuestionsStore.deleteStudentMCQuestion(this.studentQuestionId),p.go(-1))},saveToQuestionBank(){this.question.name="User: "+this.question.student_id;const o={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:this.question,answers:this.answers,skill_id:this.question.skill_id})};var s="/questions/mc-questions/add";fetch(s,o).then(()=>{this.studentMCQuestionsStore.deleteStudentMCQuestion(this.studentQuestionId),p.go(-1)})},editMode(){this.isEditMode=!0},addAnswer(){this.answers[2].show==!1?this.answers[2].show=!0:this.answers[3].show==!1?this.answers[3].show=!0:this.answers[4].show==!1&&(this.answers[4].show=!0)},removeAnswer(){this.answers[4].show==!0?(this.answers[4].show=!1,this.question.correct_answer==5&&(this.question.correct_answer=4)):this.answers[3].show==!0?(this.answers[3].show=!1,this.question.correct_answer==4&&(this.question.correct_answer=3)):this.answers[2].show==!0&&(this.answers[2].show=!1,this.question.correct_answer==3&&(this.question.correct_answer=2))}}},c=o=>(C("data-v-06766e51"),o=o(),Q(),o),A={class:"container p-3 bg-light rounded"},I=c(()=>t("h1",{class:"heading"},"Review Suggested Question",-1)),U={class:"main-content-container container-fluid"},D={class:"row p-0"},L={id:"form-container",class:"col p-4"},N={class:"mb-3"},z=c(()=>t("h2",{class:"secondary-heading h4"},"Question",-1)),B=["disabled"],H={key:0,class:"form-validate"},O={class:"secondary-heading h4"},T={class:"d-flex answer-option"},j=["disabled","onUpdate:modelValue","id"],R={key:0,class:"form-validate"},F={class:"form-check"},J=["disabled","id","value"],P=["for"],W={class:"d-flex"},G=["disabled"],K=c(()=>t("svg",{"data-v-ea3cd1bf":"",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",width:"15",height:"15",fill:"white"},[t("path",{"data-v-ea3cd1bf":"",d:"M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"})],-1)),X={key:0},Y=["disabled"],Z=c(()=>t("svg",{width:"20",height:"20",fill:"#ffffff",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 448 512"},[t("path",{d:"M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"})],-1)),$={key:0},ss={class:"mt-2 mb-3 form-check"},es=["disabled"],ts=c(()=>t("label",{for:"randomOrder",class:"form-check-label"},"Show answers in random order",-1)),is={class:"mb-3"},os=c(()=>t("h2",{class:"secondary-heading h4"},"Explanation",-1)),ns=["disabled"],rs={key:0,class:"form-validate"},ls={key:0,class:"d-flex justify-content-end gap-4"};function ds(o,s,m,h,e,d){return n(),r("div",A,[I,t("p",null,_(e.studentName)+" suggested the following question, for the skill "+_(e.skillName),1),t("div",U,[t("div",D,[t("div",L,[t("div",N,[z,u(t("textarea",{disabled:!e.isEditMode,rows:"1","onUpdate:modelValue":s[0]||(s[0]=i=>e.question.text=i),class:"form-control"},`
                        `,8,B),[[f,e.question.text]]),e.validate.question&&(e.question.text===""||e.question.text===null)?(n(),r("div",H," please enter a question ! ")):l("",!0)]),(n(!0),r(q,null,g(e.answers,(i,a)=>u((n(),r("div",{key:a,class:"mb-3"},[t("h2",O," Answer "+_(a+1),1),t("div",T,[u(t("input",{disabled:!e.isEditMode,"onUpdate:modelValue":w=>i.text=w,id:"answer"+(a+1),placeholder:"Enter answer option",type:"text",class:"form-control"},null,8,j),[[f,i.text]])]),e.validate.validated&&i.text===""?(n(),r("div",R," please enter a correct answer ! ")):l("",!0),t("div",F,[u(t("input",{disabled:!e.isEditMode,class:"form-check-input",type:"radio",id:"correct"+(a+1),name:"correctAnswer",value:a+1,"onUpdate:modelValue":s[1]||(s[1]=w=>e.question.correct_answer=w)},null,8,J),[[M,e.question.correct_answer]]),t("label",{for:"correct"+(a+1),class:""},"Set as correct",8,P)])])),[[y,i.show]])),128)),t("div",W,[e.answers[2].show==!0?(n(),r("button",{key:0,onClick:s[2]||(s[2]=i=>d.removeAnswer()),"data-v-ea3cd1bf":"",type:"button",class:"btn red-btn me-2",title:"Delete answer",disabled:!e.isEditMode},[K,e.isMobileCheck>576?(n(),r("span",X," Remove Answer")):l("",!0)],8,G)):l("",!0),e.answers[4].show==!1?(n(),r("button",{key:1,onClick:s[3]||(s[3]=(...i)=>d.addAnswer&&d.addAnswer(...i)),class:"btn primary-btn",disabled:!e.isEditMode},[Z,e.isMobileCheck>576?(n(),r("span",$,"Add Answer")):l("",!0)],8,Y)):l("",!0)]),t("div",ss,[u(t("input",{disabled:!e.isEditMode,type:"checkbox",id:"randomOrder","onUpdate:modelValue":s[4]||(s[4]=i=>e.question.is_random=i),class:"form-check-input"},null,8,es),[[x,e.question.is_random]]),ts]),t("div",is,[os,u(t("textarea",{disabled:!e.isEditMode,"onUpdate:modelValue":s[5]||(s[5]=i=>e.question.explanation=i),class:"form-control",rows:"3"},null,8,ns),[[f,e.question.explanation]]),e.validate.explanation&&(e.question.explanation===""||e.question.explanation===null)?(n(),r("div",rs," please enter an explanation ! ")):l("",!0)]),h.userDetailsStore.role=="admin"||h.userDetailsStore.role=="instructor"?(n(),r("div",ls,[t("a",{class:"btn red-btn",onClick:s[6]||(s[6]=i=>d.editMode())},"Edit"),t("a",{class:"btn red-btn",onClick:s[7]||(s[7]=i=>d.deleteStudentQuestion())},"Delete"),t("button",{class:"btn primary-btn",onClick:s[8]||(s[8]=i=>d.saveToQuestionBank())}," Save ")])):l("",!0)])])])])}const cs=v(E,[["render",ds],["__scopeId","data-v-06766e51"]]);export{cs as default};