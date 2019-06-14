import * as React from "react";
import css from "./header.scss";

interface HeaderPropsInterface{
	jobName: string;
	progress: number;
	maxPixDiff: number;
	lastJobFinished: string;
	checkAllCallback: any;
}

const Header: React.FunctionComponent<HeaderPropsInterface>  = ({jobName, progress, maxPixDiff, lastJobFinished, checkAllCallback}): React.ReactElement => {
	return (
		<div>
			<title>ICS</title>

			<div className={css.header}>
				<h1 className={css.headerHeadline}>Image Comparison Server</h1>

				<table className={css.headerTable}>
					<tbody>
						<tr>
							<td>Job: {jobName}</td>
							<td>Max Pix. Difference: {maxPixDiff}</td>
						</tr>
						<tr>
							<td>Progress: {progress}</td>
							<td>Last Job Finished: {lastJobFinished}</td>
						</tr>
					</tbody>
				</table>
				<button className={css.headerButton} onClick={checkAllCallback}>Check all</button>
			</div>
		</div>
	)
};

export default Header;