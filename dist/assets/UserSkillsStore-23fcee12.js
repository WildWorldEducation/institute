import{H as n}from"./main-cadc5ca7.js";const l=n("userSkills",{state:()=>({unnestedList:[]}),actions:{async getUnnestedList(s){const e=await fetch("/user-skills/unnested-list/"+s);this.unnestedList=await e.json()},async MakeMastered(s,e){const t={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({skill:e})};let i="/user-skills/make-mastered/"+s;fetch(i,t)},async MakeAccessible(s,e){var t="/user-skills/accessible/"+s+"/"+e;fetch(t),await this.getUnnestedList(s)}}});export{l as u};