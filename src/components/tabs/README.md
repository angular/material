Tabs, created with the `<material-tabs>` directive provide *tabbed* navigation with different styles.

The Tabs component consists of clickable tabs that are aligned horizontally side-by-side. The Angular Material Tabs component supports static or dynamic tab creation, programmatic Tab API, responsive designs, and support dynamic transitions through different contents using tabbed navigation.

The `<material-tabs>` directive uses 1..n `<material-tab>` child directives to produces a Tabs components. Below is the markup for its simplest usage:

<hljs lang="html">
<material-tabs>
  <material-tab label="Tab #1"></material-tab>
  <material-tab label="Tab #2"></material-tab>
  <material-tab label="Tab #3"></material-tab>
<material-tabs>
</hljs>

Tabs supports three (3) usage scenarios:

1. Tabs (buttons only)
2. Tabs with internal view content
3. Tabs with external view content

**Tab-only** support is useful when tab buttons are used for custom navigation regardless of any other components, content, or views. 

**Tabs with internal views** are the traditional usages where each tab has associated view content and the view switching is managed internally by the Tabs component.

**Tabs with external view content** is often useful when content associated with each tab is independently managed and data-binding notifications announce tab selection changes.

> As a performance bonus, if the tab content is managed internally then the non-active (non-visible) tab contents are temporarily disconnected from the `$scope.$digest()` processes; which restricts and optimizes DOM updates to only the currently active tab.

<br/>
Below are live examples (with source) that demonstrate various features and usages:<br/>
