"use strict";(self.webpackChunkexmap=self.webpackChunkexmap||[]).push([[310],{733:function(e,t,n){n.r(t);var r=n(67294),i=n(2055),l=n(10532),a=n(27053),o=n(19894),c=n(1485),s=n(51842),u=n(89044),f=n(96534);s.default.defs("EPSG:3995","+proj=stere +lat_0=90 +lat_ts=71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs"),(0,u.z)(s.default);for(var d=[],m=0;m<14;++m)d[m]=.703125/Math.pow(2,m+1);t.default=function(){var e=(0,f.e)({projection:"EPSG:4326"}),t=(0,f.e)(),n=(0,f.e)({projection:"EPSG:3995"}),s=512,u=r.useRef(document.createElement("canvas"));function m(e,t){console.log(t);var n=t.split(",").map(Number),r=n[0],i=n[1],l=n[2],a=u.current.getContext("2d");if(a){var o=256;a.strokeStyle="white",a.textAlign="center",a.font="72px sans-serif",a.clearRect(0,0,s,s),a.fillStyle="rgba(100, 100, 100, 0.5)",a.fillRect(0,0,s,s),a.fillStyle="black",a.fillText("z: "+r,o,176),a.fillText("x: "+i,o,o),a.fillText("y: "+l,o,336),a.strokeRect(0,0,s,s),e.getImage().src=u.current.toDataURL()}}return u.current.width=s,u.current.height=s,r.useEffect((function(){if(e.map){var t=new c.Z({source:new o.Z({url:"{z},{x},{y}",tileLoadFunction:m,transition:0})});e.map.addLayer(t)}}),[e.map]),r.useEffect((function(){if(t.map){var e=new a.Z({extent:[-180,-90,180,90],tileSize:s,resolutions:d}),n=new c.Z({source:new o.Z({projection:"EPSG:4326",url:"{z},{x},{y}",tileGrid:e,tileLoadFunction:m,transition:0})});t.map.addLayer(n)}}),[t.map]),r.useEffect((function(){if(n.map){var e=new a.Z({extent:[-180,-90,180,90],tileSize:s,resolutions:d}),t=new c.Z({source:new o.Z({projection:"EPSG:4326",url:"{z},{x},{y}",tileGrid:e,tileLoadFunction:m,transition:0})});n.map.addLayer(t)}}),[n.map]),r.createElement(r.Fragment,null,r.createElement(l.ZP,null),r.createElement(i.Helmet,null,r.createElement("title",null,"Show Grid"),r.createElement("meta",{name:"description",content:"Show Tile Grid."}),r.createElement("link",{rel:"canonical",href:"https://yonda-yonda.github.io/exmap/grid"}),r.createElement("link",{rel:"icon",type:"image/x-icon",href:"https://github.githubassets.com/favicon.ico"}),r.createElement("link",{rel:"stylesheet",href:"https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"})),r.createElement("h1",null,"view EPSG:4326, grid EPSG:3857"),r.createElement("div",{ref:e.ref,style:{width:"720px",height:"360px",border:"solid 1px"}}),r.createElement("h1",null,"view EPSG:3857, grid EPSG:4326"),r.createElement("div",{ref:t.ref,style:{width:"720px",height:"360px",border:"solid 1px"}}),r.createElement("h1",null,"view EPSG:3995, grid EPSG:4326"),r.createElement("div",{ref:n.ref,style:{width:"720px",height:"360px",border:"solid 1px"}}))}}}]);
//# sourceMappingURL=component---src-pages-grid-index-tsx-e396ec7a679e554b2c73.js.map