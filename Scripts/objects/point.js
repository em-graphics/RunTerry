/*
Source file name : keyboardcontrols.ts
Author : Eunmi Han(300790610)
Date last Modified : Mar 11, 2016
Program Description : For the 3 demension coordinate
Revision History : 1.01 - Initial Setup(3.11)
                                      
Last Modified by Eunmi Han
*/
/// <reference path="../../typings/tsd.d.ts"/>
var objects;
(function (objects) {
    // POINT CLASS ++++++++++++++++++++++++++++++++++++++++++
    var Point = (function () {
        // CONSTRUCTOR ++++++++++++++++++++++++++++++++++++++++
        function Point(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        return Point;
    })();
    objects.Point = Point;
})(objects || (objects = {}));

//# sourceMappingURL=point.js.map
