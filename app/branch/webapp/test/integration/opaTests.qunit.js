sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'branch/test/integration/FirstJourney',
		'branch/test/integration/pages/BranchList',
		'branch/test/integration/pages/BranchObjectPage'
    ],
    function(JourneyRunner, opaJourney, BranchList, BranchObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('branch') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheBranchList: BranchList,
					onTheBranchObjectPage: BranchObjectPage
                }
            },
            opaJourney.run
        );
    }
);