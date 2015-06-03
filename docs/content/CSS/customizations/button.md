#&lt;md-button&gt;

Below is a snapshot of the Angular Material **button** component demos with the default themes and standard options:

![buttonsdemo](https://cloud.githubusercontent.com/assets/210413/7947020/fafde934-093f-11e5-9584-27eb2deedd0f.png)

### CSS Styles

The base class for all buttons is `.md-button`. This class is applied automatically to the `<md-button .../>` directive:

```css
.md-button {      
  padding:        0 6px 0 6px;
  margin:         6px 8px 6px 8px;
  min-width:      88px;
  border-radius:  3px;
  font-size:      14px;
  text-align:     center;
  text-transform: uppercase;
  text-decoration:none;
  border:         none;
  outline:        none;
}
```

### Theme Requirements

All Angular Material components have specific CSS rules dependent upon the **theme** name and theme-class overrides.
For example, if using the **default** theme, then each component will have a `.md-default-theme` class. Standard theme color overrides include optional classes `md-primary`, `md-accent`, and `md-warn`.

When defining custom CSS overrides, developers should create their own class and then append it to the full class style specification for that component. For example, to define a `.btn1` override to **md-button** default theme styles,  use:

```css
.md-button.md-default-theme.btn1            { ... }  /* for <md-button class="btn1" ...> */
.md-button.md-default-theme.md-primary.btn1 { ... }  /* for <md-button class="md-primary btn1" ...> */
.md-button.md-default-theme.md-accent.btn1  { ... }  /* for <md-button class="md-accent btn1" ...> */
.md-button.md-default-theme.md-warn.btn1    { ... }  /* for <md-button class="md-warn btn1" ...> */
```

If you have configured a custom theme called `companyX`, then the **fully-specified** classname will be `.md-button.md-companyX-theme.btn1`.

```css
.md-button.md-companyX-theme.btn1            { ... }  /* for <md-button class="btn1" /> */
.md-button.md-companyX-theme.md-primary.btn1 { ... }  /* for <md-button class="md-primary btn1" /> */
.md-button.md-companyX-theme.md-accent.btn1  { ... }  /* for <md-button class="md-accent btn1" /> */
.md-button.md-companyX-theme.md-warn.btn1    { ... }  /* for <md-button class="md-warn btn1" /> */
```


<br/>
##Flat Buttons

![mdbuttonflatdefault3](https://cloud.githubusercontent.com/assets/210413/7945984/bda14884-0939-11e5-9196-131ded20ca77.png)

```html 
<md-button> Button </md-button> 
```
```css
.md-button.md-default-theme { 
  color : currentColor; 
}
```

```css
.md-button.md-default-theme:not([disabled]):hover { 
  background-color: rgba(158, 158, 158, 0.2);
}
```
```css
.md-button.md-default-theme[disabled] { 
  color : rgba(0, 0, 0, 0.26);
  background-color: transparent;
}
```

<br/>

#### Custom CSS Overrides 

![mdbuttonflatdefault_overrides2](https://cloud.githubusercontent.com/assets/210413/7945987/c1b1c700-0939-11e5-879c-ba804ca03267.png)


```html 
<md-button class="btn1"> Button </md-button> 
```
```css
.md-button.md-default-theme.btn1 { 
  color : rgb(49, 46, 46);
  background-color: rgba(255, 222, 121, 0.96);
  border-radius: 10px 0 0 10px;
  font-size: 16px;
}
```

```css
.md-button.md-default-theme.btn1:not([disabled]):hover { 
  background-color: rgba(107, 103, 91, 0.96);
  color: white;
}
```

```css
.md-button.md-default-theme.btn1[disabled] { 
  color : rgb(187, 187, 187);
  background-color: rgba(230, 230, 229, 0.96);
}
```

<br/>
##Raised Buttons

![raisedbutton](https://cloud.githubusercontent.com/assets/1292882/7254163/fe898728-e849-11e4-943b-a9cd88ec9573.PNG)

Add the `.md-raised` class to create a raised button:

```html
<md-button class="md-raised">Button</md-button>
```

```css
.md-button.md-default-theme.md-raised:not([disabled]) {
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);
}
```

<br/>
##Cornered buttons

![corneredbutton](https://cloud.githubusercontent.com/assets/1292882/7254379/682592ac-e84b-11e4-8d33-78314cea8bda.PNG)

Add the `.md-cornered` class to create a button with corners:

```html
<md-button class="md-raised md-cornered">Button</md-button>
```

```css
.md-button.md-default-theme.md-cornered {
    border-radius: 0; 
}
```

<br/>
##Default FAB Button

![floatingbutton](https://cloud.githubusercontent.com/assets/1292882/7254736/8fec7ee8-e84d-11e4-9cf9-58ea9221c3c2.PNG)

Add the `.md-fab` class in order to create a floating action button (aka FAB):

```html
<md-button class="md-fab" aria-label="Eat cake">
	<md-icon md-svg-src="img/icons/cake.svg"></md-icon>
</md-button>
```
```css
.md-button.md-default-theme.md-fab {
	line-height: 5.6rem;
	min-width: 0;
	width: 5.6rem;
	height: 5.6rem;
	border-radius: 50%;
}
```

<br/>
##Mini FAB Button

![minibutton](https://cloud.githubusercontent.com/assets/1292882/7273617/1fcca280-e8fe-11e4-9588-231a9e860be1.PNG)

Add add the `.md-mini` class in order to create small, mini-FAB buttons: 

```html
<md-button class="md-fab md-mini" aria-label="Eat cake">
	<md-icon md-svg-src="img/icons/cake.svg"></md-icon>
</md-button>
```

```css
.md-button.md-default-theme.md-fab.md-mini {
      line-height: 4rem;
      width: 4rem;
      height: 4rem;
}
```

<br/>
##Icon button using SVGs

![iconbutton](https://cloud.githubusercontent.com/assets/1292882/7273908/d701bd8a-e900-11e4-84c7-44c580c7372d.PNG)

Create icon buttons by adding the `<md-icon ...>` class:

```html
<md-button class="md-icon-button md-primary" aria-label="Settings">
        <md-icon md-svg-icon="img/icons/menu.svg"></md-icon>
</md-button>
```
```css
.md-button.md-icon-button {
    margin: 0 0.6rem;
    height: 4.8rem;
    min-width: 0;
    line-height: 4.8rem;
    padding-left: 0;
    padding-right: 0;
    width: 4.8rem; 
}
```

<br/>
##Icon button using Font-icons


![fonticonbutton](https://cloud.githubusercontent.com/assets/1292882/7670414/f57721ba-fcab-11e4-9a22-67970063797c.PNG)

Here is another example of a button with font icons:

```html
<md-button>
 <md-icon md-font-icon="icon-home" 
          ng-style="{color: 'green', 'font-size':'36px', height:'36px'}" >
 </md-icon>
</md-button>
```


<br/>
## Grouping with CSS Overrides

![mdbuttongroup](https://cloud.githubusercontent.com/assets/210413/7961138/1b48bb16-09cb-11e5-9283-bdda28b8bb66.png)

Using the customization approaches documented above, we can easily create a mdButtonGroup:

```html
<section id="vendorGroup"
         layout="row" layout-sm="column" 
         layout-align="center center" >
  <md-button class="left">Apple</md-button>
  <md-button class="middle">Samsung</md-button>
  <md-button class="middle">Sony</md-button>
  <md-button class="right">B&O</md-button>
</section>
```

```css
#vendorGroup > .md-button.md-default-theme {
    font-size: 16px;
    margin: 20px 0;
    padding: 3px 15px 3px 15px;
    color: rgb(49, 46, 46);
    background-color: rgba(224, 224, 224, 0.96);
	text-transform: none;
    font-weight: 400;
    min-width:100px;
}

.md-button.md-default-theme.left {
    border-radius: 10px 0 0 10px;
}

.md-button.md-default-theme.middle {
    border-radius: 0;
    border-left: 1px solid rgba(230, 230, 230, 0.96);
    border-right: 1px solid rgba(230, 230, 230, 0.96);
}

.md-button.md-default-theme.right {
    border-radius: 0 10px 10px 0;
}

.md-button.md-default-theme:not([disabled]):hover {
    background-color: rgba(193, 193, 193, 0.96);
    color: rgba(44, 65, 164, 0.96);
    transition: 0.3s;
}
```
