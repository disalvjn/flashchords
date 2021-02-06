import { Piano } from "@tonejs/piano";
import { start, context, Time, Transport } from "tone";
import { MusicalPhrase, Note, NoteToMidi } from "../models/notes";
import { PlayOptions } from "../models/options";

export { SoundPlayer, PianoPlayer }


interface SoundPlayer {
    playMusicalPhrase(phrase: MusicalPhrase): void;
    load(): Promise<boolean>;
}


class PianoPlayer implements SoundPlayer {
    private _piano: Piano = new Piano();
    private _options: PlayOptions;

    public constructor(options: PlayOptions) {
        this._options = options;
    };

    public async load(): Promise<boolean> {
        try {
            await start();
            await context.resume();
            await this._piano.context.resume();
            this._piano.toDestination();

            await this._piano.load();

            // Transport.bpm.value = this._options.bpm;

            console.log("Piano load successful.");
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    public playMusicalPhrase(phrase: MusicalPhrase) {
        let time = 0;
        if (this._options.playReference) {
            this.playChord([this._options.referenceNote], time, time + 1);
            time++;
        }
        phrase.forEach(chord => {
            this.playChord(chord, time, time + 1);
            time++;
        })
    }

    private playChord(notes: Note[], start: number, end: number) {
        const bpmFactor = 60 / this._options.bpm;
        // const toTime = (n: number) => "+" + Math.floor(n).toString();
        const toTime = (n: number) => "+" + (n * bpmFactor).toString();

        const midiNotes = notes.map(NoteToMidi);
        midiNotes.forEach(n => this._piano.keyDown({midi: n, time: toTime(start)}));
        midiNotes.forEach(n => this._piano.keyUp({midi: n, time: toTime(end)}));
    }
}