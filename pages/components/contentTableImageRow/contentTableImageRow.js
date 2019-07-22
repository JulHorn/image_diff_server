import * as React from "react";
import css from "./contentTableImageRow.scss";

const ContentTableImageRow = ({ imageSet }) => {
	return (
		<tr>
			<td> <img className={css.contentTableImageRowCellImage} src={imageSet.referenceImage.path} /> </td>
			<td> <img className={css.contentTableImageRowCellImage} src={imageSet.newImage.path} /> </td>
			<td> <img className={css.contentTableImageRowCellImage} src={imageSet.diffImage.path} /> </td>
		</tr>

	)
};

export default ContentTableImageRow;