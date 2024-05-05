import{I as m,_ as p,m as k,i as F,o as i,c as l,b as _,F as C,k as L,d as t,t as c,l as o,a as h,w as u}from"./main-7394969f.js";const v=m("resources",{state:()=>({resourcesList:[]}),actions:{async getResourcesList(){const s=await(await fetch("/resources/list")).json();this.resourcesList=s}}}),S=m("mcQuestions",{state:()=>({mcQuestionsList:[]}),actions:{async getMCQuestionsList(){const s=await(await fetch("/questions/mc/list")).json();this.mcQuestionsList=s}}});const b={setup(){const e=k(),s=v(),f=S();return{skillsStore:e,resourcesStore:s,mcQuestionsStore:f}},data(){return{contentFlags:[],skillFlags:[],resourcesFlags:[],mcQuestionFlags:[],isContentFlagsLoaded:!1}},components:{},async created(){},async mounted(){this.skillsStore.skillsList.length==0&&(await this.skillsStore.getSkillsList(),console.log("1")),this.resourcesStore.resourcesList.length==0&&(await this.resourcesStore.getResourcesList(),console.log("2")),this.mcQuestionsStore.mcQuestionsList.length==0&&(await this.mcQuestionsStore.getMCQuestionsList(),console.log("3")),await this.getContentFlags()},methods:{async getContentFlags(){fetch("/content-flags/list").then(function(e){return e.json()}).then(e=>{this.contentFlags=e}).then(()=>{for(let e=0;e<this.contentFlags.length;e++)if(this.contentFlags[e].content_type=="skill")for(let s=0;s<this.skillsStore.skillsList.length;s++)this.contentFlags[e].content_id==this.skillsStore.skillsList[s].id&&(this.skillsStore.skillsList[s].flagId=this.contentFlags[e].id,this.skillFlags.push(this.skillsStore.skillsList[s]));else if(this.contentFlags[e].content_type=="resource")for(let s=0;s<this.resourcesStore.resourcesList.length;s++)this.contentFlags[e].content_id==this.resourcesStore.resourcesList[s].id&&(this.resourcesStore.resourcesList[s].flagId=this.contentFlags[e].id,this.resourcesFlags.push(this.resourcesStore.resourcesList[s]));else if(this.contentFlags[e].content_type=="mc_question")for(let s=0;s<this.mcQuestionsStore.mcQuestionsList.length;s++)this.contentFlags[e].content_id==this.mcQuestionsStore.mcQuestionsList[s].id&&(this.mcQuestionsStore.mcQuestionsList[s].flagId=this.contentFlags[e].id,this.mcQuestionFlags.push(this.mcQuestionsStore.mcQuestionsList[s]));this.isContentFlagsLoaded=!0})},dismissFlag(e){const s=fetch("/content-flags/"+e,{method:"DELETE"});s.error&&console.log(s.error),this.skillFlags=[],this.resourcesFlags=[],this.mcQuestionFlags=[],this.getContentFlags()}}},Q={class:"container"},x={key:0},y={key:1},M={key:2},Z=t("h1",{class:"mt-3"},"Content Flags",-1),I={key:0},j={class:"flag-container mb-2"},B=t("strong",null,"Question:",-1),E=t("strong",null,"Correct Answer:",-1),T=t("strong",null,"Incorrect Answer 1:",-1),V=t("strong",null,"Incorrect Answer 2:",-1),A=t("strong",null,"Incorrect Answer 3:",-1),D=t("strong",null,"Incorrect Answer 4:",-1),N=t("strong",null,"Explanation:",-1),H={class:"d-flex justify-content-end mt-3"},R=t("svg",{width:"19",height:"20",viewBox:"0 0 19 20",fill:"none",xmlns:"http://www.w3.org/2000/svg"},[t("path",{d:"M0.75558 19.3181C0.77635 19.5132 0.87137 19.6928 1.02096 19.8198C1.17055 19.9468 1.36325 20.0114 1.55915 20.0002L5.27701 19.8288L0.398438 15.6145L0.75558 19.3181Z",fill:"white"}),t("path",{d:"M11.8467 2.24484L0.801758 15.0315L5.6802 19.2454L16.7251 6.45877L11.8467 2.24484Z",fill:"white"}),t("path",{d:"M18.2555 3.11796L14.934 0.260817C14.832 0.172259 14.7134 0.104756 14.5852 0.0621907C14.4569 0.0196256 14.3215 0.00283902 14.1868 0.0127967C14.052 0.0227543 13.9205 0.0592596 13.7999 0.120212C13.6793 0.181165 13.572 0.265362 13.484 0.36796L12.4805 1.50725L17.359 5.71439L18.3519 4.56082C18.5289 4.35602 18.6181 4.08969 18.6 3.81958C18.582 3.54948 18.4582 3.29738 18.2555 3.11796Z",fill:"white"})],-1),G=["onClick"],z=t("svg",{width:"18",height:"18",viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg"},[t("path",{d:"M0.312625 14.5205L4.83312 9.99999L0.312625 5.49218C0.111396 5.29025 -0.00159545 5.0168 -0.00159545 4.73172C-0.00159545 4.44665 0.111396 4.17319 0.312625 3.97126L3.96282 0.312625C4.16474 0.111396 4.4382 -0.00159545 4.72327 -0.00159545C5.00835 -0.00159545 5.2818 0.111396 5.48373 0.312625L9.99999 4.83312L14.5205 0.312625C14.6204 0.21056 14.7397 0.12947 14.8714 0.0741101C15.003 0.0187502 15.1444 -0.00976563 15.2873 -0.00976562C15.4301 -0.00976563 15.5715 0.0187502 15.7032 0.0741101C15.8349 0.12947 15.9541 0.21056 16.0541 0.312625L19.6874 3.96282C19.8886 4.16474 20.0016 4.4382 20.0016 4.72327C20.0016 5.00835 19.8886 5.2818 19.6874 5.48373L15.1669 9.99999L19.6874 14.5205C19.8883 14.7217 20.0012 14.9944 20.0012 15.2788C20.0012 15.5632 19.8883 15.836 19.6874 16.0372L16.0541 19.6874C15.8529 19.8883 15.5801 20.0012 15.2957 20.0012C15.0113 20.0012 14.7386 19.8883 14.5374 19.6874L9.99999 15.1669L5.49218 19.6874C5.29025 19.8886 5.0168 20.0016 4.73172 20.0016C4.44665 20.0016 4.17319 19.8886 3.97126 19.6874L0.312625 16.0541C0.21056 15.9541 0.12947 15.8349 0.0741101 15.7032C0.0187502 15.5715 -0.00976563 15.4301 -0.00976562 15.2873C-0.00976563 15.1444 0.0187502 15.003 0.0741101 14.8714C0.12947 14.7397 0.21056 14.6204 0.312625 14.5205Z",fill:"white"})],-1),J={key:1,class:"mt-3"},K={class:"flag-container mb-2"},O=t("strong",null,"Source:",-1),P=["innerHTML"],U={class:"d-flex justify-content-end mt-3"},W=t("svg",{width:"19",height:"20",viewBox:"0 0 19 20",fill:"none",xmlns:"http://www.w3.org/2000/svg"},[t("path",{d:"M0.75558 19.3181C0.77635 19.5132 0.87137 19.6928 1.02096 19.8198C1.17055 19.9468 1.36325 20.0114 1.55915 20.0002L5.27701 19.8288L0.398438 15.6145L0.75558 19.3181Z",fill:"white"}),t("path",{d:"M11.8467 2.24484L0.801758 15.0315L5.6802 19.2454L16.7251 6.45877L11.8467 2.24484Z",fill:"white"}),t("path",{d:"M18.2555 3.11796L14.934 0.260817C14.832 0.172259 14.7134 0.104756 14.5852 0.0621907C14.4569 0.0196256 14.3215 0.00283902 14.1868 0.0127967C14.052 0.0227543 13.9205 0.0592596 13.7999 0.120212C13.6793 0.181165 13.572 0.265362 13.484 0.36796L12.4805 1.50725L17.359 5.71439L18.3519 4.56082C18.5289 4.35602 18.6181 4.08969 18.6 3.81958C18.582 3.54948 18.4582 3.29738 18.2555 3.11796Z",fill:"white"})],-1),X=["onClick"],Y=t("svg",{width:"18",height:"18",viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg"},[t("path",{d:"M0.312625 14.5205L4.83312 9.99999L0.312625 5.49218C0.111396 5.29025 -0.00159545 5.0168 -0.00159545 4.73172C-0.00159545 4.44665 0.111396 4.17319 0.312625 3.97126L3.96282 0.312625C4.16474 0.111396 4.4382 -0.00159545 4.72327 -0.00159545C5.00835 -0.00159545 5.2818 0.111396 5.48373 0.312625L9.99999 4.83312L14.5205 0.312625C14.6204 0.21056 14.7397 0.12947 14.8714 0.0741101C15.003 0.0187502 15.1444 -0.00976563 15.2873 -0.00976562C15.4301 -0.00976563 15.5715 0.0187502 15.7032 0.0741101C15.8349 0.12947 15.9541 0.21056 16.0541 0.312625L19.6874 3.96282C19.8886 4.16474 20.0016 4.4382 20.0016 4.72327C20.0016 5.00835 19.8886 5.2818 19.6874 5.48373L15.1669 9.99999L19.6874 14.5205C19.8883 14.7217 20.0012 14.9944 20.0012 15.2788C20.0012 15.5632 19.8883 15.836 19.6874 16.0372L16.0541 19.6874C15.8529 19.8883 15.5801 20.0012 15.2957 20.0012C15.0113 20.0012 14.7386 19.8883 14.5374 19.6874L9.99999 15.1669L5.49218 19.6874C5.29025 19.8886 5.0168 20.0016 4.73172 20.0016C4.44665 20.0016 4.17319 19.8886 3.97126 19.6874L0.312625 16.0541C0.21056 15.9541 0.12947 15.8349 0.0741101 15.7032C0.0187502 15.5715 -0.00976563 15.4301 -0.00976562 15.2873C-0.00976563 15.1444 0.0187502 15.003 0.0741101 14.8714C0.12947 14.7397 0.21056 14.6204 0.312625 14.5205Z",fill:"white"})],-1),q={key:2,class:"mt-3"},$={class:"flag-container mb-2"},t1=t("strong",null,"Skill: ",-1),s1=t("p",null,[t("strong",null,"Mastery Requirements: ")],-1),e1=["innerHTML"],n1={class:"d-flex justify-content-end mt-3"},o1=t("svg",{width:"19",height:"20",viewBox:"0 0 19 20",fill:"none",xmlns:"http://www.w3.org/2000/svg"},[t("path",{d:"M0.75558 19.3181C0.77635 19.5132 0.87137 19.6928 1.02096 19.8198C1.17055 19.9468 1.36325 20.0114 1.55915 20.0002L5.27701 19.8288L0.398438 15.6145L0.75558 19.3181Z",fill:"white"}),t("path",{d:"M11.8467 2.24484L0.801758 15.0315L5.6802 19.2454L16.7251 6.45877L11.8467 2.24484Z",fill:"white"}),t("path",{d:"M18.2555 3.11796L14.934 0.260817C14.832 0.172259 14.7134 0.104756 14.5852 0.0621907C14.4569 0.0196256 14.3215 0.00283902 14.1868 0.0127967C14.052 0.0227543 13.9205 0.0592596 13.7999 0.120212C13.6793 0.181165 13.572 0.265362 13.484 0.36796L12.4805 1.50725L17.359 5.71439L18.3519 4.56082C18.5289 4.35602 18.6181 4.08969 18.6 3.81958C18.582 3.54948 18.4582 3.29738 18.2555 3.11796Z",fill:"white"})],-1),i1=["onClick"],l1=t("svg",{width:"18",height:"18",viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg"},[t("path",{d:"M0.312625 14.5205L4.83312 9.99999L0.312625 5.49218C0.111396 5.29025 -0.00159545 5.0168 -0.00159545 4.73172C-0.00159545 4.44665 0.111396 4.17319 0.312625 3.97126L3.96282 0.312625C4.16474 0.111396 4.4382 -0.00159545 4.72327 -0.00159545C5.00835 -0.00159545 5.2818 0.111396 5.48373 0.312625L9.99999 4.83312L14.5205 0.312625C14.6204 0.21056 14.7397 0.12947 14.8714 0.0741101C15.003 0.0187502 15.1444 -0.00976563 15.2873 -0.00976562C15.4301 -0.00976563 15.5715 0.0187502 15.7032 0.0741101C15.8349 0.12947 15.9541 0.21056 16.0541 0.312625L19.6874 3.96282C19.8886 4.16474 20.0016 4.4382 20.0016 4.72327C20.0016 5.00835 19.8886 5.2818 19.6874 5.48373L15.1669 9.99999L19.6874 14.5205C19.8883 14.7217 20.0012 14.9944 20.0012 15.2788C20.0012 15.5632 19.8883 15.836 19.6874 16.0372L16.0541 19.6874C15.8529 19.8883 15.5801 20.0012 15.2957 20.0012C15.0113 20.0012 14.7386 19.8883 14.5374 19.6874L9.99999 15.1669L5.49218 19.6874C5.29025 19.8886 5.0168 20.0016 4.73172 20.0016C4.44665 20.0016 4.17319 19.8886 3.97126 19.6874L0.312625 16.0541C0.21056 15.9541 0.12947 15.8349 0.0741101 15.7032C0.0187502 15.5715 -0.00976563 15.4301 -0.00976562 15.2873C-0.00976563 15.1444 0.0187502 15.003 0.0741101 14.8714C0.12947 14.7397 0.21056 14.6204 0.312625 14.5205Z",fill:"white"})],-1);function c1(e,s,f,r1,r,g){const a=F("router-link");return i(),l("div",Q,[r.isContentFlagsLoaded==!1?(i(),l("span",x,"Loading...")):r.contentFlags.length==0?(i(),l("span",y,"No content flagged currently")):(i(),l("div",M,[Z,r.mcQuestionFlags.length>0?(i(),l("h2",I,"MC Questions")):_("",!0),(i(!0),l(C,null,L(r.mcQuestionFlags,(n,d)=>(i(),l("div",j,[t("h5",null,"Flag "+c(d+1)+":",1),t("p",null,[B,o(" "+c(n.question),1)]),t("p",null,[E,o(" "+c(n.correct_answer),1)]),t("p",null,[T,o(" "+c(n.incorrect_answer_1),1)]),t("p",null,[V,o(" "+c(n.incorrect_answer_2),1)]),t("p",null,[A,o(" "+c(n.incorrect_answer_3),1)]),t("p",null,[D,o(" "+c(n.incorrect_answer_4),1)]),t("p",null,[N,o(" "+c(n.explanation),1)]),t("div",H,[h(a,{to:"/skills/"+n.skill_id,class:"btn purple-btn me-2",target:"_blank"},{default:u(()=>[o("Go to skill")]),_:2},1032,["to"]),h(a,{to:"/mc-questions/edit/"+n.id,class:"btn purple-btn",target:"_blank"},{default:u(()=>[o(" Edit  "),R]),_:2},1032,["to"]),o("   "),t("button",{class:"btn red-btn",onClick:w=>g.dismissFlag(n.flagId)},[o(" Dismiss  "),z],8,G)])]))),256)),r.resourcesFlags.length>0?(i(),l("h2",J,"Sources")):_("",!0),(i(!0),l(C,null,L(r.resourcesFlags,(n,d)=>(i(),l("div",K,[t("h5",null,"Flag "+c(d+1)+":",1),t("p",null,[O,t("span",{innerHTML:n.content},null,8,P)]),t("div",U,[h(a,{to:"/skills/"+n.skill_id,class:"btn purple-btn me-2",target:"_blank"},{default:u(()=>[o("Go to skill")]),_:2},1032,["to"]),h(a,{to:"/resources/edit/"+n.id,class:"btn purple-btn",target:"_blank"},{default:u(()=>[o(" Edit  "),W]),_:2},1032,["to"]),o("   "),t("button",{class:"btn red-btn",onClick:w=>g.dismissFlag(n.flagId)},[o(" Dismiss  "),Y],8,X)])]))),256)),r.skillFlags.length>0?(i(),l("h2",q,"Skills")):_("",!0),(i(!0),l(C,null,L(r.skillFlags,(n,d)=>(i(),l("div",$,[t("h5",null,"Flag "+c(d+1)+":",1),t("p",null,[t1,o(c(n.name),1)]),s1,t("div",{innerHTML:n.mastery_requirements},null,8,e1),t("div",n1,[h(a,{to:"/skills/"+n.id,class:"btn purple-btn me-2",target:"_blank"},{default:u(()=>[o("Go to skill")]),_:2},1032,["to"]),h(a,{to:"/skills/edit/"+n.id,class:"btn purple-btn",target:"_blank"},{default:u(()=>[o(" Edit  "),o1]),_:2},1032,["to"]),o("   "),t("button",{class:"btn red-btn",onClick:w=>g.dismissFlag(n.flagId)},[o(" Dismiss  "),l1],8,i1)])]))),256))]))])}const h1=p(b,[["render",c1]]);export{h1 as default};