angular.module('panelDemo', ['ngMaterial'])
    .controller('BasicDemoCtrl', BasicDemoCtrl)
    .controller('DialogCtrl', DialogCtrl);


function BasicDemoCtrl($mdPanel) {
  this._mdPanel = $mdPanel;
}


BasicDemoCtrl.prototype.showDialog = function() {
  var position = this._mdPanel.newPanelPosition()
      .absolute()
      .top();

  var config = {
    attachTo: angular.element(document.querySelector('.demo-md-panel')),
    controller: DialogCtrl,
    controllerAs: 'ctrl',
    templateUrl: 'panel.tmpl.html',
    locals: {
      closeFn: angular.bind(this, this.closeDialog)
    },
    panelClass: 'demo-dialog-example',
    position: position,
    zIndex: 150
  };

  this._panelRef = this._mdPanel.open(config);
};


BasicDemoCtrl.prototype.closeDialog = function() {
  this._panelRef && this._panelRef.close();
};


// Necessary to pass locals to the dialog template.
function DialogCtrl() { }
