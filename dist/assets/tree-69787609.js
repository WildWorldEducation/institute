import{N as k}from"./transform-7ae49b6e.js";function o(r,n){return r.parent===n.parent?1:2}function S(r){var n=r.children;return n?n[0]:r.t}function B(r){var n=r.children;return n?n[n.length-1]:r.t}function R(r,n,a){var i=a/(n.i-r.i);n.c-=i,n.s+=a,r.c+=i,n.z+=a,n.m+=a}function W(r){for(var n=0,a=0,i=r.children,u=i.length,s;--u>=0;)s=i[u],s.z+=n,s.m+=n,n+=s.s+(a+=s.c)}function b(r,n,a){return r.a.parent===n.parent?r.a:a}function A(r,n){this._=r,this.parent=null,this.children=null,this.A=null,this.a=this,this.z=0,this.m=0,this.c=0,this.s=0,this.t=null,this.i=n}A.prototype=Object.create(k.prototype);function j(r){for(var n=new A(r,0),a,i=[n],u,s,x,y;a=i.pop();)if(s=a._.children)for(a.children=new Array(y=s.length),x=y-1;x>=0;--x)i.push(u=a.children[x]=new A(s[x],x)),u.parent=a;return(n.parent=new A(null,0)).children=[n],n}function L(){var r=o,n=1,a=1,i=null;function u(e){var f=j(e);if(f.eachAfter(s),f.parent.m=-f.z,f.eachBefore(x),i)e.eachBefore(w);else{var d=e,t=e,c=e;e.eachBefore(function(l){l.x<d.x&&(d=l),l.x>t.x&&(t=l),l.depth>c.depth&&(c=l)});var h=d===t?1:r(d,t)/2,z=h-d.x,g=n/(t.x+h+z),_=a/(c.depth||1);e.eachBefore(function(l){l.x=(l.x+z)*g,l.y=l.depth*_})}return e}function s(e){var f=e.children,d=e.parent.children,t=e.i?d[e.i-1]:null;if(f){W(e);var c=(f[0].z+f[f.length-1].z)/2;t?(e.z=t.z+r(e._,t._),e.m=e.z-c):e.z=c}else t&&(e.z=t.z+r(e._,t._));e.parent.A=y(e,t,e.parent.A||d[0])}function x(e){e._.x=e.z+e.parent.m,e.m+=e.parent.m}function y(e,f,d){if(f){for(var t=e,c=e,h=f,z=t.parent.children[0],g=t.m,_=c.m,l=h.m,N=z.m,p;h=B(h),t=S(t),h&&t;)z=S(z),c=B(c),c.a=e,p=h.z+l-t.z-g+r(h._,t._),p>0&&(R(b(h,e,d),e,p),g+=p,_+=p),l+=h.m,g+=t.m,N+=z.m,_+=c.m;h&&!B(c)&&(c.t=h,c.m+=l-_),t&&!S(z)&&(z.t=t,z.m+=g-N,d=e)}return d}function w(e){e.x*=n,e.y=e.depth*a}return u.separation=function(e){return arguments.length?(r=e,u):r},u.size=function(e){return arguments.length?(i=!1,n=+e[0],a=+e[1],u):i?null:[n,a]},u.nodeSize=function(e){return arguments.length?(i=!0,n=+e[0],a=+e[1],u):i?[n,a]:null},u}export{L as t};