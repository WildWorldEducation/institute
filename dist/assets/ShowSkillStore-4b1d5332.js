import{q as i}from"./main-5d815307.js";const o=i("showSkill",{state:()=>({skill:null}),actions:{async findSkill(s){const l=await fetch("/skills/url/"+s);this.skill=await l.json()}}});export{o as u};
