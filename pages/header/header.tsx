import * as React from "react";

interface HeaderPropsInterface{
	jobName: string;
	progress: number;
	maxPixDiff: number;
	lastJobFinished: string;
}

const Header: React.FunctionComponent<HeaderPropsInterface>  = ({jobName, progress, maxPixDiff, lastJobFinished}): React.ReactElement => {
	return (
		<div>
			<title>ICS</title>

			<div>
				<table>
					<tr>
						<td>Job: {jobName}</td>
						<td>Max Pix. Difference: {maxPixDiff}</td>
					</tr>
					<tr>
						<td>Progress: {progress}</td>
						<td>Last Job Finished: {lastJobFinished}</td>
					</tr>
				</table>
			</div>
		</div>
	)
};

// class Header extends React.Component <HeaderPropsInterface> {
//
// 	constructor(props: HeaderPropsInterface) {
// 		super(props);
// 	}
//
// 	render() {
// 		return (
// 			<div>
// 				<title>ICS</title>
//
// 				<div>
// 					<table>
// 						<tr>
// 							<td>Job: {this.props.jobName}</td>
// 							<td>Max Pix. Difference: {this.props.maxPixDiff}</td>
// 						</tr>
// 						<tr>
// 							<td>Progress: {this.props.progress}</td>
// 							<td>Last Job Finished: {this.props.lastJobFinished}</td>
// 						</tr>
// 					</table>
// 				</div>
// 			</div>
// 		)
// 	}
// }

export default Header;