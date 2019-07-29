import * as React from "react";
import css from "./contentTableImageRow.scss";

const ContentTableImageRow = ({ imageSet }) => {

	const uncachedImagePath = (imagePath) => {
		return  imagePath + '?timestamp=' + new Date().getTime();
	};

	return (
		<tr>
			<td> <img src={uncachedImagePath(imageSet.referenceImage.path)} /> </td>
			<td> <img src={uncachedImagePath(imageSet.newImage.path)} /> </td>
			<td> <img src={uncachedImagePath(imageSet.diffImage.path)} /> </td>
		</tr>

	)
};

export default ContentTableImageRow;