import{x as i}from"./main-248bf279.js";const o=i("showSkill",{state:()=>({skill:null}),actions:{async findSkill(s){const l=await fetch("/skills/url/"+s);this.skill=await l.json()}}});export{o as u};
