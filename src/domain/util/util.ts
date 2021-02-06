// This is flatmap, but JSRepl complains about flatmap, so I have to write my own.
 export function mapcat<A, B>(items: A[], f: (a: A) => B[]): B[] {
    const result: B[] = [];
    items.forEach(i => {
        f(i).forEach(j => result.push(j));
    });
    return result;
}

export function randomNumberBetweenInclusive(low: number, high: number) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

export function drawRandom<T>(items: T[]): T {
    return items[randomNumberBetweenInclusive(0, items.length - 1)];
}

export type RandomSampleRepeatOptions = "no-repeats" | "non-sequential-repeats" | "allow-repeats"
export function drawRandomSample<T>(items: T[], size: number, repeatOptions: RandomSampleRepeatOptions): T[] {
    const result: T[] = [];

    if (repeatOptions == "allow-repeats") {
        for (let i = 0; i < size; i++) {
            result.push(drawRandom(items));
        }
    } else if (repeatOptions == "no-repeats") {
        if (size > items.length) {
            throw new Error("can't randomly sample " + size.toString() + " items with no repeats from a list with " + items.length.toString() + " elements.");
        }

        const picked = new Set<number>();
        let i = randomNumberBetweenInclusive(0, items.length - 1);

        while (result.length < size) {
            while (picked.has(i)) {
                i = randomNumberBetweenInclusive(0, items.length - 1);
            }
            result.push(items[i]);
            picked.add(i);
        }
    } else if (repeatOptions == "non-sequential-repeats") {
        let lastPick = randomNumberBetweenInclusive(0, items.length - 1);
        let nextPick = lastPick;
        while (result.length < size) {
            while (lastPick == nextPick) {
                nextPick = randomNumberBetweenInclusive(0, items.length - 1);
            }
            result.push(items[nextPick]);
            lastPick = nextPick;
        }
    }

    return result;
}

// https://stackoverflow.com/a/12646864
export function shuffleArray<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export function doTimes<T>(f: () => T, count: number): T[] {
    const result: T[] = [];
    for (let i = 0; i < count; i++) {
        result.push(f());
    }
    return result;
}

export function indexBy<K, V>(items: V[], f: (v: V) => K): Map<K, V> {
    const result = new Map<K, V>();
    items.forEach(x => result.set(f(x), x));
    return result;
}