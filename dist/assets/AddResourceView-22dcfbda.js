import{_ as d,a as l,o as n,c,d as o,i as u}from"./main-9332bef9.js";const m={data(){return{skillId:this.$route.params.id}},setup(){return{userDetailsStore:l()}},mounted:function(){let e=window.innerHeight-100;window.innerWidth<481?e=e-310:window.innerWidth>=481&&window.innerWidth<1024?e=e-300:e=e-450,$("#summernote").summernote({placeholder:"Share a link to a video, website or any other useful info on learning this skill.",height:e,tabsize:2,toolbar:[["style",["style"]],["font",["bold","underline","clear"]],["color",["color"]],["para",["ul","ol","paragraph"]],["table",["table"]],["insert",["link","picture","video"]],["view",["fullscreen","codeview","help"]]],maximumImageFileSize:2048*1024,callbacks:{onImageUploadError:function(t){alert("Max image size is 2MB.")}}}),$(".note-editor .note-editable").css("background-color","#ffffff")},methods:{Submit(){var e="/resources/add/"+this.skillId,t=$("#summernote").summernote("code");const r={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:this.userDetailsStore.userId,editordata:t})};fetch(e,r).then(function(s){return s.json()}).then(s=>{s=="blocked"&&alert("Unfortunately, that source cannot be added.")}).then(()=>{this.$router.back()})}}},f={class:"container p-2 bg-light rounded"},h={class:"d-flex flex-column"},b=o("div",{class:"mb-3 mt-3 text-area-div"},[o("textarea",{id:"summernote",name:"editordata"})],-1),p={"b-on-hover":"",title:"add this resource to it associated skill",class:"d-flex justify-content-end"};function _(e,t,r,s,g,i){return n(),c("div",f,[o("div",h,[b,o("div",p,[o("button",{class:"btn red-btn me-2",onClick:t[0]||(t[0]=a=>e.$router.go(-1))}," Cancel "),o("button",{class:"btn primary-btn",onClick:t[1]||(t[1]=a=>i.Submit())}," Submit ")])])])}const k=d(m,[["render",_]]),w={__name:"AddResourceView",setup(e){return(t,r)=>(n(),u(k))}};export{w as default};