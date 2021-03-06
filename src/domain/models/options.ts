import { Note, PitchClass, scientificNote } from "./notes";
import { RandomSampleRepeatOptions } from "../util/util";

export type ChunkType = "sequence" | "polychord";
export type Tonality = 
    | {kind: "tonal", tonic: PitchClass };
    // | {kind: "atonal-fixed", commonRoot: PitchClass }
    // | {kind: "chromatically-transposed" }

export type ArpeggioType = "none" | "ascending" | "descending"
export type DerivationOptions = {
    lowestNote: Note;
    highestNote: Note;
    tonality: Tonality;
    chunkSize: number;
    chunkType: ChunkType;
    repeats: RandomSampleRepeatOptions;
    cards: number;
    apreggiateChords: ArpeggioType;
}

export type MidiBatcherConfig = {
    giveUp: Note;
    nextCard: Note;
    replay: Note;
    toggleIgnoreInput: Note;
}

export type PlayOptions = {
    drone: boolean;
    referenceNote: Note;
    playReference: boolean;
    bpm: number;
}

export type Options = {

    play: PlayOptions;

    priorities: Priorities;

    derivation: DerivationOptions;

    commands: MidiBatcherConfig;
}


// 60 20 20 | 50 
// would mean 50% new cards that haven't been tested yet, until that runs out
// then when a previously tested card is pulled, there is a :
// 60% chance it's a card that is in the bottom third of your performance
// 20% for 33-66th percentile
// 20% for 67-100th percentile 
export type Priorities = {
    percentNew: number;
    byPercentiles: number[];
}

export const defaultOptions: Options = {
    play: {
        drone: false,
        referenceNote: scientificNote("A", 3),
        playReference: true,
        bpm: 60
    },
    priorities: {
        percentNew: 50,
        byPercentiles: [65, 35]
    },
    derivation: {
        lowestNote: scientificNote("F#", 2),
        highestNote: scientificNote("D", 5),
        tonality: {kind: "tonal", tonic: "A"},
        chunkSize: 1,
        chunkType: "sequence",
        repeats: "non-sequential-repeats",
        cards: 20,
        apreggiateChords: "none"
    },
    commands: {
        giveUp: scientificNote("Ab", 7),
        replay: scientificNote("F#", 7),
        nextCard: scientificNote("Bb", 7),
        toggleIgnoreInput: scientificNote("G", 7)
    }
};