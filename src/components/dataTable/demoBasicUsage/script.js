
angular.module('dataTableDemo', ['ngMaterial'])
.controller('AppCtrl', function($document, $scope) {
  var ROW_HEIGHT = 40;
  var CONTAINER_HEIGHT = 300;
  
  this.allRows = []
  for (var i = 0; i < 1000; i++) {
    this.allRows.push(i);
  }
  
  this.cols = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  this.rows = [];

  // Returns whether the rowset changed.
  this.prevStart = 0;
  this.prevEnd = 0;
  
  this.updateRows = function(opt_height, opt_scrollTop) {
    var containerHeight = opt_height == null ? scrolly.clientHeight : opt_height;
    var scrollTop = opt_scrollTop == null ? scrolly.scrollTop : opt_scrollTop;
    var start = scrollTop / ROW_HEIGHT;
    var end = (scrollTop + containerHeight) / ROW_HEIGHT;

    if (this.prevStart === start && this.prevEnd === end) {
      return false;
    }
    
    this.rows = this.allRows.slice(start, end);
    console.log(this.rows);
    return true;
  };

  var $element = angular.element($document[0].querySelector('.grid-a'));
  var sizery = $element[0].querySelector('.sizery');
  var scrolly = $element[0].querySelector('.scrolly');
  var scrollx = $element[0].querySelector('.scrollx');
  var scrollxTable = $element[0].querySelector('.scrollx > table');
  var stickyTable = $element[0].querySelector('.sticky > table');
  var headerScrollx = $element[0].querySelector('.header-scrollx');

  sizery.style.height = ROW_HEIGHT * this.allRows.length;
  this.updateRows(CONTAINER_HEIGHT);

  angular.element(scrollx).on('scroll', function() {
    var scrollLeft = scrollx.scrollLeft;

    // angular.element(header.querySelectorAll('th:nth-last-child(-n+8)'))
    //     .css('transform', 'translateX(' + -scrollLeft + 'px)');
    headerScrollx.style.transform = 'translateX(' + -scrollLeft + 'px)';
  }.bind(this));

  angular.element(scrolly).on('scroll', function() {
    var scrollTop = scrolly.scrollTop;
    
    // stickyTable.style.transform = 'translateY(' + -scrollTop + 'px)';
    // scrollxTable.style.transform = 'translateY(' + -scrollTop + 'px)';
    
    stickyTable.style.transform = 'translateY(' + -(scrollTop % ROW_HEIGHT) + 'px)';
    scrollxTable.style.transform = 'translateY(' + -(scrollTop % ROW_HEIGHT) + 'px)';
    if (this.updateRows(CONTAINER_HEIGHT, scrollTop)) {
      $scope.$digest();
    }
  }.bind(this));
});
