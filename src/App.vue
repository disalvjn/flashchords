<template>
<v-app>
  <v-main>
  <v-tabs>
    <v-tab> Let's go! </v-tab>
    <v-tab-item>
      <v-container>
        <v-row v-if="!pianoLoaded">
          <v-btn @click="loadPiano"><h1>Load Piano</h1></v-btn>
        </v-row>
        <v-row v-if="this.practiceState.giveUp">
          <v-col><h2>{{ currentCardDescription }}</h2></v-col>
        </v-row>
        <!-- Button navigation for testing -->
        <v-row v-if="this.selectedFlashcardIds.length > 0">
          <v-col class="md-2"><v-btn @click="drawCard">Draw Card</v-btn></v-col>
          <v-col class="md-2"><v-btn @click="giveUp">Give Up</v-btn></v-col>
          <v-col class="md-2"><v-btn @click="playCard">Play Card</v-btn></v-col>
          <v-col class="md-2"><v-btn @click="recordResult(true)">Succeed</v-btn></v-col>
          <v-col class="md-2"><v-btn @click="recordResult(false)">Fail</v-btn></v-col>
        </v-row>
        <v-row v-else>
          <v-col class="md-12"><h2>No Flashcards Selected</h2></v-col>
        </v-row>
      </v-container>
    </v-tab-item>
    <v-tab> Options </v-tab>
    <v-tab-item>
     <options-editor v-model="options"></options-editor>
    </v-tab-item>
    <v-tab> Flashcards </v-tab>
    <v-tab-item>
      <flashcardSelector :categories="categories" v-model="selectedFlashcardIds"></flashcardSelector>
    </v-tab-item>
  </v-tabs>
  </v-main>
</v-app>
</template>
<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import HelloWorld from "./components/HelloWorld.vue";
import FlashcardSelector from "./components/FlashcardSelector.vue";
import OptionsEditor from "./components/OptionsEditor.vue";
import { Piano } from '@tonejs/piano';
import { VBtn, VContainer, VRow, VCol, VTabs, VApp, VMain, VTabItem, VTab } from "vuetify/lib";

import { chordEntities } from './flashcards/chords/chord-entities';
import { Flashcard, chordEntityToModel, FlashcardId } from './domain/models/flashcard';
import { reifyCategories , Category } from './domain/models/category';
import { Options, defaultOptions } from './domain/models/options';
import { PrioritiesCardDrawer, CardDrawer } from './domain/cardDrawer';
import { SoundPlayer, PianoPlayer } from './domain/soundPlayer';
import { Note } from "./domain/notes";

interface PracticeState {
  currentCardId: FlashcardId;
  wrongGuesses: number;
  giveUp: boolean;
}

@Component ({
  components: {
    FlashcardSelector, OptionsEditor,
    VApp, VMain,
    VTabs, VTab, VTabItem,
    VContainer, VRow, VCol,
    VBtn
  }
})
export default class App extends Vue {
  private options: Options = defaultOptions;
  private chords: Flashcard[] = chordEntities.map(chordEntityToModel);
  private categories: Category[] = reifyCategories(this.chords);
  private selectedFlashcardIds: FlashcardId[] = [];
  private cardDrawer: CardDrawer = new PrioritiesCardDrawer(this.selectedFlashcardIds, this.options.priorities);
  private player: SoundPlayer | undefined = undefined;

  private pianoLoaded = false;

  private practiceState: PracticeState = {currentCardId: "", wrongGuesses: 0, giveUp: false};

  @Watch('options', {
    deep: true
  })
  optionsChanged(newVal: Options) {
    this.cardDrawer.resetPriorities(newVal.priorities);
  }

  @Watch('selectedFlashcardIds', { deep: true })
  selectedFlashcardIdsChanged(newVal: FlashcardId[]) {
    this.cardDrawer.resetFlashcards(newVal);
  }

  async loadPiano() {
    this.player = new PianoPlayer();
    await this.player.load();
    this.pianoLoaded = true;
  }

  drawCard() {
    this.practiceState = {currentCardId: this.cardDrawer.drawCard(), wrongGuesses: 0, giveUp: false};
  }

  recordResult(success: boolean) {
    this.cardDrawer.recordAttempt(this.practiceState.currentCardId, success);
    this.drawCard();
  }

  playCard() {
    const currentCard = this.currentCard;

    if (currentCard && currentCard.kind == "chord") {
      const chord: Note[] = currentCard.notes.map(s => ({kind: "solfege", solfege: s, tonic: this.options.tonic}));
      console.log(chord);
      this.player!.playChord(chord, 1, this.options.referenceNote);
    }
  }

  giveUp() {
    this.practiceState.giveUp = true;
  }

  get chordsbyId(): Map<FlashcardId, Flashcard> {
    const result = new Map<FlashcardId, Flashcard>();
    this.chords.forEach(c => result.set(c.id, c));
    return result;
  }

  get currentCard(): Flashcard | undefined {
    return this.chordsbyId.get(this.practiceState.currentCardId);
  }

  get currentCardDescription(): string {
    return this.currentCard == undefined 
      ? ""

      : this.currentCard.kind == "chord" 
      ? this.currentCard.function + " " + this.currentCard.inversion + " : " + this.currentCard.notes.map(n => n.solfege).join(", ")

      : this.currentCard.notes.join(", ");
  }
}

</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
