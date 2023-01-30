<script lang="ts">
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import LinearProgress from '@smui/linear-progress';
	import Button from '@smui/button';
	import axios from 'axios';

	interface EvaluationResponse {
		mostSpeeches: string | null;
		mostSecurity: string | null;
		leastWordy: string | null;
		fileName?: string;
	}

	let items: EvaluationResponse[] = [];
	let loaded = false;

	loadThings(false);

	async function loadThings(wait: boolean) {
		if (typeof fetch !== 'undefined') {
			loaded = false;
			try {
				items = (await axios.get(`${window.location.origin}/evaluation?allFiles=true`)).data;
			} catch (error) {
				// Show Snackbar or something else..
			}
			loaded = true;
		}
	}
</script>

<h1 style="text-align:center">Political Speeches Overview</h1>
<div style="display: flex; margin-left: auto; width: 80%; flex-direction:column">
	<div style="margin-bottom: 1em;">
		<Button on:click={() => loadThings(true)}>Refresh</Button>
	</div>
	<DataTable table$aria-label="User list" style="width: 75%;">
		<Head>
			<Row>
				<Cell>Filename</Cell>
				<Cell>Most Speeches</Cell>
				<Cell>Most Security</Cell>
				<Cell>Least Wordy</Cell>
			</Row>
		</Head>
		<Body>
			{#each items as item (item.fileName)}
				<Row>
					<Cell>{item.fileName}</Cell>
					<Cell>{item.mostSpeeches}</Cell>
					<Cell>{item.mostSecurity}</Cell>
					<Cell>{item.leastWordy}</Cell>
				</Row>
			{/each}
		</Body>

		<LinearProgress
			indeterminate
			bind:closed={loaded}
			aria-label="Data is being loaded..."
			slot="progress"
		/>
	</DataTable>
</div>
