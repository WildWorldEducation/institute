import{_,a as S,g as b,q as k,H as x,r as m,o as l,c as n,d as e,b as c,m as p,w as v,y as w,E as L,e as u,j as z,l as I,p as V,f as M,i as H}from"./main-bd0f1a66.js";import{C as B}from"./CheckPasswordComplexity-6021951d.js";import{u as A}from"./InstructorStudentsStore-f2c87ec7.js";import{f as D,h as P}from"./theme.compact-1a520d59.js";const R={setup(){const o=S(),s=b(),d=k(),h=A(),t=x();return{userDetailsStore:o,skillsStore:s,usersStore:d,instructorStudentsStore:h,userSkillsStore:t}},data(){return{user:{role:"student"},image:"",firstLevelSkills:[],newUserId:null,isValidated:!1,instructors:[],instructorId:0,instructorName:"",showDropDown:!1,showRoleDropDown:!1,passwordVisible:!1,validate:{first_name:!1,last_name:!1,email:!1,username:!1,emailFormat:!1,password:!1,notSquareImg:!1,notCropped:!1,passwordComplex:!1},showCropModal:!1,cropCanvas:"",cropResult:{coordinates:null,image:null},lastZoomValue:0,zoomValue:0}},components:{Cropper:D,Preview:P,CheckPasswordComplexity:B},async created(){this.userDetailsStore.role=="instructor"?this.instructorId=this.userDetailsStore.userId:(alert("Only instructors can access this page."),this.$router.push("/")),this.skillsStore.skillsList.length<1&&await this.skillsStore.getSkillsList();for(let o=0;o<this.skillsStore.skillsList.length;o++)this.skillsStore.skillsList[o].parent==0&&this.firstLevelSkills.push(this.skillsStore.skillsList[o])},async mounted(){},methods:{ValidateForm(){this.user.username==""||this.user.username==null?this.validate.username=!0:this.user.email==""||this.user.email==null?this.validate.email=!0:this.validate.passwordComplex&&this.Submit()},ValidateEmail(){if(this.validate.email=!this.user.email,this.user.email){const o=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;this.validate.emailFormat=!o.test(this.user.email)}else this.validate.emailFormat=!1},async Submit(){try{const s=await(await fetch("/users/add",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:this.user.username,email:this.user.email,avatar:this.user.avatar,password:this.user.password,role:this.user.role})})).json();if(s.username==="username already taken"||s.email==="email already taken"){alert(s.account);return}alert("account created"),this.usersStore.getUsers(),this.$router.push({name:"users"}),this.isValidated=!0,this.newUserId=s.id,this.isValidated&&this.firstLevelSkills.forEach(d=>this.userSkillsStore.MakeMastered(this.newUserId,d)),await fetch("/users/add/instructor",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({instructor_id:this.instructorId,student_id:this.newUserId})}),await this.instructorStudentsStore.getInstructorStudentsList()}catch(o){console.error("Error creating user ",o)}},onFileChange(o){var s=o.target.files||o.dataTransfer.files;s.length&&this.createImage(s[0])},createImage(o){var s=new Image,d=new FileReader,h=this;d.onload=t=>{h.image=t.target.result,this.image=t.target.result,s.src=t.target.result,this.user.avatar=this.image},s.onload=()=>{s.width/s.height!==1?(this.validate.notSquareImg=!0,this.showCropModal=!0):this.validate.notSquareImg=!1},d.readAsDataURL(o)},removeImage:function(o){this.image="",this.user.avatar=this.image},cropImageChange({coordinates:o,canvas:s,image:d}){this.cropResult={coordinates:o,image:d},this.cropCanvas=s.toDataURL()},handleCropImage(){var o=new Image;o.src=this.cropCanvas,this.user.avatar=this.cropCanvas,this.image=this.cropCanvas,this.showCropModal=!1,this.validate.notSquareImg=!1,this.validate.notCropped=!1},handleCancelCrop(){this.validate.notSquareImg?(this.validate.notCropped=!0,setTimeout(()=>{this.validate.notCropped=!1},2e3)):(this.showCropModal=!1,this.validate.notCropped=!1)},stencilSize({boundaries:o}){return{width:Math.min(o.height,o.width)-48,height:Math.min(o.height,o.width)-48}},handlePhoneCropper(){if(window.innerWidth<940){const{visibleArea:o,image:s}=this.$refs.cropper.getResult();this.zoomValue=o.height/s.height,this.lastZoomValue=this.zoomValue,this.$refs.cropper.zoom(this.zoomValue)}},cropperZoomIn(){this.$refs.cropper.visibleArea.height>30&&this.$refs.cropper.zoom(2)},cropperZoomOut(){this.$refs.cropper.visibleArea.height<3e3&&this.$refs.cropper.zoom(.5)}}},r=o=>(V("data-v-a6d5cc48"),o=o(),M(),o),U={class:"container rounded bg-light p-3"},F=r(()=>e("h1",{class:"heading"},"Add Student",-1)),q={class:"main-content-container container-fluid p-4"},Z={class:"row"},j={class:"col-lg-4"},E={class:"mb-3 row"},O=r(()=>e("h2",{class:"secondary-heading h4"},"Avatar",-1)),T={key:0},N=r(()=>e("label",{class:"btn green-btn",for:"choose-avatar"},[p("Add   "),e("svg",{width:"14",height:"14",viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg"},[e("path",{d:"M6.34811 20.0423L6.34811 13.6494L-0.0358702 13.6583C-0.320945 13.6579 -0.594203 13.5444 -0.795782 13.3428C-0.997361 13.1412 -1.11082 12.868 -1.11132 12.5829L-1.11729 7.41477C-1.1168 7.1297 -1.00334 6.85644 -0.801757 6.65486C-0.600179 6.45328 -0.326921 6.33982 -0.0418461 6.33933L6.3481 6.34231L6.3481 -0.0506238C6.34659 -0.193451 6.3736 -0.335145 6.42756 -0.467396C6.48152 -0.599646 6.56134 -0.719794 6.66234 -0.820794C6.76334 -0.921794 6.88349 -1.00161 7.01574 -1.05557C7.14799 -1.10953 7.28969 -1.13655 7.43251 -1.13503L12.5827 -1.12308C12.8678 -1.12259 13.141 -1.00913 13.3426 -0.807549C13.5442 -0.60597 13.6577 -0.332713 13.6582 -0.047637L13.6552 6.34231L20.0481 6.34231C20.3325 6.34248 20.6052 6.45552 20.8063 6.65661C21.0074 6.8577 21.1204 7.13039 21.1206 7.41477L21.1325 12.565C21.1324 12.8494 21.0193 13.122 20.8182 13.3231C20.6171 13.5242 20.3444 13.6373 20.0601 13.6374L13.6552 13.6494L13.6641 20.0334C13.6636 20.3184 13.5502 20.5917 13.3486 20.7933C13.147 20.9948 12.8738 21.1083 12.5887 21.1088L7.43252 21.1267C7.28969 21.1282 7.148 21.1012 7.01575 21.0473C6.88349 20.9933 6.76335 20.9135 6.66235 20.8125C6.56135 20.7115 6.48153 20.5913 6.42757 20.4591C6.37361 20.3268 6.34659 20.1851 6.34811 20.0423Z",fill:"white"})])],-1)),J=r(()=>e("p",{style:{"font-size":"14px"}},[e("em",null,"Maximum file size 15mb")],-1)),W={key:1},Y=["src"],G={key:0,style:{"font-size":"14px"}},K=r(()=>e("em",{id:"warning-text"}," Your profile picture is not in 1:1 aspect ratio. Please be aware that it may not display correctly. It is recommended that you crop the image. ",-1)),Q=[K],X={class:"d-flex flex-row gap-2"},$=r(()=>e("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 448 512",fill:"white",width:"16",height:"16"},[e("path",{d:"M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"})],-1)),ee=r(()=>e("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",width:"18",height:"18",fill:"white"},[e("path",{d:"M448 109.3l54.6-54.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L402.7 64 160 64v64l178.7 0L128 338.7V32c0-17.7-14.3-32-32-32S64 14.3 64 32V64H32C14.3 64 0 78.3 0 96s14.3 32 32 32H64V384c0 35.3 28.7 64 64 64H352V384H173.3L384 173.3 384 480c0 17.7 14.3 32 32 32s32-14.3 32-32V448h32c17.7 0 32-14.3 32-32s-14.3-32-32-32H448l0-274.7z"})],-1)),se={class:"col-lg-4"},te={class:"mb-3"},oe=r(()=>e("h2",{class:"secondary-heading h4"},"Username",-1)),ie={key:0,class:"form-validate"},re={class:"mb-3"},ae=r(()=>e("h2",{class:"secondary-heading h4"},"Email address",-1)),le={key:0,class:"form-validate"},ne={key:1,class:"form-validate"},de={class:"mb-3"},ce=r(()=>e("h2",{class:"secondary-heading h4"},"Password",-1)),he={class:"password-div"},me=["type"],ue=["title"],pe=r(()=>e("path",{d:"M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"},null,-1)),ge=[pe],ve=r(()=>e("path",{d:"M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 97.7 269.5 80 320 80c65.2 0 118.8 29.6 159.9 67.7C518.4 183.5 545 226 558.6 256c-12.6 28-36.6 66.8-70.9 100.9l-53.8-42.2c9.1-17.6 14.2-37.5 14.2-58.7c0-70.7-57.3-128-128-128c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1zM394.9 284.2l-81.5-63.9c4.2-8.5 6.6-18.2 6.6-28.3c0-5.5-.7-10.9-2-16c.7 0 1.3 0 2 0c44.2 0 80 35.8 80 80c0 9.9-1.8 19.4-5.1 28.2zm51.3 163.3l-41.9-33C378.8 425.4 350.7 432 320 432c-65.2 0-118.8-29.6-159.9-67.7C121.6 328.5 95 286 81.4 256c8.3-18.4 21.5-41.5 39.4-64.8L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5zm-88-69.3L302 334c-23.5-5.4-43.1-21.2-53.7-42.3l-56.1-44.2c-.2 2.8-.3 5.6-.3 8.5c0 70.7 57.3 128 128 128c13.3 0 26.1-2 38.2-5.8z"},null,-1)),we=[ve],_e={key:0,class:"form-validate"},fe={class:"d-flex justify-content-end gap-4"},Ce={key:0},ye={id:"myModal",class:"modal"},Se={class:"modal-content d-flex flex-column"},be={id:"crop-component",ref:"cropComponent"},ke={id:"crop-result"},xe=r(()=>e("div",{class:"form-label"},"Result:",-1)),Le={id:"zoom-range"},ze=r(()=>e("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",width:"20",height:"20",fill:"gray"},[e("path",{d:"M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM136 184c-13.3 0-24 10.7-24 24s10.7 24 24 24H280c13.3 0 24-10.7 24-24s-10.7-24-24-24H136z"})],-1)),Ie=[ze],Ve=r(()=>e("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",width:"20",height:"20",fill:"gray"},[e("path",{d:"M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM184 296c0 13.3 10.7 24 24 24s24-10.7 24-24V232h64c13.3 0 24-10.7 24-24s-10.7-24-24-24H232V120c0-13.3-10.7-24-24-24s-24 10.7-24 24v64H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h64v64z"})],-1)),Me=[Ve],He={class:"d-flex flex-row justify-content-center mt-2"},Be={class:"d-flex flex-row justify-content-between justify-content-lg-end gap-2 mt-5 pb-2 pb-lg-0"},Ae=r(()=>e("span",{class:"d-none d-lg-block"}," Cancel   ",-1)),De=r(()=>e("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",fill:"white",width:"16",height:"16"},[e("path",{d:"M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"})],-1)),Pe=[Ae,De],Re=r(()=>e("span",{class:"d-none d-lg-block"}," Crop   ",-1)),Ue=r(()=>e("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",fill:"white",width:"16",height:"16"},[e("path",{d:"M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"})],-1)),Fe=[Re,Ue];function qe(o,s,d,h,t,a){const g=m("CheckPasswordComplexity"),f=m("router-link"),C=m("cropper"),y=m("preview");return l(),n("div",U,[F,e("div",q,[e("div",Z,[e("div",j,[e("div",E,[O,t.image?(l(),n("div",W,[e("p",null,[e("img",{src:t.image,height:"300",width:"300",style:{"background-color":"lightgrey"}},null,8,Y)]),t.validate.notSquareImg?(l(),n("p",G,Q)):c("",!0),e("div",X,[e("button",{class:"btn red-btn",onClick:s[1]||(s[1]=(...i)=>a.removeImage&&a.removeImage(...i))},[p(" Remove   "),$]),e("button",{class:"btn green-btn",onClick:s[2]||(s[2]=i=>t.showCropModal=!0)},[p(" Crop   "),ee])])])):(l(),n("div",T,[e("input",{id:"choose-avatar",type:"file",accept:"image/*",onChange:s[0]||(s[0]=(...i)=>a.onFileChange&&a.onFileChange(...i)),hidden:""},null,32),N,J]))])]),e("div",se,[e("div",te,[oe,v(e("input",{"onUpdate:modelValue":s[3]||(s[3]=i=>t.user.username=i),type:"text",class:"form-control",onBlur:s[4]||(s[4]=i=>t.validate.username=!t.user.username)},null,544),[[w,t.user.username]]),t.validate.username&&(t.user.username==""||t.user.username==null)?(l(),n("div",ie," Please enter a username! ")):c("",!0)]),e("div",re,[ae,v(e("input",{"onUpdate:modelValue":s[5]||(s[5]=i=>t.user.email=i),type:"email",class:"form-control",onBlur:s[6]||(s[6]=(...i)=>a.ValidateEmail&&a.ValidateEmail(...i))},null,544),[[w,t.user.email]]),t.validate.email&&(t.user.email==""||t.user.email==null)?(l(),n("div",le," please enter an email address! ")):c("",!0),t.validate.emailFormat?(l(),n("div",ne," please enter a valid email address! ")):c("",!0)]),e("div",de,[ce,e("div",he,[v(e("input",{"onUpdate:modelValue":s[7]||(s[7]=i=>t.user.password=i),type:t.passwordVisible?"text":"password",placeholder:"Password",class:"form-control",id:"password-input",required:""},null,8,me),[[L,t.user.password]]),e("div",{class:"eye-icon","b-tooltip.hover":"",title:t.passwordVisible?"hide password":"show password"},[t.passwordVisible?(l(),n("svg",{key:0,xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 576 512",width:"20",height:"20",fill:"gray",onClick:s[8]||(s[8]=i=>t.passwordVisible=!1)},ge)):(l(),n("svg",{key:1,xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 640 512",width:"20",height:"20",fill:"gray",onClick:s[9]||(s[9]=i=>t.passwordVisible=!0)},we))],8,ue)]),t.validate.password&&(t.user.password==""||t.user.password==null)?(l(),n("div",_e," please enter a password! ")):c("",!0),u(g,{formData:t.user},null,8,["formData"])]),e("div",fe,[u(f,{class:"btn red-btn",to:"/users"},{default:z(()=>[p(" Cancel ")]),_:1}),e("button",{class:"btn primary-btn",onClick:s[10]||(s[10]=i=>a.ValidateForm())}," Submit ")])])])]),t.showCropModal?(l(),n("div",Ce,[e("div",ye,[e("div",Se,[e("div",be,[u(C,{src:t.image,onChange:a.cropImageChange,onReady:a.handlePhoneCropper,"stencil-props":{movable:!0,resizable:!0,aspectRatio:1},"image-restriction":"stencil",class:"cropper",ref:"cropper",debounce:!1},null,8,["src","onChange","onReady"]),e("div",ke,[xe,u(y,{width:120,height:120,image:t.cropResult.image,coordinates:t.cropResult.coordinates},null,8,["image","coordinates"])])],512),e("div",Le,[e("span",{class:"mt-1 me-1 zoom-icon",onClick:s[11]||(s[11]=(...i)=>a.cropperZoomOut&&a.cropperZoomOut(...i))},Ie),e("span",{class:"mt-1 ms-1 zoom-icon",onClick:s[12]||(s[12]=(...i)=>a.cropperZoomIn&&a.cropperZoomIn(...i))},Me)]),e("div",He,[t.validate.notCropped?(l(),n("div",{key:0,id:"warning-line",class:I({shake:t.validate.notCropped})}," Please crop your image to square aspect ratio ",2)):c("",!0)]),e("div",Be,[e("button",{class:"btn red-btn",onClick:s[13]||(s[13]=(...i)=>a.handleCancelCrop&&a.handleCancelCrop(...i))},Pe),e("button",{class:"btn green-btn",onClick:s[14]||(s[14]=(...i)=>a.handleCropImage&&a.handleCropImage(...i))},Fe)])])])])):c("",!0)])}const Ze=_(R,[["render",qe],["__scopeId","data-v-a6d5cc48"]]),je={components:{AddStudent:Ze}};function Ee(o,s,d,h,t,a){const g=m("AddStudent");return l(),H(g)}const We=_(je,[["render",Ee]]);export{We as default};