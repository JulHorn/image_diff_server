import React, {useState} from 'react'
import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import TabManager from "./components/tabManager/tabManager";
import connector from "./components/helper/connector"
import css from "./index.scss";

const IndexPage  = ({jobData}) => {
	const compData = jobData.imageMetaInformationModel;
// ToDo: Probably use state thingy here for update
	const [metaInformationState, setMetaInformationState] =
		useState({
			jobName: jobData.jobName,
			imagesToBeProcessedCount: jobData.imagesToBeProcessedCount,
			processedImageCount: jobData.processedImageCount,
			maxActualPixDiff: compData.biggestPercentualPixelDifference,
			maxPixDiffThreshold: compData.percentualPixelDifferenceThreshold,
			jobRunTimestamp: compData.timeStamp
		});

	// Maybe move call logic in corresponding component for more seperation of concern
	const handleCheckAll = () => {
		connector.checkAll().then(result => {
			const compData = result.job.imageMetaInformationModel;

			const infoState = {
				jobName: result.job.jobName,
				imagesToBeProcessedCount: result.job.imagesToBeProcessedCount,
				processedImageCount: result.job.processedImageCount,
				maxActualPixDiff: compData.biggestPercentualPixelDifference,
				maxPixDiffThreshold: compData.percentualPixelDifferenceThreshold,
				jobRunTimestamp: compData.timeStamp
			};

			// ToDo: Refresh other states here to display new items etc.

			setMetaInformationState(infoState);
		});
	};

	return (
		<div className={css.indexContent}>
			<Header data={metaInformationState} checkAllCallback={(e) => handleCheckAll(e)}/>
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
