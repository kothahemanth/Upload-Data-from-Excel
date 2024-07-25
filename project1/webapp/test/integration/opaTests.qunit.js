sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'project1/test/integration/FirstJourney',
		'project1/test/integration/pages/ProductList',
		'project1/test/integration/pages/ProductObjectPage',
		'project1/test/integration/pages/CustomerObjectPage'
    ],
    function(JourneyRunner, opaJourney, ProductList, ProductObjectPage, CustomerObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('project1') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheProductList: ProductList,
					onTheProductObjectPage: ProductObjectPage,
					onTheCustomerObjectPage: CustomerObjectPage
                }
            },
            opaJourney.run
        );
    }
);