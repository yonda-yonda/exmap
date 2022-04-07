"use strict";(self.webpackChunkexmap=self.webpackChunkexmap||[]).push([[310],{89044:function(e,t,i){i.d(t,{z:function(){return o}});var n=i(55176),r=i(19160),a=i(97391),l=i(45240);function o(e){var t,i,o=Object.keys(e.defs),s=o.length;for(t=0;t<s;++t){var c=o[t];if(!(0,a.U2)(c)){var f=e.defs(c),d=f.units;d||"longlat"!==f.projName||(d=r.ZP.DEGREES),(0,a.Sx)(new n.Z({code:c,axisOrientation:f.axis,metersPerUnit:f.to_meter,units:d}))}}for(t=0;t<s;++t){var u=o[t],p=(0,a.U2)(u);for(i=0;i<s;++i){var m=o[i],E=(0,a.U2)(m);if(!(0,l.U2)(u,m))if(e.defs[u]===e.defs[m])(0,a.rM)([p,E]);else{var h=e(u,m);(0,a.zY)(p,E,(0,a.uA)(p,E,h.forward),(0,a.uA)(E,p,h.inverse))}}}}},733:function(e,t,i){i.r(t);var n=i(67294),r=i(2055),a=i(10532),l=i(27053),o=i(50162),s=i(1485),c=i(51842),f=i(89044),d=i(96534);c.default.defs("EPSG:3995","+proj=stere +lat_0=90 +lat_ts=71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs"),(0,f.z)(c.default);for(var u=[],p=0;p<14;++p)u[p]=.703125/Math.pow(2,p+1);t.default=function(){var e=(0,d.e)({projection:"EPSG:4326"}),t=(0,d.e)({projection:"EPSG:4326"}),i=(0,d.e)(),c=(0,d.e)({projection:"EPSG:3995"}),f=512,p=n.useCallback((function(e,t){var i=t.split(",").map(Number),n=i[0],r=i[1],a=i[2],l=document.createElement("canvas");l.width=f,l.height=f;var o=l.getContext("2d");if(o){var s=256;o.strokeStyle="white",o.textAlign="center",o.font="72px sans-serif",o.clearRect(0,0,f,f),o.fillStyle="rgba(100, 100, 100, 0.5)",o.fillRect(0,0,f,f),o.fillStyle="black",o.fillText("z: "+n,s,176),o.fillText("x: "+r,s,s),o.fillText("y: "+a,s,336),o.strokeRect(0,0,f,f),e.getImage().src=l.toDataURL()}}),[]);return n.useEffect((function(){if(e.map){var t=new l.Z({extent:[-180,-90,180,90],tileSize:f,resolutions:u}),i=new s.Z({source:new o.Z({projection:"EPSG:4326",url:"{z},{x},{y}",tileGrid:t,tileLoadFunction:p,transition:0})});e.map.addLayer(i)}}),[e.map,p]),n.useEffect((function(){if(t.map){var e=new s.Z({source:new o.Z({url:"{z},{x},{y}",tileLoadFunction:p,transition:0})});t.map.addLayer(e)}}),[t.map,p]),n.useEffect((function(){if(i.map){var e=new l.Z({extent:[-180,-90,180,90],tileSize:f,resolutions:u}),t=new s.Z({source:new o.Z({projection:"EPSG:4326",url:"{z},{x},{y}",tileGrid:e,tileLoadFunction:p,transition:0})});i.map.addLayer(t)}}),[i.map,p]),n.useEffect((function(){if(c.map){var e=new l.Z({extent:[-180,-90,180,90],tileSize:f,resolutions:u}),t=new s.Z({source:new o.Z({projection:"EPSG:4326",url:"{z},{x},{y}",tileGrid:e,tileLoadFunction:p,transition:0})});c.map.addLayer(t)}}),[c.map,p]),n.createElement(n.Fragment,null,n.createElement(a.ZP,null),n.createElement(r.Helmet,null,n.createElement("title",null,"Show Grid"),n.createElement("meta",{name:"description",content:"Show Tile Grid."}),n.createElement("link",{rel:"canonical",href:"https://yonda-yonda.github.io/exmap/grid"}),n.createElement("link",{rel:"icon",type:"image/x-icon",href:"https://github.githubassets.com/favicon.ico"}),n.createElement("link",{rel:"stylesheet",href:"https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"})),n.createElement("h1",null,"view EPSG:4326, grid EPSG:4326"),n.createElement("div",{ref:e.ref,style:{width:"720px",height:"360px",border:"solid 1px"}}),n.createElement("h1",null,"view EPSG:4326, grid EPSG:3857"),n.createElement("div",{ref:t.ref,style:{width:"720px",height:"360px",border:"solid 1px"}}),n.createElement("h1",null,"view EPSG:3857, grid EPSG:4326"),n.createElement("div",{ref:i.ref,style:{width:"720px",height:"360px",border:"solid 1px"}}),n.createElement("h1",null,"view EPSG:3995, grid EPSG:4326"),n.createElement("div",{ref:c.ref,style:{width:"720px",height:"360px",border:"solid 1px"}}))}}}]);
//# sourceMappingURL=component---src-pages-grid-index-tsx-c7d8cf1183068945b66e.js.map