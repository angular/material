The `<material-tabs>` produces a tabs component that supports 1...n tabs. The design supports three (3) usage scenarios:

1. Tabs only (without associated view content)
2. Tabs with internal view content
3. Tabs with external view content

Developers will use `<material-tabs>` with 1..n nested `<material-tab>` child tags. An example of the simplest usage is shown in the markup below:

<hljs lang="html">
<material-tabs>
  <material-tab label="Tab #1"></material-tab>
  <material-tab label="Tab #2"></material-tab>
  <material-tab label="Tab #3"></material-tab>
<material-tabs>
</hljs>
