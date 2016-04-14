@ngdoc content
@name button
@description

# &lt;md-button&gt;

Below is a snapshot of the Angular Material **button** component demos with the default themes and standard options:

![buttonsdemo](https://cloud.githubusercontent.com/assets/210413/7947020/fafde934-093f-11e5-9584-27eb2deedd0f.png)

<br/>
### CSS Styles

The base CSS class for all `<md-button>` components is `.md-button`: 

<hljs lang="css">
.md-button {
  padding: 0 6px 0 6px;
  margin: 6px 8px 6px 8px;
  min-width: 88px;
  border-radius: 3px;
  font-size: 14px;
  text-align: center;
  text-transform: uppercase;
  text-decoration:none;
  border: none;
  outline: none;
}
</hljs>

When defining custom CSS overrides, developers should create their own CSS class. For example, to define a `.btn1` override to **md-button** use:

<hljs lang="css">
.btn1 {
 // your custom overrides here
}
</hljs>

<hljs lang="html">
  <md-button class="btn1" ng-click="acceptOffer();"> Accept </md-button>
</hljs>

<br/>
### Theme Requirements

All Angular Material components have specific CSS rules constructed using the theme name and theme-class overrides. For the **Default** theme, however, these rules are added to the components styles using the `.md-default-theme` class. If, however, you have configured a custom theme called `companyX` that is **NOT** the default theme, then any CSS overrides **must** use fully-specified classname. For `<md-button>` the **fully-specified classname** will be `.md-button.md-companyX-theme.btn1`.

<hljs lang="css">
.md-button.md-companyX-theme.btn1            {  }
.md-button.md-companyX-theme.md-primary.btn1 {  }
.md-button.md-companyX-theme.md-accent.btn1  {  }
.md-button.md-companyX-theme.md-warn.btn1    {  }
</hljs>


<br/>
## Flat Buttons

![mdbuttonflatdefault3](https://cloud.githubusercontent.com/assets/210413/7945984/bda14884-0939-11e5-9196-131ded20ca77.png)

<hljs lang="html">
<md-button> Button </md-button>
</hljs>

<hljs lang="css">
.md-button {
  color : currentColor;
}

.md-button:not([disabled]):hover {
  background-color: rgba(158, 158, 158, 0.2);
}

.md-button[disabled] {
  color : rgba(0, 0, 0, 0.26);
  background-color: transparent;
}
</hljs>

<br/>

#### Custom CSS Overrides 

![mdbuttonflatdefault_overrides2](https://cloud.githubusercontent.com/assets/210413/7945987/c1b1c700-0939-11e5-879c-ba804ca03267.png)


<hljs lang="html"> 
<md-button class="btn1"> Button </md-button> 
</hljs>
<hljs lang="css">
.btn1 { 
  color : rgb(49, 46, 46);
  background-color: rgba(255, 222, 121, 0.96);
  border-radius: 10px 0 0 10px;
  font-size: 16px;
}

.btn1:not([disabled]):hover { 
  background-color: rgba(107, 103, 91, 0.96);
  color: white;
}

.btn1[disabled] { 
  color : rgb(187, 187, 187);
  background-color: rgba(230, 230, 229, 0.96);
}
</hljs>

<br/>
## Raised Buttons

![raisedbutton](https://cloud.githubusercontent.com/assets/1292882/7254163/fe898728-e849-11e4-943b-a9cd88ec9573.PNG)

Add the `.md-raised` class to create a raised button:

<hljs lang="html">
<md-button class="md-raised">Button</md-button>
</hljs>

<hljs lang="css">
.md-button.md-raised:not([disabled]) {
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);
}
</hljs>

<br/>
## Cornered buttons

![corneredbutton](https://cloud.githubusercontent.com/assets/1292882/7254379/682592ac-e84b-11e4-8d33-78314cea8bda.PNG)

Add the `.md-cornered` class to create a button with corners:

<hljs lang="html">
<md-button class="md-raised md-cornered">Button</md-button>
</hljs>

<hljs lang="css">
.md-button.md-cornered {
    border-radius: 0; 
}
</hljs>

<br/>
## Default FAB Button

![floatingbutton](https://cloud.githubusercontent.com/assets/1292882/7254736/8fec7ee8-e84d-11e4-9cf9-58ea9221c3c2.PNG)

Add the `.md-fab` class in order to create a floating action button (aka FAB):

<hljs lang="html">
<md-button class="md-fab" aria-label="Eat cake">
  <md-icon md-svg-src="img/icons/cake.svg"></md-icon>
</md-button>
</hljs>
<hljs lang="css">
.md-button.md-fab {
  line-height: 5.6rem;
  min-width: 0;
  width: 5.6rem;
  height: 5.6rem;
  border-radius: 50%;
}
</hljs>

<br/>
## Mini FAB Button

![minibutton](https://cloud.githubusercontent.com/assets/1292882/7273617/1fcca280-e8fe-11e4-9588-231a9e860be1.PNG)

Add the `.md-mini` class in order to create small, mini-FAB buttons: 

<hljs lang="html">
<md-button class="md-fab md-mini" aria-label="Eat cake">
  <md-icon md-svg-src="img/icons/cake.svg"></md-icon>
</md-button>
</hljs>

<hljs lang="css">
.md-button.md-fab.md-mini {
      line-height: 4rem;
      width: 4rem;
      height: 4rem;
}
</hljs>

<br/>
## Icon button using SVGs

![iconbutton](https://cloud.githubusercontent.com/assets/1292882/7273908/d701bd8a-e900-11e4-84c7-44c580c7372d.PNG)

Create icon buttons by adding the `.md-icon-button` class and the `<md-icon ...>` component:

<hljs lang="html">
<md-button class="md-icon-button md-primary" aria-label="Settings">
        <md-icon md-svg-icon="img/icons/menu.svg"></md-icon>
</md-button>
</hljs>
<hljs lang="css">
.md-button.md-icon-button {
    margin: 0 0.6rem;
    height: 4.8rem;
    min-width: 0;
    line-height: 4.8rem;
    padding-left: 0;
    padding-right: 0;
    width: 4.8rem; 
}
</hljs>

<br/>
## Icon button using Font-icons


![fonticonbutton](https://cloud.githubusercontent.com/assets/1292882/7670414/f57721ba-fcab-11e4-9a22-67970063797c.PNG)

Here is another example of a button with font icons:

<hljs lang="html">
<md-button>
 <md-icon md-font-icon="icon-home" 
          ng-style="{color: 'green', 'font-size':'36px', height:'36px'}" >
 </md-icon>
</md-button>
</hljs>


<br/>
## Grouping with CSS Overrides

![mdbuttongroup](https://cloud.githubusercontent.com/assets/210413/7961138/1b48bb16-09cb-11e5-9283-bdda28b8bb66.png)

Using the customization approaches documented above, we can easily create a mdButtonGroup:

<hljs lang="html">
<section layout="row"
         layout-align="center center">
  <md-button class="groupX left">Apple</md-button>
  <md-button class="groupX middle">Samsung</md-button>
  <md-button class="groupX middle">Sony</md-button>
  <md-button class="groupX right">B&O</md-button>
</section>
</hljs>

<hljs lang="css">
.groupX {
	font-size: 16px;
	margin: 20px 0;
	padding: 3px 15px 3px 15px;
	color: rgb(49, 46, 46);
	background-color: rgba(224, 224, 224, 0.96);
	text-transform: none;
    font-weight: 400;
    min-width:100px;
}

.md-button.left {
    border-radius: 10px 0 0 10px;
}

.md-button.middle {
    border-radius: 0;
    border-left: 1px solid rgba(230, 230, 230, 0.96);
    border-right: 1px solid rgba(230, 230, 230, 0.96);
}

.md-button.right {
    border-radius: 0 10px 10px 0;
}

.md-button:not([disabled]):hover {
    background-color: rgba(193, 193, 193, 0.96);
    color: rgba(44, 65, 164, 0.96);
    transition: 0.3s;
}
</hljs>
