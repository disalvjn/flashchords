import { PlatonicFlashcard, DerivedFlashcard, DerivedFlashcardId, chordEntityToModel, polychord, sequence, octaveInstantiatedChord, getMusicalPhrase, getBases } from "../models/flashcard";
import { Note, PitchClass, NoteToMidi, Octave, solfegeNote, midiNote, scientificNote } from "../models/notes";
import { mapcat, shuffleArray, drawRandomSample, RandomSampleRepeatOptions, doTimes } from "../util/util";
import { ArpeggioType, DerivationOptions } from "../models/options";

export function derive(options: DerivationOptions, flashcards: PlatonicFlashcard[]): DerivedFlashcard[] {
    if (options.tonality.kind == "tonal") {
        const transposed = mapcat(flashcards, f => instantiateInOctaves(f, options.lowestNote, options.highestNote, options.tonality.tonic));
        shuffleArray(transposed);

        const derived = 
            (options.chunkSize <= 1 && !options.apreggiateChords)
            ? transposed.slice(0, Math.min(options.cards, transposed.length))

            : options.chunkType == "sequence" || options.apreggiateChords != "none"
            ? doTimes(() => createSequence(transposed, options.chunkSize, options.repeats), options.cards)

            // polychord
            : doTimes(() => createPolychord(transposed, options.chunkSize), options.cards);

        return derived.map(f => applyArpeggio(f, options.apreggiateChords));

    } else {
        throw new Error("Unsupported tonality type.");
    }
}

function applyArpeggio(flashcard: DerivedFlashcard, arpeggioType: ArpeggioType): DerivedFlashcard {
    if (arpeggioType == "none") {
        return flashcard;
    } else {
        const phrase = getMusicalPhrase(flashcard);
        const bases = getBases(flashcard);

        const arpeggiatedFlat = phrase.flat();
        arpeggiatedFlat.sort((n, m) => NoteToMidi(n) < NoteToMidi(m) ? -1 : 1);

        const arpeggiated = arpeggiatedFlat.map(n => [n]);

        if (arpeggioType == "descending") {
            arpeggiated.reverse();
        }

        return sequence(arpeggiated, bases);
    } 
}

function chordNotes(card: DerivedFlashcard): Note[] {
    if (card.kind == "octave-instantiated-chord") {
        return card.notes;
    } else {
        throw new Error("Can't take notes out of non-chord derived: " + card.kind);
    }
}

function createSequence(flashcards: DerivedFlashcard[], chunkSize: number, sampleOptions: RandomSampleRepeatOptions): DerivedFlashcard {
    const cards = drawRandomSample(flashcards, chunkSize, sampleOptions);
    return sequence(cards.map(chordNotes), cards.map(c => c.id));
}

function createPolychord(flashcards: DerivedFlashcard[], chunkSize: number): DerivedFlashcard {
    const cards = drawRandomSample(flashcards, chunkSize, "no-repeats");
    const uniqueNotes = [ ... new Set<number>(mapcat(cards, chordNotes).map(NoteToMidi))];
    uniqueNotes.sort();
    return polychord(uniqueNotes.map(midiNote), cards.map(c => c.id));
}

function instantiateInOctaves(flashcard: PlatonicFlashcard, lowestNote: Note, highestNote: Note, tonicPitch: PitchClass): DerivedFlashcard[] {
    const octaves: Octave[] = [2, 3, 4, 5, 6];
    const lowestNoteMidi = NoteToMidi(lowestNote);
    const highestNoteMidi = NoteToMidi(highestNote);

    if (flashcard.kind == "chord") {
        const result: DerivedFlashcard[] = [];
        octaves.forEach(o => {
            const tonic = scientificNote(tonicPitch, o);
            const candidate = octaveInstantiatedChord(
                o,
                tonicPitch,
                flashcard.notes.map(n => solfegeNote(n, tonic)),
                flashcard.id
            );
            const midis = chordNotes(candidate).map(NoteToMidi);
            const max = Math.max(... midis);
            const min = Math.min(... midis);

            if (max <= highestNoteMidi && min >= lowestNoteMidi) {
                result.push(candidate);
            };
        })

        return result;

    } else {
        console.log("Trying to octave displace unsupported flashcard type: " + flashcard.kind);
        return [];
    }
}

const f1 = chordEntityToModel({
    function: "I",
    category: "sdkljg",
    inv: "R 3 5", 
    notes: "do mi so"
});
const f2 = chordEntityToModel({
    function: "ii",
    category: "sdkljg",
    inv: "R 3 5", 
    notes: "re fa la"
});

// console.log(drawRandomSample([1,2,3,4], 3, "no-repeats"))
// console.log(drawRandomSample([1,2,3,4], 3, "no-repeats"))
// console.log(drawRandomSample([1,2,3,4], 3, "no-repeats"))
// console.log(drawRandomSample([1,2,3,4], 3, "no-repeats"))
// console.log(drawRandomSample([1,2,3,4], 3, "no-repeats"))

// console.log(drawRandomSample([1,2,3,4], 3, "non-sequential-repeats"))
// console.log(drawRandomSample([1,2,3,4], 3, "non-sequential-repeats"))
// console.log(drawRandomSample([1,2,3,4], 3, "non-sequential-repeats"))
// console.log(drawRandomSample([1,2,3,4], 3, "non-sequential-repeats"))
// console.log(drawRandomSample([1,2,3,4], 3, "non-sequential-repeats"))
// console.log(drawRandomSample([1,2,3,4], 3, "non-sequential-repeats"))
// console.log(drawRandomSample([1,2,3,4], 3, "non-sequential-repeats"))
// console.log(drawRandomSample([1,2,3,4], 3, "non-sequential-repeats"))
// console.log(drawRandomSample([1,2,3,4], 3, "non-sequential-repeats"))
// console.log(drawRandomSample([1,2,3,4], 3, "non-sequential-repeats"))


// console.log(instantiateInOctaves(f1, scientificNote("A", 3), scientificNote("A", 5), "B"));
    // ({kind: "chord", function: string, inversion: string, notes: OctaveSolfegeRelative[], category: string[]});