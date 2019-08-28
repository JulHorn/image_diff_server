import * as React from "react";
import css from "./tabManagerControls.scss";
import {useRouter} from 'next/router';
import connector from "../../helper/connector"

const TabManagerControls = ({ availableProjects }) => {
	const evaluateQueryParameter = (param) => {
		const router = useRouter();
		const query = router.query;

		return query[param];
	};

	// ToDo: This might be done via ajax
	const displayStateChange = (event) => {
		const form = document.getElementById('tabManagerControlsForm');
		form.submit();
	};

	// ToDo:Some nice spinner while ajax calls are running
	const createProject = async (event) => {
		var newProjectName = prompt('Please enter the project name.','');

		event.preventDefault();
		event.stopPropagation();

		if (newProjectName) {
			const result = await connector.addProject(newProjectName);
		}
	};

	const editProject = (event) => {
		// var projectSelectOption = that.$container.find('#projectSelect :selected');
		// var projectToBeRenamedId = projectSelectOption.attr('data-id');
		// var currentProjectName = projectSelectOption.text();
		// var newProjectName = prompt('Please enter the new project name for the project "' + currentProjectName + '" (ID:' + projectToBeRenamedId + ' )','');
		//
		// if (newProjectName) {
		// 	that.connector.editProject(newProjectName, projectToBeRenamedId, function (data) {
		// 		// projectSelectOption.text(newProjectName);
		// 		that.callback(data, null);
		// 	});
		// }
	};

	const deleteProject = () => {
		// var projectSelectOption = that.$container.find('#projectSelect :selected');
		// var projectToBeDeletedId = projectSelectOption.attr('data-id');
		//
		// if (confirm("Dou you really want to delete the project? All items of that project will be deleted too.")) {
		// 	that.connector.removeProject(projectToBeDeletedId, function (data) {
		// 		console.log(projectToBeDeletedId, 'deletedProjectId');
		// 		that.callback(data, null);
		// 	});
		// }
	};

	const getProjectOptions = () => {
		// ToDo: Make a method out of this
		const projectOptions = [];

		console.log('availableProjects', availableProjects);

		for (const availableProject of availableProjects) {

			projectOptions.push(
				<option key={ availableProject.id } selected={ evaluateQueryParameter('projectId') === availableProject.id } value={ availableProject.id }> { availableProject.name } </option>
			);
		}

		return projectOptions;
	};

	// Render stuff
	let selectedImageSetState = evaluateQueryParameter('imageSetState');
	selectedImageSetState = selectedImageSetState ? selectedImageSetState : 'failed';

	return (
		<form action='' id='tabManagerControlsForm' method='get'>
			<div className={css.tabManagerControls} >
				<div className={css.tabManagerControlsSectionTabs}>
					<input id="tabManagerControlsDisplayTypeFailed" value='failed' checked={selectedImageSetState === 'failed'} type="radio" name="imageSetState" onChange={() => displayStateChange()}/>
					<label htmlFor="tabManagerControlsDisplayTypeFailed">Failed</label>
					<input id="tabManagerControlsDisplayTypePassed" value='passed' checked={selectedImageSetState === 'passed'} type="radio" name="imageSetState" onChange={() => displayStateChange()}/>
					<label htmlFor="tabManagerControlsDisplayTypePassed">Passed</label>
					<input id="tabManagerControlsDisplayTypeAll" type="radio" value='all' checked={selectedImageSetState === 'all'} name="imageSetState" onChange={() => displayStateChange()}/>
					<label htmlFor="tabManagerControlsDisplayTypeAll">All</label>
				</div>
				<div className={css.tabManagerControlsSectionProject}>
					<select name='projectId' onChange={() => displayStateChange()}>
						<option key={-1} value={-1}>All Projects</option>
						{ getProjectOptions() }
					</select>
					<button onClick={ (event) => createProject(event) }>Create</button>
					<button onClick={ (event) => editProject(event) }>Edit</button>
					<button onClick={ (event) => deleteProject(event) }>Delete</button>
				</div>
			</div>
		</form>
	)
};

export default TabManagerControls;