import * as React from "react";
import { NextPage } from 'next'

interface ContentTablePropsInterface{
	jobName: string;
	progress: number;
	maxPixDiff: number;
	lastJobFinished: string;
}

const ContentTable: NextPage<ContentTablePropsInterface>  = ({ jobName }) => {
	return (
		<div>
			{ jobName }
		</div>
	)
};

export default ContentTable;