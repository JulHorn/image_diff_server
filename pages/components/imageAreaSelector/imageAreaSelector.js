import React, {useState} from 'react'
import css from "./imageAreaSelector.scss";

const ImageAreaSelector = ({ state }) => {
	const render = () => {
		let content = null;

		if (state.visible) {
			content = <div className={ css.imageAreaSelector }>
				<div className={css.imageAreaSelectorImageArea}>
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