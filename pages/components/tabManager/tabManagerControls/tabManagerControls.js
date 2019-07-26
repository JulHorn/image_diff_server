import * as React from "react";
import css from "./tabManagerControls.scss";

const TabManagerControls = ({ displayTypeChangeCallback, availableProjects }) => {
	// ToDo: Probably make a function out of this or remove parameter
	const displayTypeChangeClick = (displayType, displayTypeChangeCallback) => {
		displayTypeChangeCallback(displayType);
	};

	return (
		<div className={css.tabManagerControls} >
			<div className={css.tabManagerControlsSectionTabs}>
				<input id="tabManagerControlsDisplayTypeFailed" type="radio" name="displayType" onClick={() => displayTypeChangeClick(0, displayTypeChangeCallback)}/>
				<label htmlFor="tabManagerControlsDisplayTypeFailed">Failed</label>
				<input id="tabManagerControlsDisplayTypePassed" type="radio" name="displayType" onClick={() => displayTypeChangeClick(1, displayTypeChangeCallback)}/>
				<label htmlFor="tabManagerControlsDisplayTypePassed">Passed</label>
				<input id="tabManagerControlsDisplayTypeAll" type="radio" name="displayType" onClick={() => displayTypeChangeClick(2, displayTypeChangeCallback)}/>
				<label htmlFor="tabManagerControlsDisplayTypeAll">All</label>
			</div>
			<div className={css.tabManagerControlsSectionProject}>
				<select>
					<option value={-1}>All Projects</option>
				</select>
				<button>Create</button>
				<button>Edit</button>
				<button>Delete</button>
			</div>
		</div>
	)
};

export default TabManagerControls;