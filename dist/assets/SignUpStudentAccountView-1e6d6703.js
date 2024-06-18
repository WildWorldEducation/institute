import{_ as c,q as p,o as l,c as i,d as t,e as o,v as u,b as d,s as w,l as h}from"./main-b5f4324a.js";const f={setup(){},data(){return{newStudent:{id:null,username:null,firstName:null,lastName:null,email:null,password:null},validate:{firstName:!1,lastName:!1,username:!1,email:!1,emailFormat:!1,password:!1}}},async created(){},mounted(){let r=document.createElement("script");r.setAttribute("src","https://accounts.google.com/gsi/client"),r.setAttribute("defer",""),document.head.appendChild(r)},methods:{ValidateForm(){this.newStudent.username==""||this.newStudent.username==null?this.validate.username=!0:this.newStudent.firstName==""||this.newStudent.firstName==null?this.validate.firstName=!0:this.newStudent.lastName==""||this.newStudent.lastName==null?this.validate.lastName=!0:this.newStudent.email==""||this.newStudent.email==null?this.validate.email=!0:this.newStudent.password==""||this.newStudent.password==null?this.validate.password=!0:this.Submit()},ValidateEmail(){/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.newStudent.email)?this.validate.emailFormat=!1:this.validate.emailFormat=!0},Submit(){const r={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:this.newStudent.username,first_name:this.newStudent.firstName,last_name:this.newStudent.lastName,email:this.newStudent.email,password:this.newStudent.password})};var s="/users/new-student/add";fetch(s,r).then(function(a){return a.json()}).then(a=>{a.account=="authorized"?(alert("Account created."),p.push({name:"skills"})):(a.account=="username already taken"||a.account=="email already taken")&&alert(a.account)})}}},_={class:"signup-page"},v={class:"form-signin"},S=t("div",{class:"text-center"},[t("img",{class:"mb-4",src:w,alt:"",width:"72",height:"72"})],-1),g=t("h1",{class:"h3 mb-3 font-weight-normal"},"Student Sign up",-1),N={class:"mt-3"},y={class:"mb-3 text-start"},b={key:0,class:"form-validate"},x={class:"mb-3 text-start"},V={key:0,class:"form-validate"},k={class:"mb-3 text-start"},q={key:0,class:"form-validate"},U={class:"mb-3 text-start"},F={key:0,class:"form-validate"},E={key:1,class:"form-validate"},A={class:"mb-3 text-start"},B={key:0,class:"form-validate"},C=t("div",{id:"g_id_onload","data-client_id":"13191319610-qectaoi146ce1pm4v95jtgctsbtmqb3t.apps.googleusercontent.com","data-context":"signup","data-ux_mode":"redirect","data-login_uri":"/google-signup-attempt","data-auto_prompt":"false"},null,-1),T=t("div",{class:"g_id_signin","data-type":"standard","data-shape":"rectangular","data-theme":"outline","data-text":"signup_with","data-size":"large","data-logo_alignment":"left"},null,-1),j=t("div",{class:"mt-3 signup text-center"},[h(" Have an account? "),t("a",{href:"/login",class:"links"},"Login")],-1);function O(r,s,a,z,e,m){return l(),i("div",_,[t("div",v,[S,g,t("div",N,[t("div",y,[o(t("input",{"onUpdate:modelValue":s[0]||(s[0]=n=>e.newStudent.username=n),type:"text",placeholder:"Username",class:"form-control",required:""},null,512),[[u,e.newStudent.username]]),e.validate.username&&(e.newStudent.username==""||e.newStudent.username==null)?(l(),i("div",b," please enter a username! ")):d("",!0)]),t("div",x,[o(t("input",{"onUpdate:modelValue":s[1]||(s[1]=n=>e.newStudent.firstName=n),type:"text",placeholder:"First name",class:"form-control",required:""},null,512),[[u,e.newStudent.firstName]]),e.validate.firstName&&(e.newStudent.firstName==""||e.newStudent.firstName==null)?(l(),i("div",V," please your first name! ")):d("",!0)]),t("div",k,[o(t("input",{"onUpdate:modelValue":s[2]||(s[2]=n=>e.newStudent.lastName=n),type:"text",placeholder:"Last name",class:"form-control",required:""},null,512),[[u,e.newStudent.lastName]]),e.validate.lastName&&(e.newStudent.lastName==""||e.newStudent.lastName==null)?(l(),i("div",q," please enter your last name! ")):d("",!0)]),t("div",U,[o(t("input",{"onUpdate:modelValue":s[3]||(s[3]=n=>e.newStudent.email=n),type:"email",placeholder:"Email",class:"form-control",onBlur:s[4]||(s[4]=(...n)=>m.ValidateEmail&&m.ValidateEmail(...n)),required:""},null,544),[[u,e.newStudent.email]]),e.validate.email&&(e.newStudent.email==""||e.newStudent.email==null)?(l(),i("div",F," please enter an email address! ")):d("",!0),e.validate.emailFormat?(l(),i("div",E," please enter a valid email address! ")):d("",!0)]),t("div",A,[o(t("input",{"onUpdate:modelValue":s[5]||(s[5]=n=>e.newStudent.password=n),type:"password",placeholder:"Password",class:"form-control",required:""},null,512),[[u,e.newStudent.password]]),e.validate.password&&(e.newStudent.password==""||e.newStudent.password==null)?(l(),i("div",B," please enter a password! ")):d("",!0)]),t("button",{class:"btn btn-dark mb-2",onClick:s[6]||(s[6]=n=>m.ValidateForm())}," Sign up "),C,T,j])])])}const P=c(f,[["render",O]]);export{P as default};