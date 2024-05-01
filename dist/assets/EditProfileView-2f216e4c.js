import{_ as b,g as N,i as g,o as r,c as n,d as e,e as c,v as m,b as d,a as u,w as x,m as v,F as _,p as y,f as L,s as f,E as k}from"./main-44dd4d9e.js";import{f as V}from"./style-1a7a2847.js";const S={setup(){const a=N();return{...a},{userDetailsStore:a}},data(){return{id:this.userDetailsStore.userId,userName:this.userDetailsStore.userName,avatar:this.userDetailsStore.avatar,email:this.userDetailsStore.email,password:this.userDetailsStore.password,image:"",firstName:this.userDetailsStore.firstName,lastName:this.userDetailsStore.lastName,validate:{firstName:!1,lastName:!1,email:!1,emailFormat:!1,password:!1},showCropModal:!1,cropCanvas:""}},components:{Cropper:V},computed:{},methods:{ValidateForm(){this.firstName==""||this.firstName==null?this.validate.firstName=!0:this.lastName==""||this.lastName==null?this.validate.lastName=!0:this.userName==""||this.userName==null?this.validate.username=!0:this.email==""||this.email==null?this.validate.email=!0:this.Submit()},ValidateEmail(){/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.email)?this.validate.emailFormat=!1:this.validate.emailFormat=!0},Submit(){const a={method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({firstName:this.firstName,lastName:this.lastName,username:this.userName,email:this.email,avatar:this.avatar,password:this.password})};var t="/users/profile/"+this.id+"/edit";fetch(t,a).then(()=>{this.userDetailsStore.getUserDetails(),this.$router.push("/profile-settings")})},onFileChange(a){this.image="",this.avatar=this.image;var t=a.target.files||a.dataTransfer.files;t.length&&this.createImage(t[0])},createImage(a){new Image;var t=new FileReader,h=this;t.onload=p=>{h.image=p.target.result,this.image=p.target.result,this.avatar=this.image},t.readAsDataURL(a)},removeImage:function(a){this.image="",this.avatar=this.image},openImage(){document.getElementById("image-input").click()},cropImageChange({coordinates:a,canvas:t}){this.cropCanvas=t.toDataURL()},handleCropImage(){this.avatar=this.cropCanvas,this.image=this.cropCanvas,this.showCropModal=!1}}},l=a=>(y("data-v-753347c0"),a=a(),L(),a),D={class:"container mt-3"},I=l(()=>e("h1",{id:"page-tile",class:"my-3 ms-0 ms-md-3 ms-lg-0 mt-5"}," Edit Profile ",-1)),M={class:"row mt-4"},z={class:"col-12 col-lg-5"},F={class:"row mx-0 px-md-0"},B={class:"d-flex justify-content-center justify-content-md-start ps-lg-0"},E={class:"position-relative",style:{width:"fit-content"}},U=f('<svg class="" width="53" height="53" viewBox="0 0 53 53" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-753347c0><circle cx="26.5" cy="26.5" r="26.5" fill="#D9D9D9" data-v-753347c0></circle><g clip-path="url(#clip0_372_11959)" data-v-753347c0><path d="M19.7439 45.0784L19.7439 33.2515L7.93354 33.268C7.40615 33.2671 6.90063 33.0572 6.52771 32.6843C6.15479 32.3114 5.94488 31.8059 5.94396 31.2785L5.93291 21.7174C5.93382 21.1901 6.14373 20.6845 6.51665 20.3116C6.88957 19.9387 7.3951 19.7288 7.92249 19.7279L19.7439 19.7334L19.7439 7.90646C19.7411 7.64223 19.7911 7.38009 19.8909 7.13543C19.9907 6.89076 20.1384 6.66849 20.3252 6.48164C20.5121 6.29479 20.7344 6.14713 20.979 6.0473C21.2237 5.94747 21.4858 5.8975 21.75 5.9003L31.2779 5.92241C31.8053 5.92332 32.3108 6.13322 32.6838 6.50615C33.0567 6.87907 33.2666 7.38459 33.2675 7.91198L33.262 19.7334L45.0889 19.7334C45.615 19.7337 46.1195 19.9428 46.4915 20.3148C46.8635 20.6869 47.0726 21.1913 47.073 21.7174L47.0951 31.2453C47.0948 31.7714 46.8856 32.2759 46.5136 32.6479C46.1416 33.0199 45.6371 33.229 45.111 33.2294L33.262 33.2515L33.2786 45.0618C33.2776 45.5892 33.0677 46.0947 32.6948 46.4677C32.3219 46.8406 31.8164 47.0505 31.289 47.0514L21.7501 47.0846C21.4858 47.0874 21.2237 47.0374 20.979 46.9376C20.7344 46.8377 20.5121 46.6901 20.3252 46.5032C20.1384 46.3164 19.9907 46.0941 19.8909 45.8494C19.7911 45.6048 19.7411 45.3426 19.7439 45.0784Z" fill="white" data-v-753347c0></path></g><defs data-v-753347c0><clipPath id="clip0_372_11959" data-v-753347c0><rect width="37" height="37" fill="white" transform="translate(8 8)" data-v-753347c0></rect></clipPath></defs></svg>',1),H=[U],P=f('<svg class="" width="43" height="43" viewBox="0 0 53 53" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-753347c0><circle cx="26.5" cy="26.5" r="26.5" fill="#D9D9D9" data-v-753347c0></circle><g clip-path="url(#clip0_372_11959)" data-v-753347c0><path d="M19.7439 45.0784L19.7439 33.2515L7.93354 33.268C7.40615 33.2671 6.90063 33.0572 6.52771 32.6843C6.15479 32.3114 5.94488 31.8059 5.94396 31.2785L5.93291 21.7174C5.93382 21.1901 6.14373 20.6845 6.51665 20.3116C6.88957 19.9387 7.3951 19.7288 7.92249 19.7279L19.7439 19.7334L19.7439 7.90646C19.7411 7.64223 19.7911 7.38009 19.8909 7.13543C19.9907 6.89076 20.1384 6.66849 20.3252 6.48164C20.5121 6.29479 20.7344 6.14713 20.979 6.0473C21.2237 5.94747 21.4858 5.8975 21.75 5.9003L31.2779 5.92241C31.8053 5.92332 32.3108 6.13322 32.6838 6.50615C33.0567 6.87907 33.2666 7.38459 33.2675 7.91198L33.262 19.7334L45.0889 19.7334C45.615 19.7337 46.1195 19.9428 46.4915 20.3148C46.8635 20.6869 47.0726 21.1913 47.073 21.7174L47.0951 31.2453C47.0948 31.7714 46.8856 32.2759 46.5136 32.6479C46.1416 33.0199 45.6371 33.229 45.111 33.2294L33.262 33.2515L33.2786 45.0618C33.2776 45.5892 33.0677 46.0947 32.6948 46.4677C32.3219 46.8406 31.8164 47.0505 31.289 47.0514L21.7501 47.0846C21.4858 47.0874 21.2237 47.0374 20.979 46.9376C20.7344 46.8377 20.5121 46.6901 20.3252 46.5032C20.1384 46.3164 19.9907 46.0941 19.8909 45.8494C19.7911 45.6048 19.7411 45.3426 19.7439 45.0784Z" fill="white" data-v-753347c0></path></g><defs data-v-753347c0><clipPath id="clip0_372_11959" data-v-753347c0><rect width="37" height="37" fill="white" transform="translate(8 8)" data-v-753347c0></rect></clipPath></defs></svg>',1),j=[P],R=l(()=>e("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",width:"35",height:"35",fill:"white"},[e("path",{d:"M128 32c0-17.7-14.3-32-32-32S64 14.3 64 32V64H32C14.3 64 0 78.3 0 96s14.3 32 32 32H64V384c0 35.3 28.7 64 64 64H352V384H128V32zM384 480c0 17.7 14.3 32 32 32s32-14.3 32-32V448h32c17.7 0 32-14.3 32-32s-14.3-32-32-32H448l0-256c0-35.3-28.7-64-64-64L160 64v64l224 0 0 352z"})],-1)),T=[R],A=l(()=>e("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",width:"28",height:"28",fill:"white"},[e("path",{d:"M128 32c0-17.7-14.3-32-32-32S64 14.3 64 32V64H32C14.3 64 0 78.3 0 96s14.3 32 32 32H64V384c0 35.3 28.7 64 64 64H352V384H128V32zM384 480c0 17.7 14.3 32 32 32s32-14.3 32-32V448h32c17.7 0 32-14.3 32-32s-14.3-32-32-32H448l0-256c0-35.3-28.7-64-64-64L160 64v64l224 0 0 352z"})],-1)),O=[A],Z=["src"],q=["src"],J={class:"col-12 px-4 px-md-0 col-lg-4 px-0 px-md-4 px-lg-0"},G={class:"d-flex gap-4"},K={class:"mb-3"},Q=l(()=>e("label",{for:"name",class:"form-label"},"First Name",-1)),W={key:0,class:"form-validate"},X={class:"mb-3"},Y=l(()=>e("label",{for:"name",class:"form-label"},"Last Name",-1)),$={key:0,class:"form-validate"},ee={class:"mb-3"},te=l(()=>e("label",{class:"form-label"},"Username",-1)),se={key:0,class:"form-validate"},ie={class:"mb-3"},ae=l(()=>e("label",{class:"form-label"},"Email",-1)),le={key:0,class:"form-validate"},oe={key:1,class:"form-validate"},re={class:"mb-3"},ne=l(()=>e("label",{class:"form-label"},"Password",-1)),de={key:0,class:"form-validate"},ce={class:"d-flex justify-content-between mb-3 mt-5"},me={class:"mb-3 row"},he={class:"d-none"},pe=l(()=>e("p",{style:{"font-size":"14px"}},[e("em",null,"Maximum file size 15mb")],-1)),ve={key:0},ue={id:"myModal",class:"modal"},ge={class:"modal-content d-flex flex-column"},_e={id:"crop-component"},fe={id:"crop-result"},we=l(()=>e("div",{class:"form-label"},"Result:",-1)),Ce=["src"],be={class:"d-flex flex-row-reverse gap-2 mt-5"},Ne=l(()=>e("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",fill:"white",width:"16",height:"16"},[e("path",{d:"M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"})],-1)),xe=l(()=>e("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",fill:"white",width:"16",height:"16"},[e("path",{d:"M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"})],-1));function ye(a,t,h,p,s,o){const w=g("router-link"),C=g("cropper");return r(),n(_,null,[e("div",D,[I,e("div",M,[e("div",z,[e("div",F,[e("div",B,[e("div",E,[e("div",{id:"plus-svg",onClick:t[0]||(t[0]=i=>o.openImage()),class:"d-none d-lg-block","b-tooltip.hover":"",title:"add another image"},H),e("div",{id:"plus-svg",onClick:t[1]||(t[1]=i=>o.openImage()),class:"d-lg-none","b-tooltip.hover":"",title:"add another image"},j),e("div",{id:"crop-icon","b-tooltip.hover":"",title:"crop image",class:"d-none d-lg-block",onClick:t[2]||(t[2]=i=>s.showCropModal=!0)},T),e("div",{id:"crop-icon","b-tooltip.hover":"",title:"crop image",class:"d-lg-none",onClick:t[3]||(t[3]=i=>s.showCropModal=!0)},O),e("img",{id:"img-background",src:s.avatar,height:"428",width:"428",style:{"background-color":"lightgrey"},class:"d-none d-lg-block"},null,8,Z),e("img",{id:"img-background",src:s.avatar,height:"240",width:"240",style:{"background-color":"lightgrey"},class:"d-lg-none"},null,8,q)])])])]),e("div",J,[e("div",G,[e("div",K,[Q,c(e("input",{id:"name","onUpdate:modelValue":t[4]||(t[4]=i=>s.firstName=i),type:"text",class:"form-control"},null,512),[[m,s.firstName]]),s.validate.firstName&&(s.firstName==""||s.firstName==null)?(r(),n("div",W," please enter a first name ! ")):d("",!0)]),e("div",X,[Y,c(e("input",{id:"name","onUpdate:modelValue":t[5]||(t[5]=i=>s.lastName=i),type:"text",class:"form-control"},null,512),[[m,s.lastName]]),s.validate.lastName&&(s.lastName==""||s.lastName==null)?(r(),n("div",$," please enter a last name ! ")):d("",!0)])]),e("div",ee,[te,c(e("input",{"onUpdate:modelValue":t[6]||(t[6]=i=>s.userName=i),type:"text",class:"form-control"},null,512),[[m,s.userName]]),s.validate.userName&&(s.userName==""||s.userName==null)?(r(),n("div",se," please enter a user name ! ")):d("",!0)]),e("div",ie,[ae,c(e("input",{"onUpdate:modelValue":t[7]||(t[7]=i=>s.email=i),type:"email",class:"form-control",onBlur:t[8]||(t[8]=(...i)=>o.ValidateEmail&&o.ValidateEmail(...i))},null,544),[[m,s.email]]),s.validate.email&&(s.email==""||s.email==null)?(r(),n("div",le," please enter an email ! ")):d("",!0),s.validate.emailFormat?(r(),n("div",oe," please enter a valid email ! ")):d("",!0)]),e("div",re,[ne,c(e("input",{"onUpdate:modelValue":t[9]||(t[9]=i=>s.password=i),type:"text",class:"form-control"},null,512),[[m,s.password]]),s.validate.password&&(s.password==""||s.password==null)?(r(),n("div",de," please enter a password ! ")):d("",!0)]),e("div",ce,[u(w,{class:"btn red-btn",to:"/profile-settings"},{default:x(()=>[v(" Cancel ")]),_:1}),e("button",{class:"btn purple-btn",onClick:t[10]||(t[10]=i=>o.ValidateForm())}," Submit ")])])]),e("div",me,[e("div",he,[e("input",{id:"image-input",class:"form-control",type:"file",accept:"image/*",onChange:t[11]||(t[11]=(...i)=>o.onFileChange&&o.onFileChange(...i))},null,32),pe])])]),s.showCropModal?(r(),n("div",ve,[e("div",ue,[e("div",ge,[e("div",_e,[u(C,{src:s.avatar,onChange:o.cropImageChange,"stencil-props":{handlers:{},movable:!1,resizable:!1,aspectRatio:1},"resize-image":{adjustStencil:!1},"image-restriction":"stencil",class:"cropper"},null,8,["src","onChange"]),e("div",fe,[we,e("img",{src:s.cropCanvas,alt:"preview Image",width:"100",height:"100"},null,8,Ce)])]),e("div",be,[e("button",{class:"btn red-btn",onClick:t[12]||(t[12]=i=>s.showCropModal=!1)},[v(" Cancel   "),Ne]),e("button",{class:"btn green-btn",onClick:t[13]||(t[13]=(...i)=>o.handleCropImage&&o.handleCropImage(...i))},[v(" Crop   "),xe])])])])])):d("",!0)],64)}const Le=b(S,[["render",ye],["__scopeId","data-v-753347c0"]]),ke=e("div",{id:"banner"},[e("img",{src:k,class:"image-fluid"})],-1),De={__name:"EditProfileView",setup(a){return(t,h)=>(r(),n(_,null,[ke,u(Le)],64))}};export{De as default};