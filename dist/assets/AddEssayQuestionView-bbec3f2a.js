import{_ as d,o as r,c as u,b as s,w as i,s as l}from"./main-23cc1a36.js";const c={data(){return{skillId:this.$route.params.skillId,question:{}}},methods:{Submit(){const n={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:this.question.name,question:this.question.question,skill_id:this.skillId})};var t="/questions/essay-questions/add";fetch(t,n).then(()=>{alert("Question added")}).then(()=>{this.$router.go(-1)})}}},_={class:"container mt-3 pb-3"},m=s("div",{class:"row"},[s("div",{class:"col-10 d-flex align-items-end"},[s("h2",{id:"header-tile"},"Add Question")])],-1),p={class:"main-content-container container-fluid p-4"},f={class:"row"},b={class:"col-lg-6"},h={class:"mb-3"},v=s("label",{for:"first_name",class:"form-label"},"Question Name",-1),q={class:"mb-3"},y=s("label",{for:"last_name",class:"form-label"},"Question",-1),k={class:"d-flex justify-content-end gap-4"};function x(n,t,g,w,o,a){return r(),u("div",_,[m,s("div",p,[s("div",f,[s("div",b,[s("div",h,[v,i(s("input",{"onUpdate:modelValue":t[0]||(t[0]=e=>o.question.name=e),type:"text",class:"form-control"},null,512),[[l,o.question.name]])]),s("div",q,[y,i(s("input",{"onUpdate:modelValue":t[1]||(t[1]=e=>o.question.question=e),type:"text",class:"form-control"},null,512),[[l,o.question.question]])]),s("div",k,[s("a",{class:"btn red-btn",onClick:t[2]||(t[2]=e=>n.$router.go(-1))},"Cancel"),s("button",{class:"btn purple-btn",onClick:t[3]||(t[3]=e=>a.Submit())}," Submit ")])])])])])}const S=d(c,[["render",x]]);export{S as default};