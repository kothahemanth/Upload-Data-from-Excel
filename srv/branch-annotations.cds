annotate satinfotech.Branch with @(
    UI.LineItem             : [
        {
            Label: 'Name',
            Value: name
        },
        {
            Label: 'Address 1',
            Value: add1
        },
        {
            Label: 'Address 2',
            Value: add2
        },
        {
            Label: 'City',
            Value: city
        },
        {
            Label: 'State',
            Value: state
        },
        {
            Label: 'Phone Number',
            Value: ph_no
        }
    ],
    UI.FieldGroup #BusinessP: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: name
            },
            {
                $Type: 'UI.DataField',
                Value: add1
            },
            {
                $Type: 'UI.DataField',
                Value: add2
            },
            {
                $Type: 'UI.DataField',
                Value: city
            },
            {
                $Type: 'UI.DataField',
                Value: state
            },
            {
            $Type : 'UI.DataField',
            Value : ph_no
            }, 
        ],
    },
    UI.Facets               : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'BranchFacet',
        Label : 'Branch',
        Target: '@UI.FieldGroup#BusinessP',
    }, ],
);