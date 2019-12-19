import * as React from "react";
import css from "./contentTableImageRow.scss";

const ContentTableImageRow = ({ imageSet }) => {

	const uncachedImagePath = (imagePath) => {
		return  imagePath + '?timestamp=' + new Date().getTime();
	};

	return (
		<tr>
			<td> <a href={uncachedImagePath(imageSet.referenceImage.path)} target={'_blank'}> <img src={uncachedImagePath(imageSet.referenceImage.path)}  alt={''}/> </a> </td>
			<td> <a href={uncachedImagePath(imageSet.newImage.path)} target={'_blank'}> <img src={uncachedImagePath(imageSet.newImage.path)} alt={''} /> </a> </td>
			<td> <a href={uncachedImagePath(imageSet.diffImage.path)} target={'_blank'}> <img src={uncachedImagePath(imageSet.diffImage.path)} alt={''} />  </a> </td>
		</tr>

	)
};

export default ContentTableImageRow;