import * as React from "react";
import contentTableHeadlineRow from "../contentTableHeadlineRow/contentTableHeadlineRow";
import contentTableImageRow from "../contentTableImageRow/contentTableImageRow";
import contentTableDataRow from "../contentTableDataRow/contentTableDataRow";

const ContentTable = ({ projectsToDraw, availableProjects }) => {
	const rowsToDraw = [];

	for (const [projectIndex, project] of projectsToDraw) {
		for (const [imageSetIndex, imageSet] of project.getImageSets()) {
			rowsToDraw.push(<contentTableHeadlineRow imageSetName={'ImageSetName'} currentProject={'TestProject'} availableProjects={availableProjects} />);
			rowsToDraw.push(<contentTableImageRow />);
			rowsToDraw.push(<contentTableDataRow imageSet={} />);
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