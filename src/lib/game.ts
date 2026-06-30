import { fruits, colors, synergy, type Color, type Fruit } from './fruits';

export const SLOTS = 9;
export const byId = (id: string) => fruits.find((f) => f.id === id)!;

export type Task = Color[];

const pick = <T>(a: T[]): T => a[(Math.random() * a.length) | 0];
export const rollTask = (): Task =>
	[pick(colors), pick(colors), pick(colors), pick(colors)].sort(
		(a, b) => colors.indexOf(a) - colors.indexOf(b)
	);

export function taskCounts(task: Task): Record<string, number> {
	const m: Record<string, number> = {};
	for (const c of task) m[c] = (m[c] ?? 0) + 1;
	return m;
}

export type Breakdown = {
	colour: number; // -1 per colour deviation
	synergy: number;
	judges: [number, number, number];
	total: number;
};

export function score(mixer: (Fruit | null)[], task: Task): Breakdown {
	const have = mixer.filter(Boolean) as Fruit[];

	const want = taskCounts(task);
	const got: Record<string, number> = {};
	for (const f of have) got[f.color] = (got[f.color] ?? 0) + 1;
	let colour = 0;
	for (const c of colors) colour -= Math.abs((want[c] ?? 0) - (got[c] ?? 0));

	let syn = 0;
	for (let i = 0; i < have.length; i++)
		for (let j = i + 1; j < have.length; j++) syn += synergy(have[i].id, have[j].id);

	const judges: [number, number, number] = [0, 0, 0];
	for (const f of have) for (let k = 0; k < 3; k++) judges[k] += f.judges[k];

	return { colour, synergy: syn, judges, total: colour + syn + judges[0] + judges[1] + judges[2] };
}

export function aiFill(task: Task, nTries: number): Fruit[] {
	const best: Fruit[] = [];
	let bestScore = -Infinity;
	for (let i = 0; i < nTries; i++) {
		const trial = aiFillInner(task);
		const trialScore = score(trial, task).total;
		if (trialScore > bestScore) {
			bestScore = trialScore;
			best.length = 0;
			best.push(...trial);
		}
	}
	return best;
}

export function aiFillInner(task: Task): Fruit[] {
	const out: Fruit[] = [];
	for (const c of task) out.push(pick(fruits.filter((f) => f.color === c)));
	while (out.length < SLOTS && Math.random() < 0.15) out.push(pick(fruits));
	return out;
}

export function synergiesOf(id: string): { id: string; v: number }[] {
	const out: { id: string; v: number }[] = [];
	for (const f of fruits)
		if (f.id !== id) {
			const v = synergy(id, f.id);
			if (v) out.push({ id: f.id, v });
		}
	return out;
}

export const judgeKeys = ['coyote', 'echidna', 'tiger'];

export function emotion(v: number): string {
	if (v <= -5) return 'IKE MUTE';
	if (v <= -1) return 'IKE';
	if (v <= 1) return 'PONA LILI';
	if (v <= 4) return 'PONA';
	return 'PONA MUTE';
}
