import React, {useState} from 'react'
import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import TabManager from "./components/tabManager/tabManager";
import connector from "./components/helper/connector"
import css from "./index.scss";

const IndexPage  = ({initialJobData}) => {
	const initialCompData = initialJobData.imageMetaInformationModel;
// ToDo: Probably use state thingy here for update
	const [dataState, setMetaInformationState] =
		useState({
			jobName: initialJobData.jobName,
			imagesToBeProcessedCount: initialJobData.imagesToBeProcessedCount,
			processedImageCount: initialJobData.processedImageCount,
		 	projects: initialCompData.projects,
			maxActualPixDiff: initialCompData.biggestPercentualPixelDifference,
			maxPixDiffThreshold: initialCompData.percentualPixelDifferenceThreshold,
			jobRunTimestamp: initialCompData.timeStamp
		});

	const handleCheckAll = (result) => {
		updateState(result.job)

	};

	const handleChangeDisplayType = (displayType) => {
		console.log("Display type " + displayType)
	};

	// ToDo Might be better to break it down into multiple states
	const updateState = (job) => {
		const compData = job.imageMetaInformationModel;

		const infoState = {
			jobName: job.jobName,
			imagesToBeProcessedCount: job.imagesToBeProcessedCount,
			processedImageCount: job.processedImageCount,
			projects: compData.projects,
			maxActualPixDiff: compData.biggestPercentualPixelDifference,
			maxPixDiffThreshold: compData.percentualPixelDifferenceThreshold,
			jobRunTimestamp: compData.timeStamp
		};

		// ToDo: Refresh other states here to display new items etc.

		setMetaInformationState(infoState);
	};

	return (
		<div className={css.indexContent}>
			<Header data={dataState} checkAllCallback={(e) => handleCheckAll(e)}/>
			<TabManager projects={dataState.projects} availableProjects={ "none" } displayTypeChangeCallback={(dp) => handleChangeDisplayType(dp)} contentDataModificationCallback={(result) => updateState(result.job)} />
			<Footer />
		</div>
	)
};

IndexPage.getInitialProps = async ({ } ) => {
	const result = await connector.getActiveJob();

	return {
		initialJobData: result.job
	}
};

export default IndexPage
