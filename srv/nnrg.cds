using { com.hemanth.nnrg as db } from '../db/schema';

service nnrg {
    entity Product  as projection on db.Product;
}

annotate nnrg.Product with @odata.draft.enabled;

annotate nnrg.Product with {
    product_img @assert.match: '^https?:\/\/.*\.(?:png|jpg|jpeg)$';
};




annotate nnrg.Product with {
@Common.Text : ' {Product}'
@Core.IsURL: true
@Core.MediaType: 'image/jpg'
product_img;
};

annotate nnrg.Product with @(
    UI.LineItem: [
        {
            $Type : 'UI.DataField',
            Label:'ProductID',
            Value : product_id
        },
        {
            $Type : 'UI.DataField',
            Value : product_name
        },
        {
            $Type : 'UI.DataField',
            Value : product_img
        },
        {
            $Type : 'UI.DataField',
            Value : product_cost
        },
        {
            $Type : 'UI.DataField',
            Value : product_sell
        }
    ],  
);
annotate nnrg.Product with @(       
    UI.FieldGroup #ProductInformation : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
            $Type : 'UI.DataField',
            
            Value : product_id
        },
        {
            $Type : 'UI.DataField',
            Value : product_name
        },
        {
            $Type : 'UI.DataField',
            Value : product_img
        },
        {
            $Type : 'UI.DataField',
            Value : product_cost
        },
        {
            $Type : 'UI.DataField',
            Value : product_sell
        }
        
        ],
    },


    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'ProductInfoFacet',
            Label : 'Product Information',
            Target : '@UI.FieldGroup#ProductInformation',
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'CustomerInfoFacet',
            Label : 'Customer Information',
            Target : 'Cus/@UI.LineItem',
        },
    ],    
);

annotate nnrg.Customer with @(
    UI.LineItem: [
        {
            $Type : 'UI.DataField',
            Label:'CustomerID',
            Value : customer_id_ID
        },
        {
            $Type : 'UI.DataField',
            Value : customer_name
        },
        {
            $Type : 'UI.DataField',
            Value : email
        },
        {
            $Type : 'UI.DataField',
            Value : address
        }
    ],  
);
annotate nnrg.Customer with @(       
    UI.FieldGroup #ProductInformation : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
            $Type : 'UI.DataField',
            
            Value : customer_id_ID
        },
        {
            $Type : 'UI.DataField',
            Value : customer_name
        },
        {
            $Type : 'UI.DataField',
            Value : email
        },
        {
            $Type : 'UI.DataField',
            Value : address
        }
        
        ],
    },


    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'CustomerInfoFacet',
            Label : 'Customer Information',
            Target : '@UI.FieldGroup#ProductInformation',
        },
    ],    
);
