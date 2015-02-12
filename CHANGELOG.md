<a name="0.8.0-rc1"></a>
### 0.8.0-rc1  (2015-02-11)


#### Features

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

