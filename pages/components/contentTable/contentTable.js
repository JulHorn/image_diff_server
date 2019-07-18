import * as React from "react";
import ContentTableHeadlineRow from "../contentTableHeadlineRow/contentTableHeadlineRow";
import ContentTableImageRow from "../contentTableImageRow/contentTableImageRow";
import ContentTableDataRow from "../contentTableDataRow/contentTableDataRow";

const ContentTable = ({ projectsToDraw, availableProjects }) => {
	// ToDo: Make a method out of this
	const rowsToDraw = [];

	for (const project of projectsToDraw) {
		for (const imageSet of project.imageSets) {
			const imageSetName = imageSet.referenceImage ? imageSet.referenceImage.name : imageSet.newImage.name;

			rowsToDraw.push(<ContentTableHeadlineRow imageSetName={imageSetName} currentProject={'TestProject'} availableProjects={availableProjects} />);
			rowsToDraw.push(<ContentTableImageRow imageSet={imageSet} />);
			rowsToDraw.push(<ContentTableDataRow imageSet={imageSet} />);
		}
	}

	return (
		<div>
			<table>
				<thead>
					<th>Reference Image</th>
					<th>New Image</th>
					<th>Diff Image</th>
				</thead>
				<tbody>
					{ rowsToDraw }
				</tbody>
			</table>
			{ availableProjects }
		</div>
	)
};

export default ContentTable;