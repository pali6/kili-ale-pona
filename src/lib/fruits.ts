export type Color = 'loje' | 'jelo' | 'laso' | 'pimeja' | 'walo';
export type Fruit = { id: string; emoji: string; color: Color; judges: [number, number, number] };

export const colors: Color[] = ['loje', 'jelo', 'laso', 'pimeja', 'walo'];

export const fruits: Fruit[] = [
	{ id: 'apple', emoji: '🍎', color: 'loje', judges: [2, -2, 1] },
	{ id: 'strawberry', emoji: '🍓', color: 'loje', judges: [1, 1, -2] },
	{ id: 'carrot', emoji: '🥕', color: 'loje', judges: [-2, 1, 2] },
	{ id: 'cherry', emoji: '🍒', color: 'loje', judges: [1, 2, -1] },
	{ id: 'banana', emoji: '🍌', color: 'jelo', judges: [1, 1, 0] },
	{ id: 'lemon', emoji: '🍋', color: 'jelo', judges: [1, -1, 1] },
	{ id: 'mango', emoji: '🥭', color: 'jelo', judges: [0, -1, 2] },
	{ id: 'peach', emoji: '🍑', color: 'jelo', judges: [-2, 2, 0] },
	{ id: 'kiwi', emoji: '🥝', color: 'laso', judges: [0, 1, -1] },
	{ id: 'cucumber', emoji: '🥒', color: 'laso', judges: [-2, 2, 1] },
	{ id: 'lime', emoji: '🟢', color: 'laso', judges: [1, 1, 0] },
	{ id: 'pear', emoji: '🍐', color: 'laso', judges: [2, -2, 1] },
	{ id: 'blackberry', emoji: '🍇', color: 'pimeja', judges: [1, 0, 1] },
	{ id: 'black currant', emoji: '⚫', color: 'pimeja', judges: [-2, 1, 2] },
	{ id: 'black plum', emoji: '🟣', color: 'pimeja', judges: [0, 0, 1] },
	{ id: 'blueberry', emoji: '🫐', color: 'pimeja', judges: [2, -1, -1] },
	{ id: 'sugar', emoji: '🍬', color: 'walo', judges: [1, -2, 2] },
	{ id: 'honeydew melon', emoji: '🍈', color: 'walo', judges: [1, 2, -1] },
	{ id: 'ginger', emoji: '🫚', color: 'walo', judges: [2, 1, -2] },
	{ id: 'garlic', emoji: '🧄', color: 'walo', judges: [-1, 0, 1] }
];

export const synergies: { a: string; b: string; v: number }[] = [
	{ a: 'apple', b: 'strawberry', v: 1 },
	{ a: 'apple', b: 'peach', v: -1 },
	{ a: 'apple', b: 'pear', v: 1 },
	{ a: 'apple', b: 'black currant', v: 1 },
	{ a: 'strawberry', b: 'banana', v: 1 },
	{ a: 'strawberry', b: 'blackberry', v: 1 },
	{ a: 'strawberry', b: 'honeydew melon', v: -1 },
	{ a: 'carrot', b: 'lemon', v: 1 },
	{ a: 'carrot', b: 'kiwi', v: 1 },
	{ a: 'carrot', b: 'blueberry', v: 1 },
	{ a: 'cherry', b: 'mango', v: 1 },
	{ a: 'cherry', b: 'lime', v: 1 },
	{ a: 'cherry', b: 'black currant', v: -1 },
	{ a: 'cherry', b: 'sugar', v: 1 },
	{ a: 'banana', b: 'cucumber', v: 1 },
	{ a: 'lemon', b: 'peach', v: 1 },
	{ a: 'lemon', b: 'lime', v: -1 },
	{ a: 'lemon', b: 'honeydew melon', v: 1 },
	{ a: 'lemon', b: 'garlic', v: 1 },
	{ a: 'mango', b: 'black currant', v: 1 },
	{ a: 'mango', b: 'blueberry', v: -1 },
	{ a: 'mango', b: 'sugar', v: 1 },
	{ a: 'peach', b: 'pear', v: 1 },
	{ a: 'peach', b: 'black plum', v: 1 },
	{ a: 'kiwi', b: 'cucumber', v: 1 },
	{ a: 'kiwi', b: 'blueberry', v: 1 },
	{ a: 'kiwi', b: 'sugar', v: -1 },
	{ a: 'kiwi', b: 'ginger', v: 1 },
	{ a: 'cucumber', b: 'black plum', v: 1 },
	{ a: 'lime', b: 'black currant', v: 1 },
	{ a: 'lime', b: 'ginger', v: 1 },
	{ a: 'pear', b: 'blackberry', v: -1 },
	{ a: 'pear', b: 'black plum', v: -1 },
	{ a: 'pear', b: 'sugar', v: 1 },
	{ a: 'blackberry', b: 'honeydew melon', v: 1 },
	{ a: 'black currant', b: 'garlic', v: 1 },
	{ a: 'black plum', b: 'blueberry', v: 1 },
	{ a: 'blueberry', b: 'ginger', v: 1 },
	{ a: 'sugar', b: 'honeydew melon', v: 1 }
];

const synMap = new Map<string, number>();
for (const s of synergies) synMap.set([s.a, s.b].sort().join('\u0000'), s.v);
export const synergy = (a: string, b: string): number =>
	synMap.get([a, b].sort().join('\u0000')) ?? 0;
