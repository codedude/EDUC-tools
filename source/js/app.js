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
// Ionic Starter App

angular.module('starter', [
  'ionic', 'ngTouch', 'ngAnimate', 'ngSanitize', 'ngCordova'
])


.run([
  '$ionicPlatform',
  'ArboFact',
  'Utils',
  function(
    $ionicPlatform,
    ArboFact,
    Utils
  ) {
    $ionicPlatform.ready(function() {
      if(window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }

      /* Init la version */
      Utils.setVersion(1, 0, 0);
      Utils.setVerDate(13, 01, 2017);

      /* Exemple :
        available: true
        cordova: "4.1.1"
        isVirtual: false
        manufacturer: "samsung"
        model: "GT-I9305"
        platform: "Android"
        serial: "320460972ac7c03b"
        uuid: "64369aa8a998d3d"
        version: "4.4.4"
      */
      var deviceInformation = ionic.Platform.device();

      /*
        Booleens
      */
      var isWebView = ionic.Platform.isWebView();
      var isIPad = ionic.Platform.isIPad();
      var isIOS = ionic.Platform.isIOS();
      var isAndroid = ionic.Platform.isAndroid();
      var isWindowsPhone = ionic.Platform.isWindowsPhone();

      /*
        Date de l'éxecution
      */
      var dateNow = new Date();

      Utils.debugInfos({
        device: deviceInformation,
        desktop: !isWebView,
        ipad: isIPad,
        ios: isIOS,
        android: isAndroid,
        windows: isWindowsPhone,
        date: dateNow
      });
  });
}]);
