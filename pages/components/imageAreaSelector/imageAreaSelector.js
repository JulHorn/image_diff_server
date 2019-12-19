import React, {useState} from 'react'
import css from "./imageAreaSelector.scss";

const ImageAreaSelector = ({ state }) => {
	let mouseStartPointX;
	let mouseStartPointY;
	let selectedAreas = [];

	const mouseDownEvent = (event) => {
		console.log('Down');
		mouseStartPointY = event.clientY;
		mouseStartPointX = event.clientX

	};

	const mouseUpEvent = (event) => {
		console.log(mouseStartPointX, mouseStartPointY);
		if (mouseStartPointX && mouseStartPointY) {
			const selectedArea = {
				x: mouseStartPointX,
				y: mouseStartPointY,
				width: Math.abs(mouseStartPointX - event.clientX),
				height: Math.abs(mouseStartPointY - event.clientY)
			};

			selectedAreas.push(selectedArea);
			console.log('Mouse Up selected area', selectedArea);
		}

		console.log('Mouse up');
		mouseStartPointY = null;
		mouseStartPointY = null;
	};

	const mouseLeave = () => {
		mouseStartPointX = null;
		mouseStartPointY = null;
	};

	const render = () => {
		let content = null;

		if (state.visible) {
			content = <div className={ css.imageAreaSelector }>
				<div className={css.imageAreaSelectorImageArea}>
					<div onMouseDown={(event) => mouseDownEvent(event)} onMouseUp={(event) => mouseUpEvent(event)} className={css.imageAreaSelectorSelectLayer}> </div>
					<img src={state.imagePath} alt='' />
				</div>
				<div className={css.imageAreaSelectorActionArea}>
					<button onClick={ () => state.applyClickCallback({}) }> Apply </button>
					<button onClick={ () => state.cancelClickCallback() }> Cancel </button>
				</div>
			</div>
		}

		return content
	};

	return (
		render()
	)
};

export default ImageAreaSelector;