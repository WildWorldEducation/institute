import{_ as M,o as n,c as o,d as s,w as g,y as Q,F as w,z as q,b as u,a as z,H as F,u as R,r as p,i as S,j as $,m as k,v as V,t as _,M as E,I as B,l as A,p as N,f as L,g as P,e as T,n as O}from"./main-a51f4751.js";import{u as H}from"./SettingsStore-7d7007b5.js";import{u as Y}from"./AssessmentsStore-54944f3b.js";import{F as D}from"./FlagModals-7c5359cd.js";const J={data(){return{skillId:this.$route.params.id,essayAnswer:""}},setup(){},methods:{getAnswer(){return this.essayAnswer},clearAnswer(){this.essayAnswer=""},setAnswer(i){this.essayAnswer=i}}},K={class:"container mt-3"},W={class:"row"},G={class:"mb-3"};function X(i,e,r,c,t,a){return n(),o("div",K,[s("div",W,[s("div",G,[g(s("textarea",{"onUpdate:modelValue":e[0]||(e[0]=m=>t.essayAnswer=m),class:"form-control",id:"exampleFormControlTextarea1",rows:"3"},null,512),[[Q,t.essayAnswer]])])])])}const Z=M(J,[["render",X]]);const ss={data(){return{skillId:this.$route.params.id,imageAnswer:[]}},props:["numImagesRequired"],methods:{getAnswer(){return this.imageAnswer},clearAnswer(){this.imageAnswer=[]},setAnswer(i){this.imageAnswer=i},onFileChange(i){var e=i.target.files||i.dataTransfer.files;if(e.length>0)for(var r=0;r<e.length;r++){var c=new FileReader;c.readAsDataURL(e[r])}if(e.length)for(let t=0;t<e.length;t++){if(e[t].size>7e5){alert("image is too big");return}this.createImage(e[t],t)}},createImage(i,e){var r=new Image,c=new FileReader,t=this;c.onload=a=>{t.image=a.target.result,this.imageAnswer.push(a.target.result),r.src=a.target.result},c.readAsDataURL(i)},removeImages:function(i){this.imageAnswer=[]}}},es={class:"mb-3"},ts={class:"main-content-container container-fluid"},is={class:"row"},ns={class:"col-lg-4"},os=["onUpdate:modelValue"],rs={class:"row"},ls={class:"preview col-xl-3 col-lg-4 col-md-6 my-2"},as=["src"];function us(i,e,r,c,t,a){return n(),o("div",es,[s("div",ts,[s("div",is,[s("div",ns,[s("div",null,[(n(!0),o(w,null,q(r.numImagesRequired,(m,h)=>g((n(),o("input",{class:"form-control mb-2","onUpdate:modelValue":l=>t.imageAnswer[h]=l,placeholder:"add image link"},null,8,os)),[[Q,t.imageAnswer[h]]])),256))])])]),s("div",rs,[(n(!0),o(w,null,q(t.imageAnswer.length,(m,h)=>(n(),o("div",ls,[s("img",{src:t.imageAnswer[h]},null,8,as)]))),256))]),t.imageAnswer.length>0?(n(),o("button",{key:0,class:"btn red-btn mt-3",onClick:e[0]||(e[0]=(...m)=>a.removeImages&&a.removeImages(...m))}," Start again ")):u("",!0)])])}const cs=M(ss,[["render",us]]);const hs={setup(){const i=z(),e=F(),r=R();return{userDetailsStore:i,userSkillsStore:e,skillTreeStore:r}},data(){return{skillId:this.$route.params.id,question:{text:"",explanation:"",correct_answer:1,is_random:!1},answers:[{text:"",show:!0},{text:"",show:!0},{text:"",show:!0},{text:"",show:!0},{text:"",show:!0}],validate:{validated:!1,name:!1,question:!1,answer:!1,explanation:!1},studentId:null,reshake:!1,questionAddedModal:!1,questionSubmitted:!1,submittedMess:!1}},async mounted(){},methods:{Submit(){if(this.studentId=this.userDetailsStore.userId,this.validate.validated=!1,(this.question.text===""||this.question.text===null)&&(this.validate.question=!0,this.validate.validated=!0),this.answers.forEach(r=>{r.show==!0&&r.text==""&&(this.validate.validated=!0)}),(this.question.explanation===""||this.question.explanation===null)&&(this.validate.explanation=!0,this.validate.validated=!0),this.validate.validated){this.reshake=!0;return}const i={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:this.question,answers:this.answers,skill_id:this.skillId,student_id:this.studentId})};var e="/questions/student-mc-questions/add";fetch(e,i).then(()=>{this.questionAddedModal=!0,this.questionSubmitted=!0,window.scrollTo(0,0)})},showSubmittedMess(){this.submittedMess=!0,setTimeout(()=>{this.submittedMess=!1},2e3)},skipAddingQuestion(){this.questionSubmitted=!0,window.scrollTo(0,0)},addAnswer(){this.answers[2].show==!1?this.answers[2].show=!0:this.answers[3].show==!1?this.answers[3].show=!0:this.answers[4].show==!1&&(this.answers[4].show=!0)},removeAnswer(){this.answers[4].show==!0?(this.answers[4].show=!1,this.question.correct_answer==5&&(this.question.correct_answer=4)):this.answers[3].show==!0?(this.answers[3].show=!1,this.question.correct_answer==4&&(this.question.correct_answer=3)):this.answers[2].show==!0&&(this.answers[2].show=!1,this.question.correct_answer==3&&(this.question.correct_answer=2))}}},ds={class:"student-add-result pb-3 w-100"},ms={class:"main-content-container container-fluid"},_s={class:"row p-0"},fs={key:1,id:"form-container",class:"col p-4"},ws={key:0,class:"d-flex flex-column"},gs=s("div",{id:"congrats-tile"}," Well done, you have passed! ",-1),ps=s("p",null," Would you like to add your own question for this subject? If it is accepted, your reputation score will increase. ",-1),ys=[gs,ps],vs={key:1,class:"d-flex flex-column shake"},ks=s("div",{id:"congrats-tile"}," Thank you for submitting your question. ",-1),qs=[ks],bs={class:"mb-3"},xs=s("label",{for:"last_name",class:"form-label"},"Question",-1),As={key:0,class:"form-validate"},Ss={class:"form-label"},Ms={class:"d-flex answer-option"},Is=["onUpdate:modelValue","id"],Ts={key:0,class:"form-validate"},Qs={class:"form-check"},$s=["id","value"],Cs=["for"],zs=s("svg",{"data-v-ea3cd1bf":"",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",width:"15",height:"15",fill:"white"},[s("path",{"data-v-ea3cd1bf":"",d:"M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"})],-1),Ns={class:"mb-3"},Ls=s("svg",{width:"20",height:"20",fill:"#ffffff",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 448 512"},[s("path",{d:"M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"})],-1),Fs={class:"mb-3 form-check"},Rs=s("label",{for:"randomOrder",class:"form-check-label"},"Show answers in random order",-1),Vs={class:"mb-3"},Es=s("label",{class:"form-label"},"Explanation",-1),Ps={key:0,class:"form-validate"},Ds={class:"d-flex justify-content-end gap-4"},Us={key:3,class:"form-validate shake"},js={key:0},Bs={id:"myModal",class:"modal"},Os={class:"modal-content"},Hs=s("div",{class:"d-flex align-content-center"},[s("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",width:"50",height:"50",fill:"green"},[s("path",{d:"M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"})]),s("div",{class:"my-auto ms-2"}," Your question have been submitted ")],-1),Ys={class:"d-flex flex-row-reverse"};function Js(i,e,r,c,t,a){const m=p("RouterLink");return n(),o(w,null,[s("div",ds,[s("div",ms,[s("div",_s,[t.questionSubmitted?(n(),S(m,{key:0,class:"btn btn-light primary-btn",style:{width:"136px"},to:"/skills"},{default:$(()=>[k(" Back to skills ")]),_:1})):u("",!0),t.questionSubmitted?u("",!0):(n(),o("div",fs,[t.questionSubmitted?u("",!0):(n(),o("div",ws,ys)),t.questionSubmitted?(n(),o("div",vs,qs)):u("",!0),s("div",bs,[xs,g(s("textarea",{"onUpdate:modelValue":e[0]||(e[0]=h=>t.question.text=h),rows:"1",class:"form-control"},`
                        `,512),[[Q,t.question.text]]),t.validate.question&&(t.question.text===""||t.question.text===null)?(n(),o("div",As," please enter a question ! ")):u("",!0)]),(n(!0),o(w,null,q(t.answers,(h,l)=>g((n(),o("div",{key:l,class:"mb-3"},[s("label",Ss,"Answer "+_(l+1)+":",1),s("div",Ms,[g(s("input",{"onUpdate:modelValue":d=>h.text=d,id:"answer"+(l+1),placeholder:"Enter answer option",type:"text",class:"form-control"},null,8,Is),[[Q,h.text]])]),t.validate.validated&&h.text===""?(n(),o("div",Ts," please enter a correct answer ! ")):u("",!0),s("div",Qs,[g(s("input",{class:"form-check-input",type:"radio",id:"correct"+(l+1),name:"correctAnswer",value:l+1,"onUpdate:modelValue":e[1]||(e[1]=d=>t.question.correct_answer=d)},null,8,$s),[[E,t.question.correct_answer]]),s("label",{for:"correct"+(l+1),class:""},"Set as correct",8,Cs)])])),[[V,h.show]])),128)),t.answers[2].show==!0?(n(),o("button",{key:2,onClick:e[2]||(e[2]=h=>a.removeAnswer()),"data-v-ea3cd1bf":"",type:"button",class:"btn red-btn p-2 mb-2",title:"Delete answer"},[zs,k(" Remove Answer ")])):u("",!0),s("div",Ns,[t.answers[4].show==!1?(n(),o("button",{key:0,onClick:e[3]||(e[3]=(...h)=>a.addAnswer&&a.addAnswer(...h)),class:"btn primary-btn"},[Ls,k(" Add Answer ")])):u("",!0)]),s("div",Fs,[g(s("input",{type:"checkbox",id:"randomOrder","onUpdate:modelValue":e[4]||(e[4]=h=>t.question.is_random=h),class:"form-check-input"},null,512),[[B,t.question.is_random]]),Rs]),s("div",Vs,[Es,g(s("textarea",{"onUpdate:modelValue":e[5]||(e[5]=h=>t.question.explanation=h),class:"form-control",rows:"3"},null,512),[[Q,t.question.explanation]]),t.validate.explanation&&(t.question.explanation===""||t.question.explanation===null)?(n(),o("div",Ps," please enter a explanation ! ")):u("",!0)]),s("div",Ds,[s("button",{class:"btn btn-light",onClick:e[6]||(e[6]=(...h)=>a.skipAddingQuestion&&a.skipAddingQuestion(...h))}," Skip "),s("button",{class:"btn primary-btn",onClick:e[7]||(e[7]=h=>t.questionSubmitted?a.showSubmittedMess():a.Submit())}," Submit ")]),t.submittedMess?(n(),o("div",Us," You already submitted a question !! ")):u("",!0)]))])])]),t.questionAddedModal?(n(),o("div",js,[s("div",Bs,[s("div",Os,[Hs,s("div",Ys,[s("button",{type:"button",class:"btn green-btn",onClick:e[8]||(e[8]=h=>t.questionAddedModal=!1)}," ok "),t.questionSubmitted?(n(),S(m,{key:0,class:"btn btn-light primary-btn mx-2",to:"/skills"},{default:$(()=>[k(" Back to skills ")]),_:1})):u("",!0)])])])])):u("",!0)],64)}const U=M(hs,[["render",Js]]);const Ks={setup(){return{userDetailsStore:z()}},components:{StudentAddMCQuestion:U,FlagModals:D},data(){return{assessmentResult:"",finishDate:"",finishTime:"",parent:"",score:0,totalScore:1,scorePercent:0,questions:[],essayQuestionsLength:0,correctIndex:[],passModal:!1,failsModal:!1,waitForMarkModal:!1,questionToFlagId:0,questionToFlagType:"",showFlaggingModal:!1}},props:["skill","isManualEssayMarking"],mounted(){switch(this.assessmentResult=this.$parent.assessmentStatus,this.assessmentResult){case"pass":this.passModal=!0;break;case"fails":this.failsModal=!0;break;case"wait for essay answers to be mark":this.waitForMarkModal=!0;break}this.finishDate=this.$parent.finishTime.toLocaleString(void 0,{weekday:"long",year:"numeric",month:"long",day:"numeric"}),this.finishTime=this.$parent.finishTime.toLocaleTimeString(),this.score=this.$parent.score,this.isManualEssayMarking==1?this.totalScore=this.$parent.numMCQuestions:this.totalScore=this.$parent.questions.length,this.totalScore!==0&&(this.scorePercent=Math.floor(this.score/this.totalScore*100)),this.isManualEssayMarking==1?(this.questions=this.$parent.questions.filter(i=>i.questionType==="mc"),this.essayQuestionsLength=this.$parent.questions.length-this.questions.length):this.questions=this.$parent.questions,this.correctIndex=[1]},methods:{setQuestionForFlagging(i,e){this.questionToFlagId=i,this.questionToFlagType=e,this.showFlaggingModal=!0}}},f=i=>(N("data-v-f26f33bd"),i=i(),L(),i),Ws={class:"container pb-3"},Gs={class:"d-flex flex-md-row flex-column gap-3"},Xs={class:"assessment-info"},Zs=f(()=>s("span",{class:"info-label"},"Result:",-1)),se={key:0,xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 64 512",fill:"red",height:"14",width:"14",class:"status-icon"},ee=f(()=>s("path",{d:"M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64V320c0 17.7 14.3 32 32 32s32-14.3 32-32V64zM32 480a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"},null,-1)),te=[ee],ie={key:1,xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 448 512",fill:"green",height:"14",width:"14",class:"mb-1"},ne=f(()=>s("path",{d:"M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"},null,-1)),oe=[ne],re=f(()=>s("span",{class:"info-label"},"Finish Date: ",-1)),le={class:"info-value"},ae={id:"finish-time"},ue={class:"hover-cursor","b-on-hover":"",title:"you need to score above 80% to pass the assessment"},ce=f(()=>s("span",{class:"info-label"},"Score: ",-1)),he={class:"info-value"},de=f(()=>s("span",null,"*",-1)),me={key:0,class:"essay-warning"},_e={class:"mc-question-result"},fe=["onClick"],we={xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 448 512",style:{height:"22px",opacity:"0.5"}},ge=f(()=>s("path",{fill:"#8f7bd6",d:"M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32V64 368 480c0 17.7 14.3 32 32 32s32-14.3 32-32V352l64.3-16.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30V66.1c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L64 48V32z"},null,-1)),pe=[ge],ye={class:"question"},ve={class:"d-flex flex-column"},ke={class:"form-check my-3"},qe={class:"control control-checkbox"},be={key:0,class:"correct-indicate"},xe={key:1,class:"user-answer-indicate"},Ae={key:2,class:"correct-indicate"},Se=["value","disabled"],Me={class:"control_indicator"},Ie={key:0,class:"checked"},Te={key:1},Qe=f(()=>s("span",{class:"explain-label"},"Your answer:",-1)),$e={class:"explain-text"},Ce={key:2},ze=f(()=>s("span",{class:"explain-label"},"Your answer:",-1)),Ne=["src"],Le={key:3,class:"explain-answer"},Fe=f(()=>s("div",{class:"explain-label"},"Explanation:",-1)),Re={class:"explain-text"},Ve={key:0},Ee={id:"myModal",class:"modal"},Pe={class:"modal-content"},De=f(()=>s("div",{class:"d-flex align-content-center"},[s("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",width:"50",height:"50",fill:"green"},[s("path",{d:"M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"})]),s("div",{class:"my-auto ms-2"}," Well done! You passed and have now mastered the skill! ")],-1)),Ue={class:"d-flex flex-row-reverse"},je={key:1},Be={id:"myModal",class:"modal"},Oe={class:"modal-content"},He=f(()=>s("div",{class:"d-flex align-content-center"},[s("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",fill:"red",width:"50",height:"50"},[s("path",{d:"M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"})]),s("div",{class:"my-auto ms-2"}," You failed this time, try again later! ")],-1)),Ye={class:"d-flex flex-row-reverse"},Je={key:2},Ke={id:"myModal",class:"modal"},We={class:"modal-content"},Ge=f(()=>s("div",null," There is at least one question that needs to be marked by your instructor. Please check whether you passed later. ",-1)),Xe={class:"d-flex flex-row-reverse"};function Ze(i,e,r,c,t,a){const m=p("StudentAddMCQuestion"),h=p("FlagModals");return n(),o(w,null,[s("div",Ws,[s("div",Gs,[s("div",Xs,[s("div",null,[Zs,s("span",{class:A(t.assessmentResult=="pass"?"student-pass":"student-fail")},[k(_(t.assessmentResult)+" ",1),t.assessmentResult==="failed"?(n(),o("svg",se,te)):u("",!0),t.assessmentResult==="pass"?(n(),o("svg",ie,oe)):u("",!0)],2)]),s("div",null,[re,s("span",le,[k(_(t.finishDate)+" ",1),s("span",ae," at "+_(t.finishTime),1)])]),s("div",ue,[ce,s("span",he,_(t.score)+" out "+_(t.totalScore),1),k(" ( "+_(t.scorePercent)+"%) ",1),de]),r.isManualEssayMarking==1&&t.essayQuestionsLength!=0?(n(),o("div",me," There are "+_(t.essayQuestionsLength)+" answers that needed to be mark by your instructor ",1)):u("",!0)]),t.assessmentResult==="pass"?(n(),S(m,{key:0})):u("",!0)]),(n(!0),o(w,null,q(t.questions,l=>(n(),o("div",_e,[l.questionType=="mc"?(n(),o("div",{key:0,"b-tooltip.hover":"",title:"flag this question for review",onClick:d=>a.setQuestionForFlagging(l.id,"mc_question"),class:"flagging-icon",style:{height:"50px"}},[(n(),o("svg",we,pe))],8,fe)):u("",!0),s("div",{class:A(l.userAnswer==l.correct_answer||l.isCorrect==!0?"correct-label":"wrong-label")},_(l.userAnswer==l.correct_answer||l.isCorrect==!0?"Correct !!":"Incorrect !!"),3),s("div",ye,_(l.question),1),s("div",ve,[l.questionType=="mc"?(n(!0),o(w,{key:0},q(l.answerOptions,(d,x)=>(n(),o("div",ke,[s("label",qe,[s("div",{class:A(["my-auto mx-2 me-4 answer-option ",d.index==l.correct_answer?" correct-answer":l.userAnswer==d.index?"user-answer":" incorrect-answer"])},[k(_(d.option)+" ",1),d.index==l.correct_answer&&l.userAnswer!==l.correct_answer?(n(),o("span",be," (correct answer)")):u("",!0),d.index!==l.correct_answer&&l.userAnswer==d.index?(n(),o("span",xe," (your answer)")):u("",!0),d.index==l.correct_answer&&l.userAnswer==l.correct_answer?(n(),o("span",Ae," (you are correct !)")):u("",!0)],2),s("input",{type:"radio",name:"nodeType",value:d.index,disabled:d.index!=l.correct_answer},null,8,Se),s("div",Me,[d.index==l.correct_answer?(n(),o("div",Ie)):u("",!0)])])]))),256)):l.questionType=="essay"?(n(),o("div",Te,[Qe,s("div",$e,_(l.userAnswer),1)])):l.questionType=="image"?(n(),o("div",Ce,[ze,(n(!0),o(w,null,q(l.userAnswer.length,(d,x)=>(n(),o("img",{src:l.userAnswer[x],width:"80"},null,8,Ne))),256))])):u("",!0),l.questionType=="mc"||l.isCorrect==!1?(n(),o("div",Le,[Fe,s("div",Re,_(l.explanation),1)])):u("",!0)])]))),256))]),t.passModal?(n(),o("div",Ve,[s("div",Ee,[s("div",Pe,[De,s("div",Ue,[s("button",{type:"button",class:"btn green-btn",onClick:e[0]||(e[0]=l=>t.passModal=!1)}," Great! ")])])])])):u("",!0),t.failsModal?(n(),o("div",je,[s("div",Be,[s("div",Oe,[He,s("div",Ye,[s("button",{type:"button",class:"btn red-btn",onClick:e[1]||(e[1]=l=>t.failsModal=!1)}," OK ")])])])])):u("",!0),t.waitForMarkModal?(n(),o("div",Je,[s("div",Ke,[s("div",We,[Ge,s("div",Xe,[s("button",{type:"button",class:"btn green-btn",onClick:e[2]||(e[2]=l=>t.waitForMarkModal=!1)}," OK ")])])])])):u("",!0),t.showFlaggingModal?(n(),S(h,{key:3,userId:c.userDetailsStore.userId,contentType:t.questionToFlagType,contentId:t.questionToFlagId},null,8,["userId","contentType","contentId"])):u("",!0)],64)}const st=M(Ks,[["render",Ze],["__scopeId","data-v-f26f33bd"]]);const et={setup(){const i=z(),e=H(),r=P(),c=Y(),t=F(),a=R();return{userDetailsStore:i,settingsStore:e,skillsStore:r,assessmentsStore:c,userSkillsStore:t,skillTreeStore:a}},data(){return{loading:!0,skillId:this.$route.params.id,skill:{},mcQuestions:[],mcQuestionsAnswer:[],essayQuestions:[],imageQuestions:[],questions:[],question:{},questionNumber:0,score:0,assessmentId:null,numMCQuestions:0,numEssayQuestions:0,numImageQuestions:0,totalNumOfQuestions:0,isAllQuestionsAnswered:!1,waitForMarkModal:!1,oldAssessment:void 0,updatedAssessment:!1,showFlaggingModal:!1,flagContentType:"",isQuizPassed:!1,answerHoveredIndex:1/0,showResult:!1,assessmentStatus:"",haveEssayQuestion:!1,finishTime:null,needToSelectInstructor:!1,aiLoading:!1,numOfImagesRequired:1}},async created(){this.settingsStore.quizMaxQuestions==null&&await this.settingsStore.getSettings(),await this.assessmentsStore.getAssessments();const i=this.assessmentsStore.assessments,e=await this.userDetailsStore.getUserDetails();let r;for(let c=0;c<this.skillsStore.skillsList.length;c++)this.skillsStore.skillsList[c].id==this.skillId&&(r=this.skillsStore.skillsList[c].type,this.skill=this.skillsStore.skillsList[c]);if(this.oldAssessment=i.find(c=>c.student_id===e.userId&&c.skill_id===this.skill.id),this.oldAssessment!==void 0&&(this.updatedAssessment=!0),r!="super")await this.fetchMCQuestions(this.skillId);else{let c=[];for(let t=0;t<this.skillsStore.skillsList.length;t++)this.skillsStore.skillsList[t].parent==this.skillId&&this.skillsStore.skillsList[t].type=="sub"&&c.push(this.skillsStore.skillsList[t]);for(let t=0;t<c.length;t++)await this.fetchMCQuestions(c[t].id)}},components:{EssayAnswer:Z,ImageAnswer:cs,StudentAddMCQuestion:U,AssessmentResult:st,FlagModals:D},methods:{async fetchMCQuestions(i){fetch("/questions/"+i+"/multiple-choice").then(function(e){return e.json()}).then(e=>{this.mcQuestions=this.mcQuestions.concat(e)}).then(()=>{for(let r=0;r<this.mcQuestions.length;r++)this.mcQuestions[r].userAnswer=null,this.mcQuestions[r].questionType="mc";for(let r=0;r<this.mcQuestions.length;r++){var e=[];e.push({option:this.mcQuestions[r].answer_1,index:1}),e.push({option:this.mcQuestions[r].answer_2,index:2}),e.push({option:this.mcQuestions[r].answer_3,show:this.mcQuestions[r].show_answer_3,index:3}),e.push({option:this.mcQuestions[r].answer_4,show:this.mcQuestions[r].show_answer_4,index:4}),e.push({option:this.mcQuestions[r].answer_5,show:this.mcQuestions[r].show_answer_5,index:5}),this.mcQuestions[r].is_random&&(e=e.sort((c,t)=>.5-Math.random())),this.mcQuestions[r].answerOptions=e}}).then(()=>{this.fetchEssayQuestions(i)})},async fetchEssayQuestions(i){fetch("/questions/"+i+"/essay").then(function(e){return e.json()}).then(e=>{e.length>0&&!this.userDetailsStore.instructorId&&this.settingsStore.isManualEssayMarking==1&&(this.needToSelectInstructor=!0),this.essayQuestions=this.essayQuestions.concat(e)}).then(()=>{for(let e=0;e<this.essayQuestions.length;e++)this.essayQuestions[e].userAnswer=null,this.essayQuestions[e].questionType="essay"}).then(()=>{this.questions=this.essayQuestions.concat(this.mcQuestions)}).then(()=>{this.fetchImageQuestions(i)})},async fetchImageQuestions(i){fetch("/questions/"+i+"/image").then(function(e){return e.json()}).then(e=>{e.length>0&&!this.userDetailsStore.instructorId&&this.settingsStore.isManualEssayMarking==1&&(this.needToSelectInstructor=!0),this.imageQuestions=this.imageQuestions.concat(e)}).then(()=>{for(let e=0;e<this.imageQuestions.length;e++)this.imageQuestions[e].userAnswer=null,this.imageQuestions[e].questionType="image"}).then(()=>{this.questions=this.imageQuestions.concat(this.questions),this.questions=this.questions.sort((e,r)=>.5-Math.random()),this.questions.length>this.settingsStore.quizMaxQuestions&&(this.questions.length=this.settingsStore.quizMaxQuestions),this.question=this.questions[0],this.question.questionType=="image"&&(this.numOfImagesRequired=this.question.num_images_required),this.totalNumOfQuestions=this.questions.length}).then(()=>{this.loading=!1})},Next(){if(this.questions[this.questionNumber].questionType=="essay"){const i=this.$refs.essayAnswer.getAnswer();this.questions[this.questionNumber].userAnswer=i,this.$refs.essayAnswer.clearAnswer()}else if(this.questions[this.questionNumber].questionType=="image"){const i=this.$refs.imageAnswer.getAnswer();this.questions[this.questionNumber].userAnswer=i,this.$refs.imageAnswer.clearAnswer()}this.questionNumber++,this.questions[this.questionNumber].questionType=="essay"?this.questions[this.questionNumber].userAnswer&&this.$refs.essayAnswer.setAnswer(this.questions[this.questionNumber].userAnswer):this.questions[this.questionNumber].questionType=="image"&&(this.questions[this.questionNumber].userAnswer&&this.$refs.imageAnswer.setAnswer(this.questions[this.questionNumber].userAnswer),this.numOfImagesRequired=this.questions[this.questionNumber].num_images_required)},Previous(){if(this.questions[this.questionNumber].questionType=="essay"){const i=this.$refs.essayAnswer.getAnswer();this.questions[this.questionNumber].userAnswer=i}else if(this.questions[this.questionNumber].questionType=="image"){const i=this.$refs.imageAnswer.getAnswer();this.questions[this.questionNumber].userAnswer=i}this.questionNumber--,this.questions[this.questionNumber].questionType=="essay"?this.$refs.essayAnswer.setAnswer(this.questions[this.questionNumber].userAnswer):this.questions[this.questionNumber].questionType=="image"&&(this.$refs.imageAnswer.setAnswer(this.questions[this.questionNumber].userAnswer),this.numOfImagesRequired=this.questions[this.questionNumber].num_images_required)},async Submit(){if(this.UserAnswer(),!this.isAllQuestionsAnswered){alert("Please answer all questions before submitting.");return}if(this.finishTime=new Date,this.questions[this.questionNumber].questionType=="essay"){let e;e=this.$refs.essayAnswer.getAnswer(),this.questions[this.questionNumber].userAnswer=e}else if(this.questions[this.questionNumber].questionType=="image"){let e;e=this.$refs.imageAnswer.getAnswer(),this.questions[this.questionNumber].userAnswer=e}for(let e=0;e<this.questions.length;e++)this.questions[e].questionType=="mc"?(this.numMCQuestions++,this.questions[e].userAnswer==this.questions[e].correct_answer&&this.score++):this.questions[e].questionType=="essay"?this.numEssayQuestions++:this.numImageQuestions++;if(this.numEssayQuestions===0&&this.numImageQuestions===0)this.score/this.numMCQuestions*100>=this.settingsStore.passMark?(this.MakeMastered(this.skill),this.isQuizPassed=!0,this.assessmentStatus="pass",this.showResult=!0):(this.isQuizPassed=!0,this.assessmentStatus="fails",this.showResult=!0);else if(this.settingsStore.isManualEssayMarking==1){let e="POST";this.oldAssessment!==void 0&&(e="PUT");let r=this.numEssayQuestions+this.numImageQuestions;const c={method:e,headers:{"Content-Type":"application/json"},body:JSON.stringify({totalScore:this.totalNumOfQuestions,currentScore:this.score,numUnmarkedQuestions:r})};var i="/assessments/"+this.userDetailsStore.userId+"/"+this.skillId;const t=()=>{this.isQuizPassed=!0,this.showResult=!0,this.assessmentStatus="please wait for answers to be marked"};fetch(i,c).then(function(a){return a.json()}).then(a=>{this.assessmentId=a.id,fetch("/unmarked-answers/delete/"+this.assessmentId,{method:"DELETE"}).then(()=>{for(let h=0;h<this.questions.length;h++)if(this.questions[h].questionType=="essay"){const l={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({answer:this.questions[h].userAnswer,questionId:this.questions[h].id})};var m="/unmarked-answers/add/essay/"+this.assessmentId;fetch(m,l).then(function(d){t()})}else if(this.questions[h].questionType=="image"){const l={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({answer:this.questions[h].userAnswer,questionId:this.questions[h].id})};var m="/unmarked-answers/add/image/"+this.assessmentId;fetch(m,l).then(function(x){t()})}})})}else{for(let e=0;e<this.questions.length;e++)if(this.questions[e].questionType=="essay"){let r=this.questions[e].question,c=this.questions[e].userAnswer;await this.AIMarkEssayQuestion(r,c,e)}else if(this.questions[e].questionType=="image"){let r=this.questions[e].question,c=this.questions[e].userAnswer;await this.AIMarkImageQuestion(r,c,e)}this.score/this.questions.length*100>=this.settingsStore.passMark?(this.MakeMastered(this.skill),this.isQuizPassed=!0,this.assessmentStatus="pass",this.showResult=!0):(this.isQuizPassed=!0,this.assessmentStatus="fails",this.showResult=!0)}},async AIMarkEssayQuestion(i,e,r){this.aiLoading=!0;const c={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:i,answer:e,level:this.skill.level})};await fetch("/questions/mark-essay-question",c).then(function(a){return a.json()}).then(a=>{a.isCorrect==!0?(this.score++,this.questions[r].isCorrect=!0):(this.questions[r].explanation=a.explanation,this.questions[r].isCorrect=!1)}).finally(()=>{this.aiLoading=!1})},async AIMarkImageQuestion(i,e,r){this.aiLoading=!0;const c={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:i,answer:e,level:this.skill.level})};await fetch("/questions/mark-image-question",c).then(function(a){return a.json()}).then(a=>{a.isError==!0?(this.questions[r].isCorrect=!1,this.questions[r].explanation="There was an error grading this question. The file size(s) may be too big."):a.isCorrect==!0?(this.score++,this.questions[r].isCorrect=!0):(this.questions[r].explanation=a.explanation,this.questions[r].isCorrect=!1)}).finally(()=>{this.aiLoading=!1})},UserAnswer(){for(let i=0;i<this.questions.length;i++)if(this.questions[i].userAnswer==null||this.questions[i].userAnswer===""){this.isAllQuestionsAnswered=!1;return}else this.isAllQuestionsAnswered=!0},TestPass(){this.isQuizPassed=!0},handleClickFlagIcon(){switch(this.questions[this.questionNumber].questionType){case"mc":this.flagContentType="mc_question";break;case"essay":this.flagContentType="essay_question";break;case"image":this.flagContentType="image_question";break}this.showFlaggingModal=!0},async MakeMastered(i){await this.userSkillsStore.MakeMastered(this.userDetailsStore.userId,i),await this.skillTreeStore.getUserSkills()}}},b=i=>(N("data-v-8558cc63"),i=i(),L(),i),tt={key:0,class:"secondary-text"},it={key:1,class:"loading-animation d-flex justify-content-center align-items-center py-4"},nt=b(()=>s("span",{class:"loader"},null,-1)),ot=[nt],rt={key:2},lt={key:0},at={id:"myModal",class:"modal"},ut={class:"modal-content"},ct=b(()=>s("div",{class:"mb-2"}," You are taking a new quiz for this skill while your old one is still waiting to be marked. Please note that your old answers will be replaced. ",-1)),ht={class:"d-flex flex-row-reverse"},dt={class:"pb-2 pb-md-0"},mt={key:0,class:"container mt-2 mb-3 p-3 pt-2 mb-3",id:"question-container"},_t={class:"row"},ft={key:0},wt={class:"col d-flex my-2 gap-2 justify-content-between flex-column flex-md-row"},gt={class:"d-flex align-items-lg-center"},pt={id:"question-number-div"},yt={id:"question-content"},vt={class:"d-flex justify-content-end"},kt={key:0,"b-tooltip.hover":"",title:"This question was written or edited by a human",class:"author-icon me-4",style:{height:"50px"}},qt={xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 320 512",height:"22",style:{opacity:"0.5"},class:"primary-icon"},bt=b(()=>s("path",{d:"M112 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm40 304l0 128c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-223.1L59.4 304.5c-9.1 15.1-28.8 20-43.9 10.9s-20-28.8-10.9-43.9l58.3-97c17.4-28.9 48.6-46.6 82.3-46.6l29.7 0c33.7 0 64.9 17.7 82.3 46.6l58.3 97c9.1 15.1 4.2 34.8-10.9 43.9s-34.8 4.2-43.9-10.9L232 256.9 232 480c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-128-16 0z"},null,-1)),xt=[bt],At={key:1,"b-tooltip.hover":"",title:"This question was written by an AI",class:"author-icon me-4",style:{height:"50px"}},St={xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 640 512",height:"22",style:{opacity:"0.5"},class:"primary-icon"},Mt=b(()=>s("path",{d:"M320 0c17.7 0 32 14.3 32 32l0 64 120 0c39.8 0 72 32.2 72 72l0 272c0 39.8-32.2 72-72 72l-304 0c-39.8 0-72-32.2-72-72l0-272c0-39.8 32.2-72 72-72l120 0 0-64c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224l16 0 0 192-16 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-16 0 0-192 16 0z"},null,-1)),It=[Mt],Tt={xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 448 512",style:{height:"22px",opacity:"0.5"},class:"primary-icon"},Qt=b(()=>s("path",{d:"M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32V64 368 480c0 17.7 14.3 32 32 32s32-14.3 32-32V352l64.3-16.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30V66.1c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L64 48V32z"},null,-1)),$t=[Qt],Ct={key:0},zt={class:"form-check my-3"},Nt={class:"control control-checkbox"},Lt=["name","value","onUpdate:modelValue"],Ft=["onMouseover"],Rt={class:"form-group"},Vt={class:"form-group"},Et={class:"mt-3 d-flex justify-content-end"},Pt={key:1,id:"question-content"},Dt={key:5,class:"modal"},Ut={class:"modal-content"},jt=b(()=>s("div",{class:""},[s("p",{class:"text-center"}," Please choose an instructor before taking these quizzes. ")],-1)),Bt={class:"d-flex flex-column-reverse flex-md-row justify-content-center gap-2"},Ot=b(()=>s("span",null,"Back",-1)),Ht=b(()=>s("span",null,"Select Instructor",-1));function Yt(i,e,r,c,t,a){const m=p("EssayAnswer"),h=p("ImageAnswer"),l=p("AssessmentResult"),d=p("FlagModals"),x=p("RouterLink");return n(),o(w,null,[t.loading==!0?(n(),o("div",tt,"Loading...")):u("",!0),t.aiLoading?(n(),o("div",it,ot)):u("",!0),t.loading==!1&&t.isQuizPassed==!1&&!t.needToSelectInstructor&&!t.aiLoading?(n(),o("div",rt,[t.updatedAssessment?(n(),o("div",lt,[s("div",at,[s("div",ut,[ct,s("div",ht,[s("button",{type:"button",class:"btn green-btn",onClick:e[0]||(e[0]=y=>t.updatedAssessment=!1)}," OK ")])])])])):u("",!0),s("div",dt,[t.questions.length>0?(n(),o("div",mt,[(n(!0),o(w,null,q(t.questions,(y,I)=>(n(),o("div",_t,[I==t.questionNumber?(n(),o("div",ft,[s("div",wt,[s("div",gt,[s("div",pt,_(I+1),1),s("div",yt,_(y.question),1)]),s("div",vt,[y.is_human_edited?(n(),o("div",kt,[(n(),o("svg",qt,xt))])):(n(),o("div",At,[(n(),o("svg",St,It))])),s("div",{"b-tooltip.hover":"",title:"Flag this question for review",onClick:e[1]||(e[1]=(...v)=>a.handleClickFlagIcon&&a.handleClickFlagIcon(...v)),class:"flagging-icon",style:{height:"50px"}},[(n(),o("svg",Tt,$t))])])]),y.questionType=="mc"?(n(),o("div",Ct,[(n(!0),o(w,null,q(y.answerOptions,v=>g((n(),o("div",zt,[s("label",Nt,[s("div",{class:A(t.answerHoveredIndex==v.index?"my-auto mx-2 me-4 answer-option checkbox-hovered":"my-auto mx-2 me-4 answer-option")},_(v.option),3),g(s("input",{type:"radio",name:I+"answer",value:v.index,"onUpdate:modelValue":C=>t.questions[I].userAnswer=C},null,8,Lt),[[E,t.questions[I].userAnswer]]),s("div",{class:"control_indicator",onMouseover:C=>t.answerHoveredIndex=v.index,onMouseleave:e[2]||(e[2]=C=>t.answerHoveredIndex=1/0)},null,40,Ft)])],512)),[[V,v.index<=2||v.show==1]])),256))])):u("",!0)])):u("",!0)]))),256)),s("div",{class:A(`${t.questions[t.questionNumber].questionType=="essay"?"d-block":"d-none"}`)},[s("div",Rt,[T(m,{ref:"essayAnswer"},null,512)])],2),s("div",{class:A(`${t.questions[t.questionNumber].questionType=="image"?"d-block":"d-none"}`)},[s("div",Vt,[T(h,{numImagesRequired:t.numOfImagesRequired,ref:"imageAnswer"},null,8,["numImagesRequired"])])],2),s("div",Et,[t.questionNumber>0?(n(),o("button",{key:0,onClick:e[3]||(e[3]=y=>a.Previous()),class:"btn primary-btn me-2"}," Previous ")):u("",!0),t.questionNumber<t.questions.length-1?(n(),o("button",{key:1,onClick:e[4]||(e[4]=y=>a.Next()),class:"btn green-btn"}," Next ")):u("",!0),t.questionNumber>=t.questions.length-1?(n(),o("button",{key:2,onClick:e[5]||(e[5]=y=>a.Submit()),class:"btn green-btn"}," Submit ")):u("",!0)])])):(n(),o("div",Pt," There is no quiz for this skill yet. Please check again soon. "))])])):u("",!0),t.showResult?(n(),S(l,{key:3,skill:t.skill,isManualEssayMarking:c.settingsStore.isManualEssayMarking},null,8,["skill","isManualEssayMarking"])):u("",!0),t.showFlaggingModal?(n(),S(d,{key:4,userId:c.userDetailsStore.userId,contentId:t.questions[t.questionNumber].id,contentType:t.flagContentType},null,8,["userId","contentId","contentType"])):u("",!0),t.needToSelectInstructor?(n(),o("div",Dt,[s("div",Ut,[jt,s("div",Bt,[T(x,{to:`/skills/${t.skillId}`,type:"button",class:"btn green-btn w-100 w-md-50"},{default:$(()=>[Ot]),_:1},8,["to"]),T(x,{to:"/profile/edit",type:"button",class:"btn green-btn w-100 w-md-50"},{default:$(()=>[Ht]),_:1})])])])):u("",!0)],64)}const Jt=M(et,[["render",Yt],["__scopeId","data-v-8558cc63"]]);const Kt={setup(){return{skillsStore:P()}},data(){return{skillId:this.$route.params.id,skill:{name:null,image:null,firstAncestorId:null,levelInHierarchy:null,url:""}}},async mounted(){this.skillsStore.skillsList.length==0&&await this.skillsStore.getSkillsList();for(let i=0;i<this.skillsStore.skillsList.length;i++)this.skillId==this.skillsStore.skillsList[i].id&&(this.skill.name=this.skillsStore.skillsList[i].name,this.skill.url=this.skillsStore.skillsList[i].url)},components:{Assessment:Jt},methods:{imageUrlAlternative(i){i.target.src="/images/skill-avatar/recurso.png"}}},j=i=>(N("data-v-8d5d6ea2"),i=i(),L(),i),Wt={class:"container bg-light rounded p-3"},Gt=j(()=>s("h1",{class:"heading"},"Assessment",-1)),Xt={class:"skill-name"},Zt={class:"mt-4 mb-2"},si={id:"assessment-horizontal-line",class:"w-md-75 w-100"},ei=j(()=>s("div",{id:"full-line"},null,-1));function ti(i,e,r,c,t,a){var h,l;const m=p("Assessment");return n(),o("div",Wt,[Gt,s("p",Xt,[s("em",null,_(this.skill.name),1)]),s("div",Zt,[s("div",si,[ei,s("div",{style:O(`width: ${parseInt((((h=i.$refs.assessment)==null?void 0:h.questionNumber)+1)/((l=i.$refs.assessment)==null?void 0:l.totalNumOfQuestions)*100)}%;`),id:"progress"},null,4)])]),T(m,{ref:"assessment"},null,512)])}const li=M(Kt,[["render",ti],["__scopeId","data-v-8d5d6ea2"]]);export{li as default};