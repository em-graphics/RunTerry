/*
Source file name : keyboardcontrols.ts
Author : Eunmi Han(300790610)
Date last Modified : Mar 11, 2016
Program Description : Set player mouse control
Revision History : 1.01 - Initial Setup(3.11)
                   1.02 - Adding mouse controls(3.16)
                                      
Last Modified by Eunmi Han
*/
var objects;
(function (objects) {
    // MouseControls Class +++++++++++++++
    var MouseControls = (function () {
        // CONSTRUCTOR +++++++++++++++++++++++
        function MouseControls() {
            this.enabled = false;
            this.sensitivity = 0.1;
            this.yaw = 0;
            this.pitch = 0;
            document.addEventListener('mousemove', this.OnMouseMove.bind(this), false);
        }
        //public methods
        MouseControls.prototype.OnMouseMove = function (event) {
            this.yaw = -event.movementX * this.sensitivity;
            this.pitch = -event.movementY * this.sensitivity * 0.1;
        };
        return MouseControls;
    })();
    objects.MouseControls = MouseControls;
})(objects || (objects = {}));

//# sourceMappingURL=mousecontrols.js.map
