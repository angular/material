<a name="0.9.7"></a>
### 0.9.7  (2015-06-01)


#### Features

* **autocomplete:** adds support for validation/ng-messages ([1f0a8450](https://github.com/angular/material/commit/1f0a845033df53244c54b47b42173fb37241586c), closes [#2808](https://github.com/angular/material/issues/2808), [#2664](https://github.com/angular/material/issues/2664))
* **icons:** add support for font-icons with ligatures and Material-Icon demos ([a1074907](https://github.com/angular/material/commit/a10749074ee05b5f12685c546c52165bf7420eb9), closes [#3059](https://github.com/angular/material/issues/3059))


#### Breaking Changes

* **autocomplete:** `name` attribute has been changed to `input-name` to more clearly show its purpose


#### Bug Fixes

* **autocomplete:**
  * only 2 messages will be displayed at any given time for autocomplete ([6b4e95ce](https://github.com/angular/material/commit/6b4e95ce23dded8787329cc0f394fe9178d5bc06), closes [#2785](https://github.com/angular/material/issues/2785))
  * prevents text from going under the `clear` button ([73e03a70](https://github.com/angular/material/commit/73e03a704124475cadb2eec5de09403c9a447186), closes [#2193](https://github.com/angular/material/issues/2193), [#2578](https://github.com/angular/material/issues/2578))
  * prevents error on keydown when menu is hidden ([a7dcfb6d](https://github.com/angular/material/commit/a7dcfb6d9427d0645ed98f53f9575925177dcbe6), closes [#2774](https://github.com/angular/material/issues/2774))
  * autocomplete will no longer show the dropdown on value changes when not focused ([c3ec08d8](https://github.com/angular/material/commit/c3ec08d8aa5ccfa95fec4f41a5be09369cd19f73), closes [#2756](https://github.com/angular/material/issues/2756))
* **input:** update disabled underline styles ([8f2b2c68](https://github.com/angular/material/commit/8f2b2c6835feb151e362d9e135c795055f9a5ccd), closes [#2870](https://github.com/angular/material/issues/2870))
* **progressLinear:** rewrites animation for progress linear ([1d478ebd](https://github.com/angular/material/commit/1d478ebd6e5c6ddb6453cc1a708064459075a75e), closes [#2762](https://github.com/angular/material/issues/2762))
* **tabs:**
  * adds ui-sref/ng-href support to tabs ([6c53d112](https://github.com/angular/material/commit/6c53d1127fc1cb7d2a86802e5831642a40ff1e41), closes [#2344](https://github.com/angular/material/issues/2344))
  * updating dynamic tab labels will now be reflected ([8ac4fa1b](https://github.com/angular/material/commit/8ac4fa1b3f23f1f73125cc7e2425d349d7ad546e))
  * select/deselect events will now fire when a tab is removed but the index does no ([5e47b52b](https://github.com/angular/material/commit/5e47b52bd6a8817b2624ca6797b8267a162f84af), closes [#2837](https://github.com/angular/material/issues/2837))
  * initial state will now scroll to selected tab ([120c271b](https://github.com/angular/material/commit/120c271be0058ec96e676c34dd55baf53357ae6d), closes [#2838](https://github.com/angular/material/issues/2838))
* **toolbar:** add h1 to toolbar tools headings ([c100ef10](https://github.com/angular/material/commit/c100ef10069f769f90d606792c68ca9042fe67a4))
* **tooltip:**
  * pointer-events 'none' used properly with activate events ([667e4c24](https://github.com/angular/material/commit/667e4c244ccd9a1dfef6894a64b6df0c5e2f6305))
  * hide tooltip after mouseleave if focus is achieved through mousedown ([e73d290c](https://github.com/angular/material/commit/e73d290cc84f07612d0faf08aec014714f18011a))


<a name="0.9.6"></a>
### 0.9.6  (2015-05-28)


#### Bug Fixes

* **build:** fixes bug where versions in 0.9.5 comments were wrong. ([7a1ad41f](https://github.com/angular/material/commit/7a1ad41f3c1df6cb1dfa750cb817f166f02097ee))
* **closure:** fixes issue in core.js where multiple `goog.provide` lines were included


<a name="0.9.5"></a>
### 0.9.5  (2015-05-28)


#### Features

* **accessibility:** additional Windows high-contrast styles ([37bc5b6f](https://github.com/angular/material/commit/37bc5b6f54bde618df8cfd9f85c0f860c811e451))
* **button:** md-icon-button to use round ripple ([ab1e9e05](https://github.com/angular/material/commit/ab1e9e05908114fe5fb587f9b59aab4db749f9b3))
* **listItem:** allow use of own md-buttons ([0ef4b79f](https://github.com/angular/material/commit/0ef4b79f53da91edc9f5591ceeb1950e73c50d3d))


#### Breaking Changes

* Removed attach(button|tab|checkbox|list)Behavior
    in favor of composing an injectable ripple service specific to
    your target.  $mdInkRipple was too aware of how to configure
    components.  You now have access to $mdButtonInkRipple,
    $mdTabInkRipple, $mdListInkRipple, $mdCheckboxInkRipple.

  Change your code from this:
    ``` javascript
        function MyService($mdInkRipple) {
          //... Included for brevity
          $mdInkRipple.attachButtonBehavior(scope, element, options);
        }
    ```

  To this:
    ``` javascript
        function MyService($mdButtonInkRipple) {
          //... Included for brevity
          $mdButtonInkRipple.attach(scope, element, options);
        }
    ```
* **icons:** Default size for `md-icon` has been changed from `28px` to `24px`
* **tabs:** Replaces pagination transition with `transform` rather than `left` for performance

 ([3b0f12e3](https://github.com/angular/material/commit/3b0f12e3b8e7c5b7ab78ea0b8672d1b1b54ef4b8))


#### Bug Fixes

* **autocomplete:**
  * uses $attr to support `data-` prefixed attributes ([1dc56a6c](https://github.com/angular/material/commit/1dc56a6cfae0ace6c20848f65c3d6262bb9973bb), closes [#2798](https://github.com/angular/material/issues/2798))
  * resolves xss bug with autocomplete text highlighter ([1538ebe9](https://github.com/angular/material/commit/1538ebe9c2d8b9aec84d1f556a9b4cfe5a38dc04), closes [#2901](https://github.com/angular/material/issues/2901))
  * pulls in text content as HTML to prevent it from being un-escaped ([33ac259d](https://github.com/angular/material/commit/33ac259d66c90e96489d0512ac762f969458f5bd))
* **build:**
  * build will now update CHANGELOG in master ([859ceb18](https://github.com/angular/material/commit/859ceb1866094a85625de532ff578779712ff7d5))
  * fixes issue where release tag doesn't match release branch ([5f7b1e91](https://github.com/angular/material/commit/5f7b1e91d1575d89de8c228099b5213c7347cb48))
* **button:** makes icon-buttons round for ripple and focus state ([98025aaf](https://github.com/angular/material/commit/98025aaf19796ca7c6c59ec37f37233a42787cc3))
* **chips:** removes box-shadow from inline autocomplete ([bc407590](https://github.com/angular/material/commit/bc4075909baaa828b12d1327b7a57896e505c35a))
* **demo:** use relative path to img src ([175fd54d](https://github.com/angular/material/commit/175fd54d16921e2263ac1f696be30ce58ea67a5d), closes [#2916](https://github.com/angular/material/issues/2916))
* **docs:**
  * use source path for github url ([0a1ed581](https://github.com/angular/material/commit/0a1ed5813e07ea9807ee88f9047c6970593dc399), closes [#2900](https://github.com/angular/material/issues/2900))
  * use source rather than combined js ([fd8fcf22](https://github.com/angular/material/commit/fd8fcf22fa85ae8c9af59d59e9dc73be93d21c2b))
* **list:** correctly proxy ng-disabled attrs ([a25bc0ea](https://github.com/angular/material/commit/a25bc0ea42cbaedd569d385d0c722702ae0bf60d))
* **listItem:** fix ng-enter having animation ([41953d5a](https://github.com/angular/material/commit/41953d5a0ad3492082b3fd99a82e212c59e75750))
* **md-icon:** change icon size back to 24px ([3b305a3d](https://github.com/angular/material/commit/3b305a3d5bb46e366c9b7bfb7a069ff040392529), closes [#2992](https://github.com/angular/material/issues/2992))
* **minify:** tabsDirective template function works when minified ([c7ea4a78](https://github.com/angular/material/commit/c7ea4a7865dd1b6b128c88bfa57ea92b9a617afa))
* **select:**
  * respect id attributes if assigned ([fc90fd31](https://github.com/angular/material/commit/fc90fd3173569f60acf53a2318fe453b42dd221a))
  * label not updating after objects resolved via promise ([74259976](https://github.com/angular/material/commit/742599769700e3a016db4454aa339bb3e35bf53f))
* **subheader:** theme is applied to sticky clone ([e92686f0](https://github.com/angular/material/commit/e92686f0b400214ea0fd5209bff4923555a16bd4), closes [#2779](https://github.com/angular/material/issues/2779))
* **tabs:**
  * re-adds disconnected scopes for tab content ([e6f19d48](https://github.com/angular/material/commit/e6f19d4868059cd48e3dfd811273cff36c3ef9a4))
  * uses `ng-if` to remove inactive tabs once their animation is complete ([8dcaea8a](https://github.com/angular/material/commit/8dcaea8af19a6dcc2d9cafdd2ebb4277e66e89ae))
  * replaces pagination transition with `transform` rather than `left` for performan ([a8ff2ad1](https://github.com/angular/material/commit/a8ff2ad1779bdeabb2d960f69ebde23470353989))
  * fix missing dependency ([0b35c9b4](https://github.com/angular/material/commit/0b35c9b4c068fe13071a0a85da08125e316093e4), closes [#2460](https://github.com/angular/material/issues/2460))
* **theming:** remove bogus hue value from grey palette ([0c28cee2](https://github.com/angular/material/commit/0c28cee2aad29b47a7f6b93ca5c27bca0d833dc1))
* **tooltip:** use label instead of aria-describedby ([198199c1](https://github.com/angular/material/commit/198199c1eae39dbc7d139db42c5d4d3919aaeab2))


<a name="0.9.4"></a>
### 0.9.4  (2015-05-15)

This interim release **fixes** an incorrect deployment of `angular-material.js`; which added the Closure Library **Namespace** features using `goog.provide()`. Only source in `/modules/closure/**.js` should use this namespacing.
#### Features

* **build:** add script to snapshot docs site ([76e36722](https://github.com/angular/material/commit/76e36722e07846b518612e9073785a279b3027cd), closes [#2852](https://github.com/angular/material/issues/2852))


#### Bug Fixes

* **build:** fixes issue where JS files were being generated with Closure code ([ca940384](https://github.com/angular/material/commit/ca94038439982e81077020962042ec9f453dbf0e)), closes [#2852](https://github.com/angular/material/issues/2852))


<a name="0.9.3"></a>
### 0.9.3  (2015-05-14)

This release is also using enhanced scripting to automate the build and release processes. Releases will now also deploy versioned docs to http://github.com/angular/code.material.angularjs.org.

#### Bug Fixes

* update rems to pixels ([08b89921](https://github.com/angular/material/commit/08b899210a963c87b1b70ccb88e2ee3191bc0647))
* **autocomplete:** prevents `not found` message from displaying while results are loading ([3d5bd948](https://github.com/angular/material/commit/3d5bd94825688a6814266e7e1401b56e513f84c9))
* **build:** enable build of component modules. ([8a886d79](https://github.com/angular/material/commit/8a886d7951e679174c7742d41a9a67c9f4462955))
* **codepen:**
  * escape ampersand in &nbsp; ([0a5603f8](https://github.com/angular/material/commit/0a5603f8bc31c76012bf25e3657cb6f908f3bae1), closes [#2827](https://github.com/angular/material/issues/2827))
  * use https to avoid mixed content ([fbae0fcb](https://github.com/angular/material/commit/fbae0fcb697ecb959c3dc2922efe0fd8bb4a4124))
* **dialog:**
  * remove dialog wrapper from tab order ([dcb12a7c](https://github.com/angular/material/commit/dcb12a7c5ea8177de6f473bfe7bbf5c6d939bb75), closes [#2712](https://github.com/angular/material/issues/2712))
  * styling custom dialog wrapped in form ([666630ca](https://github.com/angular/material/commit/666630cab10fff2bb66bd0e6aeec552b27352db5), closes [#2637](https://github.com/angular/material/issues/2637))
  * style cleanup, button sizing ([9110d1e1](https://github.com/angular/material/commit/9110d1e1ace0b3d420d4ed329e61bde104ddea0d), closes [#2671](https://github.com/angular/material/issues/2671))
* **gesture:** fix conflicts with Ionic ([05788d24](https://github.com/angular/material/commit/05788d242412f7b7d3babfab3931c0ee5a03aca2), closes [#1528](https://github.com/angular/material/issues/1528), [#1528](https://github.com/angular/material/issues/1528))
* **list:**
  * align icons to top ([a2b88bea](https://github.com/angular/material/commit/a2b88beae24127251c5844747b69f48ebeb120fa), closes [#2589](https://github.com/angular/material/issues/2589))
  * support aria-label for primary action ([e9324a9e](https://github.com/angular/material/commit/e9324a9ebf3ecabf0397a83a5275608600fa8115), closes [#2773](https://github.com/angular/material/issues/2773))
* **tabs:**
  * corrects css bug with tab-data positioning ([a8fd0f4d](https://github.com/angular/material/commit/a8fd0f4dc14154b1b41137773e157b7574661cb8))
  * reordering tabs should now work ([5bc3f232](https://github.com/angular/material/commit/5bc3f232f1850d80ec3dbf9bb7fbcf93b173f8fc))
* **tests:** performance improvements and fixes to jasmine testing ([786b0ed3](https://github.com/angular/material/commit/786b0ed3652b7460c2c802efa1aa79972bd96f5d), closes [#2800](https://github.com/angular/material/issues/2800))
* **toolbar:** align last icon button to spec ([f988255d](https://github.com/angular/material/commit/f988255d1a95e998e7e62b1e7b4d7c7687016ccb), closes [#2497](https://github.com/angular/material/issues/2497))
* **tooltip:** update to spec, remove max-width ([8c60d9c7](https://github.com/angular/material/commit/8c60d9c7a63ab8598e7367bf7ef2b31afe1bdae6), closes [#656](https://github.com/angular/material/issues/656))


#### Features

* **docs:** edit code example in codepen ([5c37dc8c](https://github.com/angular/material/commit/5c37dc8c54ddd0e6ca3bd138665c4997c8189b52), closes [#2604](https://github.com/angular/material/issues/2604))



<br/>
<br>

<a name="0.9.0"></a>
## 0.9.0  (2015-05-04)


#### Features

* **autocomplete:** adds support for messages to be displayed when no results are found ([e057e271](https://github.com/angular/material/commit/e057e27171f15b1923d740a27447e7fafa66673a), closes [#2574](https://github.com/angular/material/issues/2574), [#1525](https://github.com/angular/material/issues/1525))

#### Breaking Changes

* **styles:** removes global `line-height` and `font-size` from `html` and `body` ([666e3311](https://github.com/angular/material/commit/666e3311a8b66fb0910dc745192aaca23587bd29))
* **icons:** namespaces built-in icons ([539ec5e3](https://github.com/angular/material/commit/539ec5e36281aa8a6f645376bcd4512911165fb9))
* **gridlist:** `md-grid-tiles` must be direct children of `md-grid-list` ([5d9142ea](https://github.com/angular/material/commit/5d9142ea8d77e60350e8a7ddd02be6642218c0fa))


#### Bug Fixes

* **autocomplete:**
  * improves logic behind scrolling items into view on keyboard navigation ([211a31ea](https://github.com/angular/material/commit/211a31ea363a721240d23b9f591e7652ab5f313e), closes [#2615](https://github.com/angular/material/issues/2615))
  * addresses issue where dropdown shows if there is an initial value ([85846922](https://github.com/angular/material/commit/85846922934226d2d62646df06d96f644e332378), closes [#2517](https://github.com/angular/material/issues/2517))
  * fixes positioning issue with clear button ([1fcb79a6](https://github.com/angular/material/commit/1fcb79a6e56e2c8d337c2875eca3740a8aafb235), closes [#2593](https://github.com/angular/material/issues/2593))
* **button:** disable warn and accent buttons ([973c4d75](https://github.com/angular/material/commit/973c4d75847479d670dff620e1cc3104435bbcfc), closes [#2586](https://github.com/angular/material/issues/2586))
* **compiler:** make bindToController vars available to instantiation fn ([e414091a](https://github.com/angular/material/commit/e414091ac0272652217010ca64ad96389f657e46))
* **dialog:** makes sure that body is not more than 100% height when dialog is showing ([6806f554](https://github.com/angular/material/commit/6806f5546bd51929793b77d86675725670fa7bea))
* **gridlist:**  noops layoutDelegate ([2b6dd4dc](https://github.com/angular/material/commit/2b6dd4dced54e62721a1339143cf7b8996ba9e88), closes [#2613](https://github.com/angular/material/issues/2613))
* **icons:** namespaces built-in icons ([539ec5e3](https://github.com/angular/material/commit/539ec5e36281aa8a6f645376bcd4512911165fb9))
* **input:**
  * minimize overlapping on iOS ([ea817874](https://github.com/angular/material/commit/ea817874b0b46fbae883e5191b234d1d4e38179c))
  * remove overflow-x causing drop on iOS ([f1df6dc0](https://github.com/angular/material/commit/f1df6dc09c20635d42ffaada32ae2f036666a5ba), closes [#2539](https://github.com/angular/material/issues/2539))
* **list:** Do not ignore spaces in descendant textareas. ([f737fb04](https://github.com/angular/material/commit/f737fb04d4e93033365bb2a178c5ecbafaab42f0))
* **select:**
  * fix theming ([7e0a2aaa](https://github.com/angular/material/commit/7e0a2aaaf79e87da6b7536fcf4bf66f4213227e9))
  * update rendering on option changes ([4e855c7f](https://github.com/angular/material/commit/4e855c7fb6dda3a24811597fdb10d2f62048920e))
  * expose and preserve aria-label ([bd3d8fba](https://github.com/angular/material/commit/bd3d8fba5045bd4cfda5a46463ea15ecd23a30fc), closes [#1893](https://github.com/angular/material/issues/1893))
  * rendering in input group ([aa9058fe](https://github.com/angular/material/commit/aa9058fe737f69d3d36fbffaebd7fb1774e9ee39))
* **slider:** adds box-sizing to fix slider ripple positioning ([e982547b](https://github.com/angular/material/commit/e982547b0e8a0502c0180099e5a7b3f4c3431ffb))
* **styles:** fixes rem syntax for negative values ([2fef6cad](https://github.com/angular/material/commit/2fef6cada79dc6a3b42f1ab14f8a143f7044ae48))
* **tabs:**
  * fixes `md-center-tabs` css bug ([44e6984a](https://github.com/angular/material/commit/44e6984ad36544326cccbbf34aeeb08337b41e2c), closes [#2638](https://github.com/angular/material/issues/2638))
  * cleans up scope tree for tabs ([294e0664](https://github.com/angular/material/commit/294e06645c3a7b9323a95db10879844c0bbc9150), closes [#2600](https://github.com/angular/material/issues/2600))
* **toolbar:**
  * prevents transition lag on ng-if/ng-hide/ng-show ([544cb270](https://github.com/angular/material/commit/544cb270c65f86b44d9f882460ca784d43546b30), closes [#2663](https://github.com/angular/material/issues/2663))
  * adds shadow when content moves under 'scroll shrink' toolbar ([92ed4657](https://github.com/angular/material/commit/92ed46578001eeb54c009bfc9f302be783f79137))
  * sets icon color to primary contrast color within toolbars ([8ea0dc1d](https://github.com/angular/material/commit/8ea0dc1da8f75d8fdb1262e955156e8a62119a90), closes [#2622](https://github.com/angular/material/issues/2622))


<a name="0.9.0-rc3"></a>
### 0.9.0-rc3  (2015-04-28)


#### Features

* **autocomplete:** allows tab or enter to select an item ([59015b09](https://github.com/angular/material/commit/59015b0991f06993b3eb70457716be97c7b6369d))
* **button:** support angular-new-router ng-link ([4b9dcab5](https://github.com/angular/material/commit/4b9dcab5baf1e6794b8382ad997dc9047c58f3bd), closes [#2478](https://github.com/angular/material/issues/2478))
* **tooltip:** Support hide-* show-* and user defined css using "display: none;" ([08132848](https://github.com/angular/material/commit/08132848b9702481a6dc46b0490ffa91646acdd2), closes [#2386](https://github.com/angular/material/issues/2386))


#### Breaking Changes

* content containers for `md-dialog` now require `md-dialog-content` to be more flexible with child content containers. This is more consistent with `md-card`, which uses `md-card-content`. ([9dc62403](https://github.com/angular/material/commit/9dc624033aac3714e97a8356b34508ffdcf02cf6))
* md-input-containers no longer allow both label and placeholder to be used simultaneously. Now the placeholder value (if present) is transcluded as a label or ignored. When the placeholder value is ignored, a warning will be logged. ([d931c0d2](https://github.com/angular/material/commit/d931c0d237777c0197464277a5d8096bc3cbd698))


#### Bug Fixes

* **autocomplete:**
  * adds support for the new `$animate.pin()` in `ng-animate@1.4.0-rc.1` ([790ccca6](https://github.com/angular/material/commit/790ccca695233e80f2720e3d4b2b67d2736b39fd))
  * adds watcher for ngDisabled rather than 2-way binding ([973a2fca](https://github.com/angular/material/commit/973a2fcadfc0fb786635cabf7c6674e5027117c4), closes [#2160](https://github.com/angular/material/issues/2160))
  * allow undefined `searchText` and `selectedItem` ([8fb60c34](https://github.com/angular/material/commit/8fb60c343a720a240ba8661f606ffe4479d05195), closes [#2515](https://github.com/angular/material/issues/2515))
  * fixes issue where autocomplete suggestions were not hiding ([da0a4f06](https://github.com/angular/material/commit/da0a4f06c54248c6d73eba7767cdf06bc0225f57))
  * fixes bug that prevented autocomplete results from displaying on focus if min-le ([5e72bb3d](https://github.com/angular/material/commit/5e72bb3db0b965fce0065cb12d56bcc6b122d8c5))
* **bottomsheet:** fix button styles ([7bd97acc](https://github.com/angular/material/commit/7bd97acc60a895eea75978a95f0c43e8d6d3ebd2))
* **build:**
  * adds missing quotes for closure build ([041ffe94](https://github.com/angular/material/commit/041ffe943651de276c0558370e59f4a8ffde4863))
  * adds method that was missing from previous update ([77420942](https://github.com/angular/material/commit/774209429e1232fd975610123beef7e9f6dc5fd9))
* **button:**
  * icon inherits colors ([92aff331](https://github.com/angular/material/commit/92aff331bd9397cc5469a70ca502dfc239239652), closes [#2434](https://github.com/angular/material/issues/2434), [#2551](https://github.com/angular/material/issues/2551), [#2586](https://github.com/angular/material/issues/2586))
  * make buttons less opinionated ([482a916a](https://github.com/angular/material/commit/482a916ae72f01b6ed1383d36bcec120c02b256a), closes [#2580](https://github.com/angular/material/issues/2580), [#2438](https://github.com/angular/material/issues/2438))
  * fixes typo in button scss file ([b742dfda](https://github.com/angular/material/commit/b742dfda81500852dcffbc3a19a9ec40d5f314b4), closes [#2432](https://github.com/angular/material/issues/2432))
* **card:** md-action-bar renamed to .md-actions ([5610dc98](https://github.com/angular/material/commit/5610dc98798c4148ca284e3f61208cb494da75dc), closes [#2472](https://github.com/angular/material/issues/2472))
* **chips:**
  * fix $apply already in progress ([daf680f0](https://github.com/angular/material/commit/daf680f0bc3a6e6460e5ae6894893970e684c3dc), closes [#2458](https://github.com/angular/material/issues/2458))
  * removes flicker when switching selected chip ([55fa76a0](https://github.com/angular/material/commit/55fa76a0a98e53ec91addaba5fdcba77cea17ef4))
* **demo:** fix list demo secondary action. ([7e5d5e34](https://github.com/angular/material/commit/7e5d5e342fddc3d9f0ec1d5e1217b6eb8e6a6ec4), closes [#2471](https://github.com/angular/material/issues/2471))
* **dialog:**
  * use .md-primary color for actions ([4a648d55](https://github.com/angular/material/commit/4a648d55578a2d54e64bfc0b3f1dec5fa73bef57), closes [#2448](https://github.com/angular/material/issues/2448))
  * Rename md-content to md-dialog-content ([9dc62403](https://github.com/angular/material/commit/9dc624033aac3714e97a8356b34508ffdcf02cf6), closes [#2514](https://github.com/angular/material/issues/2514))
* **docs:** fix doc app toolbar breadcrumb when using back button ([58f2c481](https://github.com/angular/material/commit/58f2c481175a0bd27a6ea8754f4ba79fda8445ec), closes [#2464](https://github.com/angular/material/issues/2464))
* **gridlist:** Tile ordering improved ([5d9142ea](https://github.com/angular/material/commit/5d9142ea8d77e60350e8a7ddd02be6642218c0fa), closes [#2553](https://github.com/angular/material/issues/2553), [#NaN](https://github.com/angular/material/issues/NaN))
* **highlight:** adds missing characters to sanitize method ([ef0dce07](https://github.com/angular/material/commit/ef0dce076716669d1d9a6ca50a6d341fad774632), closes [#2292](https://github.com/angular/material/issues/2292))
* **icon:** rem sizes, line-height for font icons ([860d1f67](https://github.com/angular/material/commit/860d1f67db2be427aff149cbd0c13f0f3d39e4ca), closes [#2597](https://github.com/angular/material/issues/2597))
* **input:** improve layout when md-input-container has nested md-icon. ([2dbe6a97](https://github.com/angular/material/commit/2dbe6a973b546cc9cdf79ca5e8262188a2570bfc), closes [#2452](https://github.com/angular/material/issues/2452))
* **interimElement:** fix default parent grabbing svg body ([952d5f50](https://github.com/angular/material/commit/952d5f508a618fccd002ac28b211bc02e8f76c8d))
* **list:**
  * prevents error when there are no child elements ([f66e4718](https://github.com/angular/material/commit/f66e4718451b90cd27f393a2bbc46e3e6891a61e))
  * fixes line-height issues with list items and checkboxes/icons/switches ([4b045b58](https://github.com/angular/material/commit/4b045b5860cc5bebe6e7e17ca4c723a71a6abbfa))
  * fixes checkbox styles for list items ([6a0b7015](https://github.com/angular/material/commit/6a0b70159fc6fc6eebbb08defc6ee57d62124cd3))
* **mdUtil:**
  * move comment nodes as well when reenabling scroll ([6a5a6a77](https://github.com/angular/material/commit/6a5a6a77a3c8eaa88a9ca234ab5f10e5e8b82da4), closes [#2592](https://github.com/angular/material/issues/2592))
  * move comment nodes as well when disabling scroll ([160df4cf](https://github.com/angular/material/commit/160df4cf436ff22b487e4691dfb3b8034cc0da19), closes [#2456](https://github.com/angular/material/issues/2456))
* **select:**
  * add support for non-scrolling md-content ([88612d65](https://github.com/angular/material/commit/88612d6503ad3921a186ae3de4bb8422f6e76bce))
  * fix window resize listeners breaking after select shown ([7c74050f](https://github.com/angular/material/commit/7c74050fd83311880de5d11eae9ac199f56f54b2))
  * fix error when removing node on route change ([9d761878](https://github.com/angular/material/commit/9d7618781929f9983cb1550fe015b75182abbe26))
* **tabs:**
  * select/deselect methods will now be called in the proper scope ([02a4af56](https://github.com/angular/material/commit/02a4af565862d3da5caebbc059f388c942f11e1f), closes [#2489](https://github.com/angular/material/issues/2489))
  * removes top border radius when tabs immediately follows md-toolbar ([6372111c](https://github.com/angular/material/commit/6372111c8048d0f13dc6d47609e777b8c26940ee), closes [#2394](https://github.com/angular/material/issues/2394))
  * fixes styles for Firefox ([6996edd3](https://github.com/angular/material/commit/6996edd39378f366416c59dc8e781fecddad19b5), closes [#2543](https://github.com/angular/material/issues/2543))
* **tests:** support for Angular 1.4 and improved use of angular-mocks. ([48ee9867](https://github.com/angular/material/commit/48ee9867cd44f7a387e78d4a323f5a9e44382550))


<a name="0.9.0-rc2"></a>
### 0.9.0-rc2  (2015-04-20)

This RC2 release contains more polish and bug fixes to stabilize performance, layout, and improve the UX for Chips, List, Select, and Tabs.

#### Features

* **chips:**
  * allows user to require a matched item - used with autocomplete ([736cbdb0](https://github.com/angular/material/commit/736cbdb096d4e064e1176e92eabddfe63288090c))
  * adds keyboard shortcuts to chips component ([c62d4dfd](https://github.com/angular/material/commit/c62d4dfd0f8741d90a2c69873154f55c91c3e7e7))
* **list:**
  * extend typography styles ([70fc6290](https://github.com/angular/material/commit/70fc62907442cb5e1349dcc9f3c3bafc601245c6), closes [#2366](https://github.com/angular/material/issues/2366))
  * add ripple to secondary to md-list actions ([927d8e56](https://github.com/angular/material/commit/927d8e5612c60afb7c18e4c697dc0e343f28e963))
* **mdUtil:** add md-overflow-wrapper-shown class to DOM ([5a028092](https://github.com/angular/material/commit/5a028092c1236dc50ef428c4f3292b4641b831bd))


#### Breaking Changes

* List
  * `md-item` has been renamed to `md-list-item`
  * `md-item-content` element is now a `.md-list-item-text` class
  * List styles of `.md-tile-left` changed to `.md-avatar` for avatar-like images
  * `md-list-item` uses `.md-no-proxy` and `.md-no-style`
* Tabs
  * When using `md-tab-label`, the content of your tab **must** be wrapped in `md-tab-body`
* Typography changes have significantly impacted the `<h1>`...`<h4>` types.

 ([f1db7534](https://github.com/angular/material/commit/f1db7534ae73de3820f0f84b6b2b40f4011770e0))

#### Bug Fixes

* **autocomplete:** fixes positioning logic to fire at the correct time ([8946322b](https://github.com/angular/material/commit/8946322b956ae6795e6ea0a700423469982bcdd5), closes [#2298](https://github.com/angular/material/issues/2298))
* **button:**
  * limit flat/raised button height ([9fc2c28b](https://github.com/angular/material/commit/9fc2c28b9084e6f5651a41540216045e176c93ef), closes [#2380](https://github.com/angular/material/issues/2380))
  * address flat hover state ([1e7b9823](https://github.com/angular/material/commit/1e7b98235c004ae384946d71a8aa9ac71e434883), closes [#2382](https://github.com/angular/material/issues/2382))
* **card:** action bar spacing, remove order attrs ([50ce4e8b](https://github.com/angular/material/commit/50ce4e8b053b3387a81d1a4d533af06be9ef1e5c), closes [#2403](https://github.com/angular/material/issues/2403))
* **checkbox:** style checkbox without visual label ([ab264807](https://github.com/angular/material/commit/ab26480780677fae4dd9b5a6238fa531b50bed6e), closes [#2175](https://github.com/angular/material/issues/2175))
* **chips:**
  * adds better focus handling for chips ([def6d3a4](https://github.com/angular/material/commit/def6d3a41441481f7a85503a5eb666332e055e27))
  * fixes issue where arrow keys switch active chip while editing input field ([1f261440](https://github.com/angular/material/commit/1f2614404a8d6cce45437f027662066f11ae35ef))
  * fixes issue with deletion logic ([6d4ecbee](https://github.com/angular/material/commit/6d4ecbee951ad87a73277517bc15c3c64264c149))
  * fixes shift+tab interaction with `md-chips` ([314aae1c](https://github.com/angular/material/commit/314aae1c345635f3ec1f67c842a38e19ee49b01e))
  * adds aria-hidden to remove buttons ([79b07399](https://github.com/angular/material/commit/79b073992a2e59f449d93321d74912d7cbe2eed6), closes [#2345](https://github.com/angular/material/issues/2345))
  * adds slightly better support for input types other than `text` ([d885d638](https://github.com/angular/material/commit/d885d638ac8f8d1c0660d30e6dfdca0fe780d0e8))
  * prevents item deletion when text is selected ([b65236b7](https://github.com/angular/material/commit/b65236b70ae3d6eb86d3d78631144fe65848d4ca), closes [#2322](https://github.com/angular/material/issues/2322))
* **dialog:** action spacing matches spec ([d7b23763](https://github.com/angular/material/commit/d7b23763c7f17581b15c4b049faa8b306b9aed2a), closes [#2389](https://github.com/angular/material/issues/2389))
* **input:** expect input container to use placeholder for label fallback ([8410c0d6](https://github.com/angular/material/commit/8410c0d6c46def09674a09a052e8503d85577085), closes [#2397](https://github.com/angular/material/issues/2397))
* **inputContainer:** style ng-messages as both element and attr ([a5d09af5](https://github.com/angular/material/commit/a5d09af5493531f48a6c3a59036579cfa974c048))
* **interimElement:** add fallback to document.body if root node removed ([3b3d0205](https://github.com/angular/material/commit/3b3d020581593eba3eea7632d68acdeb15dc56ad))
* **list:**
  * check child element length before detecting proxies ([c964609e](https://github.com/angular/material/commit/c964609e1f8842418d8494fe6bb8f276885aafa6))
  * add ripple, inherit from .md-button ([25cc5e8a](https://github.com/angular/material/commit/25cc5e8a9657f1d0731e6f11b4e44ad621bb3486), closes [#2395](https://github.com/angular/material/issues/2395))
  * fix key hijacking ([e1ca13fd](https://github.com/angular/material/commit/e1ca13fdea90867e3ecb841caf20860accfd764c))
* **mdList:** remove focus state on blur ([588e58cf](https://github.com/angular/material/commit/588e58cf6de9be13f77c820a1582f2d1a2c36cb0), closes [#2339](https://github.com/angular/material/issues/2339))
* **select:**
  * fix scrollbars not respecting parent overflow hidden ([b9ee6121](https://github.com/angular/material/commit/b9ee6121412d59895b43286f4eefd4418e9081aa))
  * fix select backdrop closing when parent is destroyed ([2d66368c](https://github.com/angular/material/commit/2d66368cc31daf476bf786083a256d47a0e338ce))
  * fix infinite loop condition ([6e3b43cc](https://github.com/angular/material/commit/6e3b43cc91df2fa84a8c3983763e432b906a5740))
  * fix 1px error to match md-input-container style ([bd566a52](https://github.com/angular/material/commit/bd566a5217fedfb0731098795c6f45563c68716c))
  * add tabindex, aria-disabled support ([40924003](https://github.com/angular/material/commit/409240037aee989926179e4e5d3137dd9704b008), closes [#2308](https://github.com/angular/material/issues/2308))
  * fix restore focus on select close ([f55eeba0](https://github.com/angular/material/commit/f55eeba04150d0aecd2afe03c88009cf62293b9e))
  * remove broken ARIA attributes ([aaa6e5aa](https://github.com/angular/material/commit/aaa6e5aaef73d8667339521aed08f42abee53b01))
  * improve keyboard filtering ([f3c113c9](https://github.com/angular/material/commit/f3c113c9083dfd079c06e26bbcc8da5c52ba8586))
  * improve disable scroll layout ([68395a25](https://github.com/angular/material/commit/68395a254e70a8e57ccd2e03019228bf158435a4))
* **tabs:**
  * tabs will no longer assume that all tabs have no content if the first one doesn't ([1b789fed](https://github.com/angular/material/commit/1b789fed4cf55443e2d106537e6912fa1df605e2), closes [#2398](https://github.com/angular/material/issues/2398))
  * adds a queue for delayed function calls ([0e2ccd23](https://github.com/angular/material/commit/0e2ccd23dc220392c0082f9cb05ccfddf42d22a1), closes [#2402](https://github.com/angular/material/issues/2402))
  * resolves issue where `md-tabs` is used within `ui-view` by removing hard require ([43508032](https://github.com/angular/material/commit/4350803267a8e19a15a240ccf657cd2ba098e0ae), closes [#2414](https://github.com/angular/material/issues/2414))
  * apply ARIA only to dummy tabs ([5ad44728](https://github.com/angular/material/commit/5ad447284c7cda2261da1440819e3e0101a7b1ae))
  * cleans up label/template fetch logic ([17aecd2d](https://github.com/angular/material/commit/17aecd2dbc3acfe48006ff5adb12cad5e15aa70b))
  * id's should no longer cause issues when used within tab labels or contents ([ea185eab](https://github.com/angular/material/commit/ea185eabd13bbcce3e07628891836b0626f609e5), closes [#2326](https://github.com/angular/material/issues/2326))
* **tests:** mock .flush() added for Angular 1.4.x ([1e3f1a59](https://github.com/angular/material/commit/1e3f1a591f8f2f7c6bd54153df080367970b8a2d))
* **textfield:** removed unstable, deprecated textfield component Replaced with md-input-container ([b5c4390b](https://github.com/angular/material/commit/b5c4390bf7cb81809fea0df93c7d01e410b5585a))



<a name="0.9.1-rc1"></a>
### 0.9.0-rc1  (2015-04-14)

The release of 0.9 is primarily focused on bug fixes and polish efforts. Also included in this upcoming release will be  added support for List items and controls, Chips, re-architected Tabs, and improvements to Gesture support and documentation.

#### Features

* **autocomplete:**
  * adds `md-menu-class` to allow users to add a class to the dropdown menu for cust ([860897d9](https://github.com/angular/material/commit/860897d9c6f2db034ecb2e30dddd005bc174e00d))
  * dropdown will now stretch to accomodate longer text ([b1343704](https://github.com/angular/material/commit/b13437044147cecf6835850c95fc764a67d466d0))
  * adds support for `md-autocomplete-snap` to specify parent element for autocomple ([15d1db73](https://github.com/angular/material/commit/15d1db731eab44151543c2ec27323e0bc92f0878))
  * `md-highlight-text` now supports custom flags ([1ac0c93c](https://github.com/angular/material/commit/1ac0c93c369b1e6652741abd640e0539090bb083), closes [#1799](https://github.com/angular/material/issues/1799))
  * adds support for `name` attribute ([ebca76da](https://github.com/angular/material/commit/ebca76da4831c359547cce59d6378c9f0a93e913))
  * adds support for floating labels ([f487248a](https://github.com/angular/material/commit/f487248a70c9bfd749953e98e3412240112f39a3))
* **button:** support for link icon buttons ([1b9bafb5](https://github.com/angular/material/commit/1b9bafb5abd470e4e1bfd784484407588430083b), closes [#2265](https://github.com/angular/material/issues/2265))
* **card:** add default background color ([3bc8b27b](https://github.com/angular/material/commit/3bc8b27be39d33a07a58c562e9efafa184fdd12d), closes [#1846](https://github.com/angular/material/issues/1846))
* **chips:** initial commit Supports basic list mutation (add, remove items). ([713f7b67](https://github.com/angular/material/commit/713f7b67cd195d5abfde1540f26679d58f738bb5), closes [#2030](https://github.com/angular/material/issues/2030))
* **gestures:** add  provider to all config and optional skipClickHijack() ([f28393df](https://github.com/angular/material/commit/f28393df73a4ef85c18f54bd99041a74382375fb))
* **layout:** re-add offset attribute ([fecceeb5](https://github.com/angular/material/commit/fecceeb5158bbd78e848a449dd3840ccef76e1f6))
* **list:** BREAKING: add list controls ([abb807d0](https://github.com/angular/material/commit/abb807d0dcb77b92132b5ab73d61f97aa953f461), closes [#2021](https://github.com/angular/material/issues/2021))
* **mdButton:** add icon button for toolbars, etc. ([6ee9a190](https://github.com/angular/material/commit/6ee9a1901beaeed49055437f64506b42b3f33bc3), closes [#2091](https://github.com/angular/material/issues/2091), [#NaN](https://github.com/angular/material/issues/NaN))
* **mdCard:** support md-card-footer ([ff794eca](https://github.com/angular/material/commit/ff794ecad8299f343d79501b470a914a75cdb6bc), closes [#1474](https://github.com/angular/material/issues/1474))
* **radioButton:** allow theming on radio group ([30d0cc44](https://github.com/angular/material/commit/30d0cc4425c68571ec67bcca0ec4ba0925b18ed7), closes [#1746](https://github.com/angular/material/issues/1746))
* **script:** Set ngModule to Closure namespace. ([ade76f95](https://github.com/angular/material/commit/ade76f95f38410a92ec07c4b02bff0c1df580efb), closes [#1709](https://github.com/angular/material/issues/1709))
* **select:**
  * truncate string to fit in single line ([1a81f0c6](https://github.com/angular/material/commit/1a81f0c6c98a2fe217f089c3457af5ee99ba61f5))
  * add auto-inference of option value ([342af6a8](https://github.com/angular/material/commit/342af6a808c962ce02da26461b403aa4465f05cc))
  * add psuedo-element to make auto complete work ([aa440efc](https://github.com/angular/material/commit/aa440efcb381a61abb49ea846d1fe0b458cc3a50))
  * add support to select/focus by typing options ([f5d905a2](https://github.com/angular/material/commit/f5d905a203808c067195330675d6bdbad6f2be0c))
  * add ngMultiple support to select ([9956f62d](https://github.com/angular/material/commit/9956f62d8652a4d335bfe2d759b12634ef8691c8))
  * add styles for invalid ([ddf1198f](https://github.com/angular/material/commit/ddf1198fe7c7a5f2c344dced368da4b5f4e13d20))
* **sidenav:**
  * add focus override option and demo ([3ca2a637](https://github.com/angular/material/commit/3ca2a637f730b49dfdb89489cfc368372fb73c4e), closes [#1891](https://github.com/angular/material/issues/1891))
  * add promise-based lookup .then(callbackFn) for deferred instances ([076a97db](https://github.com/angular/material/commit/076a97db299a42c35f315b032729da5500a24157), closes [#1311](https://github.com/angular/material/issues/1311))
* **tabs:**
  * adds support for `md-no-pagination` ([d0ddad1f](https://github.com/angular/material/commit/d0ddad1f467b9f001233e1dff708f3d7785f9bfc), closes [#1189](https://github.com/angular/material/issues/1189))
  * adds support for `md-center-tabs` ([2de0cf26](https://github.com/angular/material/commit/2de0cf26a4e7fc985b6247039537311a7e7861c1), closes [#1992](https://github.com/angular/material/issues/1992))
  * adds support for `label` attribute without tab content ([faab8883](https://github.com/angular/material/commit/faab88837c2f38b87adaa3bfe5de77f563f7899f), closes [#2068](https://github.com/angular/material/issues/2068))
  * adds support for dynamic height based on tab contents ([efde63c4](https://github.com/angular/material/commit/efde63c4673ca60085013f9d4caa6121c8110c30), closes [#2088](https://github.com/angular/material/issues/2088))
  * refactors tabs to function closer to spec ([f34eb800](https://github.com/angular/material/commit/f34eb800212b6daa11d3a23c14a5a173d9691cf3), closes [#1087](https://github.com/angular/material/issues/1087), [#1107](https://github.com/angular/material/issues/1107), [#1140](https://github.com/angular/material/issues/1140), [#1247](https://github.com/angular/material/issues/1247), [#1261](https://github.com/angular/material/issues/1261), [#1380](https://github.com/angular/material/issues/1380), [#1387](https://github.com/angular/material/issues/1387), [#1403](https://github.com/angular/material/issues/1403), [#1443](https://github.com/angular/material/issues/1443), [#1505](https://github.com/angular/material/issues/1505), [#1506](https://github.com/angular/material/issues/1506), [#1516](https://github.com/angular/material/issues/1516), [#1518](https://github.com/angular/material/issues/1518), [#1564](https://github.com/angular/material/issues/1564), [#1570](https://github.com/angular/material/issues/1570), [#1620](https://github.com/angular/material/issues/1620), [#1626](https://github.com/angular/material/issues/1626), [#1698](https://github.com/angular/material/issues/1698), [#1777](https://github.com/angular/material/issues/1777), [#1788](https://github.com/angular/material/issues/1788), [#1850](https://github.com/angular/material/issues/1850), [#1959](https://github.com/angular/material/issues/1959), [#1986](https://github.com/angular/material/issues/1986), [#2020](https://github.com/angular/material/issues/2020), [#1944](https://github.com/angular/material/issues/1944))
* **tooltip:** adds `md-autohide` functionality ([b682e36a](https://github.com/angular/material/commit/b682e36a55c37f41cf9004645916cba07b6ef805), closes [#1689](https://github.com/angular/material/issues/1689))


#### Breaking Changes

Generated HTML and style improvements:

###### CSS
* CSS Focus outlines not prevented by default
* Box-sizing removed from body, applied to components
* `textRendering: optimizeLegibility` removed from body, applied to a subset of elements
* Font sizes, margins, padding in `rem` units
* Roboto webfont included in SCSS
* Typography: classes introduced for headings and body copy
* High-contrast mode supported on Windows

###### HTML
* Docs: Pinch and zoom re-enabled in viewport

Bugs fixed:

*  [#1087](https://github.com/angular/material/issues/1087), [#1107](https://github.com/angular/material/issues/1107), [#1140](https://github.com/angular/material/issues/1140), [#1247](https://github.com/angular/material/issues/1247), [#1261](https://github.com/angular/material/issues/1261)
*  [#1380](https://github.com/angular/material/issues/1380), [#1387](https://github.com/angular/material/issues/1387), [#1403](https://github.com/angular/material/issues/1403), [#1443](https://github.com/angular/material/issues/1443), [#1505](https://github.com/angular/material/issues/1505)
*  [#1506](https://github.com/angular/material/issues/1506), [#1516](https://github.com/angular/material/issues/1516), [#1518](https://github.com/angular/material/issues/1518), [#1564](https://github.com/angular/material/issues/1564), [#1570](https://github.com/angular/material/issues/1570)
*  [#1620](https://github.com/angular/material/issues/1620), [#1626](https://github.com/angular/material/issues/1626), [#1698](https://github.com/angular/material/issues/1698), [#1777](https://github.com/angular/material/issues/1777), [#1788](https://github.com/angular/material/issues/1788)
*  [#1850](https://github.com/angular/material/issues/1850), [#1959](https://github.com/angular/material/issues/1959), [#1986](https://github.com/angular/material/issues/1986), [#2020](https://github.com/angular/material/issues/2020)


 ([f34eb800](https://github.com/angular/material/commit/f34eb800212b6daa11d3a23c14a5a173d9691cf3))

#### Bug Fixes

* include Roboto as non-blocking <link> ([5936f7a0](https://github.com/angular/material/commit/5936f7a080faef5d6bfb53463815a0a6d989f739), closes [#2247](https://github.com/angular/material/issues/2247), [#NaN](https://github.com/angular/material/issues/NaN))
* switch focus on keyboard, use .md-focused ([0e916bfc](https://github.com/angular/material/commit/0e916bfccbd2abd05508c6bde61eb513530c3331), closes [#1336](https://github.com/angular/material/issues/1336))
* limit global list styles ([fde08cc1](https://github.com/angular/material/commit/fde08cc174a1516fcba97cf626861751d80cebfc))
* refactor global CSS styles ([6af1546d](https://github.com/angular/material/commit/6af1546da48aa335ca65ff32f09e2d3b69d0a2d9), closes [#1442](https://github.com/angular/material/issues/1442), [#NaN](https://github.com/angular/material/issues/NaN))
* **autocomplete:**
  * fixes menu flicker ([9b2dc2c4](https://github.com/angular/material/commit/9b2dc2c472e3a8893114d8153a0734c80fe7fa6a))
  * updates the z-index to account for use within sidenav or dialog ([3cc914d7](https://github.com/angular/material/commit/3cc914d7f31a230c500fb460e7bb0ee7fe9003b1), closes [#2202](https://github.com/angular/material/issues/2202))
  * hitting enter with an item selected no longer resets the selected item ([7e666ab4](https://github.com/angular/material/commit/7e666ab4df3e866acae45bc50030042ad31a0b75), closes [#2183](https://github.com/angular/material/issues/2183))
  * dropdown will shift if there is not enough space ([0b15c976](https://github.com/angular/material/commit/0b15c97629be75924653738687ffeff827fcdc22), closes [#2004](https://github.com/angular/material/issues/2004))
  * moves autocomplete dropdown to nearest content container ([7f355f6d](https://github.com/angular/material/commit/7f355f6d787520cc6a047f46067971b25d79ee73), closes [#2013](https://github.com/angular/material/issues/2013), [#1961](https://github.com/angular/material/issues/1961), [#1670](https://github.com/angular/material/issues/1670))
  * `md-min-length` now supports 0 as a value and will show dropdown on focus ([dcf92682](https://github.com/angular/material/commit/dcf92682ef199cc400af013a426fd2e952cd182e))
  * `md-search-text-change` now fires when content is deleted from text ([f308779a](https://github.com/angular/material/commit/f308779a3553af6b46419aaeaa5e3bad9b27e832), closes [#2061](https://github.com/angular/material/issues/2061))
  * item templates now handle child bindings in the correct scope ([2e157d2b](https://github.com/angular/material/commit/2e157d2bf89336ee404cfaea15e16cc5aeb6c8cf), closes [#2065](https://github.com/angular/material/issues/2065))
  * adds a minimum width ([66fe5757](https://github.com/angular/material/commit/66fe5757fa946414a16b4a3058ecf22701315f2c), closes [#1853](https://github.com/angular/material/issues/1853))
  * hides cancel button when field is disabled ([936b8816](https://github.com/angular/material/commit/936b88166fb4cc6d90ebdab78127926fc7cc89e6), closes [#1710](https://github.com/angular/material/issues/1710))
  * adds support for `md-autofocus` ([c6374d9b](https://github.com/angular/material/commit/c6374d9bb17beca805d36c905eb3c8917a2084e8), closes [#1764](https://github.com/angular/material/issues/1764))
  * accepts pre-selected values ([c3fcd0d8](https://github.com/angular/material/commit/c3fcd0d84e375ba8d77d6bf532904769eb433601), closes [#1779](https://github.com/angular/material/issues/1779))
  * will no longer query when item is selected ([5f141269](https://github.com/angular/material/commit/5f14126954fa10911e00a8c18bf8a070133ae5de), closes [#1835](https://github.com/angular/material/issues/1835), [#1732](https://github.com/angular/material/issues/1732))
  * disables browser autocomplete ([1a8b5658](https://github.com/angular/material/commit/1a8b5658a7e6cc37d307c725f9bb24d8e5dbd2e7), closes [#1849](https://github.com/angular/material/issues/1849))
  * autocomplete now selects the first item by default and no longer hides results w ([4c2b086a](https://github.com/angular/material/commit/4c2b086a6bd38f1d6d4096b73a96d7523b0f09b9), closes [#1858](https://github.com/angular/material/issues/1858))
  * adds support for `$http` promises ([de423ae4](https://github.com/angular/material/commit/de423ae48d593c08f0277376b7e3e80571a3ba48), closes [#1798](https://github.com/angular/material/issues/1798))
* **bottomSheet:** make bottom sheet work with new md-list ([bc32eb4c](https://github.com/angular/material/commit/bc32eb4c3bd795ad9be0ba6412bb7bfcde6d681b))
* **bower:** fixes bower warning ([c4979d68](https://github.com/angular/material/commit/c4979d680aaca4136dd0e9408ac76c3cb8351529), closes [#2165](https://github.com/angular/material/issues/2165))
* **build:**
  * do not bower install in github hook script ([859ecb56](https://github.com/angular/material/commit/859ecb568a7318b1f334f6e210680c4d03e4d110))
  * remove bower dependency, update npm to install angular, update Jasmine 2 ([9398a7a9](https://github.com/angular/material/commit/9398a7a9d0c97eff5e35d24348d89bec85bebd34), closes [#1962](https://github.com/angular/material/issues/1962))
* **button:**
  * update to use .md-focused ([7d1608e6](https://github.com/angular/material/commit/7d1608e6b776cc695a5426b35fd0e0abff8f0970))
  * safari background FAB colors ([0178b895](https://github.com/angular/material/commit/0178b8955f6bf2120a3a32fa8c51398557c9c059), closes [#2011](https://github.com/angular/material/issues/2011))
  * hover, disabled, alignment, docs ([a936e1ed](https://github.com/angular/material/commit/a936e1edc964b69ffe5bf96905e348fc6f4c6b4d), closes [#1607](https://github.com/angular/material/issues/1607), [#NaN](https://github.com/angular/material/issues/NaN))
  * prevents transition from firing on ng-leave ([9aedd741](https://github.com/angular/material/commit/9aedd7413835b9333154e3b3f082ee94c4f89d49), closes [#936](https://github.com/angular/material/issues/936))
  * Support ui-sref attribute natively. ([7b743ed4](https://github.com/angular/material/commit/7b743ed4c62e2680c350d56daf57b202f15e63bf))
  * fixes ripple on fab buttons in safari ([a1c011ef](https://github.com/angular/material/commit/a1c011ef729c091d82f070b87b84f98fd685690c), closes [#1856](https://github.com/angular/material/issues/1856))
* **card:** add correct themed background color ([9af45d37](https://github.com/angular/material/commit/9af45d37d635b31ae9fa1117db3edfd2e07f15ab))
* **checkbox:**
  * update to grid units, demo cleanup ([bc1c4e0f](https://github.com/angular/material/commit/bc1c4e0f290739088b7da7d51744c603ea107079))
  * disable checkboxes with tabindex=-1 ([3c0fed99](https://github.com/angular/material/commit/3c0fed997bacc58f9bad49aa6a4f96f06db08402), closes [#2087](https://github.com/angular/material/issues/2087))
  * support for ng-checked ([2680cf15](https://github.com/angular/material/commit/2680cf1565afb4a8858737f0201933a400b9059e), closes [#1550](https://github.com/angular/material/issues/1550))
  * ngModel intial value used correctly with events ([942d0b9a](https://github.com/angular/material/commit/942d0b9a87b1478917325ccac011c2f4f5a5b3e1), closes [#1550](https://github.com/angular/material/issues/1550))
  * make enter toggle checkboxes ([57610eae](https://github.com/angular/material/commit/57610eaea680871b2751f078a7132e983c6f24e8))
* **chips:**
  * sets `md-autoselect` for contact chips ([eb9f5646](https://github.com/angular/material/commit/eb9f56466a02e44321c8fa50c09f5689836a5be3), closes [#2294](https://github.com/angular/material/issues/2294))
  * fixes issue when removing chips via button ([59d359ce](https://github.com/angular/material/commit/59d359ce1d2ca9629876bf3c07b4801d1c253d1b), closes [#74](https://github.com/angular/material/issues/74))
  * when adding items, duplicates will now be skipped ([1ba926bc](https://github.com/angular/material/commit/1ba926bc347f93ce9ff2bff77bd492a39f393fa6))
  * only add chip item if it is truthy. fixes #2116 ([d154a8e4](https://github.com/angular/material/commit/d154a8e4b465a94e6dda18333e797216e8a9a558), closes [#2120](https://github.com/angular/material/issues/2120))
* **dialog:**
  * fix backdrop position with parent scrolled ([74601d03](https://github.com/angular/material/commit/74601d0341609d072c5350b63da515b9af54a095))
  * cross-browser layout, a11y issues ([0b0ed233](https://github.com/angular/material/commit/0b0ed2339e1ec32e34d20daa18cadd4ef89d5f86), closes [#1340](https://github.com/angular/material/issues/1340), [#NaN](https://github.com/angular/material/issues/NaN))
* **divider:** make divider work with new md-list ([ebcd7f04](https://github.com/angular/material/commit/ebcd7f043457c189f731bf3d40a8d6004e6e4af1))
* **docs:** use node_modules/angularytics ([b8cc062a](https://github.com/angular/material/commit/b8cc062a36d0e957e626e630dd4a8734ba29785f))
* **gesture:** don't stop hijacking clicks on ios & android when jquery is loaded ([81bcf7fd](https://github.com/angular/material/commit/81bcf7fd15fd76f054814b34d8a877168fc6225c), closes [#1869](https://github.com/angular/material/issues/1869), [#1842](https://github.com/angular/material/issues/1842))
* **gestures:**
  * attach event listeners once when multiple ng-apps are running ([6d566762](https://github.com/angular/material/commit/6d566762f22049fbfe10dd9187e04f305a7f9ae7), closes [#2173](https://github.com/angular/material/issues/2173))
  * disable click hijack on mobile if jQuery is present ([2c57a828](https://github.com/angular/material/commit/2c57a8289f73265ca41fc8b2fbbe173a80073caa), closes [#1915](https://github.com/angular/material/issues/1915))
  * gestures initialize only on use instead of load ([63c87096](https://github.com/angular/material/commit/63c87096f2e1d18c38fe0895434b087bfd517a3b), closes [#2074](https://github.com/angular/material/issues/2074))
* **gridlist:**
  * The gridlist will now lay out everytime a tile is added ([aca5944d](https://github.com/angular/material/commit/aca5944d9d12f92b75e4bcf3de8865475b3105e8), closes [#2227](https://github.com/angular/material/issues/2227))
  * Now supports custom interpolation symbols ([f037b8cb](https://github.com/angular/material/commit/f037b8cb9e4db8b0ba0d1830fe872f9537e91779), closes [#1874](https://github.com/angular/material/issues/1874), [#NaN](https://github.com/angular/material/issues/NaN))
  * update calcs for safari ([33049cff](https://github.com/angular/material/commit/33049cff96cd643e76159fc2d72cbd9fb911245c), closes [#2066](https://github.com/angular/material/issues/2066))
  * typo in gridlist demo ([8849fe19](https://github.com/angular/material/commit/8849fe19595dbaf2515ad590fe2f9029c70b54e4))
* **icon:**
  * remove invalid danger style ([360e2b60](https://github.com/angular/material/commit/360e2b6097f97189e41b9f1da2c95ba4043193e7))
  * Fix issue with resizing SVGs when jQuery included. ([c4e8c1c4](https://github.com/angular/material/commit/c4e8c1c429e1333b8b8ecee0033fe4c695c60c3d), closes [#1803](https://github.com/angular/material/issues/1803))
* **icons:**
  * disable pointer events on SVG(s). ([a7d9fa32](https://github.com/angular/material/commit/a7d9fa32209378b92ebddcbd2c11a85cea612a3b), closes [#2048](https://github.com/angular/material/issues/2048))
  * fix default icon color to match spec ([6fc26fab](https://github.com/angular/material/commit/6fc26fabfc97ea1d677eefec912ed1b5a8bbaca0))
* **input:**
  * float labels support dir=rtl ([b88b744f](https://github.com/angular/material/commit/b88b744f325c79db728df83652db08865ac29b7d), closes [#964](https://github.com/angular/material/issues/964))
  * Only make invalid input label red when it's floating ([6d368505](https://github.com/angular/material/commit/6d3685059f0e5c47e1051e2c8accc53bf62a5b3d), closes [#1928](https://github.com/angular/material/issues/1928))
  * delegate clicks in IE10 ([d0b427d6](https://github.com/angular/material/commit/d0b427d63e5fac31d0cec18c5df8158e2c083c9a), closes [#1394](https://github.com/angular/material/issues/1394))
  * improve  textarea appearance on firefox and IE ([a693dabd](https://github.com/angular/material/commit/a693dabdafa72a07e6422b94e5f927328cee94ef), closes [#1157](https://github.com/angular/material/issues/1157))
  * input validation and visual error indicators fixed ([c818da75](https://github.com/angular/material/commit/c818da75c89043a81de6234120315d7d48abc782), closes [#1606](https://github.com/angular/material/issues/1606))
* **list:**
  * add missing interpolation character ([07e82015](https://github.com/angular/material/commit/07e82015bbe4d5b40eb36a1077c509a6f7597b33))
  * focus covers whole row, IE11 layout fix ([b47a8787](https://github.com/angular/material/commit/b47a8787fba6d9f7bda6f695ee0c8a9904df65c1), closes [#2222](https://github.com/angular/material/issues/2222))
  * adds role attributes in compile rather than link for performance improvements ([38f04230](https://github.com/angular/material/commit/38f04230a3064f84701a1c7eca862fd6bb2c256f))
* **md-select:** Track disabled state ([dc93bffe](https://github.com/angular/material/commit/dc93bffe25cd5b2c28e6eac7adfe954c69c672c6))
* **mdButton:** focus styles only on keyboard ([dfb4d1ab](https://github.com/angular/material/commit/dfb4d1abd9ed82cb2b68980ae580f3a434ff3f1c), closes [#1423](https://github.com/angular/material/issues/1423))
* **progressCircular:** fixes animation in IE11 ([d5b77bdc](https://github.com/angular/material/commit/d5b77bdcfe21cb898ea21461e180da2daad89886), closes [#387](https://github.com/angular/material/issues/387))
* **radioButton:** fix googly eyed radio-buttons ([bffa15ab](https://github.com/angular/material/commit/bffa15abc37698a9e8b663db1a9ce4a8250b27a4))
* **ripple:**
  * fixes ripple positioning ([087c3dcf](https://github.com/angular/material/commit/087c3dcf2443ee49bf86a2c87fcaab014e47751f))
  * fixes issues with ripples on items below the fold ([e0f9fe98](https://github.com/angular/material/commit/e0f9fe98b24e028f80acf662b8a69e2f582529f2), closes [#2028](https://github.com/angular/material/issues/2028), [#1526](https://github.com/angular/material/issues/1526))
* **select:**
  * greatly improve scroll disable compatability ([614630d7](https://github.com/angular/material/commit/614630d730f24df9ad3e9ee91f061049d615738a))
  * fix invalid css ([2f9eef70](https://github.com/angular/material/commit/2f9eef70b5503b4fcb5c7cbe09712700403cc5a3))
  * make select focus states match ui-spec ([42db19dd](https://github.com/angular/material/commit/42db19dd5571eb88ba8d2a9667d183d9f3d61da7))
  * bug using select attr with inferred value ([e20b1906](https://github.com/angular/material/commit/e20b1906c4c732b5b9baf708eaebd25de93dc9cb))
  * fix scrollbar margin of select parent ([f3cd5b9c](https://github.com/angular/material/commit/f3cd5b9c21e75794b689f8f4ba33d5dfec3d2fd9))
  * make select positioning factor in scroll bar width ([e18450fb](https://github.com/angular/material/commit/e18450fb53d4566e19b847e1606a2c9d00fe18cf))
  * reposition select on resize events ([0fe35cc8](https://github.com/angular/material/commit/0fe35cc8a896ac8db734e8f06766774cbe337211))
  * fix md-on-show not hiding spinner for non-async ([13b9c697](https://github.com/angular/material/commit/13b9c6978426dd82bfc669ca653e84d35373fb67))
  * make constrained select fit to top/left first ([f6f2187c](https://github.com/angular/material/commit/f6f2187cc92055cafbb440ff021093bfccaa72c3))
  * BREAKING: make select more inline with md-input-container styles ([a67a6a2e](https://github.com/angular/material/commit/a67a6a2e7f7d6ff88ae48e405828b542481d2468))
  * fix alignment of select dropdown arrow ([5c853e66](https://github.com/angular/material/commit/5c853e6654d1e2279833edccdbc142a577e3a338))
  * fix firefox select positioning, page moving on open ([a15347cd](https://github.com/angular/material/commit/a15347cd24255492ed5a36e9bbd2920e45c629e1))
* **sidenav:** improve API usage for $animate enter/leave ([4245bcf7](https://github.com/angular/material/commit/4245bcf7f1000ab8960dda27d47cb34a8ddb7583), closes [#2261](https://github.com/angular/material/issues/2261))
* **subheader:** fix width styling while scrolling ([2f335732](https://github.com/angular/material/commit/2f33573258466be877c3399b1033ad71dc612283))
* **tabs:**
  * resets offset if the user resizes causing pagination to no longer be necessary ([bd1c973a](https://github.com/angular/material/commit/bd1c973a1d13490dfc8ad38aa8cd7ffc633aa6fc))
  * fixes styles for `md-align-tabs="bottom"` ([0dabfc5c](https://github.com/angular/material/commit/0dabfc5cd1bccd51c221e8af8ea4ddda35f21df1))
  * fixes Safari issue regarding dynamic tabs transitions ([4ac7dc03](https://github.com/angular/material/commit/4ac7dc037aecce6721d6656e9a2fb773b852ae15))
  * fixes flicker issue with dynamic height ([48eeb627](https://github.com/angular/material/commit/48eeb627ddf497a241ec5e4686f333d5b56769fe))
  * fixes styles for `md-border-bottom` and `md-align-tabs` ([9affd121](https://github.com/angular/material/commit/9affd1216174d31e92be54e0d0c1ec1698ed483f), closes [#2119](https://github.com/angular/material/issues/2119))
  * adds support for height changes in between tab switches ([64c4585b](https://github.com/angular/material/commit/64c4585b0bc3bcb16a2f196f26ceaa8cb420b679), closes [#2088](https://github.com/angular/material/issues/2088), [#2177](https://github.com/angular/material/issues/2177))
  * resolves issue where code was attempting to fire after the tabs array had been r ([f15fd050](https://github.com/angular/material/commit/f15fd0502463ffcd436d4768771ea4ccdc378fcf))
  * re-added `md-on-select` and `md-on-deselect` events to `md-tab` directive ([c84899df](https://github.com/angular/material/commit/c84899df1036804db1b435ca4c6f92e01c7e12e6))
  * applies correct styles for tabs living inside md-toolbar ([4c59c5c5](https://github.com/angular/material/commit/4c59c5c58906e3b7cb6da36f25426767b3949c4e), closes [#2067](https://github.com/angular/material/issues/2067))
  * updates CSS so that tabs support scrolling when necessary ([9f0d428c](https://github.com/angular/material/commit/9f0d428c9de64ddcb08bbe269044b88d0dae0d23), closes [#2088](https://github.com/angular/material/issues/2088))
* **theming:**
  * fix theming in safari ([1ebc42ec](https://github.com/angular/material/commit/1ebc42ec4ad457602a634f8fb0562128dc3e701c))
  * add support for background hues ([0df4b16e](https://github.com/angular/material/commit/0df4b16eca2c8af9805615da646d38db04a33d7f))
  * change default background palette, document theming ([57deba10](https://github.com/angular/material/commit/57deba108b5075fff2fb869d252b923569091398))
* **toast:** style tweaks for desktop rendering, fix opacity ([860a55ec](https://github.com/angular/material/commit/860a55ec7d5aaf337f671645d226da566b23b596))
* **toolbar:** md-button style cleanup ([1c19272a](https://github.com/angular/material/commit/1c19272a70e7690a5689bbd5f33a338c078a795c), closes [#2267](https://github.com/angular/material/issues/2267), [#2146](https://github.com/angular/material/issues/2146))
* **tooltip:**
  * fixes positioning bug in Safari ([f62fd480](https://github.com/angular/material/commit/f62fd480fdb5aa4f044f69691aedee31932af638), closes [#1883](https://github.com/angular/material/issues/1883))
  * tooltip will no longer be pushed up if there is room for it within its `offsetPa ([6e576c02](https://github.com/angular/material/commit/6e576c02dfebab5474c43d6069247ed32942e3e3))
  * fixes tooltip position when body has a margin ([00f4cc6d](https://github.com/angular/material/commit/00f4cc6d1329f618d595f887c0a13371bcff2d9e), closes [#1883](https://github.com/angular/material/issues/1883))
  * 

<a name="0.8.3"></a>
### 0.8.3  (2015-03-03)


#### Features

* **ripple:** smooths out ripple animations ([ac47ca6c](https://github.com/angular/material/commit/ac47ca6c1df6a873615445d8c1f0cbb3eb3764f7), closes [#1750](https://github.com/angular/material/issues/1750))


#### Bug Fixes

* **autocomplete:** clicking on the scrollbar in the dropdown will no longer cause the list to hide ([2731f107](https://github.com/angular/material/commit/2731f1078efdd3c546629376ed71c7068501daf3), closes [#1739](https://github.com/angular/material/issues/1739))
* **gestures:** resolves jQuery conflict with $mdGesture ([79505888](https://github.com/angular/material/commit/7950588882557a6d1670e2029ddda76d12027c45))
* **select:**
  * support rtl direction ([59e30a39](https://github.com/angular/material/commit/59e30a392ed7f0dc43ec71db22b60fcaa800ba7e))
  * make md-option work with ng-selected ([425a76a3](https://github.com/angular/material/commit/425a76a3a5b4bce767e0f8ad766d7a8773e5463f))
  * make select work with ng-disabled ([60514054](https://github.com/angular/material/commit/60514054984c3d1c5577c5150e80e7ca9e3a4083))
  * fix select not setting initial value ([6dc46d52](https://github.com/angular/material/commit/6dc46d52dea21c4de3dc7984fb56d99076fdd1e6))
  * fix closing select a second time on firefox ([e49a20e8](https://github.com/angular/material/commit/e49a20e85d808ca0533afc40ee11f8337535c315))
  * fix positioning / sizing on firefox ([67618dc8](https://github.com/angular/material/commit/67618dc8fb5a81b23ed33879b062a6e316477a4a))
  * fix resetting value for selects without placeholder ([2a0ea163](https://github.com/angular/material/commit/2a0ea1630fb286099a8c27e5035cadc5cc1ed0b8))
  * fix empty select breaking page ([6e7b36cf](https://github.com/angular/material/commit/6e7b36cfa388227e3879120d3c332fc76e095e32))
  * make select consistent with md-input ([6aa1c8a7](https://github.com/angular/material/commit/6aa1c8a782b67aee3a31f9ed38c99aebfdb3b1a9))
  * positioning when to close to bottom or right ([cf78ba9f](https://github.com/angular/material/commit/cf78ba9f1fce7fdc3e613b3c83a4056ed8fb2e40))


<a name="0.8.2"></a>
### 0.8.2  (2015-02-27)


#### Features

* **autocomplete:** adds support for `md-delay` to wait until the user stops typing to poll for resu ([70a884a1](https://github.com/angular/material/commit/70a884a164f20b7cfde0c08f66712f86c4789f13))


#### Bug Fixes

* **autocomplete:**
  * cleans up watchers when elements are removed ([7fc0d02c](https://github.com/angular/material/commit/7fc0d02c6009c0c5f688d84cbd76afb9f4262541), closes [#1692](https://github.com/angular/material/issues/1692))
  * prevents aria message on selection ([e2148f13](https://github.com/angular/material/commit/e2148f13aa802196505106e776a959a648a38010))
  * addresses accessibility issues ([0bd7afb8](https://github.com/angular/material/commit/0bd7afb81755ea2815c8af646d692e045509f014), closes [#1473](https://github.com/angular/material/issues/1473))
  * change events will no longer be called on load ([c58d930e](https://github.com/angular/material/commit/c58d930e293ec4105e49391f67d8b31218d474ad))
* **button:** allow attribute syntax for md-button. ([fc223b0c](https://github.com/angular/material/commit/fc223b0c9f92f03e4a1f2f9d53ac14d699ff02a2), closes [#1661](https://github.com/angular/material/issues/1661))
* **core:** Remove redeclared variable declaration. ([3454db3c](https://github.com/angular/material/commit/3454db3c3feb8f5f35bad7815a84a26c67c4dd58), closes [#1697](https://github.com/angular/material/issues/1697))
* **input:**
  * resolves on-focus validation checks ([2f17c8f4](https://github.com/angular/material/commit/2f17c8f44a628daf4e81bc576a85f27697dd54ab))
  * error states and  improved for input fields ([747eb9c3](https://github.com/angular/material/commit/747eb9c3f493dfc338901f66108042ca78b5936e), closes [#1485](https://github.com/angular/material/issues/1485), [#1633](https://github.com/angular/material/issues/1633), [#1629](https://github.com/angular/material/issues/1629))
* **select:**
  * when nothing selected, focus first option ([50b5d923](https://github.com/angular/material/commit/50b5d923ef92d7fb664bde605c821e643aa1f152))
  * make space not scroll select ([b8da17a0](https://github.com/angular/material/commit/b8da17a07c0b532527193ed0626cd1e9cd8b319e))
  * make sure arrow keys always focus next/prev option ([e441abaf](https://github.com/angular/material/commit/e441abaf91aeb706c8fb773b67bde40fb225601d))
  * render label on external model updates ([6baed64c](https://github.com/angular/material/commit/6baed64c6c20eeabacf8e737e16e5b39de5f39ea))
  * fix updating of values on change and init ([0e21b3bc](https://github.com/angular/material/commit/0e21b3bc0bb96c9e9982ebd74a4b810e02a2935f))
  * change placeholder computation to be handled internally ([b4c0a86e](https://github.com/angular/material/commit/b4c0a86eb3c094c5c897895a4bec392b37923f5f))
  * fix duplicate options when using ng-repeat ([9e0ca443](https://github.com/angular/material/commit/9e0ca4430f9f3add077a21ccb5a963e48a7f7d83))
  * fix chrome double scroll bars ([4d722ecf](https://github.com/angular/material/commit/4d722ecf9f8240f47e6e8989afcc5388c99669b4))
* **tooltip:** fixes `md-direction` attribute functionality ([93080cae](https://github.com/angular/material/commit/93080cae36e1bea653b39c85d9345afe798de59f), closes [#1673](https://github.com/angular/material/issues/1673))


<a name="0.8.1"></a>
### 0.8.1  (2015-02-24)


#### Features

* **select:**
  * set label value based on md-option text ([ee4c7c18](https://github.com/angular/material/commit/ee4c7c1809558a51a58928e9fbe06ab16686742a))
  * add disabled support ([0c0f25ce](https://github.com/angular/material/commit/0c0f25ce5bb4e1a4467617541cffdb24d36f8ec7))
  * add ng-change support ([f4ce10ee](https://github.com/angular/material/commit/f4ce10eea6590ac431b7b15c44242b76219e1f7f))


#### Bug Fixes

* **select:**
  * keyboard controls in IE ([69053a30](https://github.com/angular/material/commit/69053a30c869c6ccdf8bcfcaaba451900f38e2ba))
  * fix overflow scroll on IE ([c5c5f860](https://github.com/angular/material/commit/c5c5f8603e631665d93c018bc6f94df2c4125eab))
  * prevent select from closing a dialog on click away ([c573c8cd](https://github.com/angular/material/commit/c573c8cd28c66b3c74f6f6ad482ff0c0b3844ff6))
  * stop position from going past bottom of screen ([805ed1b4](https://github.com/angular/material/commit/805ed1b49369269c0f9606d9f9c812cc8658d954))
  * fix select with 0 options positioning ([5a82426e](https://github.com/angular/material/commit/5a82426ed23724a1860bb7b5efa3e28326512716))
  * support custom interpolate symbols ([20b66111](https://github.com/angular/material/commit/20b6611107332b7cd36b93fc1398263c3ad328ae))
  * remove placeholder for falsey, but defined values ([9497f063](https://github.com/angular/material/commit/9497f063a2f5b118077aaba0cdc3df851754629c))
  * close md-select-menu if md-select is removed ([5e02ad94](https://github.com/angular/material/commit/5e02ad948fc4e68d81b18234102e47e643917b97))



<a name="0.8.0"></a>
### 0.8.0  (2015-02-23)


#### Features

* **select:**
  * add ng-change support ([f4ce10ee](https://github.com/angular/material/commit/f4ce10eea6590ac431b7b15c44242b76219e1f7f))
  * add select component and functionality ([786cb3b1](https://github.com/angular/material/commit/786cb3b1642be623b21551e4c8aff9c11d53ca13), closes [#1562](https://github.com/angular/material/issues/1562))
* **autocomplete:** added initial files for autocomplete ([0bd8cf1c](https://github.com/angular/material/commit/0bd8cf1c31bc3a00513b91d2a200e9cc6818f2d0), closes [#1418](https://github.com/angular/material/issues/1418))
* **dialog:** add ability to specify theme on alert and confirm presets ([c97f48b7](https://github.com/angular/material/commit/c97f48b7ad6515fe211cb1528ba9c2df14c98b18))
* **gridlist:** Initial gridList implementation ([ef4aff00](https://github.com/angular/material/commit/ef4aff00f05136cfdeb149b151c85c4cae7a0228))
* **icon:** implemented md-icon for font-faces and svgs ([b7d09d7e](https://github.com/angular/material/commit/b7d09d7e247d3055e53f438b5528ce9e36ecbc66), closes [#1438](https://github.com/angular/material/issues/1438))
* **input:** adds `no-float` class to disable floating label animations ([33f677e5](https://github.com/angular/material/commit/33f677e53f97a8dacfae173120dbda369bd734ee), closes [#201](https://github.com/angular/material/issues/201), [#1392](https://github.com/angular/material/issues/1392))
* **tabs:** changes default state of tabs to be transparent. ([732cbc9c](https://github.com/angular/material/commit/732cbc9c3abc1b001e0c425272ab49aa4f4e2d44), closes [#1250](https://github.com/angular/material/issues/1250), [#1393](https://github.com/angular/material/issues/1393))
* **toast:**
  * add ability to specify theme for simple preset ([2fef2207](https://github.com/angular/material/commit/2fef22078497d6f444511032bcef1e9900a5103a))
  * proper toast queing behavior ([74fe8706](https://github.com/angular/material/commit/74fe87068212e233a8b8ed2a3029d0cf491cd53e))
  * update toast content dynamicly using $mdToast.updateContent ([0e161cb7](https://github.com/angular/material/commit/0e161cb7f9ab02c3774c7071f45bba4a8f97e49b))
* **tooltip:** adds `md-direction` so that users can specify tooltip direction ([9c69c5cd](https://github.com/angular/material/commit/9c69c5cd4f5ada823cc12bc93246f3c847ecb23d), closes [#1220](https://github.com/angular/material/issues/1220), [#1410](https://github.com/angular/material/issues/1410))


#### Bug Fixes

* **autocomplete:**
  * hitting Enter will now trigger the submit method on parent form tags ([da084fc5](https://github.com/angular/material/commit/da084fc55fe67fa9c5094b73187953423317f5aa), closes [#1530](https://github.com/angular/material/issues/1530))
  * fixes issue with click events not firing ([e088f6ac](https://github.com/angular/material/commit/e088f6aceb108449b7e6786ef3f1329d805a8001), closes [#1513](https://github.com/angular/material/issues/1513))
* **dialog:** correct opening position for showing a dialog ([150efe62](https://github.com/angular/material/commit/150efe620f98059f18f6088551d10e3a97984fca))
* **docs:** toolbar button overlap on mobile ([7391cad4](https://github.com/angular/material/commit/7391cad4a040ca674af4135d7336d852125c2d59))
* **gridlist:**
  * Tile removal now supports ngAnimate ([1d8e7832](https://github.com/angular/material/commit/1d8e7832dc6f0c7b20aefd704d8eeaba90cc763c), closes [#1559](https://github.com/angular/material/issues/1559), [#1560](https://github.com/angular/material/issues/1560))
  * add ngInject annotation support for GridLayoutFactory - $mdGridLayout ([c045f542](https://github.com/angular/material/commit/c045f5425fd4c2dc45a366a2dad66bd675ee1cf1))
  * Throws error on invalid or missing colCount to avoid infinite loops ([39f4f26a](https://github.com/angular/material/commit/39f4f26ad1fb8ec6b96254620a1b9dcc1525694a))
  * Adds grid height calculation ([0196014d](https://github.com/angular/material/commit/0196014db76eef8931b5d5b32f94a4fa7d3db675))
  * Prevents media from being unwatched immediately ([a4104215](https://github.com/angular/material/commit/a4104215be8c3aa902095dcb182d28b05ff3b79e))
* **icon:**
  * improve error recovery and item caching ([603e5d68](https://github.com/angular/material/commit/603e5d68623dda4003917989e752fda4e603f36a), closes [#1477](https://github.com/angular/material/issues/1477))
  * add support for themes with md-primary, etc. ([cdea9a2d](https://github.com/angular/material/commit/cdea9a2d586f82a1048eff9c0b834e7428049a81))
* **input:**
  * fix hidden textarea height issue ([efbd414a](https://github.com/angular/material/commit/efbd414a4d5af7b5144f1d08522e46cc043b627d), closes [#1356](https://github.com/angular/material/issues/1356))
  * improve use of placeholder and floating label ([f704dda6](https://github.com/angular/material/commit/f704dda627c2a030e0bdda44f6cb12ac59e951e0), closes [#1409](https://github.com/angular/material/issues/1409))
  * hide input text character overflow ([e290b536](https://github.com/angular/material/commit/e290b536a0f7daecbc095a59d3d641f9105e1f15), closes [#1461](https://github.com/angular/material/issues/1461))
  * improve error checking UX for required inputs ([c1d59aba](https://github.com/angular/material/commit/c1d59aba9f7aa1b30d4664e90ba44235510c9acc), closes [#1491](https://github.com/angular/material/issues/1491), [#1485](https://github.com/angular/material/issues/1485))
* **layout:** fix responsive breakpoint dead-zones ([ecf6edef](https://github.com/angular/material/commit/ecf6edef9e1ff9a931a77a4665b075faf1988759))
* **mdButton:** add default color, update docs ([a80804b5](https://github.com/angular/material/commit/a80804b5c1f3ccf554c76e3cad221b750c939a6f), closes [#1486](https://github.com/angular/material/issues/1486))
* **select:** fixes scrollbar and padding issues ([5d7b63b0](https://github.com/angular/material/commit/5d7b63b0ff286ef0fbeffac3cf61283f4f782e13))
* **tooltip:** content text was semi-opaque ([42cff135](https://github.com/angular/material/commit/42cff135320727b3615c3cd00300c923112e142d), closes [#1480](https://github.com/angular/material/issues/1480), [#1492](https://github.com/angular/material/issues/1492))
* **autocomplete:** selected item now properly updates ([1307b945](https://github.com/angular/material/commit/1307b94592c128b31aee7dc8012fa74d2526768f), closes [#1468](https://github.com/angular/material/issues/1468))
* **button:** remove underline on href button hover ([c19cd433](https://github.com/angular/material/commit/c19cd433eb75fb3b6a9507f8eb36e6e9916f50d3))
* **card:** fixes selector to be more specific ([2f840b2a](https://github.com/angular/material/commit/2f840b2a221959a9101471ccb86da7a216ab80fd))
* **gesture:** fix gesture event dispatching with jQuery ([88813b78](https://github.com/angular/material/commit/88813b78cae831b28e2e8d0eb37c32269034bfad), closes [#1367](https://github.com/angular/material/issues/1367))
* **input:** check invalid model immediately and setInvalid() if needed ([e0f53ddd](https://github.com/angular/material/commit/e0f53ddda7d080e80c08d5106b5586b697ea8e87), closes [#372](https://github.com/angular/material/issues/372))
* **mdIcon:**
  * support aria-label on mdRadioButton ([bbbec18e](https://github.com/angular/material/commit/bbbec18e5a9d79dd2957ddaad36993f80b879ce4))
  * label docs, support from parent el ([f764c049](https://github.com/angular/material/commit/f764c049c9128909fc86a26ffddcb9b6db9dd8f6), closes [#1458](https://github.com/angular/material/issues/1458), [#1460](https://github.com/angular/material/issues/1460))
* **mdInput:** css cascades from disabled fieldset ([66fa1e3e](https://github.com/angular/material/commit/66fa1e3e276ddf33d669da0ef4d13c73c668e654), closes [#895](https://github.com/angular/material/issues/895))
* **mdMedia:** fix media listeners not firing on non-chrome browsers ([0dfcaf55](https://github.com/angular/material/commit/0dfcaf553c94935945c7b74b584abd8b73abd40c))
* **mdTabs:** use md-icon for pagination arrows ([517623e7](https://github.com/angular/material/commit/517623e721cd1d9a104aec2bee22a23889944b3a), closes [#1464](https://github.com/angular/material/issues/1464), [#1466](https://github.com/angular/material/issues/1466))
* **sidenav:** properly sets width of sidenav ([0318ca44](https://github.com/angular/material/commit/0318ca44ca1d256d50cd1de675c92c8bf4b2bcb1), closes [#957](https://github.com/angular/material/issues/957))
* **slider:**
  * updates positioning method to prevent overflow issues ([fb3623a1](https://github.com/angular/material/commit/fb3623a1da832a43fdccb7402ecfd206248639c9), closes [#1343](https://github.com/angular/material/issues/1343), [#1431](https://github.com/angular/material/issues/1431), [#1391](https://github.com/angular/material/issues/1391))
  * BREAKING: change default color to accent ([3ea349fc](https://github.com/angular/material/commit/3ea349fc7aef2fb22109b69c5c4fb466a4607989))
* **subheader:** fix subheaders within dialogs ([55084143](https://github.com/angular/material/commit/550841433586d1bbc0a94ef5c0c2ef50e45e28c1))
* **theming:** fix typo in warning message ([8a6eb7e8](https://github.com/angular/material/commit/8a6eb7e88c7317f755789ba3f2bfe3f88a288b81))
* **toast:** fix minified toast controller injections ([5c5106e4](https://github.com/angular/material/commit/5c5106e48725cbc7b46269339a33be084ce4aeff))
* **tooltip:** now works inside elements without pointer events ([3d010cd8](https://github.com/angular/material/commit/3d010cd831c7377e2ebef0df0d897788130cab9f))


<a name="0.7.1"></a>
### 0.7.1  (2015-01-30)

#### Features

* **bottomSheet:** disable scroll on parent when bottom sheet is shown ([8273126c](https://github.com/angular/material/commit/8273126c99304b315632c377ff22717acb45f03b))
* **button:** adds attribute override for ripple size ([b7c43a10](https://github.com/angular/material/commit/b7c43a10071455e9024fe403d6b696b664c36df4), closes [#1088](https://github.com/angular/material/issues/1088))
* **gestures:** add built in gesture system, remove HammerJS ([8364fb57](https://github.com/angular/material/commit/8364fb57a9ac1b211c09ff564fea6ad0dea94e61))
* **input:** make input placeholder attr work ([f1d7f830](https://github.com/angular/material/commit/f1d7f830bf2f12dab288c46a5fc2919d5d608110), closes [#1279](https://github.com/angular/material/issues/1279))
* **mdInputContainer:** add mdIsError expr, defaults to $touched && $invalid ([c3cad666](https://github.com/angular/material/commit/c3cad666368cc238644b6c9b1aaf1260cd763187), closes [#1267](https://github.com/angular/material/issues/1267))
* **sidenav:**
  * make it thinner on <360px wide screens ([6ee3346e](https://github.com/angular/material/commit/6ee3346e301e979e89bf6f43449b6c4a51d78670))
  * expose isLockedOpen for sidenav instances ([ba71a598](https://github.com/angular/material/commit/ba71a5987d4600128d6a1c14a479cac37a308d28))
* **theming:**
  * add warnings when using unregistered themes ([f6f56c98](https://github.com/angular/material/commit/f6f56c989bab062462a4dbf4ece59fd744c6ec3b))
  * warn for same palette as primary and accent ([1c973330](https://github.com/angular/material/commit/1c973330c68e0c653a19f4408a373741107eb0e3))
  * fix strong light colors vs normal light colors, as per spec ([dd5b9549](https://github.com/angular/material/commit/dd5b9549f4241eadacb4fe92db574b1bcd9771d5))
  * rename palette methods, change default palettes ([0e0846fe](https://github.com/angular/material/commit/0e0846feb562d32079eff427abbc045f2681c24e), closes [#1252](https://github.com/angular/material/issues/1252))
  * change default color of components that should be accent ([f2996b73](https://github.com/angular/material/commit/f2996b734fd7574ad484f258f1fd674de62d64b5))
* **toolbar:** add shadow to toolbar ([4e47a174](https://github.com/angular/material/commit/4e47a174659e768e0b506d7ea937aadb67818d56))


#### Breaking Changes

* As per the
[spec](http://www.google.com/design/spec/style/color.html#color-ui-color-application)
this commit changes the default color palette of FABs, checkboxes, radio
buttons, sliders and switches to the accent palette.

closes #1255

 ([f2996b73](https://github.com/angular/material/commit/f2996b734fd7574ad484f258f1fd674de62d64b5))


#### Bug Fixes

* **card:** fixes selector to be more specific ([2f840b2a](https://github.com/angular/material/commit/2f840b2a221959a9101471ccb86da7a216ab80fd))
* **gesture:**
  * make sure clicks properly support keys ([c6d24eb2](https://github.com/angular/material/commit/c6d24eb2dfb7c3c23f08e09ae7f22812fe395516))
  * fix firefox keyboard events ([79196c3d](https://github.com/angular/material/commit/79196c3df13906c0221a9f0b4e2bab9c0c25825e))
  * only hijack click events on mobile devices ([ade65b60](https://github.com/angular/material/commit/ade65b6023021350a9a6d50d5d3245104766fe82))
* **theming:**
  * fix warning for `changeTheme` being wrong ([f44bf604](https://github.com/angular/material/commit/f44bf6040dea4c1816922f595ec7e38213f914c6))
* **checkbox:**
  * make `mdAria` check linked element ([3346532c](https://github.com/angular/material/commit/3346532ca1deba489fb79bccc0047f4f9f10e8da))
* **build:**
  * add annotations to `rAfDecorator`, remove unused args ([c4927f9e](https://github.com/angular/material/commit/c4927f9e4ca1ffd21550e5eefb08b34c8840d02b))
  * add annotation to `swipe.js` ([22040c77](https://github.com/angular/material/commit/22040c77b4f82dd9845ad6bcfab9ab62a534170c))
* **button:**
  * change default style of fab to white instead of transparent ([04feeb83](https://github.com/angular/material/commit/04feeb836ae5508d4c0349f125d13b75dd63b7b3))
  * default background-color on fab buttons on toolbar ([08ebff44](https://github.com/angular/material/commit/08ebff4405f75d305c24eca3549668bbc84d7ce8))
* **card:**
  * allow img to have a wrapper ([349b521e](https://github.com/angular/material/commit/349b521e550c48a55713659d8d6fc2f4e1719a74))
* **dialog:** fix overlay not covering, dialog position in overlay ([1d5ef95d](https://github.com/angular/material/commit/1d5ef95d2a1daa91bcad98d460eec49923ea5233))
* **input:**
  * dont add focus/blur class if readonly ([6333b72c](https://github.com/angular/material/commit/6333b72c2cd50d848924e694237772371fefa759), closes [#1203](https://github.com/angular/material/issues/1203))
  * fix input padding & border on iOS ([7dab2060](https://github.com/angular/material/commit/7dab2060dd6f1c07dcb7186a1de360c20d3014fd), closes [#1164](https://github.com/angular/material/issues/1164))
  * remove default Firefox invalid input styling ([ba65437b](https://github.com/angular/material/commit/ba65437b452835c96bba9a7681710aec253264de), closes [#1165](https://github.com/angular/material/issues/1165))
  * add check for input value on blur ([ec53d1a1](https://github.com/angular/material/commit/ec53d1a1d02a92e3c8d71c25d354784709124fee), closes [#1201](https://github.com/angular/material/issues/1201))
* **layout:** fix IE11 layout ([74fe3eb1](https://github.com/angular/material/commit/74fe3eb19b097611ed17f2f1459a5682b043387a), closes [#1227](https://github.com/angular/material/issues/1227))
* **mdSwitch:** add missing styles to switch ([54338d7d](https://github.com/angular/material/commit/54338d7d4220fd0bb88af3e3b584c70fe5ac37ab), closes [#912](https://github.com/angular/material/issues/912))
* **ripple:** fixes size issue with ripple on switches ([c435409b](https://github.com/angular/material/commit/c435409bfdcda51c5ba164c9013a3da1e5a03ce6))
* **slider:**
  * don't run touchend listener if disabled ([5bbd23d6](https://github.com/angular/material/commit/5bbd23d6ad6d944806943786a748329428620e79), closes [#1308](https://github.com/angular/material/issues/1308))
  * make modelValue be set on pressdown ([7028a750](https://github.com/angular/material/commit/7028a75058338533696d75d532e7f13f6d6f1fff), closes [#1296](https://github.com/angular/material/issues/1296))
  * fix thumb positioning so that it works when not visible ([41c2d65d](https://github.com/angular/material/commit/41c2d65d2d4344687959c0d13c2cf48b0c90a880), closes [#1210](https://github.com/angular/material/issues/1210))
* **styles:** fix subheader z-index, button md-mini class, md-no-bar. ([dde9ab79](https://github.com/angular/material/commit/dde9ab7987c8df787ff72c3ce46b9247ffdf7aad), closes [#1182](https://github.com/angular/material/issues/1182), [#1034](https://github.com/angular/material/issues/1034), [#1173](https://github.com/angular/material/issues/1173), [#1194](https://github.com/angular/material/issues/1194))
* **switch:** set tabindex to -1 while disabled ([19f47b5d](https://github.com/angular/material/commit/19f47b5dcbf3006fbc14a08d909bc0265058dfe0))
* **tabs:**
  * adds fix for css transition on theme change ([312dcc6c](https://github.com/angular/material/commit/312dcc6c51f81de8284f43959c30d51e286bca29), closes [#1033](https://github.com/angular/material/issues/1033))
  * remove bad opacity on focus state ([72ced4b5](https://github.com/angular/material/commit/72ced4b5b93fd82dc3e7382850f964baffbda32c))
  * prevents multiple pagination clicks during animation ([299e1556](https://github.com/angular/material/commit/299e15569783d4f666863ac3e9f6ceed237b6cf0), closes [#1207](https://github.com/angular/material/issues/1207))
* **toast:**
  * fix highlighting of action buttons ([53cffe29](https://github.com/angular/material/commit/53cffe2945006ea9f5e2171fa2fbaf73b7ac6d27))
  * fix excess padding on md-action ([0f40a843](https://github.com/angular/material/commit/0f40a8431f5b807d43c2054c64d40008213d4cf5))


<a name="0.7.0"></a>
### 0.7.0  (2015-01-24)


#### Bug Fixes

* **input:**
  * fix bug regarding `md-maxlength` value changes ([b432277d](https://github.com/angular/material/commit/b432277d59614d2d23e4f651a1b3c46d76ec50ae))

<a name="0.7.0-rc3"></a>
### 0.7.0-rc3  (2015-01-14)


#### Bug Fixes

* allow user selection when swipe listener is enabled ([520faa72](https://github.com/angular/material/commit/520faa72e8a1ebf9112d615097e939349997fc51), closes [#838](https://github.com/angular/material/issues/838))
* **button:**
  * fixes vertical alignment issue with `md-fab` button ([f71eb32a](https://github.com/angular/material/commit/f71eb32a0070bdbf6ea5613d7dce32a8fa22a02c), closes [#914](https://github.com/angular/material/issues/914))
  * adds a safe disabled-check for ripples ([9091741f](https://github.com/angular/material/commit/9091741f80002352ef16901d7abdd860631dce68), closes [#1029](https://github.com/angular/material/issues/1029))
  * fix usages with ngDisabled ([416079b7](https://github.com/angular/material/commit/416079b787becfe584d0633ae8e7946e4309f438), closes [#1074](https://github.com/angular/material/issues/1074))
* **dialog:**
  * fix dialog alignment in IE11 ([240c03aa](https://github.com/angular/material/commit/240c03aa188520a20e0416095c20ace8a685fca3), closes [#790](https://github.com/angular/material/issues/790))
  * fix margin-top when layout is row ([191df15a](https://github.com/angular/material/commit/191df15abf13cae397f7e9c3c73db956842dfee3))
* **input:** fix label inputs with specified types ([747c6acb](https://github.com/angular/material/commit/747c6acb1835ce388215d8ecc0794ec4da67a43b))
* **layout:** make sure hide-gt-* and show-gt-* work together properly ([d149f36b](https://github.com/angular/material/commit/d149f36b6ab2a24d22e0246d4db8c030dcb84f96), closes [#772](https://github.com/angular/material/issues/772))
* **radioGroup:** fix render call happing before radioGroup init ([68e350d1](https://github.com/angular/material/commit/68e350d11dcd15ae07c495e6859ba32f47d79836))
* **subheader:** make content clickable ([7178b6d6](https://github.com/angular/material/commit/7178b6d674336a8d9ee718b58fb2f1aece85c80b), closes [#554](https://github.com/angular/material/issues/554))
* **tabs:**
  * fix overflow leaking out tab-content ([dec2ac42](https://github.com/angular/material/commit/dec2ac42ebec04070e81fe1a664e7be906f0b4a4))
  * factors `me-active` attribute into selection logic to prevent unnecessary `md-on ([6a087a01](https://github.com/angular/material/commit/6a087a01656b3e8f6ba2e87b40b0611519b75c2b), closes [#868](https://github.com/angular/material/issues/868))
  * adds a delayed call to update the ink bar after a tab is removed ([1a1095b0](https://github.com/angular/material/commit/1a1095b0fae19e4b6df80027f57870e7aff7b97f), closes [#573](https://github.com/angular/material/issues/573))
* **theming:** make switch, checkbox, radio button default to primary color for consistency ([8cbfeadf](https://github.com/angular/material/commit/8cbfeadfb32e19e855b6280983784fe0a8a516cb))


#### Features

* **input:** add error states, md-maxlength ([a2bc3c68](https://github.com/angular/material/commit/a2bc3c68551b4915c40a4eca9ec48fa9ec61f6b7))
* **layout:** add flex-order-{sm,gt-sm,md,gt-md,lg,gt-lg} attributes ([3e453078](https://github.com/angular/material/commit/3e4530785c29650ff46cf7688f0b154adb9a7042))
* **tooltip:** add configurable md-delay attr, default 400ms. ([e4ed530d](https://github.com/angular/material/commit/e4ed530d8000b6e31c9e4e7d52e402b9b76debd2), closes [#713](https://github.com/angular/material/issues/713))


<a name="0.7.0-rc2"></a>
### 0.7.0-rc2  (2015-01-08)


#### Bug Fixes

* **$mdUtil:** fix bugs in iterator's `next()`/`previous()` methods Refactor for DRY-ness `next ([124466e7](https://github.com/angular/material/commit/124466e71945a4515a7b5742310594e8753c4314))
* **$mdComponentRegistry:** gracefully recover if no md-component-id is specified ([bf2266f1](https://github.com/angular/material/commit/bf2266f15a6d2c8cc299f083544955b1d1f0dc69))
* **demos:** tab dynamic demo removes use of on-select expressions ([4db16c17](https://github.com/angular/material/commit/4db16c17fa617c53fd8436de00386826e08b602b))
* **mdDialog:**
  * fix dialog border radius visual overflow glitch ([9b162202](https://github.com/angular/material/commit/9b162202721a2a60884e8edf4e02f754e9bef447), closes [#1015](https://github.com/angular/material/issues/1015))
  * prevent null-pointer error with popInTarget ([b36282a5](https://github.com/angular/material/commit/b36282a586d700831006c750d1df743bb16c6194), closes [#1061](https://github.com/angular/material/issues/1061))
* **input:** fix height on IE11 ([dc31ee53](https://github.com/angular/material/commit/dc31ee53bb88dcc782b7aaa9c9ade31085ab3e69))
* **layout:**
  * fix 'layout-padding' rule not having comma ([b35be936](https://github.com/angular/material/commit/b35be936cab8118c7de483c5065b6db56018e855), closes [#952](https://github.com/angular/material/issues/952))
  * layout-fill in firefox ([31d3c123](https://github.com/angular/material/commit/31d3c123185c6fe3e0db95674cccefb2b8884bca))
  * layout-wrap fixed and documented ([8f937bd2](https://github.com/angular/material/commit/8f937bd2df7e43d0343f5e89e154f6b0a3c89ecc))
* **mdButton:**
  * fix fab vertical positioning ([641e2272](https://github.com/angular/material/commit/641e2272ce1cad731a59f015bede4a97fa2fca53), closes [#1031](https://github.com/angular/material/issues/1031))
  * fix error when md-button is disabled anchor ([48e5a8bc](https://github.com/angular/material/commit/48e5a8bc365e89f1d0446758a7211f5773956443), closes [#1074](https://github.com/angular/material/issues/1074))
* **mdCard:** add an md-card-content container inside md-card for content ([28a4f8ff](https://github.com/angular/material/commit/28a4f8ff4d3b1d7b123152a01ef71e767fc315ff), closes [#265](https://github.com/angular/material/issues/265))
* **mdMedia:** avoid unnecessary digest and make changes apply quicker ([98247bcf](https://github.com/angular/material/commit/98247bcf22df9ef96e4dd0197d61e6b9b69e1b6d), closes [#978](https://github.com/angular/material/issues/978))
* **mdRadioButton:** Loosen equality check ([ca3e4c30](https://github.com/angular/material/commit/ca3e4c306af3e4a49670a379d759f0448b42ca95), closes [#1112](https://github.com/angular/material/issues/1112))
* **mdToolbar:** Toolbar flow on medium screens ([bfc947f6](https://github.com/angular/material/commit/bfc947f66b2a2568dc76ca3278eb9b5f83424a2f))
* **mdUtil:**
  * fix `throttle()` delay check ([fdb923e4](https://github.com/angular/material/commit/fdb923e40f98422ff75cbcaf137ead2233c64c68), closes [#977](https://github.com/angular/material/issues/977))
  * remove/delete cacheFactory keys when clearing/destroying cache ([8736c7cc](https://github.com/angular/material/commit/8736c7ccf019df417e6b7834b55a1cc157a6ac64))
* **mdRadioButton:** arrowkey navigation with disabled buttons ([f520d507](https://github.com/angular/material/commit/f520d50710e6e93686736c4f5a97e54bb9bb7518), closes [#1040](https://github.com/angular/material/issues/1040))
* **mdSidenav:** Fix tests and typo ([c0e2b0fb](https://github.com/angular/material/commit/c0e2b0fbba0006ab2ea8930544c380d207dfea1a))
* **mdTabs:**
  * make md-tab-label visible on IE11 ([b85ad629](https://github.com/angular/material/commit/b85ad6296f49be7fa5ce95cbbbec49d650912e46), closes [#1057](https://github.com/angular/material/issues/1057))
  * pagination only call watcher() when it's a function ([e952ab41](https://github.com/angular/material/commit/e952ab4100826a5ff2e36efe71d5d6b8d49df2b2), closes [#1073](https://github.com/angular/material/issues/1073))
  * delays disconnect until after the digest is finished ([78ba497e](https://github.com/angular/material/commit/78ba497e443ca31e8a8c97f11db281f743f6aca0), closes [#1048](https://github.com/angular/material/issues/1048))
* **theming:** 
  * switch accent palette to use accent hues ([002d8bfd](https://github.com/angular/material/commit/002d8bfde5aa0c240ebd054297227e499f9c3bf4))
  * allow hex values with uppercase letters ([9b45af50](https://github.com/angular/material/commit/9b45af50fd894d9e9451b833bb9c2edb1ff2e750), closes [#1014](https://github.com/angular/material/issues/1014))


#### Features

* **mdDialog:** disable scrolling on parent while showing dialog ([993fa2bc](https://github.com/angular/material/commit/993fa2bc00598dd18227b12bb197f2d9c667ea75))
* **input:**
  * add <md-input-container> parent for inputs/textareas, deprecate md-text-float ([60fcd6f4](https://github.com/angular/material/commit/60fcd6f4d8b895162b37a940c3f33164d8044382), closes [#993](https://github.com/angular/material/issues/993), [#553](https://github.com/angular/material/issues/553), [#654](https://github.com/angular/material/issues/654), [#993](https://github.com/angular/material/issues/993))
  * support md-warn for theming ([6acacc53](https://github.com/angular/material/commit/6acacc5382940a7ce1b393d0f4cdda6a0ffa615c), closes [#1137](https://github.com/angular/material/issues/1137))
* **textarea:** make textarea autogrow with size of content ([1c653696](https://github.com/angular/material/commit/1c65369629080ddb6b2c4a981ae00533f5c303b1), closes [#565](https://github.com/angular/material/issues/565))
* **layout:** add layout-align-{sm,gt-sm,md,gt-md,lg,gt-lg} attrs ([8550bd6c](https://github.com/angular/material/commit/8550bd6c9353914083bf75328c0160027202d237), closes [#631](https://github.com/angular/material/issues/631))
* **mdRadioGroup:** Radio submits on keydown/enter ([03c75927](https://github.com/angular/material/commit/03c7592798f904ac7a59b4a1c580672ca7c4789f), closes [#577](https://github.com/angular/material/issues/577))
* **mdSlider:** make discrete track ticks themable ([91bc598f](https://github.com/angular/material/commit/91bc598fab00150e26b11a2c7a0e7c9b3b364bec), closes [#621](https://github.com/angular/material/issues/621))
* **mdSwitch:** add grab/grabbing cursor during drag ([c60640bf](https://github.com/angular/material/commit/c60640bf4305cbd42d899db5b2adfe8601096d1b), closes [#983](https://github.com/angular/material/issues/983))
* **mdTabs:** adds default transitions for tab content ([3ee83a64](https://github.com/angular/material/commit/3ee83a645b9e4da8f4c0f2e6cbf772f504d8e9a9), closes [#1044](https://github.com/angular/material/issues/1044), [#717](https://github.com/angular/material/issues/717), [#811](https://github.com/angular/material/issues/811))
* **$mdToast:** add mdToast#showSimple shortcut method ([dd960c6f](https://github.com/angular/material/commit/dd960c6fce3dfc041ab2ee6c27f6574cfae75185))


#### Breaking Changes

* md-text-float has been deprecated due to flaws (explanation in [#547](https://github.com/angular/material/issues/547)).

To create an input, you now must use the native `<input>` and `<textarea>`
elements, with a `<md-input-container>` parent around each
`<input>` or `<textarea>`.

Change your code from this:

```html
<md-text-float label="First Name" ng-model="firstName"></md-text-float>
```

To this:

```html
<md-input-container>
  <label>First Name</label>
  <input ng-model="firstName">
</md-input-container>
```

* md-card now requires a separate `md-card-content` element
containing the card's content.  This was done to fix padding problems
with the content.

Change your code from this:

```html
<md-card>
  <img src="img/washedout.png" alt="Washed Out">
  <h2>Paracosm</h2>
  <p>
    The titles of Washed Out's breakthrough song and the first single from Paracosm share the
    two most important words in Ernest Greene's musical language: feel it.
  </p>
</md-card>
```

To this:

```html
<md-card>
  <img src="img/washedout.png" alt="Washed Out">
  <md-card-content>
    <h2>Paracosm</h2>
    <p>
      The titles of Washed Out's breakthrough song and the first single from Paracosm share the
      two most important words in Ernest Greene's musical language: feel it.
    </p>
  </md-card-content>
</md-card>
```

 ([28a4f8ff](https://github.com/angular/material/commit/28a4f8ff4d3b1d7b123152a01ef71e767fc315ff))


<a name="0.7.0-rc1"></a>
### 0.7.0-rc1  (2014-12-19)


#### Bug Fixes

* **$$interimElement:** make templates work with custom interpolation symbols ([d5aa68d1](https://github.com/angular/material/commit/d5aa68d1d7b146a30c45580d10c2e70bc736db95))
* **build:** correct  in buildConfig.js ([6caccf75](https://github.com/angular/material/commit/6caccf7577aeb877ce294111adb4e21a74cad171), closes [#981](https://github.com/angular/material/issues/981))
* **button:** fix hover on flat buttons ([de587772](https://github.com/angular/material/commit/de58777211bad5b5c31d5a7afe16adc498569be7))
* **checkbox:**
  * only add focus border if label is not empty ([74973487](https://github.com/angular/material/commit/749734876d9c39021b1d210f89ff51e1ca3c77e9), closes [#944](https://github.com/angular/material/issues/944))
  * added css support for disabled states ([d1920839](https://github.com/angular/material/commit/d19208397c946222c28ce1d6644930bb1c255e83))
* **demo:** Update slider demo to work in IE11 ([39559808](https://github.com/angular/material/commit/395598089bef548b76282679da71a05aeab1bf25), closes [#653](https://github.com/angular/material/issues/653))
* **filenames:** updated component .scss names to match conventions ([629b753f](https://github.com/angular/material/commit/629b753ff348b805e4ff73a2f66d354f2d42841d))
* **layout:** `flex="n"` attrs set height for column layout, width for row ([d3577798](https://github.com/angular/material/commit/d3577798c7384a003f0fa548e948c6201e86491d), closes [#937](https://github.com/angular/material/issues/937))
* **mdToast:** Puts index above dialog ([4ae4e072](https://github.com/angular/material/commit/4ae4e072020fe1e59da69e23500c134463936ee7), closes [#903](https://github.com/angular/material/issues/903))
* **switch:** only add focus border if label is not empty ([9c24cc93](https://github.com/angular/material/commit/9c24cc93497aa228a9513e40c15303edd73d865c), closes [#944](https://github.com/angular/material/issues/944))
* **tooltip:** fix bugs in Safari & Firefox, as well as scrolling bugs ([0d265292](https://github.com/angular/material/commit/0d2652928b11e899f7a88a6f497720226d65f228), closes [#593](https://github.com/angular/material/issues/593))


#### Features

* **theming:** use $mdThemingProvider ([47f0d09e](https://github.com/angular/material/commit/47f0d09e9ebd87891703fa2b7e81355ce3952a86))


#### Breaking Changes

* Themes are no longer defined by linked CSS files.

Themes are now defined through Javascript only. A 'theme template' is
bundled into angular-material.js, and then Javascript is used to
generate theme css for every theme the user defines.

The `default` theme is still shipped with angular-material.

If you used another theme (for example, the `purple` theme), change your code from this:

```html
<link rel="stylesheet" href="/themes/purple-theme.css">
<div md-theme="purple">
  <md-button class="md-primary">Purple</md-button>
</div>
```

To this:

```js
var app = angular.module('myApp', ['ngMaterial']);
app.config(function($mdThemingProvider) {
  //will use the colors from default theme for any color not defined.
  $mdThemingProvider.theme('purple')
    .primaryColor('purple');
});
```
```html
<div md-theme="purple">
  <md-button class="md-primary">Purple</md-button>
</div>
```

For more information, read the updated [Theme](https://material.angularjs.org/#/Theming/01_introduction) documentation -  ([47f0d09e](https://github.com/angular/material/commit/47f0d09e9ebd87891703fa2b7e81355ce3952a86))


<a name="0.6.1"></a>
## 0.6.1  (2014-12-08)

#### Bug Fixes

* **checkbox:**
  * fixes issue where double-clicking checkboxes causes text selection ([5d2e7d47](https://github.com/angular/material/commit/5d2e7d47ff88e2a0c52382baf56a7101c2e1c16b), closes [#588](https://github.com/angular/material/issues/588))
  * expands the checkbox click radius ([9cd24e2e](https://github.com/angular/material/commit/9cd24e2e21ee3e1c0abd57a30f501165f942f541), closes [#379](https://github.com/angular/material/issues/379))
* **compiler:** trim whitespace from templates (effects toast, bottomSheet, etc) ([3be3a527](https://github.com/angular/material/commit/3be3a527da3a5a6f47370cde0f4ba734ff2f9f85))
* **dialog:** transition in and out properly to/from click element ([1f5029d0](https://github.com/angular/material/commit/1f5029d0a7643fa1aa3fb970c281e261ac4de24d), closes [#568](https://github.com/angular/material/issues/568))
* **layout:** make [hide] attr work properly with all device sizes ([c0bbad20](https://github.com/angular/material/commit/c0bbad209c2008bbe881fe896d4bc0cec018305b))
* **mdMedia:** support all prefixes: sm,gt-sm,md,gt-md,lg,gt-lg ([c1cb9951](https://github.com/angular/material/commit/c1cb99512c1dc226f59fa3c6fe397af887263cb3))
* **ripple:** fixes an error caused when clicking on disabled checkboxes ([8a1718d7](https://github.com/angular/material/commit/8a1718d7aac6660060ad2265ce6cd7e2c4d87e2c))
* **slider:**
  * update the thumb text when the model is updated ([2ca21f8b](https://github.com/angular/material/commit/2ca21f8bfcf28938dde98b44b6596f43caa95a2d), closes [#791](https://github.com/angular/material/issues/791))
  * reposition when min or max is updated ([bd6478b9](https://github.com/angular/material/commit/bd6478b958ed464bed8608335d6304b8ec644fa7), closes [#799](https://github.com/angular/material/issues/799))
* **tabs:**
  * do not focus until pagination transition is done ([bb9bc82c](https://github.com/angular/material/commit/bb9bc82c4a89ba5796292111f9317cbd203bbf9f), closes [#781](https://github.com/angular/material/issues/781))
  * dont use focusin event on firefox ([5559ac63](https://github.com/angular/material/commit/5559ac63ed460bb7ee8d3e4b409b9deebac9394a), closes [#781](https://github.com/angular/material/issues/781))
* **toolbar:** use accent color for buttons inside ([12d458e3](https://github.com/angular/material/commit/12d458e3985cba5940107c302887f856837fd226))
* **tooltip:** make it appear above dialogs ([a3ce7d84](https://github.com/angular/material/commit/a3ce7d84ec39771ecbfbf6ad8106a05c9a0bd319), closes [#735](https://github.com/angular/material/issues/735))


#### Features

* **layout:** add both layout-margin and layout-padding attributes ([5caa22b2](https://github.com/angular/material/commit/5caa22b2c444485b3d340cda662d8808b1fc381d), closes [#830](https://github.com/angular/material/issues/830))
* **toast:** simple with content string: '$mdToast.simple('my-content')` ([554beff3](https://github.com/angular/material/commit/554beff3089e680c4c63b17bf271910f668a7140), closes [#833](https://github.com/angular/material/issues/833))



<a name="0.6.0-rc3"></a>
## 0.6.0-rc3  (2014-11-26)


#### Bug Fixes

* **dialog:** correct the opening position when opening from a button ([22865394](https://github.com/angular/material/commit/228653942b32e4bf9d7a07af5a8203e4c2052132), closes [#757](https://github.com/angular/material/issues/757))
* **hide:** make hide-gt-* attrs work properly with larger show attrs ([7fc6b423](https://github.com/angular/material/commit/7fc6b42314fbeb9024ba482a8407737100837604))
* **ripple:** prevent null error while using ripple ([6d81ded1](https://github.com/angular/material/commit/6d81ded16b871ee5772ce8e0d06690c5c210c0ca))


<a name="0.6.0-rc2"></a>
## 0.6.0-rc2  (2014-11-24)

This version introduces more breaking layout changes, ripple improvements,
aria improvements, bug fixes, and documentation enhancements.


#### Bug Fixes

* **button:** add override for transitions on ng-hide ([8fa652cf](https://github.com/angular/material/commit/8fa652cfb85aca2fe454c97b81ab306a4f9eb5e9), closes [#678](https://github.com/angular/material/issues/678))
* **layout:** add [flex-{sm,md,etc}] attr for 100% flex on screen size ([7acca432](https://github.com/angular/material/commit/7acca432aa0e18cebf1420d00ccc24e011fd9f53), closes [#706](https://github.com/angular/material/issues/706))
* **ripple:**
  * fix ripple bug with checkboxes in lists ([7d99f701](https://github.com/angular/material/commit/7d99f701f8eaafc8a3d1210182e82f63ec99fffb), closes [#679](https://github.com/angular/material/issues/679))
  * fix bug with vertical ripple alignment ([5cdcf29a](https://github.com/angular/material/commit/5cdcf29a524d5f371d5f9170129e5166a8ac5b27), closes [#725](https://github.com/angular/material/issues/725))
* **sidenav:** use flex display when opened ([ae1c1528](https://github.com/angular/material/commit/ae1c15281f5b07426c97cee16ae1efb836168679), closes [#737](https://github.com/angular/material/issues/737))

#### Features

* **mdAria:** checks child nodes for aria-label ([d515a6c2](https://github.com/angular/material/commit/d515a6c27e7fcdddc3ab7c7e88c93ef9b285dc7e), closes [#567](https://github.com/angular/material/issues/567))
* **mdBottomSheet:** add escape to close functionality ([d4b4480e](https://github.com/angular/material/commit/d4b4480ee5ae025c9d0dbab86a37a2294a09234e))
* **tabs:** ink ripple color syncs with ink bar ([9c56383b](https://github.com/angular/material/commit/9c56383b63f33aa9c4478ff0d1de6f1422938d4e))


#### Breaking Changes

* The -phone, -tablet, -pc, and -tablet-landscape
attribute suffixes have been removed and replaced with -sm, -md, and -lg
attributes.

* hide-sm means hide only on small devices (phones).
* hide-md means hide only on medium devices (tablets)
* hide-lg means hide only on large devices (rotated tablets).

Additionally, three new attribute suffixes have been provided for more flexibility:

* hide-gt-sm means hide on devices with size greater than small
 (bigger than phones).
* hide-gt-md means hide on devices with size greater than medium
 (bigger than tablets)
* hide-gt-lg means hide on devices with size greater than large
 (bigger than rotated tablets).

See the [layout options
section](http://material.angularjs.org/#/layout/options)
of the website for up-to-date information.

 ([a659c543](https://github.com/angular/material/commit/a659c5432f95fa62ee79977d2a2d45221600c077))


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
