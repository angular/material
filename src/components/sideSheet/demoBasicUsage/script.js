angular.module('sideSheetDemo1', ['ngMaterial'])
    .config(function ($mdIconProvider) {
        $mdIconProvider
            .icon('share-arrow', 'img/icons/share-arrow.svg', 24)
            .icon('upload', 'img/icons/upload.svg', 24)
            .icon('copy', 'img/icons/copy.svg', 24)
            .icon('print', 'img/icons/print.svg', 24)
            .icon('hangout', 'img/icons/hangout.svg', 24)
            .icon('mail', 'img/icons/mail.svg', 24)
            .icon('message', 'img/icons/message.svg', 24)
            .icon('copy2', 'img/icons/copy2.svg', 24)
            .icon('facebook', 'img/icons/facebook.svg', 24)
            .icon('twitter', 'img/icons/twitter.svg', 24);
    })

    .controller('SideSheetExample', function ($scope, $timeout, $mdSideSheet) {

        $scope.showAutoSideSheet = function ($event) {
            $mdSideSheet.show({
                side: 'auto',
                templateUrl: 'side-sheet-list-template.html',
                controller: 'ListSideSheetCtrl',
                targetEvent: $event
            });
        };

        $scope.showListSideSheet = function ($event) {
            $mdSideSheet.show({
                side: 'left',
                clickOutsideToClose: false,
                escapeToClose: true,
                hasBackdrop: true,
                //parent: angular.element(document.getElementsByTagName('body')),
                templateUrl: 'side-sheet-list-template.html',
                controller: 'ListSideSheetCtrl',
                targetEvent: $event
            });
        };

        $scope.showGridSideSheet = function ($event) {
            $mdSideSheet.show({
                side: 'right',
                templateUrl: 'side-sheet-grid-template.html',
                controller: 'GridSideSheetCtrl',
                targetEvent: $event
            });
        };
    })

    .controller('ListSideSheetCtrl', function ($scope, $mdSideSheet) {

        $scope.items = [
            {name: 'Share', icon: 'share-arrow'},
            {name: 'Upload', icon: 'upload'},
            {name: 'Copy', icon: 'copy'},
            {name: 'Print this page', icon: 'print'}
        ];

        $scope.listItemClick = function ($index) {
            var clickedItem = $scope.items[$index];
            $mdSideSheet.hide(clickedItem);
        };
    })

    .controller('GridSideSheetCtrl', function ($scope, $mdSideSheet) {
        $scope.items = [
            {name: 'Hangout', icon: 'hangout'},
            {name: 'Mail', icon: 'mail'},
            {name: 'Message', icon: 'message'},
            {name: 'Copy', icon: 'copy2'},
            {name: 'Facebook', icon: 'facebook'},
            {name: 'Twitter', icon: 'twitter'},
        ];

        $scope.listItemClick = function ($index) {
            var clickedItem = $scope.items[$index];
            $mdSideSheet.hide(clickedItem);
        };
    })

    .run(function ($http, $templateCache) {

        var urls = [
            'img/icons/share-arrow.svg',
            'img/icons/upload.svg',
            'img/icons/copy.svg',
            'img/icons/print.svg',
            'img/icons/hangout.svg',
            'img/icons/mail.svg',
            'img/icons/message.svg',
            'img/icons/copy2.svg',
            'img/icons/facebook.svg',
            'img/icons/twitter.svg'
        ];

        angular.forEach(urls, function (url) {
            $http.get(url, {cache: $templateCache});
        });

    });
