import{d as s}from"./main-aefbdd2a.js";const i=s("settings",{state:()=>({settings:{}}),actions:{async getSettings(){const t=await(await fetch("/settings")).json();this.settings=t}}});export{i as u};
