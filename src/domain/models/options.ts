import { Note, PitchClass } from "../notes";
export { Options, defaultOptions, Priorities }


interface Options {

    drone: boolean;
    referenceNote: Note;
    tonic: Note;
    lowestRoot: Note;
    tonicizeAndDeduplicate: boolean;

    arpeggiateChords: boolean;
    cardChunkSize: number;

    // 60 20 20 | 50 
    // would mean 50% new cards that haven't been tested yet, until that runs out
    // then when a previously tested card is pulled, there is a :
    // 60% chance it's a card that is in the bottom third of your performance
    // 20% for 33-66th percentile
    // 20% for 67-100th percentile 
    priorities: Priorities;

}

interface Priorities {
    percentNew: number;
    byPercentiles: number[];
}

const defaultOptions: Options = {
    drone: true,
    referenceNote: {kind: "scientific", class: "A", octave: 3},
    tonic: {kind: "scientific", class: "A", octave: 3},
    lowestRoot: {kind: "scientific", class: "F#", octave: 2},
    tonicizeAndDeduplicate: false,
    arpeggiateChords: false,
    cardChunkSize: 1,
    priorities: {
        percentNew: 40,
        byPercentiles: [50, 30, 20]
    }
};