import{_ as c,m as _,n as h,o as m,c as p,d as s,t as a,e as r,v as l,p as b,f}from"./main-6190ec87.js";import{u as w}from"./StudentMCQuestionsStore-55684000.js";import{u as S}from"./UsersStore-636f6f88.js";import{_ as q}from"./general-banner-1c13aca4.js";const k={setup(){const t=w(),e=S(),u=_();return{studentMCQuestionsStore:t,usersStore:e,skillsStore:u}},data(){return{studentQuestionId:this.$route.params.id,question:{name:"",question:"",correct_answer:"",incorrect_answer_1:"",incorrect_answer_2:"",incorrect_answer_3:"",incorrect_answer_4:"",question:"",explanation:"",skill_id:""},isEditMode:!1,studentName:null,skillName:null}},async created(){await this.studentMCQuestionsStore.getStudentMCQuestions();for(let t=0;t<this.studentMCQuestionsStore.studentMCQuestions.length;t++)this.studentMCQuestionsStore.studentMCQuestions[t].id==this.studentQuestionId&&(this.question=this.studentMCQuestionsStore.studentMCQuestions[t]);await this.usersStore.getUsers();for(let t=0;t<this.usersStore.users.length;t++)this.question.student_id==this.usersStore.users[t].id&&(this.studentName=this.usersStore.users[t].username);this.skillsStore.skillsList.length==0&&await this.skillsStore.getSkillsList();for(let t=0;t<this.skillsStore.skillsList.length;t++)this.question.skill_id==this.skillsStore.skillsList[t].id&&(this.skillName=this.skillsStore.skillsList[t].name)},methods:{deleteStudentQuestion(){confirm("Delete this question?")&&(this.studentMCQuestionsStore.deleteStudentMCQuestion(this.studentQuestionId),h.push({name:"hub"}))},saveToQuestionBank(){const t={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:"User: "+this.question.student_id,question:this.question.question,correct_answer:this.question.correct_answer,incorrect_answer_1:this.question.incorrect_answer_1,incorrect_answer_2:this.question.incorrect_answer_2,incorrect_answer_3:this.question.incorrect_answer_3,incorrect_answer_4:this.question.incorrect_answer_4,explanation:this.question.explanation,skill_id:this.question.skill_id})};var e="/questions/mc-questions/add";fetch(e,t).then(()=>{this.deleteStudentQuestion()})},editMode(){this.isEditMode=!0}}},n=t=>(b("data-v-f2b09a90"),t=t(),f(),t),v={id:"banner"},M=n(()=>s("img",{src:q,class:"img-fluid"},null,-1)),Q={class:"container mt-3 pb-3"},x={class:"row"},C={class:"col-10"},g={id:"header-tile"},y={id:"header-tile"},E={class:"main-content-container container-fluid mt-4"},U={class:"row p-0"},V={id:"form-container",class:"col p-4"},N={class:"mb-3"},I=n(()=>s("label",{for:"last_name",class:"form-label"},"Question",-1)),B=["disabled"],L={class:"mb-3"},T=n(()=>s("label",{class:"form-label"},"Correct answer",-1)),D=["disabled"],W={class:"mb-3"},O=n(()=>s("label",{class:"form-label"},"Wrong answer 1",-1)),j=["disabled"],J={class:"mb-3"},P=n(()=>s("label",{class:"form-label"},"Wrong answer 2",-1)),z=["disabled"],A={class:"mb-3"},F=n(()=>s("label",{class:"form-label"},"Wrong answer 3",-1)),G=["disabled"],H={class:"mb-3"},K=n(()=>s("label",{class:"form-label"},"Wrong answer 4",-1)),R=["disabled"],X={class:"mb-3"},Y=n(()=>s("label",{class:"form-label"},"Explanation",-1)),Z=["disabled"],$={class:"d-flex justify-content-end gap-4"};function ss(t,e,u,es,o,d){return m(),p("div",v,[M,s("div",Q,[s("div",x,[s("div",C,[s("h2",g,"Student: "+a(o.studentName),1),s("h2",y,"Skill: "+a(o.skillName),1)])]),s("div",E,[s("div",U,[s("div",V,[s("div",N,[I,r(s("textarea",{disabled:!o.isEditMode,"onUpdate:modelValue":e[0]||(e[0]=i=>o.question.question=i),rows:"1",class:"form-control"},`\r
                            `,8,B),[[l,o.question.question]])]),s("div",L,[T,r(s("input",{disabled:!o.isEditMode,"onUpdate:modelValue":e[1]||(e[1]=i=>o.question.correct_answer=i),type:"text",class:"form-control"},null,8,D),[[l,o.question.correct_answer]])]),s("div",W,[O,r(s("input",{disabled:!o.isEditMode,"onUpdate:modelValue":e[2]||(e[2]=i=>o.question.incorrect_answer_1=i),type:"text",class:"form-control"},null,8,j),[[l,o.question.incorrect_answer_1]])]),s("div",J,[P,r(s("input",{disabled:!o.isEditMode,"onUpdate:modelValue":e[3]||(e[3]=i=>o.question.incorrect_answer_2=i),type:"text",class:"form-control"},null,8,z),[[l,o.question.incorrect_answer_2]])]),s("div",A,[F,r(s("input",{disabled:!o.isEditMode,"onUpdate:modelValue":e[4]||(e[4]=i=>o.question.incorrect_answer_3=i),type:"text",class:"form-control"},null,8,G),[[l,o.question.incorrect_answer_3]])]),s("div",H,[K,r(s("input",{disabled:!o.isEditMode,"onUpdate:modelValue":e[5]||(e[5]=i=>o.question.incorrect_answer_4=i),type:"text",class:"form-control"},null,8,R),[[l,o.question.incorrect_answer_4]])]),s("div",X,[Y,r(s("textarea",{disabled:!o.isEditMode,"onUpdate:modelValue":e[6]||(e[6]=i=>o.question.explanation=i),class:"form-control",rows:"3"},null,8,Z),[[l,o.question.explanation]])]),s("div",$,[s("a",{class:"btn red-btn",onClick:e[7]||(e[7]=i=>d.editMode())},"Edit"),s("a",{class:"btn red-btn",onClick:e[8]||(e[8]=i=>d.deleteStudentQuestion())},"Delete"),s("button",{class:"btn purple-btn",onClick:e[9]||(e[9]=i=>d.saveToQuestionBank())}," Save ")])])])])])])}const rs=c(k,[["render",ss],["__scopeId","data-v-f2b09a90"]]);export{rs as default};