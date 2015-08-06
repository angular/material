@ngdoc content
@name checkbox
@description

<h2>  CSS Styles</h2>

The css decalaration of the `<md-checkbox>` component is:

<hljs lang="css">
 md-checkbox {
   margin: 8px;
   cursor: pointer;
   padding-left: 18px;
   padding-right: 0;
   line-height: 26px;
   min-width: 18px;
   min-height: 18px;
 }
</hljs>

<br/>
<h3> Ink color</h3>

<p>In order to change the color when the checkbox is checked:</p>

![greencheckbox](https://cloud.githubusercontent.com/assets/1292882/8035909/b2130da0-0dfc-11e5-932f-4424d3b46d5b.PNG)

<hljs lang="html">
<md-checkbox class="green">
   Green Checkbox
</md-checkbox>
</hljs>

 <hljs lang="css">
 md-checkbox.md-checked.green .md-icon {
  background-color: rgba(0, 255, 0, 0.87);
 }
 </hljs>


<br/>
<h3> Disabled</h3>

<p>In order to change the color when a disabled checkbox is checked:</p>

![checkboxdisabledred](https://cloud.githubusercontent.com/assets/1292882/8036177/dc941a86-0dfe-11e5-8892-ac19ec6926fe.PNG)
<br/>

<hljs lang="html">
<md-checkbox ng-disabled="true" class="red" ng-model="data.cb4" ng-init="data.cb4=true">
  Checkbox: Disabled, Checked
</md-checkbox>
</hljs>

 <hljs lang="css">
md-checkbox.md-checked[disabled].red .md-icon {
  background-color: rgba(255, 0, 0, 0.26);
}
 </hljs>

<br/>
<h3>  Borders</h3>
<p>In order to add a custom border do the following:</p>

![checkboxcustomborder](https://cloud.githubusercontent.com/assets/1292882/8037214/388dd40c-0e05-11e5-82a7-4bfa2541e968.PNG)

<br/><br/>
<hljs lang="html">
 <div>
  <md-checkbox ng-model="data.cb2" aria-label="Checkbox 2" ng-true-value="'yup'" ng-false-value="'nope'">
   Default Border
  </md-checkbox>
 </div>
 <div>
  <md-checkbox ng-model="data.cb2" aria-label="Checkbox 2" ng-true-value="'yup'" class="dotted" ng-false-value="'nope'">
     Custom Border
  </md-checkbox>
 </div>
</hljs>
<hljs lang="css">
md-checkbox.dotted .md-icon {
 border-width: 1px;
 border-style: dashed;
}
</hljs>



<br/>
<h3> Bi-Di </h3>

The mdCheckbox directive supports bi-directional specifiers in the `<html dir="rtl">` tag:

![checkboxrtl](https://cloud.githubusercontent.com/assets/1292882/8036091/fb40bcf6-0dfd-11e5-8319-25e68939d1a3.PNG)


