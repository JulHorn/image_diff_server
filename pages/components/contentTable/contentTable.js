import * as React from "react";
import contentTableRow from "../contentTableRow/contentTableRow";

const ContentTable = ({ projectsToDraw, availableProjects }) => {
	return (
		<div>
			<table>
				<thead>
					<th>Reference Image</th>
					<th>New Image</th>
					<th>Diff Image</th>
				</thead>
				<tbody>

				</tbody>
			</table>
			{ availableProjects }
		</div>
	)
};

export default ContentTable;