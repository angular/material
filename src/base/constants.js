var Constant = {
  ARIA : {
    ROLE : {
      BUTTON : 'button',
      CHECKBOX : 'checkbox',
      DIALOG : 'dialog',
      LIST : 'list',
      LIST_ITEM : 'listitem',
      RADIO : 'radio',
      RADIO_GROUP : 'radiogroup',
      SLIDER : 'slider',
      TAB_LIST : 'tablist',
      TAB : 'tab',
      TAB_PANEL : 'tabpanel'
    },
    PROPERTY : {
      CHECKED : 'aria-checked',
      HIDDEN : 'aria-hidden',
      EXPANDED : 'aria-expanded',
      LABEL: 'aria-label',
      SELECTED : 'aria-selected',
      LABEL_BY : 'aria-labelledby'
    },
    STATE: {}
  },
  KEY_CODE : {
    ESCAPE : 27,
    SPACE : 32,
    LEFT_ARROW : 37,
    RIGHT_ARROW : 39,
    ENTER: 13
  },
  EVENTS : {
    SCOPE_DESTROY : '$destroy',
    TABS_CHANGED : '$materialTabsChanged',
    FOCUS_CHANGED : '$materialFocusChanged',
    WINDOW_RESIZE : 'resize',
    KEY_DOWN     : 'keydown',
    CLICK        : 'click'
  }
};

/**
 * Alias shortcuts...
 */
var EVENT = Constant.EVENTS;
var KEY  = Constant.KEY_CODE;
