<<<<<<<< HEAD:dist/assets/AssessmentsStore-d3cf38dc.js
import{P as t}from"./main-e2d3868e.js";const n=t("assessments",{state:()=>({assessments:[]}),actions:{async getAssessments(){const s=await(await fetch("/assessments/list")).json();return this.assessments=s,this.$state},async deleteAssessment(e){const s=await fetch("/assessments/"+e,{method:"DELETE"});s.error&&console.log(s.error)}}});export{n as u};
========
import{P as t}from"./main-fe9f24bb.js";const n=t("assessments",{state:()=>({assessments:[]}),actions:{async getAssessments(){const s=await(await fetch("/assessments/list")).json();return this.assessments=s,this.$state},async deleteAssessment(e){const s=await fetch("/assessments/"+e,{method:"DELETE"});s.error&&console.log(s.error)}}});export{n as u};
>>>>>>>> change-design-for-ai-themes:dist/assets/AssessmentsStore-a3f58888.js
