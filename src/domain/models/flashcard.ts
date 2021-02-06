import { ChordFlashcardEntity } from "../entities/chord-flashcard-entity";
import { OctaveSolfegeRelative, toSolfege, toOctaveSolfege, MusicalPhrase, Note, PitchClass } from "./notes";

export type PlatonicFlashcardId = string;
export type DerivedFlashcardId = string;

interface PlatonicFlashcardWithId {
    readonly id: PlatonicFlashcardId;
}

interface DerivedFlashcardWithId {
    readonly id: DerivedFlashcardId;
}

export type PlatonicFlashcard = PlatonicFlashcardWithId &
    ({kind: "chord", function: string, inversion: string, notes: OctaveSolfegeRelative[], category: string[]});

export type DerivedFlashcard = DerivedFlashcardWithId &
    ({kind: "octave-instantiated-chord", octave: number, tonic: PitchClass, notes: Note[], base: PlatonicFlashcardId}
    | {kind: "sequence", sequence: Note[][], bases: DerivedFlashcardId[]}
    | {kind: "polychord", bases: DerivedFlashcardId[], notes: Note[]});

export function getMusicalPhrase(flashcard: DerivedFlashcard): MusicalPhrase {
    return flashcard.kind == "octave-instantiated-chord" ? [flashcard.notes]
        : flashcard.kind == "sequence" ? flashcard.sequence
        : [flashcard.notes];
}

export function octaveInstantiatedChord(octave: number, tonic: PitchClass, notes: Note[], base: PlatonicFlashcardId): DerivedFlashcard {
    return {
        id: "tonic=" + tonic + octave.toString() + " chord: " + base,
        kind: "octave-instantiated-chord",
        base: base,
        tonic: tonic,
        octave: octave,
        notes: notes
    };
}

export function sequence(notes: Note[][], bases: DerivedFlashcardId[]): DerivedFlashcard {
    return {
        id: "sequence: " + bases.join("  && "),
        kind: "sequence",
        bases: bases,
        sequence: notes
    };
}

export function polychord(notes: Note[], bases: DerivedFlashcardId[]): DerivedFlashcard {
    return {
        id: "polychord: " + bases.join(" && "),
        kind: "polychord",
        bases: bases,
        notes: notes
    };
}

export function chordEntityToModel(entity: ChordFlashcardEntity): PlatonicFlashcard {
    const notes = toOctaveSolfege(entity.notes.split(" ").map(toSolfege));
    return {
        id: entity.function + " : " + entity.inv,
        function: entity.function,
        inversion: entity.inv,
        category: entity.category.split("."),
        notes: notes,
        kind: "chord"
    };
};

export function getMusicalPhrasePlatonic(flashcard: PlatonicFlashcard, tonic: Note): MusicalPhrase {
    if (flashcard.kind == "chord") {
        const chord: Note[] = flashcard.notes.map(s => ({kind: "solfege", solfege: s, tonic: tonic}));
        return [chord];
    } else {
        throw Error("Unsupported platonic flashcard type: " + flashcard.kind);
    }
}

// console.log(chordEntityToModel({function: "iii", inv: "R 3 5 R 9", category: "triads.diatonic.major", notes: "do re mi do re"}))
// console.log(chordEntityToModel({function: "iii", inv: "R 3 5", category: "triads.diatonic.major", notes: "do do re do re"}))