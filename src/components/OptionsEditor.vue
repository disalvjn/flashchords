<template>
<v-container>
    <v-row>
        <v-col class="md-2">
            <v-checkbox v-model="options.drone" label="Drone?"></v-checkbox>
        </v-col>
        <v-col class="md-2">
            <v-select v-model="options.referenceNote" label="Reference" :items="numberedNoteDropdownOptions"></v-select>
        </v-col>
        <v-col class="md-2">
            <v-select v-model="options.tonic" label="Tonic" :items="noteDropdownOptions"></v-select>
        </v-col>
        <v-col class="md-2">
            <v-select v-model="options.lowestRoot" label="Lowest Root" :items="numberedNoteDropdownOptions"></v-select>
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
            <div>percentNew</div>
        </v-col>
        <v-col class="md-2">
            <div>byPercentiles</div>
        </v-col>
        <v-col class="md-8">
        </v-col>
    </v-row>
</v-container>
    
</template>

<script lang="ts">
import { Component, Watch, Emit, Prop, Vue } from "vue-property-decorator";
import { VContainer, VRow, VCol, VSelect,VCheckbox, VTextField } from "vuetify/lib";
import { noteDropdownOptions, numberedNoteDropdownOptions, defaultOptions, Options } from "../domain/models/options";

@Component ({
  components: {
      VContainer, VRow, VCol,
      VSelect, VCheckbox, VTextField
  }
})
export default class OptionsEditor extends Vue {
    private readonly numberedNoteDropdownOptions: string[] = [ ... numberedNoteDropdownOptions ];
    private readonly noteDropdownOptions: string[] = [ ... noteDropdownOptions ];
    private readonly options: Options = { ... defaultOptions, priorities: { ... defaultOptions.priorities } };
}
    // drone: true,
    // referenceNote: 'A3',
    // tonic: 'A',
    // lowestRoot: 'F2',
    // tonicizeAndDeduplicated: false,
    // arpeggiateChords: false,
    // cardChunkSize: 1,
    // priorities: {
    //     percentNew: 40,
    //     byPercentiles: [50, 30, 20]
    // }
</script>