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

.config([
  '$stateProvider',
  '$urlRouterProvider',
  function(
    $stateProvider,
    $urlRouterProvider) {

    /*
      Page d'accueil, choix du projet
    */
    $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: './templates/home.html',
      controller: 'HomeCtrl'
    })
    /*
      Infos dev/license/contact
    */
    .state('apropos', {
      url: '/apropos',
      templateUrl: './templates/apropos.html',
      controller: 'AproposCtrl'
    })

    //Choix de la partie
    .state('projet', {
      url: '/projet',
      templateUrl: './templates/partie.html',
      controller: 'PartieCtrl'
    })
        //Choix du chapitre
    .state('partie', {
      url: '/partie',
      templateUrl: './templates/chapitre.html',
      controller: 'ChapitreCtrl'
    })
    //Affichage de la ressource
    .state('tp', {
      url: '/tp',
      abstract: true,
      templateUrl: './templates/menuTp.html',
      controller: 'MenuTpCtrl'
    })
      .state('tp.page', {
      url: '/page/:id',
      views: {
        'menuContent': {
          templateUrl: './templates/tp.html',
          controller: 'TpCtrl'
        }
      }
    });

    //Page par défaut
    $urlRouterProvider.otherwise('/home');
}])

/*
  Configuration personnelle
*/
.config([
  '$ionicConfigProvider',
  '$logProvider',
  '$compileProvider',
  '$animateProvider',
  function(
    $ionicConfigProvider,
    $logProvider,
    $compileProvider,
    $animateProvider) {

/********
ANGULAR
********/
    //Aligne le titre des nav-bar au milieu pour tous les systèmes
    $ionicConfigProvider.navBar.alignTitle("center");

    //PERF : A désactiver en prod
    $logProvider.debugEnabled(true);

    //PERF : angular-batarang utilise cette option
    $compileProvider.debugInfoEnabled(false);

    //PERF : active ngAnimate explicitement
    $animateProvider.classNameFilter( /\banimated\b/ );

/********
IONIC
********/
    //???
    $ionicConfigProvider.scrolling.jsScrolling(false);

    //PERF : defaut 10, choisir un nombre raisonnable (6)
    $ionicConfigProvider.views.maxCache(6);

    //Back button
    $ionicConfigProvider.backButton.previousTitleText(false);
    $ionicConfigProvider.backButton.icon('ion-chevron-left');
    $ionicConfigProvider.backButton.text('')
}]);
