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

	const handleCheckAll = (result) => {
		updateHeadline(result.job)

	};

	const handleChangeDisplayType = (displayType) => {
		console.log("Display type " + displayType)
	};

	const updateHeadline = (job) => {
		const compData = job.imageMetaInformationModel;

		const infoState = {
			jobName: job.jobName,
			imagesToBeProcessedCount: job.imagesToBeProcessedCount,
			processedImageCount: job.processedImageCount,
			maxActualPixDiff: compData.biggestPercentualPixelDifference,
			maxPixDiffThreshold: compData.percentualPixelDifferenceThreshold,
			jobRunTimestamp: compData.timeStamp
		};

		// ToDo: Refresh other states here to display new items etc.

		setMetaInformationState(infoState);
	};

	return (
		<div className={css.indexContent}>
			<Header data={metaInformationState} checkAllCallback={(e) => handleCheckAll(e)}/>
			<TabManager projects={compData.projects} availableProjects={ "none" } displayTypeChangeCallback={(dp) => handleChangeDisplayType(dp)} contentDataModificationCallback={(result) => updateHeadline(result.job)} />
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
