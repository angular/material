angular.module('panelAnimationsDemo', ['ngMaterial'])
    .controller('AnimationCtrl', AnimationCtrl)
    .controller('DialogCtrl', DialogCtrl);


function AnimationCtrl($mdPanel) {
  this._mdPanel = $mdPanel;
  this.openFrom = 'button';
  this.closeTo = 'button';
  this.animationType = 'none';
}


AnimationCtrl.prototype.showDialog = function() {
  var position = this._mdPanel.newPanelPosition()
      .absolute()
      .right()
      .top();

  var animation = this._mdPanel.newPanelAnimation();

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
  if (this.animationType === 'custom') {
    animation.withAnimation({
      open: 'demo-dialog-custom-animation-open',
      close: 'demo-dialog-custom-animation-close'
    });
  } else {
    animation.withAnimation(this.animationType);
  }

  var config = {
    animation: this.animationType !== 'none' ? animation : undefined,
    attachTo: angular.element(document.querySelector('.demo-md-panel-animation')),
    controller: DialogCtrl,
    controllerAs: 'ctrl',
    templateUrl: 'panel.tmpl.html',
    locals: {
      closeFn: angular.bind(this, this.closeDialog)
    },
    panelClass: 'demo-dialog-example',
    position: position,
    trapFocus: true,
    zIndex: 150
  };

  this._panelRef = this._mdPanel.open(config);
};


AnimationCtrl.prototype.closeDialog = function() {
  this._panelRef && this._panelRef.close();
};


// Necessary to pass locals to the dialog template.
function DialogCtrl() { }
