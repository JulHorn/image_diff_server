import * as React from "react";
import css from "./contentTableDataRowReferenceCell.scss";

const ContentTableDataRowReferenceCell = ({ referenceImageData, deleteImageSetCallback, addImageIgnoreRegionsCallback, addImageCheckRegionsCallback }) => {
	console.log('referenceImageData', referenceImageData);
	const renderRegionSelectInfo = () => {
		// ToDo: Use proper areas object instead
		return 	<span>
					<div> Ignore Areas: {referenceImageData.ignoreAreas.length || 0} </div>
					<div> Check Areas: {referenceImageData.checkAreas.length || 0} </div>
				</span>
	};

	const renderRegionSelectButtons = () => {
		const disableButtons = referenceImageData.referenceImage.height === 0 || referenceImageData.referenceImage.width === 0;

		return 	<span>
					<button disabled={ disableButtons } onClick={ () => addImageIgnoreRegionsCallback() }>Add Ignore Area</button>
					<button disabled={ disableButtons } onClick={ () => addImageCheckRegionsCallback () }>Add Check Area</button>
				</span>
	};

	return (
			<td className={css.contentTableDataRowReferenceCell}>
				<div className={css.contentTableDataRowReferenceCellInformationContainer}>
					<div className={css.contentTableDataRowReferenceCellInformationContainerFirstBlock}>
						<div> Height: {referenceImageData.referenceImage.height}px </div>
						<div> Width: {referenceImageData.referenceImage.width}px </div>
					</div>
					{ renderRegionSelectInfo() }
				</div>

				<div>
					<button onClick={ () => deleteImageSetCallback() }>Delete Set</button>

					{ renderRegionSelectButtons() }
				</div>
			</td>
	)
};

export default ContentTableDataRowReferenceCell;