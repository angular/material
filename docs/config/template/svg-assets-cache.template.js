(function() {

  // Note: 'material.svgAssetsCache' is used with Angular Material docs
  // when launching code pen demos; @see codepen.js

  angular.module('material.svgAssetsCache',[])
    .run(function($templateCache) {
      <% items.forEach(function(file) { %>
        $templateCache.put("<%= file.url %>", "<%= file.content.replace(/\"/g, '\\"') %>");
      <% }); %>
    });
})();
