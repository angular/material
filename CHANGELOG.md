<a name="0.0.3"></a>
### v0.0.3  (2014-09-19)

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
* **linearProgress:** Add linear progress indicator ([f87d0452](https://github.com/angular/material/commit/f87d0452453825f121773dec27f3cfd921bd9588), closes [#187](https://github.com/angular/material/issues/187))
* **material-dialog:** on open focus `.dialog-close` or the last button ([8f756fc6](https://github.com/angular/material/commit/8f756fc608a38979e64ab258e2943778bb36bfd9), closes [#222](https://github.com/angular/material/issues/222))
* **material-switch:** add switch component ([4975c743](https://github.com/angular/material/commit/4975c7432b814c1e401a48c8e5601ec7a30fa477), closes [#80](https://github.com/angular/material/issues/80))
* **slider:** add full-featured slider component ([5ea4dbc2](https://github.com/angular/material/commit/5ea4dbc2cbb778884bb164d91fcf9b6262987e52), closes [#260](https://github.com/angular/material/issues/260), [#31](https://github.com/angular/material/issues/31))
* **switch:** add focus styles ([8878ca7a](https://github.com/angular/material/commit/8878ca7aed861ac4c667cc96de61b8c2e09f9bac))
* **tabs:** improvements to pagination, disabled tabs, and tab navigation. ([b4244bf3](https://github.com/angular/material/commit/b4244bf3a2d9b97c78361fd0b0189919a710e394))


