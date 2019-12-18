import * as React from "react";
import css from "./header.scss";
import connector from "../helper/connector";

const Header = ({data, checkAllCallback}) => {
	const checkAllClick = (checkAllCallback) => {
		connector.checkAll().then(result => {
			checkAllCallback(result);
		});
	};

	return (
		<div>
			<title>ICS</title>

			<div className={css.header}>
				<h1 className={css.headerHeadline}>Image Comparison Server</h1>

				<div>{data.jobName}</div>
				<progress value={data.processedImageCount} max={10} className={css.headerHeadlineProgressBar} />
				<div className={css.headerSecondaryInformation}>
					<div>Max Pix. Difference: {data.maxActualPixDiff}</div>
					<div>Last Job Finished: {data.jobRunTimestamp}</div>
				</div>

				<button className={css.headerButton} onClick={() => checkAllClick(checkAllCallback)}>Check all</button>
			</div>
		</div>
	)
};

export default Header;