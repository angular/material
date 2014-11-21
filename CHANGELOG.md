<a name="0.6.0-rc1"></a>
## 0.6.0-rc1  (2014-11-18)

v0.6.0-rc1 releases the following changes:

- improvements to the ink Ripple effects
- namespace prefixing Material attributes
- revised the Layout system to be more intuitive and responsive
- added enhancements for modular builds and distrbution for each component
- improved minification and SHA tags for each deployed .js and .css file
- numerous bug fixes to improve stability, adds responsive features, and enhances API documentation.

#### Bug Fixes

* **button:** fix css for md-fab icon position when href is present ([a7763fde](https://github.com/angular/material/commit/a7763fde0e62a36f31ee318349a847bee2fed4f0), closes [#591](https://github.com/angular/material/issues/591))
* **card:** make md-card themeable ([55cdb5b7](https://github.com/angular/material/commit/55cdb5b7e78c3d70a7b205cf15f2ba05fb5d54b2), closes [#619](https://github.com/angular/material/issues/619))
* **demos:** dialog, bottomsheet, and toast now display within properly within the bounding d ([5909f0a5](https://github.com/angular/material/commit/5909f0a56ea6e0ca04eb08df4b8b680eef771a50))
* **docs:**
  * fix error in flex docs ([a02469b2](https://github.com/angular/material/commit/a02469b23632e04bdd107949bec2561213ddf59a))
  * improve responsive docs ([4a846b4c](https://github.com/angular/material/commit/4a846b4c2f87d29ee746b855a030d01af7ea1f4e))
* **layout:** updates layout attributes in index template ([669d0048](https://github.com/angular/material/commit/669d0048e6397e9056a4e3cf4b936d1197979d87))
* **md-button:** improve a11y: make title, aria-label work ([ff576289](https://github.com/angular/material/commit/ff576289bfed2eeec08ee7d743ddcaf0c441e3c7), closes [#512](https://github.com/angular/material/issues/512))
* **ripple:** fix ripple sometimes appearing when the element is disabled ([58eaef49](https://github.com/angular/material/commit/58eaef49e931e4e7137a59485db627f461e594b7))
* **sidenav:**
  * make backdrop invisible when sidenav is locked-open ([4a75d599](https://github.com/angular/material/commit/4a75d5990176e1902db8626156f8518346ce0e60))
  * clean registry when element is destroyed ([e7a3bd8d](https://github.com/angular/material/commit/e7a3bd8d03306593dbee292db85ed8147ae934eb), closes [#473](https://github.com/angular/material/issues/473))
* **slider:** update discrete slider thumb text while dragging ([2877585e](https://github.com/angular/material/commit/2877585e6dbbf44199428c59601e954a3b31f1e1), closes [#622](https://github.com/angular/material/issues/622))
* **themes:** bring blue, red, and green colors up to latest spec ([de3ff4b8](https://github.com/angular/material/commit/de3ff4b800955d204a8cce504332bd8d52f5b2cf))

#### Features

* **layout:**
  * add new layout system ([d51a44c5](https://github.com/angular/material/commit/d51a44c5629763cb52c61df39881ef665448734e))
  * add `layout-wrap` attribute to set flex-wrap to wrap ([4f755eab](https://github.com/angular/material/commit/4f755eab67046864e61eba8f4345688bed461863), closes [#634](https://github.com/angular/material/issues/634))
* **styles:** add 'swift' css transitions to all components according to spec ([15bb142c](https://github.com/angular/material/commit/15bb142c0aa53e5fcfa421526a5fb0ab1c3e9b1e), closes [#611](https://github.com/angular/material/issues/611))
* **mdThemingProvider:** add alwaysWatchTheme options, fix docs ([0a404088](https://github.com/angular/material/commit/0a4040886f288ed22fd0fef182eace13150cd732))
* **radioGroup:** add up/down arrow navigation ([367e47db](https://github.com/angular/material/commit/367e47dbabf638154cd8155d9132f01aa05cd81b), closes [#538](https://github.com/angular/material/issues/538))
* **tabs:** add accessibility links between tabs and content ([5d3bab56](https://github.com/angular/material/commit/5d3bab566ec71ff9f4a65faad7ef2674cd04c1b9))
* **bottomSheet:** focus the first available button on open ([768cc098](https://github.com/angular/material/commit/768cc098fdc4b09e1c5f3faab526a7ed9e324702), closes [#571](https://github.com/angular/material/issues/571))
* **interimElement:** allow options.parent to be a selector ([342051e0](https://github.com/angular/material/commit/342051e0af2ca5cd42555b30a47249006d6228b7), closes [#640](https://github.com/angular/material/issues/640))
* **mdDialog:** enhance show API with *confirm()* and *alert()* builder functions. ([12b8cbc06](https://github.com/angular/material/commit/12b8cbc06065669df6b22b9bdbb6764398ff26fb). <br/>See [Demos](https://material.angularjs.org/#/demo/material.components.dialog) JavaScript source
```js
$mdDialog.show(
      $mdDialog.alert()
        .title('This is an alert title')
        .content('You can specify some description text in here.')
        .ariaLabel('Password notification')
        .ok('Got it!')
        .targetEvent(ev)
    );
```


#### Breaking Changes

* To provide improved clarity and easier usages, the Layout system has been revised ([d51a44c5](https://github.com/angular/material/commit/d51a44c5629763cb52c61df39881ef665448734e)). <br/>See the updated [Layout sections](https://material.angularjs.org/#/layout/container) for details. We associate labels with specific breakpoints:

| Label | Size (dp) | Attribute |
|--------|--------|--------|
| Phone | 0  &lt;= size &lt;= 600 | layout-sm |
| Tablet | 600  &gt; size &lt;= 960 | layout-md |
| Tablet-Landscape | 960  &gt;= size &lt;= 1200 | layout-lg |
| PC | &gt; 1200 | layout-gt-lg |

> **<u>Example 1</u>**: To use a *horizontal* layout and responsively change to *vertical* for screen sizes < 600 dp:
>```html
<!-- original  '<div layout="vertical" layout-sm="horizontal">'  becomes -->
<div layout="row" layout-sm="column">
> ```
>
> **<u>Example 2</u>**: To use a *horizontal* layout and change to *vertical* for *phone* and *tablet* screen sizes: 
>```html
<!-- original  '<div layout="vertical" layout-md="horizontal">'  becomes -->
<div layout="row" layout-sm="column" layout-md="column">
```
> **<u>Example 3</u>**: To show an element except when on a *phone* (or smaller) screen size:
>```html
<!-- original  '<div hide show-sm>'  becomes -->
<div hide-sm>
```
> **<u>Example 4</u>**: To always hide an element, but show it only on phone (or smaller) devices:
>```html
<!-- original  '<div hide-sm>'  becomes -->
<div hide show-sm>
```

* For performance, the *disabled* attribute is no longer supported; instead the *ng-disabled* attribute is now read to check if a component is disabled. ([2ece8cd7](https://github.com/angular/material/commit/2ece8cd794c4c28df4fb6a7683492da71aa2c382))
> If you use the `disabled` attribute on a component to set whether
it is disabled, change it to an ng-disabled expression.
> Change your code from this:
> ```html
> <md-checkbox disabled></md-checkbox>
> ```
> To this:
> ```html
> <md-checkbox ng-disabled="true"></md-checkbox>
> ```

* All material component attributes and are now namespaced with the `md-` prefix; these changes do not affect ng- prefixes or standard html5 prefixes ([eb2f2f8a](https://github.com/angular/material/commit/eb2f2f8a8c668142742e4b4c1e18cf6d91a533db)). Affected attributes:

  * &lt;md-button **md-no-ink**="" &gt;
  * &lt;md-content&gt;		([92b76435](https://github.com/angular/material/commit/92b76435df5cb88c7bba3289c04daf17c911eee0))
    - **md-scroll-x**
    - **md-scroll-y**
    - **md-scroll-xy**
  * &lt;md-divider **md-inset**="" &gt;
  * &lt;md-linear-progress **md-buffer-value**="someValue" **md-mode**="query" &gt;
  * &lt;md-circular-rogress **md-mode**="query" **md-diameter**="60" &gt;
  * &lt;md-sidenav&gt;
    - **md-is-open**="isOpen"
    - **md-is-locked-open**="isLockedOpen"
    - **md-component-id**="my-sidenav"
  * &lt;md-tabs&gt;
    - **md-selected**="selectedIndex"
    - **md-on-select**="doSomething()"
    - **md-on-deselect**="doSomething()"
    - **md-active**="tabIsActive"
  * &lt;md-text-float **md-fid**="someId"&gt;

* When using the `<md-button>` directive, the compiled element will now be a normal `<a>` or `<button>` element with the *class="md-button"* attribute. ([d835f9ee](https://github.com/angular/material/commit/d835f9ee7e35ea72dc6a7bd154163386ea0f3ce3))
> Any css referencing the `md-button` element selector
should now reference the `.md-button` class selector. Change your CSS overrides from this:
>
>```css
>md-button {
>  color: red;
>}
>```
>
>To this:
>
>```css
>.md-button {
>  color: red;
>}
>```


<a name="0.5.0"></a>
## 0.5.1  (2014-10-31)

Version 0.5.0 introduces [theming support](https://material.angularjs.org/#/Theming/01_introduction), improves stability, adds responsive features, and enhances API documentation.

#### Features

* **theming:** introduce theming support, documented at [Theming Introduction](https://material.angularjs.org/#/Theming/01_introduction) ([80768270](https://github.com/angular/material/commit/807682707045de90d30a0718b3df963fef0dafc8))
* **sidenav:**
  * add `is-open` attribute binding ([f66795e8](https://github.com/angular/material/commit/f66795e8378299ccd84aea69a72f5cc0704589bc))
  * add `is-locked-open` attribute binding with media query support ([105b0e0a](https://github.com/angular/material/commit/105b0e0ae6b2d30385d2aa8bee6190dd7ce1775c), closes [#446](https://github.com/angular/material/issues/446))

#### Bug Fixes

* **mdAria**: add better warnings ([3368c931](https://github.com/angular/material/commit/3368c931cee4638dac6dc26f7a4d8b37dc6e4858), closes [#366](https://github.com/angular/material/issues/366))
* **md-input-group:** disable with ARIA ([72bad32a](https://github.com/angular/material/commit/72bad32ae4d48049e52602a4feda8eef9fbe6f0c))
* **slider:** slider default value in ng-repeat corrected ([b652d863](https://github.com/angular/material/commit/b652d8634d2177ef8ec44cd163b4cf6d348c4795), closes [#479](https://github.com/angular/material/issues/479))
* **css:**
  * add autoprefixer support for firefox and ie ([a1bea485](https://github.com/angular/material/commit/a1bea485c7b97974f82a3a81b440964d70514eca))
  * fix invalid flex properties ([c1d9b5a2](https://github.com/angular/material/commit/c1d9b5a2f58e33cdcffc85484ddce421121d2636))
  * remove deprecated css properties ([c7e3a83c](https://github.com/angular/material/commit/c7e3a83c28cd145e77cc7d61db918cc881d1ea7c))
* **textFloat:**
  * improved logic to determine if md-input has a value ([5c407b5f](https://github.com/angular/material/commit/5c407b5fdfcf1c69cf69c06427ab0b166fecbed7))
  * improve ARIA pairing links between label and input ([457b3750](https://github.com/angular/material/commit/457b37506c9f076b42e76cd8c1f591087d729a50), closes [#483](https://github.com/angular/material/issues/483))
  * added support for label/hint expressions ([3674a514](https://github.com/angular/material/commit/3674a51437871a2366a65636127f8c6a6010f560), closes [#462](https://github.com/angular/material/issues/462))
  * fix keyboard tabbing support ([27f43751](https://github.com/angular/material/commit/27f43751be83a7b3e3a1a92d052fe1e016525ff1), closes [#458](https://github.com/angular/material/issues/458))

#### Breaking Changes

* **colors:**
  * The `md-theme-*` classes have all been removed, in favor of themes.
  * Instead, use `md-primary` and `md-warn` classes on an element when a theme is set.
* **bottomSheet:**
  * `list` class has been renamed to `md-list`
  * `grid` class has been renamed to `md-grid`
  * `has-header` class has been renamed to `md-has-header`
  * `grid-text` class has been renamed to `md-grid-text`.
* **button:**
  * `md-button-colored` class has been changed to `md-primary` and `md-warn` color classes.
  * All classes that start with `md-button-fab` now start with `md-fab`.
    * `md-button-fab` to `md-fab`.
    * `md-button-fab-top-left` to `md-fab-top-left`
    * `md-button-fab-top-right` to `md-fab-top-right`
    * `md-button-fab-bottom-left` to `md-fab-bottom-left`
    * `md-button-fab-bottom-right` to `md-fab-bottom-right`
  * `md-button-cornered` class has been changed to `md-cornered`
  * `md-button-icon` class has been changed to `md-icon`
  * `md-button-raised` class has been changed to `md-raised`
* **content:** `md-content-padding` class has been renamed to `md-padding`.
* **dialog:**
  * `dialog-content` class has been removed. Use an `md-content` element instead.
  * `dialog-actions` has been renamed to `md-actions`
* **subheader:** `md-subheader-colored` is now `md-primary`.
* **textFloat:**
  * use of `<md-input-group>` is deprecated, `<md-text-float>` markup can be used for most cases
* **toast:** `toast-action` has been renamed to `md-action`
* **toolbar:**
  * `md-toolbar-tall` class has been renamed to `md-tall`
  * `md-toolbar-medium-tall` class has been renamed to `md-medium-tall`
* **whiteframe:** md-whiteframe-z\* classes no longer set z-index, only shadow

<a name="0.4.2"></a>
## 0.4.2  (2014-10-16)

This release adds support for the [official Angular 1.3 release](https://github.com/angular/angular.js/blob/master/CHANGELOG.md) and includes improvements to both the document generator and component demos.

> Note that `<md-input-group>` and `<md-input>` are deprecated in favor on `<md-text-float>`. While both directives are still available for more granular control, developers are encouraged to use the `<md-text-float>` directive whenever possible.


#### Features

* **text-float:** Add floating label text field ([25cf6f1](https://github.com/angular/material/commit/25cf6f116b9d3044894aaf6d3244c5395cd4a6c2))
 

#### Bug Fixes

* Focus management for docs views ([9afe28a8](https://github.com/angular/material/commit/9afe28a87fdd2840428f904345442dcfc898708f))
* **bottomSheet:** use position:fixed so it does not move ([bfaf96d8](https://github.com/angular/material/commit/bfaf96d875665fff3cbc2158d05a5be54c85c9cf))
* **ripple:** use contentParent scroll offset ([4c0c50e4](https://github.com/angular/material/commit/4c0c50e4036b880b67cd40d885d322a326a84e68), closes [#416](https://github.com/angular/material/issues/416))
* **slider:**
  * disabled sliders still usable w/ keys ([f78f1b34](https://github.com/angular/material/commit/f78f1b3467a6c38f2d91921917b677de8c2d3a3c))
  * disabled discrete sliders still usable ([1f5ce090](https://github.com/angular/material/commit/1f5ce090c6df413d612a92d5807ae01896b0c058))
* **subheader:** sort items correctly in browsers that dont support true/false ([d8e5079e](https://github.com/angular/material/commit/d8e5079e32224b3522aa9e5ebef03185d6f6bf4d), closes [#438](https://github.com/angular/material/issues/438))
* **tabs:** remove tabs all at once on controller destroy ([7237767d](https://github.com/angular/material/commit/7237767dc3e847e5ff24470177e736b962b86377), closes [#437](https://github.com/angular/material/issues/437))

<a name="0.4.1"></a>
## 0.4.1  (2014-10-15)

Version 0.4.1 changes the prefix for all services and directives from 'material' to 'md'.

To migrate your code, replace all instances of 'material' in your project with 'md':

```sh
sed -i '' 's/material/md/g' $(echo my-material-project/app/**/*.{js,html,css})
```

Additionally, `material-linear-progress` has been renamed to `md-progress-linear` and `material-circular-progress` has been renamed to `md-progress-circular`.

`angular-aria` is now a dependency. Be sure to include angular-aria.js before angular-material. See https://github.com/angular/bower-material#usage.

<a name="0.4"></a>
## 0.4.0  (2014-10-06)

Version 0.4 incorporates four (4) new components: [circular progress](https://material.angularjs.org/#/material.components.progressCircular/readme/overview), [subheader](https://material.angularjs.org/#/material.components.subheader/readme/overview), [tooltip](https://material.angularjs.org/#/material.components.tooltip/readme/overview) and [bottom sheet](https://material.angularjs.org/#/material.components.bottomSheet/readme/overview). A [new API](#v0.4-breaking) has also been introduced for `$materialDialog` and `$materialToast`. Additionally, many small component functionality and performance issues have been resolved.

v0.4 is tested on desktop Chrome, Safari and Firefox, as well as Android 4.4+ and iOS7.

<a name="v0.4-breaking"></a>
#### Breaking Changes

The services `$materialDialog` and `$materialToast` have changed API(s). See section at bottom for [Change Details](#v0.4-breaking-details).

#### Bug Fixes

* **button:** 
  * no underline when button has a href ([948aef0d](https://github.com/angular/material/commit/948aef0db53e6fc7f679d913f08c4a80869d209d))
  * disabled raised and fab buttons don't hover on focus ([6d0ca8fb](https://github.com/angular/material/commit/6d0ca8fb0c9946a8adef2161c95b1439977dd7e1), closes [#358](https://github.com/angular/material/issues/358))
* **checkbox:** resolve TypeError for inputDirective.link ([4da56732](https://github.com/angular/material/commit/4da5673272599d5eb70bd82f54bfeefaa260c970))
* **dialog:** cancel instead of hiding when user escapes/clicks out ([0cc21d47](https://github.com/angular/material/commit/0cc21d47e1f6c20ee5a9f15559771dbacaef1120))
* **interimElement:** make cancel and hide not fail when no element is shown ([6162156d](https://github.com/angular/material/commit/6162156d13762b25fd4bd0110f4bc263ab9652c4))
* **progress-linear:** Add aria, tests and better animations ([3b386276](https://github.com/angular/material/commit/3b3862765a5c70b6369bfc0fd6b0a30811382984), closes [#297](https://github.com/angular/material/issues/297))
* **radio:** Radio button a11y ([05ed42de](https://github.com/angular/material/commit/05ed42de4fb52ec916b2fcc6e5a78d2d5ea164ad), closes [#310](https://github.com/angular/material/issues/310))
* **toolbar:** Demo correct heading levels ([fd7697d6](https://github.com/angular/material/commit/fd7697d6697710fcfab1c1d02d8306b50897236f))
* **ripple:**
  * make detach method work properly ([c3d858a2](https://github.com/angular/material/commit/c3d858a24e1a931d073a17b3185c2cd79b2628de))
  * ripple container self-removal NPE fixed. ([664ab996](https://github.com/angular/material/commit/664ab99621ca6fb52fc53ced877324a1b767347b))
* **sidenav:**
  * add `display: none;` while closed ([8f104012](https://github.com/angular/material/commit/8f10401265d13c6b35467a82362a0765cb9b2d2e), closes [#300](https://github.com/angular/material/issues/300))
  * always leave >=56px of room, no matter the screensize ([13a26670](https://github.com/angular/material/commit/13a26670bbf8265ce235a37f642c05f17a2ea569), closes [#346](https://github.com/angular/material/issues/346))
* **slider:** discrete mode supports live dragging and snap-to ([b231f1c0](https://github.com/angular/material/commit/b231f1c031918efedc96217349a45f3fba6d4726), closes [#331](https://github.com/angular/material/issues/331))
* **textfield:**
  * ng-model bindings now working and demo rendering fixed. ([e8f456fc](https://github.com/angular/material/commit/e8f456fcc77937d61f587eae0cbe6b93f943dc18))
  * match float-label (light theme) specifications ([63eeb47f](https://github.com/angular/material/commit/63eeb47fe2ad38da6acb5b1854fae28e5e59abb6))

#### Features

* **progress-circular:** Add circular progress component ([07d56533](https://github.com/angular/material/commit/07d5653350d1ef2a9aa86689653bce62350bdb31), closes [#365](https://github.com/angular/material/issues/365))
* **subheader:** add subheader component with sticky scroll ([7787c9cc](https://github.com/angular/material/commit/7787c9cc9cacde77fdef06b75ea231a58ed814ce), closes [#216](https://github.com/angular/material/issues/216))
* **tooltip:** add tooltip component ([9f9b0897](https://github.com/angular/material/commit/9f9b0897b22b017b5e03754c4deac7a189b72235), closes [#354](https://github.com/angular/material/issues/354))
* **bottomSheet** add bottomSheet component ([3be359c](https://github.com/angular/material/commit/3be359cc9aabed1613a51090c08f82abd3fa2bc3))


<br/>
<a name="v0.4-breaking-details"></a>
#### Details on Breaking Changes

**1) $materialDialog**:

Change your code from this:

```js
var hideDialog = $materialDialog(options);
hideDialog();
```

To this:

```js
$materialDialog
  .show(options)
  .then(
	function success(response) {},
	function cancelled(reason) {}
   );

// Hides the dialog last shown with `show()`
// and resolves the show() promise with `response`

$materialDialog.hide(response);

// Hides the dialog last shown and rejects the `show()`
// promise with the `reason`

$materialDialog.cancel(reason);
```

Note: If you previously provided a `controller` option to `$materialDialog`, that controller would be injected with a `$hideDialog` function. This feature no longer exists; use `$materialDialog.hide()`.

<br/>

**2) $materialToast**:

Change your code from this:

```js
var hideToast = $materialToast(options);
hideToast();
```

To this:

```js
$materialToast
  .show(options)
  .then(
	function success(response) {},
	function cancelled(reason) {}
  );


// Hides the dialog last shown with `show()`
// and resolves the show() promise with `response`

$materialToast.hide(response);

// Hides the dialog last shown and rejects the `show()`
// promise with the `reason`

$materialToast.cancel(reason);

```
<br/>
Note: If you previously provided a `controller` option to `$materialToast`, that controller would be injected with a `$hideToast` function. This feature no longer exists; use `$materialToast.hide()`.



<a name="0.0.3"></a>
## v0.0.3  (2014-09-19)

v0.0.3 includes many bug fixes, performance, and usability improvements to existing components, as well as introducing the slider, switch, divider, and linear progress components.

Additionally, accessibility support is added to material-button, material-checkbox, material-radio-button, material-slider, material-dialog and material-list. With added ARIA support including roles, states and properties, Angular Material directives now also communicate to users of assistive technologies. Additionally, tabIndex and focus management are handled dynamically where appropriate.

0.0.3 is tested on desktop Chrome, Safari and Firefox, as well as Android 4.4+ and iOS 7+. Also tested with VoiceOver on OSX and iOS7, ChromeVox, JAWS, NVDA and ZoomText.

#### Bug Fixes

* **button:** don't use angular transclusion at all, manual only ([6b322729](https://github.com/angular/material/commit/6b32272908b8bbc2f171b4441a54e75dec3f66d9))
* **card:** make it use up proper width with margin ([f33185ff](https://github.com/angular/material/commit/f33185ff9f7e7cc500b4cc75e26e2659f845c418), closes [#247](https://github.com/angular/material/issues/247))
* **demo:** tab demos improved layout and accessibility ([8915c324](https://github.com/angular/material/commit/8915c32484f6ee663b2e8e61f070fc8f7cf1de5c))
* **dialog:** use position:fixed instead of absolute ([6ba874d8](https://github.com/angular/material/commit/6ba874d8b70abc0a17314668734218fdaf756c42), closes [#249](https://github.com/angular/material/issues/249))
* **iterator:** update add()/remove() logic ([6a596b32](https://github.com/angular/material/commit/6a596b326856d81b52ec5d21fba63afc25e9f37a))
* **material-dialog:** Focus mgmt, ARIA attributes ([fe054ae6](https://github.com/angular/material/commit/fe054ae6cd7883c300b623d83e89211f8814d756))
* **material-list:** Add semantics ([6e48cd35](https://github.com/angular/material/commit/6e48cd35b9b72ea07bab64c53756adfb1aafc97a))
* **material-slider:** Adds missing ARIA role ([903cbc06](https://github.com/angular/material/commit/903cbc06df59d0cfb6d1545ae94763dcd63c7929))
* **ripple:**
  * fix bug with ripple and many clicks ([c2105c05](https://github.com/angular/material/commit/c2105c0599bf2f1fa9e0b1383f19c3e8d4a19c45))
  * make checkbox only scale up to 1.0, looks good on ios ([ed65da9b](https://github.com/angular/material/commit/ed65da9b568d6b2c4ce4c99f5403f9bb86571af1))
  * use css animations for performance ([96014e08](https://github.com/angular/material/commit/96014e08b47a5dc2e98dbccc7bd56af6a8f5670f))
* **slider:** watch ngDisabled expr on non-isolate parent scope ([5f1923d5](https://github.com/angular/material/commit/5f1923d5d03061c3074899e590860c8d96b0eba3), closes [#272](https://github.com/angular/material/issues/272))
* **switch:** correctly adjust when label will not fit on one line ([e912a838](https://github.com/angular/material/commit/e912a8386e6e6d3f0994bcf47db3cab7103dd947), closes [#80](https://github.com/angular/material/issues/80))
* **tabs:**
  * make the ink ripple use the color of the ink bar. ([c5ca159a](https://github.com/angular/material/commit/c5ca159aca912db1fc7cc1665306929f2f6d7046), closes [#280](https://github.com/angular/material/issues/280))
  * don't paginate on initial load when width is 0 ([5f5435d1](https://github.com/angular/material/commit/5f5435d1b8f22c1202fe6fec0b895887e5cc03c5), closes [#271](https://github.com/angular/material/issues/271))
  * use position: absolute container to fix ios bugs ([7d0a282f](https://github.com/angular/material/commit/7d0a282f9f6e00f55639bbc864edd4520a040785), closes [#220](https://github.com/angular/material/issues/220))
  * Tab pagination/selection now works properly on iOS ([3410650d](https://github.com/angular/material/commit/3410650dcf21ad581c363f82f49453cb20f3342d), closes [#220](https://github.com/angular/material/issues/220), [#231](https://github.com/angular/material/issues/231))
  * Tab pagination/selection now works properly on iOS ([c77c0e26](https://github.com/angular/material/commit/c77c0e260a151ec38801aeabd60dff29e3386ba2), closes [#220](https://github.com/angular/material/issues/220), [#231](https://github.com/angular/material/issues/231))
  * remove window resize listener on $destroy ([4b887f1e](https://github.com/angular/material/commit/4b887f1e4f87cb51b9e5c99e24455de71a19906c), closes [#254](https://github.com/angular/material/issues/254))
* **toolbar:**
  * make scrollShrink work with transforms, better performance ([cf1ab59f](https://github.com/angular/material/commit/cf1ab59f7450be20cbddefe54a42c20e7fc16a58), closes [#295](https://github.com/angular/material/issues/295))
  * typo onScroll -> onContentScroll ([cf31b1a5](https://github.com/angular/material/commit/cf31b1a58672ed70c20ccbc7c6856c62987b144d))


#### Features

* add hammerjs dependency ([e383e4f4](https://github.com/angular/material/commit/e383e4f4dc7a03f36ce874d25521ca2d3bf3f227))
* **$materialToast:** add swipe-to-close functionality ([22285dc4](https://github.com/angular/material/commit/22285dc46d69771d56f4ea00e7df6fe1a95e4ae0))
* **divider:** add implementation of the divider component ([e3aceeae](https://github.com/angular/material/commit/e3aceeae827a0a6ca132404aaaf4d1d90ebb84ae), closes [#194](https://github.com/angular/material/issues/194))
* **docs:** added support for the doc app to show its associated Git SHA id/link ([02d2e5d2](https://github.com/angular/material/commit/02d2e5d2c3729314a46f0d864412a5445b9477cf))
* **progressLinear:** Add linear progress indicator ([f87d0452](https://github.com/angular/material/commit/f87d0452453825f121773dec27f3cfd921bd9588), closes [#187](https://github.com/angular/material/issues/187))
* **material-dialog:** on open focus `.dialog-close` or the last button ([8f756fc6](https://github.com/angular/material/commit/8f756fc608a38979e64ab258e2943778bb36bfd9), closes [#222](https://github.com/angular/material/issues/222))
* **material-switch:** add switch component ([4975c743](https://github.com/angular/material/commit/4975c7432b814c1e401a48c8e5601ec7a30fa477), closes [#80](https://github.com/angular/material/issues/80))
* **slider:** add full-featured slider component ([5ea4dbc2](https://github.com/angular/material/commit/5ea4dbc2cbb778884bb164d91fcf9b6262987e52), closes [#260](https://github.com/angular/material/issues/260), [#31](https://github.com/angular/material/issues/31))
* **switch:** add focus styles ([8878ca7a](https://github.com/angular/material/commit/8878ca7aed861ac4c667cc96de61b8c2e09f9bac))
* **tabs:** improvements to pagination, disabled tabs, and tab navigation. ([b4244bf3](https://github.com/angular/material/commit/b4244bf3a2d9b97c78361fd0b0189919a710e394))

