import{_ as g,a as R,h as I,B as M,r as _,o as r,c as a,d as e,e as k,j as $,l as D,w as h,x as p,p as S,f as y,G as O,t as f,F as C,y as T,I as F,i as w,b as v}from"./main-cbc273cc.js";import{u as E}from"./SettingsStore-2f58061c.js";import{u as P}from"./TagsStore-c6f6841d.js";const U={setup(){const t=R();t.getUserDetails();const s=I();return{userDetailsStore:t,sessionDetailsStore:s}},data(){return{}},computed:{name(){return this.userDetailsStore.firstName?this.userDetailsStore.firstName:" "+this.userDetailsStore.lastName?this.userDetailsStore.lastName:""}},methods:{LogOut(){this.sessionDetailsStore.isLoggedIn=!1;const t={method:"POST",headers:{"Content-Type":"application/json"}};var s="/logout";fetch(s,t).then(function(d){M.push({name:"login"})})}}},m=t=>(S("data-v-c1204225"),t=t(),y(),t),Q={class:"container mt-3"},j=m(()=>e("h1",{class:"h1-stroke"},"My Profile",-1)),z={class:"row mt-3"},G={class:"col-12 col-md-6"},W=["src"],Z=["src"],J={class:"row my-3 mx-0"},H={class:"col-12 col-5 d-flex gap-3 flex-row justify-content-center justify-content-md-start ps-lg-0"},K=m(()=>e("svg",{width:"19",height:"20",viewBox:"0 0 19 20",fill:"none",xmlns:"http://www.w3.org/2000/svg"},[e("path",{d:"M0.75558 19.3181C0.77635 19.5132 0.87137 19.6928 1.02096 19.8198C1.17055 19.9468 1.36325 20.0114 1.55915 20.0002L5.27701 19.8288L0.398438 15.6145L0.75558 19.3181Z",fill:"white"}),e("path",{d:"M11.8467 2.24484L0.801758 15.0315L5.6802 19.2454L16.7251 6.45877L11.8467 2.24484Z",fill:"white"}),e("path",{d:"M18.2555 3.11796L14.934 0.260817C14.832 0.172259 14.7134 0.104756 14.5852 0.0621907C14.4569 0.0196256 14.3215 0.00283902 14.1868 0.0127967C14.052 0.0227543 13.9205 0.0592596 13.7999 0.120212C13.6793 0.181165 13.572 0.265362 13.484 0.36796L12.4805 1.50725L17.359 5.71439L18.3519 4.56082C18.5289 4.35602 18.6181 4.08969 18.6 3.81958C18.582 3.54948 18.4582 3.29738 18.2555 3.11796Z",fill:"white"})],-1)),X={class:""},Y=m(()=>e("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",width:"22",height:"22",fill:"white"},[e("path",{d:"M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"})],-1)),ee={key:1,href:"/login",class:"btn primary-btn",role:"button"},te={class:"col-12 col-md-6 form"},se={class:"mb-3"},oe=m(()=>e("h2",{class:"h2-stroke"},"Name",-1)),ne={class:"mb-3"},le=m(()=>e("h2",{class:"h2-stroke"},"Username",-1)),ie={class:"mb-3"},re=m(()=>e("h2",{class:"h2-stroke"},"Email",-1)),ae={key:0,class:"mb-3"},ce=m(()=>e("h2",{class:"h2-stroke"},"Role",-1)),de={key:1,class:"mb-3"},ue=m(()=>e("h2",{class:"h2-stroke"},"Instructor",-1)),he=["value"];function _e(t,s,d,l,n,o){const i=_("router-link");return r(),a("div",Q,[j,e("div",z,[e("div",G,[e("img",{id:"img-background",src:l.userDetailsStore.avatar,style:{"background-color":"lightgrey"},class:"d-none d-lg-block img-fluid"},null,8,W),e("img",{id:"img-background",src:l.userDetailsStore.avatar,style:{"background-color":"lightgrey"},class:"d-lg-none img-fluid"},null,8,Z),e("div",J,[e("div",H,[k(i,{class:"secondary-btn btn",to:"/profile/edit",role:"button"},{default:$(()=>[D("Edit   "),K]),_:1}),e("div",X,[l.sessionDetailsStore.isLoggedIn==!0?(r(),a("a",{key:0,onClick:s[0]||(s[0]=u=>o.LogOut()),class:"btn red-btn",role:"button"},[D(" Log out   "),Y])):(r(),a("a",ee,"Log in"))])])])]),e("div",te,[e("div",se,[oe,h(e("input",{"onUpdate:modelValue":s[1]||(s[1]=u=>o.name=u),type:"text",class:"form-control",readonly:""},null,512),[[p,o.name]])]),e("div",ne,[le,h(e("input",{"onUpdate:modelValue":s[2]||(s[2]=u=>l.userDetailsStore.userName=u),type:"text",class:"form-control",readonly:""},null,512),[[p,l.userDetailsStore.userName]])]),e("div",ie,[re,h(e("input",{"onUpdate:modelValue":s[3]||(s[3]=u=>l.userDetailsStore.email=u),type:"email",class:"form-control",readonly:""},null,512),[[p,l.userDetailsStore.email]])]),l.userDetailsStore.role!="student"?(r(),a("div",ae,[ce,h(e("input",{"onUpdate:modelValue":s[4]||(s[4]=u=>l.userDetailsStore.role=u),type:"text",class:"form-control",readonly:""},null,512),[[p,l.userDetailsStore.role]])])):(r(),a("div",de,[ue,e("input",{type:"text",class:"form-control",readonly:"",value:l.userDetailsStore.instructorUsername},null,8,he)]))])])])}const me=g(U,[["render",_e],["__scopeId","data-v-c1204225"]]);const pe={setup(){return{userDetailsStore:R()}},data(){return{theme:this.userDetailsStore.theme}},created(){},async mounted(){await this.userDetailsStore.getUserDetails()},methods:{chooseTheme(){this.userDetailsStore.updateTheme(this.theme)}}},L=t=>(S("data-v-60e115c0"),t=t(),y(),t),fe={class:"container pb-4"},ge=L(()=>e("h2",{id:"heading",class:"my-3 ms-0 ms-md-3 ms-lg-0 mt-2 mt-md-4 h2-stroke"}," Theme ",-1)),Se={class:"mb-3 text-start themes"},ye=L(()=>e("option",{value:"original"},"Original",-1)),be=L(()=>e("option",{value:"apprentice"},"Apprentice",-1)),ve=L(()=>e("option",{value:"scholar"},"Scholar",-1)),De=[ye,be,ve];function ke(t,s,d,l,n,o){return r(),a("div",fe,[ge,e("div",Se,[h(e("select",{class:"form-select",onChange:s[0]||(s[0]=i=>o.chooseTheme()),"onUpdate:modelValue":s[1]||(s[1]=i=>n.theme=i)},De,544),[[O,n.theme]])])])}const we=g(pe,[["render",ke],["__scopeId","data-v-60e115c0"]]);const Ce={setup(){const t=E();t.getSettings();const s=P();return s.tagsList.length==0&&s.getTagsList(),{settingsStore:t,tagsStore:s}},data(){return{filters:[]}},async created(){this.tagsStore.tagsList.length==0&&await this.tagsStore.getTagsList();for(let t=0;t<this.tagsStore.tagsList.length;t++)this.tagsStore.tagsList[t].is_active=="active"&&this.filters.push(this.tagsStore.tagsList[t].id)}},b=t=>(S("data-v-4a7892ba"),t=t(),y(),t),Le={class:"container mt-3 pb-3 px-3 px-lg-0"},xe=b(()=>e("hr",null,null,-1)),$e=b(()=>e("h1",null,"Settings",-1)),Te={key:0},Re={key:1},qe={class:"mt-4"},Ae=b(()=>e("svg",{width:"19",height:"20",viewBox:"0 0 19 20",fill:"none",xmlns:"http://www.w3.org/2000/svg"},[e("path",{d:"M0.75558 19.3181C0.77635 19.5132 0.87137 19.6928 1.02096 19.8198C1.17055 19.9468 1.36325 20.0114 1.55915 20.0002L5.27701 19.8288L0.398438 15.6145L0.75558 19.3181Z",fill:"white"}),e("path",{d:"M11.8467 2.24484L0.801758 15.0315L5.6802 19.2454L16.7251 6.45877L11.8467 2.24484Z",fill:"white"}),e("path",{d:"M18.2555 3.11796L14.934 0.260817C14.832 0.172259 14.7134 0.104756 14.5852 0.0621907C14.4569 0.0196256 14.3215 0.00283902 14.1868 0.0127967C14.052 0.0227543 13.9205 0.0592596 13.7999 0.120212C13.6793 0.181165 13.572 0.265362 13.484 0.36796L12.4805 1.50725L17.359 5.71439L18.3519 4.56082C18.5289 4.35602 18.6181 4.08969 18.6 3.81958C18.582 3.54948 18.4582 3.29738 18.2555 3.11796Z",fill:"white"})],-1)),Be={class:"mt-5"},Ne=b(()=>e("hr",null,null,-1)),Ve=b(()=>e("h2",null,"Global Skill Filters",-1)),Ie={class:"col"},Me={class:"control control-checkbox"},Oe={class:"my-auto mx-2 me-4"},Fe=["value"],Ee=b(()=>e("div",{class:"control_indicator"},null,-1)),Pe={class:"mt-4"};function Ue(t,s,d,l,n,o){const i=_("router-link");return r(),a("div",Le,[e("section",null,[xe,$e,e("p",null," time for student skills to degrade (in days): "+f(l.settingsStore.skillDegradationDays),1),e("p",null," max number of questions per quiz: "+f(l.settingsStore.quizMaxQuestions),1),e("p",null," Pass mark: "+f(l.settingsStore.passMark)+"% ",1),e("p",null,[D(" grading method for essay questions: "),l.settingsStore.isManualEssayMarking==0?(r(),a("span",Te,"Automatic (AI)")):(r(),a("span",Re,"Manual (instructor)"))]),e("p",qe,[k(i,{to:"/settings/edit",class:"btn green-btn",role:"button"},{default:$(()=>[D(" Edit  "),Ae]),_:1})])]),e("section",Be,[Ne,Ve,e("div",Ie,[(r(!0),a(C,null,T(l.tagsStore.tagsList,u=>(r(),a("label",Me,[e("span",Oe,f(u.name),1),h(e("input",{type:"checkbox",value:u.id,"onUpdate:modelValue":s[0]||(s[0]=x=>n.filters=x),disabled:""},null,8,Fe),[[F,n.filters]]),Ee]))),256))]),e("p",Pe,[k(i,{to:"/tags/select",class:"btn green-btn",role:"button"},{default:$(()=>[D(" Select Filters ")]),_:1})])])])}const Qe=g(Ce,[["render",Ue],["__scopeId","data-v-4a7892ba"]]);const je={data(){return{questionCSVFile:"",filesArray:[],questionsArray:[],counter1:0,counter2:0,incorrectlyFormattedQuestions:!1}},methods:{OnFileChange(t){var s=t.target.files||t.dataTransfer.files;if(s.length)for(let d=0;d<s.length;d++)this.ReadFile(s[d])},ReadFile(t){var s=new FileReader;s.onload=d=>{var l=d.target.result,n=l.split(/\r?\n|\r|\n/g);for(let o=n.length-1;o>=0;o--)(n[o]==""||n[o]==" ")&&n.splice(o,1);for(let o=n.length-1;o>=0;o--)n[o].split("|").length!=9&&(this.incorrectlyFormattedQuestions=!0,n.splice(o,1));for(let o=n.length-1;o>=0;o--)(isNaN(n[o].split("|")[0])||isNaN(parseFloat(n[o].split("|")[0])))&&(this.incorrectlyFormattedQuestions=!0,n.splice(o,1));for(let o=0;o<n.length;o++)this.questionsArray.push(n[o].split("|"))},s.readAsText(t)},Submit(){if(this.incorrectlyFormattedQuestions&&!confirm("Incorrectly formatted question were found. Only "+this.questionsArray.length+" questions will be uploaded. Continue?"))return;const t=[];for(let l=0;l<this.questionsArray.length;l++){const n={};n.skillId=this.questionsArray[l][0],n.name=this.questionsArray[l][1],n.question=this.questionsArray[l][2],n.correct_answer=this.questionsArray[l][3],n.incorrect_answer_1=this.questionsArray[l][4],n.incorrect_answer_2=this.questionsArray[l][5],n.incorrect_answer_3=this.questionsArray[l][6],n.incorrect_answer_4=this.questionsArray[l][7],n.explanation=this.questionsArray[l][8],t.push(n)}const s={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({questionArray:t})};var d="/questions/mc-questions/bulk-add";fetch(d,s).then(()=>{alert("Questions uploaded."),this.questionCSVFile="",this.filesArray=[],this.questionsArray=[]})}}},q=t=>(S("data-v-4c1f087b"),t=t(),y(),t),ze={class:"container mt-3 pb-5 px-3 px-lg-0"},Ge=q(()=>e("hr",null,null,-1)),We=q(()=>e("h2",null,"Add Multiple Choice Question CSVs For Multiple Skills",-1)),Ze={class:"row"},Je={class:"col-sm-4"},He={key:0},Ke=q(()=>e("p",{style:{"font-size":"14px"}},[e("em",null,"Maximum file size 15mb")],-1)),Xe={key:1};function Ye(t,s,d,l,n,o){return r(),a("div",ze,[Ge,We,e("div",Ze,[e("div",Je,[n.questionCSVFile?(r(),a("div",Xe,[e("p",null,[e("button",{class:"btn btn-warning",onClick:s[1]||(s[1]=(...i)=>t.removeImage&&t.removeImage(...i))}," Remove file ")])])):(r(),a("div",He,[e("input",{class:"form-control",type:"file",accept:".csv,.txt",onChange:s[0]||(s[0]=(...i)=>o.OnFileChange&&o.OnFileChange(...i)),multiple:""},null,32),Ke])),e("button",{class:"btn green-btn",onClick:s[2]||(s[2]=i=>o.Submit())},"Submit")])])])}const et=g(je,[["render",Ye],["__scopeId","data-v-4c1f087b"]]);const tt={data(){return{numOfSourcesPerSkill:3,blockedRootDomain:null,blockedRootDomains:[],whiteListedRootDomain:null,whiteListedRootDomains:[]}},created(){this.ListBlockedRootDomains(),this.ListWhiteListedRootDomains()},methods:{async GenerateSources(){alert("Sources will now be generated for all skills. This will take some time.");var t="/resources/generate-sources";await fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({numSources:this.numOfSourcesPerSkill})})},DeleteSourcesByRootDomain(){if(confirm("Are you sure?")==!0){var s="/resources/delete-domain";fetch(s,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({blockedRootDomain:this.blockedRootDomain})})}},async ListBlockedRootDomains(){const s=await(await fetch("/resources/list-blocked-domains")).json();this.blockedRootDomains=s},async UnBlockRootDomain(t){const s=await fetch("/resources/unblock-domain/"+t,{method:"DELETE"});s.error&&console.log(s.error),this.ListBlockedRootDomains()},AddRootDomainToWhiteList(){var t="/resources/add-domain-to-whitelist";fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({whiteListedRootDomain:this.whiteListedRootDomain})}).then(()=>{this.ListWhiteListedRootDomains()})},async ListWhiteListedRootDomains(){const s=await(await fetch("/resources/list-whitelisted-domains")).json();this.whiteListedRootDomains=s},async RemoveFromWhiteList(t){const s=await fetch("/resources/remove-domain-from-whitelist/"+t,{method:"DELETE"});s.error&&console.log(s.error),this.ListWhiteListedRootDomains()},DeleteDuplicateSources(){const t=fetch("/resources/delete-duplicate-sources",{method:"DELETE"});t.error&&console.log(t.error)},DeleteBrokenSources(){const t=fetch("/resources/delete-broken-sources",{method:"DELETE"});t.error&&console.log(t.error)}}},c=t=>(S("data-v-8e432062"),t=t(),y(),t),st={class:"container mt-3 pb-5 px-3 px-lg-0"},ot=c(()=>e("hr",null,null,-1)),nt=c(()=>e("h1",null,"Auto Generate Sources",-1)),lt={class:"row"},it={class:"col"},rt=c(()=>e("label",{for:"numSourcesPerSkill",class:"form-label"},"Number of sources per skill to generate (max 10):",-1)),at=c(()=>e("p",{style:{"font-size":"14px"},class:"mt-2"},[e("strong",null,"Notes:"),e("ul",null,[e("li",null,[e("em",null,"To be done by devs and not admins.")]),e("li",null,[e("em",null,"It can cost a lot each time.")]),e("li",null,[e("em",null,"It runs for all ~3700 relevant skills.")]),e("li",null,[e("em",null,"It crashes frequently.")])])],-1)),ct=c(()=>e("h2",{class:"mt-3"},"Blacklist Domain",-1)),dt={class:"mb-4"},ut=c(()=>e("p",{style:{"font-size":"14px"}},[e("em",null,"This will also delete sources using these domains.")],-1)),ht=c(()=>e("h3",null,"Blacklisted Domains:",-1)),_t={class:"mb-5"},mt={class:"d-flex"},pt=["onClick"],ft=c(()=>e("svg",{width:"13",height:"13",viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg"},[e("path",{d:"M0.312625 14.5205L4.83312 9.99999L0.312625 5.49218C0.111396 5.29025 -0.00159545 5.0168 -0.00159545 4.73172C-0.00159545 4.44665 0.111396 4.17319 0.312625 3.97126L3.96282 0.312625C4.16474 0.111396 4.4382 -0.00159545 4.72327 -0.00159545C5.00835 -0.00159545 5.2818 0.111396 5.48373 0.312625L9.99999 4.83312L14.5205 0.312625C14.6204 0.21056 14.7397 0.12947 14.8714 0.0741101C15.003 0.0187502 15.1444 -0.00976563 15.2873 -0.00976562C15.4301 -0.00976563 15.5715 0.0187502 15.7032 0.0741101C15.8349 0.12947 15.9541 0.21056 16.0541 0.312625L19.6874 3.96282C19.8886 4.16474 20.0016 4.4382 20.0016 4.72327C20.0016 5.00835 19.8886 5.2818 19.6874 5.48373L15.1669 9.99999L19.6874 14.5205C19.8883 14.7217 20.0012 14.9944 20.0012 15.2788C20.0012 15.5632 19.8883 15.836 19.6874 16.0372L16.0541 19.6874C15.8529 19.8883 15.5801 20.0012 15.2957 20.0012C15.0113 20.0012 14.7386 19.8883 14.5374 19.6874L9.99999 15.1669L5.49218 19.6874C5.29025 19.8886 5.0168 20.0016 4.73172 20.0016C4.44665 20.0016 4.17319 19.8886 3.97126 19.6874L0.312625 16.0541C0.21056 15.9541 0.12947 15.8349 0.0741101 15.7032C0.0187502 15.5715 -0.00976563 15.4301 -0.00976562 15.2873C-0.00976563 15.1444 0.0187502 15.003 0.0741101 14.8714C0.12947 14.7397 0.21056 14.6204 0.312625 14.5205Z",fill:"white"})],-1)),gt=[ft],St=c(()=>e("h2",null,"Whitelist Domain:",-1)),yt={class:"mb-3"},bt=c(()=>e("p",{style:{"font-size":"14px"}},[e("em",null,"The AI will preference these domains.")],-1)),vt=c(()=>e("h3",{class:"mt-4"},"Whitelisted Domains:",-1)),Dt={class:"d-flex"},kt=["onClick"],wt=c(()=>e("svg",{width:"13",height:"13",viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg"},[e("path",{d:"M0.312625 14.5205L4.83312 9.99999L0.312625 5.49218C0.111396 5.29025 -0.00159545 5.0168 -0.00159545 4.73172C-0.00159545 4.44665 0.111396 4.17319 0.312625 3.97126L3.96282 0.312625C4.16474 0.111396 4.4382 -0.00159545 4.72327 -0.00159545C5.00835 -0.00159545 5.2818 0.111396 5.48373 0.312625L9.99999 4.83312L14.5205 0.312625C14.6204 0.21056 14.7397 0.12947 14.8714 0.0741101C15.003 0.0187502 15.1444 -0.00976563 15.2873 -0.00976562C15.4301 -0.00976563 15.5715 0.0187502 15.7032 0.0741101C15.8349 0.12947 15.9541 0.21056 16.0541 0.312625L19.6874 3.96282C19.8886 4.16474 20.0016 4.4382 20.0016 4.72327C20.0016 5.00835 19.8886 5.2818 19.6874 5.48373L15.1669 9.99999L19.6874 14.5205C19.8883 14.7217 20.0012 14.9944 20.0012 15.2788C20.0012 15.5632 19.8883 15.836 19.6874 16.0372L16.0541 19.6874C15.8529 19.8883 15.5801 20.0012 15.2957 20.0012C15.0113 20.0012 14.7386 19.8883 14.5374 19.6874L9.99999 15.1669L5.49218 19.6874C5.29025 19.8886 5.0168 20.0016 4.73172 20.0016C4.44665 20.0016 4.17319 19.8886 3.97126 19.6874L0.312625 16.0541C0.21056 15.9541 0.12947 15.8349 0.0741101 15.7032C0.0187502 15.5715 -0.00976563 15.4301 -0.00976562 15.2873C-0.00976563 15.1444 0.0187502 15.003 0.0741101 14.8714C0.12947 14.7397 0.21056 14.6204 0.312625 14.5205Z",fill:"white"})],-1)),Ct=[wt],Lt=c(()=>e("h2",{class:"mt-5"},"Delete Duplicate Sources",-1)),xt=c(()=>e("p",{style:{"font-size":"14px"}},[e("ul",null,[e("li",null,[e("em",null,"To be done by devs and not admins.")]),e("li",null,[e("em",null,"To search for and delete duplicate urls for the same skill.")])])],-1)),$t=c(()=>e("h2",{class:"mt-5"},"Scan For and Delete Sources with Broken Links",-1)),Tt=c(()=>e("div",{style:{"font-size":"14px"},class:"mt-2"},[e("strong",null,"Notes:"),e("ul",null,[e("li",null,[e("em",null,"To be done by devs and not admins.")]),e("li",null,[e("em",null,"To search for sources containing broken urls.")]),e("li",null,[e("em",null,"Need to be deleted manually.")]),e("li",null,[e("em",null,"Need to check them manually first.")])])],-1));function Rt(t,s,d,l,n,o){return r(),a("div",st,[ot,nt,e("div",lt,[e("div",it,[rt,h(e("input",{"onUpdate:modelValue":s[0]||(s[0]=i=>n.numOfSourcesPerSkill=i),type:"number",id:"numSourcesPerSkill",min:"1",max:"10",step:"1",class:"form-control","aria-describedby":"numSourcesPerSkill",onkeypress:"return event.charCode >= 48 && event.charCode <= 57"},null,512),[[p,n.numOfSourcesPerSkill]]),e("button",{class:"btn green-btn mt-3",onClick:s[1]||(s[1]=(...i)=>o.GenerateSources&&o.GenerateSources(...i))}," Generate Sources "),at])]),ct,e("div",dt,[h(e("input",{type:"text","onUpdate:modelValue":s[2]||(s[2]=i=>n.blockedRootDomain=i),class:"form-control"},null,512),[[p,n.blockedRootDomain]]),e("button",{class:"btn red-btn mt-3",onClick:s[3]||(s[3]=(...i)=>o.DeleteSourcesByRootDomain&&o.DeleteSourcesByRootDomain(...i))}," Delete & Block "),ut]),ht,e("ul",_t,[(r(!0),a(C,null,T(n.blockedRootDomains,i=>(r(),a("li",null,[e("span",mt,[e("span",null,f(i.root_domain)+" ",1),e("button",{class:"btn red-btn red-mini-btn",onClick:u=>o.UnBlockRootDomain(i.id)},gt,8,pt)])]))),256))]),St,e("div",yt,[h(e("input",{type:"text","onUpdate:modelValue":s[4]||(s[4]=i=>n.whiteListedRootDomain=i),class:"form-control"},null,512),[[p,n.whiteListedRootDomain]]),e("button",{class:"btn green-btn mt-3",onClick:s[5]||(s[5]=i=>o.AddRootDomainToWhiteList())}," Add "),bt]),vt,e("ul",null,[(r(!0),a(C,null,T(n.whiteListedRootDomains,i=>(r(),a("li",null,[e("span",Dt,[e("span",null,f(i.root_domain)+" ",1),e("button",{class:"btn red-btn red-mini-btn",onClick:u=>o.RemoveFromWhiteList(i.id)},Ct,8,kt)])]))),256))]),Lt,e("button",{class:"btn red-btn mt-3",onClick:s[6]||(s[6]=(...i)=>o.DeleteDuplicateSources&&o.DeleteDuplicateSources(...i))}," Delete "),xt,$t,e("button",{class:"btn red-btn mt-3",onClick:s[7]||(s[7]=(...i)=>o.DeleteBrokenSources&&o.DeleteBrokenSources(...i))}," Scan and Delete "),Tt])}const qt=g(tt,[["render",Rt],["__scopeId","data-v-8e432062"]]);const At={setup(){},data(){return{totalDownVotedSources:0}},async created(){await this.getTotalDownvotedSources()},methods:{async getTotalDownvotedSources(){fetch("/resources/downvoted").then(function(t){return t.json()}).then(t=>{console.log(t),this.totalDownVotedSources=t})},async deleteSources(){await fetch("/resources/downvoted",{method:"DELETE"}),alert("all gone"),this.getTotalDownvotedSources()}}},A=t=>(S("data-v-5c3e1020"),t=t(),y(),t),Bt={class:"container pb-3 px-3 px-lg-0"},Nt=A(()=>e("hr",null,null,-1)),Vt=A(()=>e("h2",{class:"title"},"Downvoted Sources",-1));function It(t,s,d,l,n,o){return r(),a("div",Bt,[e("section",null,[Nt,Vt,e("p",null,"Number of downvoted sources: "+f(n.totalDownVotedSources),1),e("button",{type:"button",onClick:s[0]||(s[0]=(...i)=>o.deleteSources&&o.deleteSources(...i)),class:"btn btn-danger delete-btn"}," Delete them ")])])}const Mt=g(At,[["render",It],["__scopeId","data-v-5c3e1020"]]);const Ot={setup(){return{userDetailsStore:R()}},data(){return{}},components:{ProfileDetails:me,ThemeDetails:we,Settings:Qe,BulkQuestionsUpload:et,AutoGenerateSources:qt,DeleteDownVotedSources:Mt},methods:{CheckMCQuestions(){fetch("/questions/check-questions")}}},Ft={key:3,class:"container mt-1 px-3 px-lg-0 mb-5"},Et=e("hr",null,null,-1),Pt=e("h2",null,"Check MC Questions",-1),Ut=e("p",{style:{"font-size":"14px"},class:"mt-2"},[e("ul",null,[e("li",null,[e("em",null,"To be done by devs and not admins.")]),e("li",null,[e("em",null," Note that this will check ALL unchecked multiple-choice questions, and can be expensive.")])])],-1);function Qt(t,s,d,l,n,o){const i=_("ProfileDetails"),u=_("ThemeDetails"),x=_("Settings"),B=_("BulkQuestionsUpload"),N=_("DeleteDownVotedSources"),V=_("AutoGenerateSources");return r(),a(C,null,[k(i),k(u),l.userDetailsStore.role=="admin"?(r(),w(x,{key:0})):v("",!0),l.userDetailsStore.role=="admin"?(r(),w(B,{key:1})):v("",!0),l.userDetailsStore.role=="admin"||l.userDetailsStore.userName=="Sgt. Dysxleia"||l.userDetailsStore.userName=="jonathandyason@gmail.com"?(r(),w(N,{key:2})):v("",!0),l.userDetailsStore.role=="dev"?(r(),a("section",Ft,[Et,Pt,e("button",{class:"btn green-btn mt-3",onClick:s[0]||(s[0]=jt=>o.CheckMCQuestions())}," Check now "),Ut])):v("",!0),l.userDetailsStore.role=="dev"?(r(),w(V,{key:4})):v("",!0)],64)}const Zt=g(Ot,[["render",Qt]]);export{Zt as default};