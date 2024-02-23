import{l as Nt,m as Et,n as Ot,q as Bt,s as Ct,A as Rt,B as Mt,Q as Dt,x as kt,y as Ut,z as zt,D as Ft,E as Vt,H as bt,I as jt,M as X,J,L as K,K as k,N as P,P as H,O as Xt,R as Jt,U as _t,V as ot,W as C,X as Ht,Y as U,Z as Gt,$ as Wt,a0 as $t,C as Qt,a1 as qt,a2 as tt,a3 as ht,a4 as Kt,a5 as Zt,a6 as Yt,a7 as te,a8 as ee,a9 as ie,aa as se,G as Tt,_ as ne,u as le,ab as re,T as ae,r as oe,o as it,c as Lt,b as R,a as St,F as At,p as he,d as ce,e as ue,f as ct,g as de}from"./main-578d4ac3.js";import{u as fe}from"./SkillTreeStore-60af3ea9.js";import{S as pe,h as ye}from"./pixi_viewport-b499084c.js";import"./transform-9f729428.js";import{h as ut}from"./index-0536990b.js";import{t as dt}from"./tree-6e85cfa8.js";import{a as ft,s as xe,c as ve}from"./link-55b094b3.js";const me={buildPoly:Nt,buildCircle:Et,buildRectangle:Ot,buildRoundedRectangle:Bt,buildLine:Ct,ArcUtils:Rt,BezierUtils:Mt,QuadraticUtils:Dt,BatchPart:kt,FILL_COMMANDS:Ut,BATCH_POOL:zt,DRAW_CALL_POOL:Ft};function wt(s,t,i=.001){return this===t||Math.abs(s.a-t.a)<i&&Math.abs(s.b-t.b)<i&&Math.abs(s.c-t.c)<i&&Math.abs(s.d-t.d)<i&&Math.abs(s.tx-t.tx)<i&&Math.abs(s.ty-t.ty)<i}class ge{constructor(){this.textureIds=[],this.matrices=[],this.lines=[],this.count=0}clear(){for(let t=0;t<this.count;t++)this.textureIds[t]=null,this.matrices[t]=null;this.count=0}add(t,i,e,l,n,o){const{textureIds:r,matrices:h,lines:f,count:a}=this;t=t*4+n;for(let u=0;u<a;u++)if(f[u*2]===e&&f[u*2+1]===l&&r[u]===t&&wt(h[u],i))return u;return a>=o.maxStyles?-1:(r[a]=t,h[a]=i,f[a*2]=e,f[a*2+1]=l,this.count++,a)}}class pt{constructor(){this.texArray=new Vt,this.styleArray=new ge,this.shader=null,this.blend=bt.NORMAL,this.start=0,this.size=0,this.TICK=0,this.settings=null,this.data=null}clear(){this.texArray.clear(),this.styleArray.clear(),this.settings=null,this.data=null,this.shader=null}begin(t,i){this.TICK=++jt._globalBatch,this.settings=t,this.shader=i,this.start=0,this.size=0,this.data=null,i&&i.settings&&(this.settings=i.settings)}check(t){return this.size===0?(this.shader=t,!0):this.shader===t}add(t,i,e,l,n){const{texArray:o,TICK:r,styleArray:h,settings:f}=this,{baseTexture:a}=t;if(a._batchEnabled!==r&&o.count===f.maxTextures)return-1;const u=a._batchEnabled!==r?o.count:a._batchLocation,c=h.add(u,i||X.IDENTITY,e,l,n,f);return c>=0&&a._batchEnabled!==r&&(a._batchEnabled=r,a._batchLocation=o.count,o.elements[o.count++]=a),c}}class be{constructor(){this.reset()}begin(t,i,e){this.reset(),this.style=t,this.start=i,this.attribStart=e,this.jointEnd=0}end(t,i){this.attribSize=i-this.attribStart,this.size=t-this.start}reset(){this.style=null,this.size=0,this.start=0,this.attribStart=0,this.attribSize=0,this.styleId=-1,this.rgba=0,this.jointEnd=0}}class Y{constructor(){this.reset()}toJSON(){return this.copyTo({})}clone(){return this.copyTo(new Y)}copyTo(t){return t.color=this.color,t.alpha=this.alpha,t.texture=this.texture,t.matrix=this.matrix,t.shader=this.shader,t.visible=this.visible,t.smooth=this.smooth,t.matrixTex=null,t}packLineScale(){return 0}reset(){this.color=16777215,this.alpha=1,this.texture=J.WHITE,this.matrix=null,this.shader=null,this.visible=!1,this.smooth=!1,this.matrixTex=null}destroy(){this.texture=null,this.matrix=null,this.matrixTex=null}getTextureMatrix(){const t=this.texture;return this.matrix?t.frame.width===t.baseTexture.width&&t.frame.height===t.baseTexture.height?this.matrix:(this.matrixTex?this.matrixTex.copyFrom(this.matrix):this.matrixTex=this.matrix.clone(),this.matrixTex.translate(Number(t.frame.x),Number(t.frame.y)),this.matrixTex):null}}var z=(s=>(s.NONE="none",s.NORMAL="normal",s.HORIZONTAL="horizontal",s.VERTICAL="vertical",s))(z||{});class nt extends Y{clone(){return this.copyTo(new nt)}copyTo(t){return t.color=this.color,t.alpha=this.alpha,t.texture=this.texture,t.matrix=this.matrix,t.shader=this.shader,t.visible=this.visible,t.width=this.width,t.alignment=this.alignment,t.cap=this.cap,t.join=this.join,t.miterLimit=this.miterLimit,t.scaleMode=this.scaleMode,t}packLineScale(){switch(this.scaleMode){case"normal":return 1;case"horizontal":return 2;case"vertical":return 3;default:return 0}}reset(){super.reset(),this.smooth=!0,this.color=0,this.width=0,this.alignment=.5,this.cap=K.BUTT,this.join=k.MITER,this.miterLimit=10,this.scaleMode="normal"}}class _e{constructor(){this.verts=[],this.joints=[],this.vertexSize=0,this.indexSize=0,this.closePointEps=1e-4}clear(){this.verts.length=0,this.joints.length=0,this.vertexSize=0,this.indexSize=0}destroy(){this.verts.length=0,this.joints.length=0}}var p=(s=>(s[s.NONE=0]="NONE",s[s.FILL=1]="FILL",s[s.JOINT_BEVEL=4]="JOINT_BEVEL",s[s.JOINT_MITER=8]="JOINT_MITER",s[s.JOINT_ROUND=12]="JOINT_ROUND",s[s.JOINT_CAP_BUTT=16]="JOINT_CAP_BUTT",s[s.JOINT_CAP_SQUARE=18]="JOINT_CAP_SQUARE",s[s.JOINT_CAP_ROUND=20]="JOINT_CAP_ROUND",s[s.FILL_EXPAND=24]="FILL_EXPAND",s[s.CAP_BUTT=32]="CAP_BUTT",s[s.CAP_SQUARE=64]="CAP_SQUARE",s[s.CAP_ROUND=96]="CAP_ROUND",s[s.CAP_BUTT2=128]="CAP_BUTT2",s))(p||{});const D=class{constructor(){this.strideFloats=12,this.bufferPos=0,this.indexPos=0}updateBufferSize(s,t,i,e){const{joints:l}=e;let n=!1,o=0,r=0;for(let h=s;h<s+t;h++){const f=l[h]&-32,a=l[h]&31;if(a===p.FILL){n=!0,o++;continue}if(a>=p.FILL_EXPAND){o+=3,r+=3;continue}const u=D.vertsByJoint[a]+D.vertsByJoint[f];u>=4&&(o+=u,r+=6+3*Math.max(u-6,0))}n&&(r+=i),e.vertexSize+=o,e.indexSize+=r}beginPack(s,t,i,e,l=0,n=0){this.buildData=s,this.bufFloat=t,this.bufUint=i,this.indices=e,this.bufferPos=l,this.indexPos=n}endPack(){this.buildData=null,this.bufFloat=null,this.bufUint=null,this.indices=null}packInterleavedGeometry(s,t,i,e,l){const{bufFloat:n,bufUint:o,indices:r,buildData:h,strideFloats:f}=this,{joints:a,verts:u}=h;let c=this.bufferPos,d=this.indexPos,x=this.bufferPos/this.strideFloats,v,y,g,b,L,S,A,_,m=!1,I=0;for(let T=s;T<s+t;T++){const B=a[T],W=a[T]&-32,N=a[T]&31;if(N===p.FILL){m=!0,v=u[T*2],y=u[T*2+1],n[c]=v,n[c+1]=y,n[c+2]=v,n[c+3]=y,n[c+4]=v,n[c+5]=y,n[c+6]=v,n[c+7]=y,n[c+8]=I,n[c+9]=16*N,n[c+10]=e,o[c+11]=l,c+=f;continue}if(N>=p.FILL_EXPAND){L=u[T*2],S=u[T*2+1],v=u[T*2+2],y=u[T*2+3],g=u[T*2+4],b=u[T*2+5];const E=T+3;for(let V=0;V<3;V++)n[c]=L,n[c+1]=S,n[c+2]=v,n[c+3]=y,n[c+4]=g,n[c+5]=b,n[c+6]=u[(E+V)*2],n[c+7]=u[(E+V)*2+1],n[c+8]=I,n[c+9]=16*B+V,n[c+10]=e,o[c+11]=l,c+=f;r[d]=x,r[d+1]=x+1,r[d+2]=x+2,d+=3,x+=3;continue}const O=D.vertsByJoint[N]+D.vertsByJoint[W];if(O===0)continue;v=u[T*2],y=u[T*2+1],g=u[T*2+2],b=u[T*2+3],L=u[T*2-2],S=u[T*2-1];const F=Math.sqrt((g-v)*(g-v)+(b-y)*(b-y));D.vertsByJoint[N]===0&&(I-=F),(N&-3)!==p.JOINT_CAP_BUTT?(A=u[T*2+4],_=u[T*2+5]):(A=v,_=y);for(let E=0;E<O;E++)n[c]=L,n[c+1]=S,n[c+2]=v,n[c+3]=y,n[c+4]=g,n[c+5]=b,n[c+6]=A,n[c+7]=_,n[c+8]=I,n[c+9]=16*B+E,n[c+10]=e,o[c+11]=l,c+=f;I+=F,r[d]=x,r[d+1]=x+1,r[d+2]=x+2,r[d+3]=x,r[d+4]=x+2,r[d+5]=x+3,d+=6;for(let E=5;E+1<O;E++)r[d]=x+4,r[d+1]=x+E,r[d+2]=x+E+1,d+=3;x+=O}if(m){for(let T=0;T<i.length;T++)r[d+T]=i[T]+x;d+=i.length}this.bufferPos=c,this.indexPos=d}};let lt=D;lt.vertsByJoint=[];const w=lt.vertsByJoint;for(let s=0;s<256;s++)w.push(0);w[p.FILL]=1;for(let s=0;s<8;s++)w[p.FILL_EXPAND+s]=3;w[p.JOINT_BEVEL]=4+5;w[p.JOINT_BEVEL+1]=4+5;w[p.JOINT_BEVEL+2]=4+5;w[p.JOINT_BEVEL+3]=4+5;w[p.JOINT_ROUND]=4+5;w[p.JOINT_ROUND+1]=4+5;w[p.JOINT_ROUND+2]=4+5;w[p.JOINT_ROUND+3]=4+5;w[p.JOINT_MITER]=4+5;w[p.JOINT_MITER+1]=4+5;w[p.JOINT_MITER+2]=4;w[p.JOINT_MITER+3]=4;w[p.JOINT_CAP_BUTT]=4;w[p.JOINT_CAP_BUTT+1]=4;w[p.JOINT_CAP_SQUARE]=4;w[p.JOINT_CAP_SQUARE+1]=4;w[p.JOINT_CAP_ROUND]=4+5;w[p.JOINT_CAP_ROUND+1]=4+5;w[p.CAP_ROUND]=4;class Z{constructor(t,i=null,e=null,l=null){this.shape=t,this.lineStyle=e,this.fillStyle=i,this.matrix=l,this.type=t.type,this.points=[],this.holes=[],this.triangles=[],this.closeStroke=!1,this.clearBuild()}clearPath(){this.points.length=0,this.closeStroke=!0}clearBuild(){this.triangles.length=0,this.fillStart=0,this.fillLen=0,this.strokeStart=0,this.strokeLen=0,this.fillAA=!1}clone(){return new Z(this.shape,this.fillStyle,this.lineStyle,this.matrix)}capType(){let t;switch(this.lineStyle.cap){case K.SQUARE:t=p.CAP_SQUARE;break;case K.ROUND:t=p.CAP_ROUND;break;default:t=p.CAP_BUTT;break}return t}goodJointType(){let t;switch(this.lineStyle.join){case k.BEVEL:t=p.JOINT_BEVEL;break;case k.ROUND:t=p.JOINT_ROUND;break;default:t=p.JOINT_MITER+3;break}return t}jointType(){let t;switch(this.lineStyle.join){case k.BEVEL:t=p.JOINT_BEVEL;break;case k.ROUND:t=p.JOINT_ROUND;break;default:t=p.JOINT_MITER;break}return t}destroy(){this.shape=null,this.holes.length=0,this.holes=null,this.points.length=0,this.points=null,this.lineStyle=null,this.fillStyle=null,this.triangles=null}}class st{path(t,i){const e=t.points;let l,n,o,r,h,f;if(t.type===P.CIRC){const y=t.shape;l=y.x,n=y.y,h=f=y.radius,o=r=0}else if(t.type===P.ELIP){const y=t.shape;l=y.x,n=y.y,h=y.width,f=y.height,o=r=0}else{const y=t.shape,g=y.width/2,b=y.height/2;l=y.x+g,n=y.y+b,h=f=Math.max(0,Math.min(y.radius,Math.min(g,b))),o=g-h,r=b-f}if(!(h>=0&&f>=0&&o>=0&&r>=0)){e.length=0;return}const a=Math.ceil(2.3*Math.sqrt(h+f)),u=a*8+(o?4:0)+(r?4:0);if(e.length=u,u===0)return;if(a===0){e.length=8,e[0]=e[6]=l+o,e[1]=e[3]=n+r,e[2]=e[4]=l-o,e[5]=e[7]=n-r;return}let c=0,d=a*4+(o?2:0)+2,x=d,v=u;{const y=o+h,g=r,b=l+y,L=l-y,S=n+g;if(e[c++]=b,e[c++]=S,e[--d]=S,e[--d]=L,r){const A=n-g;e[x++]=L,e[x++]=A,e[--v]=A,e[--v]=b}}for(let y=1;y<a;y++){const g=Math.PI/2*(y/a),b=o+Math.cos(g)*h,L=r+Math.sin(g)*f,S=l+b,A=l-b,_=n+L,m=n-L;e[c++]=S,e[c++]=_,e[--d]=_,e[--d]=A,e[x++]=A,e[x++]=m,e[--v]=m,e[--v]=S}{const y=o,g=r+f,b=l+y,L=l-y,S=n+g,A=n-g;e[c++]=b,e[c++]=S,e[--v]=A,e[--v]=b,o&&(e[c++]=L,e[c++]=S,e[--v]=A,e[--v]=L)}}fill(t,i){const{verts:e,joints:l}=i,{points:n,triangles:o}=t;if(n.length===0)return;let r,h;if(t.type!==P.RREC){const _=t.shape;r=_.x,h=_.y}else{const _=t.shape;r=_.x+_.width/2,h=_.y+_.height/2}const f=t.matrix,a=f?f.a*r+f.c*h+f.tx:r,u=f?f.b*r+f.d*h+f.ty:h;let c=1;const d=0;if(!t.fillAA){e.push(a,u),l.push(p.FILL),e.push(n[0],n[1]),l.push(p.FILL);for(let _=2;_<n.length;_+=2)e.push(n[_],n[_+1]),l.push(p.FILL),o.push(c++,d,c);o.push(d+1,d,c);return}const x=n.length;let v=n[x-2],y=n[x-1],g=y-n[x-3],b=n[x-4]-v;const L=Math.sqrt(g*g+b*b);g/=L,b/=L;let S,A;for(let _=0;_<x;_+=2){const m=n[_],I=n[_+1];let T=I-y,B=v-m;const W=Math.sqrt(T*T+B*B);T/=W,B/=W;let N=g+T,O=b+B;const F=T*N+B*O;N/=F,O/=F,_>0?(e.push(N),e.push(O)):(S=N,A=O),e.push(a),e.push(u),e.push(v),e.push(y),e.push(m),e.push(I),e.push(0),e.push(0),e.push(N),e.push(O),l.push(p.FILL_EXPAND+2),l.push(p.NONE),l.push(p.NONE),l.push(p.NONE),l.push(p.NONE),l.push(p.NONE),v=m,y=I,g=T,b=B}e.push(S),e.push(A)}line(t,i){const{verts:e,joints:l}=i,{points:n}=t,o=n.length===8?t.goodJointType():p.JOINT_MITER+3,r=n.length;if(r!==0){e.push(n[r-2],n[r-1]),l.push(p.NONE);for(let h=0;h<r;h+=2)e.push(n[h],n[h+1]),l.push(o);e.push(n[0],n[1]),l.push(p.NONE),e.push(n[2],n[3]),l.push(p.NONE)}}}const Te=[];function yt(s,t=!1){const i=s.length;if(i<6)return;let e=0;for(let l=0,n=s[i-2],o=s[i-1];l<i;l+=2){const r=s[l],h=s[l+1];e+=(r-n)*(h+o),n=r,o=h}if(!t&&e>0||t&&e<=0){const l=i/2;for(let n=l+l%2;n<i;n+=2){const o=i-n-2,r=i-n-1,h=n,f=n+1;[s[o],s[h]]=[s[h],s[o]],[s[r],s[f]]=[s[f],s[r]]}}}class It{path(t,i){const e=t.shape,l=t.points=e.points.slice(),n=i.closePointEps,o=n*n;if(l.length===0)return;const r=new H(l[0],l[1]),h=new H(l[l.length-2],l[l.length-1]),f=t.closeStroke=e.closeStroke;let a=l.length,u=2;for(let c=2;c<a;c+=2){const d=l[c-2],x=l[c-1],v=l[c],y=l[c+1];let g=!0;Math.abs(d-v)<n&&Math.abs(x-y)<n&&(g=!1),g&&(l[u]=l[c],l[u+1]=l[c+1],u+=2)}l.length=a=u,u=2;for(let c=2;c+2<a;c+=2){let d=l[c-2],x=l[c-1];const v=l[c],y=l[c+1];let g=l[c+2],b=l[c+3];d-=v,x-=y,g-=v,b-=y;let L=!0;Math.abs(g*x-b*d)<o&&d*g+x*b<-o&&(L=!1),L&&(l[u]=l[c],l[u+1]=l[c+1],u+=2)}l[u]=l[a-2],l[u+1]=l[a-1],u+=2,l.length=a=u,!(a<=2)&&f&&Math.abs(r.x-h.x)<n&&Math.abs(r.y-h.y)<n&&(l.pop(),l.pop())}line(t,i){const{closeStroke:e,points:l}=t,n=l.length;if(n<=2)return;const{verts:o,joints:r}=i,h=t.jointType(),f=t.capType();let a=0,u,c;e?(u=l[n-2],c=l[n-1],r.push(p.NONE)):(u=l[2],c=l[3],f===p.CAP_ROUND?(o.push(l[0],l[1]),r.push(p.NONE),r.push(p.CAP_ROUND),a=0):(a=f,r.push(p.NONE))),o.push(u,c);for(let d=0;d<n;d+=2){const x=l[d],v=l[d+1];let y=h;d+2>=n?e||(y=p.NONE):d+4>=n&&(e||(f===p.CAP_ROUND&&(y=p.JOINT_CAP_ROUND),f===p.CAP_BUTT&&(y=p.JOINT_CAP_BUTT),f===p.CAP_SQUARE&&(y=p.JOINT_CAP_SQUARE))),y+=a,a=0,o.push(x,v),r.push(y),u=x,c=v}e?(o.push(l[0],l[1]),r.push(p.NONE),o.push(l[2],l[3]),r.push(p.NONE)):(o.push(l[n-4],l[n-3]),r.push(p.NONE))}fill(t,i){let e=t.points;const l=t.holes,n=i.closePointEps,{verts:o,joints:r}=i;if(e.length<6)return;const h=[];let f=e.length;yt(e,!1);for(let d=0;d<l.length;d++){const x=l[d];yt(x.points,!0),h.push(e.length/2),e=e.concat(x.points)}const a=Te;a.length<e.length&&(a.length=e.length);let u=0;for(let d=0;d<=h.length;d++){let x=f/2;d>0&&(d<h.length?x=h[d]:x=e.length>>1),a[u*2]=x-1,a[(x-1)*2+1]=u;for(let v=u;v+1<x;v++)a[v*2+1]=v+1,a[v*2+2]=v;u=x}if(t.triangles=Xt(e,h,2),!t.triangles)return;if(!t.fillAA){for(let d=0;d<e.length;d+=2)o.push(e[d],e[d+1]),r.push(p.FILL);return}const{triangles:c}=t;f=e.length;for(let d=0;d<c.length;d+=3){let x=0;for(let v=0;v<3;v++){const y=c[d+v],g=c[d+(v+1)%3];(a[y*2]===g||a[y*2+1]===g)&&(x|=1<<v)}r.push(p.FILL_EXPAND+x),r.push(p.NONE),r.push(p.NONE),r.push(p.NONE),r.push(p.NONE),r.push(p.NONE)}for(let d=0;d<f/2;d++){const x=a[d*2],v=a[d*2+1];let y=e[v*2+1]-e[d*2+1],g=-(e[v*2]-e[d*2]),b=e[d*2+1]-e[x*2+1],L=-(e[d*2]-e[x*2]);const S=Math.sqrt(y*y+g*g);y/=S,g/=S;const A=Math.sqrt(b*b+L*L);b/=A,L/=A;let _=y+b,m=g+L;const I=_*y+m*g;Math.abs(I)<n?(_=y,m=g):(_/=I,m/=I),a[d*2]=_,a[d*2+1]=m}for(let d=0;d<c.length;d+=3){const x=c[d],v=c[d+1],y=c[d+2],g=e[y*2+1]-e[v*2+1],b=-(e[y*2]-e[v*2]),L=e[v*2+1]-e[x*2+1],S=-(e[v*2]-e[x*2]);let A=1;g*S-L*b>0&&(A=2);for(let _=0;_<3;_++){const m=c[d+_*A%3];o.push(e[m*2],e[m*2+1])}for(let _=0;_<3;_++){const m=c[d+_*A%3];o.push(a[m*2],a[m*2+1])}}}}class Le{constructor(){this._polyBuilder=new It}path(t,i){const e=t.shape,l=e.x,n=e.y,o=e.width,r=e.height,h=t.points;h.length=0,h.push(l,n,l+o,n,l+o,n+r,l,n+r)}line(t,i){const{verts:e,joints:l}=i,{points:n}=t,o=t.goodJointType(),r=n.length;e.push(n[r-2],n[r-1]),l.push(p.NONE);for(let h=0;h<r;h+=2)e.push(n[h],n[h+1]),l.push(o);e.push(n[0],n[1]),l.push(p.NONE),e.push(n[2],n[3]),l.push(p.NONE)}fill(t,i){const{verts:e,joints:l}=i,{points:n,triangles:o}=t;if(o.length=0,!t.fillAA){e.push(n[0],n[1],n[2],n[3],n[4],n[5],n[6],n[7]),l.push(p.FILL,p.FILL,p.FILL,p.FILL),o.push(0,1,2,0,2,3);return}this._polyBuilder.fill(t,i)}}class Se{constructor(){this._circleBuilder=new st}path(t,i){this._circleBuilder.path(t,i)}line(t,i){this._circleBuilder.line(t,i)}fill(t,i){this._circleBuilder.fill(t,i)}}const $={[P.POLY]:new It,[P.CIRC]:new st,[P.ELIP]:new st,[P.RECT]:new Le,[P.RREC]:new Se},xt=[],Q=[],M=new H,Ae=new _t;class Pt extends Jt{constructor(){super(),this.indicesUint16=null,this.initAttributes(!1),this.buildData=new _e,this.graphicsData=[],this.dirty=0,this.batchDirty=-1,this.cacheDirty=-1,this.clearDirty=0,this.drawCalls=[],this.batches=[],this.shapeBuildIndex=0,this.shapeBatchIndex=0,this._bounds=new _t,this.boundsDirty=-1,this.boundsPadding=0,this.batchable=!1,this.indicesUint16=null,this.packer=null,this.packSize=0,this.pack32index=null}get points(){return this.buildData.verts}get closePointEps(){return this.buildData.closePointEps}initAttributes(t){this._buffer=new ot(null,t,!1),this._bufferFloats=new Float32Array,this._bufferUint=new Uint32Array,this._indexBuffer=new ot(null,t,!0),this.addAttribute("aPrev",this._buffer,2,!1,C.FLOAT).addAttribute("aPoint1",this._buffer,2,!1,C.FLOAT).addAttribute("aPoint2",this._buffer,2,!1,C.FLOAT).addAttribute("aNext",this._buffer,2,!1,C.FLOAT).addAttribute("aTravel",this._buffer,1,!1,C.FLOAT).addAttribute("aVertexJoint",this._buffer,1,!1,C.FLOAT).addAttribute("aStyleId",this._buffer,1,!1,C.FLOAT).addAttribute("aColor",this._buffer,4,!0,C.UNSIGNED_BYTE).addIndex(this._indexBuffer),this.strideFloats=12}checkInstancing(t,i){this.packer||(this.packer=new lt,this.pack32index=i)}get bounds(){return this.boundsDirty!==this.dirty&&(this.boundsDirty=this.dirty,this.calculateBounds()),this._bounds}invalidate(){this.boundsDirty=-1,this.dirty++,this.batchDirty++,this.shapeBuildIndex=0,this.shapeBatchIndex=0,this.packSize=0,this.buildData.clear();for(let t=0;t<this.drawCalls.length;t++)this.drawCalls[t].clear(),Q.push(this.drawCalls[t]);this.drawCalls.length=0;for(let t=0;t<this.batches.length;t++){const i=this.batches[t];i.reset(),xt.push(i)}this.batches.length=0}clear(){return this.graphicsData.length>0&&(this.invalidate(),this.clearDirty++,this.graphicsData.length=0),this}drawShape(t,i=null,e=null,l=null){const n=new Z(t,i,e,l);return this.graphicsData.push(n),this.dirty++,this}drawHole(t,i=null){if(!this.graphicsData.length)return null;const e=new Z(t,null,null,i),l=this.graphicsData[this.graphicsData.length-1];return e.lineStyle=l.lineStyle,l.holes.push(e),this.dirty++,this}destroy(){super.destroy();for(let t=0;t<this.graphicsData.length;++t)this.graphicsData[t].destroy();this.buildData.destroy(),this.buildData=null,this.indexBuffer.destroy(),this.indexBuffer=null,this.graphicsData.length=0,this.graphicsData=null,this.drawCalls.length=0,this.drawCalls=null,this.batches.length=0,this.batches=null,this._bounds=null}containsPoint(t){const i=this.graphicsData;for(let e=0;e<i.length;++e){const l=i[e];if(l.fillStyle.visible&&l.shape&&(l.matrix?l.matrix.applyInverse(t,M):M.copyFrom(t),l.shape.contains(M.x,M.y))){let n=!1;if(l.holes){for(let o=0;o<l.holes.length;o++)if(l.holes[o].shape.contains(M.x,M.y)){n=!0;break}}if(!n)return!0}}return!1}updatePoints(){}updateBufferSize(){this._buffer.update(new Float32Array)}updateBuild(){const{graphicsData:t,buildData:i}=this,e=t.length;for(let l=this.shapeBuildIndex;l<e;l++){const n=t[l];n.strokeStart=0,n.strokeLen=0,n.fillStart=0,n.fillLen=0;const{fillStyle:o,lineStyle:r,holes:h}=n;if(!o.visible&&!r.visible)continue;const f=$[n.type];if(n.clearPath(),f.path(n,i),n.matrix&&this.transformPoints(n.points,n.matrix),n.clearBuild(),!(n.points.length<=2)&&((o.visible||r.visible)&&this.processHoles(h),o.visible&&(n.fillAA=n.fillStyle.smooth&&n.fillStyle.texture===J.WHITE&&h.length===0&&!(n.closeStroke&&n.lineStyle.visible&&!n.lineStyle.shader&&n.lineStyle.alpha>=.99&&n.lineStyle.width*Math.min(n.lineStyle.alignment,1-n.lineStyle.alignment)>=.495),n.fillStart=i.joints.length,h.length?$[P.POLY].fill(n,i):f.fill(n,i),n.fillLen=i.joints.length-n.fillStart),r.visible)){n.strokeStart=i.joints.length,f.line(n,i);for(let a=0;a<h.length;a++){const u=h[a];$[u.type].line(u,i)}n.strokeLen=i.joints.length-n.strokeStart}}this.shapeBuildIndex=e}updateBatches(t){if(!this.graphicsData.length){this.batchable=!0;return}if(this.updateBuild(),!this.validateBatching())return;const{buildData:i,graphicsData:e}=this,l=e.length;this.cacheDirty=this.dirty;let n=null,o=null;this.batches.length>0&&(n=this.batches[this.batches.length-1],o=n.style);for(let r=this.shapeBatchIndex;r<l;r++){const h=e[r],f=h.fillStyle,a=h.lineStyle;if(h.matrix&&this.transformPoints(h.points,h.matrix),!(!f.visible&&!a.visible))for(let u=0;u<2;u++){const c=u===0?f:a;if(!c.visible)continue;const d=c.texture.baseTexture,x=i.vertexSize,v=i.indexSize;d.wrapMode=Ht.REPEAT,u===0?this.packer.updateBufferSize(h.fillStart,h.fillLen,h.triangles.length,i):this.packer.updateBufferSize(h.strokeStart,h.strokeLen,h.triangles.length,i),i.vertexSize!==x&&(n&&!this._compareStyles(o,c)&&(n.end(v,x),n=null),n||(n=xt.pop()||new be,n.begin(c,v,x),this.batches.push(n),o=c),u===0?n.jointEnd=h.fillStart+h.fillLen:n.jointEnd=h.strokeStart+h.strokeLen)}}if(this.shapeBatchIndex=l,n&&n.end(i.indexSize,i.vertexSize),this.batches.length===0){this.batchable=!0;return}this.batchable=this.isBatchable(),this.batchable?this.packBatches():(this.buildDrawCalls(t),this.updatePack())}updatePack(){const{vertexSize:t,indexSize:i}=this.buildData;if(this.packSize===t)return;const{strideFloats:e,packer:l,buildData:n,batches:o}=this,r=this._buffer,h=this._indexBuffer,f=t*e;if(r.data.length!==f){const u=new ArrayBuffer(f*4);this._bufferFloats=new Float32Array(u),this._bufferUint=new Uint32Array(u),r.data=this._bufferFloats}h.data.length!==i&&(t>65535&&this.pack32index?h.data=new Uint32Array(i):h.data=new Uint16Array(i)),l.beginPack(n,this._bufferFloats,this._bufferUint,h.data);let a=0;for(let u=0;u<this.graphicsData.length;u++){const c=this.graphicsData[u];if(c.fillLen){for(;o[a].jointEnd<=c.fillStart;)a++;l.packInterleavedGeometry(c.fillStart,c.fillLen,c.triangles,o[a].styleId,o[a].rgba)}if(c.strokeLen){for(;o[a].jointEnd<=c.strokeStart;)a++;l.packInterleavedGeometry(c.strokeStart,c.strokeLen,c.triangles,o[a].styleId,o[a].rgba)}}r.update(),h.update(),this.packSize=t}_compareStyles(t,i){if(!t||!i||t.texture.baseTexture!==i.texture.baseTexture||t.color+t.alpha!==i.color+i.alpha||t.shader!==i.shader||t.width!==i.width||t.scaleMode!==i.scaleMode||t.alignment!==i.alignment)return!1;const e=t.matrix||X.IDENTITY,l=i.matrix||X.IDENTITY;return wt(e,l)}validateBatching(){if(this.dirty===this.cacheDirty||!this.graphicsData.length)return!1;for(let t=0,i=this.graphicsData.length;t<i;t++){const e=this.graphicsData[t],l=e.fillStyle,n=e.lineStyle;if(l&&!l.texture.baseTexture.valid||n&&!n.texture.baseTexture.valid)return!1}return!0}packBatches(){this.batchDirty++;const t=this.batches;for(let i=0,e=t.length;i<e;i++){const l=t[i];for(let n=0;n<l.size;n++){const o=l.start+n;this.indicesUint16[o]=this.indicesUint16[o]-l.attribStart}}}isBatchable(){return!1}buildDrawCalls(t){for(let l=0;l<this.drawCalls.length;l++)this.drawCalls[l].clear(),Q.push(this.drawCalls[l]);this.drawCalls.length=0;let i=Q.pop()||new pt;i.begin(t,null);let e=0;this.drawCalls.push(i);for(let l=0;l<this.batches.length;l++){const n=this.batches[l],o=n.style;if(n.attribSize===0)continue;let r=-1;const h=o.getTextureMatrix();i.check(o.shader)&&(r=i.add(o.texture,h,o.width,o.alignment||0,o.packLineScale())),r<0&&(i=Q.pop()||new pt,this.drawCalls.push(i),i.begin(t,o.shader),i.start=e,r=i.add(o.texture,h,o.width,o.alignment||0,o.packLineScale())),i.size+=n.size,e+=n.size;const{color:f,alpha:a}=o,u=U.shared.setValue(f).toLittleEndianNumber();n.rgba=U.shared.setValue(u).toPremultiplied(a),n.styleId=r}}processHoles(t){for(let i=0;i<t.length;i++){const e=t[i],l=$[e.type];e.clearPath(),l.path(e,this.buildData),e.matrix&&this.transformPoints(e.points,e.matrix)}}calculateBounds(){const t=this._bounds,i=Ae;let e=X.IDENTITY;this._bounds.clear(),i.clear();for(let l=0;l<this.graphicsData.length;l++){const n=this.graphicsData[l],o=n.shape,r=n.type,h=n.lineStyle,f=n.matrix||X.IDENTITY;let a=0;if(h&&h.visible&&(a=h.width,r!==P.POLY||n.fillStyle.visible?a*=Math.max(0,h.alignment):a*=Math.max(h.alignment,1-h.alignment)),e!==f&&(i.isEmpty()||(t.addBoundsMatrix(i,e),i.clear()),e=f),r===P.RECT||r===P.RREC){const u=o;i.addFramePad(u.x,u.y,u.x+u.width,u.y+u.height,a,a)}else if(r===P.CIRC){const u=o;i.addFramePad(u.x,u.y,u.x,u.y,u.radius+a,u.radius+a)}else if(r===P.ELIP){const u=o;i.addFramePad(u.x,u.y,u.x,u.y,u.width+a,u.height+a)}else{const u=o;t.addVerticesMatrix(e,u.points,0,u.points.length,a,a)}}i.isEmpty()||t.addBoundsMatrix(i,e),t.pad(this.boundsPadding,this.boundsPadding)}transformPoints(t,i){for(let e=0;e<t.length/2;e++){const l=t[e*2],n=t[e*2+1];t[e*2]=i.a*l+i.c*n+i.tx,t[e*2+1]=i.b*l+i.d*n+i.ty}}}Pt.BATCHABLE_SIZE=100;const vt=`#version 100
precision highp float;
const float FILL = 1.0;
const float BEVEL = 4.0;
const float MITER = 8.0;
const float ROUND = 12.0;
const float JOINT_CAP_BUTT = 16.0;
const float JOINT_CAP_SQUARE = 18.0;
const float JOINT_CAP_ROUND = 20.0;

const float FILL_EXPAND = 24.0;

const float CAP_BUTT = 1.0;
const float CAP_SQUARE = 2.0;
const float CAP_ROUND = 3.0;
const float CAP_BUTT2 = 4.0;

const float MITER_LIMIT = 10.0;

// === geom ===
attribute vec2 aPrev;
attribute vec2 aPoint1;
attribute vec2 aPoint2;
attribute vec2 aNext;
attribute float aVertexJoint;
attribute float aTravel;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform vec4 tint;

varying vec4 vLine1;
varying vec4 vLine2;
varying vec4 vArc;
varying float vType;

uniform float resolution;
uniform float expand;

// === style ===
attribute float aStyleId;
attribute vec4 aColor;

varying float vTextureId;
varying vec4 vColor;
varying vec2 vTextureCoord;
varying vec2 vTravel;

uniform vec2 styleLine[%MAX_STYLES%];
uniform vec3 styleMatrix[2 * %MAX_STYLES%];
uniform float styleTextureId[%MAX_STYLES%];
uniform vec2 samplerSize[%MAX_TEXTURES%];

vec2 doBisect(vec2 norm, float len, vec2 norm2, float len2,
    float dy, float inner) {
    vec2 bisect = (norm + norm2) / 2.0;
    bisect /= dot(norm, bisect);
    vec2 shift = dy * bisect;
    if (inner > 0.5) {
        if (len < len2) {
            if (abs(dy * (bisect.x * norm.y - bisect.y * norm.x)) > len) {
                return dy * norm;
            }
        } else {
            if (abs(dy * (bisect.x * norm2.y - bisect.y * norm2.x)) > len2) {
                return dy * norm;
            }
        }
    }
    return dy * bisect;
}

void main(void){
    vec2 pointA = (translationMatrix * vec3(aPoint1, 1.0)).xy;
    vec2 pointB = (translationMatrix * vec3(aPoint2, 1.0)).xy;

    vec2 xBasis = pointB - pointA;
    float len = length(xBasis);
    vec2 forward = xBasis / len;
    vec2 norm = vec2(forward.y, -forward.x);

    float type = floor(aVertexJoint / 16.0);
    float vertexNum = aVertexJoint - type * 16.0;
    float dx = 0.0, dy = 1.0;

    float capType = floor(type / 32.0);
    type -= capType * 32.0;

    int styleId = int(aStyleId + 0.5);
    float lineWidth = styleLine[styleId].x;
    vTextureId = floor(styleTextureId[styleId] / 4.0);
    float scaleMode = styleTextureId[styleId] - vTextureId * 4.0;
    float avgScale = 1.0;
    if (scaleMode > 2.5) {
        avgScale = length(translationMatrix * vec3(1.0, 0.0, 0.0));
    } else if (scaleMode > 1.5) {
        avgScale = length(translationMatrix * vec3(0.0, 1.0, 0.0));
    } else if (scaleMode > 0.5) {
        vec2 avgDiag = (translationMatrix * vec3(1.0, 1.0, 0.0)).xy;
        avgScale = sqrt(dot(avgDiag, avgDiag) * 0.5);
    }
    lineWidth *= 0.5 * avgScale;
    float lineAlignment = 2.0 * styleLine[styleId].y - 1.0;
    vTextureCoord = vec2(0.0);

    vec2 pos;

    if (capType == CAP_ROUND) {
        vertexNum += 4.0;
        type = JOINT_CAP_ROUND;
        capType = 0.0;
        lineAlignment = -lineAlignment;
    }

    vLine1 = vec4(0.0, 10.0, 1.0, 0.0);
    vLine2 = vec4(0.0, 10.0, 1.0, 0.0);
    vArc = vec4(0.0);
    if (type == FILL) {
        pos = pointA;
        vType = 0.0;
        vLine2 = vec4(-2.0, -2.0, -2.0, 0.0);
        vec2 vTexturePixel;
        vTexturePixel.x = dot(vec3(aPoint1, 1.0), styleMatrix[styleId * 2]);
        vTexturePixel.y = dot(vec3(aPoint1, 1.0), styleMatrix[styleId * 2 + 1]);
        vTextureCoord = vTexturePixel / samplerSize[int(vTextureId)];
    } else if (type >= FILL_EXPAND && type < FILL_EXPAND + 7.5) {
        // expand vertices
        float flags = type - FILL_EXPAND;
        float flag3 = floor(flags / 4.0);
        float flag2 = floor((flags - flag3 * 4.0) / 2.0);
        float flag1 = flags - flag3 * 4.0 - flag2 * 2.0;

        vec2 prev = (translationMatrix * vec3(aPrev, 1.0)).xy;

        if (vertexNum < 0.5) {
            pos = prev;
        } else if (vertexNum < 1.5) {
            pos = pointA;
        } else {
            pos = pointB;
        }
        float len2 = length(aNext);
        vec2 bisect = (translationMatrix * vec3(aNext, 0.0)).xy;
        if (len2 > 0.01) {
            bisect = normalize(bisect) * len2;
        }

        vec2 n1 = normalize(vec2(pointA.y - prev.y, -(pointA.x - prev.x)));
        vec2 n2 = normalize(vec2(pointB.y - pointA.y, -(pointB.x - pointA.x)));
        vec2 n3 = normalize(vec2(prev.y - pointB.y, -(prev.x - pointB.x)));

        if (n1.x * n2.y - n1.y * n2.x < 0.0) {
            n1 = -n1;
            n2 = -n2;
            n3 = -n3;
        }
        pos += bisect * expand;

        vLine1 = vec4(16.0, 16.0, 16.0, -1.0);
        if (flag1 > 0.5) {
            vLine1.x = -dot(pos - prev, n1);
        }
        if (flag2 > 0.5) {
            vLine1.y = -dot(pos - pointA, n2);
        }
        if (flag3 > 0.5) {
            vLine1.z = -dot(pos - pointB, n3);
        }
        vLine1.xyz *= resolution;
        vType = 2.0;
    } else if (type >= BEVEL) {
        float dy = lineWidth + expand;
        float shift = lineWidth * lineAlignment;
        float inner = 0.0;
        if (vertexNum >= 1.5) {
            dy = -dy;
            inner = 1.0;
        }

        vec2 base, next, xBasis2, bisect;
        float flag = 0.0;
        float side2 = 1.0;
        if (vertexNum < 0.5 || vertexNum > 2.5 && vertexNum < 3.5) {
            next = (translationMatrix * vec3(aPrev, 1.0)).xy;
            base = pointA;
            flag = type - floor(type / 2.0) * 2.0;
            side2 = -1.0;
        } else {
            next = (translationMatrix * vec3(aNext, 1.0)).xy;
            base = pointB;
            if (type >= MITER && type < MITER + 3.5) {
                flag = step(MITER + 1.5, type);
                // check miter limit here?
            }
        }
        xBasis2 = next - base;
        float len2 = length(xBasis2);
        vec2 norm2 = vec2(xBasis2.y, -xBasis2.x) / len2;
        float D = norm.x * norm2.y - norm.y * norm2.x;
        if (D < 0.0) {
            inner = 1.0 - inner;
        }

        norm2 *= side2;

        float collinear = step(0.0, dot(norm, norm2));

        vType = 0.0;
        float dy2 = -1000.0;

        if (abs(D) < 0.01 && collinear < 0.5) {
            if (type >= ROUND && type < ROUND + 1.5) {
                type = JOINT_CAP_ROUND;
            }
            //TODO: BUTT here too
        }

        vLine1 = vec4(0.0, lineWidth, max(abs(norm.x), abs(norm.y)), min(abs(norm.x), abs(norm.y)));
        vLine2 = vec4(0.0, lineWidth, max(abs(norm2.x), abs(norm2.y)), min(abs(norm2.x), abs(norm2.y)));

        if (vertexNum < 3.5) {
            if (abs(D) < 0.01 && collinear < 0.5) {
                pos = (shift + dy) * norm;
            } else {
                if (flag < 0.5 && inner < 0.5) {
                    pos = (shift + dy) * norm;
                } else {
                    pos = doBisect(norm, len, norm2, len2, shift + dy, inner);
                }
            }
            vLine2.y = -1000.0;
            if (capType >= CAP_BUTT && capType < CAP_ROUND) {
                float extra = step(CAP_SQUARE, capType) * lineWidth;
                vec2 back = -forward;
                if (vertexNum < 0.5 || vertexNum > 2.5) {
                    pos += back * (expand + extra);
                    dy2 = expand;
                } else {
                    dy2 = dot(pos + base - pointA, back) - extra;
                }
            }
            if (type >= JOINT_CAP_BUTT && type < JOINT_CAP_SQUARE + 0.5) {
                float extra = step(JOINT_CAP_SQUARE, type) * lineWidth;
                if (vertexNum < 0.5 || vertexNum > 2.5) {
                    vLine2.y = dot(pos + base - pointB, forward) - extra;
                } else {
                    pos += forward * (expand + extra);
                    vLine2.y = expand;
                    if (capType >= CAP_BUTT) {
                        dy2 -= expand + extra;
                    }
                }
            }
        } else if (type >= JOINT_CAP_ROUND && type < JOINT_CAP_ROUND + 1.5) {
            base += shift * norm;
            if (inner > 0.5) {
                dy = -dy;
                inner = 0.0;
            }
            vec2 d2 = abs(dy) * forward;
            if (vertexNum < 4.5) {
                dy = -dy;
                pos = dy * norm;
            } else if (vertexNum < 5.5) {
                pos = dy * norm;
            } else if (vertexNum < 6.5) {
                pos = dy * norm + d2;
                vArc.x = abs(dy);
            } else {
                dy = -dy;
                pos = dy * norm + d2;
                vArc.x = abs(dy);
            }
            vLine2 = vec4(0.0, lineWidth * 2.0 + 10.0, 1.0  , 0.0); // forget about line2 with type=3
            vArc.y = dy;
            vArc.z = 0.0;
            vArc.w = lineWidth;
            vType = 3.0;
        } else if (abs(D) < 0.01 && collinear < 0.5) {
            pos = dy * norm;
        } else {
            if (inner > 0.5) {
                dy = -dy;
                inner = 0.0;
            }
            float side = sign(dy);
            vec2 norm3 = normalize(norm + norm2);

            if (type >= MITER && type < MITER + 3.5) {
                vec2 farVertex = doBisect(norm, len, norm2, len2, shift + dy, 0.0);
                if (length(farVertex) > abs(shift + dy) * MITER_LIMIT) {
                    type = BEVEL;
                }
            }

            if (vertexNum < 4.5) {
                pos = doBisect(norm, len, norm2, len2, shift - dy, 1.0);
            } else if (vertexNum < 5.5) {
                pos = (shift + dy) * norm;
            } else if (vertexNum > 7.5) {
                pos = (shift + dy) * norm2;
            } else {
                if (type >= ROUND && type < ROUND + 1.5) {
                    pos = doBisect(norm, len, norm2, len2, shift + dy, 0.0);
                    float d2 = abs(shift + dy);
                    if (length(pos) > abs(shift + dy) * 1.5) {
                        if (vertexNum < 6.5) {
                            pos.x = (shift + dy) * norm.x - d2 * norm.y;
                            pos.y = (shift + dy) * norm.y + d2 * norm.x;
                        } else {
                            pos.x = (shift + dy) * norm2.x + d2 * norm2.y;
                            pos.y = (shift + dy) * norm2.y - d2 * norm2.x;
                        }
                    }
                } else if (type >= MITER && type < MITER + 3.5) {
                    pos = doBisect(norm, len, norm2, len2, shift + dy, 0.0); //farVertex
                } else if (type >= BEVEL && type < BEVEL + 1.5) {
                    float d2 = side / resolution;
                    if (vertexNum < 6.5) {
                        pos = (shift + dy) * norm + d2 * norm3;
                    } else {
                        pos = (shift + dy) * norm2 + d2 * norm3;
                    }
                }
            }

            if (type >= ROUND && type < ROUND + 1.5) {
                vArc.x = side * dot(pos, norm3);
                vArc.y = pos.x * norm3.y - pos.y * norm3.x;
                vArc.z = dot(norm, norm3) * (lineWidth + side * shift);
                vArc.w = lineWidth + side * shift;
                vType = 3.0;
            } else if (type >= MITER && type < MITER + 3.5) {
                vType = 1.0;
            } else if (type >= BEVEL && type < BEVEL + 1.5) {
                vType = 4.0;
                vArc.z = dot(norm, norm3) * (lineWidth + side * shift) - side * dot(pos, norm3);
            }

            dy = side * (dot(pos, norm) - shift);
            dy2 = side * (dot(pos, norm2) - shift);
        }

        pos += base;
        vLine1.xy = vec2(dy, vLine1.y) * resolution;
        vLine2.xy = vec2(dy2, vLine2.y) * resolution;
        vArc = vArc * resolution;
        vTravel = vec2(aTravel * avgScale + dot(pos - pointA, vec2(-norm.y, norm.x)), avgScale);
    }

    gl_Position = vec4((projectionMatrix * vec3(pos, 1.0)).xy, 0.0, 1.0);

    vColor = aColor * tint;
}`,we=`#version 100
#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif
`,mt=`%PRECISION%
varying vec4 vColor;
varying vec4 vLine1;
varying vec4 vLine2;
varying vec4 vArc;
varying float vType;
varying float vTextureId;
varying vec2 vTextureCoord;
varying vec2 vTravel;
uniform sampler2D uSamplers[%MAX_TEXTURES%];

%PIXEL_LINE%

void main(void){
    %PIXEL_COVERAGE%

    vec4 texColor;
    float textureId = floor(vTextureId+0.5);
    %FOR_LOOP%

    gl_FragColor = vColor * texColor * alpha;
}
`,Ie=[`
float pixelLine(float x, float A, float B) {
    return clamp(x + 0.5, 0.0, 1.0);
}
`,`
float pixelLine(float x, float A, float B) {
    float y = abs(x), s = sign(x);
    if (y * 2.0 < A - B) {
        return 0.5 + s * y / A;
    }
    y -= (A - B) * 0.5;
    y = max(1.0 - y / B, 0.0);
    return (1.0 + s * (1.0 - y * y)) * 0.5;
    //return clamp(x + 0.5, 0.0, 1.0);
}
`],Pe=`float alpha = 1.0;
if (vType < 0.5) {
    float left = pixelLine(-vLine1.y - vLine1.x, vLine1.z, vLine1.w);
    float right = pixelLine(vLine1.y - vLine1.x, vLine1.z, vLine1.w);
    float near = vLine2.x - 0.5;
    float far = min(vLine2.x + 0.5, 0.0);
    float top = vLine2.y - 0.5;
    float bottom = min(vLine2.y + 0.5, 0.0);
    alpha = (right - left) * max(bottom - top, 0.0) * max(far - near, 0.0);
} else if (vType < 1.5) {
    float a1 = pixelLine(- vLine1.y - vLine1.x, vLine1.z, vLine1.w);
    float a2 = pixelLine(vLine1.y - vLine1.x, vLine1.z, vLine1.w);
    float b1 = pixelLine(- vLine2.y - vLine2.x, vLine2.z, vLine2.w);
    float b2 = pixelLine(vLine2.y - vLine2.x, vLine2.z, vLine2.w);
    alpha = a2 * b2 - a1 * b1;
} else if (vType < 2.5) {
    alpha *= max(min(vLine1.x + 0.5, 1.0), 0.0);
    alpha *= max(min(vLine1.y + 0.5, 1.0), 0.0);
    alpha *= max(min(vLine1.z + 0.5, 1.0), 0.0);
} else if (vType < 3.5) {
    float a1 = pixelLine(- vLine1.y - vLine1.x, vLine1.z, vLine1.w);
    float a2 = pixelLine(vLine1.y - vLine1.x, vLine1.z, vLine1.w);
    float b1 = pixelLine(- vLine2.y - vLine2.x, vLine2.z, vLine2.w);
    float b2 = pixelLine(vLine2.y - vLine2.x, vLine2.z, vLine2.w);
    float alpha_miter = a2 * b2 - a1 * b1;
    float alpha_plane = clamp(vArc.z - vArc.x + 0.5, 0.0, 1.0);
    float d = length(vArc.xy);
    float circle_hor = max(min(vArc.w, d + 0.5) - max(-vArc.w, d - 0.5), 0.0);
    float circle_vert = min(vArc.w * 2.0, 1.0);
    float alpha_circle = circle_hor * circle_vert;
    alpha = min(alpha_miter, max(alpha_circle, alpha_plane));
} else {
    float a1 = pixelLine(- vLine1.y - vLine1.x, vLine1.z, vLine1.w);
    float a2 = pixelLine(vLine1.y - vLine1.x, vLine1.z, vLine1.w);
    float b1 = pixelLine(- vLine2.y - vLine2.x, vLine2.z, vLine2.w);
    float b2 = pixelLine(vLine2.y - vLine2.x, vLine2.z, vLine2.w);
    alpha = a2 * b2 - a1 * b1;
    alpha *= clamp(vArc.z + 0.5, 0.0, 1.0);
}
`;class G extends Gt{constructor(t,i=vt,e=mt,l={}){i=G.generateVertexSrc(t,i),e=G.generateFragmentSrc(t,e);const{maxStyles:n,maxTextures:o}=t,r=new Int32Array(o);for(let h=0;h<o;h++)r[h]=h;super(Wt.from(i,e),Object.assign(l,{styleMatrix:new Float32Array(6*n),styleTextureId:new Float32Array(n),styleLine:new Float32Array(2*n),samplerSize:new Float32Array(2*o),uSamplers:r,tint:new Float32Array([1,1,1,1]),resolution:1,expand:1})),this.settings=t}static generateVertexSrc(t,i=vt){const{maxStyles:e,maxTextures:l}=t;return i=i.replace(/%MAX_TEXTURES%/gi,`${l}`).replace(/%MAX_STYLES%/gi,`${e}`),i}static generateFragmentSrc(t,i=mt){const{maxTextures:e,pixelLine:l}=t;return i=i.replace(/%PRECISION%/gi,we).replace(/%PIXEL_LINE%/gi,Ie[l]).replace(/%PIXEL_COVERAGE%/gi,Pe).replace(/%MAX_TEXTURES%/gi,`${e}`).replace(/%FOR_LOOP%/gi,this.generateSampleSrc(e)),i}static generateSampleSrc(t){let i="";i+=`
`,i+=`
`;for(let e=0;e<t;e++)e>0&&(i+=`
else `),e<t-1&&(i+=`if(textureId < ${e}.5)`),i+=`
{`,i+=`
	texColor = texture2D(uSamplers[${e}], vTextureCoord);`,i+=`
}`;return i+=`
`,i+=`
`,i}}const j={LINE_SCALE_MODE:z.NORMAL,SHADER_MAX_STYLES:24,SHADER_MAX_TEXTURES:4,PIXEL_LINE:0},Ne=Tt,{BezierUtils:Ee,QuadraticUtils:Oe,ArcUtils:gt}=me,et={},q=class extends Qt{constructor(s=null){super(),this._geometry=s||new Pt,this._geometry.refCount++,this.shader=null,this.shaderSettings={maxStyles:j.SHADER_MAX_STYLES,maxTextures:j.SHADER_MAX_TEXTURES,pixelLine:j.PIXEL_LINE},this.state=qt.for2d(),this._fillStyle=new Y,this._lineStyle=new nt,this._matrix=null,this._holeMode=!1,this.currentPath=null,this.batches=[],this.batchTint=-1,this.batchDirty=-1,this.vertexData=null,this.pluginName="smooth",this._transformID=-1,this._tintColor=new U(16777215),this.blendMode=bt.NORMAL}get geometry(){return this._geometry}clone(){return this.finishPoly(),new q(this._geometry)}set blendMode(s){this.state.blendMode=s}get blendMode(){return this.state.blendMode}get tint(){return this._tintColor.value}set tint(s){this._tintColor.setValue(s)}get fill(){return this._fillStyle}get line(){return this._lineStyle}lineStyle(s=null,t=0,i=1,e=.5,l=j.LINE_SCALE_MODE){if(typeof s=="number")typeof l=="boolean"&&(l=l?z.NONE:z.NORMAL),s={width:s,color:t,alpha:i,alignment:e,scaleMode:l};else{const n=s.native;n!==void 0&&(s.scaleMode=n?z.NONE:z.NORMAL)}return this.lineTextureStyle(s)}lineTextureStyle(s){s=Object.assign({width:0,texture:J.WHITE,color:s&&s.texture?16777215:0,alpha:1,matrix:null,alignment:.5,native:!1,cap:K.BUTT,join:k.MITER,miterLimit:10,shader:null,scaleMode:j.LINE_SCALE_MODE},s),this.normalizeColor(s),this.currentPath&&this.startPoly();const t=s.width>0&&s.alpha>0;return t?(s.matrix&&(s.matrix=s.matrix.clone(),s.matrix.invert()),Object.assign(this._lineStyle,{visible:t},s)):this._lineStyle.reset(),this}startPoly(){if(this.currentPath){const s=this.currentPath.points,t=this.currentPath.points.length;t>2&&(this.drawShape(this.currentPath),this.currentPath=new tt,this.currentPath.closeStroke=!1,this.currentPath.points.push(s[t-2],s[t-1]))}else this.currentPath=new tt,this.currentPath.closeStroke=!1}finishPoly(){this.currentPath&&(this.currentPath.points.length>2?(this.drawShape(this.currentPath),this.currentPath=null):this.currentPath.points.length=0)}moveTo(s,t){return this.startPoly(),this.currentPath.points[0]=s,this.currentPath.points[1]=t,this}lineTo(s,t){this.currentPath||this.moveTo(0,0);const i=this.currentPath.points,e=i[i.length-2],l=i[i.length-1];return(e!==s||l!==t)&&i.push(s,t),this}_initCurve(s=0,t=0){this.currentPath?this.currentPath.points.length===0&&(this.currentPath.points=[s,t]):this.moveTo(s,t)}quadraticCurveTo(s,t,i,e){this._initCurve();const l=this.currentPath.points;return l.length===0&&this.moveTo(0,0),Oe.curveTo(s,t,i,e,l),this}bezierCurveTo(s,t,i,e,l,n){return this._initCurve(),Ee.curveTo(s,t,i,e,l,n,this.currentPath.points),this}arcTo(s,t,i,e,l){this._initCurve(s,t);const n=this.currentPath.points,o=gt.curveTo(s,t,i,e,l,n);if(o){const{cx:r,cy:h,radius:f,startAngle:a,endAngle:u,anticlockwise:c}=o;this.arc(r,h,f,a,u,c)}return this}arc(s,t,i,e,l,n=!1){if(e===l)return this;if(!n&&l<=e?l+=ht:n&&e<=l&&(e+=ht),l-e===0)return this;const r=s+Math.cos(e)*i,h=t+Math.sin(e)*i,f=this._geometry.closePointEps;let a=this.currentPath?this.currentPath.points:null;if(a){const u=Math.abs(a[a.length-2]-r),c=Math.abs(a[a.length-1]-h);u<f&&c<f||a.push(r,h)}else this.moveTo(r,h),a=this.currentPath.points;return gt.arc(r,h,s,t,i,e,l,n,a),this}beginFill(s=0,t=1,i=!1){return this.beginTextureFill({texture:J.WHITE,color:s,alpha:t,smooth:i})}normalizeColor(s){const t=U.shared.setValue(s.color??0);s.color=t.toNumber(),s.alpha??(s.alpha=t.alpha)}beginTextureFill(s){s=Object.assign({texture:J.WHITE,color:16777215,alpha:1,matrix:null,smooth:!1},s),this.normalizeColor(s),this.currentPath&&this.startPoly();const t=s.alpha>0;return t?(s.matrix&&(s.matrix=s.matrix.clone(),s.matrix.invert()),Object.assign(this._fillStyle,{visible:t},s)):this._fillStyle.reset(),this}endFill(){return this.finishPoly(),this._fillStyle.reset(),this}drawRect(s,t,i,e){return this.drawShape(new Kt(s,t,i,e))}drawRoundedRect(s,t,i,e,l){return this.drawShape(new Zt(s,t,i,e,l))}drawCircle(s,t,i){return this.drawShape(new Yt(s,t,i))}drawEllipse(s,t,i,e){return this.drawShape(new te(s,t,i,e))}drawPolygon(...s){let t,i=!0;const e=s[0];e.points?(i=e.closeStroke,t=e.points):Array.isArray(s[0])?t=s[0]:t=s;const l=new tt(t);return l.closeStroke=i,this.drawShape(l),this}drawShape(s){return this._holeMode?this._geometry.drawHole(s,this._matrix):this._geometry.drawShape(s,this._fillStyle.clone(),this._lineStyle.clone(),this._matrix),this}clear(){return this._geometry.clear(),this._lineStyle.reset(),this._fillStyle.reset(),this._boundsID++,this._matrix=null,this._holeMode=!1,this.currentPath=null,this}isFastRect(){const s=this._geometry.graphicsData;return s.length===1&&s[0].shape.type===P.RECT&&!s[0].matrix&&!s[0].holes.length&&!(s[0].lineStyle.visible&&s[0].lineStyle.width)}_renderCanvas(s){Ne.prototype._renderCanvas.call(this,s)}_render(s){this.finishPoly();const t=this._geometry,i=s.context.supports.uint32Indices;t.checkInstancing(s.geometry.hasInstance,i),t.updateBatches(this.shaderSettings),t.batchable?(this.batchDirty!==t.batchDirty&&this._populateBatches(),this._renderBatched(s)):(s.batch.flush(),this._renderDirect(s))}_populateBatches(){const s=this._geometry,t=this.blendMode,i=s.batches.length;this.batchTint=-1,this._transformID=-1,this.batchDirty=s.batchDirty,this.batches.length=i,this.vertexData=new Float32Array(s.points);for(let e=0;e<i;e++){const l=s.batches[e],n=l.style.color,r={vertexData:new Float32Array(this.vertexData.buffer,l.attribStart*4*2,l.attribSize*2),blendMode:t,_batchRGB:ee(n),_tintRGB:n,_texture:l.style.texture,alpha:l.style.alpha,worldAlpha:1};this.batches[e]=r}}_renderBatched(s){if(this.batches.length){s.batch.setObjectRenderer(s.plugins[this.pluginName]),this.calculateVertices(),this.calculateTints();for(let t=0,i=this.batches.length;t<i;t++){const e=this.batches[t];e.worldAlpha=this.worldAlpha*e.alpha,s.plugins[this.pluginName].render(e)}}}_renderDirect(s){const t=this._resolveDirectShader(s);let i=t;const e=this._geometry,l=this.worldAlpha,n=i.uniforms,o=e.drawCalls;n.translationMatrix=this.transform.worldTransform,U.shared.setValue(this._tintColor).premultiply(l).toArray(n.tint),n.resolution=s.renderTexture.current?s.renderTexture.current.resolution:s.resolution;const r=s.projection.transform;if(r){const f=Math.sqrt(r.a*r.a+r.b*r.b);n.resolution*=f}const h=s.renderTexture.current?s.renderTexture.current.multisample:s.multisample;n.expand=(h!==ie.NONE?2:1)/n.resolution,s.shader.bind(i),s.geometry.bind(e,i),s.state.set(this.state),i=null;for(let f=0,a=o.length;f<a;f++){const u=e.drawCalls[f],c=i!==u.shader;c&&(i=u.shader,i&&(i.uniforms.translationMatrix=this.transform.worldTransform,i.uniforms.tint&&(i.uniforms.tint[0]=n.tint[0],i.uniforms.tint[1]=n.tint[1],i.uniforms.tint[2]=n.tint[2],i.uniforms.tint[3]=n.tint[3])));const{texArray:d,styleArray:x,size:v,start:y}=u,g=d.count,b=i||t,L=b.uniforms.styleTextureId,S=b.uniforms.styleMatrix,A=b.uniforms.styleLine;for(let m=0;m<x.count;m++){L[m]=x.textureIds[m],A[m*2]=x.lines[m*2],A[m*2+1]=x.lines[m*2+1];const I=x.matrices[m];S[m*6]=I.a,S[m*6+1]=I.c,S[m*6+2]=I.tx,S[m*6+3]=I.b,S[m*6+4]=I.d,S[m*6+5]=I.ty}const _=b.uniforms.samplerSize;for(let m=0;m<g;m++)_[m*2]=d.elements[m].width,_[m*2+1]=d.elements[m].height;s.shader.bind(b),c&&s.geometry.bind(e);for(let m=0;m<g;m++)s.texture.bind(d.elements[m],m);s.geometry.draw(se.TRIANGLES,v,y)}}_resolveDirectShader(s){let t=this.shader;const i=this.pluginName;return t||(et[i]||(et[i]=new G(this.shaderSettings)),t=et[i]),t}_calculateBounds(){this.finishPoly();const s=this._geometry;if(!s.graphicsData.length)return;const{minX:t,minY:i,maxX:e,maxY:l}=s.bounds;this._bounds.addFrame(this.transform,t,i,e,l)}containsPoint(s){return this.worldTransform.applyInverse(s,q._TEMP_POINT),this._geometry.containsPoint(q._TEMP_POINT)}calculateTints(){if(this.batchTint!==this.tint){this.batchTint=this._tintColor.toNumber();for(let s=0;s<this.batches.length;s++){const t=this.batches[s];t._tintRGB=U.shared.setValue(this._tintColor).multiply(t._batchRGB).toLittleEndianNumber()}}}calculateVertices(){const s=this.transform._worldID;if(this._transformID===s)return;this._transformID=s;const t=this.transform.worldTransform,i=t.a,e=t.b,l=t.c,n=t.d,o=t.tx,r=t.ty,h=this._geometry.points,f=this.vertexData;let a=0;for(let u=0;u<h.length;u+=2){const c=h[u],d=h[u+1];f[a++]=i*c+l*d+o,f[a++]=n*d+e*c+r}}closePath(){const s=this.currentPath;return s&&(s.closeStroke=!0),this}setMatrix(s){return this._matrix=s,this}beginHole(){return this.finishPoly(),this._holeMode=!0,this}endHole(){return this.finishPoly(),this._holeMode=!1,this}destroy(s){this._geometry.refCount--,this._geometry.refCount===0&&this._geometry.dispose(),this._matrix=null,this.currentPath=null,this._lineStyle.destroy(),this._lineStyle=null,this._fillStyle.destroy(),this._fillStyle=null,this._geometry=null,this.shader=null,this.vertexData=null,this.batches.length=0,this.batches=null,super.destroy(s)}};let rt=q;rt.curves=$t;rt._TEMP_POINT=new H;const Be=`%PRECISION%
varying vec4 vColor;
varying vec4 vLine1;
varying vec4 vLine2;
varying vec4 vArc;
varying float vType;
varying float vTextureId;
varying vec2 vTextureCoord;
varying vec2 vTravel;
uniform sampler2D uSamplers[%MAX_TEXTURES%];
uniform float dash;
uniform float gap;

%PIXEL_LINE%

void main(void){
    %PIXEL_COVERAGE%

    float d = dash * vTravel.y;
    if (d > 0.0) {
        float g = gap * vTravel.y;
        if (g > 0.0) {
            float t = mod(vTravel.x, d + g);
            alpha *= mix(
                min(0.5 * d + 0.5 - abs(t - 0.5 * d), 1.0),
                max(abs(t - 0.5 * g - d) - 0.5 * g + 0.5, 0.0),
                step(d, t)
            );
        }
    } else {
        alpha = 0.0;
    }

    vec4 texColor;
    float textureId = floor(vTextureId+0.5);
    %FOR_LOOP%

    gl_FragColor = vColor * texColor * alpha;
}
`;class Ce extends G{constructor(t){const i={maxStyles:16,maxTextures:1,pixelLine:1};super(i,void 0,Be,t||{dash:8,gap:5})}}const Re={setup(){const s=le(),t=fe();return{userDetailsStore:s,skillTreeStore:t}},data(){return{width:800,height:600,skill:{id:null,children:[],isMastered:null,isUnlocked:null,name:null},tree:{},root:{},isSkillInfoPanelShown:!1,dx:null,dy:null,data:{}}},components:{SkillPanel:pe},async mounted(){this.skillTreeStore.userSkills.length==0&&await this.skillTreeStore.getUserSkills(),this.skill={name:"SKILLS",sprite:null,children:this.skillTreeStore.userSkills};const s=new ye({screenWidth:this.width,screenHeight:this.height,worldWidth:this.width,worldHeight:this.height,events:this.$pixiApp.renderer.events});this.$pixiApp.stage.addChild(s),s.center=new H(100,0),s.setZoom(.1),s.drag({wheelScroll:2,factor:2}).pinch({percent:2,factor:2}).wheel().decelerate().clampZoom({minScale:.001,maxScale:10}),document.querySelector("#skilltree").appendChild(this.$pixiApp.view),this.getAlgorithm()},methods:{getAlgorithm(){var s=[];s=JSON.parse(JSON.stringify(this.skill.children));function t(i){for(var e=i.length;e--;){if(i[e].type=="super"&&i[e].position!="end"){var l=[],n=[];for(let r=0;r<i[e].children.length;r++)i[e].children[r].type=="sub"?l.push(i[e].children[r]):n.push(i[e].children[r]);var o={skill_name:i[e].skill_name,type:"super",position:"end",children:l};i[e].children=[],i[e].children.push(o);for(let r=0;r<n.length;r++)i[e].children.push(n[r])}typeof i[e]<"u"&&i[e].children&&Array.isArray(i[e].children)&&i[e].children.length>0&&t(i[e].children)}}t(s),this.data={skill_name:"My skills",children:s},this.width=8e3,this.root=ut(this.data),this.dx=35,this.dy=this.width/(this.root.height+1),this.tree=dt().nodeSize([this.dx,this.dy]),this.tree(this.root),this.drawTree()},drawTree(){var s=this.root.descendants();const t=this.root.links();for(const i of t)this.drawLink(i);for(const i of s)this.drawNode(i)},drawNode(s){const t=new Tt;t.lineStyle(0),t.beginFill(0,1),t.drawCircle(s.y,s.x,15),t.endFill(),this.$pixiApp.stage.children[0].addChild(t),t.eventMode="static",t.cursor="pointer",t.on("pointerdown",l=>{var n={id:s.data.id,isMastered:s.data.is_mastered,isUnlocked:s.data.is_accessible,name:s.data.skill_name};this.skill=n,this.isSkillInfoPanelShown||this.showInfoPanel()});const i=new re({fontFamily:"Arial",fontSize:12,fill:"#000",stroke:"#fff",strokeThickness:3}),e=new ae(s.data.skill_name,i);e.anchor.set(0,.5),e.x=s.y+15,e.y=s.x,this.$pixiApp.stage.children[0].addChild(e)},drawLink(s){var i=ft().x(f=>f.y).y(f=>f.x)(s),e=i.substring(i.indexOf("M")+1,i.lastIndexOf("C"));const l=e.split(",");var n=i.split("C")[1],o=n.split(",");const r=new rt;var h;if(s.target.data.is_mastered==1?h=4:h=2,s.source.data.type=="super"&&s.target.data.position=="end"||s.target.data.type=="sub"){const f=new Ce({dash:5,gap:8});r.lineStyle({width:h,color:0,shader:f})}else r.lineStyle({width:h,color:0});r.position.x=l[0],r.position.y=l[1],r.bezierCurveTo(o[0]-l[0],o[1]-l[1],o[2]-l[0],o[3]-l[1],o[4]-l[0],o[5]-l[1]),this.$pixiApp.stage.children[0].addChild(r)},showInfoPanel(){this.isSkillInfoPanelShown||(this.isSkillInfoPanelShown=!0,screen.width>800?document.getElementById("skillInfoPanel").style.width="474px":document.getElementById("skillInfoPanel").style.height="474px",this.skill.isMastered=="1"?document.getElementById("mastery-checkbox").checked=!0:document.getElementById("mastery-checkbox").checked=!1)},hideInfoPanel(){this.isSkillInfoPanelShown&&(screen.width>800?document.getElementById("skillInfoPanel").style.width="0px":document.getElementById("skillInfoPanel").style.height="0px",document.getElementById("sidepanel-backdrop").style.display="none",this.isSkillInfoPanelShown=!1)},async printPDF(){await this.createSVGTree();var s=document.getElementById("linearTree"),t=xe(s),i=t.node(),e=new XMLSerializer,l=e.serializeToString(i),n={svg:l,treeType:"linear"},o=JSON.stringify(n),r=new XMLHttpRequest;r.responseType="arraybuffer",r.open("POST","/skilltree/print-pdf",!0),r.setRequestHeader("Content-type","application/json;charset=UTF-8"),r.setRequestHeader("Accept","application/json, text/plain, */*"),r.send(o),r.onload=function(){if(this.readyState==4&&this.status==200){let f=new Blob([r.response],{type:"application/pdf"});const a=window.URL.createObjectURL(f);var h=document.createElement("a");document.body.appendChild(h),h.style="display: none",h.href=a,h.download="My-Skill-Tree.pdf",h.click(),window.URL.revokeObjectURL(a)}}},createSVGTree(){const s=ut(this.data),t=15,i=this.width/(s.height+1);dt().nodeSize([t,i])(s);let l=1/0,n=-l;s.each(a=>{a.x>n&&(n=a.x),a.x<l&&(l=a.x)});const o=n-l+this.dx*2;let r=ve("svg").attr("id","linearTree").attr("width",this.width).attr("height",o).attr("viewBox",[-i/3,l-t,this.width,o]).attr("style","max-width: 100%; height: auto; font: 10px sans-serif;");const h=r.append("g");h.append("g").attr("fill","none").attr("stroke-opacity",1).selectAll().data(s.links()).join("path").attr("d",ft().x(a=>a.y).y(a=>a.x)).attr("stroke",function(a){return"#000"}).attr("stroke-width",function(a){return a.target.data.is_mastered==1?8:1.5}).style("stroke-dasharray",function(a){if(a.source.data.type=="super"&&a.target.data.position=="end"||a.target.data.type=="sub")return 5});const f=h.append("g").attr("stroke-linejoin","round").attr("stroke-width",3).selectAll().data(s.descendants()).join("g").attr("transform",a=>`translate(${a.y},${a.x})`);f.append("circle").attr("fill",a=>a.children?"#555":"#000").attr("r",2.5),f.append("text").style("font-weight",function(a){return a.data.type=="super"?"700":"400"}).style("font-style",function(a){if(a.data.type=="sub")return"italic"}).attr("dy","0.31em").attr("x",a=>a.children?-6:6).attr("text-anchor",a=>a.children?"end":"start").text(function(a){return a.data.position=="end"?"":a.data.skill_name}).clone(!0).lower().attr("stroke",function(a){return"white"}),document.querySelector("#SVGskilltree").append(r.node())}}},at=s=>(he("data-v-3ba3a0a7"),s=s(),ce(),s),Me={id:"wrapper"},De=at(()=>R("div",{id:"skilltree"},null,-1)),ke=at(()=>R("div",{id:"SVGskilltree"},null,-1)),Ue=at(()=>R("div",{id:"sidepanel-backdrop"},null,-1));function ze(s,t,i,e,l,n){const o=oe("SkillPanel");return it(),Lt(At,null,[R("button",{id:"print-btn",class:"btn btn-info",onClick:t[0]||(t[0]=r=>n.printPDF())}," Print "),R("div",Me,[St(o,{skill:l.skill},null,8,["skill"]),De,ke,Ue])],64)}const Fe=ne(Re,[["render",ze],["__scopeId","data-v-3ba3a0a7"]]);const Ve=R("div",{id:"purple-banner"},null,-1),je=R("span",null,"Loading...",-1),qe={__name:"PixiTidyTreeView",setup(s){return(t,i)=>(it(),Lt(At,null,[Ve,(it(),ue(de,null,{default:ct(()=>[St(Fe)]),fallback:ct(()=>[je]),_:1}))],64))}};export{qe as default};
