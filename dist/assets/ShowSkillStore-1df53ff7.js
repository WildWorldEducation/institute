import{s as i}from"./main-c3ee1404.js";const o=i("showSkill",{state:()=>({skill:null}),actions:{async findSkill(s){const l=await fetch("/skills/url/"+s);this.skill=await l.json()}}});export{o as u};
