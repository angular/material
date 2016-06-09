@ngdoc content
@name Declarative Syntax
@description

Theming in angular material uses classes to apply an intention group to a given
component. Most components in Angular Material support intention classes 
as expected, including:

- md-button
- md-checkbox
- md-progress-circular
- md-progress-linear
- md-radio-button
- md-slider
- md-switch
- md-tabs
- md-input-container
- md-toolbar


### Specifying intention group

The classes to apply the color intention for a given component are as follows:
`md-primary`, `md-accent`, `md-warn`.

<hljs lang="html">
<md-button class="md-primary">Click me</md-button>
<md-button class="md-accent">or maybe me</md-button>
<md-button class="md-warn">Careful</md-button>
</hljs>

### Differentiating within an intention group.

If you need to slightly differentiate an element, you can specify an additional
class of `md-hue-1`, `md-hue-2`, or `md-hue-3`. Use these classes sparingly
in your application to avoid overwhelming users.

<hljs lang="html">
<md-button class="md-primary">Click me</md-button>
<md-button class="md-primary md-hue-1">Click me</md-button>
<md-button class="md-primary md-hue-2">Click me</md-button>
</hljs>
