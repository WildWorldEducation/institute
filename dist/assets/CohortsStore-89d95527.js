<<<<<<<< HEAD:dist/assets/CohortsStore-ea95fdde.js
import{N as r}from"./main-8f6a0643.js";const a=r("cohorts",{state:()=>({cohorts:[],cohortSkills:[]}),actions:{async getCohorts(t){const o=await(await fetch("/cohorts/"+t+"/list")).json();return this.cohorts=o,this.$state},async getCohortSkillFilters(t){const s=await fetch("/cohorts/"+t+"/skill-filters");this.cohortSkills=await s.json()}}});export{a as u};
========
import{N as r}from"./main-87f9ced0.js";const a=r("cohorts",{state:()=>({cohorts:[],cohortSkills:[]}),actions:{async getCohorts(t){const o=await(await fetch("/cohorts/"+t+"/list")).json();return this.cohorts=o,this.$state},async getCohortSkillFilters(t){const s=await fetch("/cohorts/"+t+"/skill-filters");this.cohortSkills=await s.json()}}});export{a as u};
>>>>>>>> dev:dist/assets/CohortsStore-89d95527.js
