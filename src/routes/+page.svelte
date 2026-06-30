<script lang="ts">
	import { asset } from '$app/paths';
	import { fruits, type Fruit } from '$lib/fruits';
	import {
		SLOTS,
		rollTask,
		score,
		aiFill,
		synergiesOf,
		emotion,
		judgeKeys,
		byId,
		type Task
	} from '$lib/game';

	type Slot = Fruit | null;
	const empty = (): Slot[] => Array(SLOTS).fill(null);

	let scene = $state<'intro' | 'mix' | 'sabotage' | 'results'>('intro');
	let task = $state<Task>(rollTask());

	let mine = $state<Slot[]>(empty());
	let foe = $state<Slot[]>(empty());
	let mineSabotaged = $state<Fruit | null>(null);
	let foeSabotaged = $state<Fruit | null>(null);

	let hovered = $state<Fruit | null>(null);

	let vw = $state(0);
	let vh = $state(0);
	const scale = $derived(vw && vh ? Math.min(vw / 1920, vh / 1080) : 1);

	const usedIds = $derived(new Set((mine.filter(Boolean) as Fruit[]).map((f) => f.id)));
	const mineAll = $derived([
		...(mine.filter(Boolean) as Fruit[]),
		...(mineSabotaged ? [mineSabotaged] : [])
	]);
	const foeAll = $derived([
		...(foe.filter(Boolean) as Fruit[]),
		...(foeSabotaged ? [foeSabotaged] : [])
	]);
	const myScore = $derived(score(mineAll, task));
	const foeScore = $derived(score(foeAll, task));

	function addFruit(f: Fruit) {
		if (usedIds.has(f.id)) return;
		const i = mine.findIndex((x) => x === null);
		if (i >= 0) mine[i] = f;
	}
	const removeAt = (i: number) => (mine[i] = null);

	function finishMix() {
		const a = aiFill(task, 10);
		foe = empty();
		a.slice(0, SLOTS).forEach((f, i) => (foe[i] = f));

		const unusedByFoe = fruits.filter((f) => !foe.some((x) => x && x.id === f.id));
		let worstScore = Infinity;
		let bestSabotagePick: Fruit | null = null;
		for (let i = 0; i < 5; i++) {
			mineSabotaged = pick(unusedByFoe);
			const trialScore = score([...mineAll, mineSabotaged], task).total;
			if (trialScore < worstScore) {
				worstScore = trialScore;
				bestSabotagePick = mineSabotaged;
			}
		}
		mineSabotaged = bestSabotagePick;
		scene = 'sabotage';
	}

	const pick = <T,>(a: T[]): T => a[(Math.random() * a.length) | 0];
	const sabotage = (f: Fruit) => {
		if (usedIds.has(f.id)) return;
		foeSabotaged = f;
	};
	const returnSabotage = () => (foeSabotaged = null);

	function next() {
		if (scene === 'intro') scene = 'mix';
		else if (scene === 'mix') finishMix();
		else if (scene === 'sabotage') scene = 'results';
		else newRound();
	}
	function newRound() {
		task = rollTask();
		mine = empty();
		foe = empty();
		mineSabotaged = foeSabotaged = null;
		hovered = null;
		scene = 'mix';
	}

	const img = (p: string) => encodeURI(asset(`/assets/${p}`));
	const slug = (id: string) => id.replace(/ /g, '-');
</script>

<svelte:head><title>kili ale pona</title></svelte:head>
<svelte:window bind:innerWidth={vw} bind:innerHeight={vh} />

{#snippet fruitIcon(f: Fruit)}
	<span class="ficon"
		><img src={img(`fruits/${slug(f.id)}.png`)} alt={f.id} /></span
	>
{/snippet}

<div class="viewport">
	<div class="stage" style="--scale: {scale}">
		{#if scene === 'intro'}
			<div class="bg"><img src={img('bg-judges.png')} alt="" /></div>
			{#each judgeKeys as key, n (key)}
				<div class="judgewrap j{n}">
					<img class="judge" src={img(`${key}_sit.PNG`)} alt={key} />
				</div>
			{/each}
			<div class="overlay">
				<h1>kili ale pona</h1>
				<p>[TODO intro text]</p>
			</div>
		{/if}

		{#if scene === 'mix'}
			<div class="bg"><img src={img('bg-mix.png')} alt="" /></div>

			<div class="shelf">
				{#each fruits as f (f.id)}
					<button
						class="fruit"
						class:used={usedIds.has(f.id)}
						title={f.id}
						onmouseenter={() => (hovered = f)}
						onclick={() => addFruit(f)}
					>
						<img class="fimg" src={img(`fruits/${slug(f.id)}.png`)} alt={f.id} />
					</button>
				{/each}
			</div>

			<div class="info">
				{#if hovered}
					<div class="info-head">
						<span class="big">{@render fruitIcon(hovered)}</span>
						<span class="color-name">{hovered.color}</span>
					</div>
					<div>[TODO judge points, use words:] {hovered.judges.join(' / ')}</div>
					<div class="syn-cols">
						<div class="syn-col">
							<div class="syn-h">toki</div>
							{#each synergiesOf(hovered.id).filter((s) => s.v > 0) as s (s.id)}
								{@render fruitIcon(byId(s.id))}
							{/each}
						</div>
						<div class="syn-col">
							<div class="syn-h">ike</div>
							{#each synergiesOf(hovered.id).filter((s) => s.v < 0) as s (s.id)}
								{@render fruitIcon(byId(s.id))}
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<div class="task">
				<h2>[TODO task]</h2>
				<div class="task-words">
					{#each task as c, i (i)}
						<div class="task-word">{c}</div>
					{/each}
				</div>
			</div>

			<div class="fruit-slots">
				{#each mine as s, i (i)}
					<button class="slot fruit-slot-{i}" onclick={() => s && removeAt(i)}>
						{#if s}
							<img class="fimg" src={img(`fruits/${slug(s.id)}.png`)} alt={s.id} />
						{/if}
					</button>
				{/each}
			</div>
		{/if}

		{#if scene === 'sabotage'}
			<div class="bg"><img src={img('bg-cooking.png')} alt="" /></div>

			{#if mineSabotaged}
				<div class="sab-slot sab-me" title={mineSabotaged.id}>
					{@render fruitIcon(mineSabotaged)}
				</div>
			{/if}
			{#if foeSabotaged}
				<button class="sab-slot sab-foe" title={foeSabotaged.id} onclick={returnSabotage}>
					{@render fruitIcon(foeSabotaged)}
				</button>
			{/if}

			<div class="shelf cooking">
				{#each fruits as f (f.id)}
					<button
						class="fruit"
						class:used={usedIds.has(f.id) || foeSabotaged?.id === f.id}
						title={f.id}
						onclick={() => sabotage(f)}
					>
						<img class="fimg" src={img(`fruits/${slug(f.id)}.png`)} alt={f.id} />
					</button>
				{/each}
			</div>
		{/if}

		{#if scene === 'results'}
			<div class="bg"><img src={img('bg-judges.png')} alt="" /></div>
			{#each judgeKeys as key, n (key)}
				<div class="judgewrap j{n}">
					<img class="judge" src={img(`${key}_sit.PNG`)} alt={key} />
					<img
						class="judge emote"
						src={img(`${key}_emotions/${emotion(myScore.judges[n])}.PNG`)}
						alt={emotion(myScore.judges[n])}
					/>
				</div>
			{/each}
			<div class="overlay scorecard">
				<h2>
					{myScore.total > foeScore.total
						? '[TODO win]'
						: myScore.total < foeScore.total
							? '[TODO lose]'
							: '[TODO draw]'}
				</h2>
				<div class="line">kule: {myScore.colour}</div>
				<div class="line">[TODO synergy]: {myScore.synergy > 0 ? '+' : ''}{myScore.synergy}</div>
				<div class="line">[TODO judge points]: {myScore.judges.join(' / ')}</div>
				<div class="line big">
					[TODO my points:] {myScore.total} | [TODO: opponent points:] {foeScore.total}
				</div>
			</div>
		{/if}

		<button class="arrow" onclick={next} aria-label="next">
			<img src={img('arrow.png')} alt="" />
		</button>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		overflow: hidden;
	}
	.viewport {
		position: fixed;
		inset: 0;
		overflow: hidden;
	}
	.stage {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 1920px;
		height: 1080px;
		transform: translate(-50%, -50%) scale(var(--scale, 1));
		transform-origin: center center;
		font-family: system-ui, sans-serif;
		color: black;
	}

	.bg,
	.bg img {
		position: absolute;
		inset: 0;
		width: 1920px;
		height: 1080px;
	}

	.judgewrap {
		position: absolute;
	}
	.j0 {
		left: 60px;
	}
	.j1 {
		left: 660px;
	}
	.j2 {
		left: 1260px;
	}
	.judge {
		position: absolute;
		inset: 0;
		width: 600px;
		height: 650px;
	}
	.judge.emote {
		z-index: 1;
	}

	.overlay {
		position: absolute;
		top: 700px;
		width: 100%;
		text-align: center;
		padding: 24px 0;
	}
	h1 {
		font-size: 56px;
		margin: 0 0 12px;
	}
	h2 {
		font-size: 40px;
		margin: 0 0 12px;
	}
	.line {
		font-size: 28px;
		margin: 6px 0;
	}
	.line.big {
		font-size: 36px;
		font-weight: 700;
		margin-top: 16px;
	}

	.shelf {
		position: absolute;
		left: 40px;
		top: 160px;
		width: 700px;
		height: 1000px;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		grid-auto-rows: min-content;
		gap: 12px;
		align-content: start;
	}
	.shelf.cooking {
		left: 1550px;
		transform: translateX(-50%);
		top: 80px;
		width: 450px;
	}

	.sab-slot {
		position: absolute;
		width: 200px;
		height: 200px;
		display: grid;
		place-items: center;
		font-size: 140px;
		background: transparent;
		border: none;
		padding: 0;
	}
	.sab-foe {
		cursor: pointer;
	}
	.sab-me {
		left: 250px;
		top: 300px;
		scale: 0.8;
	}
	.sab-foe {
		left: 850px;
		top: 250px;
	}
	.fruit,
	.slot {
		background: transparent;
		border: none;
		cursor: pointer;
		display: grid;
		place-items: center;
		padding: 0;
	}
	.fruit {
		position: relative;
		aspect-ratio: 1;
	}
	.fruit.used {
		visibility: hidden;
	}
	.fimg {
		position: absolute;
		inset: 6px;
		width: calc(100% - 12px);
		height: calc(100% - 12px);
		object-fit: contain;
	}

	.ficon {
		position: relative;
		display: inline-block;
		vertical-align: middle;
		line-height: 1;
		width: 1em;
		height: 1em;
	}
	.ficon img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.info-head .ficon {
		font-size: 64px;
	}

	.info {
		position: absolute;
		left: 820px;
		top: 40px;
		width: 450px;
		height: 550px;
		padding: 24px;
		font-size: 26px;
	}
	.info > * {
		margin-bottom: 10px;
	}
	.info-head {
		font-size: 32px;
	}
	.color-name {
		float: right;
	}
	.syn-cols {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}
	.syn-h {
		font-weight: 700;
		margin-bottom: 8px;
	}
	.syn-col .ficon {
		font-size: 64px;
		margin: 2px;
	}

	.task {
		position: absolute;
		left: 1380px;
		top: 40px;
		width: 450px;
		height: 550px;
		padding: 24px;
	}
	.task > * {
		margin-top: 18px;
	}
	.task-word {
		font-size: 64px;
		font-weight: 700;
	}

	.fruit-slots {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.slot {
		position: absolute;
		width: 150px;
		height: 150px;
		pointer-events: auto;
	}

	.fruit-slot-0 {
		left: 830px;
		top: 670px;
	}
	.fruit-slot-1 {
		left: 1040px;
		top: 670px;
	}
	.fruit-slot-2 {
		left: 1265px;
		top: 670px;
	}
	.fruit-slot-3 {
		left: 1480px;
		top: 670px;
	}
	.fruit-slot-4 {
		left: 1700px;
		top: 670px;
	}
	.fruit-slot-5 {
		left: 935px;
		top: 820px;
	}
	.fruit-slot-6 {
		left: 1155px;
		top: 820px;
	}
	.fruit-slot-7 {
		left: 1370px;
		top: 820px;
	}
	.fruit-slot-8 {
		left: 1595px;
		top: 820px;
	}

	.arrow {
		position: absolute;
		right: 40px;
		bottom: 40px;
		width: 200px;
		height: 200px;
		border: 0;
		background: none;
		cursor: pointer;
		padding: 0;
	}
</style>
