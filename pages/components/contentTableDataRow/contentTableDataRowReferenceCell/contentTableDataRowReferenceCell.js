import * as React from "react";
import css from "./contentTableDataRowReferenceCell.scss";

const ContentTableDataRowReferenceCell = ({ referenceImageData, deleteImageSetCallback, addImageIgnoreRegionsCallback, addImageCheckRegionsCallback }) => {

	return (
			<td>
				<div> Height: {referenceImageData.height}px </div>
				<div> Width: {referenceImageData.width}px </div>
				<div> Ignore Areas: {referenceImageData.ignoreAreas} </div>
				<div> Check Areas: {referenceImageData.checkAreas} </div>
				<div>
					<button onClick={ () => deleteImageSetCallback() }>Delete Set</button>
					<button onClick={ () => addImageIgnoreRegionsCallback() }>Add Ignore Area</button>
					<button onClick={ () => addImageCheckRegionsCallback () }>Add Check Area</button>
				</div>
			</td>
	)
};

export default ContentTableDataRowReferenceCell;