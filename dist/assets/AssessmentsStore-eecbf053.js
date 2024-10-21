<<<<<<<< HEAD:dist/assets/AssessmentsStore-d6554f2b.js
import{N as t}from"./main-8f6a0643.js";const n=t("assessments",{state:()=>({assessments:[]}),actions:{async getAssessments(){const s=await(await fetch("/assessments/list")).json();return this.assessments=s,this.$state},async deleteAssessment(e){const s=await fetch("/assessments/"+e,{method:"DELETE"});s.error&&console.log(s.error)}}});export{n as u};
========
import{N as t}from"./main-87f9ced0.js";const n=t("assessments",{state:()=>({assessments:[]}),actions:{async getAssessments(){const s=await(await fetch("/assessments/list")).json();return this.assessments=s,this.$state},async deleteAssessment(e){const s=await fetch("/assessments/"+e,{method:"DELETE"});s.error&&console.log(s.error)}}});export{n as u};
>>>>>>>> dev:dist/assets/AssessmentsStore-eecbf053.js
