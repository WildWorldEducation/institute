import{_ as d,o as l,c as a,a as o,t as u,q as h,b,u as c,p as f,d as _}from"./main-d4af69a9.js";const i={props:["toolTipText","bubbleWidth","absoluteTop","trianglePosition"],data:()=>({bubbleWidthCss:"500px",absoluteTopCss:"15px",trianglePositionCss:"left",absoluteLeftCss:"0px",showToolTip:!1}),created(){this.bubbleWidth&&(this.bubbleWidthCss=this.bubbleWidth),this.absoluteTop&&(this.absoluteTopCss=this.absoluteTop),this.trianglePosition&&(this.trianglePositionCss=this.trianglePosition),this.trianglePositionCss==="left"&&(this.absoluteLeftCss="-16px")},methods:{}},n=()=>{c(t=>({"4230f648":t.absoluteTopCss,"454f6dce":t.absoluteLeftCss,"4875ff20":t.bubbleWidthCss}))},p=i.setup;i.setup=p?(t,s)=>(n(),p(t,s)):n;const T=t=>(f("data-v-69a3955e"),t=t(),_(),t),g={class:"position-relative"},C=T(()=>o("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 192 512",width:"12",height:"12",fill:"white"},[o("path",{d:"M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 224 32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0 0-192-32 0c-17.7 0-32-14.3-32-32z"})],-1)),v=[C],w={key:0,class:"tool-tip-base"},P={class:"tool-tip-text"};function m(t,s,e,W,x,B){return l(),a("div",g,[o("button",{class:"tooltip-btn",onMouseover:s[0]||(s[0]=r=>t.showToolTip=!0),onMouseleave:s[1]||(s[1]=r=>t.showToolTip=!1)},v,32),t.showToolTip?(l(),a("div",w,[o("div",{class:h(["explain-tool-tip",{"triangle-top-left":t.trianglePositionCss==="left","triangle-top-right":t.trianglePositionCss==="right","triangle-top-center":e.trianglePosition==="center"}])},[o("div",P,[o("div",null,u(e.toolTipText),1)])],2)])):b("",!0)])}const y=d(i,[["render",m],["__scopeId","data-v-69a3955e"]]);export{y as T};
