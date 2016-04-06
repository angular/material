angular.module('panelDemo', ['ngMaterial'])
    .controller('BasicDemoCtrl', BasicDemoCtrl)
    .controller('PanelDialogCtrl', PanelDialogCtrl);


function BasicDemoCtrl($mdPanel) {
  this._mdPanel = $mdPanel;
}


BasicDemoCtrl.prototype.showDialog = function() {
  var position = this._mdPanel.newPanelPosition()
      .absolute()
      .left()
      .top();

  var config = {
    attachTo: angular.element(document.querySelector('.demo-md-panel')),
    controller: PanelDialogCtrl,
    controllerAs: 'ctrl',
    templateUrl: 'panel.tmpl.html',
    panelClass: 'demo-dialog-example',
    position: position,
    trapFocus: true,
    zIndex: 150
  };

  this._panelRef = this._mdPanel.open(config);
};


// Necessary to pass locals to the dialog template.
function PanelDialogCtrl(mdPanelRef) {
  this._mdPanelRef = mdPanelRef;
}


PanelDialogCtrl.prototype.closeDialog = function() {
  this._mdPanelRef && this._mdPanelRef.close();
};
