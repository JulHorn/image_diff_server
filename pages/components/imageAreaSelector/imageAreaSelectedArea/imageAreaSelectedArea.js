import React, {useState} from 'react'
import css from "./imageAreaSelectedArea.scss";

const ImageAreaSelectedArea = ({ x, y, width, height}) => {

	const render = () => {
		const dimension = {
			width: width,
			height: height,
			top: y,
			left: x
		};

		console.log('Render', dimension);

		return <div style={ dimension } className={ css.area } />
	};

	return (
		render()
	)
};

export default ImageAreaSelectedArea;