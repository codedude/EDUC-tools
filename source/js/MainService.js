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

/*
    Contient l'arborescence des projets
*/
.service('ArboFact', [
    '$log',
    function (
        $log
    ) {
        var self = this;

        //Arborescence
        var arbo = {};

        /*
            Trie l'arborescence
        */
        self.set = function (pArbo) {
            arbo = pArbo;
        };

        function sortDirs (a, b) {
            a = parseInt(a.split('_')[1]);
            b = parseInt(b.split('_')[1]);

            return a-b;
        }
        /*
            Retourne une liste des projets
        */
        self.getProjets = function () {
            //Liste des noms de projets
            var projets = [];
            for(var projet in arbo){
                projets.push(projet);
            }
            return projets.sort(sortDirs);
        };

        /*
            Retourne une liste des parties
        */
        self.getParties = function (indexProjet) {
            //Liste des noms de projets
            var parties = [];
            for(var partie in arbo['projet_'+indexProjet]){
                parties.push(partie);
            }
            return parties.sort(sortDirs);
        };
        /*
            Retourne une liste des chapitres
        */
        self.getChapitres = function (indexProjet, indexPartie) {
            //Liste des noms de projets
            var chapitres = [];

            chapitres = arbo['projet_'+indexProjet]['partie_'+indexPartie]

            return chapitres.sort(sortDirs);
        };
}])


.service('ChoixFact', [
    'Utils',
    function (
        Utils
    ) {
        var self = this;

        var refresh = true;
        self.doRefresh = function (value) {
            if(value === undefined) {
                return refresh;
            }
            refresh = value;
        };
        //Choix en cours (-1 = rien n'est sélectionné)
        self.projet = -1;
        self.partie = -1;
        self.chapitre = -1;

        self.init = function () {
            self.projet = -1;
            self.partie = -1;
            self.chapitre = -1;
        };

        self.getProjet = function () {
            return self.projet;
        };
        self.getPartie = function () {
            return self.partie;
        };
        self.getChapitre = function () {
            return self.chapitre;
        };

        self.setProjet = function (projet) {
            self.projet = projet;
        };
        self.setPartie = function (partie) {
            self.partie = partie;
        };
        self.setChapitre = function (chapitre) {
            self.chapitre = chapitre;
        };

        self.getPathProjet = function () {
            return Utils.getRoot()+'projet_'+self.projet.numero;
        };
        self.getPathPartie = function () {
            return self.getPathProjet()+'/partie_'+self.partie.numero;
        };
        self.getPathChapitre = function () {
            return self.getPathPartie()+'/chapitre_'+self.chapitre.numero;
        };
}])


.service('Utils', [
    '$http',
    '$q',
    '$cordovaNetwork',
    function (
        $http,
        $q,
        $cordovaNetwork
    ) {
        var self = this;

        /*
            Infos de debug chargés au démarrage
        */
        var debugInfos =  {};
        self.debugInfos = function (value) {
            if(value === undefined) {
                return debugInfos;
            }
            debugInfos = value;
        };

        /*
            Test la connexion internet
        */
        self.isInternet = function () {
            return $cordovaNetwork.isOnline();
        };
        /*
            Version de l'application
        */
        var version = '0.0.0';
        self.getVersion = function () {
            return version;
        };
        self.setVersion = function (P, S, T) {
            version = [P, S, T].join('.');
        };
        /*
            Date de la dernière version
        */
        var verDate = '00/00/00';
        self.getVerDate = function () {
            return verDate;
        };
        self.setVerDate = function (J, M, A) {
            verDate = [J, M, A].join('/');
        };

        /*
            Dossier racine
        */
        var root = '';
        self.getRoot = function () {
            return root;
        };
        self.setRoot = function (nRoot, nDir) {
            dirRoot = nDir;
            root = nRoot+nDir+'/';
        };

        var dirRoot = '';
        self.getDirRoot = function () {
            return dirRoot;
        };

        /*
            Reuquête htp asynchrone
            Retourne une promise
        */
        self.httpq = function (url) {
            var defer = $q.defer();

            $http.get(url)
                .then(function(response) {
                    defer.resolve(response.data);
                }, function(response) {
                    defer.reject(response);
                });

            return defer.promise;
        };

        self.qAll = function (promises) {
            return $q.all(promises);
        };

        self.stopMedias = function () {
            var v = document.getElementsByTagName('video');
            var a = document.getElementsByTagName('audio');
            var n;
            for(n=0; n < v.length; n++)
                v[n].pause();
            for(n=0; n < a.length; n++)
                a[n].pause();
        };
}])


.service('ScanRoot', [
    '$ionicPlatform',
    '$q',
    '$log',
    'Utils',
    function (
        $ionicPlatform,
        $q,
        $log,
        Utils
    ) {
        var self = this;

        self.scan = function (callback) {
            $ionicPlatform.ready(function() {
                if(self.initPath()) {
                    //Sur device seulement

                    window.resolveLocalFileSystemURL(Utils.getRoot(), (e) => {
                            gotFileEntry(e, callback);
                        },
                        (e) => {
                            fileErrHandler(e, callback);
                        }
                    );

                    /*
                    // Liste les dossiers et fichies d'un dossier
                    function getEntries(path) {
                        var deferred = $q.defer();
                        window.resolveLocalFileSystemURL(path,
                            (fs) => { //success
                                var directoryReader = fs.createReader();
                                directoryReader.readEntries((r) => {
                                    deferred.resolve(r);
                                }, (e) => {
                                    deferred.reject(e);
                                })
                            }, //error
                            (e) => {
                                deferred.reject(e);
                            }
                        );
                        return deferred.promise;
                    }
                    var fs = getEntries(Utils.getRoot());
                    fs.then(
                        function (result) {
                            console.log(result);
                        },
                        function (error) {
                            console.log(error);
                        }
                    );
                    */


                }else {
                    var data = {
                        'projet_1' : {
                            'partie_0' : [
                                'chapitre_1',
                                'chapitre_2',
                                'chapitre_3',
                                'chapitre_4'
                            ],
                            'partie_1' : [
                                'chapitre_1',
                                'chapitre_2',
                                'chapitre_3',
                                'chapitre_4'
                            ],
                            'partie_2' : [
                            ],
                            'partie_3' : [
                            ],
                            'partie_4' : [
                                'chapitre_1',
                                'chapitre_2',
                                'chapitre_3',
                                'chapitre_4',
                                'chapitre_5'
                            ],
                            'partie_5' : [
                                'chapitre_1',
                                'chapitre_2',
                                'chapitre_3',
                                'chapitre_4'
                            ]
                        },
                        'projet_2' : {
                        },
                        'projet_3' : {
                        }
                    };

                    callback(data);
                }
            });
        };

        self.initPath = function () {
            if(ionic.Platform.isWebView()) { //Mobile
              if(ionic.Platform.isAndroid()) {
                Utils.setRoot(cordova.file.externalRootDirectory, 'EDUC-tools');
              }else if(ionic.Platform.isWindowsPhone()) {
                Utils.setRoot(cordova.file.externalRootDirectory, 'EDUC-tools');
              }else { //IOS
                Utils.setRoot(cordova.file.externalRootDirectory, 'EDUC-tools');
              }

                return true;
            }else { //Dev in browser
              Utils.setRoot('', 'EDUC-tools');

              return false;
            }
        };

        function checkNameDir(str) {
            let rule = /^(projet|partie|chapitre)_[0-9]{1,3}$/;
            if(!rule.test(str))
                return false;
            return true;
        }
        function fileErrHandler(e, callback) {
            let msg = '';
            switch (e.code) {
                case FileError.QUOTA_EXCEEDED_ERR:
                    msg = 'QUOTA_EXCEEDED_ERR';
                    break;
                case FileError.NOT_FOUND_ERR:
                    msg = 'Dossier introuvable';
                    break;
                case FileError.SECURITY_ERR:
                    msg = 'SECURITY_ERR';
                    break;
                case FileError.INVALID_MODIFICATION_ERR:
                    msg = 'INVALID_MODIFICATION_ERR';
                    break;
                case FileError.INVALID_STATE_ERR:
                    msg = 'INVALID_STATE_ERR';
                    break;
                default:
                    msg = 'Erreur inconnue';
                    break;
            };

            callback({
                error: msg
            });
        }

        function gotFileEntry(fileEntry, callback) {
            let data;
            if(fileEntry.isDirectory == undefined || fileEntry.isDirectory == false) {
                callback({
                    error: 'Le dossier '+Utils.getDirRoot()+' n\'existe pas'
                });
                return false;
            }

            let dirReader = fileEntry.createReader();

            let r = true; //False si error sur readEntries
            let counter = -1; //Compte les sous dossier du répertoir courant
            let counterPart = [];

            /* Arborescence du dossier racine
                {
                    'projet_1' : {
                        'partie_1' : [
                            'chapitre_1',
                            ...
                            'chapitre_x'
                        ],
                        ...
                    },
                    ...
                }
            */
            let list_dirs = {};

            let my_readEntries = function(pDirReader) {
                let project = arguments[1];
                let part = arguments[2];

                pDirReader.readEntries(
                //on success
                function(dirs) {
                    //Fin, on a lu tout le répertoire courant
                    if(dirs.length == 0) {
                        if(project === undefined) { //Project
                            counter = Object.keys(list_dirs).length;
                            if(counter == 0) {
                                callback({
                                    error: 'Aucun projet présent'
                                });
                                return false;
                            }

                            for(let el in list_dirs) {
                                //nouveau reader pour chaque dossier
                                let nDirReader = list_dirs[el].createReader();
                                list_dirs[el] = {};
                                my_readEntries(nDirReader, el); //Appel récursif sur les sous-dossiers
                            }
                        }else if(project !== undefined && part === undefined) { //Part
                            counter--;
                            if(counter > 0) {
                                return false;
                            }

                            for(let i in list_dirs) {
                                counterPart[i] = Object.keys(list_dirs[i]).length;
                            }

                            var noParts = true;
                            for(let i in list_dirs) {
                                /*
                                    Cas où il n'y a pas de partie
                                */
                                for(let el in list_dirs[i]) {
                                    noParts = false;
                                    //nouveau reader pour chaque dossier
                                    let nDirReader = list_dirs[i][el].createReader();
                                    list_dirs[i][el] = []; //Pile
                                    my_readEntries(nDirReader, i, el); //Appel récursif sur les sous-dossiers
                                }
                            }
                            if(noParts === true) {
                                callback(list_dirs);
                            }
                        }
                        else { //Recherche fini ? on renvoi
                            counterPart[project]--;
                            let tt_c = 0;
                            for(let i in counterPart)
                                tt_c += counterPart[i];

                            //Fini ?
                            if(tt_c == 0) {
                                callback(list_dirs);
                            }
                            //Fin des requêtes asynchrone et de la page de chargement
                            //On passe dans le else autant de fois qu'il y a de chapitres...
                        }
                    }
                    /*
                        Il reste des dossiers à lire dans le répertoire courant
                        NB : readEntries peut ne peut renvoyer tous les dossiers
                        d'un coup !
                    */
                    else {
                        //On parcours le retour de readEntries
                        for(let dir in dirs) {
                            //Si on trouve un dossier valide
                            if(dirs[dir].isDirectory == true) {
                                let name = dirs[dir].name;
                                if(checkNameDir(name)){
                                    //On l'ajoute au bon endroit
                                    if(project === undefined) { //Projet
                                        if(!list_dirs.hasOwnProperty(name)) {
                                            list_dirs[name] = dirs[dir];
                                        }
                                    }
                                    else if (project !== undefined &&
                                        part === undefined) { //Partie

                                        if(!list_dirs[project].hasOwnProperty(name)) {

                                            list_dirs[project][name] = dirs[dir];
                                            //console.log('part('+project+') -> '+name);
                                        }
                                        //Sinon on ne le ré-ajoute pas
                                    }
                                    else if (project !== undefined &&
                                        part !== undefined){ //Chapitre
                                        if(!list_dirs[project][part].hasOwnProperty(name)) {

                                            list_dirs[project][part].push(name);
                                            //console.log('chap('+project+'/'+part+') -> '+name);
                                        }
                                    }else {  }
                                }
                                //Sinon ce n'est pas un dossier à marquer (ex : res)
                            }
                            //Sinon ce n'est pas un dossier
                        }

                        //On rappelle la fonction si il en reste
                        my_readEntries(pDirReader, project, part);
                    }
                },
                //on error
                function(e) {
                    r = false;
                    return false;
                });
            };

            my_readEntries(dirReader);

            //Erreur lors de la lecture des dossiers
            if(r === false) {
                callback({
                    error: 'Erreur lors de la lecture du dossier '
                            +Utils.getDirRoot()
                });
            }
        }
}])

/*
    Stocke les données de cours
*/
.service('Courses', [
    'ChoixFact',
    'ArboFact',
    'Utils',
    function (
        ChoixFact,
        ArboFact,
        Utils
    ) {
        var self = this;

        var courses = [];
        var promis;
        /*
            Getter sur courses
        */
        self.get = function (id) {
            if(id !== undefined)
                return promis.then(function (data) {
                    if(data.error.length > 0){
                        return {error:data.error};
                    }else {
                        return {course:data.courses[parseInt(id)]};
                    }
                });

            return promis;
        };

        /*
            Initialise la liste des cours à partir d'un chapitre
        */
        self.init = function () {
            /*
                On vérifie qu'il existe bien une partie cours, avec des
                chapitres
            */
            var idProjet = ChoixFact.getProjet().numero;

            var listeParties = ArboFact.getParties(idProjet);
            //Pas de partie cours
            if(listeParties.indexOf('partie_0') === -1) {
                return false;
            }

            var listeCours = ArboFact.getChapitres(idProjet, 0);
            //Aucun cours présent
            if(listeCours.length == 0) {
                return false;
            }

            /*
                On récupère le json de chaque chapitre
            */
            var promises = [];
            var errs = []
            for(var cours in listeCours) {
                var path = Utils.getRoot()
                    +'projet_'+idProjet
                    +'/partie_0/'
                    +listeCours[cours]
                    +'/config.json';
                promises.push(Utils.httpq(path)
                    .then(function (data) {
                        courses.push(data);
                    })
                    .catch(function (data) {
                        errs.push('Fichier '+data.config.url+' introuvable');
                    })
                );
            }

            function sortDirs (a, b) {
                a = parseInt(a['numero']);
                b = parseInt(b['numero']);

                return a-b;
            }

            /* Attends que toutes les requêtes soient terminées */
            var promiseRet = Utils.qAll(promises).then(function () {
                courses = courses.sort(sortDirs);
                var ret = {courses:courses, error:errs};
                return ret;
            });
            promis = promiseRet;

            return promiseRet;
        };
    }
]);
