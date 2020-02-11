import React, {useState} from 'react'
import css from "./imageAreaSelector.scss";
import ImageAreaSelectedArea from "./imageAreaSelectedArea/imageAreaSelectedArea";

// ToDo: Rename deconstructed  value and maybe deconstruct it more
const ImageAreaSelector = ({ state }) => {
	let mouseStartPointX;
	let mouseStartPointY;

	const [areasState, setAreasState] =
		useState({
			selectedAreas: []
		});

	const mouseDownEvent = (event) => {
		mouseStartPointY = event.clientY;
		mouseStartPointX = event.clientX

	};

	const mouseUpEvent = (event) => {
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
		}

		return areasToRender;
	};

	const resetState = () => {
		setAreasState({
			selectedAreas: []
		});
	};

	const render = () => {
		let content = null;

		// ToDo: There has to be a better way...
		if (state.imageSetMarkedAreas && state.imageSetMarkedAreas.length > 0 && areasState.selectedAreas.length === 0) {
			setAreasState({
				selectedAreas: state.imageSetMarkedAreas || []
			});
		}

		if (state.visible) {
			content = <div className={ css.imageAreaSelector }>
				<div className={css.imageAreaSelectorImageArea}>
					<div onMouseDown={(event) => mouseDownEvent(event)} onMouseUp={(event) => mouseUpEvent(event)} className={css.imageAreaSelectorSelectLayer}> </div>
					{ renderAreas() }
					<img src={state.imagePath} alt='' />
				</div>
				<div className={css.imageAreaSelectorActionArea}>
					<button onClick={ () => { state.applyClickCallback( state.imageSetId, areasState.selectedAreas); resetState(); }}>Apply</button>
					<button onClick={ () => { state.cancelClickCallback(); resetState(); }}>Cancel</button>
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