angular.module('datepickerMomentJs', ['ngMaterial'])
    .config(function($mdDateLocaleProvider) {
      console.log(window.moment ? 'moment loaded' : 'not loaded');
      //moment.locale('fr');
      //$mdDateLocaleProvider.months = moment.months();
      //$mdDateLocaleProvider.months = moment.monthsShort();
      //$mdDateLocaleProvider.days = moment.weekdays();
      //$mdDateLocaleProvider.shortDays = moment.weekdaysMin();
      //
      //$mdDateLocaleProvider.parseDate = function(dateString) {
      //  return moment(dateString).toDate();
      //};
      //
      //$mdDateLocaleProvider.formatDate = function(date) {
      //  return moment(date).format('L');
      //};
      //
      //$mdDateLocaleProvider.longDateFormatter = function(date) {
      //  return moment(date).format('LL');
      //};
      //
      //$mdDateLocaleProvider.monthHeaderFormatter = function(date) {
      //  moment.monthsShort()[date.getMonth()] + ' ' + date.getFullYear();
      //};
      //
      //$mdDateLocaleProvider.weekNumberFormatter = function(weekNumber) {
      //  return 'Semaine ' + weekNumber;
      //};

    })
    .controller('AppCtrl', function($scope) {
      $scope.myDate = new Date();

      $scope.adjustMonth = function(delta) {
        $scope.myDate = new Date(
            $scope.myDate.getFullYear(),
            $scope.myDate.getMonth() + delta,
            $scope.myDate.getDate());
      };
    });

