import * as React from "react";
import css from "./contentTableDataRowReferenceCell.scss";

const ContentTableDataRowReferenceCell = ({ referenceImageData }) => {

	return (
			<td>
				<div> Height: {referenceImageData.height}px </div>
				<div> Width: {referenceImageData.width}px </div>
				<div> Ignore Areas: {referenceImageData.ignoreAreas} </div>
				<div> Check Areas: {referenceImageData.checkAreas} </div>
				<div>
					<button>Delete Set</button>
					<button>Add Ignore Area</button>
					<button>Add Check Area</button>
				</div>
			</td>
	)
};

export default ContentTableDataRowReferenceCell;