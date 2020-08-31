import React, {
	useContext, createContext, useMemo, useState, useEffect, useCallback,
} from 'react';
import { makeStyles } from '@material-ui/core';

const context = createContext<(() => number[]) | undefined>(undefined);

interface StyleProps {
	show: boolean,
	time: number,
}

const useStyles = makeStyles((theme) => ({
	root: ({ show, time }: StyleProps) => ({
		margin: show ? 0 : theme.spacing(1, 0, -1, 0),
		opacity: show ? 1 : 0,
		transition: `all ${time.toFixed()}ms`,
	}),
}));

interface FadeInProps {
	children: JSX.Element,
	time?: number,
	margin?: number,
	noFlash?: boolean,
	ignoreGroup?: boolean,
}

export default function FadeIn(props: FadeInProps): JSX.Element {
	const {
		children,
		time = 500,
		margin = 0,
		noFlash = false,
		ignoreGroup = false,
	} = props;

	const next = useContext(context);
	const [start, fade] = useMemo(() => {
		if (next && !ignoreGroup) {
			return next();
		} else {
			return [margin, time];
		}
	}, [margin, time, ignoreGroup, next]);
	const [show, setShow] = useState(false);
	const [done, setDone] = useState(false);

	useEffect(() => {
		if (show) return () => undefined;

		const timer = setTimeout(() => setShow(true), start);

		return () => {
			clearTimeout(timer);
		};
	}, [show, start]);

	useEffect(() => {
		if (!show || done) return () => undefined;
		const timer = setTimeout(() => setDone(true), fade);

		return () => {
			clearTimeout(timer);
		}
	}, [show, done, fade])

	const classes = useStyles({ show, time });

	if (!noFlash && done) return children;
	return (
		<div className={classes.root}>
			{children}
		</div>
	);
}

interface FadeInGroupProps {
	children: JSX.Element | JSX.Element[],
	delay?: number,
	time?: number,
	margin?: number,
}

export function FadeInGroup(props: FadeInGroupProps): JSX.Element {
	const {
		children,
		delay = 0,
		time = 300,
		margin = 0,
	} = props;
	const list = useMemo<number[]>(() => [], []);

	const next = useCallback(() => {
		const now = Date.now();
		const last = Math.max(list.slice(-1)[0] - now || 0, delay);
		const start = last + margin;
		const fade = time;
		list.push(now + start + time);
		return [start, fade];
	}, [delay, list, time, margin])

	return (
		<context.Provider value={next}>
			{children}
		</context.Provider>
	);
}
