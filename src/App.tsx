import React from 'react';
import { makeStyles } from '@material-ui/core';
import { AnalyticsProvider } from './hooks/analytics';
import Unmagic from './components/Unmagic';

const useStyles = makeStyles(() => ({
	root: {},
}));

export default function App(): JSX.Element {
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<AnalyticsProvider>
				<Unmagic />
			</AnalyticsProvider>
		</div>
	);
}
