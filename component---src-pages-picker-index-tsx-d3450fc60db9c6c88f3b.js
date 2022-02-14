"use strict";(self.webpackChunkexmap=self.webpackChunkexmap||[]).push([[136],{3627:function(e,t,a){a.r(t);var n=a(7294),r=a(2055),i=a(532),o=a(5616),c=a(9308),l=a(9894),m=a(8487),h=a(4101),u=a(7391),p=function(e,t,a,n){var r=Object.assign({},n),i=r.min,o=r.max,c=i&&i>a?i:o&&o<a?o:a;return c=c>0?Math.ceil(c):0,{x:Math.floor((e+180)/360*Math.pow(2,c)),y:Math.floor((1-Math.log(Math.tan(t*Math.PI/180)+1/Math.cos(t*Math.PI/180))/Math.PI)/2*Math.pow(2,c)),z:c}},s=function(e,t,a,n){if(void 0===n&&(n=256),![256,512].includes(n))throw new Error("unexpected tile size.");var r,i,o,c,l=(r=a.x,i=a.y,o=a.z,c=Math.PI-2*Math.PI*i/Math.pow(2,o),[r/Math.pow(2,o)*360-180,180/Math.PI*Math.atan(.5*(Math.exp(c)-Math.exp(-c)))]),m=p(e,t,a.z+(512===n?9:8)),h=p(l[0],l[1],a.z+(512===n?9:8));return[m.x-h.x,m.y-h.y]},g=function(e,t,a){var n=document.createElement("canvas"),r=n.getContext("2d");if(r)return n.width=e.width,n.height=e.height,r.drawImage(e,0,0),Array.from(r.getImageData(t,a,1,1).data);throw new Error("can't get value.")},d=function(e,t){void 0===t&&(t=100);var a=Math.floor(256*e[0]*256+256*e[1]+e[2]);return 8388608==a?NaN:(a>8388608&&(a=(a-16777216)/t),a<8388608&&(a/=t),a)};t.default=function(){var e=(0,m.e)({basemap:!1}),t=n.useRef(),a=n.useRef(null);return n.useEffect((function(){var n=function(e){if(t.current&&a.current){var n=e.map.getView().getZoom(),r=(0,u.bU)(null==e?void 0:e.coordinate);if(n&&r.length>1)try{for(var i=t.current.getSource();n>=0;){var o=p(r[0],r[1],n,{min:0,max:8}),c=i.getTile(o.z,o.x,o.y).getImage();if(c.src.length>0){var l=s(r[0],r[1],o,c.width);a.current.innerText="lon: "+r[0].toFixed(4)+"[deg], lat: "+r[1].toFixed(4)+"[deg], height: "+d(g(c,l[0],l[1]))+"[m]";break}n--}if(n<0)throw new Error("can't get image.")}catch(m){console.log(m),a.current.innerText=""}}};return e.map&&(t.current||(t.current=new h.Z({source:new l.Z({maxZoom:8,url:"https://cyberjapandata.gsi.go.jp/xyz/demgm_png/{z}/{x}/{y}.png",attributions:"国土地理院(https://maps.gsi.go.jp/development/ichiran.html)",tilePixelRatio:window&&window.devicePixelRatio?window.devicePixelRatio:1,crossOrigin:"anonymous"})}),e.map.addLayer(t.current)),e.map.getViewport().style.cursor="pointer",e.map.on("singleclick",n)),function(){e.map&&e.map.un("singleclick",n)}}),[e.map]),n.createElement(n.Fragment,null,n.createElement(i.ZP,null),n.createElement(r.Helmet,null,n.createElement("title",null,"Picker"),n.createElement("meta",{name:"description",content:"Pick tile values."}),n.createElement("link",{rel:"canonical",href:"https://yonda-yonda.github.io/exmap/picker"}),n.createElement("link",{rel:"icon",type:"image/x-icon",href:"https://github.githubassets.com/favicon.ico"}),n.createElement("link",{rel:"stylesheet",href:"https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"}),n.createElement("meta",{name:"twitter:card",content:"summary_large_image"}),n.createElement("meta",{name:"twitter:title",content:"Pick tile values"}),n.createElement("meta",{name:"twitter:description",content:"クリックした位置のタイルの値を取得します。"}),n.createElement("meta",{property:"og:url",content:"https://yonda-yonda.github.io/exmap/picker"}),n.createElement("meta",{name:"twitter:image",content:"https://yonda-yonda.github.io/exmap/image/twitter_picker.png"})),n.createElement(o.Z,null,n.createElement(c.Z,{variant:"h2",component:"h1"},"Pick tile values"),n.createElement("div",{ref:e.ref,style:{width:"100%",height:"520px"}}),n.createElement(c.Z,{variant:"body1",ref:a})))}}}]);
//# sourceMappingURL=component---src-pages-picker-index-tsx-d3450fc60db9c6c88f3b.js.map