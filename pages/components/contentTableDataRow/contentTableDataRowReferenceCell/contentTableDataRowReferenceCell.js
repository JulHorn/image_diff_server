import * as React from "react";
import css from "./contentTableDataRowReferenceCell.scss";

const ContentTableDataRowReferenceCell = ({ referenceImageData }) => {

	return (
			<td>
				<div> Height: {referenceImageData.height}px </div>
				<div> Width: {referenceImageData.width}px </div>
				<div> Ignore Areas: {referenceImageData.ignoreAreas} </div>
				<div> Check Areas: {referenceImageData.checkAreas} </div>
			</td>
	)
};

export default ContentTableDataRowReferenceCell;