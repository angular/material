var DemoAssetsInjector = function() {

  var demoModule = angular.module('MyApp');

  demoModule.run(function($templateCache) {
      <% items.forEach(function(file) { %>
        $templateCache.put("<%= file.url %>", "<%= file.content.replace(/\"/g, '\\"') %>");
      <% }); %>
    });
};

document.addEventListener("DOMContentLoaded", function() {
  DemoAssetsInjector();
});
