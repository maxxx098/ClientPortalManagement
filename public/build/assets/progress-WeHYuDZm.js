import{a as u,c as I}from"./createLucideIcon-B_bktm_V.js";import{r as v,j as i}from"./app-Ck5WeuDF.js";import{c as _}from"./index-CN8Djskw.js";import{P as f}from"./index-_ENhd-2p.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]],q=u("Image",$);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=[["rect",{x:"3",y:"5",width:"6",height:"6",rx:"1",key:"1defrl"}],["path",{d:"m3 17 2 2 4-4",key:"1jhpwq"}],["path",{d:"M13 6h8",key:"15sg57"}],["path",{d:"M13 12h8",key:"h98zly"}],["path",{d:"M13 18h8",key:"oe0vm4"}]],z=u("ListTodo",k);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=[["path",{d:"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",key:"vktsd0"}],["circle",{cx:"7.5",cy:"7.5",r:".5",fill:"currentColor",key:"kqv944"}]],G=u("Tag",M);var d="Progress",c=100,[w,X]=_(d),[L,j]=w(d),g=v.forwardRef((r,e)=>{const{__scopeProgress:n,value:t=null,max:a,getValueLabel:P=E,...N}=r;(a||a===0)&&!p(a)&&console.error(T(`${a}`,"Progress"));const o=p(a)?a:c;t!==null&&!m(t,o)&&console.error(R(`${t}`,"Progress"));const s=m(t,o)?t:null,b=l(s)?P(s,o):void 0;return i.jsx(L,{scope:n,value:s,max:o,children:i.jsx(f.div,{"aria-valuemax":o,"aria-valuemin":0,"aria-valuenow":l(s)?s:void 0,"aria-valuetext":b,role:"progressbar","data-state":y(s,o),"data-value":s??void 0,"data-max":o,...N,ref:e})})});g.displayName=d;var x="ProgressIndicator",h=v.forwardRef((r,e)=>{const{__scopeProgress:n,...t}=r,a=j(x,n);return i.jsx(f.div,{"data-state":y(a.value,a.max),"data-value":a.value??void 0,"data-max":a.max,...t,ref:e})});h.displayName=x;function E(r,e){return`${Math.round(r/e*100)}%`}function y(r,e){return r==null?"indeterminate":r===e?"complete":"loading"}function l(r){return typeof r=="number"}function p(r){return l(r)&&!isNaN(r)&&r>0}function m(r,e){return l(r)&&!isNaN(r)&&r<=e&&r>=0}function T(r,e){return`Invalid prop \`max\` of value \`${r}\` supplied to \`${e}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${c}\`.`}function R(r,e){return`Invalid prop \`value\` of value \`${r}\` supplied to \`${e}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${c} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`}var A=g,V=h;function F({className:r,value:e,...n}){return i.jsx(A,{"data-slot":"progress",className:I("bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",r),...n,children:i.jsx(V,{"data-slot":"progress-indicator",className:"bg-primary h-full w-full flex-1 transition-all",style:{transform:`translateX(-${100-(e||0)}%)`}})})}export{q as I,z as L,F as P,G as T};
