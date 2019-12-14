import React, {useState} from 'react'
import css from "./imageAreaSelector.scss";

const ImageAreaSelector = ({ image, applyCallback, showCallback }) => {
	console.log( image, ' image');

	const [internalState, setInternalState] =
		useState({
			display: false
		});

	// Use internal state to decide if it should be displayed or not

	return (
		<div className={ internalState.display ? css.imageAreaSelectorShow : css.imageAreaSelector }>
			<div className={css.imageAreaSelectorImageArea}>
				<img src={image.path} alt='' />
			</div>
			<div className={css.imageAreaSelectorActionArea}>
				<button onClick={ () => applyCallback('Whoop') }> Apply </button>
				<button> Cancel </button>
			</div>

		</div>
	)
};

export default ImageAreaSelector;