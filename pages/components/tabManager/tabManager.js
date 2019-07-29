import * as React from "react";
import ContentTable from "../contentTable/contentTable";
import TabManagerControls from "./tabManagerControls/tabManagerControls"
import css from "./tabManager.scss";

const TabManager = ({ projects, availableProjects, displayTypeChangeCallback, contentDataModificationCallback }) => {
	return (
		<div className={css.tabManager} >
			<div className={css.tabManagerHeader}>
				<TabManagerControls displayTypeChangeCallback={displayTypeChangeCallback} availableProjects={availableProjects}/>
			</div>

			<div className={css.tabManagerContent}>
				<ContentTable projectsToDraw={projects} availableProjects={availableProjects} dataModificationCallback={(result) => contentDataModificationCallback(result)} />
			</div>
		</div>
	)
};

export default TabManager;