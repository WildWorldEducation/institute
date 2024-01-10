import{d as s}from"./main-9e027c7c.js";const i=s("settings",{state:()=>({settings:{}}),actions:{async getSettings(){const t=await(await fetch("/settings")).json();this.settings=t}}});export{i as u};
