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

.controller('HomeCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    '$ionicSlideBoxDelegate',
    '$q',
    '$log',
    '$ionicHistory',
    '$ionicModal',
    '$ionicPopup',
    'ArboFact',
    'Utils',
    'ChoixFact',
    'ScanRoot',
    function(
        $scope,
        $rootScope,
        $state,
        $ionicSlideBoxDelegate,
        $q,
        $log,
        $ionicHistory,
        $ionicModal,
        $ionicPopup,
        ArboFact,
        Utils,
        ChoixFact,
        ScanRoot
    ) {
        $scope.titre = 'Projets EDUC-tools';

        $scope.showProjet = false;
        $scope.showSpinner = true;
        $scope.showError = false;

        $scope.projets = [];
        var listeProjets = [];

        $scope.goApropos = function () {
            $state.go('apropos');
        };


        if(!ChoixFact.doRefresh()) {
            return false;
        }

        /*
            Récupération de l'arborescence
        */
        //Asyn scan !!! Will set Arbo later
        ScanRoot.scan(function (data) {
            $scope.dirRoot = Utils.getDirRoot();

            if(data.error != undefined) {
                ArboFact.set({});
                $scope.$apply(function () {
                    $scope.scanError = data.error;
                    //console.log(data.error);
                    $scope.showError = true;
                });
            }else {
                ArboFact.set(data);
                listeProjets = ArboFact.getProjets();
                updateProjets();
            }

        });

        function updateProjets() {
            if(listeProjets.length == 0) {
                $scope.showProjet = false;
            } else {
                /*
                    Traite les données au retours de la promesse
                */

                var promises = [];
                var errs = [];
                for(var projet in listeProjets) {
                    promises.push(Utils.httpq(Utils.getRoot()
                        +listeProjets[projet]
                        +'/config.json')
                        .then(function (data) {
                            $scope.projets.push(treat(data));
                        })
                        .catch(function (data) {
                            var id = data.config.url.split('_')[1][0];
                            errs.push('Projet '+id+' invalide (fichier '
                                +data.config.url+' introuvable)');
                        }));
                }
                /* Attends que toutes les requêtes soient terminées avant de refresh */
                Utils.qAll(promises).then(function () {
                    if(errs.length > 0) {
                        $scope.showInitError = true;
                        $scope.initError = errs;
                    }
                    $scope.showSpinner = false;
                    $scope.showProjet = true;
                    $ionicSlideBoxDelegate.update();
                });
            }
        };

        function treat(data) {
            if(data.image.length == 0) {
                data.image = 'img/defaut-projet.png';
            }else {
                data.image = Utils.getRoot()+'projet_'+data.numero+'/'
                +data.image;
            }

            if(data.description.length == 0) {
                data.description = 'Aucune description';
            }

            Utils.httpq(Utils.getRoot()+'projet_'+data.numero
            +'/res/info.json')
            .then(function (resp) {

                data.auteurs = [];
                data.sources = [];
                data.contacts = [];

                var el;
                for(el in resp.author) {
                    var auth = resp.author[el];
                    if(auth.email.length > 0) {
                        auth.email = ['(', auth.email, ')']
                        .join('');
                    }
                    if(auth.description.length > 0) {
                        auth.description = [': ', auth.description]
                        .join('');
                    }
                    data.auteurs.push(auth);
                }
                data.auteurs.team = data.auteurs.map( el => el.nom)
                .join(' - ');
                if(data.auteurs.team.length == 0) {
                    data.auteurs.team = ' - ';
                }

                for(el in resp.source) {
                    var source = resp.source[el];

                    if(source.src.length == 0) {
                        source.src = 'img/defaut-source.png';
                    }else {
                        source.src = Utils.getRoot()+'projet_'+data.numero
                        +'/res/'+source.src;
                    }

                    if(source.description.length == 0) {
                        source.description = 'Aucune description';
                    }

                    data.sources.push(source);
                }

                for(el in resp.contact) {
                    var contact = resp.contact[el];

                    contact.partner = (contact.partner == 'true') ? true:false;
                    data.contacts.push(contact);
                }
            })
            .catch(function (datas) {
                data.error = 'Informations indisponibles (fichier '
                    +datas.config.url+' introuvable)';
            });

            return data;
        }

        /*
            index : index du carrousel (0, ...)
        */
        $scope.selectProjet = function (event, index) {
            //Clic sur le + du projet
            if(event.target.id == 'DoNotFire') {
                event.preventDefault();
                return false;
            }
            if($scope.modal.isShown()) {
                $scope.closeModal();
            }
            ChoixFact.setProjet($scope.projets[index]);
            ChoixFact.doRefresh(true);
            $state.go('projet');
        };

        /*
            Ouvre une modal avec le détail du projet
        */

        $scope.modal = {};
        $scope.showProjetModal = function (event, index) {
            event.preventDefault();
            if (event.stopPropagation)
                event.stopPropagation();
            if (event.cancelBubble != null)
                event.cancelBubble = true;

            if($scope.projets[index].error != undefined) {
                showAlert($scope.projets[index].error);
                return false;
            }
            $scope.dataModal = $scope.projets[index];
            $scope.dataModal.index = index;
            openModal();

            return false;
        };
        var showAlert = function(err) {
            var alertPopup = $ionicPopup.alert({
                title: 'Aucune information',
                template:
                    'Message d\'erreur :<br />'
                    +'<span class="assertive">'+err+'</span>'
            });
        };

        $ionicModal.fromTemplateUrl('templates/modals/projet.html', {
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
