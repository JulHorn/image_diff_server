import * as React from "react";
import css from "./contentTableDataRowDiffCell.scss";

const ContentTableDataRowDiffCell = ({ diffImageData }) => {

	return (
			<td>
				<div> Height: {diffImageData.height}px </div>
				<div> Width: {diffImageData.width}px </div>
			</td>
	)
};

export default ContentTableDataRowDiffCell;