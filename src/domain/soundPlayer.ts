import { Piano } from "@tonejs/piano";
import { start, context, Time } from "tone";
import { Note, NoteToMidi } from "./notes";

export { SoundPlayer, PianoPlayer }


interface SoundPlayer {
    playChord(notes: Note[], time: number, reference: Note | undefined): void;
    load(): Promise<boolean>;
}


class PianoPlayer implements SoundPlayer {
    private _piano: Piano = new Piano();

    public async load(): Promise<boolean> {
        try {
            await start();
            await context.resume();
            await this._piano.context.resume();
            this._piano.toDestination();

            await this._piano.load();
            console.log("Piano load successful.");
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    public playChord(notes: Note[], time: number, reference: Note | undefined) {
        const toTime = (n: number) => "+" + Math.floor(n).toString();

        const midiNotes = notes.map(NoteToMidi);
        const midiReference = reference ? NoteToMidi(reference) : undefined;
        const trueChordStartTime = toTime(reference ? time : 0);
        const trueChordEndTime = toTime(reference ? time * 2 : time);

        console.log(midiNotes);
        console.log(midiReference);
        console.log(trueChordStartTime);
        console.log(trueChordEndTime);

        if (midiReference) {
            this._piano.keyDown({midi: midiReference});
            this._piano.keyUp({midi: midiReference, time: trueChordStartTime});
            midiNotes.forEach(n => this._piano.keyDown({midi: n, time: trueChordStartTime}));
            midiNotes.forEach(n => this._piano.keyUp({midi: n, time: trueChordEndTime}));
        } else {
            midiNotes.forEach(n => this._piano.keyDown({midi: n}));
            midiNotes.forEach(n => this._piano.keyUp({midi: n, time: trueChordEndTime}));
        }
    }
}