(function() {
'use strict';

angular.module('panelAnimationsDemo', ['ngMaterial'])
    .controller('AnimationCtrl', AnimationCtrl)
    .controller('DialogCtrl', DialogCtrl);


function AnimationCtrl($mdPanel) {
  this._mdPanel = $mdPanel;
  this.openFrom = 'button';
  this.closeTo = 'button';
  this.animationType = 'scale';
  this.duration = 300;
  this.separateDurations = {
    open: this.duration,
    close: this.duration
  };
}


AnimationCtrl.prototype.showDialog = function() {
  var position = this._mdPanel.newPanelPosition()
      .absolute()
      .right()
      .top();

  var animation = this._mdPanel.newPanelAnimation();

  animation.duration(this.duration || this.separateDurations);

  switch(this.openFrom) {
    case 'button':
      animation.openFrom('.animation-target');
      break;
    case 'corner':
      animation.openFrom({top:0, left:0});
      break;
    case 'bottom':
      animation.openFrom({
        top: document.documentElement.clientHeight,
        left: document.documentElement.clientWidth / 2 - 250
      });
  }
  switch(this.closeTo) {
    case 'button':
      animation.closeTo('.animation-target');
      break;
    case 'corner':
      animation.closeTo({top:0, left:0});
      break;
    case 'bottom':
      animation.closeTo({
        top: document.documentElement.clientHeight,
        left: document.documentElement.clientWidth / 2 - 250
      });
  }

  switch(this.animationType) {
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
    case 'none':
      animation = undefined;
      break;
  }

  var config = {
    animation: animation,
    attachTo: angular.element(document.body),
    controller: DialogCtrl,
    controllerAs: 'ctrl',
    templateUrl: 'panel.tmpl.html',
    panelClass: 'demo-dialog-example',
    position: position,
    trapFocus: true,
    zIndex: 150,
    clickOutsideToClose: true,
    clickEscapeToClose: true,
    hasBackdrop: true,
  };

  this._mdPanel.open(config);
};


// Necessary to pass locals to the dialog template.
function DialogCtrl(mdPanelRef) {
  this._mdPanelRef = mdPanelRef;
}

DialogCtrl.prototype.closeDialog = function() {
  this._mdPanelRef && this._mdPanelRef.close();
};

})();
