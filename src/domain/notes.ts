import { Frequency } from "tone";

export { Note, MidiNote, NoteToMidi, SolfegeClass, OctaveSolfege, toSolfege, toOctaveSolfege, PitchClass, Octave, noteDropdownOptions, numberedNoteDropdownOptions };

type PitchClass = "A" | "Bb" | "B" | "C" | "Db" | "D" | "Eb" | "E" | "F" | "F#" | "G" | "Ab";
type Octave = 1 | 2 | 3 | 4 | 5 | 6  | 7 | 8;
const noteDropdownOptions = ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab'];

 function flatMapThatJsReplVSCodeExtensionDoesntComplainAbout<A, B>(items: A[], f: (a: A) => B[]): B[] {
    const result: B[] = [];
    items.forEach(i => {
        f(i).forEach(j => result.push(j));
    });
    return result;
}

const numberedNoteDropdownOptions: string[] = flatMapThatJsReplVSCodeExtensionDoesntComplainAbout(
    [1, 2, 3, 4, 5, 6, 7, 8],
    num => noteDropdownOptions.map(letter => letter + num.toString())
);

type MidiNote = number;

type SolfegeClass = "do" 
    | "ra" | "re" | "ri" 
    | "me" | "mi"
    | "fa" | "fi"
    | "se" | "so" | "si" 
    | "le" | "la" | "li"
    | "te" | "ti"

type OctaveSolfege = {octaveOffset: number, solfege: SolfegeClass};

type Note =  
    {kind: "solfege", solfege: OctaveSolfege, tonic: Note}
    | {kind: "midi", midi: number} 
    | {kind: "scientific", class: PitchClass, octave: Octave};

function NoteToMidi(note: Note): MidiNote {
    return note.kind == "midi" ? note.midi
        : note.kind == "scientific" ? Frequency(note.class + note.octave.toString()).toMidi()
        : offsetFromRoot(note.solfege.solfege) + 12 * note.solfege.octaveOffset + NoteToMidi(note.tonic);
}

function offsetFromRoot(solfege: SolfegeClass): number {
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

function toSolfege(solfege: string): SolfegeClass {
    if (offsetFromRoot(solfege as SolfegeClass) == -1) {
        console.log("Not valid solfege: " + solfege);
        throw new Error("Invalid solfege: " + solfege);
    } else {
        return solfege as SolfegeClass;
    }
}

// just for ascending chords
function toOctaveSolfege(solfege: SolfegeClass[]): OctaveSolfege[] {
    let maxOffsetSoFar = -1;
    let octave = 0;
    const result: OctaveSolfege[] = [];

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
