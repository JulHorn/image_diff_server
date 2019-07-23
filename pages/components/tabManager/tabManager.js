import * as React from "react";
import ContentTable from "../contentTable/contentTable";
import TabManagerControls from "./tabManagerControls/tabManagerControls"
import css from "./tabManager.scss";

const TabManager = ({ projects, availableProjects }) => {
	return (
		<div className={css.tabManager} >
			<TabManagerControls></TabManagerControls>

			<div className={css.tabManagerContent}>
				<ContentTable projectsToDraw={projects} availableProjects={availableProjects} />
			</div>
		</div>
	)
};

export default TabManager;