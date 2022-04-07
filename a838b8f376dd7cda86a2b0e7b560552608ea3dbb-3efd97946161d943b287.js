"use strict";(self.webpackChunkexmap=self.webpackChunkexmap||[]).push([[437],{32174:function(t,n,r){Object.defineProperty(n,"__esModule",{value:!0}),Object.defineProperty(n,"default",{enumerable:!0,get:function(){return i.createSvgIcon}});var i=r(22617)},22617:function(t,n,r){r.r(n),r.d(n,{capitalize:function(){return i.Z},createChainedFunction:function(){return a.Z},createSvgIcon:function(){return e.Z},debounce:function(){return o.Z},deprecatedPropType:function(){return u},isMuiElement:function(){return s.Z},ownerDocument:function(){return l.Z},ownerWindow:function(){return h.Z},requirePropFactory:function(){return c},setRef:function(){return f},unstable_ClassNameGenerator:function(){return _.Z},unstable_useEnhancedEffect:function(){return p.Z},unstable_useId:function(){return d.Z},unsupportedProp:function(){return v},useControlled:function(){return M.Z},useEventCallback:function(){return g.Z},useForkRef:function(){return m.Z},useIsFocusVisible:function(){return w.Z}});var i=r(49240),a=r(95626),e=r(12067),o=r(95152);var u=function(t,n){return function(){return null}},s=r(63128),l=r(79072),h=r(9217);r(87462);var c=function(t,n){return function(){return null}},f=r(96386).Z,p=r(94026),d=r(62152);var v=function(t,n,r,i,a){return null},M=r(42583),g=r(10955),m=r(65973),w=r(96698),_=r(86756)},13089:function(t,n,r){Object.defineProperty(n,"__esModule",{value:!0}),n.validLinearRing=n.validPoints=n.validPoint=n.validNumber=void 0;var i=r(29378);function a(t){if("number"!=typeof t||t-t!=0)throw new i.InvalidNumberError}function e(t){try{if(!Array.isArray(t))throw new Error;if(t.length<2)throw new Error;t.forEach((function(t){a(t)}))}catch(n){throw new i.InvalidPointError}}function o(t){try{if(!Array.isArray(t))throw new Error;t.forEach((function(t){e(t)}))}catch(n){throw new i.InvalidPointsError}}n.validNumber=a,n.validPoint=e,n.validPoints=o,n.validLinearRing=function(t){try{if(o(t),t.length<=3||t[0][0]!==t[t.length-1][0]||t[0][1]!==t[t.length-1][1])throw new Error}catch(n){throw new i.InvalidLinearRingError}}},12947:function(t,n,r){Object.defineProperty(n,"__esModule",{value:!0}),n.linearInterpolationPoints=n.linearInterpolationY=n.linearInterpolationX=void 0;var i=r(13089),a=r(46150);function e(t,n,r){return(0,i.validPoint)(t),(0,i.validPoint)(n),(0,a._eq)(t[0],n[0])?t[1]:t[1]+(r-t[0])*(n[1]-t[1])/(n[0]-t[0])}n.linearInterpolationX=function(t,n,r){return(0,i.validPoint)(t),(0,i.validPoint)(n),(0,a._eq)(t[1],n[1])?t[0]:t[0]+(r-t[1])*(n[0]-t[0])/(n[1]-t[1])},n.linearInterpolationY=e;var o=function(t,n,r,i){var o=Math.floor(i);if((0,a._eq)(n[0],r[0]))return[n[0],n[1]+t*(r[1]-n[1])/(o+1)];if((0,a._eq)(n[1],r[1]))return[n[0]+t*(r[0]-n[0])/(o+1),n[1]];var u=n[0]+t*(r[0]-n[0])/(o+1);return[u,e(n,r,u)]};n.linearInterpolationPoints=function(t,n,r){void 0===r&&(r={}),(0,i.validPoint)(t),(0,i.validPoint)(n);var a=Object.assign({partition:0},r);if((0,i.validNumber)(a.partition),a.partition<=0)return[t,n];for(var e=[],u=0;u<a.partition+1;u++)e.push(o(u,t,n,a.partition));return e.push(n),e}},89668:function(t,n){Object.defineProperty(n,"__esModule",{value:!0}),n.FLATTENING_WGS84=n.SEMEMAJOR_AXIS_WGS84=n.CRS_ANTARCTIC_POLAR_STEROGRAPHIC=n.CRS_ARCTIC_POLAR_STEROGRAPHIC=n.CRS_EPSG4326=n.EPSILON=void 0,n.EPSILON=1e-8,n.CRS_EPSG4326="+proj=longlat +datum=WGS84 +no_defs ",n.CRS_ARCTIC_POLAR_STEROGRAPHIC="+proj=stere +lat_0=90 +lat_ts=71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs ",n.CRS_ANTARCTIC_POLAR_STEROGRAPHIC="+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs ",n.SEMEMAJOR_AXIS_WGS84=6378137,n.FLATTENING_WGS84=298.257223563},29378:function(t,n){var r,i=this&&this.__extends||(r=function(t,n){return r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,n){t.__proto__=n}||function(t,n){for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r])},r(t,n)},function(t,n){if("function"!=typeof n&&null!==n)throw new TypeError("Class extends value "+String(n)+" is not a constructor or null");function i(){this.constructor=t}r(t,n),t.prototype=null===n?Object.create(n):(i.prototype=n.prototype,new i)});Object.defineProperty(n,"__esModule",{value:!0}),n.InvalidSimplifyError=n.InvalidCodeError=n.NotSupportMeasuringArea=n.NotSupportMeasuringDistance=n.NotConvergeCalculationError=n.NotAllowedCwLinearRingError=n.FalidCuttingAntimeridianError=n.InvalidSelfintersectionError=n.NotAllowedWarpBoundsError=n.InvalidBoundsError=n.InvalidLinearRingEnclosingPoleError=n.EnclosingBothPolesError=n.InvalidLinearRingError=n.InvalidPointsError=n.InvalidPointError=n.InvalidNumberError=void 0;var a=function(t){function n(n){var r=this.constructor,i=t.call(this,n)||this;return Object.setPrototypeOf(i,r.prototype),i}return i(n,t),n}(Error),e=function(t){function n(n){return void 0===n&&(n="not number."),t.call(this,n)||this}return i(n,t),n}(a);n.InvalidNumberError=e;var o=function(t){function n(n){return void 0===n&&(n="point must be number array and have length 2 or more."),t.call(this,n)||this}return i(n,t),n}(a);n.InvalidPointError=o;var u=function(t){function n(n){return void 0===n&&(n="points must be point array."),t.call(this,n)||this}return i(n,t),n}(a);n.InvalidPointsError=u;var s=function(t){function n(n){return void 0===n&&(n="invalid linear ring."),t.call(this,n)||this}return i(n,t),n}(a);n.InvalidLinearRingError=s;var l=function(t){function n(n){return void 0===n&&(n="not support linear ring enclosing north and south poles."),t.call(this,n)||this}return i(n,t),n}(a);n.EnclosingBothPolesError=l;var h=function(t){function n(n){return void 0===n&&(n="invalid linear ring enclosing the pole."),t.call(this,n)||this}return i(n,t),n}(a);n.InvalidLinearRingEnclosingPoleError=h;var c=function(t){function n(n){return void 0===n&&(n="invalid bounds."),t.call(this,n)||this}return i(n,t),n}(a);n.InvalidBoundsError=c;var f=function(t){function n(n){return void 0===n&&(n="not support warpping bounds."),t.call(this,n)||this}return i(n,t),n}(a);n.NotAllowedWarpBoundsError=f;var p=function(t){function n(n){return void 0===n&&(n="invalid selfintersection."),t.call(this,n)||this}return i(n,t),n}(a);n.InvalidSelfintersectionError=p;var d=function(t){function n(n){return void 0===n&&(n="falid cutting antimeridian."),t.call(this,n)||this}return i(n,t),n}(a);n.FalidCuttingAntimeridianError=d;var v=function(t){function n(n){return void 0===n&&(n="not support cw linear ring."),t.call(this,n)||this}return i(n,t),n}(a);n.NotAllowedCwLinearRingError=v;var M=function(t){function n(n){return void 0===n&&(n="not converge calculation."),t.call(this,n)||this}return i(n,t),n}(a);n.NotConvergeCalculationError=M;var g=function(t){function n(n){return void 0===n&&(n="not support measuring distance."),t.call(this,n)||this}return i(n,t),n}(a);n.NotSupportMeasuringDistance=g;var m=function(t){function n(n){return void 0===n&&(n="not support measuring area."),t.call(this,n)||this}return i(n,t),n}(a);n.NotSupportMeasuringArea=m;var w=function(t){function n(n){return void 0===n&&(n="unsupported epsg code."),t.call(this,n)||this}return i(n,t),n}(a);n.InvalidCodeError=w;var _=function(t){function n(n){return void 0===n&&(n="arguments of simplify is invalid."),t.call(this,n)||this}return i(n,t),n}(a);n.InvalidSimplifyError=_},82339:function(t,n,r){var i=this&&this.__spreadArray||function(t,n,r){if(r||2===arguments.length)for(var i,a=0,e=n.length;a<e;a++)!i&&a in n||(i||(i=Array.prototype.slice.call(n,0,a)),i[a]=n[a]);return t.concat(i||Array.prototype.slice.call(n))};Object.defineProperty(n,"__esModule",{value:!0}),n.expandRingAtAntimeridian=n.cutRingAtAntimeridian=n._crossingAntimeridianPointLat=n._isCrossingAntimeridian=n._warpWithin=void 0;var a=r(13089),e=r(12947),o=r(29378),u=r(46150);function s(t){for(;t<-180;)t+=360;for(;180<t;)t-=360;return t}function l(t,n){return Math.abs(t-n)>360||(t=s(t),n=s(n),180!==Math.abs(t)&&180!==Math.abs(n)&&(!(t*n>0)&&Math.abs(t-n)>180))}function h(t,n){for(var r=t[0],i=n[0],a=t[1],o=n[1];r<0;)r+=360;for(;i<0;)i+=360;var u=180*Math.floor(Math.max(r,i)/180);return(0,e.linearInterpolationY)([r,a],[i,o],u)}function c(t,n,r){var i=n.to!==t.length-1?n.to:0,a=t[n.to][0]-t[n.from][0],e=Math.abs(a)<180?a<0:a>0,o=e?180*Math.ceil(t[i][0]/180):180*Math.floor(t[i][0]/180),u={overflowing:!e,linearRing:[]};for(u.linearRing.push([o,h(t[n.from],t[n.to])]),u.linearRing.push(t[n.to]);i!==r.from;)i=i+1!==t.length-1?i+1:0,u.linearRing.push(t[i]);return u.linearRing.push([o,h(t[r.from],t[r.to])]),u.linearRing.push(u.linearRing[0]),u}n._warpWithin=s,n._isCrossingAntimeridian=l,n._crossingAntimeridianPointLat=h,n.cutRingAtAntimeridian=function t(n,r){void 0===r&&(r={}),(0,a.validLinearRing)(n);for(var i=Object.assign({overflowing:!1,allowSelfintersection:!1},r),e=[],s=0;s<n.length-1;s++)l(n[s][0],n[s+1][0])&&e.push({from:s,to:s+1,lat:h(n[s],n[s+1])});if(e.length<2)return i.overflowing?{within:[],outside:[n]}:{within:[n],outside:[]};e.sort((function(t,n){return n.lat-t.lat}));var f=e[0],p=e[1],d={within:[],outside:[]},v=c(n,f,p),M=t(v.linearRing,{overflowing:v.overflowing,allowSelfintersection:i.allowSelfintersection});d.within=d.within.concat(M.within),d.outside=d.outside.concat(M.outside);var g=c(n,p,f),m=t(g.linearRing,{overflowing:g.overflowing,allowSelfintersection:i.allowSelfintersection});return d.within=d.within.concat(m.within),d.outside=d.outside.concat(m.outside),i.allowSelfintersection||(d.within.forEach((function(t){if((0,u.selfintersection)(t))throw new o.InvalidSelfintersectionError})),d.outside.forEach((function(t){if((0,u.selfintersection)(t))throw new o.InvalidSelfintersectionError}))),d},n.expandRingAtAntimeridian=function(t){(0,a.validLinearRing)(t);for(var n=[],r=0;r<t.length-1;r++)l(t[r][0],t[r+1][0])&&n.push({from:r,to:r+1});if(n.length<2)return t;var e=i([],t,!0),o=0;for(r=0;r<n.length;r++){var u=n[r].to,s=n[r].from,h=e[u][0]*e[s][0]<0,c=r<n.length-1?n[r+1].from:e.length;if(h)if(e[u][0]<0)for(var f=u;f<c;f++)e[f][0]+=360;else for(f=o;f<=s;f++)e[f][0]+=360;o=c}return e}},18935:function(t,n,r){var i=this&&this.__createBinding||(Object.create?function(t,n,r,i){void 0===i&&(i=r),Object.defineProperty(t,i,{enumerable:!0,get:function(){return n[r]}})}:function(t,n,r,i){void 0===i&&(i=r),t[i]=n[r]}),a=this&&this.__setModuleDefault||(Object.create?function(t,n){Object.defineProperty(t,"default",{enumerable:!0,value:n})}:function(t,n){t.default=n}),e=this&&this.__importStar||function(t){if(t&&t.__esModule)return t;var n={};if(null!=t)for(var r in t)"default"!==r&&Object.prototype.hasOwnProperty.call(t,r)&&i(n,t,r);return a(n,t),n};Object.defineProperty(n,"__esModule",{value:!0}),n.simplify=n.transform=n.spheroid=n.flatten=n.calc=n.utils=n.errors=n.constants=n.types=void 0,n.types=e(r(41484)),n.constants=e(r(89668)),n.errors=e(r(29378)),n.utils=e(r(46150)),n.calc=e(r(12947)),n.flatten=e(r(82339)),n.spheroid=e(r(11924)),n.transform=e(r(83044)),n.simplify=e(r(46211))},46211:function(t,n,r){var i=this&&this.__spreadArray||function(t,n,r){if(r||2===arguments.length)for(var i,a=0,e=n.length;a<e;a++)!i&&a in n||(i||(i=Array.prototype.slice.call(n,0,a)),i[a]=n[a]);return t.concat(i||Array.prototype.slice.call(n))};Object.defineProperty(n,"__esModule",{value:!0}),n.vw=n.rdp=void 0;var a=r(13089),e=r(29378),o=r(46150),u=function(t,n,r){var i=(t[1]-n[1])/(t[0]-n[0]),a=-i*n[0]+n[1];return Math.abs(i*r[0]-r[1]+a)/Math.pow(Math.pow(i,2)+1,.5)},s=function t(n,r,a,e,s){for(var l=-1/0,h=-1,c=n+1;c<r;c++){var f=s?(0,o.area)([a[n],a[c],a[r],a[n]]):u(a[n],a[r],a[c]);f>l&&(l=f,h=c)}return l<e?[]:i(i([{index:h,score:l}],t(n,h,a,e,s),!0),t(h,r,a,e,s),!0)};n.rdp=function(t,n){(0,a.validLinearRing)(t);var r=Object.assign({area:!1,threshold:.001,limit:1/0},n);if(r.area){if(r.threshold<0||r.threshold>=1)throw new e.InvalidSimplifyError("when area is true, threshold must be between 0 and 1.")}else if(r.threshold<0)throw new e.InvalidSimplifyError("threshold must be positive number.");if(r.limit<4)throw new e.InvalidSimplifyError("limit must be larger than 3.");for(var u,l,h=r.area?(0,o.area)(t)*r.threshold:r.threshold,c=t.length-1,f=-1/0,p=-1,d=1;d<c;d++){var v=(u=t[0],l=t[d],Math.pow(u[0]-l[0],2)+Math.pow(u[1]-l[1],2));v>f&&(f=v,p=d)}var M=i(i([],s(0,p,t,h,r.area),!0),s(p,c,t,h,r.area),!0);r.limit<t.length&&(M.sort((function(t,n){return t.score<n.score?1:-1})),M=M.slice(0,r.limit-3));var g=i([0,c,p],M.map((function(t){return t.index})),!0);return t.filter((function(t,n){return g.includes(n)}))},n.vw=function(t,n){(0,a.validLinearRing)(t);var r=Object.assign({rate:!1,threshold:.001,limit:1/0},n);if(r.rate){if(r.threshold<0||r.threshold>=1)throw new e.InvalidSimplifyError("when rate is true, threshold must be between 0 and 1.")}else if(r.threshold<0)throw new e.InvalidSimplifyError("threshold must be positive number.");if(r.limit<4)throw new e.InvalidSimplifyError("limit must be larger than 3.");for(var u=r.rate?(0,o.area)(t)*r.threshold:r.threshold,s=t.map((function(n,r){return 0===r||r===t.length-1?{score:1/0,index:r}:{score:(0,o.area)([t[r-1],n,t[r+1],t[r-1]]),index:r}}));s.length>4;){for(var l=1/0,h=-1,c=1;c<s.length-1;c++)s[c].score<l&&(l=s[c].score,h=c);if(!(s.length>r.limit||l<u))break;if(h-2>=0){var f=s[h-2].index,p=s[h-1].index,d=s[h+1].index;s[h-1].score=(0,o.area)([t[f],t[p],t[d],t[f]])}if(h+2<=s.length-1){f=s[h-1].index,p=s[h+1].index,d=s[h+2].index;s[h+1].score=(0,o.area)([t[f],t[p],t[d],t[f]])}s.splice(h,1)}var v=i([],s.map((function(t){return t.index})),!0);return t.filter((function(t,n){return v.includes(n)}))}},11924:function(t,n,r){Object.defineProperty(n,"__esModule",{value:!0}),n.area=n.distance=void 0;var i=r(13089),a=r(89668),e=r(29378),o=r(46150),u=function(t,n,r){void 0===r&&(r={}),(0,i.validPoint)(t),(0,i.validPoint)(n);var u=Object.assign({semimajorAxis:a.SEMEMAJOR_AXIS_WGS84,flattening:a.FLATTENING_WGS84,truncation:1e-15,maxCount:100},r);(0,i.validNumber)(u.semimajorAxis),(0,i.validNumber)(u.flattening),(0,i.validNumber)(u.truncation),(0,i.validNumber)(u.maxCount);var s=(0,o._toRadians)(t[0]),l=(0,o._toRadians)(t[1]),h=(0,o._toRadians)(n[0]),c=(0,o._toRadians)(n[1]);if((0,o._eq)(s,h)&&(0,o._eq)(l,c))return 0;var f=u.semimajorAxis,p=1/u.flattening,d=h-s,v=d;d>Math.PI?v-=2*Math.PI:d<-Math.PI&&(v+=2*Math.PI);var M,g,m=Math.abs(v),w=Math.PI-m,_=l+c,y=v>=0?Math.atan((1-p)*Math.tan(l)):Math.atan((1-p)*Math.tan(c)),E=v>=0?Math.atan((1-p)*Math.tan(c)):Math.atan((1-p)*Math.tan(l)),P=y+E,b=E-y,R=Math.cos(P/2),A=Math.sin(P/2),S=Math.sin(b/2),I=Math.cos(b/2),C=Math.sin(y)*Math.sin(E),x=Math.cos(y)*Math.cos(E),O=x*Math.cos(m)+C,N=p*(2-p)/Math.pow(1-p,2);if(O>=0)M=m*(1+p*x),g=1;else if(O>=-Math.cos((0,o._toRadians)(3)*Math.cos(y)))M=w,g=2;else{g=3;var j=p*Math.PI*Math.pow(Math.cos(y),2)*(1-p*(1+p)*Math.pow(Math.sin(y),2)/4+3/16*Math.pow(p,2)*Math.pow(Math.sin(y),4)),L=w*Math.cos(y)-j,G=Math.abs(P)+j,T=w/(p*Math.PI),q=p*(1+p/2)/4,F=T+q*T-q*Math.pow(T,3);if((0,o._eq)(_,0)){if(!(L>0)){if((0,o._eq)(L,0)){var B=Math.pow(Math.sin(y),2),W=N*B/Math.pow(Math.sqrt(1+N*B)+1,2);return(1-p)*f*((1+W)*(1+5/4*Math.pow(W,2)))*Math.PI}for(var Z=0,k=0,D=0;Z<u.maxCount;){D=1-Math.pow(k,2);var X=T*(1-(at=p*(1+p)/4-3/16*Math.pow(p,2)*D)*D);if(Math.abs(k-X)<u.truncation)break;k=X,Z+=1}if(Z>=u.maxCount)throw new e.NotConvergeCalculationError;var H=N*D/Math.pow(Math.sqrt(1+N*D)+1,2);return(1-p)*f*((1+H)*(1+5/4*Math.pow(H,2)))*Math.PI}M=w}else{var U=Math.atan(L/G)+Math.asin(j/Math.sqrt(Math.pow(L,2)+Math.pow(G,2))),Y=F/Math.cos(y)/(1+(1+q)*Math.abs(P)*(1-p*x)/(p*Math.PI*x)*Math.sin(U)),J=Math.asin(Y),z=Math.asin(Y*Math.cos(y)/Math.cos(E));M=2*Math.atan(Math.tan((J+z)/2)*Math.sin(Math.abs(P)/2)/Math.cos(b/2))}}for(var V=0,K=0,Q=0,$=0,tt=0,nt=0;V<u.maxCount;){var rt=1===g?Math.sqrt(Math.pow(S,2)*Math.pow(Math.cos(M/2),2)+Math.pow(R,2)*Math.pow(Math.sin(M/2),2)):Math.sqrt(Math.pow(S,2)*Math.pow(Math.sin(M/2),2)+Math.pow(R,2)*Math.pow(Math.cos(M/2),2)),it=1===g?Math.sqrt(Math.pow(I,2)*Math.pow(Math.cos(M/2),2)+Math.pow(A,2)*Math.pow(Math.sin(M/2),2)):Math.sqrt(Math.pow(I,2)*Math.pow(Math.sin(M/2),2)+Math.pow(A,2)*Math.pow(Math.cos(M/2),2));Q=2*Math.atan(rt/it),tt=2*rt*it,nt=Math.pow(it,2)-Math.pow(rt,2);var at,et=x*Math.sin(M)/tt,ot=($=(K=1-Math.pow(et,2))*nt-2*C)+C,ut=(1-(at=p*(1+p)/4-3/16*Math.pow(p,2)*K)*K)*p*et*(Q+at*tt*($+at*nt*(2*Math.pow($,2)-Math.pow(K,2)))),st=1===g?M-m-ut:M-w+ut;if(M-=st/(1-(p*Math.pow(et,2)*(1-2*at*K)+p*ot*Q/tt*(1-at*K+p*Math.pow(et,2)/2)+Math.pow(p,2)*$*ot/4)),Math.abs(st)<u.truncation)break;V+=1}if(V>=u.maxCount)throw new e.NotConvergeCalculationError;var lt=N*K/Math.pow(Math.sqrt(1+N*K)+1,2),ht=(1+lt)*(1+5/4*Math.pow(lt,2)),ct=N*(1-3*Math.pow(lt,2)/8)/Math.pow(Math.sqrt(1+N*K)+1,2);return(1-p)*f*ht*(Q-ct*tt*($-ct*(nt*(Math.pow(K,2)-2*Math.pow($,2))-ct*$*(1-4*Math.pow(nt,2))*(3*Math.pow(K,2)-4*Math.pow($,2))/6)/4))},s=function(t,n){void 0===n&&(n={});for(var r=0,i=0;i<t.coordinates.length;i++)r+=l(t.coordinates[i],n);return r},l=function(t,n){void 0===n&&(n={});for(var r=0,i=0;i<t.length-1;i++)r+=u(t[i],t[i+1],n);return r};n.distance=function t(n,r){if(void 0===r&&(r={}),Array.isArray(n))return l(n,r);switch(null==n?void 0:n.type){case"Feature":return t(n.geometry,r);case"LineString":return function(t,n){return void 0===n&&(n={}),l(t.coordinates,n)}(n,r);case"MultiLineString":case"Polygon":return s(n,r);case"MultiPolygon":return function(t,n){void 0===n&&(n={});for(var r=0,i=0;i<t.coordinates.length;i++)r+=s({type:"Polygon",coordinates:t.coordinates[i]},n);return r}(n,r)}throw new e.NotSupportMeasuringDistance};var h=function(t,n){var r=n*Math.sin(t);return r/(1-Math.pow(r,2))+Math.atanh(r)},c=function(t,n){return Math.asin(h(t,n)/h(Math.PI/2,n))},f=function(t,n,r,i){return 2*Math.asin(Math.sqrt(Math.pow(Math.sin((n-i)/2),2)+Math.cos(n)*Math.cos(i)*Math.pow(Math.sin((t-r)/2),2)))},p=function(t,n){void 0===n&&(n={}),(0,i.validLinearRing)(t);var r=Object.assign({semimajorAxis:a.SEMEMAJOR_AXIS_WGS84,flattening:a.FLATTENING_WGS84},n);(0,i.validNumber)(r.semimajorAxis),(0,i.validNumber)(r.flattening);for(var e=1/r.flattening,u=e*(2-e),s=Math.sqrt(u),l=h(Math.PI/2,s)/2*Math.pow(r.semimajorAxis,2)*(1/s-s),p=0,d=(0,o._toRadians)(t[0][0]),v=c((0,o._toRadians)(t[0][1]),s),M=(0,o._toRadians)(t[1][0]),g=c((0,o._toRadians)(t[1][1]),s),m=t.length-2,w=1;w<m;w++){var _=(0,o._toRadians)(t[w+1][0]),y=c((0,o._toRadians)(t[w+1][1]),s),E=Math.cos(v)*Math.cos(d)*Math.cos(g)*Math.sin(M)*Math.sin(y)+Math.cos(g)*Math.cos(M)*Math.cos(y)*Math.sin(_)*Math.sin(v)+Math.cos(y)*Math.cos(_)*Math.cos(v)*Math.sin(d)*Math.sin(g)-Math.cos(y)*Math.cos(_)*Math.cos(g)*Math.sin(M)*Math.sin(v)-Math.cos(g)*Math.cos(M)*Math.cos(v)*Math.sin(d)*Math.sin(y)-Math.cos(v)*Math.cos(d)*Math.cos(y)*Math.sin(_)*Math.sin(g)>0?1:-1,P=f(d,v,M,g),b=f(M,g,_,y),R=f(_,y,d,v),A=(P+b+R)/2;p+=4*E*Math.atan(Math.sqrt(Math.abs(Math.tan(A/2)*Math.tan((A-P)/2)*Math.tan((A-b)/2)*Math.tan((A-R)/2)))),M=_,g=y}return Math.abs(l*p)},d=function(t,n){var r=0;if(Array.isArray(null==t?void 0:t.coordinates)){r+=p(t.coordinates[0],n);for(var i=1;i<t.coordinates.length;i++)r-=p(t.coordinates[i],n)}return r};n.area=function t(n,r){if(void 0===r&&(r={}),Array.isArray(n))return p(n,r);switch(null==n?void 0:n.type){case"Feature":return t(n.geometry,r);case"Polygon":return d(n,r);case"MultiPolygon":return function(t,n){var r=0;if(Array.isArray(null==t?void 0:t.coordinates))for(var i=0;i<t.coordinates.length;i++)r+=d({type:"Polygon",coordinates:t.coordinates[i]},n);return r}(n,r)}throw new e.NotSupportMeasuringArea}},83044:function(t,n,r){var i=this&&this.__spreadArray||function(t,n,r){if(r||2===arguments.length)for(var i,a=0,e=n.length;a<e;a++)!i&&a in n||(i||(i=Array.prototype.slice.call(n,0,a)),i[a]=n[a]);return t.concat(i||Array.prototype.slice.call(n))},a=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(n,"__esModule",{value:!0}),n.geojsonFromCornerCoordinates=n.geojsonFromLinearRing=n.transformBbox=n.transformRing=n._transformEnclosingPoleRing=n._transform=void 0;var e=a(r(51842)),o=r(13089),u=r(46150),s=r(82339),l=r(12947),h=r(29378),c=r(89668);function f(t,n,r){return n===r?t:t.map((function(t){var a=(0,e.default)(n,r,[t[0],t[1]]);return i(i([],a,!0),t.slice(2),!0)}))}function p(t,n,r,i){for(var a=t.length-1,e=i?c.CRS_ARCTIC_POLAR_STEROGRAPHIC:c.CRS_ANTARCTIC_POLAR_STEROGRAPHIC,o=i?Number.MAX_SAFE_INTEGER:Number.MIN_SAFE_INTEGER,s=i?90:-90,p=f(t,n,e),d=[],v=0;v<a;v++)(0,u.intersection)(p[v],p[v+1],[0,0],[0,o])&&d.push({from:v,to:v+1,lat:(0,l.linearInterpolationY)(p[v],p[v+1],0)});if(1!==d.length)throw new h.InvalidLinearRingEnclosingPoleError;d.sort((function(t,n){return t.lat-n.lat}));var M=i?d[0]:d[d.length-1],g=[];for(v=0;v<a;v++)if(v===M.from){var m=f((0,l.linearInterpolationPoints)(p[M.from],[0,M.lat],{partition:r}),e,c.CRS_EPSG4326);g=g.concat(m.slice(0,m.length-1)),g=m[0][0]>=0?g.concat([[180,m[m.length-1][1]],[180,s],[-180,s],[-180,m[m.length-1][1]]]):g.concat([[-180,m[m.length-1][1]],[-180,s],[180,s],[180,m[m.length-1][1]]]);var w=f((0,l.linearInterpolationPoints)([0,M.lat],p[M.to],{partition:r}),e,c.CRS_EPSG4326);g=g.concat(w.slice(1,w.length-1))}else{var _=f((0,l.linearInterpolationPoints)(p[v],p[v+1],{partition:r}),e,c.CRS_EPSG4326);g=g.concat(_.slice(0,_.length-1))}return g.push(g[0]),g}function d(t,n,r){void 0===r&&(r={}),(0,o.validLinearRing)(t),n=(0,u.getCrs)(n);var i=Object.assign({partition:0},r),a=t.length-1,e=f([[0,90]],c.CRS_EPSG4326,n)[0],s=!(0,u.hasSingularity)([e])&&(0,u.within)(e,t),d=f([[0,-90]],c.CRS_EPSG4326,n)[0],v=!(0,u.hasSingularity)([d])&&(0,u.within)(d,t);if(s&&v)throw new h.EnclosingBothPolesError;if(s)return p(t,n,i.partition,!0);if(v)return p(t,n,i.partition,!1);for(var M=[],g=0;g<a;g++){var m=(0,l.linearInterpolationPoints)(t[g],t[g+1],{partition:i.partition});M=M.concat(m.slice(0,m.length-1))}return M.push(M[0]),n===c.CRS_EPSG4326?M:f(M,n,c.CRS_EPSG4326)}function v(t,n,r){if(void 0===r&&(r={}),!(0,u.isCcw)(t))throw new h.NotAllowedCwLinearRingError;var i=Object.assign({partition:9,expand:!1},r),a=d(t,n,{partition:i.partition}),e=a.map((function(t){return t[1]}));if((0,u.isCcw)(a)){var o=a.map((function(t){return t[0]}));return{type:"Feature",bbox:[Math.min.apply(Math,o),Math.min.apply(Math,e),Math.max.apply(Math,o),Math.max.apply(Math,e)],properties:{},geometry:{type:"Polygon",coordinates:[a]}}}if(i.expand){var l=(0,s.expandRingAtAntimeridian)(a);o=l.map((function(t){return t[0]}));return{type:"Feature",bbox:[Math.min.apply(Math,o),Math.min.apply(Math,e),Math.max.apply(Math,o),Math.max.apply(Math,e)],properties:{},geometry:{type:"Polygon",coordinates:[l]}}}var c=(0,s.cutRingAtAntimeridian)(a),f=[];c.within.forEach((function(t){f=f.concat(t.map((function(t){return t[0]})))}));var p=[];c.outside.forEach((function(t){p=p.concat(t.map((function(t){return t[0]})))}));var v=[];return v.push(c.within.map((function(t){return t}))),v.push(c.outside.map((function(t){return t}))),{type:"Feature",bbox:[Math.min.apply(Math,f),Math.min.apply(Math,e),Math.max.apply(Math,p),Math.max.apply(Math,e)],properties:{},geometry:{type:"MultiPolygon",coordinates:v}}}n._transform=f,n._transformEnclosingPoleRing=p,n.transformRing=d,n.transformBbox=function(t,n,r){if(void 0===r&&(r={}),4!==t.length&&6!==t.length)throw new h.InvalidBoundsError;var i=Object.assign({partition:9,expand:!1},r),a=6===t.length,e=t[0],o=t[1],l=a?t[3]:t[2],c=a?t[4]:t[3];if(l<e)throw new h.NotAllowedWarpBoundsError;var f=d([[e,o],[l,o],[l,c],[e,c],[e,o]],n,{partition:i.partition}),p=f.map((function(t){return t[1]}));if((0,u.isCcw)(f)){var v=f.map((function(t){return t[0]}));return 6===t.length?[Math.min.apply(Math,v),Math.min.apply(Math,p),t[2],Math.max.apply(Math,v),Math.max.apply(Math,p),t[5]]:[Math.min.apply(Math,v),Math.min.apply(Math,p),Math.max.apply(Math,v),Math.max.apply(Math,p)]}try{var M=(0,s.cutRingAtAntimeridian)(f),g=[];M.within.forEach((function(t){g=g.concat(t.map((function(t){return t[0]})))}));var m=[];return M.outside.forEach((function(t){m=m.concat(t.map((function(t){return t[0]})))})),6===t.length?[Math.min.apply(Math,g),Math.min.apply(Math,p),t[2],i.expand?Math.max.apply(Math,m)+360:Math.max.apply(Math,m),Math.max.apply(Math,p),t[5]]:[Math.min.apply(Math,g),Math.min.apply(Math,p),i.expand?Math.max.apply(Math,m)+360:Math.max.apply(Math,m),Math.max.apply(Math,p)]}catch(w){throw new h.FalidCuttingAntimeridianError}},n.geojsonFromLinearRing=v,n.geojsonFromCornerCoordinates=function(t,n,r,i,a,e){return void 0===e&&(e={}),v([t,n,i,r,t],a,{partition:Object.assign({partition:9},e).partition})}},41484:function(t,n){Object.defineProperty(n,"__esModule",{value:!0})},46150:function(t,n,r){Object.defineProperty(n,"__esModule",{value:!0}),n.enclosing=n.overlapping=n.hasSingularity=n.getCrs=n.selfintersection=n.intersection=n.within=n.isCcw=n.area=n._area=n._toRadians=n._eq=void 0;var i=r(13089),a=r(29378),e=r(89668),o=r(26731);function u(t){(0,i.validLinearRing)(t);for(var n=0,r=t.length-1,a=0;a<r;a++)n=n+t[a][0]*t[a+1][1]-t[a][1]*t[a+1][0];return n/2}function s(t,n,r){void 0===r&&(r={});for(var i=Object.assign({includeBorder:!1},r),a=t[0],o=t[1],u=0,s=1;s<n.length;s++){var l=n[s-1],h=l[0],c=l[1],f=n[s],p=f[0],d=f[1],v=(h-=a)*(p-=a)+(c-=o)*(d-=o),M=h*d-p*c;if(Math.abs(M)<e.EPSILON&&v<=0)return i.includeBorder;u+=Math.atan2(M,v)}return Math.abs(u)>1}function l(t,n,r,i){if(t[0]>=n[0]){if(t[0]<r[0]&&t[0]<i[0]||n[0]>r[0]&&n[0]>i[0])return!1}else if(n[0]<r[0]&&n[0]<i[0]||t[0]>r[0]&&t[0]>i[0])return!1;if(t[1]>=n[1]){if(t[1]<r[1]&&t[1]<i[1]||n[1]>r[1]&&n[1]>i[1])return!1}else if(n[1]<r[1]&&n[1]<i[1]||t[1]>r[1]&&t[1]>i[1])return!1;return!(((t[0]-n[0])*(r[1]-t[1])+(t[1]-n[1])*(t[0]-r[0]))*((t[0]-n[0])*(i[1]-t[1])+(t[1]-n[1])*(t[0]-i[0]))>0)&&!(((r[0]-i[0])*(t[1]-r[1])+(r[1]-i[1])*(r[0]-t[0]))*((r[0]-i[0])*(n[1]-r[1])+(r[1]-i[1])*(r[0]-n[0]))>0)}function h(t,n,r,a){return(0,i.validPoint)(t),(0,i.validPoint)(n),(0,i.validPoint)(r),(0,i.validPoint)(a),l(t,n,r,a)}n._eq=function(t,n){return Math.abs(t-n)<e.EPSILON},n._toRadians=function(t){return t*(Math.PI/180)},n._area=u,n.area=function(t){return Math.abs(u(t))},n.isCcw=function(t){return u(t)>=0},n.within=function(t,n,r){return(0,i.validPoint)(t),(0,i.validLinearRing)(n),s(t,n,r)},n.intersection=h;var c=function t(n,r){if(void 0===r&&(r=0),r+2>=n.length)return!1;for(var i=n[r],a=0===r?n.length-1:n.length,e=r+2;e<a;e++){var o=n[e];if(h(i[0],i[1],o[0],o[1]))return!0}return t(n,r+1)};n.selfintersection=function(t){(0,i.validLinearRing)(t);for(var n=[],r=0;r<t.length-1;r++)t[r][0]===t[r+1][0]&&t[r][1]===t[r+1][1]||n.push(t[r]);if(n.push(t[t.length-1]),n.length<4)return!1;if(4===n.length)return Math.abs(n[0][1]*(n[1][0]-n[2][0])+n[1][1]*(n[2][0]-n[0][0])+n[2][1]*(n[0][0]-n[1][0]))<e.EPSILON;var a=[];for(r=0;r<n.length-1;r++)a.push([n[r],n[r+1]]);return c(a)},n.getCrs=function(t){var n="string"==typeof t&&/^epsg:/i.exec(t)?Number(t.replace(/^epsg:/i,"")):t;if("string"==typeof n)return n;var r=o.epsgIndex[n];if(r)return r;throw new a.InvalidCodeError},n.hasSingularity=function(t){if(Array.isArray(t))for(var n=0;n<t.length;n++)if(Array.isArray(t[n])&&t[n].some((function(t){return isNaN(t)||t===1/0||t===-1/0})))return!0;return!1},n.overlapping=function(t,n){(0,i.validLinearRing)(t),(0,i.validLinearRing)(n);for(var r=0;r<t.length-1;r++)if(s(t[r],n,{includeBorder:!0}))return!0;for(r=0;r<n.length-1;r++)if(s(n[r],t,{includeBorder:!0}))return!0;for(r=0;r<t.length-1;r++)for(var a=0;a<n.length-1;a++)if(l(t[r],t[r+1],n[a],n[a+1]))return!0;return!1},n.enclosing=function(t,n){(0,i.validLinearRing)(t),(0,i.validLinearRing)(n);for(var r=0;r<t.length-1;r++)if(!s(t[r],n,{includeBorder:!0}))return!1;return!0}},89044:function(t,n,r){r.d(n,{z:function(){return u}});var i=r(55176),a=r(19160),e=r(97391),o=r(45240);function u(t){var n,r,u=Object.keys(t.defs),s=u.length;for(n=0;n<s;++n){var l=u[n];if(!(0,e.U2)(l)){var h=t.defs(l),c=h.units;c||"longlat"!==h.projName||(c=a.ZP.DEGREES),(0,e.Sx)(new i.Z({code:l,axisOrientation:h.axis,metersPerUnit:h.to_meter,units:c}))}}for(n=0;n<s;++n){var f=u[n],p=(0,e.U2)(f);for(r=0;r<s;++r){var d=u[r],v=(0,e.U2)(d);if(!(0,o.U2)(f,d))if(t.defs[f]===t.defs[d])(0,e.rM)([p,v]);else{var M=t(f,d);(0,e.zY)(p,v,(0,e.uA)(p,v,M.forward),(0,e.uA)(v,p,M.inverse))}}}}}}]);
//# sourceMappingURL=a838b8f376dd7cda86a2b0e7b560552608ea3dbb-3efd97946161d943b287.js.map