import React, { useEffect, useState, useCallback } from 'react';
import { makeStyles, FormControlLabel, Switch, Slider, FormControl, InputLabel, Input, Typography } from '@material-ui/core';
import useAnalytics from '../hooks/analytics';
import CanvasResize from 'react-canvas-resize';

const OFFSET_MAG = 10000;
const SLANT_MAG = 1000;
const STRETCH_MAG = 10;
const validFileTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/x-icon'];

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		minWidth: 300,
		margin: 'auto',
	},
	container: {
		flex: '100%',
		maxWidth: '100vw',
		minHeight: '70vh',
		maxHeight: '70vh',
	},
	form: {
		margin: theme.spacing(0, 1)
	}
}));

export default function Unmagic(): JSX.Element {
	const classes = useStyles();
	const analytics = useAnalytics();

	const logAnalytics = useCallback((name: string, params?: { [key: string]: any; }) => {
		if (analytics === null) return;
		analytics.logEvent(name, params);
	}, [analytics])

	const [imageSrc, setImageSrc] = useState<string | null>(null);
	const [image, setImage] = useState<HTMLImageElement | null>(null);
	useEffect(() => {
		if (imageSrc === null) return;

		const img = new Image();
		img.src = imageSrc;
		img.onload = () => {
			logAnalytics('image_ready');
			setImage(img);
		}
	}, [imageSrc, logAnalytics])

	const [drag, setDrag] = useState(false);
	const [offsetMag, setOffsetMag] = useState(10);
	const [auto, setAuto] = useState(true);
	const [offset, setOffset] = useState(0);
	const [slant, setSlant] = useState(0);
	const [stretch, setStretch] = useState(0);

	const handleDraw = useCallback(({ canvas }) => {
		if (!canvas) return;

		const { width, height } = canvas;
		const ctx = canvas.getContext('2d');
		if (ctx === null) return;

		ctx.clearRect(0, 0, width, height);
		ctx.strokeStyle = '#111';
		ctx.fillStyle = '#678';

		if (drag) {
			ctx.fillRect(5, 5, width - 10, height - 10)
			ctx.strokeRect(5, 5, width - 10, height - 10)
			ctx.fillStyle = '#111';
			ctx.fillText('Drop image here', 15, 25);
			return;
		}

		if (image === null) {
			ctx.strokeRect(5, 5, width - 10, height - 10)
			ctx.fillStyle = '#111';
			ctx.fillText('Drag and drop an image here', 15, 25);
			return;
		}

		ctx.save();
		ctx.translate(width / 2, height / 2);
		ctx.globalCompositeOperation = 'source-over';
		ctx.drawImage(image, -width / 2, -height / 2, width, height);

		ctx.scale(1 + stretch / STRETCH_MAG * Math.abs(offset / OFFSET_MAG), 1);
		ctx.translate(offset * offsetMag / OFFSET_MAG * width, slant / SLANT_MAG * offset * offsetMag / OFFSET_MAG * height);
		ctx.globalCompositeOperation = 'difference';
		ctx.drawImage(image, -width / 2, -height / 2, width, height);
		ctx.restore();
	}, [drag, image, offset, offsetMag, slant, stretch])

	useEffect(() => {
		if (!auto || !imageSrc) return;
		let cancel = false;

		const update = () => {
			if (cancel) return;
			setOffset(Math.round(Math.sin(Date.now() / 1000) * 1000) / 10);
			requestAnimationFrame(update);
		}
		update();
		return () => {
			cancel = true;
		}
	}, [auto, imageSrc]);

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		setDrag(false);
		event.preventDefault();

		const file = event.dataTransfer.files[0];

		if (!validFileTypes.includes(file?.type)) {
			logAnalytics('load_file_invalid', { type: file?.type });
			// const url = event.dataTransfer.getData('URL');
			console.log(`${file?.type} is not supported`);
			return;
		}

		logAnalytics('load_file', { type: file?.type });

		const reader = new FileReader();
		reader.addEventListener('load', () => {
			setImageSrc(reader.result as string);
		}, false);
		reader.readAsDataURL(file);
	};

	return (
		<div className={classes.root}>
			<CanvasResize
				className={classes.container}
				ratio={[image?.width || 0, image?.height || 0]}
				onDragOver={(ev) => ev.preventDefault()}
				onDragEnter={() => setDrag(true)}
				onDragLeave={() => setDrag(false)}
				onDrop={handleDrop}
				onDraw={handleDraw}
			/>
			<div className={classes.form}>
				<FormControlLabel
					control={
						<Switch
							checked={auto}
							onChange={() => setAuto(s => !s)}
							color="primary"
						/>
					}
					label="Auto"
				/>
				<FormControl>
					<InputLabel>Offset Magnitude</InputLabel>
					<Input
						type="number"
						value={offsetMag}
						onChange={(event) => setOffsetMag(Math.min(100, Math.max(1, parseFloat(event.target.value))))}
					/>
				</FormControl>
				<Typography gutterBottom>
					Offset
				</Typography>
				<Slider
					value={offset}
					onChange={(_, v) => {
						setOffset(v as number);
						setAuto(false);
					}}
					valueLabelDisplay="auto"
					marks={[{ value: 0 }]}
					min={-100}
					max={100}
					step={0.1}
				/>
				<Typography gutterBottom>
					Slant
				</Typography>
				<Slider
					value={slant}
					onChange={(_, v) => setSlant(v as number)}
					valueLabelDisplay="auto"
					marks={[{ value: 0 }]}
					min={-100}
					max={100}
					step={1}
				/>
				<Typography gutterBottom>
					Stretch
				</Typography>
				<Slider
					value={stretch}
					onChange={(_, v) => setStretch(v as number)}
					valueLabelDisplay="auto"
					marks={[{ value: 0 }]}
					min={-100}
					max={100}
					step={1}
				/>
			</div>
		</div>
	);
}