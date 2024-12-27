<<<<<<<< HEAD:dist/assets/AssessmentsStore-9bf92213.js
import{P as t}from"./main-8b591883.js";const n=t("assessments",{state:()=>({assessments:[]}),actions:{async getAssessments(){const s=await(await fetch("/assessments/list")).json();return this.assessments=s,this.$state},async deleteAssessment(e){const s=await fetch("/assessments/"+e,{method:"DELETE"});s.error&&console.log(s.error)}}});export{n as u};
========
import{P as t}from"./main-6da700d5.js";const n=t("assessments",{state:()=>({assessments:[]}),actions:{async getAssessments(){const s=await(await fetch("/assessments/list")).json();return this.assessments=s,this.$state},async deleteAssessment(e){const s=await fetch("/assessments/"+e,{method:"DELETE"});s.error&&console.log(s.error)}}});export{n as u};
>>>>>>>> dev:dist/assets/AssessmentsStore-c0468d16.js
