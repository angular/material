@ngdoc content
@name Internet Explorer
@description

# Introduction

AngularJS Material is a cutting edge framework which uses advanced CSS features.
Internet Explorer is known to have performance issues with some of these features. 
Some of the notable issues are related to layout calculations, animations, and border rendering. 
In this document, we will provide optimizations which can improve performance in 
Internet Explorer.

This document should be consulted after the AngularJS code in an application is optimized: 
1. Reduce the number of watchers
1. Enable production mode, etc.

# Theming

AngularJS Material theming works by injecting inline styles into the `<head>`. The benefit
is that the theme can be switched or modified at runtime. Unfortunately these inline styles can 
present a performance burden for Internet Explorer. When switching or modifying themes at runtime
is not a requirement, the theming CSS can be exported to an external file which can be loaded statically.
The following steps should be performed:

* Configure your theme as explained [here](Theming/03_configuring_a_theme)
 - This step is only required when a custom theme is used
* Run the application in Chrome 
* Open the Chrome DevTools
* Execute the following javascript - <i>This copies the theming CSS to the clipboard</i>

<hljs lang="js">
copy([].slice.call(document.styleSheets)
  .map(e => e.ownerNode)
  .filter(e => e.hasAttribute('md-theme-style'))
  .map(e => e.textContent)
  .join('\n');
);
</hljs>

* Paste the content to a static, external CSS file and link it to the app's `index.html`.
* In the top level AngularJS modules of the application, add the following code to disable
  the injection of styles:

<hljs lang="js">
angular
  .module('myApp', ['ngMaterial'])
  .config(function($mdThemingProvider) {
    $mdThemingProvider.disableTheming();
});
</hljs>

<br>

# Directives that can help

## Virtual Repeat

One of the greatest issues with Internet Explorer, is the slow layout calculation. 
The more elements are in the dom, the slower the calculations are. 
This is especially important with ng-repeat.
Let's take the following [Example](https://codepen.io/team/AngularMaterial/pen/GdjVvP):

<hljs lang="html">
<md-list>
  <md-list-item ng-repeat="person in people"
                ng-click="goToPerson(person.name, $event)">
    <img alt="{{::person.name }}" ng-src="{{::person.img }}" class="md-avatar">
    <p>{{::person.name }}</p>
    <md-checkbox class="md-secondary" ng-model="person.selected"></md-checkbox>
    <md-icon md-svg-icon="communication:email" ng-click="doSecondaryAction($event)"
             aria-label="Send Email" class="md-secondary md-hue-3"></md-icon>
    <md-icon class="md-secondary" ng-click="doSecondaryAction($event)" aria-label="Chat"
             md-svg-icon="communication:message"></md-icon>
  </md-list-item>
</md-list>
</hljs>

In this example, a list of people is shown. When a person is clicked, a `md-dialog` is opened. 
The opening of the dialog inserts a md-backdrop and a layout calculation of the whole DOM is triggered. 
The bigger the list gets, the opening of the dialog is slowed down.

The best solution is to keep the DOM small. The list elements which should be in the DOM are just the
elements which fit in the viewport at any one time.
This can be achieved by using [Virtual Repeat](https://material.angularjs.org/latest/demo/virtualRepeat).

The [solution](https://codepen.io/team/AngularMaterial/pen/yjamqa) is easy and elegant:

<hljs lang="html">
<md-content layout="column" ng-controller="ListCtrl">
  <md-virtual-repeat-container id="vertical-container">
    <md-list>
      <md-list-item md-virtual-repeat="person in people"
                    ng-click="goToPerson(person.name, $event)">
        <img alt="{{ person.name }}" ng-src="{{ person.img }}" class="md-avatar">
        <p>{{ person.name }}</p>
        <md-checkbox class="md-secondary" ng-model="person.selected"></md-checkbox>
        <md-icon md-svg-icon="communication:email" ng-click="doSecondaryAction($event)"
                 aria-label="Send Email" class="md-secondary md-hue-3"></md-icon>
        <md-icon class="md-secondary" ng-click="doSecondaryAction($event)" aria-label="Chat"
                 md-svg-icon="communication:message"></md-icon>
      </md-list-item>
    </md-list>
  </md-virtual-repeat-container>
</md-content>
</hljs>

The virtual repeat directive only adds, to the dom, the elements visible in the viewport. 
When the view is scrolled the existing elements are reused.
Using this solution, the virtual repeat directive supports real-time scrolling through millions of 
records (assuming all in-memory). 

**Caveat**: Virtual Repeat requires the height of all list items to be equal and static.
This restriction is key to the performance that it provides.
<br>

# Directives to use with Caution

## Tabs

The [Tabs](https://material.angularjs.org/latest/demo/tabs) directive is capable of some very nice
animations. This comes at a cost of layout calculations which increase in cost as DOM items are added
to the content of the tabs. Internet Explorer's layout calculations are slower than other browsers
when Flexbox is involved. This means that tabs that work fine on Chrome and Firefox, may lag for
your IE users. The primary alternative to the Tabs directive is the 
[NavBar](https://material.angularjs.org/latest/demo/navBar) directive.

Another alternative is to:

* use a single external content to represent the currently selected tab content area
* use Tabs selectedIndex to route or switch the content in the external content area

The [Material Adaptive Shrine](https://github.com/angular/material-adaptive/blob/61417580a8c8cfd454364b7f6d16d0a9b22896f4/shrine/app/src/dashboard/tmpl/dashboard.html#L11-L16)
app has an example of this.

* Previously each tab had a child featuredItem and a productGrid component... this caused perf issues.
* It was refactored to move to using a single external productGrid outside the tabs (aka navBar)
* It now uses `md-on-select` or data binding to update the productGrid content.

<br>

# Bells and whistles

AngularJS Material comes with all of the bells and whistles turned on by default. 
These can be switched off selectively for Internet Explorer.

## Gestures

Disabling support for touch gestures across the app can improve performance in IE.

<hljs lang="js">
var isIE = window.document.documentMode;

angular
  .module('myApp', ['ngMaterial'])
  .config( function($mdGestureProvider) {
    if (isIE) {
      $mdGestureProvider.disableAll();
    }
  });
</hljs>

## Ink ripples

The material ink ripple animation effects can be turned off using the `$mdInkRippleProvider`.

### Example

<hljs lang="js">
var isIE = window.document.documentMode;

angular
  .module('myApp', ['ngMaterial'])
  .config( function($mdInkRippleProvider) {
    if (isIE) {
      $mdInkRippleProvider.disableInkRipple();
    }
  });
</hljs>
