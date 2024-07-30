"use strict";sap.ui.define(["sap/ui/base/ManagedObject","sap/base/Log","sap/m/MessageBox","sap/ui/base/ObjectPool","sap/ui/base/Event"],function(e,t,r,n,o){"use strict";const a=e.extend("cc.spreadsheetimporter.v1_1_1.Util",{constructor:function t(r){e.prototype.constructor.call(this);this.resourceBundle=r},geti18nText:function e(t,r){return this.resourceBundle.getText(t,r)}});a.getValueFromRow=function e(r,n,o,a){let c;if(a==="label"){c=r[n]}if(a==="labelTypeBrackets"){try{c=Object.entries(r).find(e=>{let[t]=e;return t.includes(`[${o}]`)})[1]}catch(e){t.debug(`Not found ${o}`,undefined,"SpreadsheetUpload: Util")}}return c};a.changeDecimalSeperator=function e(t){t=t.replace(/[.]/g,"");t=t.replace(/[,]/g,".");return parseFloat(t)};a.sleep=function e(t){return new Promise(e=>setTimeout(e,t))};a.showError=function e(n,o,a){let c="";let s="";try{if(n.stack){s=n.message;const e=/(http[s]?:\/\/[^\s]+):(\d+):(\d+)/g;let t=n.stack.replace(e,'<a href="$1" target="_blank" class="sapMLnk">$1</a>:<span class="line-no">$2:$3</span>').replace(/\n/g,"<br/>");c=t}else{const e=JSON.parse(n.responseText);s=e.error.message.value;c=e}}catch(n){s="Generic Error";c=n}t.error(s,n,`${o}.${a}`);r.error(s,{details:c,initialFocus:r.Action.CLOSE,actions:[r.Action.OK]})};a.showErrorMessage=function e(n,o,a){t.error(n,`${o}.${a}`);r.error(n,{initialFocus:r.Action.CLOSE,actions:[r.Action.CANCEL]})};a.getBrowserDecimalAndThousandSeparators=function e(t){let r="";let n="";if(t===","){n=".";r=",";return{thousandSeparator:n,decimalSeparator:r}}if(t==="."){n=",";r=".";return{decimalSeparator:r,thousandSeparator:n}}const o=12345.6789;const a=new Intl.NumberFormat(navigator.language).format(o);const c=a.replace(/\d/g,"");r=c.charAt(c.length-1);n=c.charAt(0);return{decimalSeparator:r,thousandSeparator:n}};a.normalizeNumberString=function e(t,r){const{decimalSeparator:n,thousandSeparator:o}=this.getBrowserDecimalAndThousandSeparators(r.getDecimalSeparator());const a=t.replace(new RegExp(`\\${o}`,"g"),"");const c=a.replace(n,".");return c};a.getRandomString=function e(t){const r="ABCDEFGHIJKLMNOPQRSTUVWXYZ";let n="";for(let e=0;e<t;e++){const e=Math.floor(Math.random()*r.length);n+=r.charAt(e)}return n};a.stringify=function e(t){const r=new WeakSet;return JSON.stringify(t,(e,t)=>{if(typeof t==="object"&&t!==null){if(r.has(t)){return}r.add(t);const e=Object.keys(t);if(e.every(e=>typeof t[e]!=="object"||t[e]===null)){let e={};for(let r in t){if(typeof t[r]!=="object"||t[r]===null){e[r]=t[r]}}return e}}return t})};a.extractObjects=function e(t){return t.map(e=>e.getObject())};a.downloadSpreadsheetFile=function e(t,r){const n=new Blob([t],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});const o=URL.createObjectURL(n);const a=document.createElement("a");a.href=o;a.download=r;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(o)};a.loadUI5RessourceAsync=async function e(t){return new Promise(function(e,r){sap.ui.require([t],function(t){e(t)},function(e){r(e)})})};a.fireEventAsync=async function e(r,a,c){let s,i,l=[];const u=new n(o);s=c.mEventRegistry[r];if(Array.isArray(s)){s=s.slice();i=u.borrowObject(r,c,a);for(let e of s){try{l.push(e.fFunction.call(null,i))}catch(e){t.error("Error in event handler:",e)}}}await Promise.all(l);return{bPreventDefault:i?.bPreventDefault,mParameters:i?.mParameters,returnValue:l[0]}};return a});
//# sourceMappingURL=Util.js.map