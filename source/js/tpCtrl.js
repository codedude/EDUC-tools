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

.controller('TpCtrl', [
    '$scope',
    '$stateParams',
    '$ionicScrollDelegate',
    '$ionicModal',
    '$ionicHistory',
    '$cordovaFileOpener2',
    '$ionicPopup',
    '$cordovaInAppBrowser',
    '$cordovaZip',
    '$sce',
    'ChoixFact',
    'Utils',
    'Courses',
    function(
        $scope,
        $stateParams,
        $ionicScrollDelegate,
        $ionicModal,
        $ionicHistory,
        $cordovaFileOpener2,
        $ionicPopup,
        $cordovaInAppBrowser,
        $cordovaZip,
        $sce,
        ChoixFact,
        Utils,
        Courses
    ) {

        $scope.idCours = 0;
        $scope.tps = {};
        $scope.chapitre = {};
        $scope.showError = false;

        $scope.$on('$ionicView.beforeEnter', function () {
            $ionicScrollDelegate.scrollTop(false);
            //Pas de refresh sur un back
            if(!ChoixFact.doRefresh()) {
                return false;
            }

            //Cours
            if($stateParams.id.length > 0) {
                $scope.idCours = parseInt($stateParams.id) + 1;
                $scope.chapitre = Courses.get($stateParams.id)
                    .then(function (data) {
                        if(data.error != undefined) {
                            $scope.showError = true;
                            $scope.initError = data.error;
                        }
                        else {
                            $scope.chapitre = data.course;
                            $scope.titre = $scope.chapitre.nom;
                        }

                    });
            }
            //Chapitre classique
            else {
                $scope.idCours = 0;
                $scope.titre = ChoixFact.getChapitre().nom;
            }



            update();
        });

        $scope.to_trusted = function(html_code) {
            return $sce.trustAsHtml(html_code);
        };

        /*
            Récupère les données du tp en cours
        */
        function update () {
            var path;
            if($scope.idCours > 0) {
                path = ChoixFact.getPathProjet()
                    +'/partie_0'
                    +'/chapitre_'+$scope.idCours
                    +'/tp.json';
            }
            else {
                path = ChoixFact.getPathChapitre()
                    +'/tp.json'
            }
            Utils.httpq(path)
                .then(function (data) {
                    $scope.tps = treat(data);
                })
                .catch(function (data) {
                    $scope.showError = true;
                    $scope.initError = ['Fichier '+data.config.url
                    +' introuvable'];
                })
        }

        function treat(data) {
            data = data.tp;

            /*
                Dynamicaly load templates
            */
            for(var d in data) {
                /*
                    Url du template
                */
                data[d].template = './templates/tp/'+data[d].type+'.html';

                /*
                    Modifie les urls de ressources
                */
                if(data[d].type == 'image' || data[d].type == 'video' ||
                    data[d].type == 'son' || data[d].type == 'objet'
                    || data[d].type == 'html') {

                    if($scope.idCours > 0) {
                        data[d].src = ChoixFact.getPathProjet()+'/'
                            +'partie_0/chapitre_'+$scope.idCours+'/'
                            +data[d].type+'/'+data[d].src;
                    }else {
                        data[d].src = ChoixFact.getPathChapitre()+'/'
                            +data[d].type+'/'+data[d].src;
                    }

                    if(data[d].source.length == 0) {
                        data[d].source = ' - ';
                    }
                }
                if(data[d].type == 'image') {
                    data[d].openImg = openImg;
                }
                if(data[d].type == 'objet') {
                    data[d].openFile = openFile(data[d].src, data[d].mime);

                    /*
                        Logo à afficher
                    */
                    var type = data[d].mime.split('/')[1];
                    var logo;
                    switch(type) {
                        case 'ifc':
                            logo='ifc';
                            break;
                        case 'tbp':
                            logo='teklabim';
                            break;

                        case 'pdf':
                            logo='pdf';
                            break;

                        case 'xls':case 'xlsx':
                            logo='excel';
                            break;
                        case 'doc':case 'docx':
                            logo='word';
                            break;
                        case 'ppt':case 'pptx':
                            logo='powerpoint';
                            break;

                        case 'jpeg':
                        case 'jpg':
                        case 'png':
                        case 'gif':
                            logo = 'image';
                            break;

                        case 'mp4':
                            logo = 'video';
                            break;

                        case 'mp3':
                        case 'ogg':
                            logo = 'son';
                            break;

                        default:
                            logo = 'defaut';
                            break;
                    }
                    data[d].image = 'img/logo_'+logo+'.png';
                }

                if(data[d].type == 'lien') {
                    data[d].openLink = openLink(data[d].lien);
                }
                if(data[d].type == 'html') {
                    //On ouvre le index.html dans le dossier html/dossier/index.html
                    data[d].openHtml = openHtml(data[d].src.replace(".zip", "")
                        +'/index.html');
                    data[d].image = 'img/logo_html.png';

                    //Que sur mobile
                    if(ionic.Platform.isWebView()) {
                        /*
                            Vérifier si le dossier existe, sinon le dézipper
                            Puis changer le .src
                        */
                        window.resolveLocalFileSystemURL(data[d].src.replace(".zip", ""),
                            //Le dossier existe, rien à faire
                            null,
                            //Le dossier n'existe pas, on le dézippe
                            //Et on supprime le .zip
                            function () {
                                //On récupère juste le nom du dossier
                                var dir = data[d].src.split('/');
                                delete dir[dir.length-1];
                                dir = dir.join('/');
                                unzip(data[d].src, dir);
                            }
                        );
                    }
                }
                if(data[d].type == 'texte') {
                    data[d].texte = $sce.trustAsHtml(formatText(data[d].texte));
                }
            }

            return data;
        }
        var tags = {
            'g': 'bold',
            'i': 'italic',
            's': 'underline',
            'grand': 'bigger',
            'petit': 'smaller',
            'exp': 'sup',
            'ind': 'sub',
            'item': 'item',
            'uitem': 'uitem',
            'rouge': 'red',
            'vert': 'green',
            'bleu': 'blue'
        };

        function formatText(txt) {
            var el = document.createElement('div');
            el.innerHTML = txt;
            txt = el.innerText;
            var re = new RegExp('<nl/>', 'g');
            txt = txt.replace(re, '<br />');

            for(var tag in tags) {
                re = new RegExp('<'+tag+'>', 'g');
                txt = txt.replace(re, '<span class="tp_'+tags[tag]+'">');
                re = new RegExp('</'+tag+'>', 'g');
                txt = txt.replace(re, '</span>');
            }

            return txt;
        }

        /*
            file : url absolue du fichier
        */
        function openFile (file, mime) {
            /*
                On récupère le type du fichier
            */
            return (function () {
                $cordovaFileOpener2.open(
                    file,
                    mime
                ).then(function() {
                    //fine, nothing to do
                    Utils.stopMedias();
                }, function(err) {
                    showAlert(file, err);
                });
            });
        };

        /*
            Ouvre un lien dans le navigateur
        */
        function openLink (url) {
            return function (event) {
                event.preventDefault();
                if (event.stopPropagation)
                    event.stopPropagation();
                if (event.cancelBubble != null)
                    event.cancelBubble = true;

                if(Utils.isInternet()) {
                    $cordovaInAppBrowser.open(url, '_system', {})
                    .then(function(event) {
                        // success
                        Utils.stopMedias();
                    })
                    .catch(function(event) {
                        showAlertBrowser('Service indisponible');
                    });
                }else {
                    showAlertBrowser('Vous n\'êtes pas connecté à internet');
                }

                return false;
            };
        };
        function openHtml (url) {
            return function (event) {
                event.preventDefault();
                if (event.stopPropagation)
                    event.stopPropagation();
                if (event.cancelBubble != null)
                    event.cancelBubble = true;

                $cordovaInAppBrowser.open(url, '_system', {})
                .then(function(event) {
                    // success
                    Utils.stopMedias();
                })
                .catch(function(event) {
                    showAlertBrowser('Service indisponible');
                });

                return false;
            };
        };

        /*
            Dézip un fichier, puis le supprime
        */
        function unzip(src, dest) {
            $cordovaZip.unzip(
              src, dest
            ).then(function () {
              //Tout va bien
              window.resolveLocalFileSystemURL(src, function(dest) {
                dest.remove(function(){
                  //Fichier supprimé
                }, null); //Erreur, mais on s'en fout
              }, null); //Ne doit pas arriver
            }, function () {
              showAlertBrowser('Impossible de dézipper '+src);
            }, function (progressEvent) {
              //console.log(progressEvent);
            });
        };

        var showAlert = function(file, err) {
            var alertPopup = $ionicPopup.alert({
                title: 'Ouverture impossible',
                template:
                    'Erreur lors de l\'ouverture du fichier '+file+'.'
                    +'<br />Message d\'erreur :<br />'
                    +'<span class="assertive">'+err.message+'</span>'
            });
        };
        var showAlertBrowser = function(err) {
            var alertPopup = $ionicPopup.alert({
                title: 'Ouverture impossible',
                template: err
            });
        };

        $scope.modal = {};
        $ionicModal.fromTemplateUrl('templates/modals/img.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });
        function openImg(data) {
            $scope.modal.data = data;
            $scope.modal.show();
        }
        $scope.closeImg = function() {
            $scope.modal.hide();
        };
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });
    }
]);
