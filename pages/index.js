import React, {useState} from 'react'
import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import TabManager from "./components/tabManager/tabManager";
import ImageAreaSelector from "./components/imageAreaSelector/imageAreaSelector"
import connector from "./components/helper/connector"
import css from "./index.scss";

const IndexPage  = ({initialJobData, initialAvailableProjectData}) => {
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

	const [availableProjectsState, setAvailableProjectsState] =
		useState({
			 availableProjects: initialAvailableProjectData.allProjects
		 });

	const [imageAreaSelectionState, setImageAreaSelectionState] =
		useState({
			visible: false,
		 	applyClickCallback: false,
			imagePath: false
		 });

	const addImageIgnoreAreas = (imageSet) => {
		setImageAreaSelectionState({
		   visible: true,
		   applyClickCallback: imageModificationCallback,
		   cancelClickCallback: imageModificationCallback,
		   imagePath: imageSet.referenceImage.path
	   });
	};

	const addImageCheckAreas = (imageSet) => {
		setImageAreaSelectionState({
			visible: true,
			applyClickCallback: imageModificationCallback,
			cancelClickCallback: imageModificationCallback,
			imagePath: imageSet.referenceImage.path
		})
	};

	const imageModificationCallback = (modifiedAreas) => {
		if (modifiedAreas) {
			console.log('Modified')
		}

		setImageAreaSelectionState({
		   visible: false
		})
	};

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
			<div className={css.indexCenteredContent}>
				<ImageAreaSelector state={ imageAreaSelectionState } />
				<Header data={dataState} checkAllCallback={(e) => handleCheckAll(e)}/>
				<TabManager projects={dataState.projects} availableProjects={ availableProjectsState.availableProjects } contentDataModificationCallback={(result) => updateState(result.job)} addImageIgnoreRegionsCallback={ (imageSet) => addImageIgnoreAreas(imageSet) } addImageCheckRegionsCallback={ (imageSet) => addImageCheckAreas(imageSet) } />
			</div>
			<Footer />
		</div>
	)
};

IndexPage.getInitialProps = async ({ req } ) => {
	const resultJob = await connector.getActiveJob(req.query.imageSetState, req.query.projectId);
	const projects = await connector.getProjects();

	return {
		initialJobData: resultJob.job,
		initialAvailableProjectData: projects
	}
};

export default IndexPage
