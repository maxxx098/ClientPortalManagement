import{r as s}from"./app-Hd9kF6Da.js";function i(r){var e,o,t="";if(typeof r=="string"||typeof r=="number")t+=r;else if(typeof r=="object")if(Array.isArray(r)){var n=r.length;for(e=0;e<n;e++)r[e]&&(o=i(r[e]))&&(t&&(t+=" "),t+=o)}else for(o in r)r[o]&&(t&&(t+=" "),t+=o);return t}function y(){for(var r,e,o=0,t="",n=arguments.length;o<n;o++)(r=arguments[o])&&(e=i(r))&&(t&&(t+=" "),t+=e);return t}/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=r=>r.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),c=(...r)=>r.filter((e,o,t)=>!!e&&e.trim()!==""&&t.indexOf(e)===o).join(" ").trim();/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var d={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=s.forwardRef(({color:r="currentColor",size:e=24,strokeWidth:o=2,absoluteStrokeWidth:t,className:n="",children:a,iconNode:u,...f},l)=>s.createElement("svg",{ref:l,...d,width:e,height:e,stroke:r,strokeWidth:t?Number(o)*24/Number(e):o,className:c("lucide",n),...f},[...u.map(([m,g])=>s.createElement(m,g)),...Array.isArray(a)?a:[a]]));/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=(r,e)=>{const o=s.forwardRef(({className:t,...n},a)=>s.createElement(w,{ref:a,iconNode:e,className:c(`lucide-${p(r)}`,t),...n}));return o.displayName=`${r}`,o};export{y as a,b as c};
