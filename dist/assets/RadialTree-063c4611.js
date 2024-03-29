import{_ as ht,u as ct,d as ut,r as dt,o as ft,c as mt,b as U,e as pt,F as gt,p as yt,a as xt}from"./main-501ff023.js";import{s as A,d as vt,i as ot,T as H,b as J,S as kt,t as tt,h as et,a as wt,e as it,c as St}from"./transform-e149c3b4.js";function _t(t){let i;for(;i=t.sourceEvent;)t=i;return t}function j(t,i){if(t=_t(t),i===void 0&&(i=t.currentTarget),i){var l=i.ownerSVGElement||i;if(l.createSVGPoint){var d=l.createSVGPoint();return d.x=t.clientX,d.y=t.clientY,d=d.matrixTransform(i.getScreenCTM().inverse()),[d.x,d.y]}if(i.getBoundingClientRect){var h=i.getBoundingClientRect();return[t.clientX-h.left-i.clientLeft,t.clientY-h.top-i.clientTop]}}return[t.pageX,t.pageY]}const Q={capture:!0,passive:!1};function Z(t){t.preventDefault(),t.stopImmediatePropagation()}function bt(t){var i=t.document.documentElement,l=A(t).on("dragstart.drag",Z,Q);"onselectstart"in i?l.on("selectstart.drag",Z,Q):(i.__noselect=i.style.MozUserSelect,i.style.MozUserSelect="none")}function Mt(t,i){var l=t.document.documentElement,d=A(t).on("dragstart.drag",null);i&&(d.on("click.drag",Z,Q),setTimeout(function(){d.on("click.drag",null)},0)),"onselectstart"in l?d.on("selectstart.drag",null):(l.style.MozUserSelect=l.__noselect,delete l.__noselect)}var Pt=1e-12;function nt(t){return((t=Math.exp(t))+1/t)/2}function zt(t){return((t=Math.exp(t))-1/t)/2}function Tt(t){return((t=Math.exp(2*t))-1)/(t+1)}const It=function t(i,l,d){function h(s,c){var m=s[0],o=s[1],y=s[2],v=c[0],z=c[1],w=c[2],M=v-m,P=z-o,_=M*M+P*P,b,u;if(_<Pt)u=Math.log(w/y)/i,b=function(N){return[m+N*M,o+N*P,y*Math.exp(i*N*u)]};else{var B=Math.sqrt(_),T=(w*w-y*y+d*_)/(2*y*l*B),V=(w*w-y*y-d*_)/(2*w*l*B),G=Math.log(Math.sqrt(T*T+1)-T),I=Math.log(Math.sqrt(V*V+1)-V);u=(I-G)/i,b=function(N){var $=N*u,q=nt(G),O=y/(l*B)*(q*Tt(i*$+G)-zt(G));return[m+O*M,o+O*P,y*q/nt(i*$+G)]}}return b.duration=u*1e3*i/Math.SQRT2,b}return h.rho=function(s){var c=Math.max(.001,+s),m=c*c,o=m*m;return t(c,m,o)},h}(Math.SQRT2,2,4),Y=t=>()=>t;function Ct(t,{sourceEvent:i,target:l,transform:d,dispatch:h}){Object.defineProperties(this,{type:{value:t,enumerable:!0,configurable:!0},sourceEvent:{value:i,enumerable:!0,configurable:!0},target:{value:l,enumerable:!0,configurable:!0},transform:{value:d,enumerable:!0,configurable:!0},_:{value:h}})}function K(t){t.stopImmediatePropagation()}function X(t){t.preventDefault(),t.stopImmediatePropagation()}function Et(t){return(!t.ctrlKey||t.type==="wheel")&&!t.button}function Bt(){var t=this;return t instanceof SVGElement?(t=t.ownerSVGElement||t,t.hasAttribute("viewBox")?(t=t.viewBox.baseVal,[[t.x,t.y],[t.x+t.width,t.y+t.height]]):[[0,0],[t.width.baseVal.value,t.height.baseVal.value]]):[[0,0],[t.clientWidth,t.clientHeight]]}function st(){return this.__zoom||ot}function Rt(t){return-t.deltaY*(t.deltaMode===1?.05:t.deltaMode?1:.002)*(t.ctrlKey?10:1)}function Dt(){return navigator.maxTouchPoints||"ontouchstart"in this}function Lt(t,i,l){var d=t.invertX(i[0][0])-l[0][0],h=t.invertX(i[1][0])-l[1][0],s=t.invertY(i[0][1])-l[0][1],c=t.invertY(i[1][1])-l[1][1];return t.translate(h>d?(d+h)/2:Math.min(0,d)||Math.max(0,h),c>s?(s+c)/2:Math.min(0,s)||Math.max(0,c))}function At(){var t=Et,i=Bt,l=Lt,d=Rt,h=Dt,s=[0,1/0],c=[[-1/0,-1/0],[1/0,1/0]],m=250,o=It,y=vt("start","zoom","end"),v,z,w,M=500,P=150,_=0,b=10;function u(e){e.property("__zoom",st).on("wheel.zoom",$,{passive:!1}).on("mousedown.zoom",q).on("dblclick.zoom",O).filter(h).on("touchstart.zoom",at).on("touchmove.zoom",lt).on("touchend.zoom touchcancel.zoom",rt).style("-webkit-tap-highlight-color","rgba(0,0,0,0)")}u.transform=function(e,a,n,r){var f=e.selection?e.selection():e;f.property("__zoom",st),e!==f?G(e,a,n,r):f.interrupt().each(function(){I(this,arguments).event(r).start().zoom(null,typeof a=="function"?a.apply(this,arguments):a).end()})},u.scaleBy=function(e,a,n,r){u.scaleTo(e,function(){var f=this.__zoom.k,p=typeof a=="function"?a.apply(this,arguments):a;return f*p},n,r)},u.scaleTo=function(e,a,n,r){u.transform(e,function(){var f=i.apply(this,arguments),p=this.__zoom,g=n==null?V(f):typeof n=="function"?n.apply(this,arguments):n,x=p.invert(g),k=typeof a=="function"?a.apply(this,arguments):a;return l(T(B(p,k),g,x),f,c)},n,r)},u.translateBy=function(e,a,n,r){u.transform(e,function(){return l(this.__zoom.translate(typeof a=="function"?a.apply(this,arguments):a,typeof n=="function"?n.apply(this,arguments):n),i.apply(this,arguments),c)},null,r)},u.translateTo=function(e,a,n,r,f){u.transform(e,function(){var p=i.apply(this,arguments),g=this.__zoom,x=r==null?V(p):typeof r=="function"?r.apply(this,arguments):r;return l(ot.translate(x[0],x[1]).scale(g.k).translate(typeof a=="function"?-a.apply(this,arguments):-a,typeof n=="function"?-n.apply(this,arguments):-n),p,c)},r,f)};function B(e,a){return a=Math.max(s[0],Math.min(s[1],a)),a===e.k?e:new H(a,e.x,e.y)}function T(e,a,n){var r=a[0]-n[0]*e.k,f=a[1]-n[1]*e.k;return r===e.x&&f===e.y?e:new H(e.k,r,f)}function V(e){return[(+e[0][0]+ +e[1][0])/2,(+e[0][1]+ +e[1][1])/2]}function G(e,a,n,r){e.on("start.zoom",function(){I(this,arguments).event(r).start()}).on("interrupt.zoom end.zoom",function(){I(this,arguments).event(r).end()}).tween("zoom",function(){var f=this,p=arguments,g=I(f,p).event(r),x=i.apply(f,p),k=n==null?V(x):typeof n=="function"?n.apply(f,p):n,R=Math.max(x[1][0]-x[0][0],x[1][1]-x[0][1]),S=f.__zoom,C=typeof a=="function"?a.apply(f,p):a,D=o(S.invert(k).concat(R/S.k),C.invert(k).concat(R/C.k));return function(E){if(E===1)E=C;else{var L=D(E),W=R/L[2];E=new H(W,k[0]-L[0]*W,k[1]-L[1]*W)}g.zoom(null,E)}})}function I(e,a,n){return!n&&e.__zooming||new N(e,a)}function N(e,a){this.that=e,this.args=a,this.active=0,this.sourceEvent=null,this.extent=i.apply(e,a),this.taps=0}N.prototype={event:function(e){return e&&(this.sourceEvent=e),this},start:function(){return++this.active===1&&(this.that.__zooming=this,this.emit("start")),this},zoom:function(e,a){return this.mouse&&e!=="mouse"&&(this.mouse[1]=a.invert(this.mouse[0])),this.touch0&&e!=="touch"&&(this.touch0[1]=a.invert(this.touch0[0])),this.touch1&&e!=="touch"&&(this.touch1[1]=a.invert(this.touch1[0])),this.that.__zoom=a,this.emit("zoom"),this},end:function(){return--this.active===0&&(delete this.that.__zooming,this.emit("end")),this},emit:function(e){var a=A(this.that).datum();y.call(e,this.that,new Ct(e,{sourceEvent:this.sourceEvent,target:u,type:e,transform:this.that.__zoom,dispatch:y}),a)}};function $(e,...a){if(!t.apply(this,arguments))return;var n=I(this,a).event(e),r=this.__zoom,f=Math.max(s[0],Math.min(s[1],r.k*Math.pow(2,d.apply(this,arguments)))),p=j(e);if(n.wheel)(n.mouse[0][0]!==p[0]||n.mouse[0][1]!==p[1])&&(n.mouse[1]=r.invert(n.mouse[0]=p)),clearTimeout(n.wheel);else{if(r.k===f)return;n.mouse=[p,r.invert(p)],J(this),n.start()}X(e),n.wheel=setTimeout(g,P),n.zoom("mouse",l(T(B(r,f),n.mouse[0],n.mouse[1]),n.extent,c));function g(){n.wheel=null,n.end()}}function q(e,...a){if(w||!t.apply(this,arguments))return;var n=e.currentTarget,r=I(this,a,!0).event(e),f=A(e.view).on("mousemove.zoom",k,!0).on("mouseup.zoom",R,!0),p=j(e,n),g=e.clientX,x=e.clientY;bt(e.view),K(e),r.mouse=[p,this.__zoom.invert(p)],J(this),r.start();function k(S){if(X(S),!r.moved){var C=S.clientX-g,D=S.clientY-x;r.moved=C*C+D*D>_}r.event(S).zoom("mouse",l(T(r.that.__zoom,r.mouse[0]=j(S,n),r.mouse[1]),r.extent,c))}function R(S){f.on("mousemove.zoom mouseup.zoom",null),Mt(S.view,r.moved),X(S),r.event(S).end()}}function O(e,...a){if(t.apply(this,arguments)){var n=this.__zoom,r=j(e.changedTouches?e.changedTouches[0]:e,this),f=n.invert(r),p=n.k*(e.shiftKey?.5:2),g=l(T(B(n,p),r,f),i.apply(this,a),c);X(e),m>0?A(this).transition().duration(m).call(G,g,r,e):A(this).call(u.transform,g,r,e)}}function at(e,...a){if(t.apply(this,arguments)){var n=e.touches,r=n.length,f=I(this,a,e.changedTouches.length===r).event(e),p,g,x,k;for(K(e),g=0;g<r;++g)x=n[g],k=j(x,this),k=[k,this.__zoom.invert(k),x.identifier],f.touch0?!f.touch1&&f.touch0[2]!==k[2]&&(f.touch1=k,f.taps=0):(f.touch0=k,p=!0,f.taps=1+!!v);v&&(v=clearTimeout(v)),p&&(f.taps<2&&(z=k[0],v=setTimeout(function(){v=null},M)),J(this),f.start())}}function lt(e,...a){if(this.__zooming){var n=I(this,a).event(e),r=e.changedTouches,f=r.length,p,g,x,k;for(X(e),p=0;p<f;++p)g=r[p],x=j(g,this),n.touch0&&n.touch0[2]===g.identifier?n.touch0[0]=x:n.touch1&&n.touch1[2]===g.identifier&&(n.touch1[0]=x);if(g=n.that.__zoom,n.touch1){var R=n.touch0[0],S=n.touch0[1],C=n.touch1[0],D=n.touch1[1],E=(E=C[0]-R[0])*E+(E=C[1]-R[1])*E,L=(L=D[0]-S[0])*L+(L=D[1]-S[1])*L;g=B(g,Math.sqrt(E/L)),x=[(R[0]+C[0])/2,(R[1]+C[1])/2],k=[(S[0]+D[0])/2,(S[1]+D[1])/2]}else if(n.touch0)x=n.touch0[0],k=n.touch0[1];else return;n.zoom("touch",l(T(g,x,k),n.extent,c))}}function rt(e,...a){if(this.__zooming){var n=I(this,a).event(e),r=e.changedTouches,f=r.length,p,g;for(K(e),w&&clearTimeout(w),w=setTimeout(function(){w=null},M),p=0;p<f;++p)g=r[p],n.touch0&&n.touch0[2]===g.identifier?delete n.touch0:n.touch1&&n.touch1[2]===g.identifier&&delete n.touch1;if(n.touch1&&!n.touch0&&(n.touch0=n.touch1,delete n.touch1),n.touch0)n.touch0[1]=this.__zoom.invert(n.touch0[0]);else if(n.end(),n.taps===2&&(g=j(g,this),Math.hypot(z[0]-g[0],z[1]-g[1])<b)){var x=A(this).on("dblclick.zoom");x&&x.apply(this,arguments)}}}return u.wheelDelta=function(e){return arguments.length?(d=typeof e=="function"?e:Y(+e),u):d},u.filter=function(e){return arguments.length?(t=typeof e=="function"?e:Y(!!e),u):t},u.touchable=function(e){return arguments.length?(h=typeof e=="function"?e:Y(!!e),u):h},u.extent=function(e){return arguments.length?(i=typeof e=="function"?e:Y([[+e[0][0],+e[0][1]],[+e[1][0],+e[1][1]]]),u):i},u.scaleExtent=function(e){return arguments.length?(s[0]=+e[0],s[1]=+e[1],u):[s[0],s[1]]},u.translateExtent=function(e){return arguments.length?(c[0][0]=+e[0][0],c[1][0]=+e[1][0],c[0][1]=+e[0][1],c[1][1]=+e[1][1],u):[[c[0][0],c[0][1]],[c[1][0],c[1][1]]]},u.constrain=function(e){return arguments.length?(l=e,u):l},u.duration=function(e){return arguments.length?(m=+e,u):m},u.interpolate=function(e){return arguments.length?(o=e,u):o},u.on=function(){var e=y.on.apply(y,arguments);return e===y?u:e},u.clickDistance=function(e){return arguments.length?(_=(e=+e)*e,u):Math.sqrt(_)},u.tapDistance=function(e){return arguments.length?(b=+e,u):b},u}const Gt={setup(){const t=ct(),i=ut();return{userDetailsStore:t,skillTreeStore:i}},data(){return{width:6e3,height:null,radius:0,radiusMultiplier:96,skill:{id:null,children:[],isMastered:null,isUnlocked:null,container:null,name:null,description:null,tagIDs:[],sprite:null,type:null,subskills:[]},tree:{},root:{},context:{},hiddenCanvasContext:{},scaleMultiplier:.8,startDragOffset:{x:0,y:0},mouseDown:!1,nodes:[],nextCol:1,colToNode:{},isSkillInfoPanelShown:!1,scale:1,panX:0,panY:0,data:{}}},components:{SkillPanel:kt},async mounted(){this.skillTreeStore.userSkillsSubSkillsSeparate.length==0&&await this.skillTreeStore.getUserSkillsSubSkillsSeparate(),this.width=window.innerWidth,this.height=window.innerHeight,this.radius=Math.min(this.width,this.height)/2-30,this.skill={name:"SKILLS",sprite:null,children:this.skillTreeStore.userSkillsSubSkillsSeparate},this.getAlgorithm(),A(this.context.canvas).call(At().scaleExtent([.05,8]).on("zoom",({transform:t})=>this.zoomed(t))),canvas.addEventListener("click",t=>{this.nodes;var i=t.layerX,l=t.layerY,d=this.hiddenCanvasContext,h=d.getImageData(i,l,1,1).data,s="rgb("+h[0]+","+h[1]+","+h[2]+")",c=this.colToNode[s];c&&(c.renderCol=c.__pickColor,this.skill.name=c.data.skill_name,this.skill.id=c.data.id,this.skill.type=c.data.type,this.skill.masteryRequirements=c.data.mastery_requirements,this.skill.subskills=c.data.subskills,this.showInfoPanel())})},methods:{getAlgorithm(){var t=[];t=JSON.parse(JSON.stringify(this.skill.children)),this.data={skill_name:"",children:t};const i=tt().size([2*Math.PI,this.radius*this.radiusMultiplier]).separation((h,s)=>(h.parent==s.parent?1:2)/h.depth);this.root=i(et(this.data).sort((h,s)=>wt(h.data.name,s.data.name)));var l=document.getElementById("canvas");l.width=this.width,l.height=this.height,this.context=l.getContext("2d"),this.context.fillStyle="#1e293b",this.context.fillRect(0,0,this.width,this.height);let d=document.getElementById("hidden-canvas");this.hiddenCanvasContext=d.getContext("2d"),d.style.display="none",this.context.translate(this.width/2,this.height/2),this.hiddenCanvasContext.translate(this.width/2,this.height/2),this.drawTree()},drawTree(){this.nodes=this.root.descendants();const t=this.root.links();this.context.beginPath();for(const i of t)this.drawLink(i);this.context.beginPath();for(const i of this.nodes)i.renderCol?this.context.fillStyle=i.renderCol:this.context.fillStyle="RGBA(105, 105, 105, 0.8)",i.__pickColor===void 0&&(i.__pickColor=this.genColor(),this.colToNode[i.__pickColor]=i),this.hiddenCanvasContext.fillStyle=i.__pickColor,this.drawNode(i);this.context.beginPath(),this.context.moveTo(0,0),this.context.arc(0,0,20,0,2*Math.PI),this.context.fillStyle="lightgreen",this.context.fill(),this.context.fillStyle="LawnGreen",this.context.strokeStyle="black",this.context.lineWidth=5,this.context.beginPath(),this.context.arc(0,0,50,0,2*Math.PI),this.context.fill(),this.context.stroke(),this.context.closePath(),this.context.fillStyle="cyan",this.context.beginPath(),this.context.arc(-12.5,-16.5,7.5,0,2*Math.PI),this.context.fill(),this.context.stroke(),this.context.closePath(),this.context.beginPath(),this.context.arc(12.5,-16.5,7.5,0,2*Math.PI),this.context.fill(),this.context.stroke(),this.context.closePath(),this.context.fillStyle="LawnGreen",this.context.strokeStyle="black",this.context.lineWidth=5,this.context.beginPath(),this.context.arc(0,0,37.5,0,-1*Math.PI),this.context.stroke(),this.context.closePath()},drawNode(t){let i=this.context,l=this.hiddenCanvasContext,d=Math.cos(t.x)*t.y,h=Math.sin(t.x)*t.y,s=c(0,0,d,h,90);function c(v,z,w,M,P){var _=Math.PI/180*P,b=Math.cos(_),u=Math.sin(_),B=b*(w-v)+u*(M-z)+v,T=b*(M-z)-u*(w-v)+z;return[B,T]}let m;t.data.type=="domain"?m="orange":t.data.level=="grade_school"?m="#36c1af":t.data.level=="middle_school"?m="#6eb3f5":t.data.level=="high_school"?m="#3983dd":t.data.level=="college"?m="#baa9e1":t.data.level=="phd"&&(m="#9c7eec");let o;t.depth==1?o=20:o=10,i.beginPath(),i.moveTo(s[0],s[1]),i.arc(s[0],s[1],o,0,2*Math.PI),i.fillStyle=m,i.fill();function y(v,z,w,M){var P=M-z,_=w-v,b=Math.atan2(P,_);return b}var y=y(0,0,s[0],s[1]);if(this.scale>.6&&(i.save(),i.translate(s[0],s[1]),i.rotate(y),s[0]<0?(i.textAlign="end",i.rotate(Math.PI)):i.textAlign="start",i.strokeStyle="#1e293b",i.lineWidth=4,i.strokeText(t.data.skill_name,0,0),i.fillStyle="#FFF",i.fillText(t.data.skill_name,0,0),i.restore()),l.beginPath(),l.moveTo(s[0],s[1]),l.arc(s[0],s[1],o,0,2*Math.PI),l.fill(),t.data.type=="super")for(let v=0;v<t.data.subskills.length;v++){let P=360/t.data.subskills.length*v*Math.PI/180,_=20*Math.cos(P),b=20*Math.sin(P);i.beginPath(),i.moveTo(s[0],s[1]),i.arc(s[0]+_,s[1]+b,5,0,2*Math.PI),i.fillStyle=m,i.fill(),l.beginPath(),l.moveTo(s[0],s[1]),l.arc(s[0]+_,s[1]+b,5,0,2*Math.PI),l.fill()}},drawLink(t){const i=it().angle(d=>d.x).radius(d=>d.y).context(this.context);let l="#71717a";t.target.data.is_mastered==1?(this.context.lineWidth=4,l="#ffffff"):this.context.lineWidth=1,this.context.beginPath(),i(t),this.context.strokeStyle=l,this.context.stroke()},genColor(){var t=[];this.nextCol<16777215&&(t.push(this.nextCol&255),t.push((this.nextCol&65280)>>8),t.push((this.nextCol&16711680)>>16),this.nextCol+=100);var i="rgb("+t.join(",")+")";return i},zoomed(t){this.context.save(),this.hiddenCanvasContext.save(),this.context.fillStyle="#1e293b",this.context.fillRect(this.width/2*-1,this.height/2*-1,this.width,this.height),this.hiddenCanvasContext.clearRect(this.width/2*-1,this.height/2*-1,this.width,this.height),this.context.translate(t.x,t.y),this.context.scale(t.k,t.k),this.hiddenCanvasContext.translate(t.x,t.y),this.hiddenCanvasContext.scale(t.k,t.k),this.drawTree(),this.context.fill(),this.context.restore(),this.hiddenCanvasContext.fill(),this.hiddenCanvasContext.restore()},showInfoPanel(){this.isSkillInfoPanelShown||(this.isSkillInfoPanelShown=!0,screen.width>800?document.getElementById("skillInfoPanel").style.width="474px":document.getElementById("skillInfoPanel").style.height="474px")},hideInfoPanel(){this.isSkillInfoPanelShown&&(screen.width>800?document.getElementById("skillInfoPanel").style.width="0px":document.getElementById("skillInfoPanel").style.height="0px",document.getElementById("sidepanel-backdrop").style.display="none",this.isSkillInfoPanelShown=!1)},async printPDF(){await this.getPrintAlgorithm();var t=document.getElementById("radialTree"),i=A(t),l=i.node(),d=new XMLSerializer,h=d.serializeToString(l),s={svg:h,treeType:"radial"},c=JSON.stringify(s),m=new XMLHttpRequest;m.responseType="arraybuffer",m.open("POST","/skilltree/print-pdf",!0),m.setRequestHeader("Content-type","application/json;charset=UTF-8"),m.setRequestHeader("Accept","application/json, text/plain, */*"),m.send(c),m.onload=function(){if(this.readyState==4&&this.status==200){let y=new Blob([m.response],{type:"application/pdf"});const v=window.URL.createObjectURL(y);var o=document.createElement("a");document.body.appendChild(o),o.style="display: none",o.href=v,o.download="My-Skill-Tree.pdf",o.click(),window.URL.revokeObjectURL(v)}}},async getPrintAlgorithm(){await this.skillTreeStore.getUserSkills();const t={name:"SKILLS",sprite:null,children:this.skillTreeStore.userSkills};var i=[];i=JSON.parse(JSON.stringify(t.children));function l(h){for(var s=h.length;s--;){if(h[s].type=="super"&&h[s].position!="end"){var c=[],m=[];for(let y=0;y<h[s].children.length;y++)h[s].children[y].type=="sub"?c.push(h[s].children[y]):m.push(h[s].children[y]);var o={skill_name:h[s].skill_name,type:"super",position:"end",children:c};h[s].children=[],h[s].children.push(o);for(let y=0;y<m.length;y++)h[s].children.push(m[y])}typeof h[s]<"u"&&h[s].children&&Array.isArray(h[s].children)&&h[s].children.length>0&&l(h[s].children)}}l(i);const d={skill_name:"My skills",children:i};await this.createSVGTree(d)},async createSVGTree(t){const d=13200.000000000002,h=24e3*.59,c=tt().size([2*Math.PI,this.radius*50]).separation((o,y)=>(o.parent==y.parent?1:2)/o.depth)(et(t));let m=St("svg").attr("id","radialTree").attr("width",24e3).attr("height",24e3).attr("viewBox",[-d,-h,24e3,24e3]).attr("style","max-width: 100%; height: auto; font: 10px sans-serif;");m.append("g").attr("fill","none").attr("stroke-opacity",1).selectAll().data(c.links()).join("path").attr("d",it().angle(o=>o.x).radius(o=>o.y)).attr("stroke",function(o){return"#000"}).attr("stroke-width",function(o){return o.target.data.is_mastered==1?4:1.5}).style("stroke-dasharray",function(o){if(o.source.data.type=="super"&&o.target.data.position=="end"||o.target.data.type=="sub")return 5}),m.append("g").selectAll().data(c.descendants()).join("circle").attr("transform",o=>`rotate(${o.x*180/Math.PI-90}) translate(${o.y},0)`).attr("fill","#000").attr("r",2.5),m.append("g").attr("stroke-linejoin","round").attr("stroke-width",1).selectAll().data(c.descendants()).join("text").attr("transform",o=>`rotate(${o.x*180/Math.PI-90}) translate(${o.y},0) rotate(${o.x>=Math.PI?180:0})`).attr("dy","0.31em").attr("x",o=>o.x<Math.PI==!o.children?6:-6).attr("text-anchor",o=>o.x<Math.PI==!o.children?"start":"end").style("font-weight",function(o){return o.data.type=="super"?"700":"400"}).style("font-style",function(o){if(o.data.type=="sub")return"italic"}).style("paint-order",function(o){return"stroke"}).clone(!0).lower().style("stroke-width",function(o){return"1px"}).text(function(o){return o.data.position=="end"?"":o.data.skill_name}),document.querySelector("#SVGskilltree").append(m.node())}}},F=t=>(yt("data-v-009cc755"),t=t(),xt(),t),Nt={id:"wrapper"},Vt=F(()=>U("canvas",{id:"canvas",width:"1500",height:"1500"},null,-1)),jt=F(()=>U("canvas",{id:"hidden-canvas",width:"1500",height:"1500"},null,-1)),Ut=F(()=>U("div",{id:"SVGskilltree"},null,-1)),Xt=F(()=>U("div",{id:"sidepanel-backdrop"},null,-1));function $t(t,i,l,d,h,s){const c=dt("SkillPanel");return ft(),mt(gt,null,[U("button",{id:"print-btn",class:"btn btn-info",onClick:i[0]||(i[0]=m=>s.printPDF())}," Print "),U("div",Nt,[pt(c,{skill:h.skill},null,8,["skill"]),Vt,jt,Ut,Xt])],64)}const Yt=ht(Gt,[["render",$t],["__scopeId","data-v-009cc755"]]);export{Yt as R};