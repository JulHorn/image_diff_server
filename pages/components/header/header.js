import * as React from "react";
import css from "./header.scss";

const Header = ({data, checkAllCallback}) => {
	return (
		<div>
			<title>ICS</title>

			<div className={css.header}>
				<h1 className={css.headerHeadline}>Image Comparison Server</h1>

				<table className={css.headerTable}>
					<tbody>
						<tr>
							<td>Job: {data.jobName}</td>
							<td>Max Pix. Difference: {data.maxActualPixDiff}</td>
						</tr>
						<tr>
							<td>Progress: {data.processedImageCount}</td>
							<td>Last Job Finished: {data.jobRunTimestamp}</td>
						</tr>
					</tbody>
				</table>
				<button className={css.headerButton} onClick={checkAllCallback}>Check all</button>
			</div>
		</div>
	)
};

export default Header;