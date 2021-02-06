import { Frequency } from "tone";
import { mapcat } from "../util/util";

export type PitchClass = "A" | "Bb" | "B" | "C" | "Db" | "D" | "Eb" | "E" | "F" | "F#" | "G" | "Ab";
export type Octave = 1 | 2 | 3 | 4 | 5 | 6  | 7 | 8;

export type MidiNote = number;

export type SolfegeClass = "do" 
    | "ra" | "re" | "ri" 
    | "me" | "mi"
    | "fa" | "fi"
    | "se" | "so" | "si" 
    | "le" | "la" | "li"
    | "te" | "ti"

export type OctaveSolfegeRelative = {octaveOffset: number, solfege: SolfegeClass};

export type Note =  
    {kind: "solfege", solfege: OctaveSolfegeRelative, tonic: Note}
    | {kind: "midi", midi: number} 
    | {kind: "scientific", class: PitchClass, octave: Octave};

export function solfegeNote(solfege: OctaveSolfegeRelative, tonic: Note): Note {
    return {kind: "solfege", solfege: solfege, tonic: tonic};
}

export function scientificNote(pitchClass: PitchClass, octave: Octave): Note {
    return {kind: "scientific", class: pitchClass, octave: octave};
}

export function midiNote(midi: number): Note {
    return {kind: "midi", midi: midi};
}

export type MusicalPhrase = Note[][];

export const noteDropdownOptions = ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab'];

export const numberedNoteDropdownOptions: string[] = mapcat(
    [1, 2, 3, 4, 5, 6, 7, 8],
    num => noteDropdownOptions.map(letter => letter + num.toString())
);

export function NoteToMidi(note: Note): MidiNote {
    return note.kind == "midi" ? note.midi
        : note.kind == "scientific" ? Frequency(note.class + note.octave.toString()).toMidi()
        : offsetFromRoot(note.solfege.solfege) + 12 * note.solfege.octaveOffset + NoteToMidi(note.tonic);
}

export type NoteComparison = "greater" | "equal" | "lesser"
export function compareNotes(n: Note, m: Note): NoteComparison {
    const x = NoteToMidi(n); const y = NoteToMidi(m);
    return x < y ? "lesser" : x > y ? "greater" : "equal";
}

export function offsetFromRoot(solfege: SolfegeClass): number {
    return solfege == "do" ? 0
        : solfege == "ra" ? 1
        : solfege == "re" ? 2
        : solfege == "ri" ? 3
        : solfege == "me" ? 3
        : solfege == "mi" ? 4
        : solfege == "fa" ? 5
        : solfege == "fi" ? 6
        : solfege == "se" ? 6
        : solfege == "so" ? 7
        : solfege == "si" ? 8
        : solfege == "le" ? 8
        : solfege == "la" ? 9
        : solfege == "li" ? 10
        : solfege == "te" ? 10
        : solfege == "ti" ? 11
        : -1; 
}

export function toSolfege(solfege: string): SolfegeClass {
    if (offsetFromRoot(solfege as SolfegeClass) == -1) {
        console.log("Not valid solfege: " + solfege);
        throw new Error("Invalid solfege: " + solfege);
    } else {
        return solfege as SolfegeClass;
    }
}

// just for ascending chords
export function toOctaveSolfege(solfege: SolfegeClass[]): OctaveSolfegeRelative[] {
    let maxOffsetSoFar = -1;
    let octave = 0;
    const result: OctaveSolfegeRelative[] = [];

    solfege.forEach(note => {
        const baseOffset = offsetFromRoot(note) ?? 0;
        while (baseOffset + octave * 12 <= maxOffsetSoFar) {
            octave++;
        }
        const withOctave = baseOffset + 12 * octave;
        maxOffsetSoFar = withOctave;
        result.push({solfege: note, octaveOffset: octave});
    });
    return result;
}