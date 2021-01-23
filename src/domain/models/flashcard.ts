import { ChordFlashcardEntity } from "../entities/chord-flashcard-entity";

export { ChordFlashcard, chordEntityToModel, Flashcard }

interface Flashcard {
    readonly id: string;
    readonly category: string[];
    readonly notes: string[]; 
    readonly offsets: number[];
}

interface JustChord {
    readonly function: string;
    readonly inversion: string;
}

type ChordFlashcard = Flashcard & JustChord;
type MelodyFlashcard = Flashcard;

const offsetFromRoot: Map<string, number> = new Map([
    ["do", 0],
    ["ra", 1],
    ["re", 2],
    ["ri", 3],
    ["me", 3],
    ["mi", 4],
    ["fa", 5],
    ["fi", 6],
    ["se", 6],
    ["so", 7],
    ["si", 8],
    ["le", 8],
    ["la", 9],
    ["li", 10],
    ["te", 10],
    ["ti", 11]
]);

function solfegeToOffsetsFromTonic(solfege: string[]): number[] {
    let maxOffsetSoFar = -1;
    let octave = 0;
    const result: number[] = [];

    solfege.forEach(note => {
        const baseOffset = offsetFromRoot.get(note) ?? 0;
        while (baseOffset + octave * 12 <= maxOffsetSoFar) {
            octave++;
        }
        const withOctave = baseOffset + 12 * octave;
        maxOffsetSoFar = withOctave;
        result.push(withOctave);
    });
    return result;
}

function chordEntityToModel(entity: ChordFlashcardEntity): ChordFlashcard {
    const notes = entity.notes.split(" ");
    return {
        id: entity.function + " : " + entity.inv,
        function: entity.function,
        inversion: entity.inv,
        category: entity.category.split("."),
        notes: notes,
        offsets: solfegeToOffsetsFromTonic(notes)
    };
};

// console.log(chordEntityToModel({function: "iii", inv: "R 3 5 R 9", category: "triads.diatonic.major", notes: "do re mi do re"}))
// console.log(chordEntityToModel({function: "iii", inv: "R 3 5", category: "triads.diatonic.major", notes: "do do re do re"}))