@ngdoc content
@name Migration to Angular Material
@description

<style>
  table {
    margin: 24px 2px;
    box-shadow: 0 1px 2px rgba(10, 16, 20, 0.24), 0 0 2px rgba(10, 16, 20, 0.12);
    border-radius: 2px;
    background-color: white;
    color: rgba(0,0,0,0.87);
    border-spacing: 0;
  }
  table thead > {
    vertical-align: middle;
    border-color: inherit;
  }
  table thead > tr {
    vertical-align: inherit;
    border-color: inherit;
  }
  table thead > tr > th {
    background-color: white;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    color: #333;
    font-size: 12px;
    font-weight: 500;
    padding: 8px 24px;
    text-align: left;
    line-height: 31px;
    min-width: 64px;
  }
  table tbody > tr > th,
  table tbody > tr > td {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    padding: 16px;
    text-align: left;
    line-height: 15px;
    vertical-align: top;
  }
  h1>a, h2>a, h3>a, h4>a {
    font-weight: 500;
  }
</style>

# Migration to Angular Material and the Angular CDK

While AngularJS Material has not yet entered Long Term Support (LTS) mode like [AngularJS has][172],
the Angular Components team's resources are focused on [Angular Material][171] and the Angular
[Component Dev Kit (CDK)][cdk]. 

For applications with long-term development and support plans, consideration should be made for
migration to the latest version of [Angular][aio], Angular Material, and the CDK.

The official [ngUpgrade guide][ngUpgrade] covers general practices around AngularJS to Angular
migration. This document provides additional guidance specific to AngularJS Material (`v1.1.9+`).

## Table of Contents

- [AngularJS Material features that have moved to the Angular CDK](#cdk)
- [Changes to the theming system](#theming)
- [The extraction of the AngularJS Material layout system into a separate library](#flex-layout)
- [Alternative, light-weight layout options available in the Angular CDK](#cdk-layout)
- [Typography](#typography)
- [A comparison of AngularJS Material to Angular Material features](#comparison)
- [New components in Angular Material](#new-components)
<br><br>

## Key Concepts

The [ngUpgrade Preparation Guide][173] covers a number of important steps for preparing your
application for the migration. In addition to this preparation work, you should use the content of
this document in order to make migration plans based on how features and components have changed
between AngularJS Material and Angular Material.

### <a name="cdk"></a> Angular CDK

Some of the features of AngularJS Material have been made more generic and moved into the [Angular
CDK][cdk]. 

These include:

| AngularJS Material                   | CDK                                                       |
|--------------------------------------|-----------------------------------------------------------|
| [`$mdPanel`][109]                    | [`Overlay`][110]                                          |
| [`md-virtual-repeat`][68]            | [`*cdkVirtualFor`][40]                                    |
| [`md-virtual-repeat-container`][179] | [`cdk-virtual-scroll-viewport`][40]                       |
| [`$mdLiveAnnouncer`][111]            | [`LiveAnnouncer`][112]                                    |
| `$mdUtil`'s [`bidi()`][113] function | [`Directionality` service][114] and [`Dir` directive][180]|
| [`md-input`][52]'s `md-no-autogrow` and `max-rows` | [`CdkTextareaAutosize`][115]                |
| [layout][108] system                 | Covered in [separate section](#cdk-layout) of this guide  |

### <a name="theming"></a> Theming

AngularJS Material performs most theming at _run-time_. While this allows developers to configure
themes dynamically in JavaScript, it also incurs substantial performance cost to generate
CSS during application load.

Angular Material performs theming at _compile-time_ with [Sass][170]. While this approach
requires more up-front set-up, it completely removes all JavaScript execution cost associated
with theming. The use of Sass also moves the theming system to a more well-supported and
broadly-understood toolchain.

#### Defining palettes

AngularJS Material supports defining [custom palettes][151] or [extending existing palettes][158].

In Angular Material, custom palette creation, including definition of hues and contrast colors, can
be accomplished by copying one of the [provided palettes][167], modifying it, and then using it in
your [custom theme creation][164].

#### Defining themes

AngularJS Material uses a provider, [`$mdThemingProvider`][144], to define the theme configuration
used to generate styles during application loading. This provider also includes a default theme for
cases when no custom palettes are provided.

Angular Material has no default theme; a theme CSS file must _always_ be included. You can either
use one of the [pre-built theme files][163], or define a [custom theme][164] with Sass mixins,
including the output in your application just like any other CSS asset.

##### Defining themes at run-time

AngularJS Material uses a service, [`$mdTheming`][143], to define themes and generate CSS styles at
run-time.

Defining and generating theme CSS at run-time is not supported by Angular Material. However,
loading additional theme CSS into your application (or modifying an existing theme's `link` node
to [swap theme CSS files][181]) at run-time is supported.

Your application can choose to generate additional themes at compile-time or build an API to
dynamically generate theme CSS on-demand. In either case, it is possible to [lazy load][165] the
theme CSS at run-time.

#### Applying themes to your application

AngularJS Material has a custom directive, [`md-theme`][155], to apply a theme to a specific
component and its children.

Rather than providing a special directive API, Angular Material's Sass-based theming system relies
on standard Sass mixins and vanilla CSS selectors. For example, you can customize an individual
button (or set of buttons) by defining a class and applying it to a parent element:


<hljs lang="scss">
// Create a CSS class to use an alternate button theme, $alternate-theme, which you have
// already defined.
.alternate-button  {
  @include mat-button-theme($alternate-theme);
}
</hljs>
<hljs lang="html">
<!-- You can use normal Angular class bindings to toggle the alternate styles. -->
<div [class.alternate-button]="isAlternateMode">
  <button mat-button>Save changes</button>
</div>
</hljs>

Just like any other CSS, these classes can be applied to any element in your application and can
be added/removed/toggled to swap colors at run-time.

[See the full documentation](https://material.angular.io/guide/theming) for details on themes,
including examples of multiple themes.

##### Dynamically applying themes

AngularJS Material's [`md-theme`][155] and [`md-theme-watch`][156] directives support data binding
like `md-theme="{{ dynamicTheme }}" md-theme-watch`.

With Angular Material, you can make use of Angular's [ngClass][159] API to dynamically apply classes
associated with specific theming configurations like `[ngClass]="dynamicThemeClass"`. You can also
use normal Angular class bindings to toggle classes like
`[class.my-dark-theme]="isDarkMode"`.

#### Applying theming to custom components

AngularJS Material's [`md-colors`][73] directive and [`$mdColors`][125] service support looking up
and [dynamically applying `theme-palette-hue-opacity` color combinations][73] as CSS properties to
your application's custom components.

Angular Material uses the [`mat-color`][74] Sass function to lookup theme colors and 
Sass mixins with CSS selectors (see `alternate-button ` example of a class above) to
[style application or library components][168].

##### Accessing Hues

AngularJS Material's [Hue classes][169] (`md-hue-1`, `md-hue-2`, `md-hue-3`) are used to modify a
component's hues.

These classes are not supported out of the box with Angular Material, but you can use the
[`mat-color`][74] Sass function to lookup the desired Hues and assign them to all of the appropriate
CSS selectors and CSS properties, for a specific component, in a theme mixin. 

#### Browser header and system status bar coloring on mobile

AngularJS Material's theme system supports modifying the
[browser header and system status bar colors][149].

Angular's [Meta service][147] can be used to dynamically modify `<meta>` tags that affect browser
header and status bar colors. The [AngularJS Material docs][149] for this feature have links to
learn more about the specific `<meta>` tags.

##### Note about CSS variables
Once the team begins phasing out support for IE11, the theming system will be revisited with
[CSS Variables][160] (also known as CSS Custom Properties) in mind.

### <a name="layout"></a> Changes to Layout Features

The AngularJS Material [layout][108] system includes includes attributes and classes like `layout`,
`flex`, `show`, `hide`, etc.

Since AngularJS Material's inception, browser support for [CSS Flexbox][flexbox] has [broadly
improved][177] and [CSS Grid][65] has become [widely available][178]. Application developers should
carefully consider the the costs of additional JavaScript run-time dependencies versus native
alternatives when choosing an approach to layout.

Many of the AngularJS Material layout APIs map to straightforward, vanilla CSS using Flexbox and
[media queries][183]. We recommend checking out the following documentation and tutorials:
- MDN [Flexbox][flexbox] and [Grid][65] documentation
- [A Visual Guide to CSS3 Flexbox Properties](https://scotch.io/tutorials/a-visual-guide-to-css3-flexbox-properties)
- [Flexbox Zombies](https://mastery.games/p/flexbox-zombies)
- [Flexbox Froggy](https://flexboxfroggy.com)
- [Grid by Example](https://gridbyexample.com/)
- [A Complete Guide to Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Learn CSS Grid](https://learncssgrid.com/)

#### <a name="flex-layout"></a> Flex Layout

This comprehensive layout system was moved into its [own project][120] (beta).

The package contains the following:
- A [Declarative API][116] that includes attributes like `fxLayout`, `fxFlex`, `fxHide`, `fxShow`,
  and more.
- A [Responsive API][117] that includes attributes like `fxLayout.lt-md`, `fxFlex.gt-sm`,
  `fxHide.gt-xs`, `[ngClass.sm]`, `[ngStyle.xs]`, and more.
- Both APIs include [CSS Grid][65] features in addition to the [CSS Flexbox][flexbox] features from
  AngularJS Material.
- The ability to define [Custom Breakpoints][118]
- A [MediaObserver service][119] that allows subscribing to `MediaQuery` activation changes

This library adds a nontrivial payload cost as reported by `source-map-explorer` in
`v7.0.0-beta.24`
 - When using Flexbox only: up to `~46 KB`
 - When using Flexbox and Grid: up to `~60 KB`
   - Core: `~23 KB`, Flex: `~17 KB`, Grid: `~14 KB`, Extended: `~6 KB`

#### <a name="cdk-layout"></a> Angular CDK Layout
The CDK's layout capabilities offer a lightweight alternative (or complement) to larger,
full-blown layout systems. This capability adds `3.06 KB` as reported by `source-map-explorer`
with Angular CDK `v7.3.7`.

The CDK's [Layout][121] capability offers:
- A `MediaMatcher` service that provides access to the low level, native [`MediaQueryList`][123]
- A set of `Breakpoints` that match the [Material Design][122] responsive layout grid breakpoints
- A `BreakpointObserver` service that offers APIs for responding to changes in viewport size based
  on predefined breakpoints.

### <a name="typography"></a> Typography

AngularJS Material [typography classes][107] align with the Angular Material
[typography classes][27].

Angular Material also adds the following typography features:
- [Customization via Sass mixins][174] that are similar to the theme configuration mixins
- Utility Sass mixins and functions for use in [styling your custom components][175]
  
## <a name="comparison"></a> Comparison of Features and Migration Tips

Angular Material introduces a number of [new components](#new-components) and features that do not
exist in AngularJS Material. Angular Material also makes greater use of semantic HTML and native
elements to improve accessibility.

### Directives
Most components use the same name between the two libraries, changing the `md-` prefix to `mat-`.
For example, `<md-card>` becomes `<mat-card>`. Some element directives changed to attribute
directives, for instance `<md-subheader>` changed to `matSubheader`.

#### Component and Directive comparison reference

| Directive          | Old (`md-`)  | New (`mat-`) | Special Notes                                          |
|--------------------|--------------|--------------|--------------------------------------------------------|
| autocomplete       |   [Docs][41] |   [Docs][24] |                                                        |
| autofocus          |   [Docs][69] |   [Docs][182]| `cdkFocusInitial`                                      |
| button             |   [Docs][43] |   [Docs][1]  |                                                        |
| calendar           |   [Docs][70] |   -          | The [datepicker][25] has a `mat-calendar` component, but it cannot be used in stand-alone mode.|
| card               |   [Docs][44] |   [Docs][2]  |                                                        |
| checkbox           |   [Docs][45] |   [Docs][3]  |                                                        |
| chip               |   [Docs][71] |   [Docs][26] |                                                        |
| chip-remove        |   [Docs][72] |   [Docs][26] | `matChipRemove`                                        |
| chips              |   [Docs][46] |   [Docs][26] |                                                        |
| colors             |   [Docs][73] |   -          | [`mat-color` mixin][74] supports static theme color lookups.|
| contact-chips      |   [Docs][75] |   -          | Not implemented                                        |
| content            |   [Docs][76] |   [Docs][77] | `cdkScrollable`                                        |
| datepicker         |   [Docs][47] |   [Docs][25] |                                                        |
| divider            |   [Docs][49] |   [Docs][35] |                                                        |
| fab-speed-dial     |   [Docs][78] |   -          | Not implemented                                        |
| fab-toolbar        |   [Docs][79] |   -          | Not implemented                                        |
| grid-list          |   [Docs][50] |   [Docs][9]  |                                                        |
| highlight-text     |   [Docs][80] |   -          | Not implemented                                        |
| icon               |   [Docs][51] |   [Docs][10] |                                                        |
| ink-ripple         |   [Docs][81] |   [Docs][19] | `matRipple`                                            |
| input              |   [Docs][52] |   [Docs][5]  | `matInput`                                             |
| input-container    |   [Docs][82] |   [Docs][83] | `mat-form-field`                                       |
| list               |   [Docs][53] |   [Docs][8]  |                                                        |
| menu               |   [Docs][54] |   [Docs][17] |                                                        |
| menu-bar           |   [Docs][84] |   -          | Not implemented                                        |
| nav-bar            |   [Docs][85] |   [Docs][86] | `mat-tab-nav-bar`                                      |
| nav-item           |   [Docs][87] |   [Docs][88] | `mat-tab-link`                                         |
| optgroup           |   [Docs][89] |   [Docs][90] |                                                        |
| option             |   [Docs][91] |   [Docs][23] |                                                        |
| progress-linear    |   [Docs][55] |   [Docs][12] | `mat-progress-bar`                                     |
| progress-circular  |   [Docs][56] |   [Docs][11] | `mat-progress-spinner`                                 |
| radio-button       |   [Docs][57] |   [Docs][4]  |                                                        |
| radio-group        |   [Docs][92] |   [Docs][93] |                                                        |
| select             |   [Docs][59] |   [Docs][23] |                                                        |
| select-on-focus    |   [Docs][94] |   -          | Not implemented                                        |
| sidenav            |   [Docs][60] |   [Docs][6]  |                                                        |
| sidenav-focus      |   [Docs][95] |   -          | [autofocus][96] only supports focusing the first focusable element.|
| switch             |   [Docs][61] |   [Docs][14] | `mat-slide-toggle`                                     |
| slider             |   [Docs][62] |   [Docs][16] |                                                        |
| slider-container   |   [Docs][97] |   -          | See Migration Notes below                              |
| subheader          |   [Docs][98] |   [Docs][99] | `matSubheader`                                         |
| swipe              |   [Docs][100]|   -          | See [HammerJS setup][101] and [Hammer.Swipe][102]      |
| tabs               |   [Docs][64] |   [Docs][13] |                                                        |
| textarea           |   [Docs][52] |   [Docs][5]  |                                                        |
| toolbar            |   [Docs][66] |   [Docs][7]  |                                                        |
| tooltip            |   [Docs][67] |   [Docs][18] |                                                        |
| truncate           |   [Docs][103]|   -          | Not implemented                                        |
| virtual-repeat     |   [Docs][68] |   [Docs][40] | `cdk-virtual-scroll-viewport` and `*cdkVirtualFor`     |
| whiteframe         |   [Docs][104]|  [Guide][105]| Based on classes and mixins                            |

#### Component and Directive Migration Notes

1. `md-slider-container` helped style and position a `span` and `input` along with the `md-slider`.
  You can add elements or components next to your `mat-slider`, then position and style them as
  desired.

### Service comparison reference 

| Service          | Old          | New          | Special Notes                                          |
|------------------|--------------|--------------|--------------------------------------------------------|
| $mdAriaProvider  |   [Docs][124]|   -          | See Migration Notes below                              |
| $mdBottomSheet   |   [Docs][42] |   [Docs][38] | `MatBottomSheet`                                       |
| $mdColors        |   [Docs][125]|   -          | [`mat-color` mixin][74] supports static theme color lookups.|
| $mdCompiler      |   [Docs][126]|   -          | See Migration Notes below                              |
| $mdCompilerProvider| [Docs][127]|   -          | See Migration Notes below                              |
| $mdDateLocaleProvider|[Docs][128]|  [Docs][129]| `MomentDateAdapter`                                    |
| $mdDialog        |   [Docs][48] |   [Docs][22] | `MatDialog`                                            |
| $mdGestureProvider|  [Docs][130]|   -          | See Migration Notes below                              |
| $mdIcon          |   [Docs][131]|   [Docs][132]| `svgIcon`                                              |
| $mdIconProvider  |   [Docs][133]|   [Docs][134]| `MatIconRegistry`                                      |
| $mdInkRipple     |   [Docs][58] |   [Docs][19] |                                                        |
| $mdInkRippleProvider|[Docs][135]|   [Docs][136]| `MAT_RIPPLE_GLOBAL_OPTIONS`                            |
| $mdInteraction   |   [Docs][137]|   -          | Not implemented                                        |
| $mdLiveAnnouncer |   [Docs][111]|   [Docs][112]| CDK `LiveAnnouncer`                                    |
| $mdMedia         |   [Docs][137]|   [Docs][138]| CDK `BreakpointObserver.isMatched()` or Flex Layout's [MediaObserver service][119]|
| $mdPanel         |   [Docs][109]|   [Docs][110]| CDK `Overlay`                                          |
| $mdPanelProvider |   [Docs][139]|   -          | Not implemented                                        |
| $mdProgressCircularProvider|[Docs][140]|-      | Not implemented                                        |
| $mdSidenav       |   [Docs][141]|   -          | See Migration Notes below                              |
| $mdSticky        |   [Docs][142]|   -          | See Migration Notes below                              |
| $mdTheming       |   [Docs][143]|   -          | [Sass mixins][145] support custom component theming.|
| $mdThemingProvider|  [Docs][144]|   -          | [Sass mixins][146] support static, custom theme creation. Use Angular's [Meta service][147] for browser coloring features.|
| $mdToast         |   [Docs][63] |   [Docs][21] | `MatSnackBar`                                          |

#### Service Migration Notes

1. [This article](https://medium.com/myplanet-musings/comparing-3-top-automated-accessibility-testing-tools-wave-tenon-io-and-google-lighthouse-d3897d7bb311)
  covers [Chrome DevTools' Lighthouse](https://developers.google.com/web/tools/lighthouse/)
  Accessibility Auditing Tool. It provides guidance and two additional options for accessibility
  testing. Also note that the documentation for every Angular Material component includes a section
  with accessibility recommendations.
1. `$mdCompiler` and the related `$mdCompilerProvider` are AngularJS-specific solutions.
  Similar tools and APIs are not needed when working with Angular.
1. Angular Material uses [HammerJS][101]. To disable gesture detection, do not import HammerJS
  in your project. Angular Material does not do click hijacking, so the APIs related to
  that feature aren't needed.
1. `$mdSidenav` is a convenience to allow calling `$mdSidenav('right').toggle()` or
  `$mdSidenav('left').close()` from components, without the need to have an actual reference to each
  `md-sidenav` instance. If you need functionality like this with Angular Material, you can use
  Angular's [@ViewChild Decorator](https://angular.io/api/core/ViewChild) to get a reference to the
  `MatDrawer` or `MatSidenav` instance. Then you can store that reference in a service for use from
  multiple components.
1. `$mdSticky` uses the browser's native [position: sticky](https://developer.mozilla.org/en-US/docs/Web/CSS/position#Sticky_positioning)
  when supported and only supplies a workaround for browsers like IE11 that do not support native
  sticky positioning. For Angular Material, you should use the native `position: sticky` and
  provide your own solution for IE11.

### <a name="new-components"></a> New Components
These are new components found in Angular Material and the Angular CDK that do not exist in
AngularJS Material.

The `mat-` and `cdk-` prefixes have been omitted to make this table more readable.

| Directive        | New          | Special Notes                                          |
|------------------|--------------|--------------------------------------------------------|
| badge            |   [Docs][37] |                                                        |
| button-toggle    |   [Docs][15] |                                                        |
| drag-drop        |   [Docs][39] | CDK                                                    |
| expansion-panel  |   [Docs][32] |                                                        |
| paginator        |   [Docs][29] |                                                        |
| sort-header      |   [Docs][30] |                                                        |
| stepper          |   [Docs][33] | Unstyled CDK and Material versions available.          |
| table            |   [Docs][28] | Unstyled CDK and Material versions available.          |
| tree             |   [Docs][36] | Unstyled CDK and Material versions available.          |

 [0]: https://github.com/angular/flex-layout/wiki
 [1]: https://material.angular.io/components/button/overview
 [2]: https://material.angular.io/components/card/overview
 [3]: https://material.angular.io/components/checkbox/overview
 [4]: https://material.angular.io/components/radio/overview
 [5]: https://material.angular.io/components/input/overview
 [6]: https://material.angular.io/components/sidenav/overview
 [7]: https://material.angular.io/components/toolbar/overview
 [8]: https://material.angular.io/components/list/overview
 [9]: https://material.angular.io/components/grid-list/overview
[10]: https://material.angular.io/components/icon/overview
[11]: https://material.angular.io/components/progress-spinner/overview
[12]: https://material.angular.io/components/progress-bar/overview
[13]: https://material.angular.io/components/tabs/overview
[14]: https://material.angular.io/components/slide-toggle/overview
[15]: https://material.angular.io/components/button-toggle/overview
[16]: https://material.angular.io/components/slider/overview
[17]: https://material.angular.io/components/menu/overview
[18]: https://material.angular.io/components/tooltip/overview
[19]: https://material.angular.io/components/ripple/overview
[20]: https://material.angular.io/guide/theming
[21]: https://material.angular.io/components/snack-bar/overview
[22]: https://material.angular.io/components/dialog/overview
[23]: https://material.angular.io/components/select/overview
[24]: https://material.angular.io/components/autocomplete/overview
[25]: https://material.angular.io/components/datepicker/overview
[26]: https://material.angular.io/components/chips/overview
[27]: https://material.angular.io/guide/typography
[28]: https://material.angular.io/components/table/overview
[29]: https://material.angular.io/components/paginator/overview
[30]: https://material.angular.io/components/sort/overview
[31]: https://tina-material-tree.firebaseapp.com/simple-tree
[32]: https://material.angular.io/components/expansion/overview
[33]: https://material.angular.io/components/stepper/overview
[34]: https://material.angular.io/cdk/categories
[35]: https://material.angular.io/components/divider/overview
[36]: https://material.angular.io/components/tree/overview
[37]: https://material.angular.io/components/badge/overview
[38]: https://material.angular.io/components/bottom-sheet/overview
[39]: https://material.angular.io/cdk/drag-drop/overview
[40]: https://material.angular.io/cdk/scrolling/overview#virtual-scrolling
[41]: https://material.angularjs.org/latest/api/directive/mdAutocomplete
[42]: https://material.angularjs.org/latest/api/service/$mdBottomSheet
[43]: https://material.angularjs.org/latest/api/directive/mdButton
[44]: https://material.angularjs.org/latest/api/directive/mdCard
[45]: https://material.angularjs.org/latest/api/directive/mdCheckbox
[46]: https://material.angularjs.org/latest/api/directive/mdChips
[47]: https://material.angularjs.org/latest/api/directive/mdDatepicker
[48]: https://material.angularjs.org/latest/api/service/$mdDialog
[49]: https://material.angularjs.org/latest/api/directive/mdDivider
[50]: https://material.angularjs.org/latest/api/directive/mdGridList
[51]: https://material.angularjs.org/latest/api/directive/mdIcon
[52]: https://material.angularjs.org/latest/api/directive/mdInput
[53]: https://material.angularjs.org/latest/api/directive/mdList
[54]: https://material.angularjs.org/latest/api/directive/mdMenu
[55]: https://material.angularjs.org/latest/api/directive/mdProgressLinear
[56]: https://material.angularjs.org/latest/api/directive/mdProgressCircular
[57]: https://material.angularjs.org/latest/api/directive/mdRadioButton
[58]: https://material.angularjs.org/latest/api/service/$mdInkRipple
[59]: https://material.angularjs.org/latest/api/directive/mdSelect
[60]: https://material.angularjs.org/latest/api/directive/mdSidenav
[61]: https://material.angularjs.org/latest/api/directive/mdSwitch
[62]: https://material.angularjs.org/latest/api/directive/mdSlider
[63]: https://material.angularjs.org/latest/api/service/$mdToast
[64]: https://material.angularjs.org/latest/api/directive/mdTabs
[65]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout
[66]: https://material.angularjs.org/latest/api/directive/mdToolbar
[67]: https://material.angularjs.org/latest/api/directive/mdTooltip
[68]: https://material.angularjs.org/latest/api/directive/mdVirtualRepeat
[69]: https://material.angularjs.org/latest/api/directive/mdAutofocus
[70]: https://material.angularjs.org/latest/api/directive/mdCalendar
[71]: https://material.angularjs.org/latest/api/directive/mdChip
[72]: https://material.angularjs.org/latest/api/directive/mdChipRemove
[73]: https://material.angularjs.org/latest/api/directive/mdColors
[74]: https://material.angular.io/guide/theming-your-components#note-using-the-code-mat-color-code-function-to-extract-colors-from-a-palette
[75]: https://material.angularjs.org/latest/api/directive/mdContactChips
[76]: https://material.angularjs.org/latest/api/directive/mdContent
[77]: https://material.angular.io/cdk/scrolling/overview#cdkscrollable-and-scrolldispatcher
[78]: https://material.angularjs.org/latest/api/directive/mdFabSpeedDial
[79]: https://material.angularjs.org/latest/api/directive/mdFabToolbar
[80]: https://material.angularjs.org/latest/api/directive/mdHighlightText
[81]: https://material.angularjs.org/latest/api/directive/mdInkRipple
[82]: https://material.angularjs.org/latest/api/directive/mdInputContainer
[83]: https://material.angular.io/components/form-field/overview
[84]: https://material.angularjs.org/latest/api/directive/mdMenuBar
[85]: https://material.angularjs.org/latest/api/directive/mdNavBar
[86]: https://material.angular.io/components/tabs/overview#tabs-and-navigation
[87]: https://material.angularjs.org/latest/api/directive/mdNavItem
[88]: https://material.angular.io/components/tabs/api#MatTabLink
[89]: https://material.angularjs.org/latest/api/directive/mdOptgroup
[90]: https://material.angular.io/components/select/overview#creating-groups-of-options
[91]: https://material.angularjs.org/latest/api/directive/mdOption
[92]: https://material.angularjs.org/latest/api/directive/mdRadioGroup
[93]: https://material.angular.io/components/radio/overview#radio-groups
[94]: https://material.angularjs.org/latest/api/directive/mdSelectOnFocus
[95]: https://material.angularjs.org/latest/api/directive/mdSidenavFocus
[96]: https://material.angular.io/components/sidenav/api#MatSidenav
[97]: https://material.angularjs.org/latest/api/directive/mdSliderContainer
[98]: https://material.angularjs.org/latest/api/directive/mdSubheader
[99]: https://material.angular.io/components/list/overview#lists-with-multiple-sections
[100]: https://material.angularjs.org/latest/api/directive/mdSwipeDown
[101]: https://material.angular.io/guide/getting-started#step-5-gesture-support
[102]: http://hammerjs.github.io/recognizer-swipe/
[103]: https://material.angularjs.org/latest/api/directive/mdTruncate
[104]: https://material.angularjs.org/latest/api/directive/mdWhiteframe
[105]: https://material.angular.io/guide/elevation
[106]: https://material.angularjs.org/latest/Theming/01_introduction
[107]: https://material.angularjs.org/latest/CSS/typography
[108]: https://material.angularjs.org/latest/layout/introduction
[109]: https://material.angularjs.org/latest/api/service/$mdPanel
[110]: https://material.angular.io/cdk/overlay/overview
[111]: https://github.com/angular/material/blob/v1.1.17/src/core/services/liveAnnouncer/live-announcer.js
[112]: https://material.angular.io/cdk/a11y/api#LiveAnnouncer
[113]: https://github.com/angular/material/blob/v1.1.17/src/core/util/util.js#L86-L105
[114]: https://material.angular.io/cdk/bidi/api#Directionality
[115]: https://material.angular.io/cdk/text-field/api#CdkTextareaAutosize
[116]: https://github.com/angular/flex-layout/wiki/Declarative-API-Overview
[117]: https://github.com/angular/flex-layout/wiki/Responsive-API
[118]: https://github.com/angular/flex-layout/wiki/Breakpoints
[119]: https://github.com/angular/flex-layout/wiki/API-Documentation#javascript-api-imperative
[120]: https://github.com/angular/flex-layout
[121]: https://material.angular.io/cdk/layout/overview
[122]: https://material.io/design/layout/responsive-layout-grid.html#breakpoints
[123]: https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList
[124]: https://material.angularjs.org/latest/api/service/$mdAriaProvider
[125]: https://material.angularjs.org/latest/api/service/$mdColors
[126]: https://material.angularjs.org/latest/api/service/$mdCompiler
[127]: https://material.angularjs.org/latest/api/service/$mdCompilerProvider
[128]: https://material.angularjs.org/latest/api/service/$mdDateLocaleProvider
[129]: https://material.angular.io/components/datepicker/overview#internationalization
[130]: https://material.angularjs.org/latest/api/service/$mdGestureProvider
[131]: https://material.angularjs.org/latest/api/service/$mdIcon
[132]: https://material.angular.io/components/icon/api#MatIcon
[133]: https://material.angularjs.org/latest/api/service/$mdIconProvider
[134]: https://material.angular.io/components/icon/api#MatIconRegistry
[135]: https://material.angularjs.org/latest/api/service/$mdInkRippleProvider
[136]: https://material.angular.io/components/ripple/overview#global-options
[137]: https://material.angularjs.org/latest/api/service/$mdMedia
[138]: https://material.angular.io/cdk/layout/overview#breakpointobserver
[139]: https://material.angularjs.org/latest/api/service/$mdPanelProvider
[140]: https://material.angularjs.org/latest/api/service/$mdProgressCircular
[141]: https://material.angularjs.org/latest/api/service/$mdSidenav
[142]: https://material.angularjs.org/latest/api/service/$mdSticky
[143]: https://material.angularjs.org/latest/api/service/$mdTheming
[144]: https://material.angularjs.org/latest/api/service/$mdThemingProvider
[145]: https://material.angular.io/guide/theming-your-components
[146]: https://material.angular.io/guide/theming#defining-a-custom-theme
[147]: https://angular.io/api/platform-browser/Meta
[148]: https://material.io/archive/guidelines/style/color.html#color-color-palette
[149]: https://material.angularjs.org/latest/Theming/06_browser_color
[150]: https://material.angularjs.org/latest/Theming/01_introduction#palettes
[151]: https://material.angularjs.org/latest/Theming/03_configuring_a_theme#defining-custom-palettes
[152]: https://material.angularjs.org/latest/Theming/03_configuring_a_theme
[153]: https://material.angularjs.org/latest/Theming/04_multiple_themes
[154]: https://material.angularjs.org/latest/Theming/04_multiple_themes#using-another-theme
[155]: https://material.angularjs.org/latest/Theming/04_multiple_themes#via-a-directive
[156]: https://material.angularjs.org/latest/Theming/04_multiple_themes#dynamic-themes
[157]: https://material.angularjs.org/latest/Theming/05_under_the_hood
[158]: https://material.angularjs.org/latest/Theming/03_configuring_a_theme#extending-existing-palettes
[159]: https://angular.io/api/common/NgClass
[160]: https://caniuse.com/#feat=css-variables
[161]: https://github.com/angular/components/releases/tag/7.3.3
[162]: https://github.com/angular/components/issues/4352
[163]: https://material.angular.io/guide/theming#using-a-pre-built-theme
[164]: https://material.angular.io/guide/theming#defining-a-custom-theme
[165]: https://material.angular.io/guide/theming#multiple-themes
[166]: https://material.angular.io/guide/theming#theming-only-certain-components
[167]: https://github.com/angular/components/blob/7.3.6/src/lib/core/theming/_palette.scss#L72-L103
[168]: https://material.angular.io/guide/theming-your-components
[169]: https://material.angularjs.org/latest/Theming/03_configuring_a_theme#specifying-custom-hues-for-color-intentions
[170]: https://sass-lang.com/
[171]: https://material.angular.io/
[172]: https://blog.angular.io/stable-angularjs-and-long-term-support-7e077635ee9c
[173]: https://angular.io/guide/upgrade#preparation
[174]: https://material.angular.io/guide/typography#customization
[175]: https://material.angular.io/guide/typography#material-typography-in-your-custom-css
[176]: https://github.com/angular/material-tools
[177]: https://caniuse.com/#feat=flexbox
[178]: https://caniuse.com/#feat=css-grid
[179]: https://material.angularjs.org/latest/api/directive/mdVirtualRepeatContainer
[180]: https://material.angular.io/cdk/bidi/api#Dir
[181]: https://material.angular.io/guide/theming#swapping-css-files
[182]: https://material.angular.io/cdk/a11y/overview#regions
[183]: https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries

[aio]: https://angular.io/
[cdk]: https://material.angular.io/cdk
[ngUpgrade]: https://angular.io/guide/upgrade-performance
[style-guide]: https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md
[webpack]: http://webpack.github.io/
[flexbox]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox
