import{_ as c,o as a,c as i,d as t,l as d}from"./main-674e8d78.js";const u={setup(){},data(){return{resourceId:this.$route.params.id}},async created(){const e=await(await fetch("/resources/show/"+this.resourceId)).json();$("#summernote").summernote({maximumImageFileSize:2048*1024,callbacks:{onImageUploadError:function(o){alert("Max image size is 2MB.")}}}).summernote("code",e.content)},methods:{Submit(){var s="/resources/edit/"+this.resourceId,e=$("#summernote").summernote("code");const o={method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({editordata:e})};fetch(s,o).then(()=>{let r=this.$route.query.dismissFlagId;r?fetch("/content-flags/"+r,{method:"DELETE"}).finally(()=>{this.$router.back()}):this.$router.back()})}}},m={class:"container mt-3"},l=t("h1",null,"Edit Learning Resource ",-1),_={class:"row"},h=t("div",{class:"mb-3"},[t("textarea",{id:"summernote",name:"editordata"})],-1);function p(s,e,o,r,b,n){return a(),i("div",m,[l,t("div",_,[h,t("button",{class:"btn btn-dark",onClick:e[0]||(e[0]=g=>n.Submit())},"Submit")])])}const f=c(u,[["render",p]]),E={__name:"EditResourceView",setup(s){return(e,o)=>(a(),d(f))}};export{E as default};