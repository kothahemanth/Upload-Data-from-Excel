namespace com.hemanth.nnrg;
using { managed, cuid } from '@sap/cds/common';


entity Product : cuid, managed {
    key ID            : UUID;
    @title: 'ProductID'
    product_id: String(30);
    @title: 'Product Name'
    product_name: String(20) ;
    @title: 'Product Image URL'
    product_img: String default 'https://imgur.com/djS2boy.jpg'; 
    @title: 'Product Cost Price'
    product_cost: Decimal(15, 2) ;
    @title: 'Product Sell Price'
    product_sell: Decimal(15, 2) ;

    Cus : Composition of many Customer on Cus.customer_id=$self;
}

entity Customer : cuid, managed
  {
    key ID            : UUID;
    @title: 'CustomerID'
    customer_id: Association to one Product;
    @title: 'Customer Name'
    customer_name: String(20) ;
    @title: 'E-mail'
    email: String(20) ;
    @title: 'Address'
    address: String(20);
};