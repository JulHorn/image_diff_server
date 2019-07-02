import * as React from "react";
import ContentTable from "../contentTable/contentTable";
import css from "./tabManager.scss";

const TabManager = ({ projects, availableProjects }) => {
	return (
		<div>
			<div className={css.tabManagerHeader}>
				<div className={css.tabManagerHeaderTabs}> </div>
				<div className={css.tabManagerHeaderProjectControls}> </div>
				{/*<ContentTable />*/}
			</div>
			<div>
				<ContentTable projectToDraw={[]} availableProjects={availableProjects} />
			</div>
		</div>
	)
};

export default TabManager;