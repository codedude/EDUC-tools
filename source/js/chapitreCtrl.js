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

.controller('ChapitreCtrl', [
    '$scope',
    '$log',
    '$ionicModal',
    '$state',
    '$ionicListDelegate',
    '$ionicHistory',
    '$stateParams',
    'ArboFact',
    'Utils',
    'ChoixFact',
    function (
        $scope,
        $log,
        $ionicModal,
        $state,
        $ionicListDelegate,
        $ionicHistory,
        $stateParams,
        ArboFact,
        Utils,
        ChoixFact
    ) {
        //Pas de refresh sur un back
        if(!ChoixFact.doRefresh()) {
            return false;
        }

        $scope.$on('$ionicView.beforeEnter', function () {

            $scope.titre = ChoixFact.getPartie().nom;
            $scope.showChapitre = true;
            $scope.showError = false;
            $scope.listeChapitres = [];

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
            var idProjet = ChoixFact.getProjet().numero;
            var idPartie = ChoixFact.getPartie().numero;
            var listeChapitres = ArboFact.getChapitres(idProjet, idPartie);

            if(listeChapitres.length == 0) {
                $scope.showChapitre = false;
                return false;
            } else {
                var path = function (chapitre) {
                    return ChoixFact.getPathPartie()+'/'+chapitre
                        +'/config.json';
                };


                /*
                    Traite les données au retours de la promesse
                */
                function treat(data) {
                    if(data.image == undefined || data.image.length == 0) {
                        data.image = 'img/defaut-chapitre.png';
                    }else {
                        data.image = ChoixFact.getPathPartie()+'/chapitre_'+data.numero+'/'
                        +data.image;
                    }

                    return data;
                }

                var promises = [];
                var errs = [];
                for(var chapitre in listeChapitres) {
                    promises.push(Utils.httpq(path(listeChapitres[chapitre]))
                        .then(function (data) {
                            $scope.listeChapitres.push(treat(data));
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
            index : index du chapitre
        */
        $scope.selectChapitre = function (event, index) {
            if(event.target.nodeName == 'ION-ITEM')
                return false;
            if($scope.modal.isShown()) {
                $scope.closeModal();
                //Pas d'anim
                $ionicHistory.nextViewOptions({
                    disableAnimate: true
                });
            }else {
                $ionicListDelegate.closeOptionButtons(false);
            }
            ChoixFact.setChapitre($scope.listeChapitres[index]);
            ChoixFact.doRefresh(true);
            if(ChoixFact.getPartie().numero == 0) {
                $state.go('tp.page', {id: index});
            }else {
                $state.go('tp.page');
            }
        };

        $scope.showDes = function (event, index) {
            event.preventDefault();
            if (event.stopPropagation)
                event.stopPropagation();
            if (event.cancelBubble != null)
                event.cancelBubble = true;

            $ionicListDelegate.closeOptionButtons(false);

            $scope.dataModal = $scope.listeChapitres[index];
            $scope.dataModal.index = index;
            openModal();
        };
        $scope.modal = {};

        $ionicModal.fromTemplateUrl('templates/modals/chapitre.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });
        function openModal() {
            $scope.modal.show();
        }
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });
    }
]);
