import{_ as m,e as f,o as r,c as n,a as s,w as l,v as c,F as _,r as S,N as p,t as b,h as k,g as v,i as x,f as y}from"./main-7ca062e3.js";import{u as D}from"./SettingsStore-75c4ed7f.js";import{u as L}from"./TagsStore-e46c3a0b.js";import"./SkillsStore-489faaac.js";const T={setup(){const e=D(),t=L();return{settingsStore:e,tagsStore:t}},data(){return{filters:[]}},async created(){(this.settingsStore.skillDegradationDays==null||this.settingsStore.quizMaxQuestions==null)&&await this.settingsStore.getSettings(),this.tagsStore.tagsList.length==0&&await this.tagsStore.getTagsList();for(let e=0;e<this.tagsStore.tagsList.length;e++)this.tagsStore.tagsList[e].is_active=="active"&&this.filters.push(this.tagsStore.tagsList[e].id)},methods:{Submit(){for(let i=0;i<this.tagsStore.tagsList.length;i++)this.filters.includes(this.tagsStore.tagsList[i].id)?this.tagsStore.tagsList[i].is_active="active":this.tagsStore.tagsList[i].is_active="inactive";const e={method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({skill_degradation_days:this.settingsStore.skillDegradationDays,quiz_max_questions:this.settingsStore.quizMaxQuestions,tags:this.tagsStore.tagsList})};var t="/settings/edit";fetch(t,e).then(()=>{this.$router.push("/profile-settings")})}}},q={class:"container mt-3"},M=s("h1",null,"Edit Settings",-1),z={class:"mb-3"},C=s("label",{for:"daysForSkillToDegrade",class:"form-label"},"Days For Skills To Degrade:",-1),Q={class:"mb-3"},w=s("label",{for:"daysForSkillToDegrade",class:"form-label"},"Max Number of Questions Per Quiz:",-1),F={class:"mb-3"},V={class:"form-check"},N=["value"],B={class:"form-check-label",for:"flexCheckDefault"},E={class:"d-flex justify-content-between mb-3"};function U(e,t,i,a,d,u){const g=f("router-link");return r(),n("div",q,[M,s("div",z,[C,l(s("input",{"onUpdate:modelValue":t[0]||(t[0]=o=>a.settingsStore.skillDegradationDays=o),type:"number",id:"daysForSkillToDegrade",min:"1",max:"3650",class:"form-control","aria-describedby":"daysForSkillToDegrade"},null,512),[[c,a.settingsStore.skillDegradationDays]])]),s("div",Q,[w,l(s("input",{"onUpdate:modelValue":t[1]||(t[1]=o=>a.settingsStore.quizMaxQuestions=o),type:"number",id:"quizMaxQuestions",min:"1",max:"200",class:"form-control","aria-describedby":"quizMaxQuestions"},null,512),[[c,a.settingsStore.quizMaxQuestions]])]),s("div",F,[(r(!0),n(_,null,S(this.tagsStore.tagsList,o=>(r(),n("div",null,[s("div",V,[l(s("input",{class:"form-check-input",type:"checkbox",value:o.id,id:"flexCheckDefault","onUpdate:modelValue":t[2]||(t[2]=h=>d.filters=h)},null,8,N),[[p,d.filters]]),s("label",B,b(o.name),1)])]))),256))]),s("div",E,[k(g,{class:"btn btn-dark",to:"/profile-settings"},{default:v(()=>[x(" Cancel ")]),_:1}),s("button",{onClick:t[3]||(t[3]=o=>u.Submit()),type:"submit",class:"btn btn-dark"}," Submit ")])])}const j=m(T,[["render",U]]),G={__name:"EditSettingsView",setup(e){return(t,i)=>(r(),y(j))}};export{G as default};