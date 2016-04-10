describe('mdInkExplode directive', function() {

    beforeEach(module('material.core'));
    describe('with container specified', function(){
       it('should add the ripple to the correct element', inject(function($compile, $rootScope, $document){
           var containerSelector = '#id',
               containerEl = $compile('<div>')($rootScope.$new()),
               elem = '<div md-ink-explode="'+containerSelector+'"></div>',
               ripple;

           spyOn($document[0], 'querySelector').and.callFake(function() {
               return containerEl;
           });

           expect(containerEl.children().length).toBe(0);
           elem = $compile(elem)($rootScope.$new());
           expect($document[0].querySelector).toHaveBeenCalledWith(containerSelector);

           elem.controller('mdInkExplode').createRipple(0, 0);
           expect(containerEl.children().length).toBe(1);
           ripple = containerEl.children().children();
           expect(ripple.length).toBe(1);

           expect(elem.children().length).toBe(0);
       }));
        it('should observe changes to the container selector', inject(function($compile, $rootScope, $document){
           var container1Sel = '#id',
               container2Sel = '#id2',
               elem = '<div md-ink-explode="'+container1Sel+'"></div>',
               container1El = $compile('<div>')($rootScope.$new()),
               container2El = $compile('<div>')($rootScope.$new()),
               ripple;

            spyOn($document[0], 'querySelector').and.callFake(function(input) {
                if (input == container1Sel){
                    return container1El;
                }else if(input == container2Sel){
                    return container2El;
                }
            });

            elem = $compile(elem)($rootScope.$new());
            var rect = elem[0].getBoundingClientRect();
            var event = {
                srcElement: elem[0],
                clientX: rect.left,
                clientY: rect.top
            };
           elem.controller('mdInkExplode').createRippleFromEvent(event);
           expect($document[0].querySelector).toHaveBeenCalledWith(container1Sel);
           expect(container1El.children().length).toBe(1);
           expect(container2El.children().length).toBe(0);
           ripple = container1El.children().children();
           expect(ripple.length).toBe(1);

            //Switch Attribute
           elem.attr('md-ink-explode', container2Sel);
           //Create another ripple
            elem.controller('mdInkExplode').createRippleFromEvent(event);
           expect($document[0].querySelector).toHaveBeenCalledWith(container2Sel);
            //Should remove the first container
           expect(container1El.children().length).toBe(0);
           expect(container2El.children().length).toBe(1);
           ripple = container2El.children().children();
           expect(ripple.length).toBe(1);
       }));
    });
    describe('animations', function(){
        var elem, containerEl, ripple, $window, $timeout;
        beforeEach(inject(function($compile, $rootScope, $document, _$window_, _$timeout_){
            $window = _$window_;
            $timeout = _$timeout_;
            elem = '<div md-ink-explode="#id"></div>';
            containerEl = $compile('<div>')($rootScope.$new());

            spyOn($document[0], 'querySelector').and.callFake(function(input) {
                return containerEl;
            });
            elem = $compile(elem)($rootScope.$new());

            elem.controller('mdInkExplode').createRipple(0, 0);
            ripple = containerEl.children().children();
        }));
        it('should start small', function(){
            var rect = ripple[0].getBoundingClientRect();
            expect(rect.width).toBe(0);
            expect(rect.height).toBe(0);
            expect(ripple.hasClass('md-ripple-explode')).toBeTruthy();
            expect(ripple.hasClass('md-ripple-placed')).toBeTruthy();
        });
        it('should add scaled class', function(){
            $timeout.flush(1);
            expect(ripple.hasClass('md-ripple-scaled')).toBeTruthy();
            expect(ripple.hasClass('md-ripple-active')).toBeTruthy();
        });
    })
});
