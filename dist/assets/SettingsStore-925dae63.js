import{d as s}from"./main-1b371a91.js";const i=s("settings",{state:()=>({settings:{}}),actions:{async getSettings(){const t=await(await fetch("/settings")).json();this.settings=t}}});export{i as u};
