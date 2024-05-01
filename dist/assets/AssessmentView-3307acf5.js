import{_ as f,o,c as l,d as e,g as b,l as p,i as k,b as u,t as m,F as _,k as S,e as A,D as M,a as y,p as g,f as v}from"./main-44dd4d9e.js";import{u as x}from"./UserSkillsStore-a5c81376.js";import{u as Q}from"./SettingsStore-f6b7c099.js";import{u as I}from"./AssessmentsStore-21b150f9.js";const N={data(){return{skillId:this.$route.params.id}},setup(){},mounted:function(){$("#summernote").summernote({placeholder:"write down your answer here",tabsize:2,height:120,toolbar:[["style",["style"]],["font",["bold","underline","clear"]],["color",["color"]],["para",["ul","ol","paragraph"]],["table",["table"]],["insert",["link","picture","video"]],["view",["fullscreen","codeview","help"]]],maximumImageFileSize:2048*1024,callbacks:{onImageUploadError:function(t){alert("Max image size is 2MB.")}}})},methods:{getAnswer(){return $("#summernote").summernote("code")},clearAnswer(){$("#summernote").summernote("code","")},setAnswer(t){$("#summernote").summernote("code",t)}}},T={class:"container mt-3"},L=e("div",{class:"row"},[e("div",{class:"mb-3"},[e("textarea",{id:"summernote",name:"answerdata"})])],-1),z=[L];function C(t,s,n,r,i,h){return o(),l("div",T,z)}const E=f(N,[["render",C]]);const D={setup(){const t=b(),s=x(),n=Q(),r=p(),i=I();return{userDetailsStore:t,userSkillsStore:s,settingsStore:n,skillsStore:r,assessmentsStore:i}},data(){return{loading:!0,skillId:this.$route.params.id,skill:{},mcQuestions:[],essayQuestions:[],questions:[],question:{},questionNumber:0,score:0,assessmentId:null,numMCQuestions:0,numEssayQuestions:0,totalNumOfQuestions:0,isAllQuestionsAnswered:!1,passModal:!1,failedModal:!1,waitForMarkModal:!1,oldAssessment:void 0,updatedAssessment:!1}},mounted:function(){$(".summernote").summernote({placeholder:"this is the summer note",tabsize:2,height:120,toolbar:[["style",["style"]],["font",["bold","underline","clear"]],["color",["color"]],["para",["ul","ol","paragraph"]],["table",["table"]],["insert",["link","picture","video"]],["view",["fullscreen","codeview","help"]]],maximumImageFileSize:2048*1024,callbacks:{onImageUploadError:function(t){alert("Max image size is 2MB.")}}})},async created(){this.settingsStore.quizMaxQuestions==null&&await this.settingsStore.getSettings(),await this.assessmentsStore.getAssessments();const t=this.assessmentsStore.assessments,s=await this.userDetailsStore.getUserDetails();this.oldAssessment=t.find(r=>r.student_id===s.userId),this.oldAssessment!==void 0&&(this.updatedAssessment=!0);let n;for(let r=0;r<this.skillsStore.skillsList.length;r++)this.skillsStore.skillsList[r].id==this.skillId&&(n=this.skillsStore.skillsList[r].type,this.skill=this.skillsStore.skillsList[r]);if(n!="super")await this.fetchMCQuestions(this.skillId);else{let r=[];for(let i=0;i<this.skillsStore.skillsList.length;i++)this.skillsStore.skillsList[i].parent==this.skillId&&this.skillsStore.skillsList[i].type=="sub"&&r.push(this.skillsStore.skillsList[i]);for(let i=0;i<r.length;i++)await this.fetchMCQuestions(r[i].id)}},components:{EssayAnswer:E},methods:{async fetchMCQuestions(t){fetch("/questions/"+t+"/multiple-choice").then(function(s){return s.json()}).then(s=>{this.mcQuestions=this.mcQuestions.concat(s)}).then(()=>{for(let n=0;n<this.mcQuestions.length;n++)this.mcQuestions[n].userAnswer=null,this.mcQuestions[n].questionType="mc";for(let n=0;n<this.mcQuestions.length;n++){var s=[];s.push({option:this.mcQuestions[n].correct_answer,index:1}),s.push({option:this.mcQuestions[n].incorrect_answer_1,index:2}),s.push({option:this.mcQuestions[n].incorrect_answer_2,index:3}),s.push({option:this.mcQuestions[n].incorrect_answer_3,index:4}),s.push({option:this.mcQuestions[n].incorrect_answer_4,index:5}),s=s.sort((r,i)=>.5-Math.random()),this.mcQuestions[n].answerOptions=s}}).then(()=>{this.fetchEssayQuestions(t)})},async fetchEssayQuestions(t){fetch("/questions/"+t+"/essay").then(function(s){return s.json()}).then(s=>{this.essayQuestions=this.essayQuestions.concat(s)}).then(()=>{for(let s=0;s<this.essayQuestions.length;s++)this.essayQuestions[s].userAnswer=null,this.essayQuestions[s].questionType="essay"}).then(()=>{this.questions=this.essayQuestions.concat(this.mcQuestions),this.questions=this.questions.sort((s,n)=>.5-Math.random()),this.questions.length>this.settingsStore.quizMaxQuestions&&(this.questions.length=this.settingsStore.quizMaxQuestions),this.question=this.questions[0],this.totalNumOfQuestions=this.questions.length}).then(()=>{this.loading=!1})},Next(){if(this.question.questionType=="essay"){const t=this.$refs.essayAnswer.getAnswer();this.questions[this.questionNumber].userAnswer=t,this.$refs.essayAnswer.clearAnswer()}this.questionNumber++,this.question=this.questions[this.questionNumber],this.question.questionType=="essay"&&this.question.userAnswer&&this.$refs.essayAnswer.setAnswer(this.question.userAnswer)},Previous(){if(this.question.questionType=="essay"){const t=this.$refs.essayAnswer.getAnswer();this.questions[this.questionNumber].userAnswer=t}this.questionNumber--,this.question=this.questions[this.questionNumber],this.question.questionType=="essay"&&this.$refs.essayAnswer.setAnswer(this.question.userAnswer)},Submit(){if(this.question.questionType=="essay"){const s=this.$refs.essayAnswer.getAnswer();this.questions[this.questionNumber].userAnswer=s}for(let s=0;s<this.questions.length;s++)this.questions[s].questionType=="mc"?(this.numMCQuestions++,this.questions[s].userAnswer==1&&this.score++):this.numEssayQuestions++;if(this.numEssayQuestions===0)this.score/this.numMCQuestions*100>=90?(this.MakeMastered(this.skill),this.passModal=!0):this.failedModal=!0;else{let s="POST";this.oldAssessment!==void 0&&(s="PUT");const n={method:s,headers:{"Content-Type":"application/json"},body:JSON.stringify({totalScore:this.totalNumOfQuestions,currentScore:this.score,numUnmarkedQuestions:this.numEssayQuestions})};var t="/assessments/"+this.userDetailsStore.userId+"/"+this.skillId;const r=()=>{this.waitForMarkModal=!0};fetch(t,n).then(function(i){return i.json()}).then(i=>{this.assessmentId=i.id,fetch("/unmarked-answers/delete/"+this.assessmentId,{method:"DELETE"}).then(()=>{for(let d=0;d<this.questions.length;d++)if(this.questions[d].questionType=="essay"){const a={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({answer:this.questions[d].userAnswer,questionId:this.questions[d].id})};var h="/unmarked-answers/add/"+this.assessmentId;fetch(h,a).then(function(w){r()})}})})}},async MakeMastered(t){await this.userSkillsStore.MakeMastered(this.userDetailsStore.userId,t)},UserAnswer(){for(let t=0;t<this.questions.length;t++)if(this.questions[t].userAnswer==null){this.isAllQuestionsAnswered=!1;return}else this.isAllQuestionsAnswered=!0},TestPass(){this.MakeMastered(this.skill)}}},c=t=>(g("data-v-2d7ecbcc"),t=t(),v(),t),P={key:0},U={key:1},F={key:0},V={id:"myModal",class:"modal"},B={class:"modal-content"},O=c(()=>e("div",{class:"mb-2"}," You are taking a new quiz for this skill while your old one is still waiting to be marked. Please note that your old answers will be replaced. ",-1)),j={class:"d-flex flex-row-reverse"},K={key:1,class:"container mt-5 mb-3 p-3 pt-2 mb-3",id:"question-container"},Y={class:"row"},H={class:"col d-flex my-2 gap-2 align-items-lg-center"},J={id:"question-number-div"},G={id:"question-content"},R={key:0},W={class:"form-check my-3"},X={class:"control control-checkbox"},Z={class:"my-auto mx-2 me-4"},ss=["value"],es=c(()=>e("div",{class:"control_indicator"},null,-1)),ts={key:1},is={class:"form-group"},ns={class:"mt-3 d-flex justify-content-end"},os={key:2,id:"question-content"},ls={key:2},rs={id:"myModal",class:"modal"},as={class:"modal-content"},us=c(()=>e("div",{class:"d-flex align-content-center"},[e("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",width:"50",height:"50",fill:"green"},[e("path",{d:"M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"})]),e("div",{class:"my-auto ms-2"}," Well done! You have now mastered this skill. ")],-1)),ds={class:"d-flex flex-row-reverse"},hs={key:3},cs={id:"myModal",class:"modal"},ms={class:"modal-content"},_s=c(()=>e("div",{class:"d-flex align-content-center"},[e("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",fill:"red",width:"50",height:"50"},[e("path",{d:"M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"})]),e("div",{class:"my-auto ms-2"}," You Failed This Time, Try Again Later ! ")],-1)),fs={class:"d-flex flex-row-reverse"},ps={key:4},ks={id:"myModal",class:"modal"},ys={class:"modal-content"},gs=c(()=>e("div",null," There is at least one question that needs to be marked manually. Please check whether you passed later. ",-1)),vs={class:"d-flex flex-row-reverse"};function ws(t,s,n,r,i,h){const d=k("EssayAnswer");return o(),l(_,null,[i.loading==!0?(o(),l("div",P,"Loading...")):u("",!0),i.loading==!1?(o(),l("div",U,[i.updatedAssessment?(o(),l("div",F,[e("div",V,[e("div",B,[O,e("div",j,[e("button",{type:"button",class:"btn green-btn",onClick:s[0]||(s[0]=a=>this.updatedAssessment=!1)}," OK ")])])])])):u("",!0),i.questions.length>0?(o(),l("div",K,[e("div",Y,[e("div",H,[e("div",J,m(this.questionNumber+1),1),e("div",G,m(i.question.question),1)]),this.question.questionType=="mc"?(o(),l("div",R,[(o(!0),l(_,null,S(this.question.answerOptions,(a,w)=>(o(),l("div",W,[e("label",X,[e("span",Z,m(a.option),1),A(e("input",{type:"radio",name:"nodeType",value:a.index,"onUpdate:modelValue":s[1]||(s[1]=q=>i.questions[this.questionNumber].userAnswer=q)},null,8,ss),[[M,i.questions[this.questionNumber].userAnswer]]),es])]))),256))])):this.question.questionType=="essay"?(o(),l("div",ts,[e("div",is,[y(d,{ref:"essayAnswer"},null,512)])])):u("",!0)]),e("div",ns,[this.questionNumber>0?(o(),l("button",{key:0,onClick:s[2]||(s[2]=a=>h.Previous()),class:"btn red-btn me-2"}," Previous ")):u("",!0),this.questionNumber!=i.questions.length-1?(o(),l("button",{key:1,onClick:s[3]||(s[3]=a=>h.Next()),class:"btn green-btn"}," Next ")):u("",!0),this.questionNumber==i.questions.length-1?(o(),l("button",{key:2,onClick:s[4]||(s[4]=a=>h.Submit()),class:"btn green-btn"}," Submit ")):u("",!0)])])):(o(),l("div",os," There is no quiz for this skill yet. Please check again soon. "))])):u("",!0),i.passModal?(o(),l("div",ls,[e("div",rs,[e("div",as,[us,e("div",ds,[e("button",{type:"button",class:"btn green-btn",onClick:s[5]||(s[5]=a=>this.$router.push("/skills/"+this.skillId))}," Great! ")])])])])):u("",!0),i.failedModal?(o(),l("div",hs,[e("div",cs,[e("div",ms,[_s,e("div",fs,[e("button",{type:"button",class:"btn red-btn",onClick:s[6]||(s[6]=a=>this.$router.push("/skills/"+this.skillId))}," OK ")])])])])):u("",!0),i.waitForMarkModal?(o(),l("div",ps,[e("div",ks,[e("div",ys,[gs,e("div",vs,[e("button",{type:"button",class:"btn green-btn",onClick:s[7]||(s[7]=a=>this.$router.push("/"))}," OK ")])])])])):u("",!0)],64)}const qs=f(D,[["render",ws],["__scopeId","data-v-2d7ecbcc"]]),bs="/images/skill-avatar/recurso.png";const Ss={setup(){return{skillsStore:p()}},data(){return{skillId:this.$route.params.id,skill:{name:null,image:null,firstAncestorId:null,levelInHierarchy:null}}},async mounted(){this.skillsStore.skillsList.length==0&&await this.skillsStore.getSkillsList();for(let t=0;t<this.skillsStore.skillsList.length;t++)this.skillId==this.skillsStore.skillsList[t].id&&(this.skill.name=this.skillsStore.skillsList[t].name,this.skill.image=this.skillsStore.skillsList[t].image,this.skill.firstAncestorId=this.skillsStore.skillsList[t].first_ancestor,this.skill.levelInHierarchy=this.skillsStore.skillsList[t].hierarchy_level)},components:{Assessment:qs}},As=t=>(g("data-v-7e21eeff"),t=t(),v(),t),Ms={id:"banner"},xs=["src"],Qs={class:"container mt-3"},$s={class:"d-flex"},Is=["src"],Ns={key:1,src:bs,alt:"default skill icon"},Ts={class:"ms-3"},Ls=As(()=>e("div",{class:"mt-4 mb-4"},[e("hr",{class:"border border-2 opacity-100 w-75",id:"assessment-horizontal-line"})],-1));function zs(t,s,n,r,i,h){const d=k("Assessment");return o(),l(_,null,[e("div",Ms,[e("img",{src:"/images/banners/skills-banner.png",class:"img-fluid"},null,8,xs)]),e("div",Qs,[e("div",$s,[this.skill.image?(o(),l("img",{key:0,src:this.skill.image},null,8,Is)):(o(),l("img",Ns)),e("h1",Ts,m(this.skill.name)+" Quiz",1)]),Ls,y(d)])],64)}const Us=f(Ss,[["render",zs],["__scopeId","data-v-7e21eeff"]]);export{Us as default};