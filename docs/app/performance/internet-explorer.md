# Introduction

Angular Material is a cutting edge framework, which uses extensively advanced css features. Internet Explorer is known to have performance issues with these features. Some of the notable issues are with Layout calculations, animations and border rendering. In this documentation we will provide a couple of optimizations which could make the performance in Internet Explorer better.
This document should just be consulted after the angular part of the application was optimized: Reducing the number of watchers, enable production mode, etc.

# Theming

The Angular Material theming works by injecting inline styles to the head. The obvious benefit is that the theme can be switched at runtime.  Unfortunately these inline styles are a performance burden for Internet Explorer. When switching of themes at runtime are not important, the theming css could be exported to an external file. The following stages should be performed:

* Configure your theme as explained [here](https://material.angularjs.org/latest/Theming/03_configuring_a_theme) - This step is just required when a custom theme is used
* Run the application in chrome 
* Open the chrome developer tools
* Execute the following javascript - This copies the theming css to the clipboard
```javascript
copy([].slice.call(document.styleSheets)
  .map(e => e.ownerNode)
  .filter(e => e.hasAttribute('md-theme-style'))
  .map(e => e.textContent)
  .join('\n')
)
```
* Paste the content to an external css file and link it to the index.html
* In the top level angular modules of the application add the following code to disable the style injection:
```javascript
angular
  .module('myApp', ['ngMaterial'])
  .config(function($mdThemingProvider) {
    $mdThemingProvider.disableTheming();
});
```



# Directives to use

## Virtual Repeat

One of the greatest issues with Internet Explorer, is the slow layout calculation. The more elements are in the dom, the slower the calculations are. 
This is especially important with ng-repeat.
Let's take the following [example](http://codepen.io/david-gang/pen/mEeWpq):

```html
<md-list ng-controller="ListCtrl" ng-cloak="" class="listdemoListControls" ng-app="MyApp">
  <md-list-item ng-repeat="person in people" ng-click="goToPerson(person.name, $event)" class="noright">
    <img alt="{{::person.name }}" ng-src="{{::person.img }}" class="md-avatar">
    <p>{{::person.name }}</p>
    <md-checkbox class="md-secondary" ng-model="person.selected"></md-checkbox>
    <md-icon md-svg-icon="communication:email" ng-click="doSecondaryAction($event)" aria-label="Send Email" class="md-secondary md-hue-3"></md-icon>
    <md-icon class="md-secondary" ng-click="doSecondaryAction($event)" aria-label="Chat" md-svg-icon="communication:message"></md-icon>
  </md-list-item>
</md-list>
```
In this example, a list of persons is shown. When a person is clicked, a md-dialog is opened. The opening of the dialog inserts a md-backdrop and a layout calculation of the whole DOM is triggered. The bigger the list gets, the opening of the dialog is slowed down.

The best solution is to keep the DOM small. The list elements which should be in the DOM are just the elements which fit in the viewport at this time.
This can be achieved by using [Virtual Repeat](https://material.angularjs.org/latest/demo/virtualRepeat)

The [solution](http://codepen.io/david-gang/pen/MeamJy) is very easy and elegant :

```html
 <md-content layout="column" ng-controller="ListCtrl" ng-cloak="" class="listdemoListControls" ng-app="MyApp">
<md-virtual-repeat-container id="vertical-container">
  <md-list>
  <md-list-item md-virtual-repeat="person in people" ng-click="goToPerson(person.name, $event)" class="noright">
    <img alt="{{ person.name }}" ng-src="{{ person.img }}" class="md-avatar">
    <p>{{ person.name }}</p>
    <md-checkbox class="md-secondary" ng-model="person.selected"></md-checkbox>
    <md-icon md-svg-icon="communication:email" ng-click="doSecondaryAction($event)" aria-label="Send Email" class="md-secondary md-hue-3"></md-icon>
    <md-icon class="md-secondary" ng-click="doSecondaryAction($event)" aria-label="Chat" md-svg-icon="communication:message"></md-icon>
  </md-list-item>
    </md-list>
</md-virtual-repeat-container>
</md-content>
```
The virtual repeat directive just adds to the dom, the visible elements which fits in the viewport. When the view is scrolled the existing elements are reused.
By this solution, the virtual repeat directive supports real-time scrolling through millions of records (assuming all in-memory).
The solution works unfortunately just when the height of a single list item is fixed.


# Directives to avoid

## Tabs

The [Tabs](https://material.angularjs.org/latest/demo/tabs) directive is very versatile and powerful. This comes at a certain cost of layout calculations. With Intenet Explorer this cost may be too big. An alternative to the Tabs directive could be the [Nav Bar](https://material.angularjs.org/latest/demo/navBar) directive.

Another alternative would be to:

* use a single external content to represent the current select tab content area
* use Tabs selectedIndex to route or switch the content in the external content area

See the app [Material Adaptive Shrine](https://github.com/angular/material-adaptive/blob/master/shrine/app/src/dashboard/tmpl/dashboard.html#L11-L16).

* previously each tab had a child featuredItem and a productGrid component... this caused huge perf issues.
* refactor and moved a single external productGrid outside the tabs (aka navBar)
* uses md-on-select or databinding to update the productGrid content.


#Bells and whistles

Angular material comes with all bells and whistles turned on by default. These could be switched off selectively for Internet Explorer.

##Animations

TODO: Add content from #8329

## Ink ripples

The material ripple effects can be turned off using the $mdInkRippleProvider 

##Example
```javascript
var isIE = window.document.documentMode;

angular
  .module('myApp', ['ngMaterial'])
  .config( function($mdInkRippleProvider) {
    if(isIE) {
      $mdInkRippleProvider.disableInkRipple();
    }
  });
```

