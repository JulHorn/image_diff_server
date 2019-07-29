import * as React from "react";
import ContentTableHeadlineRow from "../contentTableHeadlineRow/contentTableHeadlineRow";
import ContentTableImageRow from "../contentTableImageRow/contentTableImageRow";
import ContentTableDataRow from "../contentTableDataRow/contentTableDataRow";
import css from "./contentTable.scss";
import connector from "../helper/connector";

const ContentTable = ({ projectsToDraw, availableProjects, dataModificationCallback }) => {
	const deleteImageSet = (id) => {
		connector.delete(id).then((result) => {
			dataModificationCallback(result);
		})
	};

	// ToDo: Make a method out of this
	const rowsToDraw = [];

	for (const project of projectsToDraw) {
		for (const imageSet of project.imageSets) {
			const imageSetName = imageSet.referenceImage ? imageSet.referenceImage.name : imageSet.newImage.name;

			rowsToDraw.push(
			<table key={imageSet.id} className={css.contentTable}>
				<tbody>
					<ContentTableHeadlineRow imageSetName={imageSetName} currentProject={'TestProject'} availableProjects={availableProjects} />
					<ContentTableImageRow imageSet={imageSet} />
					<ContentTableDataRow deleteImageSetCallback={(id) => deleteImageSet(id) } setNewReferenceImageCallback={(result) => dataModificationCallback(result)} imageSet={imageSet} />
				</tbody>
			</table>);
		}
	}

	return (
		<div className={css.contentTableContainer}>
			<table className={css.contentTableHeadline}>
				<thead>
					<tr>
						<th>Reference Image</th>
						<th>New Image</th>
						<th>Diff Image</th>
					</tr>
				</thead>
			</table>
			{ rowsToDraw }
		</div>
	)
};

export default ContentTable;