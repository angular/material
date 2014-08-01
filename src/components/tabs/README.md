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

The `<material-tab />` directive is used to specify a tab label (aka **header button** ) and optional tab view content; these directives can **only** be used as children of `<material-tabs>` directives.

If the `label` attribute is not specified, then an optional `<material-tab-label>` tag can be used to specified more complex tab header markup. If neither the **label** nor the **material-tab-label** are specified, then the nested markup of the `<material-tab>` is used as the tab header markup.

If a tab **label** has been identified, then any **non-**`<material-tab-label>` markup will be considered tab content and will be transcluded to the internal `<div class="tabs-content">` container.

Any markup (other than **`<material-tab>`** tags) will be transcluded into the tab header area BEFORE the tab buttons.

Additional Features:

- Content can include any markup.
- If a tab is disabled while active/selected, then the next tab will be auto-selected. If the currently active tab is the last tab, then the next tab will be the first tab in the list.

Shown below are demos illustrating usages of the `<material-tabs>` component:




