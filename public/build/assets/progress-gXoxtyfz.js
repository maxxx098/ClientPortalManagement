import{a as u,c as b}from"./createLucideIcon-DNcdlP6E.js";import{r as v,j as i}from"./app-Bnkg_R6e.js";import{c as _}from"./index-C93J2Ucv.js";import{P as f}from"./index-C0YS4r49.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]],G=u("Image",$);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],X=u("Info",k);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=[["path",{d:"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",key:"vktsd0"}],["circle",{cx:"7.5",cy:"7.5",r:".5",fill:"currentColor",key:"kqv944"}]],q=u("Tag",M);var c="Progress",d=100,[E,z]=_(c),[j,w]=E(c),g=v.forwardRef((r,e)=>{const{__scopeProgress:n,value:o=null,max:a,getValueLabel:h=R,...N}=r;(a||a===0)&&!p(a)&&console.error(A(`${a}`,"Progress"));const t=p(a)?a:d;o!==null&&!m(o,t)&&console.error(L(`${o}`,"Progress"));const s=m(o,t)?o:null,I=l(s)?h(s,t):void 0;return i.jsx(j,{scope:n,value:s,max:t,children:i.jsx(f.div,{"aria-valuemax":t,"aria-valuemin":0,"aria-valuenow":l(s)?s:void 0,"aria-valuetext":I,role:"progressbar","data-state":y(s,t),"data-value":s??void 0,"data-max":t,...N,ref:e})})});g.displayName=c;var x="ProgressIndicator",P=v.forwardRef((r,e)=>{const{__scopeProgress:n,...o}=r,a=w(x,n);return i.jsx(f.div,{"data-state":y(a.value,a.max),"data-value":a.value??void 0,"data-max":a.max,...o,ref:e})});P.displayName=x;function R(r,e){return`${Math.round(r/e*100)}%`}function y(r,e){return r==null?"indeterminate":r===e?"complete":"loading"}function l(r){return typeof r=="number"}function p(r){return l(r)&&!isNaN(r)&&r>0}function m(r,e){return l(r)&&!isNaN(r)&&r<=e&&r>=0}function A(r,e){return`Invalid prop \`max\` of value \`${r}\` supplied to \`${e}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${d}\`.`}function L(r,e){return`Invalid prop \`value\` of value \`${r}\` supplied to \`${e}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${d} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`}var T=g,V=P;function F({className:r,value:e,...n}){return i.jsx(T,{"data-slot":"progress",className:b("bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",r),...n,children:i.jsx(V,{"data-slot":"progress-indicator",className:"bg-primary h-full w-full flex-1 transition-all",style:{transform:`translateX(-${100-(e||0)}%)`}})})}export{G as I,F as P,q as T,X as a};
