import * as React from "react";
import css from "./contentTableDataRowNewCell.scss";

const ContentTableDataRowNewCell = ({ newImageData, setNewReferenceCallback }) => {

	// Can be removed if truly not more logic is needed
	const makeToNewReferenceClick = (setNewReferenceCallback) => {
		setNewReferenceCallback();
	};

	return (
			<td>
				<div> Height: {newImageData.height}px </div>
				<div> Width: {newImageData.width}px </div>
				<div>
					<button onClick={() => makeToNewReferenceClick(setNewReferenceCallback)}>New Reference</button>
				</div>
			</td>
	)
};

export default ContentTableDataRowNewCell;