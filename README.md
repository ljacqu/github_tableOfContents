# GitHub Table of Contents Markdown Creator

Bookmarklet written in plain JavaScript to generate a table of contents
in markdown for the markdown page or Wiki page you are viewing.

Simply create a bookmark and add the following as the address:
```javascript
javascript:(function(){var t,n=["H1","H2","H3","H4","H5","H6"],e={u:function(){return"-"},o:function(){return"1."},f:function(t){return 0===t%3F"1.":"-"}},r=function(t,n,e){this.h=t,this.t=n,this.i=e},i=document,o=function(t,n){return t.getElementsByTagName(n)},u=function(t){return t%3Ft[0]:null},c=function(){var t=i.getElementById("readme");return t%3Fu(o(t,"article")):(t=i.getElementById("wiki-body"),t%3Fu(o(t,"div")):null)},a=function(){var e=function(t){var n=u(o(t,"a"));return n%26%26n.classList.contains("anchor")%3Fnew r(n.getAttribute("href"),t.textContent.trim(),parseInt(t.nodeName.substr(1),10)-1):null},i=function(t){for(var n={},e=0;e<t.length;++e)n[t[e].i]=!0;for(var r={},i=0,o=0;5>=o;++o)n[o]%26%26(r[o]=i,++i);for(var u=0;u<t.length;++u){var c=t[u];c.i=r[c.i]}},c=function(r){for(var o=[],u=0;u<r.children.length;++u){var c=r.children[u];if(n.indexOf(c.nodeName)>=0){var a=e(c);a%26%26o.push(a)}}i(o),t=o};return{g:c}}(),f=function(){var n,r={l:e.u,s:!1},o=function(n){for(var e=[],r=n.s%3F-1:0,i=0;i<t.length;++i){var o=t[i];if(!n.s||0!==o.i){var u=o.i+r,c=n.l(u);e.push("  ".repeat(u)+c+" ["+o.t+"]("+o.h+")")}}return e},u=function(){if(t.length<=1)return!1;for(var n=0;n<t.length;++n)if(0!==t[n].i)return!0;return!1},c=function(){if(t.length<=1||0!==t[0].i)return!1;for(var n=1;n<t.length;++n)if(0===t[n].i)return!1;return!0},a=function(t){return i.createElement(t%3Ft:"button")},f=function(t,n,e){t.setAttribute(n,e)},l=function(t){var n="checked";f(t,n,n)},d=function(t,n){t.appendChild(n)},s=function(){var t=a("textarea");return t.style.width="100%25",t.style.height="100%25",t.id="toc-result",t},v=function(){var t=o(r);n.value=t.join("\n")},h=function(t){var n=a();return n.textContent="Close",n.onclick=function(){return t.parentNode.removeChild(t),!1},n},p=function(){var t=a();return t.textContent="Copy",t.onclick=function(){try{n.select(),i.execCommand("copy"),n.blur()}catch(t){n.style.borderColor="%23900"}},t},g=function(t,n,o){var u=a("input");f(u,"type","radio"),f(u,"name","toclisttype"),u.onclick=function(){r.l=n,v()},n===e.u%26%26l(u),d(t,u);var c=i.createTextNode(" "+o+" ");d(t,c)},m=function(t){if(r.s||u()){var n=a("input");f(n,"type","checkbox"),f(n,"name","skiptoplevel"),r.s%26%26l(n),n.onchange=function(){r.s=this.checked,v()},d(t,n);var e=i.createTextNode(" Exclude top-level titles");d(t,e)}},y=function(t){var n=t.style;n.position="fixed",n.top="0",n.left="0",n.zIndex="5",n.backgroundColor="%23eee",n.width="100%25",n.height="100%25",n.padding="40px"},x=function(t){d(t,i.createTextNode(" "))};return{d:function(){r.s=c();var t=a("div");n=s(),v(),d(t,n),d(t,h(t)),x(t),d(t,p()),x(t),g(t,e.u,"unordered"),g(t,e.o,"ordered"),g(t,e.f,"first level numbered"),m(t),y(t),d(i.body,t)}}}(),l=c();l%3Fa.g(l):t=[new r("","Error: could not find any markdown document!",0)],f.d()})();
```