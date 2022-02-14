"use strict";(self.webpackChunkexmap=self.webpackChunkexmap||[]).push([[501],{4548:function(e,t,n){n.d(t,{Z:function(){return k}});var r=n(4942),a=n(3366),o=n(7462),i=n(7294),l=n(5505),c=n(9408),s=n(7663),u=n(9240),d=n(8440),m=n(7761),v=n(3656),p=n(8416);function f(e){return(0,p.Z)("MuiSwitch",e)}var h=(0,n(2194).Z)("MuiSwitch",["root","edgeStart","edgeEnd","switchBase","colorPrimary","colorSecondary","sizeSmall","sizeMedium","checked","disabled","input","thumb","track"]),b=n(5893),g=["className","color","edge","size","sx"],Z=(0,v.ZP)("span",{name:"MuiSwitch",slot:"Root",overridesResolver:function(e,t){var n=e.ownerState;return[t.root,n.edge&&t["edge".concat((0,u.Z)(n.edge))],t["size".concat((0,u.Z)(n.size))]]}})((function(e){var t,n=e.ownerState;return(0,o.Z)({display:"inline-flex",width:58,height:38,overflow:"hidden",padding:12,boxSizing:"border-box",position:"relative",flexShrink:0,zIndex:0,verticalAlign:"middle","@media print":{colorAdjust:"exact"}},"start"===n.edge&&{marginLeft:-8},"end"===n.edge&&{marginRight:-8},"small"===n.size&&(t={width:40,height:24,padding:7},(0,r.Z)(t,"& .".concat(h.thumb),{width:16,height:16}),(0,r.Z)(t,"& .".concat(h.switchBase),(0,r.Z)({padding:4},"&.".concat(h.checked),{transform:"translateX(16px)"})),t))})),x=(0,v.ZP)(d.Z,{name:"MuiSwitch",slot:"SwitchBase",overridesResolver:function(e,t){var n=e.ownerState;return[t.switchBase,(0,r.Z)({},"& .".concat(h.input),t.input),"default"!==n.color&&t["color".concat((0,u.Z)(n.color))]]}})((function(e){var t,n=e.theme;return t={position:"absolute",top:0,left:0,zIndex:1,color:"light"===n.palette.mode?n.palette.common.white:n.palette.grey[300],transition:n.transitions.create(["left","transform"],{duration:n.transitions.duration.shortest})},(0,r.Z)(t,"&.".concat(h.checked),{transform:"translateX(20px)"}),(0,r.Z)(t,"&.".concat(h.disabled),{color:"light"===n.palette.mode?n.palette.grey[100]:n.palette.grey[600]}),(0,r.Z)(t,"&.".concat(h.checked," + .").concat(h.track),{opacity:.5}),(0,r.Z)(t,"&.".concat(h.disabled," + .").concat(h.track),{opacity:"light"===n.palette.mode?.12:.2}),(0,r.Z)(t,"& .".concat(h.input),{left:"-100%",width:"300%"}),t}),(function(e){var t,n=e.theme,a=e.ownerState;return(0,o.Z)({"&:hover":{backgroundColor:(0,s.Fq)(n.palette.action.active,n.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}}},"default"!==a.color&&(t={},(0,r.Z)(t,"&.".concat(h.checked),(0,r.Z)({color:n.palette[a.color].main,"&:hover":{backgroundColor:(0,s.Fq)(n.palette[a.color].main,n.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}}},"&.".concat(h.disabled),{color:"light"===n.palette.mode?(0,s.$n)(n.palette[a.color].main,.62):(0,s._j)(n.palette[a.color].main,.55)})),(0,r.Z)(t,"&.".concat(h.checked," + .").concat(h.track),{backgroundColor:n.palette[a.color].main}),t))})),w=(0,v.ZP)("span",{name:"MuiSwitch",slot:"Track",overridesResolver:function(e,t){return t.track}})((function(e){var t=e.theme;return{height:"100%",width:"100%",borderRadius:7,zIndex:-1,transition:t.transitions.create(["opacity","background-color"],{duration:t.transitions.duration.shortest}),backgroundColor:"light"===t.palette.mode?t.palette.common.black:t.palette.common.white,opacity:"light"===t.palette.mode?.38:.3}})),y=(0,v.ZP)("span",{name:"MuiSwitch",slot:"Thumb",overridesResolver:function(e,t){return t.thumb}})((function(e){return{boxShadow:e.theme.shadows[1],backgroundColor:"currentColor",width:20,height:20,borderRadius:"50%"}})),k=i.forwardRef((function(e,t){var n=(0,m.Z)({props:e,name:"MuiSwitch"}),r=n.className,i=n.color,s=void 0===i?"primary":i,d=n.edge,v=void 0!==d&&d,p=n.size,h=void 0===p?"medium":p,k=n.sx,S=(0,a.Z)(n,g),C=(0,o.Z)({},n,{color:s,edge:v,size:h}),L=function(e){var t=e.classes,n=e.edge,r=e.size,a=e.color,i=e.checked,l=e.disabled,s={root:["root",n&&"edge".concat((0,u.Z)(n)),"size".concat((0,u.Z)(r))],switchBase:["switchBase","color".concat((0,u.Z)(a)),i&&"checked",l&&"disabled"],thumb:["thumb"],track:["track"],input:["input"]},d=(0,c.Z)(s,f,t);return(0,o.Z)({},t,d)}(C),E=(0,b.jsx)(y,{className:L.thumb,ownerState:C});return(0,b.jsxs)(Z,{className:(0,l.Z)(L.root,r),sx:k,ownerState:C,children:[(0,b.jsx)(x,(0,o.Z)({type:"checkbox",icon:E,checkedIcon:E,ref:t,ownerState:C},S,{classes:(0,o.Z)({},L,{root:L.switchBase})})),(0,b.jsx)(w,{className:L.track,ownerState:C})]})}))},1939:function(e,t,n){var r=(0,n(2696).ZP)();t.Z=r},8559:function(e,t,n){n.d(t,{H:function(){return l}});var r=n(7294),a=function(e){var t;return"changedTouches"in e&&(null===(t=e.changedTouches)||void 0===t?void 0:t.length)>0?{clientX:e.changedTouches[0].clientX,clientY:e.changedTouches[0].clientY}:"clientX"in e&&"clientY"in e?{clientX:e.clientX,clientY:e.clientY}:null},o=function(){return{dndItems:[],keys:new Map,dragElement:null,hoverIndex:null,canCheckHovered:!0,pointerPosition:{x:0,y:0}}},i=function(e){e.stopPropagation()},l=function(e){var t=e.mode,n=e.defaultItems,l=e.zIndex,c=void 0===l?100:l,s=e.duration,u=void 0===s?300:s,d=e.drop,m=(0,r.useState)(n),v=m[0],p=m[1],f=(0,r.useRef)(o()),h=function(e){e.cancelable&&e.preventDefault();var n=a(e);if(n){var r=n.clientX,o=n.clientY,i=f.current,l=i.dndItems,s=i.dragElement,u=i.pointerPosition;if(s){var d=r-u.x,m=o-u.y,v=s.element.style;if(v.zIndex=String(c),v.cursor="grabbing",v.transform="translate("+d+"px,"+m+"px)",f.current.canCheckHovered){f.current.canCheckHovered=!1,setTimeout((function(){return f.current.canCheckHovered=!0}),300);var h=l.findIndex((function(e){return e.key===s.key})),b=l.findIndex((function(n,r){var o=n.element;return r!==h&&function(e,t,n,r,o){void 0===n&&(n="grid");var i=a(e);if(!i)return!1;var l=i.clientX,c=i.clientY,s=t.getBoundingClientRect();switch(n){case"topbottom":return(c<s.bottom||r===o-1&&c>=s.bottom)&&(c>s.top||0===r&&c<=s.top);case"bottomtop":return(c<s.bottom||0===r&&c>=s.bottom)&&(c>s.top||r===o-1&&c<=s.top);case"leftright":return(l>s.left||0===r&&l<=s.left)&&(l<s.right||r===o-1&&l>=s.right);case"rightleft":return(l>s.left||r===o-1&&l<=s.left)&&(l<s.right||0===r&&l>=s.right);default:return c<s.bottom&&c>s.top&&l<s.right&&l>s.left}}(e,o,t,r,l.length)}));if(-1!==b){f.current.hoverIndex=b,f.current.pointerPosition.x=r,f.current.pointerPosition.y=o,l.splice(h,1),l.splice(b,0,s);var g=s.element.getBoundingClientRect(),Z=g.left,x=g.top;s.position={x:Z,y:x},p(l.map((function(e){return e.value})))}}}}},b=function e(){var t=f.current,n=t.dragElement,r=t.hoverIndex;if(null!==n){var a=n.index,o=n.element.style;o.zIndex="",o.cursor="",o.transform="",o.userSelect="",f.current.dragElement=null,f.current.hoverIndex=null,window&&(window.removeEventListener("mouseup",e),window.removeEventListener("mousemove",h),window.removeEventListener("touchend",e),window.removeEventListener("touchmove",h)),d&&d(a,null!=r?r:a)}},g=r.useCallback((function(e){f.current=o(),p(e)}),[]);return{items:v.map((function(e,t){var n=f.current.keys.get(e)||Math.random().toString(16);f.current.keys.set(e,n);var r=function(r){var o=r.currentTarget,i=a(r);if(i){var l=i.clientX,c=i.clientY;f.current.pointerPosition.x=l,f.current.pointerPosition.y=c;var s=o.style;s.transition="",s.cursor="grabbing",s.userSelect="none";var u=o.getBoundingClientRect(),d={x:u.left,y:u.top};f.current.dragElement={key:n,value:e,element:o,position:d,index:t},window&&(window.addEventListener("mouseup",b),window.addEventListener("mousemove",h,{passive:!1}),window.addEventListener("touchend",b),window.addEventListener("touchmove",h,{passive:!1}))}};return{value:e,key:n,ref:function(t){if(t){var r=f.current,a=r.dndItems,o=r.dragElement,i=r.pointerPosition;t.style.transform="";var l=t.getBoundingClientRect(),c={x:l.left,y:l.top},s=a.findIndex((function(e){return e.key===n}));if(-1===s)return a.push({key:n,value:e,element:t,position:c,index:a.length});if((null==o?void 0:o.key)===n){var d=o.position.x-c.x,m=o.position.y-c.y;t.style.transform="translate("+d+"px,"+m+"px)",i.x-=d,i.y-=m}else{var v=a[s],p=v.position.x-c.x,h=v.position.y-c.y;t.style.transition="",t.style.transform="translate("+p+"px,"+h+"px)",requestAnimationFrame((function(){o&&(t.style.transition="all "+u+"ms"),t.style.transform=""}))}f.current.dndItems[s]={key:n,value:e,element:t,position:c,index:s}}},trigger:{onMouseDown:r,onTouchStart:r},propagation:{onMouseDown:i,onTouchStart:i}}})),reset:g}}},8116:function(e,t,n){n.r(t),n.d(t,{default:function(){return Ie}});var r=n(3433),a=n(7294),o=n(2055),i=n(532),l=n(7462),c=n(3366),s=n(5505),u=n(9408),d=n(3656),m=n(7761),v=n(8953),p=n(8416),f=n(2194);function h(e){return(0,p.Z)("MuiCard",e)}(0,f.Z)("MuiCard",["root"]);var b=n(5893),g=["className","raised"],Z=(0,d.ZP)(v.Z,{name:"MuiCard",slot:"Root",overridesResolver:function(e,t){return t.root}})((function(){return{overflow:"hidden"}})),x=a.forwardRef((function(e,t){var n=(0,m.Z)({props:e,name:"MuiCard"}),r=n.className,a=n.raised,o=void 0!==a&&a,i=(0,c.Z)(n,g),d=(0,l.Z)({},n,{raised:o}),v=function(e){var t=e.classes;return(0,u.Z)({root:["root"]},h,t)}(d);return(0,b.jsx)(Z,(0,l.Z)({className:(0,s.Z)(v.root,r),elevation:o?8:void 0,ref:t,ownerState:d},i))}));function w(e){return(0,p.Z)("MuiCardContent",e)}(0,f.Z)("MuiCardContent",["root"]);var y=["className","component"],k=(0,d.ZP)("div",{name:"MuiCardContent",slot:"Root",overridesResolver:function(e,t){return t.root}})((function(){return{padding:16,"&:last-child":{paddingBottom:24}}})),S=a.forwardRef((function(e,t){var n=(0,m.Z)({props:e,name:"MuiCardContent"}),r=n.className,a=n.component,o=void 0===a?"div":a,i=(0,c.Z)(n,y),d=(0,l.Z)({},n,{component:o}),v=function(e){var t=e.classes;return(0,u.Z)({root:["root"]},w,t)}(d);return(0,b.jsx)(k,(0,l.Z)({as:o,className:(0,s.Z)(v.root,r),ownerState:d,ref:t},i))})),C=n(4942),L=n(5697),E=n.n(L),z=n(2234);function R(e){return(0,p.Z)("MuiSlider",e)}var M=(0,f.Z)("MuiSlider",["root","active","focusVisible","disabled","dragging","marked","vertical","trackInverted","trackFalse","rail","track","mark","markActive","markLabel","markLabelActive","thumb","valueLabel","valueLabelOpen","valueLabelCircle","valueLabelLabel"]);var j=function(e){var t=e.children,n=e.className,r=e.value,o=e.theme,i=function(e){var t=e.open;return{offset:(0,s.Z)(t&&M.valueLabelOpen),circle:M.valueLabelCircle,label:M.valueLabelLabel}}(e);return a.cloneElement(t,{className:(0,s.Z)(t.props.className)},(0,b.jsxs)(a.Fragment,{children:[t.props.children,(0,b.jsx)("span",{className:(0,s.Z)(i.offset,n),theme:o,"aria-hidden":!0,children:(0,b.jsx)("span",{className:i.circle,children:(0,b.jsx)("span",{className:i.label,children:r})})})]}))},A=n(9439),I=n(4694),N=n(5833),P=n(5768),T=n(3283),O=n(3634),V=n(6164),F={border:0,clip:"rect(0 0 0 0)",height:"1px",margin:-1,overflow:"hidden",padding:0,position:"absolute",whiteSpace:"nowrap",width:"1px"},B=["aria-label","aria-labelledby","aria-valuetext","className","component","classes","defaultValue","disableSwap","disabled","getAriaLabel","getAriaValueText","marks","max","min","name","onChange","onChangeCommitted","onMouseDown","orientation","scale","step","tabIndex","track","value","valueLabelDisplay","valueLabelFormat","isRtl","components","componentsProps"];function D(e,t){return e-t}function X(e,t,n){return null==e?t:Math.min(Math.max(t,e),n)}function Y(e,t){return e.reduce((function(e,n,r){var a=Math.abs(t-n);return null===e||a<e.distance||a===e.distance?{distance:a,index:r}:e}),null).index}function H(e,t){if(void 0!==t.current&&e.changedTouches){for(var n=0;n<e.changedTouches.length;n+=1){var r=e.changedTouches[n];if(r.identifier===t.current)return{x:r.clientX,y:r.clientY}}return!1}return{x:e.clientX,y:e.clientY}}function q(e,t,n){return 100*(e-t)/(n-t)}function _(e,t,n){var r=Math.round((e-n)/t)*t+n;return Number(r.toFixed(function(e){if(Math.abs(e)<1){var t=e.toExponential().split("e-"),n=t[0].split(".")[1];return(n?n.length:0)+parseInt(t[1],10)}var r=e.toString().split(".")[1];return r?r.length:0}(t)))}function W(e){var t=e.values,n=e.newValue,r=e.index,a=t.slice();return a[r]=n,a.sort(D)}function $(e){var t=e.sliderRef,n=e.activeIndex,r=e.setActive,a=(0,I.Z)(t.current);t.current.contains(a.activeElement)&&Number(a.activeElement.getAttribute("data-index"))===n||t.current.querySelector('[type="range"][data-index="'.concat(n,'"]')).focus(),r&&r(n)}var G,J={horizontal:{offset:function(e){return{left:"".concat(e,"%")}},leap:function(e){return{width:"".concat(e,"%")}}},"horizontal-reverse":{offset:function(e){return{right:"".concat(e,"%")}},leap:function(e){return{width:"".concat(e,"%")}}},vertical:{offset:function(e){return{bottom:"".concat(e,"%")}},leap:function(e){return{height:"".concat(e,"%")}}}},K=function(e){return e};function Q(){return void 0===G&&(G="undefined"==typeof CSS||"function"!=typeof CSS.supports||CSS.supports("touch-action","none")),G}var U=function(e){return e.children},ee=a.forwardRef((function(e,t){var n=e["aria-label"],o=e["aria-labelledby"],i=e["aria-valuetext"],d=e.className,m=e.component,v=void 0===m?"span":m,p=e.classes,f=e.defaultValue,h=e.disableSwap,g=void 0!==h&&h,Z=e.disabled,x=void 0!==Z&&Z,w=e.getAriaLabel,y=e.getAriaValueText,k=e.marks,S=void 0!==k&&k,C=e.max,L=void 0===C?100:C,E=e.min,M=void 0===E?0:E,G=e.name,ee=e.onChange,te=e.onChangeCommitted,ne=e.onMouseDown,re=e.orientation,ae=void 0===re?"horizontal":re,oe=e.scale,ie=void 0===oe?K:oe,le=e.step,ce=void 0===le?1:le,se=e.tabIndex,ue=e.track,de=void 0===ue?"normal":ue,me=e.value,ve=e.valueLabelDisplay,pe=void 0===ve?"off":ve,fe=e.valueLabelFormat,he=void 0===fe?K:fe,be=e.isRtl,ge=void 0!==be&&be,Ze=e.components,xe=void 0===Ze?{}:Ze,we=e.componentsProps,ye=void 0===we?{}:we,ke=(0,c.Z)(e,B),Se=a.useRef(),Ce=a.useState(-1),Le=(0,A.Z)(Ce,2),Ee=Le[0],ze=Le[1],Re=a.useState(-1),Me=(0,A.Z)(Re,2),je=Me[0],Ae=Me[1],Ie=a.useState(!1),Ne=(0,A.Z)(Ie,2),Pe=Ne[0],Te=Ne[1],Oe=a.useRef(0),Ve=(0,N.Z)({controlled:me,default:null!=f?f:M,name:"Slider"}),Fe=(0,A.Z)(Ve,2),Be=Fe[0],De=Fe[1],Xe=ee&&function(e,t,n){var r=e.nativeEvent||e,a=new r.constructor(r.type,r);Object.defineProperty(a,"target",{writable:!0,value:{value:t,name:G}}),ee(a,t,n)},Ye=Array.isArray(Be),He=Ye?Be.slice().sort(D):[Be];He=He.map((function(e){return X(e,M,L)}));var qe=!0===S&&null!==ce?(0,r.Z)(Array(Math.floor((L-M)/ce)+1)).map((function(e,t){return{value:M+ce*t}})):S||[],_e=(0,P.Z)(),We=_e.isFocusVisibleRef,$e=_e.onBlur,Ge=_e.onFocus,Je=_e.ref,Ke=a.useState(-1),Qe=(0,A.Z)(Ke,2),Ue=Qe[0],et=Qe[1],tt=a.useRef(),nt=(0,T.Z)(Je,tt),rt=(0,T.Z)(t,nt),at=function(e){var t=Number(e.currentTarget.getAttribute("data-index"));Ge(e),!0===We.current&&et(t),Ae(t)},ot=function(e){$e(e),!1===We.current&&et(-1),Ae(-1)},it=(0,O.Z)((function(e){var t=Number(e.currentTarget.getAttribute("data-index"));Ae(t)})),lt=(0,O.Z)((function(){Ae(-1)}));(0,V.Z)((function(){x&&tt.current.contains(document.activeElement)&&document.activeElement.blur()}),[x]),x&&-1!==Ee&&ze(-1),x&&-1!==Ue&&et(-1);var ct=function(e){var t=Number(e.currentTarget.getAttribute("data-index")),n=He[t],r=qe.map((function(e){return e.value})),a=r.indexOf(n),o=e.target.valueAsNumber;if(qe&&null==ce&&(o=o<n?r[a-1]:r[a+1]),o=X(o,M,L),qe&&null==ce){var i=qe.map((function(e){return e.value})),l=i.indexOf(He[t]);o=o<He[t]?i[l-1]:i[l+1]}if(Ye){g&&(o=X(o,He[t-1]||-1/0,He[t+1]||1/0));var c=o;o=W({values:He,newValue:o,index:t});var s=t;g||(s=o.indexOf(c)),$({sliderRef:tt,activeIndex:s})}De(o),et(t),Xe&&Xe(e,o,t),te&&te(e,o)},st=a.useRef(),ut=ae;ge&&"vertical"!==ae&&(ut+="-reverse");var dt=function(e){var t,n,r=e.finger,a=e.move,o=void 0!==a&&a,i=e.values,l=tt.current.getBoundingClientRect(),c=l.width,s=l.height,u=l.bottom,d=l.left;if(t=0===ut.indexOf("vertical")?(u-r.y)/s:(r.x-d)/c,-1!==ut.indexOf("-reverse")&&(t=1-t),n=function(e,t,n){return(n-t)*e+t}(t,M,L),ce)n=_(n,ce,M);else{var m=qe.map((function(e){return e.value}));n=m[Y(m,n)]}n=X(n,M,L);var v=0;if(Ye){v=o?st.current:Y(i,n),g&&(n=X(n,i[v-1]||-1/0,i[v+1]||1/0));var p=n;n=W({values:i,newValue:n,index:v}),g&&o||(v=n.indexOf(p),st.current=v)}return{newValue:n,activeIndex:v}},mt=(0,O.Z)((function(e){var t=H(e,Se);if(t)if(Oe.current+=1,"mousemove"!==e.type||0!==e.buttons){var n=dt({finger:t,move:!0,values:He}),r=n.newValue,a=n.activeIndex;$({sliderRef:tt,activeIndex:a,setActive:ze}),De(r),!Pe&&Oe.current>2&&Te(!0),Xe&&Xe(e,r,a)}else vt(e)})),vt=(0,O.Z)((function(e){var t=H(e,Se);if(Te(!1),t){var n=dt({finger:t,values:He}).newValue;ze(-1),"touchend"===e.type&&Ae(-1),te&&te(e,n),Se.current=void 0,ft()}})),pt=(0,O.Z)((function(e){Q()||e.preventDefault();var t=e.changedTouches[0];null!=t&&(Se.current=t.identifier);var n=H(e,Se),r=dt({finger:n,values:He}),a=r.newValue,o=r.activeIndex;$({sliderRef:tt,activeIndex:o,setActive:ze}),De(a),Xe&&Xe(e,a,o),Oe.current=0;var i=(0,I.Z)(tt.current);i.addEventListener("touchmove",mt),i.addEventListener("touchend",vt)})),ft=a.useCallback((function(){var e=(0,I.Z)(tt.current);e.removeEventListener("mousemove",mt),e.removeEventListener("mouseup",vt),e.removeEventListener("touchmove",mt),e.removeEventListener("touchend",vt)}),[vt,mt]);a.useEffect((function(){var e=tt.current;return e.addEventListener("touchstart",pt,{passive:Q()}),function(){e.removeEventListener("touchstart",pt,{passive:Q()}),ft()}}),[ft,pt]),a.useEffect((function(){x&&ft()}),[x,ft]);var ht=(0,O.Z)((function(e){if(ne&&ne(e),0===e.button){e.preventDefault();var t=H(e,Se),n=dt({finger:t,values:He}),r=n.newValue,a=n.activeIndex;$({sliderRef:tt,activeIndex:a,setActive:ze}),De(r),Xe&&Xe(e,r,a),Oe.current=0;var o=(0,I.Z)(tt.current);o.addEventListener("mousemove",mt),o.addEventListener("mouseup",vt)}})),bt=q(Ye?He[0]:M,M,L),gt=q(He[He.length-1],M,L)-bt,Zt=(0,l.Z)({},J[ut].offset(bt),J[ut].leap(gt)),xt=xe.Root||v,wt=ye.root||{},yt=xe.Rail||"span",kt=ye.rail||{},St=xe.Track||"span",Ct=ye.track||{},Lt=xe.Thumb||"span",Et=ye.thumb||{},zt=xe.ValueLabel||j,Rt=ye.valueLabel||{},Mt=xe.Mark||"span",jt=ye.mark||{},At=xe.MarkLabel||"span",It=ye.markLabel||{},Nt=(0,l.Z)({},e,{classes:p,disabled:x,dragging:Pe,isRtl:ge,marked:qe.length>0&&qe.some((function(e){return e.label})),max:L,min:M,orientation:ae,scale:ie,step:ce,track:de,valueLabelDisplay:pe,valueLabelFormat:he}),Pt=function(e){var t=e.disabled,n=e.dragging,r=e.marked,a=e.orientation,o=e.track,i=e.classes,l={root:["root",t&&"disabled",n&&"dragging",r&&"marked","vertical"===a&&"vertical","inverted"===o&&"trackInverted",!1===o&&"trackFalse"],rail:["rail"],track:["track"],mark:["mark"],markActive:["markActive"],markLabel:["markLabel"],markLabelActive:["markLabelActive"],valueLabel:["valueLabel"],thumb:["thumb",t&&"disabled"],active:["active"],disabled:["disabled"],focusVisible:["focusVisible"]};return(0,u.Z)(l,R,i)}(Nt);return(0,b.jsxs)(xt,(0,l.Z)({ref:rt,onMouseDown:ht},wt,!(0,z.Z)(xt)&&{as:v,ownerState:(0,l.Z)({},Nt,wt.ownerState)},ke,{className:(0,s.Z)(Pt.root,wt.className,d),children:[(0,b.jsx)(yt,(0,l.Z)({},kt,!(0,z.Z)(yt)&&{ownerState:(0,l.Z)({},Nt,kt.ownerState)},{className:(0,s.Z)(Pt.rail,kt.className)})),(0,b.jsx)(St,(0,l.Z)({},Ct,!(0,z.Z)(St)&&{ownerState:(0,l.Z)({},Nt,Ct.ownerState)},{className:(0,s.Z)(Pt.track,Ct.className),style:(0,l.Z)({},Zt,Ct.style)})),qe.map((function(e,t){var n,r=q(e.value,M,L),o=J[ut].offset(r);return n=!1===de?-1!==He.indexOf(e.value):"normal"===de&&(Ye?e.value>=He[0]&&e.value<=He[He.length-1]:e.value<=He[0])||"inverted"===de&&(Ye?e.value<=He[0]||e.value>=He[He.length-1]:e.value>=He[0]),(0,b.jsxs)(a.Fragment,{children:[(0,b.jsx)(Mt,(0,l.Z)({"data-index":t},jt,!(0,z.Z)(Mt)&&{ownerState:(0,l.Z)({},Nt,jt.ownerState),markActive:n},{style:(0,l.Z)({},o,jt.style),className:(0,s.Z)(Pt.mark,jt.className,n&&Pt.markActive)})),null!=e.label?(0,b.jsx)(At,(0,l.Z)({"aria-hidden":!0,"data-index":t},It,!(0,z.Z)(At)&&{ownerState:(0,l.Z)({},Nt,It.ownerState)},{markLabelActive:n,style:(0,l.Z)({},o,It.style),className:(0,s.Z)(Pt.markLabel,It.className,n&&Pt.markLabelActive),children:e.label})):null]},e.value)})),He.map((function(t,r){var c=q(t,M,L),u=J[ut].offset(c),d="off"===pe?U:zt;return(0,b.jsx)(a.Fragment,{children:(0,b.jsx)(d,(0,l.Z)({valueLabelFormat:he,valueLabelDisplay:pe,value:"function"==typeof he?he(ie(t),r):he,index:r,open:je===r||Ee===r||"on"===pe,disabled:x},Rt,{className:(0,s.Z)(Pt.valueLabel,Rt.className)},!(0,z.Z)(zt)&&{ownerState:(0,l.Z)({},Nt,Rt.ownerState)},{children:(0,b.jsx)(Lt,(0,l.Z)({"data-index":r,onMouseOver:it,onMouseLeave:lt},Et,{className:(0,s.Z)(Pt.thumb,Et.className,Ee===r&&Pt.active,Ue===r&&Pt.focusVisible)},!(0,z.Z)(Lt)&&{ownerState:(0,l.Z)({},Nt,Et.ownerState)},{style:(0,l.Z)({},u,{pointerEvents:g&&Ee!==r?"none":void 0},Et.style),children:(0,b.jsx)("input",{tabIndex:se,"data-index":r,"aria-label":w?w(r):n,"aria-labelledby":o,"aria-orientation":ae,"aria-valuemax":ie(L),"aria-valuemin":ie(M),"aria-valuenow":ie(t),"aria-valuetext":y?y(ie(t),r):i,onFocus:at,onBlur:ot,name:G,type:"range",min:e.min,max:e.max,step:e.step,disabled:x,value:He[r],onChange:ct,style:(0,l.Z)({},F,{direction:ge?"rtl":"ltr",width:"100%",height:"100%"})})}))}))},r)}))]}))})),te=n(7663),ne=n(6449),re=n(9240),ae=["components","componentsProps","color","size"],oe=(0,l.Z)({},M,(0,f.Z)("MuiSlider",["colorPrimary","colorSecondary","thumbColorPrimary","thumbColorSecondary","sizeSmall","thumbSizeSmall"])),ie=(0,d.ZP)("span",{name:"MuiSlider",slot:"Root",overridesResolver:function(e,t){var n=e.ownerState,a=!0===n.marksProp&&null!==n.step?(0,r.Z)(Array(Math.floor((n.max-n.min)/n.step)+1)).map((function(e,t){return{value:n.min+n.step*t}})):n.marksProp||[],o=a.length>0&&a.some((function(e){return e.label}));return[t.root,t["color".concat((0,re.Z)(n.color))],"medium"!==n.size&&t["size".concat((0,re.Z)(n.size))],o&&t.marked,"vertical"===n.orientation&&t.vertical,"inverted"===n.track&&t.trackInverted,!1===n.track&&t.trackFalse]}})((function(e){var t,n=e.theme,r=e.ownerState;return(0,l.Z)({borderRadius:12,boxSizing:"content-box",display:"inline-block",position:"relative",cursor:"pointer",touchAction:"none",color:n.palette[r.color].main,WebkitTapHighlightColor:"transparent"},"horizontal"===r.orientation&&(0,l.Z)({height:4,width:"100%",padding:"13px 0","@media (pointer: coarse)":{padding:"20px 0"}},"small"===r.size&&{height:2},r.marked&&{marginBottom:20}),"vertical"===r.orientation&&(0,l.Z)({height:"100%",width:4,padding:"0 13px","@media (pointer: coarse)":{padding:"0 20px"}},"small"===r.size&&{width:2},r.marked&&{marginRight:44}),(t={"@media print":{colorAdjust:"exact"}},(0,C.Z)(t,"&.".concat(oe.disabled),{pointerEvents:"none",cursor:"default",color:n.palette.grey[400]}),(0,C.Z)(t,"&.".concat(oe.dragging),(0,C.Z)({},"& .".concat(oe.thumb,", & .").concat(oe.track),{transition:"none"})),t))})),le=(0,d.ZP)("span",{name:"MuiSlider",slot:"Rail",overridesResolver:function(e,t){return t.rail}})((function(e){var t=e.ownerState;return(0,l.Z)({display:"block",position:"absolute",borderRadius:"inherit",backgroundColor:"currentColor",opacity:.38},"horizontal"===t.orientation&&{width:"100%",height:"inherit",top:"50%",transform:"translateY(-50%)"},"vertical"===t.orientation&&{height:"100%",width:"inherit",left:"50%",transform:"translateX(-50%)"},"inverted"===t.track&&{opacity:1})})),ce=(0,d.ZP)("span",{name:"MuiSlider",slot:"Track",overridesResolver:function(e,t){return t.track}})((function(e){var t=e.theme,n=e.ownerState,r="light"===t.palette.mode?(0,te.$n)(t.palette[n.color].main,.62):(0,te._j)(t.palette[n.color].main,.5);return(0,l.Z)({display:"block",position:"absolute",borderRadius:"inherit",border:"1px solid currentColor",backgroundColor:"currentColor",transition:t.transitions.create(["left","width","bottom","height"],{duration:t.transitions.duration.shortest})},"small"===n.size&&{border:"none"},"horizontal"===n.orientation&&{height:"inherit",top:"50%",transform:"translateY(-50%)"},"vertical"===n.orientation&&{width:"inherit",left:"50%",transform:"translateX(-50%)"},!1===n.track&&{display:"none"},"inverted"===n.track&&{backgroundColor:r,borderColor:r})})),se=(0,d.ZP)("span",{name:"MuiSlider",slot:"Thumb",overridesResolver:function(e,t){var n=e.ownerState;return[t.thumb,t["thumbColor".concat((0,re.Z)(n.color))],"medium"!==n.size&&t["thumbSize".concat((0,re.Z)(n.size))]]}})((function(e){var t,n=e.theme,r=e.ownerState;return(0,l.Z)({position:"absolute",width:20,height:20,boxSizing:"border-box",borderRadius:"50%",outline:0,backgroundColor:"currentColor",display:"flex",alignItems:"center",justifyContent:"center",transition:n.transitions.create(["box-shadow","left","bottom"],{duration:n.transitions.duration.shortest})},"small"===r.size&&{width:12,height:12},"horizontal"===r.orientation&&{top:"50%",transform:"translate(-50%, -50%)"},"vertical"===r.orientation&&{left:"50%",transform:"translate(-50%, 50%)"},(t={"&:before":(0,l.Z)({position:"absolute",content:'""',borderRadius:"inherit",width:"100%",height:"100%",boxShadow:n.shadows[2]},"small"===r.size&&{boxShadow:"none"}),"&::after":{position:"absolute",content:'""',borderRadius:"50%",width:42,height:42,top:"50%",left:"50%",transform:"translate(-50%, -50%)"}},(0,C.Z)(t,"&:hover, &.".concat(oe.focusVisible),{boxShadow:"0px 0px 0px 8px ".concat((0,te.Fq)(n.palette[r.color].main,.16)),"@media (hover: none)":{boxShadow:"none"}}),(0,C.Z)(t,"&.".concat(oe.active),{boxShadow:"0px 0px 0px 14px ".concat((0,te.Fq)(n.palette[r.color].main,.16))}),(0,C.Z)(t,"&.".concat(oe.disabled),{"&:hover":{boxShadow:"none"}}),t))})),ue=(0,d.ZP)(j,{name:"MuiSlider",slot:"ValueLabel",overridesResolver:function(e,t){return t.valueLabel}})((function(e){var t,n=e.theme,r=e.ownerState;return(0,l.Z)((t={},(0,C.Z)(t,"&.".concat(oe.valueLabelOpen),{transform:"translateY(-100%) scale(1)"}),(0,C.Z)(t,"zIndex",1),(0,C.Z)(t,"whiteSpace","nowrap"),t),n.typography.body2,{fontWeight:500,transition:n.transitions.create(["transform"],{duration:n.transitions.duration.shortest}),top:-10,transformOrigin:"bottom center",transform:"translateY(-100%) scale(0)",position:"absolute",backgroundColor:n.palette.grey[600],borderRadius:2,color:n.palette.common.white,display:"flex",alignItems:"center",justifyContent:"center",padding:"0.25rem 0.75rem"},"small"===r.size&&{fontSize:n.typography.pxToRem(12),padding:"0.25rem 0.5rem"},{"&:before":{position:"absolute",content:'""',width:8,height:8,bottom:0,left:"50%",transform:"translate(-50%, 50%) rotate(45deg)",backgroundColor:"inherit"}})})),de=(0,d.ZP)("span",{name:"MuiSlider",slot:"Mark",shouldForwardProp:function(e){return(0,d.Dz)(e)&&"markActive"!==e},overridesResolver:function(e,t){return t.mark}})((function(e){var t=e.theme,n=e.ownerState,r=e.markActive;return(0,l.Z)({position:"absolute",width:2,height:2,borderRadius:1,backgroundColor:"currentColor"},"horizontal"===n.orientation&&{top:"50%",transform:"translate(-1px, -50%)"},"vertical"===n.orientation&&{left:"50%",transform:"translate(-50%, 1px)"},r&&{backgroundColor:t.palette.background.paper,opacity:.8})})),me=(0,d.ZP)("span",{name:"MuiSlider",slot:"MarkLabel",shouldForwardProp:function(e){return(0,d.Dz)(e)&&"markLabelActive"!==e},overridesResolver:function(e,t){return t.markLabel}})((function(e){var t=e.theme,n=e.ownerState,r=e.markLabelActive;return(0,l.Z)({},t.typography.body2,{color:t.palette.text.secondary,position:"absolute",whiteSpace:"nowrap"},"horizontal"===n.orientation&&{top:30,transform:"translateX(-50%)","@media (pointer: coarse)":{top:40}},"vertical"===n.orientation&&{left:36,transform:"translateY(50%)","@media (pointer: coarse)":{left:44}},r&&{color:t.palette.text.primary})}));ie.propTypes={children:E().node,ownerState:E().shape({"aria-label":E().string,"aria-labelledby":E().string,"aria-valuetext":E().string,classes:E().object,color:E().oneOf(["primary","secondary"]),defaultValue:E().oneOfType([E().arrayOf(E().number),E().number]),disabled:E().bool,getAriaLabel:E().func,getAriaValueText:E().func,isRtl:E().bool,marks:E().oneOfType([E().arrayOf(E().shape({label:E().node,value:E().number.isRequired})),E().bool]),max:E().number,min:E().number,name:E().string,onChange:E().func,onChangeCommitted:E().func,orientation:E().oneOf(["horizontal","vertical"]),scale:E().func,step:E().number,track:E().oneOf(["inverted","normal",!1]),value:E().oneOfType([E().arrayOf(E().number),E().number]),valueLabelDisplay:E().oneOf(["auto","off","on"]),valueLabelFormat:E().oneOfType([E().func,E().string])})};var ve=function(e){return!e||!(0,z.Z)(e)},pe=a.forwardRef((function(e,t){var n,r,a,o,i=(0,m.Z)({props:e,name:"MuiSlider"}),u="rtl"===(0,ne.Z)().direction,d=i.components,v=void 0===d?{}:d,p=i.componentsProps,f=void 0===p?{}:p,h=i.color,g=void 0===h?"primary":h,Z=i.size,x=void 0===Z?"medium":Z,w=(0,c.Z)(i,ae),y=function(e){var t=e.color,n=e.size,r=e.classes,a=void 0===r?{}:r;return(0,l.Z)({},a,{root:(0,s.Z)(a.root,R("color".concat((0,re.Z)(t))),a["color".concat((0,re.Z)(t))],n&&[R("size".concat((0,re.Z)(n))),a["size".concat((0,re.Z)(n))]]),thumb:(0,s.Z)(a.thumb,R("thumbColor".concat((0,re.Z)(t))),a["thumbColor".concat((0,re.Z)(t))],n&&[R("thumbSize".concat((0,re.Z)(n))),a["thumbSize".concat((0,re.Z)(n))]])})}((0,l.Z)({},i,{color:g,size:x}));return(0,b.jsx)(ee,(0,l.Z)({},w,{isRtl:u,components:(0,l.Z)({Root:ie,Rail:le,Track:ce,Thumb:se,ValueLabel:ue,Mark:de,MarkLabel:me},v),componentsProps:(0,l.Z)({},f,{root:(0,l.Z)({},f.root,ve(v.Root)&&{ownerState:(0,l.Z)({},null==(n=f.root)?void 0:n.ownerState,{color:g,size:x})}),thumb:(0,l.Z)({},f.thumb,ve(v.Thumb)&&{ownerState:(0,l.Z)({},null==(r=f.thumb)?void 0:r.ownerState,{color:g,size:x})}),track:(0,l.Z)({},f.track,ve(v.Track)&&{ownerState:(0,l.Z)({},null==(a=f.track)?void 0:a.ownerState,{color:g,size:x})}),valueLabel:(0,l.Z)({},f.valueLabel,ve(v.ValueLabel)&&{ownerState:(0,l.Z)({},null==(o=f.valueLabel)?void 0:o.ownerState,{color:g,size:x})})}),classes:y,ref:t}))}));function fe(e){return(0,p.Z)("MuiCardActions",e)}(0,f.Z)("MuiCardActions",["root","spacing"]);var he=["disableSpacing","className"],be=(0,d.ZP)("div",{name:"MuiCardActions",slot:"Root",overridesResolver:function(e,t){var n=e.ownerState;return[t.root,!n.disableSpacing&&t.spacing]}})((function(e){var t=e.ownerState;return(0,l.Z)({display:"flex",alignItems:"center",padding:8},!t.disableSpacing&&{"& > :not(:first-of-type)":{marginLeft:8}})})),ge=a.forwardRef((function(e,t){var n=(0,m.Z)({props:e,name:"MuiCardActions"}),r=n.disableSpacing,a=void 0!==r&&r,o=n.className,i=(0,c.Z)(n,he),d=(0,l.Z)({},n,{disableSpacing:a}),v=function(e){var t=e.classes,n={root:["root",!e.disableSpacing&&"spacing"]};return(0,u.Z)(n,fe,t)}(d);return(0,b.jsx)(be,(0,l.Z)({className:(0,s.Z)(v.root,o),ownerState:d,ref:t},i))})),Ze=n(9308),xe=n(4548),we=n(6968),ye=n(5616),ke=n(4382),Se=n(4320),Ce=n(1939),Le=n(4101),Ee=n(9894),ze=n(7391),Re=n(6534),Me=n(8559),je=(0,Ce.Z)("ul")({listStyle:"none",margin:0,padding:0,"& > li":{position:"relative",marginTop:"10px","&:firstChild":{marginTop:0}}}),Ae=function(e){var t=e.config,n=e.propagation,r=t.layer,o=r.getProperties(),i=a.useState(100*o.opacity),l=i[0],c=i[1],s=a.useState(o.visible),u=s[0],d=s[1];return a.createElement(x,null,a.createElement(S,null,a.createElement(Ze.Z,{sx:{fontSize:14},color:"text.secondary"},t.name),a.createElement(pe,Object.assign({size:"small",value:l,"aria-label":"Small",valueLabelDisplay:"auto",onChange:function(e,t){c(t),r.setOpacity(t/100)}},n)),a.createElement(xe.Z,Object.assign({checked:u,onChange:function(e,t){d(t),r.setVisible(t)}},n))),a.createElement(ge,null,a.createElement(we.Z,Object.assign({size:"small",variant:"outlined",onClick:function(){e.remove(t.id)}},n),"REMOVE")))},Ie=function(){var e=(0,Re.e)({zoom:7,center:(0,ze.mi)([139,36])}),t=a.useRef(!0),n=a.useState([]),l=n[0],c=n[1];a.useEffect((function(){if(t.current&&e.map){var n=[{id:"seamlessphoto",name:"写真",layer:new Le.Z({source:new Ee.Z({url:"https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",attributions:"国土地理院(https://maps.gsi.go.jp/development/ichiran.html)"})})},{id:"relief",name:"標高",layer:new Le.Z({source:new Ee.Z({url:"https://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png",attributions:"国土地理院(https://maps.gsi.go.jp/development/ichiran.html)"})})},{id:"lcmfc2",name:"治水地形",layer:new Le.Z({source:new Ee.Z({url:"https://cyberjapandata.gsi.go.jp/xyz/lcmfc2/{z}/{x}/{y}.png",attributions:"国土地理院(https://maps.gsi.go.jp/development/ichiran.html)"})})}];n.forEach((function(t){var n,r=t.layer;null===(n=e.map)||void 0===n||n.addLayer(r),r.setOpacity(.5)})),c(n),t.current=!1}}),[e.map]);var s=(0,Me.H)({defaultItems:[],mode:"topbottom",drop:function(e,t){e!==t&&c((function(n){if(t<0||e<0||e>n.length-1||t>n.length-1)return n;var a=(0,r.Z)(n),o=a[e];return a.splice(e,1),a.splice(t,0,o),a}))}}),u=s.reset;a.useEffect((function(){var e=0;l.forEach((function(t){t.layer.setZIndex(e++)})),u((0,r.Z)(l))}),[l,u]);var d=a.useCallback((function(t){c((function(n){var a=(0,r.Z)(n),o=a.findIndex((function(e){return t===e.id})),i=a[o];return e.map&&i?(e.map.removeLayer(i.layer),a.splice(o,1),a):a}))}),[e.map]);return a.createElement(a.Fragment,null,a.createElement(i.ZP,null),a.createElement(o.Helmet,null,a.createElement("title",null,"Order Change"),a.createElement("meta",{name:"description",content:"Change order of layers."}),a.createElement("link",{rel:"canonical",href:"https://yonda-yonda.github.io/exmap/geotiff"}),a.createElement("link",{rel:"icon",type:"image/x-icon",href:"https://github.githubassets.com/favicon.ico"}),a.createElement("link",{rel:"stylesheet",href:"https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"}),a.createElement("meta",{name:"twitter:card",content:"summary_large_image"}),a.createElement("meta",{name:"twitter:title",content:"Order Change"}),a.createElement("meta",{name:"twitter:description",content:"レイヤーの重なり順を操作"}),a.createElement("meta",{property:"og:url",content:"https://yonda-yonda.github.io/exmap/order"}),a.createElement("meta",{name:"twitter:image",content:"https://yonda-yonda.github.io/exmap/image/twitter_order.png"})),a.createElement(ye.Z,null,a.createElement(Ze.Z,{variant:"h2",component:"h1"},"Order Change"),a.createElement(ke.Z,{my:4,spacing:4},a.createElement("div",null,a.createElement(Se.ZP,{container:!0,spacing:2},a.createElement(Se.ZP,{item:!0,xs:9},a.createElement("div",{ref:e.ref,style:{width:"100%",height:"340px"}})),a.createElement(Se.ZP,{item:!0,xs:3},a.createElement(je,null,s.items.map((function(e){return a.createElement("li",Object.assign({ref:e.ref},e.trigger,{key:e.key}),a.createElement(Ae,{config:e.value,propagation:e.propagation,remove:d}))})))))))))}}}]);
//# sourceMappingURL=component---src-pages-order-index-tsx-0444e3d4ab4a9e07fe75.js.map