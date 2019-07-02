import * as React from 'react'
import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import TabManager from "./components/tabManager/tabManager";
import connector from "./components/helper/connector"

const IndexPage  = ({jobData}) => {
	const compData = jobData.imageMetaInformationModel;

	// ToDo: Probably use state thingy here for update fun

	return (
		<div>
			<Header jobName={jobData.jobName} progress={jobData.progress} maxPixDiff={compData.biggestPercentualPixelDifference} lastJobFinished={compData.timestamp} checkAllCallback={() => {
				const endpoint = connector.getServerEndpoint();
				console.log(endpoint);}}/>
				<TabManager projects={compData.projects} availableProjects={ "none" } />
			<Footer />
		</div>
	)
};

IndexPage.getInitialProps = async ({ } ) => {
	const result = await connector.getActiveJob();

	return {
		jobData: result.job
	}
};

export default IndexPage
