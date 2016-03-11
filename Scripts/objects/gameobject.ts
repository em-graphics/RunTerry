/*
Source file name : gameobjects.ts
Author : Eunmi Han(300790610)
Date last Modified : Mar 11, 2016
Program Description : Set meterial, geometry and positions for mesh 
Revision History : 1.01 - Initial Setup(3.11)
                                      
Last Modified by Eunmi Han
*/
/// <reference path="../../typings/tsd.d.ts"/>

module objects {
    export class gameObject extends THREE.Mesh {
        //PRIVATE INSTANCE VARIABLES +++++++++++++++++++++++++++++++++++++
        private _geometry: THREE.Geometry;
        private _material: THREE.Material;
        //CONSTRUCTOR ++++++++++++++++++++++++++++++++++++++++++++++++++++
        constructor(geometry: THREE.Geometry, material: THREE.Material, x:number, y:number, z:number) {
            super(geometry, material);
            this._geometry = geometry;
            this._material = material;
            this.position.x = x;
            this.position.y = y;
            this.position.z = z;
            this.receiveShadow = true;
            this.castShadow = true;
        }
    }
}