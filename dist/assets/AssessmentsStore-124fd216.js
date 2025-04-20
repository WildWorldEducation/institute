<<<<<<<< HEAD:dist/assets/AssessmentsStore-c24106d7.js
import{x as t}from"./main-06b8cce1.js";const n=t("assessments",{state:()=>({assessments:[]}),actions:{async getAssessments(){const s=await(await fetch("/assessments/list")).json();return this.assessments=s,this.$state},async deleteAssessment(e){const s=await fetch("/assessments/"+e,{method:"DELETE"});s.error&&console.log(s.error)}}});export{n as u};
========
import{x as t}from"./main-b824f3f8.js";const n=t("assessments",{state:()=>({assessments:[]}),actions:{async getAssessments(){const s=await(await fetch("/assessments/list")).json();return this.assessments=s,this.$state},async deleteAssessment(e){const s=await fetch("/assessments/"+e,{method:"DELETE"});s.error&&console.log(s.error)}}});export{n as u};
>>>>>>>> dev:dist/assets/AssessmentsStore-124fd216.js
