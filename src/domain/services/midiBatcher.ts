import { MidiNote, Note, NoteToMidi } from "../models/notes";
import { MidiBatcherConfig } from "../models/options";

export type MidiBatcherEvent = 
    {kind: "rightAnswer", onFirstGuess: boolean}
    | {kind: "giveUp"}
    | {kind: "nextCard"}
    | {kind: "replay"}

export class MidiBatcher {
    private _target: (MidiNote[])[] = [];
    private _failedYet = false;
    private _input: MidiNote[] = [];
    private _batchSizes: number[] = [];
    private _maxInputLength = 0;

    private _config: MidiBatcherConfig;
    private _emit: ((m: MidiBatcherEvent) => void);

    constructor(config: MidiBatcherConfig, emit: (m: MidiBatcherEvent) => void)
    {
        this._config = config;
        this._emit = emit;
    }

    setConfig(config: MidiBatcherConfig)
    {
        this._config = config;
    }

    setEmit(emit: (m: MidiBatcherEvent) => void)
    {
        this._emit = emit;
    }

    resetTarget(notes: (Note[])[]): void
    {
        this._target = notes.map(n => n.map(NoteToMidi));
        this._failedYet = false;
        this._input = [];
        this._batchSizes = notes.map(n => n.length);
        this._maxInputLength = this._batchSizes.reduce((a, x) => a + x, 0);
    }

    accept(note: MidiNote): void 
    {
        if (note == NoteToMidi(this._config.giveUp)) {
            this._emit({kind: "giveUp"});
        } else if (note == NoteToMidi(this._config.nextCard)) {
            this._emit({kind: "nextCard"});
        } else if (note == NoteToMidi(this._config.replay)) {
            this._emit({kind: "replay"});
        } else {

            this._input.push(note);
            if (this._input.length < this._maxInputLength) {
                // do nothing, we don't have enough to try matching yet
            } else {
                if (this._input.length > this._maxInputLength) {
                    this._input.shift();
                }

                const batched = batch(this._input, this._batchSizes);

                if (batchesEqual(batched, this._target)) {
                    this._emit({kind: "rightAnswer", onFirstGuess: !this._failedYet});
                } else {
                    this._failedYet = true;
                }
            }
        }
    }
}

function batch<T>(inputs: T[], batchSizes: number[]): T[][] {
    const batched: T[][] = [];
    let i = 0;
    batchSizes.forEach(batchSize => {
        const batch: T[] = [];
        for (let _ = 0; _ < batchSize && i < inputs.length; _++) {
            batch.push(inputs[i++]);
        }
        batched.push(batch);
    })
    return batched;
}

function batchesEqual<T>(a: T[][], b: T[][]) {
    function batchEqual<T>(a: T[], b: T[]): boolean {
        const aSet = new Set(a);
        return (a.length == b.length) && b.every(x => aSet.has(x));
    }

    if (a.length != b.length) {
        return false;
    } else {
        for (let i = 0; i < a.length; i++) {
            if (! batchEqual(a[i], b[i])) {
                return false;
            }
        }
    }

    return true;
}


// console.log(batch([1,2,3,4,5,6,7,8,9], [3, 2, 1, 3]))

// console.log(batchesEqual([1,2,3], [2,3,1]))
// console.log(batchesEqual([1,2,3], [3,1]))
// console.log(batchesEqual([2,3], [3,1]))

// let events: MidiBatcherEvent[] = [];
// let m = new MidiBatcher({giveUp: 100, replay: 101, nextCard: 102}, x => events.push(x));
// m.resetTarget([
//     [{kind: "midi", midi: 1}, {kind: "midi", midi: 2}],
//     [{kind: "midi", midi: 11}],
//     [{kind: "midi", midi: 21}, {kind: "midi", midi: 22}]
// ]);

// m.accept(100);
// console.log(events);
// m.accept(1); m.accept(2); m.accept(11);
// console.log(events);
// m.accept(1); m.accept(2); m.accept(11); m.accept(22); m.accept(21);
// console.log(events);
// console.log(events);