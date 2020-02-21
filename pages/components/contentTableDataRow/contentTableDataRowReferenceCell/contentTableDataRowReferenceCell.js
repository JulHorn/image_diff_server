import * as React from "react";
import css from "./contentTableDataRowReferenceCell.scss";

const ContentTableDataRowReferenceCell = ({ referenceImageData, deleteImageSetCallback, addImageIgnoreRegionsCallback, addImageCheckRegionsCallback }) => {

	const renderRegionSelectInfo = () => {
		// ToDo: Use proper areas object instead
		if (referenceImageData.height && referenceImageData.height !== 0) {
			return 	<span>
						<div> Ignore Areas: {referenceImageData.ignoreAreas} </div>
						<div> Check Areas: {referenceImageData.checkAreas} </div>
					</span>
		}

		return null
	};

	const renderRegionSelectButtons = () => {
		const disableButtons = referenceImageData.height || referenceImageData.width === 0;

		return 	<span>
					<button disabled={ disableButtons } onClick={ () => addImageIgnoreRegionsCallback() }>Add Ignore Area</button>
					<button disabled={ disableButtons } onClick={ () => addImageCheckRegionsCallback () }>Add Check Area</button>
				</span>
	};

	return (
			<td className={css.contentTableDataRowReferenceCell}>
				<div className={css.contentTableDataRowReferenceCellInformationContainer}>
					<div className={css.contentTableDataRowReferenceCellInformationContainerFirstBlock}>
						<div> Height: {referenceImageData.height}px </div>
						<div> Width: {referenceImageData.width}px </div>
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