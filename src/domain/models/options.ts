export { noteDropdownOptions, numberedNoteDropdownOptions, Options, defaultOptions }

const noteDropdownOptions = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
const numberedNoteDropdownOptions = [2, 3, 4, 5, 6].flatMap(num => noteDropdownOptions.map(letter => letter + num.toString()));

type NumberedNote = string;
type NoteClass = string;

interface Options {

    drone: boolean;
    referenceNote: NumberedNote;
    tonic: NoteClass;
    lowestRoot: NumberedNote;
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
    referenceNote: 'A3',
    tonic: 'A',
    lowestRoot: 'F2',
    tonicizeAndDeduplicate: false,
    arpeggiateChords: false,
    cardChunkSize: 1,
    priorities: {
        percentNew: 40,
        byPercentiles: [50, 30, 20]
    }
};