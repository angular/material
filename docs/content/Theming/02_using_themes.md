@ngdoc content
@name Using Themes
@description

To theme your Angular Material application, follow these two steps:

### 1) Include theme stylesheets

Angular Material ships with many available themes, which can be found in the [bower-material themes folder](https://github.com/angular/bower-material/tree/master/themes). And the default *light-blue* theme is already included within **angular-material.css**.

To use other themes and override parts [or all] of the default theme, you must include those extra theme stylesheets. For example, to use the `green` and `indigo` themes with the built-in `default` theme, include extra themes into your html head:

<hljs lang="html">
<title>My App</title>

<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.3.0/angular.js"></script>
<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.3.0/angular-animate.min.js"></script>
<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.3.0/angular-route.min.js"></script>
<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.3.0/angular-aria.min.js"></script>
<script src="/bower_components/angular-material/angular-material.js"></script>

<!-- default themes and core styles -->
<link rel="stylesheet" href="/bower_components/angular-material/angular-material.css">

<!-- extra, overriding theme files -->
<link rel="stylesheet" href="/bower_components/angular-material/themes/indigo-theme.css">
<link rel="stylesheet" href="/bower_components/angular-material/themes/green-theme.css">

<!-- Your custom JavaScript code -->
<script src="myApp.js"></script>
</hljs>

### 2) Set the md-theme attribute

To set a custom theme within an area of your application, set the `md-theme` attribute on an element. Then that element and all of its children will inherit that theme (see [how it works in detail](http://localhost:8080/#/Theming/04_how_it_works). 

An element will use the default theme if no `md-theme` is defined on that element or any of its ancestors.

<hljs lang="html">
<div ng-app="myApp" ng-controller="myAppController" layout="vertical">
        
  <!-- The md-toolbar and all of its children will use the indigo theme -->
  <md-toolbar md-theme="indigo">
    
  </md-toolbar>
         
  <!-- The md-content and all of its children will use the green theme -->
  <md-content md-theme="green">
    
  </md-content>

  <!-- The button uses default-theme, since no md-theme is found -->
  <md-button>Hello</md-button>
    
</div>
</hljs>

Individual components can also override the inherited theme:

<hljs lang="html">
  <md-progress-linear md-theme="red" mode="determinate" ng-value="determinateValue" ></md-progress-linear>
  <md-progress-linear md-theme="deep-orange" mode="buffer" value="{{determinateValue}}" secondaryValue="{{determinateValue2}}"></md-progress-linear>
  <md-progress-linear md-theme="yellow" mode="{{mode}}" value="{{determinateValue}}"></md-progress-linear>
  <md-progress-linear md-theme="green" mode="determinate" ng-value="determinateValue" ></md-progress-linear>
  <md-progress-linear md-theme="blue" mode="buffer" value="{{determinateValue}}" secondaryValue="{{determinateValue2}}"></md-progress-linear>
  <md-progress-linear md-theme="indigo" mode="{{mode}}" value="{{determinateValue}}"></md-progress-linear>
</hljs>

<img src="https://cloud.githubusercontent.com/assets/210413/4825301/a45d735a-5f63-11e4-8597-60386f35fc68.png" alt="progress bars themed" style="max-width: 100%;">
