import * as React from "react";
import HeaderPropsInterface from "./headerPropsInterface";


class Header extends React.Component <HeaderPropsInterface> {

	constructor(props: HeaderPropsInterface) {
		super(props);
	}

	render() {
		return (
			<div>
				<title>ICS</title>

				<div>
					<table>
						<tr>
							<td>Job: {this.props.jobName}</td>
							<td>Max Pix. Difference: {this.props.maxPixDiff}</td>
						</tr>
						<tr>
							<td>Progress: {this.props.progress}</td>
							<td>Last Job Finished: {this.props.lastJobFinished}</td>
						</tr>
					</table>
				</div>
			</div>
		)
	}
}

export default Header;