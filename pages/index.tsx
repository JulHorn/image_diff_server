import * as React from 'react'
import Header from "./header/header";
import Footer from "./footer/footer";

const IndexPage: React.FunctionComponent<{}>  = ({}): React.ReactElement => {
	return (
		<div>
			<Header jobName="TestJob" lastJobFinished="10.10.10" maxPixDiff={100} progress={100} />
			<Footer />
		</div>
	)
};

export default IndexPage
