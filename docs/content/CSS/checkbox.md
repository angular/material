@ngdoc content
@name button
@description

### CSS Styles

The css decalaration of the `<md-checkbox>` component is:
 
 ```css
 md-checkbox {
   margin: 8px;
   cursor: pointer;
   padding-left: 18px;
   padding-right: 0;
   line-height: 26px;
   min-width: 18px;
   min-height: 18px; }
 ```
 
#### Ink color

![greencheckbox](https://cloud.githubusercontent.com/assets/1292882/8035909/b2130da0-0dfc-11e5-932f-4424d3b46d5b.PNG)

In order to change the color when the checkbox is checked:

```html
 <md-checkbox class="green">
      Green Checkbox
    </md-checkbox>
```

 ```css
 md-checkbox.md-checked.green .md-icon {
        background-color: rgba(0, 255, 0, 0.87);
    }
 ```



In order to change the color when a disabled checkbox is checked:

```html
 <md-checkbox ng-disabled="true" class="red" ng-model="data.cb4" ng-init="data.cb4=true">
            Checkbox: Disabled, Checked
        </md-checkbox>
```

 ```css
  md-checkbox.md-checked[disabled].red .md-icon {
        background-color: rgba(255, 0, 0, 0.26);
    }
 ```
![checkboxdisabledred](https://cloud.githubusercontent.com/assets/1292882/8036177/dc941a86-0dfe-11e5-8892-ac19ec6926fe.PNG)


#### Borders
In order to add a custom border do the following:
```html
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
```
```css
md-checkbox.dotted .md-icon{
        border-width: 1px;
        border-style: dashed;

    }
```

![checkboxcustomborder](https://cloud.githubusercontent.com/assets/1292882/8037214/388dd40c-0e05-11e5-82a7-4bfa2541e968.PNG)



#### Bi-Di

The mdCheckbox directive is sensible to the html direction:
```html
<html dir="rtl">
```

results in :

![checkboxrtl](https://cloud.githubusercontent.com/assets/1292882/8036091/fb40bcf6-0dfd-11e5-8319-25e68939d1a3.PNG)


