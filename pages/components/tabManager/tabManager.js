import * as React from "react";
import ContentTable from "../contentTable/contentTable";
import TabManagerControls from "./tabManagerControls/tabManagerControls"
import css from "./tabManager.scss";

const TabManager = ({ projects, availableProjects, displayTypeChangeCallback }) => {
	return (
		<div className={css.tabManager} >
			<div className={css.tabManagerHeader}>
				<TabManagerControls displayTypeChangeCallback={displayTypeChangeCallback} availableProjects={availableProjects}/>
			</div>

			// It might be better to use a padding for the content stuff for left, right and bottom
			<div className={css.tabManagerContent}>
				<ContentTable projectsToDraw={projects} availableProjects={availableProjects} />
			</div>
		</div>
	)
};

export default TabManager;