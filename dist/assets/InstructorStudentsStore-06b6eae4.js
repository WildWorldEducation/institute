import{L as s}from"./main-c2e9845b.js";const e=s("instructorStudents",{state:()=>({instructorStudentsList:[]}),actions:{async getInstructorStudentsList(){const t=await(await fetch("/instructor-students/list")).json();return this.instructorStudentsList=t,this.$state}}});export{e as u};