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


.controller('MenuTpCtrl', [
    '$scope',
    '$state',
    '$stateParams',
    '$ionicHistory',
    'Courses',
    'ChoixFact',
    'Utils',
    function(
        $scope,
        $state,
        $stateParams,
        $ionicHistory,
        Courses,
        ChoixFact,
        Utils
    ) {

        $scope.showMenuErreur = false;

        /*
            Récupère la parties Cours si elle est présente
        */
        var courses = Courses.init();
        if(courses === false) {
            $scope.showCours = false;
        }else {
            courses.then(function (data) {
                if(data.error.length > 0){
                    $scope.showCours = true;
                    $scope.courses = {};
                    $scope.showMenuErreur = true;
                    $scope.menuErreur = 'Erreur lors du chargement';
                }else {
                    $scope.showCours = true;
                    $scope.courses = data.courses;
                }
            });
        }


        $scope.selectCourse = function (index) {
            ChoixFact.doRefresh(true);
            Utils.stopMedias();
            $state.go('tp.page', {id: index});
        };

        $scope.goApropos = function () {
            Utils.stopMedias();
            $state.go('apropos');
        };
        $scope.goChapitre = function () {
            //Supprimer l'historique jusqu'à revenir aux chapitres
            ChoixFact.doRefresh(false);
            Utils.stopMedias();

            /* Pour éviter un back sur un tp */
            //Retour à l'état page, on vide le reste

            var hist = $ionicHistory.viewHistory();

            //Vide l'historique sauf root (retour aux parties)
            for (var view in hist.histories) {
                if(view != 'root')
                    delete hist.histories[view];
            }
            //Trouve la view partie dans root, et la mets en backView
            for (var i=0; i<hist.histories['root'].stack.length; i++) {
                if(hist.histories['root'].stack[i].stateName == 'partie') {
                    hist.backView = hist.histories['root'].stack[i];
                    break;
                }
            }
            //forwardView vide
            hist.forwardView = null

            //On se fout de currentView puisqu'on a vider l'historique

            //On revient de 1 comme on a tout suppriméS
            $ionicHistory.goBack(-1);
        };
        $scope.goHome = function () {
            $ionicHistory.nextViewOptions({
                disableBack: true,
                disableAnimate: true,
                historyRoot: true
            });
            ChoixFact.doRefresh(true);
            Utils.stopMedias();
            $state.go('home');
        };

        $scope.goBack = function () {
            ChoixFact.doRefresh(false);
            $ionicHistory.goBack();
        };
    }
]);
