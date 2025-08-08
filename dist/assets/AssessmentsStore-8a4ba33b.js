<<<<<<<< HEAD:dist/assets/AssessmentsStore-03446c6c.js
import{x as t}from"./main-91882d5c.js";const n=t("assessments",{state:()=>({assessments:[]}),actions:{async getAssessments(){const s=await(await fetch("/assessments/list")).json();return this.assessments=s,this.$state},async deleteAssessment(e){const s=await fetch("/assessments/"+e,{method:"DELETE"});s.error&&console.log(s.error)}}});export{n as u};
========
import{x as t}from"./main-4609db7c.js";const n=t("assessments",{state:()=>({assessments:[]}),actions:{async getAssessments(){const s=await(await fetch("/assessments/list")).json();return this.assessments=s,this.$state},async deleteAssessment(e){const s=await fetch("/assessments/"+e,{method:"DELETE"});s.error&&console.log(s.error)}}});export{n as u};
>>>>>>>> dev:dist/assets/AssessmentsStore-8a4ba33b.js
