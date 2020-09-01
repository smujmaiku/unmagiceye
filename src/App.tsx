import React from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import { AnalyticsProvider } from './hooks/analytics';
import Unmagic from './components/Unmagic';

const useStyles = makeStyles((theme) => ({
	root: {
		paddingBottom: theme.spacing(2),
	},
	branding: {
		textAlign: 'right',
		marginRight: theme.spacing(2),
		'& a': {
			color: 'inherit',
		}
	},
}));

export default function App(): JSX.Element {
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<AnalyticsProvider>
				<Unmagic />
				<div className={classes.branding}>
					<a href="https://smuj.dev" target="_blank" rel="noreferrer">
						<Typography>
							~ Michael Szmadzinski
						</Typography>
					</a>
				</div>
			</AnalyticsProvider>
		</div>
	);
}
