import { ChordFlashcardEntity } from "../entities/chord-flashcard-entity";
import { OctaveSolfege, toSolfege, toOctaveSolfege } from "../notes";

export { chordEntityToModel, Flashcard, FlashcardId }

type FlashcardId = string;

type SpecificFlashcardData  = 
    {kind: "chord", function: string, inversion: string}
    | { kind: "melody" };

interface GeneralFlashcardData {
    readonly id: FlashcardId;
    readonly category: string[];
    readonly notes: OctaveSolfege[]; 
}

type Flashcard = SpecificFlashcardData & GeneralFlashcardData;

function chordEntityToModel(entity: ChordFlashcardEntity): Flashcard {
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

// console.log(chordEntityToModel({function: "iii", inv: "R 3 5 R 9", category: "triads.diatonic.major", notes: "do re mi do re"}))
// console.log(chordEntityToModel({function: "iii", inv: "R 3 5", category: "triads.diatonic.major", notes: "do do re do re"}))