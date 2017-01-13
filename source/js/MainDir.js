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


.directive('myBackButton', [
    '$ionicHistory',
    function(
        $ionicHistory
    ) {
        var buttonStyle;

        /*
            Personnalisation du bouton selon l'os
        */
        buttonStyle = 'ion-chevron-left';

        return {
            restrict: 'E',
            template: function(elem, attr) {
                /*
                    Attribut myShow optionnel (true par défaut)
                */
                if(attr.myShow == undefined) {
                    attr.myShow = "true";
                }

                /*
                    Attribut myClick obligatoire
                */
                if(attr.myClick == undefined) {
                    attr.myClick = '';
                }

                return '<ion-nav-buttons side="left">'
                    +'<button class="button button-icon '
                    +buttonStyle+'" ng-click="'
                    +attr.myClick+'" ng-show="'+attr.myShow+'">'
                    +'</button></ion-nav-buttons>';
            }
        };
    }
])

/*
    Directive custom for tp templates
*/
.directive('myTp', function () {
    return {
        restrict: 'E',
        scope: {
            data: '='
        },
        template: '<div ng-include="data.template"></div>'
    };
})

/*
    Affiche du code html en texte
*/
.directive('san', function () {
    return {
        restrict: 'E',
        template: function (elem, attr) {
            var txt = '';
            if(attr.d != undefined)
                txt = attr.d;

            return '<span ng-bind-html="'+txt+'"></span>';
        }
    }
});