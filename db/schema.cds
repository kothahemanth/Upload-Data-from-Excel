namespace com.hemanth.satinfotech;
using { managed, cuid } from '@sap/cds/common';

entity Branch: managed, cuid {
    
    @title:'Name'
    name:String(20);
    @title:'Address 1'
    add1:String(20);
    @title:'Address 2'
    add2:String(20);
    @title:'City'
    city:String(20);
    @title:'State'
    state:String(20);
    @title:'Branch Phone Number'
    ph_no:String(10);
}



