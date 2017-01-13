/*
This file is part of EDUC-tools.

    EDUC-tools is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    EDUC-tools is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with EDUC-tools.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
    Other pages like 'A propos'...
*/

angular.module('starter')


.controller('AproposCtrl', [
    '$scope',
    '$ionicHistory',
    '$ionicModal',
    '$cordovaEmailComposer',
    '$ionicPopup',
    '$cordovaClipboard',
    '$timeout',
    'ChoixFact',
    'Utils',
    function(
        $scope,
        $ionicHistory,
        $ionicModal,
        $cordovaEmailComposer,
        $ionicPopup,
        $cordovaClipboard,
        $timeout,
        ChoixFact,
        Utils
    ) {
        $scope.version = Utils.getVersion();
        $scope.date = Utils.getVerDate();

        function genBegDebug () {
            var i = Utils.debugInfos();

            var debug = [];
            debug.push('########################################');
            debug.push('Debug report : '+i.date);
            debug.push('');

            debug.push('Platform : '+i.device.platform);
            debug.push('Version : '+i.device.version);
            debug.push('Manufacturer : '+i.device.manufacturer);
            debug.push('Model : '+i.device.model);
            debug.push('Cordova : '+i.device.cordova);
            debug.push('Virtual : '+i.device.isVirtual);
            debug.push('Desktop : '+i.desktop);
            debug.push('Version EDUC-tools : '+Utils.getVersion());
            debug.push('');

            debug.push('User report :');
            debug.push('');

            return debug.join('\n');
        }
        function genEndDebug () {
            var debug = [];
            debug.push('');
            debug.push('');
            debug.push('End of report');
            debug.push('########################################');

            return debug.join('\n');
        }

        $scope.sendBug = function (userReport) {
            if(userReport.length < 16) {
                showAlertEmpty();
                return false;
            }
            var fullReport = [
                $scope.bug.begRapport,
                userReport,
                $scope.bug.endRapport,
            ];
            fullReport = fullReport.join('\n');

            /*
                Envoi du mail
            */
            if(Utils.isInternet()) {
                var email = {
                    to: 'codedude.app@gmail.com',
                    attachments: [],
                    subject: '[EDUC-tools] Debug report',
                    body: fullReport,
                    isHtml: false
                };
                $cordovaEmailComposer.isAvailable().then(function() {
                    $cordovaEmailComposer.open(email).then(function () {
                        $scope.closeBug();
                    },
                    function () {
                        //user cancelled email
                        $scope.closeBug();
                    });
                }, function () {
                    showAlertEmail()
                });
            }else {
                showAlertInternet();
            }
        };
        var showAlertInternet = function() {
            var alertPopup = $ionicPopup.alert({
                title: 'Aucune connexion',
                template:
                    'Vous n\'êtes pas connecté à internet'
            });
        };
        var showAlertEmail = function() {
            var alertPopup = $ionicPopup.alert({
                title: 'Echec de l\'envoi',
                template: 'Service indisponible'
            });
        };
        var showAlertEmpty = function() {
            var alertPopup = $ionicPopup.alert({
                title: 'Rapport incomplet',
                template:
                    'L\'explication du bug doit contenir au moins 16 caractères'
            });
        };

        var showInfoCopy = function (msg) {
            var myPopup = $ionicPopup.show({
                template: msg,
                title: 'Presse-papier',
                scope: $scope,
            });
            $timeout(function() {
                myPopup.close();
            }, 1000);
        };

        $scope.bug = {
            titre: 'Rapport de bug',
        };

        $ionicModal.fromTemplateUrl('templates/modals/apropos.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });
        $scope.openBug = function() {
            $scope.bug.begRapport = genBegDebug();
            $scope.bug.endRapport = genEndDebug();
            $scope.modal.show();
        };
        $scope.closeBug = function() {
            $scope.modal.hide();
        };
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });

        $scope.copyToClipboard = function (userReport) {
            if(userReport.length < 16) {
                showAlertEmpty();
                return false;
            }
            var fullReport = [
                $scope.bug.begRapport,
                userReport,
                $scope.bug.endRapport,
            ];
            fullReport = fullReport.join('\n');
            $cordovaClipboard.copy(fullReport,
                function () {
                    showInfoCopy('Copie réussie');
                }, function () {
                    showInfoCopy('Echec de la copie');
                });
        };

        /*
            Manually go back
        */
        $scope.goBack = function () {
            ChoixFact.doRefresh(false);
            $ionicHistory.goBack();
        }
}]);

