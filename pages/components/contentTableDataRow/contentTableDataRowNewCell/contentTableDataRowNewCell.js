import * as React from "react";
import css from "./contentTableDataRowNewCell.scss";

const ContentTableDataRowNewCell = ({ newImageData, setNewReferenceCallback }) => {

	return (
			<td className={css.contentTableDataRowNewCell}>
				<div> Height: {newImageData.height}px </div>
				<div> Width: {newImageData.width}px </div>
				<div>
					<button onClick={() => setNewReferenceCallback()}>New Reference</button>
				</div>
			</td>
	)
};

export default ContentTableDataRowNewCell;