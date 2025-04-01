import{s as i}from"./main-7c79d0f4.js";const o=i("showSkill",{state:()=>({skill:null}),actions:{async findSkill(s){const l=await fetch("/skills/url/"+s);this.skill=await l.json()}}});export{o as u};
