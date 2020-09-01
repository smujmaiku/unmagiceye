import React, { useEffect, useContext, createContext, useState } from 'react';
import firebase from 'firebase';
import 'firebase/analytics';

const firebaseConfig = {
	apiKey: "AIzaSyBGB5ExYCj0cum5E1Sg71kPCgaSByqi4HU",
	authDomain: "unmagiceye.firebaseapp.com",
	databaseURL: "https://unmagiceye.firebaseio.com",
	projectId: "unmagiceye",
	storageBucket: "unmagiceye.appspot.com",
	messagingSenderId: "243796277938",
	appId: "1:243796277938:web:92be510eb181c0c7b0e7ab",
	measurementId: "G-LWVKR03E81"
};

export const analyticsContext = createContext<firebase.analytics.Analytics | null>(null);

export default function useAnalytics(): firebase.analytics.Analytics | null {
	return useContext(analyticsContext);
}
interface ProviderProps {
	children: JSX.Element | JSX.Element[];
}

export function AnalyticsProvider(props: ProviderProps): JSX.Element {
	const { children } = props;

	const [value, setValue] = useState<firebase.analytics.Analytics | null>(null);

	useEffect(() => {
		firebase.initializeApp(firebaseConfig);
		const analytics = firebase.analytics();
		setValue(analytics);
		analytics.logEvent('init');
	}, []);

	return (
		<analyticsContext.Provider value={value}>
			{children}
		</analyticsContext.Provider>
	);
}