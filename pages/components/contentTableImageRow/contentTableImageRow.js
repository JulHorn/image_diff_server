import * as React from "react";
import css from "./contentTableImageRow.scss";

const ContentTableImageRow = ({ imageSet }) => {
	return (
		<tr>
			<td> <img src={imageSet.referenceImage.path} /> </td>
			<td> <img src={imageSet.newImage.path} /> </td>
			<td> <img src={imageSet.diffImage.path} /> </td>
		</tr>

	)
};

export default ContentTableImageRow;