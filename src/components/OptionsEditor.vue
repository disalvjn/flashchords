<template>
<v-container>
    <v-row>
        <v-col class="md-2">
            <v-btn @click="emit">
                Commit
            </v-btn>
        </v-col>
    </v-row>
    <v-row>
        <v-col class="md-2">
            <v-checkbox v-model="options.drone" label="Drone?"></v-checkbox>
        </v-col>
        <v-col class="md-2">
            <v-select v-model="referenceNote" label="Reference" :items="numberedNoteDropdownOptions"></v-select>
        </v-col>
        <v-col class="md-2">
            <v-select v-model="tonic" label="Tonic" :items="numberedNoteDropdownOptions"></v-select>
        </v-col>
        <v-col class="md-2">
            <v-select v-model="lowestRoot" label="Lowest Root" :items="numberedNoteDropdownOptions"></v-select>
        </v-col>
        <v-col class="md-4">
            <v-checkbox v-model="options.tonicizeAndDeduplicate" label="Tonicize and Deduplicate?"></v-checkbox>
        </v-col>
    </v-row>
    <v-row>
        <v-col class="md-2">
            <v-checkbox v-model="options.arpeggiateChords" label="Arpeggiate Chords?"></v-checkbox>
        </v-col>
        <v-col class="md-2">
            <v-text-field v-model.number="options.cardChunkSize" label="Card Chunk Size"></v-text-field>
        </v-col>
        <v-col class="md-8">
        </v-col>
    </v-row>
    <v-row>
        <v-col class="md-2">
            <v-text-field v-model.number="options.priorities.percentNew" label="Percent New"></v-text-field>
        </v-col>
        <v-col class="md-2">
            <v-text-field v-model="byPercentilesString" label="Percentiles"></v-text-field>
        </v-col>
        <v-col class="md-8">
        </v-col>
    </v-row>
</v-container>
    
</template>

<script lang="ts">
import { Component, Watch, Emit, Prop, Vue } from "vue-property-decorator";
import { VBtn, VContainer, VRow, VCol, VSelect,VCheckbox, VTextField } from "vuetify/lib";
import { defaultOptions, Options } from "../domain/models/options";
import { Note, Octave, PitchClass, numberedNoteDropdownOptions } from "../domain/notes";

@Component ({
  components: {
      VContainer, VRow, VCol,
      VSelect, VCheckbox, VTextField,
      VBtn
  }
})
export default class OptionsEditor extends Vue {
    private readonly numberedNoteDropdownOptions: string[] = [ ... numberedNoteDropdownOptions ];

    private readonly options: Options = { ... defaultOptions, priorities: { ... defaultOptions.priorities } };

    private readonly referenceNote: string = "A3";
    private readonly lowestRoot: string = "F2";
    private readonly tonic: string = "A3";

    private readonly byPercentilesString: string = "50 30 20";

    @Watch('byPercentilesString')
    byPercentilesChanged(newValue: string) {
        this.options.priorities.byPercentiles = newValue.split(" ").map(x => parseInt(x));
    }

    @Watch('referenceNote')
    referenceNoteChanged(newValue: string) {
        this.options.referenceNote = this.stringToScientificNote(newValue);
    }

    @Watch('lowestRoot')
    lowestRootChanged(newValue: string) {
        this.options.lowestRoot = this.stringToScientificNote(newValue);
    }

    @Watch('tonic')
    tonicChanged(newValue: string) {
        this.options.tonic = this.stringToScientificNote(newValue);
    }

    private stringToScientificNote(note: string): Note {
        const pitch = note.substring(0, note.length - 1);
        const octave = parseInt(note.substring(note.length - 1, note.length));
        return {kind: "scientific", class: pitch as PitchClass, octave: octave as Octave};
    }

    @Emit('input')
    emit(): Options {
        return this.options;
    }
}
</script>