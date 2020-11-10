(function() {
'use strict';

angular.module('panelReuseDemo', ['ngMaterial'])
    .controller('ReuseDemoCtrl', ReuseDemoCtrl)
    .controller('ReusePanelCtrl', ReusePanelCtrl);

function ReuseDemoCtrl($mdPanel) {
  this._mdPanel = $mdPanel;

  this.animationType = 'scale';

  var position = this._mdPanel.newPanelPosition()
    .absolute()
    .center();

  var animation = this._mdPanel.newPanelAnimation()
    .openFrom('.demo-dialog-reuse-button')
    .duration(300)
    .withAnimation(this._mdPanel.animation.SCALE);

  var config = {
    attachTo: angular.element(document.body),
    controller: ReusePanelCtrl,
    controllerAs: 'ctrl',
    disableParentScroll: this.disableParentScroll,
    templateUrl: 'panel.tmpl.html',
    hasBackdrop: true,
    panelClass: 'demo-dialog-example',
    position: position,
    animation: animation,
    trapFocus: true,
    zIndex: 150,
    clickOutsideToClose: false,
    escapeToClose: false,
    focusOnOpen: true,
    locals: {
      _demoCtrl: this
    }
  };

  this._mdPanelRef = this._mdPanel.create(config);
  this._mdPanelRef.attach();
}

ReuseDemoCtrl.prototype.showDialog = function($event, text) {
  var position = this._mdPanel.newPanelPosition()
    .absolute()
    .center();

  this._mdPanelRef.updatePosition(position);

  var animation = this._mdPanel.newPanelAnimation()
    .openFrom($event)
    .duration(300);

  switch (this.animationType) {
    case 'custom':
      animation.withAnimation({
        open: 'demo-dialog-custom-animation-open',
        close: 'demo-dialog-custom-animation-close'
      });
      break;
    case 'slide':
      animation.withAnimation(this._mdPanel.animation.SLIDE);
      break;
    case 'scale':
      animation.withAnimation(this._mdPanel.animation.SCALE);
      break;
    case 'fade':
      animation.withAnimation(this._mdPanel.animation.FADE);
      break;
  }

  this._mdPanelRef.updateAnimation(animation);

  this._mdPanelRefCtrl.text = text;
  this._mdPanelRef.show();
};


function ReusePanelCtrl(mdPanelRef) {
  this._mdPanelRef = mdPanelRef;
}

ReusePanelCtrl.prototype.$onInit = function() {
  // Register the controller for this panel with the parent controller.
  this._demoCtrl._mdPanelRefCtrl = this;
};

ReusePanelCtrl.prototype.closeDialog = function() {
  this._mdPanelRef && this._mdPanelRef.hide();
};

})();
