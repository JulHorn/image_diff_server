import * as React from "react";
import css from "./contentTableDataRowNewCell.scss";

const ContentTableDataRowNewCell = ({ newImageData }) => {

	return (
			<td>
				<div> Height: {newImageData.height}px </div>
				<div> Width: {newImageData.width}px </div>
			</td>
	)
};

export default ContentTableDataRowNewCell;