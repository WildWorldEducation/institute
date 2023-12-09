import{d as s}from"./main-b55e7e7e.js";const i=s("settings",{state:()=>({settings:{}}),actions:{async getSettings(){const t=await(await fetch("/settings")).json();this.settings=t}}});export{i as u};
