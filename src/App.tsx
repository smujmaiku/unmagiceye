import React, { useRef, useEffect, useState } from 'react';
import { makeStyles, FormControlLabel, Switch, Slider, FormControl, InputLabel, Input, Typography } from '@material-ui/core';

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
	status: {
		top: 0,
	},
	view: {},
	viewGutter: {
		margin: theme.spacing(2),
	},
	menu: {
		top: 'auto',
		bottom: 0,
	},
}));

export default function App(): JSX.Element {
	const classes = useStyles();

	const rootRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const [imageSrc, setImageSrc] = useState<string | null>(null);
	const [image, setImage] = useState<CanvasImageSource | null>(null);
	useEffect(() => {
		if (imageSrc === null) return;

		const img = new Image();
		img.src = imageSrc;
		img.onload = () => setImage(img);
	}, [imageSrc])

	const [drag, setDrag] = useState(false);
	const [[width, height], setSize] = useState([200, 200]);
	const [offsetMag, setOffsetMag] = useState(10);
	const [auto, setAuto] = useState(true);
	const [offset, setOffset] = useState(0);
	const [slant, setSlant] = useState(-20);
	const [stretch, setStretch] = useState(0);

	useEffect(() => {
		if (canvasRef.current === null) return;
		const ctx = canvasRef.current.getContext('2d');
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
	}, [drag, image, width, height, offset, offsetMag, slant, stretch]);

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

	useEffect(() => {
		const update = () => {
			if (rootRef.current === null) return;

			const { offsetWidth, offsetHeight } = rootRef.current
			setSize([offsetWidth, offsetHeight]);
		}
		const timer = setInterval(update, 100);
		return () => {
			clearInterval(timer);
		}
	}, []);

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		setDrag(false);
		event.preventDefault();

		const file = event.dataTransfer.files[0];
		if (!validFileTypes.includes(file?.type)) {
			// const url = event.dataTransfer.getData('URL');
			console.log(`${file?.type} is not supported`);
			return;
		}

		const reader = new FileReader();
		reader.addEventListener('load', () => {
			setImageSrc(reader.result as string);
		}, false);
		reader.readAsDataURL(file);
	};

	return (
		<div className={classes.root}>
			<div
				ref={rootRef}
				className={classes.container}
				onDragOver={(ev) => ev.preventDefault()}
				onDragEnter={() => setDrag(true)}
				onDragLeave={() => setDrag(false)}
				onDrop={handleDrop}
			>
				<canvas
					ref={canvasRef}
					width={width}
					height={height}
				/>
			</div>
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
	);
}
