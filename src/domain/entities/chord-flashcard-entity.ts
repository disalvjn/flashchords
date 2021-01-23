export { ChordFlashcardEntity }

interface ChordFlashcardEntity {
    // "function": "I",
    // "inv": "R 3 5",
    // "category": "triads.diatonic.major",
    // "notes": "do mi so"
    readonly function: string;
    readonly inv: string;
    readonly category: string;
    readonly notes: string;
}