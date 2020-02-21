import * as React from "react";
import ContentTableDataRowReferenceCell from "./contentTableDataRowReferenceCell/contentTableDataRowReferenceCell"
import ContentTableDataRowNewCell from "./contentTableDataRowNewCell/contentTableDataRowNewCell"
import ContentTableDataRowDiffCell from "./contentTableDataRowDiffCell/contentTableDataRowDiffCell"
import css from "./contentTableDataRow.scss";
import connector from "../helper/connector";

const ContentTableDataRow = ({ imageSet, setNewReferenceImageCallback, deleteImageSetCallback, addImageCheckRegionsCallback, addImageIgnoreRegionsCallback }) => {

	// ToDo Move this a level up because the spinner needs to go over the complete row
	const setNewReferenceImageRowCallback = (id) => {
		connector.setToNewReferenceImage(id).then((result) => {
			setNewReferenceImageCallback(result);
		})
	};

	return (
		<tr>
			<ContentTableDataRowReferenceCell deleteImageSetCallback={() => deleteImageSetCallback(imageSet.id)} referenceImageData={imageSet} addImageIgnoreRegionsCallback={ () => addImageIgnoreRegionsCallback(imageSet) } addImageCheckRegionsCallback={ () => addImageCheckRegionsCallback(imageSet) } />
			<ContentTableDataRowNewCell newImageData={imageSet.newImage} setNewReferenceCallback={() => setNewReferenceImageRowCallback(imageSet.id)} />
			<ContentTableDataRowDiffCell diffImageData={imageSet.diffImage} />
		</tr>
	)
};

export default ContentTableDataRow;