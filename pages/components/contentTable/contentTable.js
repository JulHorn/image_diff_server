import * as React from "react";
import ContentTableHeadlineRow from "../contentTableHeadlineRow/contentTableHeadlineRow";
import ContentTableImageRow from "../contentTableImageRow/contentTableImageRow";
import ContentTableDataRow from "../contentTableDataRow/contentTableDataRow";

const ContentTable = ({ projectsToDraw, availableProjects }) => {
	const rowsToDraw = [];

	for (const project of projectsToDraw) {
		for (const imageSet of project.imageSets) {
			rowsToDraw.push(<ContentTableHeadlineRow imageSetName={'ImageSetName'} currentProject={'TestProject'} availableProjects={availableProjects} />);
			rowsToDraw.push(<ContentTableImageRow />);
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
					<ContentTableHeadlineRow imageSetName={'ImageSetName'} currentProject={'TestProject'} availableProjects={availableProjects} />
					{ rowsToDraw }
				</tbody>
			</table>
			{ availableProjects }
		</div>
	)
};

export default ContentTable;