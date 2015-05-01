
angular.module('dataTableDemo', ['ngMaterial'])
.controller('AppCtrl', function($animate, $document, $scope, $window) {
  var ROW_HEIGHT = 40;
  var CONTAINER_HEIGHT = 300;
  var HEADER_OFFSET = 1;
  
  this.allRows = []
  for (var i = 0; i < 1000; i++) {
    this.allRows.push(i);
  }
  
  this.cols = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  this.rows = [];
  this.logicalRows = [];

  // Returns whether the rowset changed.
  this.prevStart = 0;
  this.prevEnd = 0;
  
  this.updateRows = function updateRows(opt_height, opt_scrollTop) {
    var containerHeight = opt_height == null ? scrolly.clientHeight : opt_height;
    var scrollTop = opt_scrollTop == null ? scrolly.scrollTop : opt_scrollTop;
    var start = Math.floor(scrollTop / ROW_HEIGHT);
    var end = Math.floor((scrollTop + containerHeight) / ROW_HEIGHT);

    if (this.prevStart === start && this.prevEnd === end) {
      return 0;
    }
    
    var prevStart = this.prevStart;
    this.prevStart = start;
    this.prevEnd = end;
    this.logicalRows = this.allRows.slice(start, end);
    // We're just assuming the the size never changes at this point
    return start - prevStart;
  };

  var $element = angular.element($document[0].querySelector('.grid-a'));
  var sizery = $element[0].querySelector('.sizery');
  var scrolly = $element[0].querySelector('.scrolly');
  var scrollx = $element[0].querySelector('.scrollx');
  var scrollxTable = $element[0].querySelector('.scrollx > table');
  var stickyTable = $element[0].querySelector('.sticky > table');
  var headerScrollx = $element[0].querySelector('.header-scrollx');

  sizery.style.height = (ROW_HEIGHT * this.allRows.length) + 'px';
  this.updateRows(CONTAINER_HEIGHT, 0);
  this.rows = this.logicalRows;

  // Disable ng-animate for the table.
  // In reality, what we'll need to do is have a custom ng-repeat that does
  // not hook up to ng-animate so that we are not blocking the table's contents
  // from animating.
  // $animate.enabled($element, false);
  $animate.enabled(false);

  var animationIdX;
  angular.element(scrollx).on('scroll', function() {
    $window.cancelAnimationFrame(animationIdX);
    animationIdX = $window.requestAnimationFrame(function animatex() {
      var scrollLeft = scrollx.scrollLeft;

      var transform = 'translateX(' + -scrollLeft + 'px)';
      headerScrollx.style.webkitTransform = transform;
      headerScrollx.style.transform = transform;
    });
  }.bind(this));

  var animationIdY;
  angular.element(scrolly).on('scroll', function () {
    $window.cancelAnimationFrame(animationIdY);
    animationIdY = $window.requestAnimationFrame(function animatey() {
      var scrollTop = scrolly.scrollTop;

      var stickyTransform = 'translateY(' + -(scrollTop % ROW_HEIGHT) + 'px)';
      var scrollxTransform = 'translateY(' + -(HEADER_OFFSET + scrollTop % ROW_HEIGHT) + 'px)';
      stickyTable.style.webkitTransform = stickyTransform;
      stickyTable.style.transform = stickyTransform;
      scrollxTable.style.webkitTransform = scrollxTransform;
      scrollxTable.style.transform = scrollxTransform;
      if (this.updateRows(CONTAINER_HEIGHT, scrollTop)) {
        this.rows = this.logicalRows;
        $scope.$digest();
      }

      // stickyTable.style.transform = 'translateY(' + -(scrollTop % ROW_HEIGHT) + 'px)';
//       scrollxTable.style.transform = 'translateY(' + -(HEADER_OFFSET + scrollTop % ROW_HEIGHT) + 'px)';
//
      if (this.updateRows(CONTAINER_HEIGHT, scrollTop)) {
        // var getSwapDistance = function(array1, array2, maxSwap) {
//           maxSwap = maxSwap || 10;
//           for (var swapDistance = maxSwap; swapDistance > 0; swapDistance--) {
//             var swap = true;
//
//             for (var idx = 0, end = array1.length - swapDistance; idx < end; idx++) {
//               if (array1[idx + swapDistance] !== array2[idx]) {
//                 swap = false;
//                 break;
//               }
//             }
//
//             if (swap) {
//               return swapDistance;
//             }
//           }
//
//           return 0;
//         };

        
        
        // $scope.$digest();
      }
    }.bind(this));
  }.bind(this));
  
  var mousewheel = function mousewheel(evt) {
    scrolly.scrollTop += evt.deltaY;
    scrollx.scrollLeft += evt.deltaX;
    evt.preventDefault();
  };
  angular.element(stickyTable).on('wheel', mousewheel);
  angular.element(scrollxTable).on('wheel', mousewheel);
  
  // Also would need to do touch momentum scrolling (and probably cancel wheel handling in those cases)
});
