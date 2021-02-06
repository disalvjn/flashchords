<template>
<div>
    <v-btn @click="emit">Commit</v-btn>
    <vue-json-editor v-model="options" :expandedOnStart="true" @json-change="onJsonChange"></vue-json-editor>
</div>
</template>

<script lang="ts">
import { Component, Watch, Emit, Prop, Vue } from "vue-property-decorator";
import { VBtn, VContainer, VRow, VCol, VSelect,VCheckbox, VTextField } from "vuetify/lib";
import { defaultOptions, Options } from "../domain/models/options";
import { Note, Octave, PitchClass, numberedNoteDropdownOptions } from "../domain/models/notes";
import vueJsonEditor from "vue-json-editor";

@Component ({
  components: {
      VContainer, VRow, VCol,
      VSelect, VCheckbox, VTextField,
      VBtn, vueJsonEditor
  }
})
export default class OptionsEditor extends Vue {

    private options: Options = { ... defaultOptions, priorities: { ... defaultOptions.priorities } };

    onJsonChange(newValue: Options) {
        this.options = newValue;
    }

    @Emit('input')
    emit(): Options {
        return this.options;
    }
}
</script>