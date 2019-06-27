import * as React from 'react'
import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import ContentTable from "./components/contentTable/contentTable";
import connector from "./components/helper/connector"
import fetch from 'isomorphic-unfetch'

const IndexPage  = ({jobName}) => {
	return (
		<div>
			<Header jobName="TestJob" lastJobFinished="10.10.10" maxPixDiff={100} progress={100} checkAllCallback={() => {const endpoint = connector.getServerEndpoint();
				console.log(endpoint);}}/>
			<ContentTable jobName={jobName} progress={1} maxPixDiff={1} lastJobFinished={"11.11.11"}/>
			<Footer />
		</div>
	)
};

IndexPage.getInitialProps = async ({ } ) => {
	// var imageManipulatorRepository = require('/logic/ImageManipulatorRepository');

	// console.log(imageManipulatorRepository.getLastActiveJob());
	let res = {};
	fetch('http://localhost:3001/api/', {method: 'GET', headers: {'Content-Type': 'application/json'}}).then( r => r.json() )
			.then( data => {
				console.log(data);
				res = data;
			});

	// const json = await res2.json();
	// console.log(json);

	return {jobName: 'json', progress: 0, maxPixDiff: 0, lastJobFinished: ''}
};

export default IndexPage
