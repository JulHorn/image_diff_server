import React, {useState} from 'react'
import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import TabManager from "./components/tabManager/tabManager";
import connector from "./components/helper/connector"
import css from "./index.scss";

const IndexPage  = ({initialJobData, param, query, match, req}) => {
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
			<TabManager projects={dataState.projects} availableProjects={ "none" } contentDataModificationCallback={(result) => updateState(result.job)} />
			<Footer />
		</div>
	)
};

IndexPage.getInitialProps = async ({ req } ) => {
	const result = await connector.getActiveJob(req.query.imageSetState, req.query.projectId);

	return {
		initialJobData: result.job
	}
};

export default IndexPage
