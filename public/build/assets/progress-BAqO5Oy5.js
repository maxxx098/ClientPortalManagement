import{a as c,c as I}from"./createLucideIcon-Cj-60cLs.js";import{r as v,j as i}from"./app-2bThjdGw.js";import{c as _}from"./index-BuMaAU40.js";import{P as f}from"./index-nJaiqGQS.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]],z=c("Image",b);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],G=c("Info",$);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=[["rect",{x:"3",y:"5",width:"6",height:"6",rx:"1",key:"1defrl"}],["path",{d:"m3 17 2 2 4-4",key:"1jhpwq"}],["path",{d:"M13 6h8",key:"15sg57"}],["path",{d:"M13 12h8",key:"h98zly"}],["path",{d:"M13 18h8",key:"oe0vm4"}]],X=c("ListTodo",M);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=[["path",{d:"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",key:"vktsd0"}],["circle",{cx:"7.5",cy:"7.5",r:".5",fill:"currentColor",key:"kqv944"}]],F=c("Tag",w);var d="Progress",u=100,[L,H]=_(d),[j,E]=L(d),g=v.forwardRef((e,r)=>{const{__scopeProgress:n,value:o=null,max:a,getValueLabel:P=T,...N}=e;(a||a===0)&&!p(a)&&console.error(R(`${a}`,"Progress"));const t=p(a)?a:u;o!==null&&!m(o,t)&&console.error(A(`${o}`,"Progress"));const s=m(o,t)?o:null,k=l(s)?P(s,t):void 0;return i.jsx(j,{scope:n,value:s,max:t,children:i.jsx(f.div,{"aria-valuemax":t,"aria-valuemin":0,"aria-valuenow":l(s)?s:void 0,"aria-valuetext":k,role:"progressbar","data-state":y(s,t),"data-value":s??void 0,"data-max":t,...N,ref:r})})});g.displayName=d;var x="ProgressIndicator",h=v.forwardRef((e,r)=>{const{__scopeProgress:n,...o}=e,a=E(x,n);return i.jsx(f.div,{"data-state":y(a.value,a.max),"data-value":a.value??void 0,"data-max":a.max,...o,ref:r})});h.displayName=x;function T(e,r){return`${Math.round(e/r*100)}%`}function y(e,r){return e==null?"indeterminate":e===r?"complete":"loading"}function l(e){return typeof e=="number"}function p(e){return l(e)&&!isNaN(e)&&e>0}function m(e,r){return l(e)&&!isNaN(e)&&e<=r&&e>=0}function R(e,r){return`Invalid prop \`max\` of value \`${e}\` supplied to \`${r}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${u}\`.`}function A(e,r){return`Invalid prop \`value\` of value \`${e}\` supplied to \`${r}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${u} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`}var V=g,C=h;function U({className:e,value:r,...n}){return i.jsx(V,{"data-slot":"progress",className:I("bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",e),...n,children:i.jsx(C,{"data-slot":"progress-indicator",className:"bg-primary h-full w-full flex-1 transition-all",style:{transform:`translateX(-${100-(r||0)}%)`}})})}export{z as I,X as L,U as P,F as T,G as a};
