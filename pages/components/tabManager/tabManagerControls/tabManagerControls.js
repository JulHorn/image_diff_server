import * as React from "react";
import css from "./tabManagerControls.scss";
import {useRouter} from 'next/router';
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
			console.log('Project added: ', result);
		}

	};

	const editProject = async (event) => {
		const projectSelect = document.getElementById('projectSelector');
		const selectedOptionIndex = projectSelect.selectedIndex;
		const selectedOption = projectSelect.options[selectedOptionIndex];
		const selectedProjectName = selectedOption.text;
		const selectedProjectId = selectedOption.value;

		event.preventDefault();
		event.stopPropagation();

		var newProjectName = prompt('Please enter the new project name for the project "' + selectedProjectName + '" (ID:' + selectedProjectId + ' )','');

		if (newProjectName) {
			const result = await connector.editProject(newProjectName, selectedProjectId);
			console.log('Project renamed: ', result);
		}
	};

	const deleteProject = async (event) => {
		const projectSelect = document.getElementById('projectSelector');
		const selectedOptionIndex = projectSelect.selectedIndex;
		const selectedOption = projectSelect.options[selectedOptionIndex];
		const selectedProjectName = selectedOption.text;
		const selectedProjectId = selectedOption.value;

		event.preventDefault();
		event.stopPropagation();

		if (confirm('Dou you really want to delete the project ' + selectedProjectName + '? All items of that project will be deleted too.')) {
			const result = await connector.removeProject(selectedProjectId);
			console.log('Delete project id: ', selectedProjectId);
		}
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
					<label className={selectedImageSetState === 'failed' ? css.tabManagerControlsSectionTabsTabActive : undefined} htmlFor="tabManagerControlsDisplayTypeFailed">Failed</label>
					<input id="tabManagerControlsDisplayTypePassed" value='passed' checked={selectedImageSetState === 'passed'} type="radio" name="imageSetState" onChange={() => displayStateChange()}/>
					<label className={selectedImageSetState === 'passed' ? css.tabManagerControlsSectionTabsTabActive : undefined} htmlFor="tabManagerControlsDisplayTypePassed">Passed</label>
					<input id="tabManagerControlsDisplayTypeAll" type="radio" value='all' checked={selectedImageSetState === 'all'} name="imageSetState" onChange={() => displayStateChange()}/>
					<label className={selectedImageSetState === 'all' ? css.tabManagerControlsSectionTabsTabActive : undefined} htmlFor="tabManagerControlsDisplayTypeAll">All</label>
				</div>
				<div className={css.tabManagerControlsSectionProject}>
					<select id='projectSelector' name='projectId' onChange={() => displayStateChange()}>
						<option key={-1} value={-1}>All Projects</option>
						{ getProjectOptions() }
					</select>
					<button onClick={ (event) => createProject(event) }><FontAwesomeIcon icon={faPlus} /></button>
					<button onClick={ (event) => editProject(event) }><FontAwesomeIcon icon={faEdit} /></button>
					<button onClick={ (event) => deleteProject(event) }><FontAwesomeIcon icon={faTrash} /></button>
				</div>
			</div>
		</form>
	)
};

export default TabManagerControls;