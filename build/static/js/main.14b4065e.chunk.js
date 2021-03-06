(this["webpackJsonprext.es"]=this["webpackJsonprext.es"]||[]).push([[0],[,,,,,,,,,function(e){e.exports=JSON.parse('[{"open":true,"title":"Tones","items":[{"id":"exposure","name":"exposure","min":"-0.8","max":"0.8","value":"0","step":"0.01"},{"id":"brightness","name":"brightness","min":"-0.9","max":"0.9","value":"0","step":"0.01"},{"id":"contrast","name":"contrast","min":"-0.8","max":"0.8","value":"0","step":"0.01"},{"id":"whites","name":"whites","min":"-0.3","max":"0.3","value":"0","step":"0.01"},{"id":"highlights","name":"highlights","min":"-0.3","max":"0.3","value":"0","step":"0.01"},{"id":"shadows","name":"shadows","min":"-0.3","max":"0.3","value":"0","step":"0.01"},{"id":"blacks","name":"blacks","min":"-0.3","max":"0.3","value":"0","step":"0.01"},{"id":"radiance","name":"radiance","min":"-1","max":"1","value":"0","step":"0.01"},{"id":"hdr","name":"hdr","min":"-1","max":"1","value":"0","step":"0.01"}]},{"title":"Color","open":false,"items":[{"id":"temperature","name":"temperature","min":"-1","max":"1","value":"0","step":"0.01"},{"id":"tint","name":"tint","min":"-1","max":"1","value":"0","step":"0.01"},{"id":"saturation","name":"saturation","min":"-1","max":"1","value":"0","step":"0.01"},{"id":"bAndW","name":"bAndW","min":"-1","max":"1","value":"0","step":"0.01"},{"id":"lightFill","name":"lightFill","min":"0","max":"0.8","value":"0","step":"0.01"},{"id":"lightColor","name":"lightColor","min":"0","max":"1","value":"0","step":"0.01"},{"id":"lightSat","name":"lightSat","min":"0","max":"1","value":"1","step":"0.01"},{"id":"darkFill","name":"darkFill","min":"0","max":"0.8","value":"0","step":"0.01"},{"id":"darkColor","name":"darkColor","min":"0","max":"1","value":"0","step":"0.01"},{"id":"darkSat","name":"darkSat","min":"0","max":"1","value":"1","step":"0.01"}]},{"title":"Details","open":false,"items":[{"id":"sharpen","name":"sharpen","min":"-1","max":"1","value":"0","step":"0.01"},{"id":"sharpen_radius","name":"sharpen_radius","min":"0.1","max":"2","value":"0","step":"0.01"},{"id":"masking","name":"masking","min":"0","max":"1","value":"0","step":"0.01"},{"id":"dehaze","name":"dehaze","min":"-0.9","max":"0.9","value":"0","step":"0.01"},{"id":"atmosferic_light","name":"atmosferic_light","min":"0","max":"1","value":"0","step":"0.01"}]}]')},,,,,,,function(e,t,a){},function(e,t,a){},function(e,t,a){},function(e,t,a){},,function(e,t,a){"use strict";a.r(t);var n=a(1),i=a.n(n),s=a(7),c=a.n(s),r=a(6),l=a.n(r),m=a(8),d=a(4),o=a(2),h=a(3),u=(a(16),a(17),a(18),a(19),a(9)),x=a(0),j=function(e){var t=i.a.useState({Tones:!0}),a=Object(h.a)(t,2),n=a[0],s=a[1];return Object(x.jsx)(x.Fragment,{children:u.map((function(t){return Object(x.jsxs)("div",{className:"menu-container "+(n[t.title]?"open":""),children:[Object(x.jsxs)("div",{className:"menu-container-title",onClick:function(e){return function(e){var t=Object(o.a)({},n);void 0===t[e.title]&&(t[e.title]=!1),t[e.title]=!t[e.title],s(t)}(t)},children:[Object(x.jsx)("div",{className:"text",children:t.title}),Object(x.jsx)("div",{className:"expand-submenu-icon",children:"+"})]}),t.items.map((function(t){return Object(x.jsxs)("div",{className:"menu_item",children:[Object(x.jsx)("div",{className:"text left",children:t.name}),Object(x.jsx)("input",{type:"range",className:"range",min:t.min,max:t.max,defaultValue:t.value,value:e.params[t.id],step:t.step,onChange:function(a){return e.onChange(t.id,parseFloat(a.target.value))}})]})}))]})}))})},v=a(10),b={hdr:0,exposure:0,temperature:0,tint:0,brightness:0,saturation:0,contrast:0,sharpen:0,masking:0,sharpen_radius:0,radiance:0,highlights:0,shadows:0,whites:0,blacks:0,dehaze:0,bAndW:0,atmosferic_light:0,lightFill:0,lightColor:0,lightSat:1,darkFill:0,darkColor:0,darkSat:1},p=new v.a,g=i.a.memo((function(){document.title="Rext Image Editor";var e=i.a.useState(!1),t=Object(h.a)(e,2),a=t[0],n=t[1],s=i.a.useState(b),c=Object(h.a)(s,2),r=c[0],u=c[1],v=i.a.createRef(),g=i.a.createRef(),f=function(e){a&&(u(e),p.updateParams(e),p.update())},O=function(){var e=Object(m.a)(l.a.mark((function e(){var t,n,i;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(a){e.next=2;break}return e.abrupt("return");case 2:return e.next=4,p.blob();case 4:t=e.sent,n=URL.createObjectURL(t),(i=document.createElement("a")).href=n,i.download="image.jpg",document.body.append(i),i.click(),document.body.removeChild(i),URL.revokeObjectURL(n);case 13:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}();return Object(x.jsx)("div",{className:"rext",children:Object(x.jsxs)("div",{className:"rext-container",children:[Object(x.jsxs)("div",{className:"rext-toolbar",children:[Object(x.jsxs)("div",{className:"box-buttons",children:[Object(x.jsxs)("div",{id:"image-open",className:"box-button",onClick:function(){var e;return null===(e=g.current)||void 0===e?void 0:e.click()},children:[Object(x.jsx)("div",{className:"box-button-image",children:Object(x.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",children:[Object(x.jsx)("path",{d:"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",fill:"white"}),Object(x.jsx)("path",{d:"M0 0h24v24H0z",fill:"none"})]})}),Object(x.jsx)("span",{children:"Abrir"})]}),Object(x.jsxs)("div",{className:"box-button data-action","data-action":"reset",onClick:function(){f(b)},children:[Object(x.jsx)("div",{className:"box-button-image",children:Object(x.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",children:[Object(x.jsx)("path",{fill:"none",d:"M0 0h24v24H0V0z"}),Object(x.jsx)("path",{fill:"white",d:"M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"})]})}),Object(x.jsx)("span",{children:"Reiniciar"})]}),Object(x.jsxs)("div",{id:"image-save",className:"box-button",onClick:function(){return O()},children:[Object(x.jsx)("div",{className:"box-button-image",children:Object(x.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",children:[Object(x.jsx)("path",{fill:"none",d:"M0 0h24v24H0V0z"}),Object(x.jsx)("path",{fill:"white",d:"M16 13h-3V3h-2v10H8l4 4 4-4zM4 19v2h16v-2H4z"})]})}),Object(x.jsx)("span",{children:"Guardar"})]})]}),Object(x.jsx)(j,{onChange:function(e,t){var a=Object(o.a)(Object(o.a)({},r),{},Object(d.a)({},e,t));f(a)},params:r})]}),Object(x.jsxs)("div",{className:"rext-canvas",children:[Object(x.jsx)("div",{id:"canvas_info",style:{color:"#FFFFFF"},className:a?"hidden":"",children:"Para comenzar, abra una imagen"}),Object(x.jsx)("canvas",{id:"image_main",ref:v,className:a?"":"hidden",width:"400",height:"400"})]}),Object(x.jsx)("input",{type:"file",id:"image_data",accept:"image/*",ref:g,onChange:function(e){var t=e.target.files[0];a||(p.setCanvas(v.current),n(!0)),p.load(URL.createObjectURL(t))}})]})})})),f=function(e){e&&e instanceof Function&&a.e(3).then(a.bind(null,22)).then((function(t){var a=t.getCLS,n=t.getFID,i=t.getFCP,s=t.getLCP,c=t.getTTFB;a(e),n(e),i(e),s(e),c(e)}))};c.a.render(Object(x.jsx)(i.a.StrictMode,{children:Object(x.jsx)(g,{})}),document.getElementById("root")),f()}],[[21,1,2]]]);
//# sourceMappingURL=main.14b4065e.chunk.js.map