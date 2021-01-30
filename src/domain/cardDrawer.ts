import { FlashcardId } from "./models/flashcard";
import { Priorities } from "./models/options";

export { CardDrawer, PrioritiesCardDrawer }

interface CardDrawer {
    drawCard(): FlashcardId;
    recordAttempt(id: FlashcardId, success: boolean): void;
    resetFlashcards(flashcards: FlashcardId[]): void;
    resetPriorities(priorities: Priorities): void;
}

interface AttemptHistory {
    flashcardId: FlashcardId;
    totalTries: number;
    successful: number;
    failed: number;
}

type CardState = {kind: "new", index: number} | {kind: "attempted", index: number};

class PrioritiesCardDrawer implements CardDrawer {
    private _priorities: Priorities;

    public _attempts: AttemptHistory[];
    public _newCards: FlashcardId[];

    public _flashcardToIndex: Map<FlashcardId, CardState>;

    public constructor(flashcards: FlashcardId[], priorities: Priorities) {
        this._newCards = [ ... flashcards ];

        this._priorities = priorities;
        this._attempts = []; 

        this._flashcardToIndex = new Map<string, CardState>();
        this._newCards.forEach((n, i) => this._flashcardToIndex.set(n, {kind: "new", index: i}));
    }

    public resetPriorities(priorities: Priorities) {
        this._priorities = priorities;
    }

    public drawCard(): string {
        if (this._attempts.length <= this._priorities.byPercentiles.length && this._newCards.length > 0) {
            return this.drawNewCard();
        } else if (this._newCards.length == 0) {
            return this.drawAttemptedCard();
        } else {
            return pickByPercentages([
                [this._priorities.percentNew, () => this.drawNewCard()],
                [100 - this._priorities.percentNew, () => this.drawAttemptedCard()]
            ]);
        }
    }

    private drawAttemptedCard(): string {
        return drawFromEquallySizedGroupsBasedOnPercentages(this._priorities.byPercentiles, this._attempts).flashcardId;
    }

    private drawNewCard(): string {
        return this._newCards[this._newCards.length - 1];
    }

    public recordAttempt(id: string, success: boolean): void {
        const currentPlace = this._flashcardToIndex.get(id);
        console.log(currentPlace);

        if (currentPlace?.kind == "attempted") {
            const card = this._attempts[currentPlace.index];
            card.totalTries++;
            card.successful += success ? 1 : 0;
            card.failed += success ? 0 : 1;
            maintainSort(this._attempts, currentPlace.index, this._flashcardToIndex);

        } else if (currentPlace?.kind == "new") {
            if (currentPlace.index != this._newCards.length - 1) {
                console.log("Invariant that new cards are always the last in the deck violated.");
                throw new Error("Invariant that new cards are always the last in the deck violated.");
            } else {
                this._newCards.pop();
                this._attempts.push({flashcardId: id, successful: success ? 1 : 0, failed: success ? 0 : 1, totalTries: 1});
                this._flashcardToIndex.set(id, {kind: "attempted", index: this._attempts.length - 1});
                maintainSort(this._attempts, this._attempts.length - 1, this._flashcardToIndex);
            }
        }
    }

    public resetFlashcards(flashcards: FlashcardId[]) {
        const next = new Set(flashcards);
        const current = new Set<FlashcardId>();
        this._newCards.forEach(n => current.add(n));
        this._attempts.forEach(a => current.add(a.flashcardId));

        const add = [ ... next].filter(n => ! current.has(n));

        this._newCards = this._newCards.filter(n => next.has(n));
        this._attempts = this._attempts.filter(a => next.has(a.flashcardId));

        this._newCards = this._newCards.concat([ ... add]);

        this._flashcardToIndex = new Map<FlashcardId, CardState>();
        this._newCards.forEach((n, i) => this._flashcardToIndex.set(n, {kind: "new", index: i}));
        this._attempts.forEach((a, i) => this._flashcardToIndex.set(a.flashcardId, {kind: "attempted", index: i}));
    }
}

//  like insertion sort
function maintainSort(attempts: AttemptHistory[], index: number, locations: Map<FlashcardId, CardState>) {
    const percentHit = (a: AttemptHistory) => (a.successful / a.totalTries);
    const lessThan = (a: AttemptHistory, b: AttemptHistory) => percentHit(a) < percentHit(b);
    const greaterThan = (a: AttemptHistory, b: AttemptHistory) => percentHit(a) > percentHit(b);

    function swap(list: AttemptHistory[], i: number, j: number) {
        locations.get(list[i].flashcardId)!.index = j;
        locations.get(list[j].flashcardId)!.index = i;

        const tmp = list[i];
        list[i] = list[j];
        list[j] = tmp;
    }

    function maintainSortByTricklingDown(attempts: AttemptHistory[], index: number) {
        while (index > 0 && lessThan(attempts[index], attempts[index - 1])) {
            swap(attempts, index, index - 1);
            index--;
        }
    }

    function maintainSortByTricklingUp(attempts: AttemptHistory[], index: number) {
        while (index < attempts.length - 1 && greaterThan(attempts[index], attempts[index + 1])) { 
            swap(attempts, index, index + 1);
            index++;
        }
    }

    maintainSortByTricklingUp(attempts, index);
    maintainSortByTricklingDown(attempts, index);
}


function drawFromEquallySizedGroupsBasedOnPercentages<T>(percentages: IntegerPercentage[], list: T[]): T {
    const partitions = percentages.length;
    const indexGroups = divideEquallyIntoInclusiveIndices(list, partitions);
    return pickByPercentages(percentages.map((percent, i) => [
        percent, 
        () => list[randomNumberBetweenInclusive(indexGroups[i][0], indexGroups[i][1])]
    ]));
}

function intoCumulativePercentages(priorities: number[]): number[] {
    const result: number[] = [];
    let soFar = 0;
    priorities.forEach(p => {
        result.push((soFar + p) / 100);
        soFar += p;
    });
    return result;
}

type IntegerPercentage = number;
function pickByPercentages<T>(probabilitiesAndActions: [IntegerPercentage, () => T][]): T {
    const cumulative = intoCumulativePercentages(probabilitiesAndActions.map(t => t[0]));
    if (cumulative[cumulative.length - 1] != 1) {
        console.log("Probabilities don't add up to 1");
        console.log(probabilitiesAndActions);
        throw new Error("Probabilities don't add up to 1.");
    }
    const r = Math.random();
    let i = 0;
    while (r > cumulative[i]) { 
        i ++;
    }
    return probabilitiesAndActions[i][1]();
}


function randomNumberBetweenInclusive(low: number, high: number) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

function divideEquallyIntoInclusiveIndices<T>(list: T[], partitions: number): [number, number][] {
    const roughSizePerGroupFrac = list.length / partitions;
    const dividesCleanly = roughSizePerGroupFrac % 1 == 0;
    const roughSizePerGroup = Math.ceil(roughSizePerGroupFrac);

    const result: [number, number][] = [];

    let low = 0;
    let high = roughSizePerGroup - 1;

    for (let i = 0; i < partitions; i++) {
        const realHigh = Math.min(high, list.length - 1);
        if (low <= realHigh) {
            result.push([low, realHigh]);
        }
        low = realHigh + 1;
        high = realHigh + (roughSizePerGroup - (i % 2 == 0 && !dividesCleanly ? 1 : 0))
    }

    if (result.length < partitions) {
        result.reverse();
        while (result.length < partitions) {
            result.push(result[result.length - 1]);
        }
        result.reverse();
    }

    return result;
}

// let cd = new CardDrawer(["A", "B", "C", "D", "E", "F"], {byPercentiles: [60, 30, 10], percentNew: 50});
// console.log([ ... cd._flashcardToIndex]);
// let card1  = cd.drawCard();
// cd.recordAttempt(card1, true);

// let card2  = cd.drawCard();
// cd.recordAttempt(card2, true);

// let card3  = cd.drawCard();
// cd.recordAttempt(card3, false);

// console.log([ ... cd._flashcardToIndex]);