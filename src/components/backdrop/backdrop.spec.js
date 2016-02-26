describe('mdBackdrop directive', function() {

    beforeEach(module('material.components.backdrop'));

    it('should set the backdrops height to the same as its parent', inject(function($rootScope, $mdUtil) {
        var parent = angular.element('<div style="height: 1000px"></div>');
        var backdrop = $mdUtil.createBackdrop($rootScope);
        var backdropCtrl = backdrop.controller('mdBackdrop');

        parent.append(backdrop);

        // We need to add the parent to the DOM, otherwise we can't measure the clientHeight`
        document.body.appendChild(parent[0]);

        backdropCtrl.fillParentHeight();

        expect(backdrop.css('height')).toBe('1000px');

        // Remove the element from the DOM to prevent issues with other tests
        document.body.removeChild(parent[0]);
    }));

});