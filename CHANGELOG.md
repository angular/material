<a name="0.4.2"></a>
### 0.4.2  (2014-10-16)

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

