import * as React from "react";
import ContentTable from "../contentTable/contentTable";
import css from "./tabManager.scss";

const TabManager = ({ projects, availableProjects }) => {
	return (
		<div className={css.tabManager} >
			<div className={css.tabManagerHeader}>
				<div className={css.tabManagerHeaderTabs}> </div>
				<div className={css.tabManagerHeaderProjectControls}> </div>
				{/*<ContentTable />*/}
			</div>
			<div className={css.tabManagerContent}>
				<ContentTable projectsToDraw={projects} availableProjects={availableProjects} />
			</div>
		</div>
	)
};

export default TabManager;