import{_ as p,a as b,o as n,c as r,d as e,w as c,x as m,b as l,F as v,y as q,v as g,t as x,M as y,i as _,I as S,z as k,p as V,f as D,j as C}from"./main-44ae81b4.js";import{_ as F}from"./edit-mastery-skill-banner-9e7c0291.js";import{_ as I}from"./recurso-69-12793b41.js";const L={setup(){return{userDetailsStore:b()}},data(){return{questionId:this.$route.params.id,question:{},answers:[],validate:{validated:!1,name:!1,question:!1,answer:!1,explanation:!1},originalQuestion:{},originalAnswers:[],comment:"",isLoaded:!1}},async created(){await this.getQuestion(),this.isLoaded=!0},methods:{async getQuestion(){await fetch("/questions/mc/show/"+this.questionId).then(function(i){return i.json()}).then(i=>{this.question=i.question,this.answers=i.answers,this.answers[0].show=1,this.answers[1].show=1,this.originalQuestion={...i.question},this.originalAnswers=JSON.parse(JSON.stringify(i.answers))})},Submit(){const i={method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:this.question,answers:this.answers})};var s="/questions/mc/"+this.questionId+"/edit";fetch(s,i).then(()=>{let w=this.$route.query.dismissFlagId;w?fetch("/content-flags/"+w,{method:"DELETE"}).finally(()=>{alert("Question edited successfully."),this.$router.back()}):(alert("Question edited successfully."),this.$router.back())})},SubmitForReview(){const i={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:this.userDetailsStore.userId,question:this.question,answers:this.answers,comment:this.comment})};var s="/questions/mc/"+this.questionId+"/edit-for-review";fetch(s,i).then(()=>{alert(`This edit is being submitted for review.
We do this to prevent misinformation and sloppy wording from being added. If you would like to become an editor and help with this, please reach out.`),this.$router.back()})},ValidateForm(i){this.validate.validated=!1,(this.question.name===""||this.question.name===null)&&(this.validate.name=!0,this.validate.validated=!0),(this.question.text===""||this.question.text===null)&&(this.validate.question=!0,this.validate.validated=!0),this.answers.forEach(s=>{s.text==""&&(this.validate.validated=!0)}),(this.question.explanation===""||this.question.explanation===null)&&(this.validate.explanation=!0,this.validate.validated=!0),!this.validate.validated&&(i=="submission"?this.Submit():i=="submissionForReview"&&this.SubmitForReview())},setFormUpdated(){this.formUpdated=!0},closeTab(){window.close()},addAnswer(){(this.userDetailsStore.role=="admin"||this.userDetailsStore.role=="editor")&&(this.answers[2].show==0?this.answers[2].show=1:this.answers[3].show==0?this.answers[3].show=1:this.answers[4].show==0&&(this.answers[4].show=1))},removeAnswer(){(this.userDetailsStore.role=="admin"||this.userDetailsStore.role=="editor")&&(this.answers[4].show==1?(this.answers[4].show=0,this.question.correct_answer==5&&(this.question.correct_answer=4)):this.answers[3].show==1?(this.answers[3].show=0,this.question.correct_answer==4&&(this.question.correct_answer=3)):this.answers[2].show==1&&(this.answers[2].show=0,this.question.correct_answer==3&&(this.question.correct_answer=2)))}},computed:{isFormChanged(){return JSON.stringify(this.originalQuestion)!=JSON.stringify(this.question)||JSON.stringify(this.originalAnswers)!=JSON.stringify(this.answers)}}},a=i=>(V("data-v-d629de75"),i=i(),D(),i),M=a(()=>e("div",{id:"banner"},[e("img",{src:F,class:"image-fluid"})],-1)),N={class:"container mt-3 pb-3"},O=k('<div class="row" data-v-d629de75><div class="col-10 d-flex align-items-end" data-v-d629de75><h2 id="header-tile" data-v-d629de75>Edit Question</h2><img src="'+I+'" id="header-icon" data-v-d629de75></div></div><p class="mt-2" data-v-d629de75><em data-v-d629de75>Note: blank questions will not display in the quiz.</em></p>',2),z={class:"main-content-container container-fluid mt-4"},A={class:"row p-0"},Q={id:"form-container",class:"col-lg-7 p-4"},U={class:"mb-3"},E=a(()=>e("label",{for:"question_name",class:"form-label"},"Question Name",-1)),H={key:0,class:"form-validate"},T={class:"mb-3"},J=a(()=>e("label",{for:"last_name",class:"form-label"},"Question",-1)),B={key:0,class:"form-validate"},R={class:"form-label"},j={class:"d-flex answer-option"},P=["onUpdate:modelValue","id"],W={key:0,class:"form-validate"},G={class:"form-check"},K=["id","value"],X=["for"],Y={key:0,class:"mb-3"},Z=a(()=>e("svg",{"data-v-ea3cd1bf":"",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",width:"15",height:"15",fill:"white"},[e("path",{"data-v-ea3cd1bf":"",d:"M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"})],-1)),$=a(()=>e("svg",{width:"20",height:"20",fill:"#ffffff",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 448 512"},[e("path",{d:"M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"})],-1)),ee={class:"mb-3 form-check"},se=a(()=>e("label",{for:"randomOrder",class:"form-check-label"},"Show answers in random order",-1)),te={class:"mb-3"},ie=a(()=>e("label",{class:"form-label"},"Explanation",-1)),oe={key:0,class:"form-validate"},ne={key:1,class:"mb-3"},re=a(()=>e("label",{class:"form-label"},"Optional: explain this edit",-1)),ae={class:"d-flex justify-content-end gap-4"},le=["disabled"],de=["disabled"],ce=a(()=>e("div",{class:"d-none d-md-block"}," Submit for review ",-1)),ue=a(()=>e("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",fill:"white",height:"20",width:"20",class:"d-md-none"},[e("path",{d:"M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z"})],-1)),he=[ce,ue];function me(i,s,w,u,t,d){return n(),r(v,null,[M,e("div",N,[O,e("div",z,[e("div",A,[e("div",Q,[e("div",U,[E,c(e("input",{"onUpdate:modelValue":s[0]||(s[0]=o=>t.question.name=o),type:"text",class:"form-control",id:"question_name"},null,512),[[m,t.question.name]]),t.validate.name&&(t.question.name===""||t.question.name===null)?(n(),r("div",H," please enter a question name ! ")):l("",!0)]),e("div",T,[J,c(e("textarea",{"onUpdate:modelValue":s[1]||(s[1]=o=>t.question.text=o),rows:"2",class:"form-control"},`
                        `,512),[[m,t.question.text]]),t.validate.question&&(t.question.text===""||t.question.text===null)?(n(),r("div",B," please enter a question ! ")):l("",!0)]),(n(!0),r(v,null,q(t.answers,(o,h)=>c((n(),r("div",{key:h,class:"mb-3"},[e("label",R,"Answer "+x(h+1)+":",1),e("div",j,[c(e("input",{"onUpdate:modelValue":f=>o.text=f,id:"answer"+(h+1),placeholder:"Enter answer option",type:"text",class:"form-control"},null,8,P),[[m,o.text]])]),t.validate.validated&&o.text===""?(n(),r("div",W," please enter a correct answer ! ")):l("",!0),e("div",G,[c(e("input",{class:"form-check-input",type:"radio",id:"correct"+(h+1),name:"correctAnswer",value:h+1,"onUpdate:modelValue":s[2]||(s[2]=f=>t.question.correct_answer=f)},null,8,K),[[y,t.question.correct_answer]]),e("label",{for:"correct"+(h+1),class:""},"Set as correct",8,X)])])),[[g,o.show]])),128)),t.isLoaded&&(this.userDetailsStore.role=="admin"||this.userDetailsStore.role=="editor")?(n(),r("div",Y,[t.answers[2].show==!0?(n(),r("button",{key:0,onClick:s[3]||(s[3]=o=>d.removeAnswer()),"data-v-ea3cd1bf":"",type:"button",class:"btn red-btn p-2 mb-2",title:"Delete answer"},[Z,_(" Remove Answer ")])):l("",!0),t.answers[4].show==!1?(n(),r("button",{key:1,onClick:s[4]||(s[4]=(...o)=>d.addAnswer&&d.addAnswer(...o)),class:"btn purple-btn"},[$,_(" Add Answer ")])):l("",!0)])):l("",!0),e("div",ee,[c(e("input",{type:"checkbox",id:"randomOrder","onUpdate:modelValue":s[5]||(s[5]=o=>t.question.is_random=o),class:"form-check-input"},null,512),[[S,t.question.is_random]]),se]),e("div",te,[ie,c(e("textarea",{"onUpdate:modelValue":s[6]||(s[6]=o=>t.question.explanation=o),class:"form-control",rows:"3"},null,512),[[m,t.question.explanation]]),t.validate.explanation&&(t.question.explanation===""||t.question.explanation===null)?(n(),r("div",oe," please enter an explanation ! ")):l("",!0)]),u.userDetailsStore.role=="instructor"||u.userDetailsStore.role=="student"?(n(),r("div",ne,[re,c(e("textarea",{"onUpdate:modelValue":s[7]||(s[7]=o=>t.comment=o),class:"form-control",rows:"3"},null,512),[[m,t.comment]])])):l("",!0),e("div",ae,[e("button",{class:"btn red-btn",onClick:s[8]||(s[8]=o=>d.closeTab())}," Cancel "),u.userDetailsStore.role=="admin"||u.userDetailsStore.role=="editor"?(n(),r("button",{key:0,class:"btn purple-btn",onClick:s[9]||(s[9]=o=>d.ValidateForm("submission")),disabled:!d.isFormChanged}," Submit ",8,le)):u.userDetailsStore.role=="instructor"||u.userDetailsStore.role=="student"?(n(),r("button",{key:1,class:"btn purple-btn",onClick:s[10]||(s[10]=o=>d.ValidateForm("submissionForReview")),disabled:!d.isFormChanged},he,8,de)):l("",!0)])])])])])],64)}const we=p(L,[["render",me],["__scopeId","data-v-d629de75"]]),pe={__name:"EditMCQuestionView",setup(i){return(s,w)=>(n(),C(we))}};export{pe as default};