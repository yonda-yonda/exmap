"use strict";(self.webpackChunkexmap=self.webpackChunkexmap||[]).push([[656],{48958:function(r,e,n){n.d(e,{Z:function(){return l}});var a=n(15861),t=n(15671),o=n(43144),i=n(87757),s=n.n(i);function f(r,e){var n=r.length-e,a=0;do{for(var t=e;t>0;t--)r[a+e]+=r[a],a++;n-=e}while(n>0)}function c(r,e,n){for(var a=0,t=r.length,o=t/n;t>e;){for(var i=e;i>0;--i)r[a+e]+=r[a],++a;t-=e}for(var s=r.slice(),f=0;f<o;++f)for(var c=0;c<n;++c)r[n*f+c]=s[(n-c-1)*o+f]}function u(r,e,n,a,t,o){if(!e||1===e)return r;for(var i=0;i<t.length;++i){if(t[i]%8!=0)throw new Error("When decoding with predictor, only multiple of 8 bits are supported.");if(t[i]!==t[0])throw new Error("When decoding with predictor, all samples must have the same size.")}for(var s=t[0]/8,u=2===o?1:t.length,l=0;l<a&&!(l*u*n*s>=r.byteLength);++l){var h=void 0;if(2===e){switch(t[0]){case 8:h=new Uint8Array(r,l*u*n*s,u*n*s);break;case 16:h=new Uint16Array(r,l*u*n*s,u*n*s/2);break;case 32:h=new Uint32Array(r,l*u*n*s,u*n*s/4);break;default:throw new Error("Predictor 2 not allowed with ".concat(t[0]," bits per sample."))}f(h,u)}else 3===e&&c(h=new Uint8Array(r,l*u*n*s,u*n*s),u,s)}return r}var l=function(){function r(){(0,t.Z)(this,r)}var e;return(0,o.Z)(r,[{key:"decode",value:(e=(0,a.Z)(s().mark((function r(e,n){var a,t,o,i,f;return s().wrap((function(r){for(;;)switch(r.prev=r.next){case 0:return r.next=2,this.decodeBlock(n);case 2:if(a=r.sent,1===(t=e.Predictor||1)){r.next=9;break}return o=!e.StripOffsets,i=o?e.TileWidth:e.ImageWidth,f=o?e.TileLength:e.RowsPerStrip||e.ImageLength,r.abrupt("return",u(a,t,i,f,e.BitsPerSample,e.PlanarConfiguration));case 9:return r.abrupt("return",a);case 10:case"end":return r.stop()}}),r,this)}))),function(r,n){return e.apply(this,arguments)})}]),r}()},46656:function(r,e,n){n.r(e),n.d(e,{default:function(){return x}});var a=n(60136),t=n(6215),o=n(61120),i=n(15671),s=n(43144),f=n(48958);function c(r){var e=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(r){return!1}}();return function(){var n,a=(0,o.Z)(r);if(e){var i=(0,o.Z)(this).constructor;n=Reflect.construct(a,arguments,i)}else n=a.apply(this,arguments);return(0,t.Z)(this,n)}}var u=new Int32Array([0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,12,19,26,33,40,48,41,34,27,20,13,6,7,14,21,28,35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63]),l=4017,h=799,v=3406,d=2276,m=1567,p=3784,b=5793,w=2896;function k(r,e){for(var n=0,a=[],t=16;t>0&&!r[t-1];)--t;a.push({children:[],index:0});for(var o,i=a[0],s=0;s<t;s++){for(var f=0;f<r[s];f++){for((i=a.pop()).children[i.index]=e[n];i.index>0;)i=a.pop();for(i.index++,a.push(i);a.length<=s;)a.push(o={children:[],index:0}),i.children[i.index]=o.children,i=o;n++}s+1<t&&(a.push(o={children:[],index:0}),i.children[i.index]=o.children,i=o)}return a[0].children}function y(r,e,n,a,t,o,i,s,f){var c=n.mcusPerLine,l=n.progressive,h=e,v=e,d=0,m=0;function p(){if(m>0)return m--,d>>m&1;if(255===(d=r[v++])){var e=r[v++];if(e)throw new Error("unexpected marker: ".concat((d<<8|e).toString(16)))}return m=7,d>>>7}function b(r){for(var e,n=r;null!==(e=p());){if("number"==typeof(n=n[e]))return n;if("object"!=typeof n)throw new Error("invalid huffman sequence")}return null}function w(r){for(var e=r,n=0;e>0;){var a=p();if(null===a)return;n=n<<1|a,--e}return n}function k(r){var e=w(r);return e>=1<<r-1?e:e+(-1<<r)+1}var y=0;var g,P=0;function x(r,e,n,a,t){var o=n%c,i=(n/c|0)*r.v+a,s=o*r.h+t;e(r,r.blocks[i][s])}function C(r,e,n){var a=n/r.blocksPerLine|0,t=n%r.blocksPerLine;e(r,r.blocks[a][t])}var T,A,L,E,Z,I,U=a.length;I=l?0===o?0===s?function(r,e){var n=b(r.huffmanTableDC),a=0===n?0:k(n)<<f;r.pred+=a,e[0]=r.pred}:function(r,e){e[0]|=p()<<f}:0===s?function(r,e){if(y>0)y--;else for(var n=o,a=i;n<=a;){var t=b(r.huffmanTableAC),s=15&t,c=t>>4;if(0===s){if(c<15){y=w(c)+(1<<c)-1;break}n+=16}else e[u[n+=c]]=k(s)*(1<<f),n++}}:function(r,e){for(var n=o,a=i,t=0;n<=a;){var s=u[n],c=e[s]<0?-1:1;switch(P){case 0:var l=b(r.huffmanTableAC),h=15&l;if(t=l>>4,0===h)t<15?(y=w(t)+(1<<t),P=4):(t=16,P=1);else{if(1!==h)throw new Error("invalid ACn encoding");g=k(h),P=t?2:3}continue;case 1:case 2:e[s]?e[s]+=(p()<<f)*c:0==--t&&(P=2===P?3:0);break;case 3:e[s]?e[s]+=(p()<<f)*c:(e[s]=g<<f,P=0);break;case 4:e[s]&&(e[s]+=(p()<<f)*c)}n++}4===P&&0==--y&&(P=0)}:function(r,e){var n=b(r.huffmanTableDC),a=0===n?0:k(n);r.pred+=a,e[0]=r.pred;for(var t=1;t<64;){var o=b(r.huffmanTableAC),i=15&o,s=o>>4;if(0===i){if(s<15)break;t+=16}else e[u[t+=s]]=k(i),t++}};var D,q,z=0;q=1===U?a[0].blocksPerLine*a[0].blocksPerColumn:c*n.mcusPerColumn;for(var O=t||q;z<q;){for(A=0;A<U;A++)a[A].pred=0;if(y=0,1===U)for(T=a[0],Z=0;Z<O;Z++)C(T,I,z),z++;else for(Z=0;Z<O;Z++){for(A=0;A<U;A++){var R=T=a[A],M=R.h,S=R.v;for(L=0;L<S;L++)for(E=0;E<M;E++)x(T,I,z,L,E)}if(++z===q)break}if(m=0,(D=r[v]<<8|r[v+1])<65280)throw new Error("marker was not found");if(!(D>=65488&&D<=65495))break;v+=2}return v-h}function g(r,e){var n=[],a=e.blocksPerLine,t=e.blocksPerColumn,o=a<<3,i=new Int32Array(64),s=new Uint8Array(64);function f(r,n,a){var t,o,i,s,f,c,u,k,y,g,P=e.quantizationTable,x=a;for(g=0;g<64;g++)x[g]=r[g]*P[g];for(g=0;g<8;++g){var C=8*g;0!==x[1+C]||0!==x[2+C]||0!==x[3+C]||0!==x[4+C]||0!==x[5+C]||0!==x[6+C]||0!==x[7+C]?(t=b*x[0+C]+128>>8,o=b*x[4+C]+128>>8,i=x[2+C],s=x[6+C],f=w*(x[1+C]-x[7+C])+128>>8,k=w*(x[1+C]+x[7+C])+128>>8,c=x[3+C]<<4,u=x[5+C]<<4,y=t-o+1>>1,t=t+o+1>>1,o=y,y=i*p+s*m+128>>8,i=i*m-s*p+128>>8,s=y,y=f-u+1>>1,f=f+u+1>>1,u=y,y=k+c+1>>1,c=k-c+1>>1,k=y,y=t-s+1>>1,t=t+s+1>>1,s=y,y=o-i+1>>1,o=o+i+1>>1,i=y,y=f*d+k*v+2048>>12,f=f*v-k*d+2048>>12,k=y,y=c*h+u*l+2048>>12,c=c*l-u*h+2048>>12,u=y,x[0+C]=t+k,x[7+C]=t-k,x[1+C]=o+u,x[6+C]=o-u,x[2+C]=i+c,x[5+C]=i-c,x[3+C]=s+f,x[4+C]=s-f):(y=b*x[0+C]+512>>10,x[0+C]=y,x[1+C]=y,x[2+C]=y,x[3+C]=y,x[4+C]=y,x[5+C]=y,x[6+C]=y,x[7+C]=y)}for(g=0;g<8;++g){var T=g;0!==x[8+T]||0!==x[16+T]||0!==x[24+T]||0!==x[32+T]||0!==x[40+T]||0!==x[48+T]||0!==x[56+T]?(t=b*x[0+T]+2048>>12,o=b*x[32+T]+2048>>12,i=x[16+T],s=x[48+T],f=w*(x[8+T]-x[56+T])+2048>>12,k=w*(x[8+T]+x[56+T])+2048>>12,c=x[24+T],u=x[40+T],y=t-o+1>>1,t=t+o+1>>1,o=y,y=i*p+s*m+2048>>12,i=i*m-s*p+2048>>12,s=y,y=f-u+1>>1,f=f+u+1>>1,u=y,y=k+c+1>>1,c=k-c+1>>1,k=y,y=t-s+1>>1,t=t+s+1>>1,s=y,y=o-i+1>>1,o=o+i+1>>1,i=y,y=f*d+k*v+2048>>12,f=f*v-k*d+2048>>12,k=y,y=c*h+u*l+2048>>12,c=c*l-u*h+2048>>12,u=y,x[0+T]=t+k,x[56+T]=t-k,x[8+T]=o+u,x[48+T]=o-u,x[16+T]=i+c,x[40+T]=i-c,x[24+T]=s+f,x[32+T]=s-f):(y=b*a[g+0]+8192>>14,x[0+T]=y,x[8+T]=y,x[16+T]=y,x[24+T]=y,x[32+T]=y,x[40+T]=y,x[48+T]=y,x[56+T]=y)}for(g=0;g<64;++g){var A=128+(x[g]+8>>4);n[g]=A<0?0:A>255?255:A}}for(var c=0;c<t;c++){for(var u=c<<3,k=0;k<8;k++)n.push(new Uint8Array(o));for(var y=0;y<a;y++){f(e.blocks[c][y],s,i);for(var g=0,P=y<<3,x=0;x<8;x++)for(var C=n[u+x],T=0;T<8;T++)C[P+T]=s[g++]}}return n}var P=function(){function r(){(0,i.Z)(this,r),this.jfif=null,this.adobe=null,this.quantizationTables=[],this.huffmanTablesAC=[],this.huffmanTablesDC=[],this.resetFrames()}return(0,s.Z)(r,[{key:"resetFrames",value:function(){this.frames=[]}},{key:"parse",value:function(r){var e=0;function n(){var n=r[e]<<8|r[e+1];return e+=2,n}function a(r){var e,n,a=0,t=0;for(n in r.components)r.components.hasOwnProperty(n)&&(a<(e=r.components[n]).h&&(a=e.h),t<e.v&&(t=e.v));var o=Math.ceil(r.samplesPerLine/8/a),i=Math.ceil(r.scanLines/8/t);for(n in r.components)if(r.components.hasOwnProperty(n)){e=r.components[n];for(var s=Math.ceil(Math.ceil(r.samplesPerLine/8)*e.h/a),f=Math.ceil(Math.ceil(r.scanLines/8)*e.v/t),c=o*e.h,u=i*e.v,l=[],h=0;h<u;h++){for(var v=[],d=0;d<c;d++)v.push(new Int32Array(64));l.push(v)}e.blocksPerLine=s,e.blocksPerColumn=f,e.blocks=l}r.maxH=a,r.maxV=t,r.mcusPerLine=o,r.mcusPerColumn=i}var t,o,i=n();if(65496!==i)throw new Error("SOI not found");for(i=n();65497!==i;){switch(i){case 65280:break;case 65504:case 65505:case 65506:case 65507:case 65508:case 65509:case 65510:case 65511:case 65512:case 65513:case 65514:case 65515:case 65516:case 65517:case 65518:case 65519:case 65534:var s=(t=void 0,o=void 0,t=n(),o=r.subarray(e,e+t-2),e+=o.length,o);65504===i&&74===s[0]&&70===s[1]&&73===s[2]&&70===s[3]&&0===s[4]&&(this.jfif={version:{major:s[5],minor:s[6]},densityUnits:s[7],xDensity:s[8]<<8|s[9],yDensity:s[10]<<8|s[11],thumbWidth:s[12],thumbHeight:s[13],thumbData:s.subarray(14,14+3*s[12]*s[13])}),65518===i&&65===s[0]&&100===s[1]&&111===s[2]&&98===s[3]&&101===s[4]&&0===s[5]&&(this.adobe={version:s[6],flags0:s[7]<<8|s[8],flags1:s[9]<<8|s[10],transformCode:s[11]});break;case 65499:for(var f=n()+e-2;e<f;){var c=r[e++],l=new Int32Array(64);if(c>>4==0)for(var h=0;h<64;h++){l[u[h]]=r[e++]}else{if(c>>4!=1)throw new Error("DQT: invalid table spec");for(var v=0;v<64;v++){l[u[v]]=n()}}this.quantizationTables[15&c]=l}break;case 65472:case 65473:case 65474:n();for(var d={extended:65473===i,progressive:65474===i,precision:r[e++],scanLines:n(),samplesPerLine:n(),components:{},componentsOrder:[]},m=r[e++],p=void 0,b=0;b<m;b++){p=r[e];var w=r[e+1]>>4,g=15&r[e+1],P=r[e+2];d.componentsOrder.push(p),d.components[p]={h:w,v:g,quantizationIdx:P},e+=3}a(d),this.frames.push(d);break;case 65476:for(var x=n(),C=2;C<x;){for(var T=r[e++],A=new Uint8Array(16),L=0,E=0;E<16;E++,e++)A[E]=r[e],L+=A[E];for(var Z=new Uint8Array(L),I=0;I<L;I++,e++)Z[I]=r[e];C+=17+L,T>>4==0?this.huffmanTablesDC[15&T]=k(A,Z):this.huffmanTablesAC[15&T]=k(A,Z)}break;case 65501:n(),this.resetInterval=n();break;case 65498:n();for(var U=r[e++],D=[],q=this.frames[0],z=0;z<U;z++){var O=q.components[r[e++]],R=r[e++];O.huffmanTableDC=this.huffmanTablesDC[R>>4],O.huffmanTableAC=this.huffmanTablesAC[15&R],D.push(O)}var M=r[e++],S=r[e++],j=r[e++],B=y(r,e,q,D,this.resetInterval,M,S,j>>4,15&j);e+=B;break;case 65535:255!==r[e]&&e--;break;default:if(255===r[e-3]&&r[e-2]>=192&&r[e-2]<=254){e-=3;break}throw new Error("unknown JPEG marker ".concat(i.toString(16)))}i=n()}}},{key:"getResult",value:function(){var r=this.frames;if(0===this.frames.length)throw new Error("no frames were decoded");this.frames.length>1&&console.warn("more than one frame is not supported");for(var e=0;e<this.frames.length;e++)for(var n=this.frames[e].components,a=0,t=Object.keys(n);a<t.length;a++){var o=t[a];n[o].quantizationTable=this.quantizationTables[n[o].quantizationIdx],delete n[o].quantizationIdx}for(var i=r[0],s=i.components,f=i.componentsOrder,c=[],u=i.samplesPerLine,l=i.scanLines,h=0;h<f.length;h++){var v=s[f[h]];c.push({lines:g(0,v),scaleX:v.h/i.maxH,scaleY:v.v/i.maxV})}for(var d=new Uint8Array(u*l*c.length),m=0,p=0;p<l;++p)for(var b=0;b<u;++b)for(var w=0;w<c.length;++w){var k=c[w];d[m]=k.lines[0|p*k.scaleY][0|b*k.scaleX],++m}return d}}]),r}(),x=function(r){(0,a.Z)(n,r);var e=c(n);function n(r){var a;return(0,i.Z)(this,n),(a=e.call(this)).reader=new P,r.JPEGTables&&a.reader.parse(r.JPEGTables),a}return(0,s.Z)(n,[{key:"decodeBlock",value:function(r){return this.reader.resetFrames(),this.reader.parse(new Uint8Array(r)),this.reader.getResult().buffer}}]),n}(f.Z)}}]);
//# sourceMappingURL=656-3f8a6c068ee3dbe898dc.js.map