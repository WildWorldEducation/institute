import{_,o as r,c,b as s,w as n,s as i,e as m}from"./main-e492dfa3.js";const d={data(){return{questionId:this.$route.params.id,question:{}}},created(){this.getQuestion()},methods:{getQuestion(){fetch("/questions/mc/show/"+this.questionId).then(function(l){return l.json()}).then(l=>this.question=l)},Submit(){const l={method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:this.question.name,question:this.question.question,answer_1:this.question.answer_1,answer_2:this.question.answer_2,answer_3:this.question.answer_3,answer_4:this.question.answer_4,answer_5:this.question.answer_5,correct_answer:this.question.correct_answer,explanation:this.question.explanation})};var t="/questions/mc/"+this.questionId+"/edit";fetch(t,l).then(()=>{this.$router.back()})}}},p={class:"container mt-3"},q=s("h1",null,"Edit Question",-1),b={class:"mb-3"},f=s("label",{class:"form-label"},"Name",-1),h={class:"mb-3"},w=s("label",{class:"form-label"},"Question",-1),x={class:"mb-3"},v=s("label",{class:"form-label"},"Option 1",-1),y={class:"mb-3"},V=s("label",{class:"form-label"},"Option 2",-1),U={class:"mb-3"},O=s("label",{class:"form-label"},"Option 3",-1),k={class:"mb-3"},Q=s("label",{class:"form-label"},"Option 4",-1),C={class:"mb-3"},E=s("label",{class:"form-label"},"Option 5",-1),B={class:"mb-3"},S=s("label",{class:"form-label"},"Correct Answer",-1),g={class:"mb-3"},I=s("label",{class:"form-label"},"Explanation",-1),M={class:"mb-3"};function N(l,t,u,j,e,a){return r(),c("div",p,[q,s("div",b,[f,n(s("input",{"onUpdate:modelValue":t[0]||(t[0]=o=>e.question.name=o),type:"text",class:"form-control"},null,512),[[i,e.question.name]])]),s("div",h,[w,n(s("input",{"onUpdate:modelValue":t[1]||(t[1]=o=>e.question.question=o),type:"text",class:"form-control"},null,512),[[i,e.question.question]])]),s("div",x,[v,n(s("input",{"onUpdate:modelValue":t[2]||(t[2]=o=>e.question.answer_1=o),type:"text",class:"form-control"},null,512),[[i,e.question.answer_1]])]),s("div",y,[V,n(s("input",{"onUpdate:modelValue":t[3]||(t[3]=o=>e.question.answer_2=o),type:"text",class:"form-control"},null,512),[[i,e.question.answer_2]])]),s("div",U,[O,n(s("input",{"onUpdate:modelValue":t[4]||(t[4]=o=>e.question.answer_3=o),type:"text",class:"form-control"},null,512),[[i,e.question.answer_3]])]),s("div",k,[Q,n(s("input",{"onUpdate:modelValue":t[5]||(t[5]=o=>e.question.answer_4=o),type:"text",class:"form-control"},null,512),[[i,e.question.answer_4]])]),s("div",C,[E,n(s("input",{"onUpdate:modelValue":t[6]||(t[6]=o=>e.question.answer_5=o),type:"text",class:"form-control"},null,512),[[i,e.question.answer_5]])]),s("div",B,[S,n(s("input",{"onUpdate:modelValue":t[7]||(t[7]=o=>e.question.correct_answer=o),type:"text",class:"form-control"},null,512),[[i,e.question.correct_answer]])]),s("div",g,[I,n(s("input",{"onUpdate:modelValue":t[8]||(t[8]=o=>e.question.explanation=o),type:"text",class:"form-control"},null,512),[[i,e.question.explanation]])]),s("div",M,[s("button",{onClick:t[9]||(t[9]=o=>a.Submit()),class:"btn btn-dark"},"Submit")])])}const T=_(d,[["render",N]]),D={__name:"EditMCQuestionView",setup(l){return(t,u)=>(r(),m(T))}};export{D as default};