import * as React from "react";
import css from "./tabManagerControls.scss";
import { useRouter } from 'next/router';

const TabManagerControls = ({ availableProjects }) => {
	const evaluateQueryParameter = (param) => {
		const router = useRouter();
		const query = router.query;

		return query[param];
	};

	const displayStateChange = () => {
		const form = document.getElementById('tabManagerControlsForm');
		form.submit();
	};

	// Render stuff
	const selectedImageSetState = evaluateQueryParameter('imageSetState');

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
						<option value={-1}>All Projects</option>
					</select>
					<button>Create</button>
					<button>Edit</button>
					<button>Delete</button>
				</div>
			</div>
		</form>
	)
};

export default TabManagerControls;