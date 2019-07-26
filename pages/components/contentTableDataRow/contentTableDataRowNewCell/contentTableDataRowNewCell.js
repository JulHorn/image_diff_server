import * as React from "react";
import css from "./contentTableDataRowNewCell.scss";

const ContentTableDataRowNewCell = ({ newImageData, makeToNewReferenceCallback }) => {

	const makteToNewReferenceClick = () => {
		makeToNewReferenceCallback();
	};

	return (
			<td>
				<div> Height: {newImageData.height}px </div>
				<div> Width: {newImageData.width}px </div>
				<div>
					<button onClick={() => makteToNewReferenceClick()}>New Reference</button>
				</div>
			</td>
	)
};

export default ContentTableDataRowNewCell;