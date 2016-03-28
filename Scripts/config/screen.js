/*
Source file name : screen.ts
Author : Eunmi Han(300790610)
Date last Modified : Mar 11, 2016
Program Description : Set the size of backgraound
Revision History : 1.01 - Initial Setup(3.11)
                                      
Last Modified by Eunmi Han
*/
var config;
(function (config) {
    var Screen = (function () {
        function Screen() {
        }
        Screen.WIDTH = window.innerWidth;
        Screen.HEIGHT = window.innerHeight;
        Screen.RATIO = window.innerWidth / window.innerHeight;
        return Screen;
    })();
    config.Screen = Screen;
})(config || (config = {}));

//# sourceMappingURL=screen.js.map
