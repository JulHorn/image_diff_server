import * as React from "react";
import ContentTableHeadlineRow from "../contentTableHeadlineRow/contentTableHeadlineRow";
import ContentTableImageRow from "../contentTableImageRow/contentTableImageRow";
import ContentTableDataRow from "../contentTableDataRow/contentTableDataRow";
import css from "./contentTable.scss";

const ContentTable = ({ projectsToDraw, availableProjects, dataModificationCallback }) => {
	// ToDo: Make a method out of this
	const rowsToDraw = [];

	for (const project of projectsToDraw) {
		for (const imageSet of project.imageSets) {
			const imageSetName = imageSet.referenceImage ? imageSet.referenceImage.name : imageSet.newImage.name;

			rowsToDraw.push(
			<table className={css.contentTable}>
				<tbody>
					<ContentTableHeadlineRow imageSetName={imageSetName} currentProject={'TestProject'} availableProjects={availableProjects} />
					<ContentTableImageRow imageSet={imageSet} />
					<ContentTableDataRow setNewReferenceImageCallback={(result) => dataModificationCallback(result)} imageSet={imageSet} />
				</tbody>
			</table>);
		}
	}

	return (
		<div className={css.contentTableContainer}>
			<table className={css.contentTableHeadline}>
				<thead>
					<th>Reference Image</th>
					<th>New Image</th>
					<th>Diff Image</th>
				</thead>
			</table>
			{ rowsToDraw }
		</div>
	)
};

export default ContentTable;