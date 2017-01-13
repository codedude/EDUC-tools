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

angular.module('starter')

.controller('PartieCtrl', [
    '$scope',
    '$ionicModal',
    '$state',
    '$ionicListDelegate',
    '$ionicHistory',
    '$log',
    '$stateParams',
    'ArboFact',
    'Utils',
    'ChoixFact',
    function (
        $scope,
        $ionicModal,
        $state,
        $ionicListDelegate,
        $ionicHistory,
        $log,
        $stateParams,
        ArboFact,
        Utils,
        ChoixFact
    ) {

        $scope.$on('$ionicView.beforeEnter', function () {
            //Pas de refresh sur un back
            if(!ChoixFact.doRefresh()) {
                return false;
            }

            $scope.titre = ChoixFact.getProjet().nom;
            $scope.showPartie = true;
            $scope.showError = false;
            $scope.parties = [];

            var err = update();
            if(typeof err != 'boolean') {
                err.then(function (errs) {
                    if(errs.length > 0) {
                        $scope.showError = true;
                        $scope.initError = errs;
                    }
                });
            }
        });

        function update () {
            var ret = true;
            $scope.parties = [];

            var idProjet = ChoixFact.getProjet().numero;
            var listeParties = ArboFact.getParties(idProjet);
            if(listeParties.length == 0) {
                $scope.showPartie = false;

                return false;
            } else {
                var path = function (partie) {
                    return ChoixFact.getPathProjet()+'/'+partie+'/config.json';
                };

                /*
                    Traite les données au retours de la promesse
                */
                function treat(data) {
                    if(data.type == 'general') {
                        data.image = 'img/general-part.png';
                    }else {
                        data.image = ChoixFact.getPathProjet()+'/partie_'+data.numero+'/'
                        +data.image;
                    }

                    return data;
                }

                var promises = [];
                var errs = [];
                for(var partie in listeParties) {
                    promises.push(Utils.httpq(path(listeParties[partie]))
                        .then(function (data) {
                            $scope.parties.push(treat(data));
                        })
                        .catch(function (data) {
                            errs.push('Fichier '+data.config.url
                                +' introuvable');
                        }));
                }
                /* Attends que toutes les requêtes soient terminées avant de refresh */
                return Utils.qAll(promises).then(function () {
                    return errs;
                });
            }
        }

        /*
            index : index de la partie
        */
        $scope.selectPartie = function (event, index) {
            if($scope.modal.isShown()) {
                $scope.closeModal();
                    //Pas d'anim
                $ionicHistory.nextViewOptions({
                    disableAnimate: true
                });
            }else {
                $ionicListDelegate.closeOptionButtons(false);
            }
            ChoixFact.setPartie($scope.parties[index]);
            ChoixFact.doRefresh(true);
            $state.go('partie', {idPart:index});
        };

        $scope.showDes = function (event, index) {
            event.preventDefault();
            if (event.stopPropagation)
                event.stopPropagation();
            if (event.cancelBubble != null)
                event.cancelBubble = true;

            $ionicListDelegate.closeOptionButtons(false);

            $scope.dataModal = $scope.parties[index];
            $scope.dataModal.index = index;
            openModal();
        };

        $scope.modal = {};
        $ionicModal.fromTemplateUrl('templates/modals/partie.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });
        function openModal() {
            $scope.modal.show();
        };
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });
    }]
);
