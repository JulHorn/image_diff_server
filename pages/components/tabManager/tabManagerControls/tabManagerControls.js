import * as React from "react";
import css from "./tabManagerControls.scss";

const TabManagerControls = ({ availableProjects }) => {
	return (
		<div className={css.tabManagerControls} >
			<div className={css.tabManagerControlsSectionTabs}></div>
			<div className={css.tabManagerControlsSectionProject}></div>
		</div>
	)
};

export default TabManagerControls;