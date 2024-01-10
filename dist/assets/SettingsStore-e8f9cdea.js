import{d as s}from"./main-e9e6a9b3.js";const i=s("settings",{state:()=>({settings:{}}),actions:{async getSettings(){const t=await(await fetch("/settings")).json();this.settings=t}}});export{i as u};
