import * as React from 'react'
import Header from "./header/header";
import Footer from "./footer/footer";

class IndexPage extends React.Component {
	render() {
		return (
			<div>
				<Header jobName="TestJob" lastJobFinished="10.10.10" maxPixDiff={100} progress={100} />
				<Footer />
			</div>
		)
	}
}

export default IndexPage
