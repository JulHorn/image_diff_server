import React, {useState} from 'react'
import css from "./imageAreaSelector.scss";
import ImageAreaSelectedArea from "./imageAreaSelectedArea/imageAreaSelectedArea";

const ImageAreaSelector = ({ state }) => {
	let mouseStartPointX;
	let mouseStartPointY;

	const [areasState, setAreasState] =
		useState({
			selectedAreas: []
		});


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

			const selectedAreasTmp = areasState.selectedAreas;
			selectedAreasTmp.push(selectedArea);
			setAreasState({ selectedAreas: selectedAreasTmp});
		}

		console.log('Mouse up');
		mouseStartPointY = null;
		mouseStartPointY = null;
	};

	const mouseLeave = () => {
		mouseStartPointX = null;
		mouseStartPointY = null;
	};

	const renderAreas = () => {
		const areasToRender = [];

		for (const areaState of areasState.selectedAreas) {
			areasToRender.push(<ImageAreaSelectedArea height={ areaState.height } width={ areaState.width } x={ areaState.x } y={ areaState.y } />);
			console.log('Area', areaState);
		}

		return areasToRender;
	};

	const render = () => {
		let content = null;

		if (state.visible) {
			content = <div className={ css.imageAreaSelector }>
				<div className={css.imageAreaSelectorImageArea}>
					<div onMouseDown={(event) => mouseDownEvent(event)} onMouseUp={(event) => mouseUpEvent(event)} className={css.imageAreaSelectorSelectLayer}> </div>
					{ renderAreas() }
					<img src={state.imagePath} alt='' />
				</div>
				<div className={css.imageAreaSelectorActionArea}>
					<button onClick={ () => state.applyClickCallback( state.imageSetId, areasState.selectedAreas ) }>Apply</button>
					<button onClick={ () => state.cancelClickCallback() }>Cancel</button>
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