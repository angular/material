/**
 * @ngdoc directive
 * @name mdTab
 * @module material.components.tabs
 *
 * @restrict E
 *
 * @description
 * Use the `<md-tab>` a nested directive used within `<md-tabs>` to specify a tab with a **label** and optional *view content*.
 *
 * If the `label` attribute is not specified, then an optional `<md-tab-label>` tag can be used to specify more
 * complex tab header markup. If neither the **label** nor the **md-tab-label** are specified, then the nested
 * markup of the `<md-tab>` is used as the tab header markup.
 *
 * Please note that if you use `<md-tab-label>`, your content **MUST** be wrapped in the `<md-tab-body>` tag.  This
 * is to define a clear separation between the tab content and the tab label.
 *
 * If a tab **label** has been identified, then any **non-**`<md-tab-label>` markup
 * will be considered tab content and will be transcluded to the internal `<div class="md-tabs-content">` container.
 *
 * This container is used by the TabsController to show/hide the active tab's content view. This synchronization is
 * automatically managed by the internal TabsController whenever the tab selection changes. Selection changes can
 * be initiated via data binding changes, programmatic invocation, or user gestures.
 *
 * @param {string=} label Optional attribute to specify a simple string as the tab label
 * @param {boolean=} disabled If present, disabled tab selection.
 * @param {expression=} md-on-deselect Expression to be evaluated after the tab has been de-selected.
 * @param {expression=} md-on-select Expression to be evaluated after the tab has been selected.
 *
 *
 * @usage
 *
 * <hljs lang="html">
 * <md-tab label="" disabled="" md-on-select="" md-on-deselect="" >
 *   <h3>My Tab content</h3>
 * </md-tab>
 *
 * <md-tab >
 *   <md-tab-label>
 *     <h3>My Tab content</h3>
 *   </md-tab-label>
 *   <md-tab-body>
 *     <p>
 *       Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
 *       totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae
 *       dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
 *       sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
 *     </p>
 *   </md-tab-body>
 * </md-tab>
 * </hljs>
 *
 */
angular
    .module('material.components.tabs')
    .directive('mdTab', MdTab);

function MdTab () {
  return {
    require: '^?mdTabs',
    terminal: true,
    scope: {
      label:    '@',
      active:   '=?mdActive',
      disabled: '=?ngDisabled',
      select:   '&?mdOnSelect',
      deselect: '&?mdOnDeselect'
    },
    link: postLink
  };

  function postLink (scope, element, attr, ctrl) {
    if (!ctrl) return;
    var tabs = element.parent()[0].getElementsByTagName('md-tab'),
        index = Array.prototype.indexOf.call(tabs, element[0]),
        data = ctrl.insertTab({
          scope:    scope,
          parent:   scope.$parent,
          index:    index,
          template: getTemplate(),
          label:    getLabel()
        }, index);

    scope.deselect = scope.deselect || angular.noop;
    scope.select = scope.select || angular.noop;

    scope.$watch('active', function (active) { if (active) ctrl.select(data.getIndex()); });
    scope.$watch('disabled', function () { ctrl.refreshIndex(); });
    scope.$on('$destroy', function () { ctrl.removeTab(data); });

    function getLabel () {
      var label = attr.label || (element.find('md-tab-label')[0] || element[0]).innerHTML;
      return getLabelAttribute() || getLabelElement() || getElementContents();
      function getLabelAttribute () { return attr.label; }
      function getLabelElement () {
        var label = element.find('md-tab-label');
        if (label.length) return label.remove().html();
      }
      function getElementContents () {
        var html = element.html();
        element.empty();
        return html;
      }
    }

    function getTemplate () {
      var content = element.find('md-tab-body'),
          template = content.length ? content.html() : attr.label ? element.html() : null;
      if (content.length) content.remove();
      else if (attr.label) element.empty();
      return template;
    }
  }
}
