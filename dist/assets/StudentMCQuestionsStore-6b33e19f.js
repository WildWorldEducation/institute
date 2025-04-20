<<<<<<<< HEAD:dist/assets/StudentMCQuestionsStore-b2d32f4c.js
import{x as e}from"./main-06b8cce1.js";const o=e("student-mc-questions",{state:()=>({studentMCQuestions:[]}),actions:{async getStudentMCQuestions(){const t=await(await fetch("/questions/student-mc-questions/list")).json();this.studentMCQuestions=t},async deleteStudentMCQuestion(s){const t=fetch("/questions/student-mc-questions/"+s,{method:"DELETE"});t.error&&console.log(t.error)}}});export{o as u};
========
import{x as e}from"./main-b824f3f8.js";const o=e("student-mc-questions",{state:()=>({studentMCQuestions:[]}),actions:{async getStudentMCQuestions(){const t=await(await fetch("/questions/student-mc-questions/list")).json();this.studentMCQuestions=t},async deleteStudentMCQuestion(s){const t=fetch("/questions/student-mc-questions/"+s,{method:"DELETE"});t.error&&console.log(t.error)}}});export{o as u};
>>>>>>>> dev:dist/assets/StudentMCQuestionsStore-6b33e19f.js
