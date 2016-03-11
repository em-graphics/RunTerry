/*
Source file name : screen.ts
Author : Eunmi Han(300790610)
Date last Modified : Mar 11, 2016
Program Description : Set the size of backgraound 
Revision History : 1.01 - Initial Setup(3.11)
                                      
Last Modified by Eunmi Han
*/

module config {
    export class Screen {
        static WIDTH:number = window.innerWidth;
        static HEIGHT:number = window.innerHeight;
        static RATIO:number = window.innerWidth / window.innerHeight;
    }
    
}