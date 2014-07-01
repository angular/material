Material Design Tabs


## Tabs Overview 

The designs of the TabBar components supports three (3) types of usages:

1. content-less: tab bar only
2. tabs with internal content
3. tabs with external content and use of databinding to sync current tab with views/content.

Developers will use `<material-tabs/>` with 1..n `<material-tab>` child tags.

<hr>

| `<material-tabs>` Attribute | Description |
|--------|--------|
|  selected   | representing the currently selected tab |
|  nobar      | presence will hide the use an internal Tab selectionBar |
|  noink      | presence will hide the use of ink effects in the tab buttons |
|  nostretch  | presencewill disable selectionBar change animation(s) |

Any markup (other than **material-tab** tags) will be transcluded into the tab header  area BEFORE the tab buttons.

<b/>Notes</b>

- Content can include any markup.
- Expects 1..n <material-tab> child elements that will be used to build the tab labels (buttons) and the optional tab content views.
- If a tab is disabled while active (currently selected), then the next tab will be auto-selected. If the current/active tab is the last tab, then the next tab will be the first tab in the list.


<b>Animation Effects</b>
- Selection change causes `selectionBar` to expand and then contract
  - unless `nostretch` or `nobar`
- Ink causes the ripple effect to be displayed when a tab is activated/selected.

<br/>
<hr>

The `<material-tab />` directive is used to specify a tab label (aka **header button** ) and optional tab view content; these directives can **only** be used as children of `<material-tabs>` directives.


| `<material-tab/>` Attribute   | Description |
|-----------------|----------|
|  label          | simple-text to be used in tab header (optional) |
|  disabled       | boolean to indicate if tab is selectabel; defaults `false` |
|  active         | boolean indicates if the tab should be auto-selected; defaults `false` |
|  on-select      | expression to be evaluated when the tab is selected |
|  on-deselect    | expression to be evaluated when the tab is unselected |

If the `label` attribute is not specified, then an optional `<material-tab-label>` tag can be used to specified more complex tab header markup. If neither the **label** nor the **material-tab-label** are specified, then the nested markup of the `<material-tab>` is used as the tab header markup.

If a tab **label** has been identified, then any **non-**`<material-tab-label>` markup will be considered tab content and will be transcluded to the internal `tabs-content` container.


<br/>
<hr>

### Examples

<b>(1) Static-Markup Usage</b>


```html
<h3>Static Tabs: </h3>
<p>No ink effect and no sliding bar. Tab #1 is active and #2 is disabled.</p>

<material-tabs selected="0" noink nobar nostretch>

    <material-tab>ITEM ONE</material-tab>
    <material-tab disabled="true">ITEM TWO</material-tab>
    <material-tab>ITEM THREE</material-tab>

</material-tabs>
```
<br/>

![screen shot 2014-05-19 at 6 40 59 pm](https://cloud.githubusercontent.com/assets/210413/3021288/22cd060e-dfaf-11e3-82bb-e2102e3474fa.png)

<br/>

<b>(2) Markup with Dynamic Data</b>

Using the `ng-repeat` directive, `<material-tabs>` can be used in a data-driven mode:

Data Model:

```js
function MyCtrl($scope) {
  $scope.selectedIndex = 1;
  $scope.predicate = 'title';
  $scope.reveresed = false;
  $scope.tabs = [
    {title:'1', disabled:false, content:"This is content for Tab #1" },
    {title:'2', disabled:true,  content:"This is content for Tab #2" },
    {title:'3', disabled:false, content:"This is content for Tab #3" }
  ];
}
```

HTML Markup :

```html
<div ng-controller="MyCtrl">
  <material-tabs selected="selectedIndex" noink nobar nostretch>
    <material-tab ng-repeat="tab in tabs | orderBy:predicate:reversed"
          on-select="onTabSelected(tab)"
          on-deselect="announceDeselected(tab)"
          disabled="tab.disabled">
      <material-tab-label>
          {{tab.title}}
          <button ng-click="removeTab( tab )">X</button>
      </material-tab-label>
      {{tab.content}}
    </material-tab>
    <div class="topBar">
      <div style="centeredLogo">
        <img ng-src="angular.png" style="width:30px;height: 30px;">
      </div>
    </div>
  </material-tabs>
</div>
```


<b>(3)  Static markup with internal tab content views</b>

The `<material-tabs />` directive is will wrap each content with a `<material-view>` and transclude `<material-tab>` the wrapped content to an internal `<div class="tabs-content">` container. 

HTML Markup :

```html
<material-tabs selected="which" noink nobar nostretch>

  <material-tab >
      <material-tab-header>ITEM A1</material-tab-header>
      <div class="blueArea">Tab Content #A1</div>
  </material-tab>

  <material-tab disabled="true" >ITEM B2</material-tab>

  <material-tab >
      <material-tab-header>
          <span class="redArea"> ITEM C3</span>
      </material-tab-header>
      <div class="redArea">Tab Content #C3</div>
  </material-tab>

  <material-tab>
  	<material-tab-header>Item D4</material-tab-header>
	<div class="greenArea">Tab Content #D4</div>
  </material-tab>

  <material-tab disabled="true" >
      <material-tab-header>ITEM E5</material-tab-header>
      <div class="greenArea">Tab Content #E5</div>
  </material-tab>

</material-tabs>
```

![tabswithinternalviews](https://cloud.githubusercontent.com/assets/210413/3189703/985c5752-ecc6-11e3-9d26-6ce3dae0172e.png)

<br/>



<b>(4)  Static markup; with external tab content views</b>

The `<material-tabs />` directive is used here as a TabHeader bar with databinding to an external ng-switch container:

HTML Markup :

```html
<material-tabs selected="selectedIndex" noink>
  <material-tab label="ITEM ONE"></material-tab>
  <material-tab label="ITEM TWO" disabled="twoDisabled"></material-tab>
  <material-tab label="ITEM THREE"></material-tab>
  <material-tab label="ITEM FOUR"></material-tab>
</material-tabs>

<div class="animate-switch-container" ng-switch on="selectedIndex">
  <div class="animate-switch blueArea" ng-switch-when="0">
      View for Item #1<br/>
      Selection index = 0
  </div>
  <div class="animate-switch redArea" ng-switch-when="1">
      View for Item #2<br/>
      Selection index = 1
  </div>
  <div class="animate-switch greenArea" ng-switch-when="2">
      View for Item #3<br/>
      Selection index = 2
  </div>
  <div class="animate-switch grayArea" ng-switch-when="3">
      View for Item #4<br/>
      Selection index = 3
  </div>
</div>
```

![tabswithexternalviews](https://cloud.githubusercontent.com/assets/210413/3189768/316e8f28-ecc7-11e3-92d2-ce67258753b5.png)


<br/>

---


