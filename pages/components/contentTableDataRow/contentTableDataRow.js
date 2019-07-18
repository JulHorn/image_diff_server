import * as React from "react";
import ContentTableDataRowReferenceCell from "./contentTableDataRowReferenceCell/contentTableDataRowReferenceCell"
import ContentTableDataRowNewCell from "./contentTableDataRowNewCell/contentTableDataRowNewCell"
import ContentTableDataRowDiffCell from "./contentTableDataRowDiffCell/contentTableDataRowDiffCell"
import css from "./contentTableDataRow.scss";

const ContentTableDataRow = ({ imageSet }) => {

	return (
		<tr>
			<ContentTableDataRowReferenceCell referenceImageData={imageSet.referenceImage} />
			<ContentTableDataRowNewCell newImageData={imageSet.newImage} />
			<ContentTableDataRowDiffCell diffImageData={imageSet.diffImage} />
		</tr>

	)
};

export default ContentTableDataRow;