/*
Source file name : keyboardcontrols.ts
Author : Eunmi Han(300790610)
Date last Modified : Mar 11, 2016
Program Description : For the 3 demension coordinate 
Revision History : 1.01 - Initial Setup(3.11)
                                      
Last Modified by Eunmi Han
*/

/// <reference path="../../typings/tsd.d.ts"/>

module objects {
    // POINT CLASS ++++++++++++++++++++++++++++++++++++++++++
    export class Point { 
        public x:number;
        public y:number;
        public z:number;
        // CONSTRUCTOR ++++++++++++++++++++++++++++++++++++++++
        constructor(x:number, y:number, z:number) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
    }
}
