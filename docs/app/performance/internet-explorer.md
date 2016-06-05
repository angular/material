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
copy([].slice
	.call(document.styleSheets)
	.map(e=>e.ownerNode)
	.filter(e => e.attributes && e.attributes[0].nodeName==='md-theme-style')
	.map(e => e.textContent).join("\n")
    )
```
* Paste the content to an external css file and link it to the index.html
* In the top level angular modules of the application add the following code to disable the style injection:
```javascript
angular.module('myApp', ['ngMaterial'])
       .config(function($mdThemingProvider) {
	           $mdThemingProvider.disableTheming();
	});
```



# Directives to use

## Virtual Repeat

One of the greatest issues with Internet Explorer, is the slow layout calculation. The best solution is to keep the DOM small.

This can be achieved by using [Virtual Repeat](https://material.angularjs.org/latest/demo/virtualRepeat)
The solution works unfortunately just when the height of a single list item is fixed.

# Directives to avoid

## Tabs

The [Tabs](https://material.angularjs.org/latest/demo/tabs) directive is very versatile and powerful. This comes at a certain cost of layout calculations. With Intenet Explorer this cost may be too big. An alternative to the Tabs directive could be the [Nav Bar](https://material.angularjs.org/latest/demo/navBar) directive.

#Bells and whistles

Angular material comes with all bells and whistles turned on by default. These could be switched off selectively for Internet Explorer.

##Animations

Animations can be turned off globally by using the $animate service

## Ink ripples

The material ripple effects can be turned off using the $mdInkRippleProvider 

##Example
```javascript
function isBrowserIE() {
    var ua = window.navigator.userAgent;
    return /(MSIE |Trident\/| Edge\/)/.test(ua);
}

var isIE = isBrowserIE();

angular.module('myApp', ['ngMaterial'])
       .config(function($mdInkRippleProvider) {
    	 		if(isIE) {
        			$mdInkRippleProvider.disableInkRipple();
    			}
	  
		})
       .run(function($animate){
    		$animate.enabled(!isIE);
    	});
```

