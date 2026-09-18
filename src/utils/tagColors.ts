/**
 * Light tag colors: a pastel fill with a deep shade of the same hue, so tags read as colorful
 * without losing contrast. Class names are written out in full so Tailwind can find them.
 */
export interface TagTone {
  /** Resting chip. */
  chip: string;
  /** Hover for chips that filter by the tag. */
  hover: string;
  /** The selected filter chip. */
  selected: string;
  /** Text only, for naming the tag outside a chip. */
  text: string;
}

const TAG_TONES: TagTone[] = [
  {
    chip: 'bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-200',
    hover: 'hover:bg-sky-200/70 dark:hover:bg-sky-400/25',
    selected: 'bg-sky-200/80 ring-1 ring-inset ring-sky-400/70 dark:bg-sky-400/25 dark:ring-sky-300/50',
    text: 'text-sky-800 dark:text-sky-200',
  },
  {
    chip: 'bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-200',
    hover: 'hover:bg-violet-200/70 dark:hover:bg-violet-400/25',
    selected: 'bg-violet-200/80 ring-1 ring-inset ring-violet-400/70 dark:bg-violet-400/25 dark:ring-violet-300/50',
    text: 'text-violet-800 dark:text-violet-200',
  },
  {
    chip: 'bg-pink-100 text-pink-800 dark:bg-pink-400/15 dark:text-pink-200',
    hover: 'hover:bg-pink-200/70 dark:hover:bg-pink-400/25',
    selected: 'bg-pink-200/80 ring-1 ring-inset ring-pink-400/70 dark:bg-pink-400/25 dark:ring-pink-300/50',
    text: 'text-pink-800 dark:text-pink-200',
  },
  {
    chip: 'bg-orange-100 text-orange-800 dark:bg-orange-400/15 dark:text-orange-200',
    hover: 'hover:bg-orange-200/70 dark:hover:bg-orange-400/25',
    selected: 'bg-orange-200/80 ring-1 ring-inset ring-orange-400/70 dark:bg-orange-400/25 dark:ring-orange-300/50',
    text: 'text-orange-800 dark:text-orange-200',
  },
  {
    chip: 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200',
    hover: 'hover:bg-amber-200/70 dark:hover:bg-amber-400/25',
    selected: 'bg-amber-200/80 ring-1 ring-inset ring-amber-400/70 dark:bg-amber-400/25 dark:ring-amber-300/50',
    text: 'text-amber-800 dark:text-amber-200',
  },
  {
    chip: 'bg-lime-100 text-lime-800 dark:bg-lime-400/15 dark:text-lime-200',
    hover: 'hover:bg-lime-200/70 dark:hover:bg-lime-400/25',
    selected: 'bg-lime-200/80 ring-1 ring-inset ring-lime-400/70 dark:bg-lime-400/25 dark:ring-lime-300/50',
    text: 'text-lime-800 dark:text-lime-200',
  },
  {
    chip: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200',
    hover: 'hover:bg-emerald-200/70 dark:hover:bg-emerald-400/25',
    selected: 'bg-emerald-200/80 ring-1 ring-inset ring-emerald-400/70 dark:bg-emerald-400/25 dark:ring-emerald-300/50',
    text: 'text-emerald-800 dark:text-emerald-200',
  },
  {
    chip: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-400/15 dark:text-cyan-200',
    hover: 'hover:bg-cyan-200/70 dark:hover:bg-cyan-400/25',
    selected: 'bg-cyan-200/80 ring-1 ring-inset ring-cyan-400/70 dark:bg-cyan-400/25 dark:ring-cyan-300/50',
    text: 'text-cyan-800 dark:text-cyan-200',
  },
];

function hashTag(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return hash;
}

/**
 * Gives each tag a tone. Walking the tags alphabetically (the order the sidebar lists them), each
 * takes the least-used tone nearest the one its name hashes to, never the same tone as the tag
 * before it. So up to eight tags all differ, and repeats beyond that never sit side by side.
 * Tags differing only in case share a tone.
 */
export function assignTagTones(tags: string[]): (tag: string) => TagTone {
  const slotByKey = new Map<string, number>();
  const uses = TAG_TONES.map(() => 0);
  let previous = -1;
  for (const tag of [...tags].sort((a, b) => a.localeCompare(b))) {
    const key = tag.toLowerCase();
    if (slotByKey.has(key)) continue;
    const start = hashTag(key) % TAG_TONES.length;
    let slot = -1;
    for (let step = 0; step < TAG_TONES.length; step++) {
      const candidate = (start + step) % TAG_TONES.length;
      if (candidate === previous) continue;
      if (slot === -1 || uses[candidate] < uses[slot]) slot = candidate;
    }
    uses[slot]++;
    slotByKey.set(key, slot);
    previous = slot;
  }
  return (tag) => {
    const key = tag.toLowerCase();
    return TAG_TONES[slotByKey.get(key) ?? hashTag(key) % TAG_TONES.length];
  };
}
