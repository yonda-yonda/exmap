"use strict";(self.webpackChunkexmap=self.webpackChunkexmap||[]).push([[482],{5761:function(r,t,e){e.d(t,{Z:function(){return h}});var n=e(5861),o=e(5671),a=e(3144),i=e(7757),c=e.n(i);function u(r,t){var e=r.length-t,n=0;do{for(var o=t;o>0;o--)r[n+t]+=r[n],n++;e-=t}while(e>0)}function f(r,t,e){for(var n=0,o=r.length,a=o/e;o>t;){for(var i=t;i>0;--i)r[n+t]+=r[n],++n;o-=t}for(var c=r.slice(),u=0;u<a;++u)for(var f=0;f<e;++f)r[e*u+f]=c[(e-f-1)*a+u]}function s(r,t,e,n,o,a){if(!t||1===t)return r;for(var i=0;i<o.length;++i){if(o[i]%8!=0)throw new Error("When decoding with predictor, only multiple of 8 bits are supported.");if(o[i]!==o[0])throw new Error("When decoding with predictor, all samples must have the same size.")}for(var c=o[0]/8,s=2===a?1:o.length,h=0;h<n&&!(h*s*e*c>=r.byteLength);++h){var l=void 0;if(2===t){switch(o[0]){case 8:l=new Uint8Array(r,h*s*e*c,s*e*c);break;case 16:l=new Uint16Array(r,h*s*e*c,s*e*c/2);break;case 32:l=new Uint32Array(r,h*s*e*c,s*e*c/4);break;default:throw new Error("Predictor 2 not allowed with ".concat(o[0]," bits per sample."))}u(l,s)}else 3===t&&f(l=new Uint8Array(r,h*s*e*c,s*e*c),s,c)}return r}var h=function(){function r(){(0,o.Z)(this,r)}var t;return(0,a.Z)(r,[{key:"decode",value:(t=(0,n.Z)(c().mark((function r(t,e){var n,o,a,i,u;return c().wrap((function(r){for(;;)switch(r.prev=r.next){case 0:return r.next=2,this.decodeBlock(e);case 2:if(n=r.sent,1===(o=t.Predictor||1)){r.next=9;break}return a=!t.StripOffsets,i=a?t.TileWidth:t.ImageWidth,u=a?t.TileLength:t.RowsPerStrip||t.ImageLength,r.abrupt("return",s(n,o,i,u,t.BitsPerSample,t.PlanarConfiguration));case 9:return r.abrupt("return",n);case 10:case"end":return r.stop()}}),r,this)}))),function(r,e){return t.apply(this,arguments)})}]),r}()},1482:function(r,t,e){e.r(t),e.d(t,{default:function(){return l}});var n=e(5671),o=e(3144),a=e(136),i=e(6215),c=e(1120),u=e(5761);function f(r){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(r){return!1}}();return function(){var e,n=(0,c.Z)(r);if(t){var o=(0,c.Z)(this).constructor;e=Reflect.construct(n,arguments,o)}else e=n.apply(this,arguments);return(0,i.Z)(this,e)}}function s(r,t){for(var e=t.length-1;e>=0;e--)r.push(t[e]);return r}function h(r){for(var t=new Uint16Array(4093),e=new Uint8Array(4093),n=0;n<=257;n++)t[n]=4096,e[n]=n;var o=258,a=9,i=0;function c(){o=258,a=9}function u(r){var t=function(r,t,e){var n=t%8,o=Math.floor(t/8),a=8-n,i=t+e-8*(o+1),c=8*(o+2)-(t+e),u=8*(o+2)-t;if(c=Math.max(0,c),o>=r.length)return console.warn("ran off the end of the buffer before finding EOI_CODE (end on input code)"),257;var f=r[o]&Math.pow(2,8-n)-1,s=f<<=e-a;if(o+1<r.length){var h=r[o+1]>>>c;s+=h<<=Math.max(0,e-u)}if(i>8&&o+2<r.length){var l=8*(o+3)-(t+e);s+=r[o+2]>>>l}return s}(r,i,a);return i+=a,t}function f(r,n){return e[o]=n,t[o]=r,++o-1}function h(r){for(var n=[],o=r;4096!==o;o=t[o])n.push(e[o]);return n}var l=[];c();for(var p,v=new Uint8Array(r),d=u(v);257!==d;){if(256===d){for(c(),d=u(v);256===d;)d=u(v);if(257===d)break;if(d>256)throw new Error("corrupted code at scanline ".concat(d));s(l,h(d)),p=d}else if(d<o){var w=h(d);s(l,w),f(p,w[w.length-1]),p=d}else{var y=h(p);if(!y)throw new Error("Bogus entry. Not in dictionary, ".concat(p," / ").concat(o,", position: ").concat(i));s(l,y),l.push(y[y.length-1]),f(p,y[y.length-1]),p=d}o+1>=Math.pow(2,a)&&(12===a?p=void 0:a++),d=u(v)}return new Uint8Array(l)}var l=function(r){(0,a.Z)(e,r);var t=f(e);function e(){return(0,n.Z)(this,e),t.apply(this,arguments)}return(0,o.Z)(e,[{key:"decodeBlock",value:function(r){return h(r).buffer}}]),e}(u.Z)}}]);
//# sourceMappingURL=482-1d8c2ba1ba3eafe90630.js.map