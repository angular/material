
The design of the Material Tabs components supports three (3) types of usages:

1. tab bar only without view content
2. tabs with internal content
3. tabs with external content; use of databinding to sync current tab with external views/content.

Developers will use `<material-tabs>` with 1..n `<material-tab>` child tags.

Any markup (other than **material-tab** tags) will be transcluded into the tab header  area BEFORE the tab buttons.

- Content can include any markup.
- Expects 1..n <material-tab> child elements that will be used to build the tab labels (buttons) and the optional tab content views.
- If a tab is disabled while active (currently selected), then the next tab will be auto-selected. If the current/active tab is the last tab, then the next tab will be the first tab in the list.

The `<material-tab />` directive is used to specify a tab label (aka **header button** ) and optional tab view content; these directives can **only** be used as children of `<material-tabs>` directives.

If the `label` attribute is not specified, then an optional `<material-tab-label>` tag can be used to specified more complex tab header markup. If neither the **label** nor the **material-tab-label** are specified, then the nested markup of the `<material-tab>` is used as the tab header markup.

If a tab **label** has been identified, then any **non-**`<material-tab-label>` markup will be considered tab content and will be transcluded to the internal `tabs-content` container.






