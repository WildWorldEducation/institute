<<<<<<<< HEAD:dist/assets/StudentMCQuestionsStore-132d66fa.js
import{x as e}from"./main-91882d5c.js";const o=e("student-mc-questions",{state:()=>({studentMCQuestions:[]}),actions:{async getStudentMCQuestions(){const t=await(await fetch("/questions/student-mc-questions/list")).json();this.studentMCQuestions=t},async deleteStudentMCQuestion(s){const t=fetch("/questions/student-mc-questions/"+s,{method:"DELETE"});t.error&&console.log(t.error)}}});export{o as u};
========
import{x as e}from"./main-4609db7c.js";const o=e("student-mc-questions",{state:()=>({studentMCQuestions:[]}),actions:{async getStudentMCQuestions(){const t=await(await fetch("/questions/student-mc-questions/list")).json();this.studentMCQuestions=t},async deleteStudentMCQuestion(s){const t=fetch("/questions/student-mc-questions/"+s,{method:"DELETE"});t.error&&console.log(t.error)}}});export{o as u};
>>>>>>>> dev:dist/assets/StudentMCQuestionsStore-461869e7.js
