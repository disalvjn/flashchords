<template>
<v-app>
  <v-main>
    <v-container v-if="pianoLoaded">
      <v-row v-if="this.practiceState.giveUp">
        <v-col><h2>{{ currentCardDescription }}</h2></v-col>
      </v-row>
      <v-row v-if="this.selectedFlashcardIds.length == 0">
        <v-col class="md-12"><h2>No Flashcards Selected</h2></v-col>
      </v-row>
      <v-row v-else-if="!pianoLoaded">
        <v-btn @click="loadPiano"><h1>Load Piano</h1></v-btn>
      </v-row>
      <!-- Button navigation for testing -->
      <v-row v-else>
        <v-col class="md-2"><v-btn @click="drawCard">Draw Card</v-btn></v-col>
        <v-col class="md-2"><v-btn @click="giveUp">Give Up</v-btn></v-col>
        <v-col class="md-2"><v-btn @click="playCard">Play Card</v-btn></v-col>
        <v-col class="md-2"><v-btn @click="recordResult(true)">Succeed</v-btn></v-col>
        <v-col class="md-2"><v-btn @click="recordResult(false)">Fail</v-btn></v-col>
      </v-row>
    </v-container>
    <v-container v-else>
      <v-row>
        <v-col class="lg-4"></v-col>
        <v-col class="lg-4"><v-btn @click="loadAll">Proceed Irreversibly</v-btn></v-col>
        <v-col class="lg-4"></v-col>
      </v-row>
      <v-row>
        <v-col class="lg-6"><options-editor v-model="options"></options-editor></v-col>
        <v-col class="lg-6"><flashcardSelector :categories="categories" v-model="selectedFlashcardIds"></flashcardSelector></v-col>
      </v-row>
    </v-container>
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
import { PlatonicFlashcard, DerivedFlashcard, chordEntityToModel, PlatonicFlashcardId, DerivedFlashcardId, getMusicalPhrase } from './domain/models/flashcard';
import { reifyCategories , Category } from './domain/models/category';
import { Options, defaultOptions } from './domain/models/options';
import { PrioritiesCardDrawer, CardDrawer } from './domain/services/cardDrawer';
import { SoundPlayer, PianoPlayer } from './domain/services/soundPlayer';
import { Note, NoteToMidi, scientificNote } from "./domain/models/notes";
import { MidiBatcher } from "./domain/services/midiBatcher";
import { derive } from "./domain/services/flashcardDeriver";
import { indexBy } from "./domain/util/util";
import webmidi, { WebMidi } from "webmidi";

interface PracticeState {
  currentCardId: DerivedFlashcardId;
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
  private chords: PlatonicFlashcard[] = chordEntities.map(chordEntityToModel);
  private selectedFlashcardIds: PlatonicFlashcardId[] = [];
  private categories: Category[] = reifyCategories(this.chords);

  private activeFlashcards: DerivedFlashcard[] =[];

  private cardDrawer: CardDrawer = new PrioritiesCardDrawer(this.selectedFlashcardIds, this.options.priorities);
  private player: SoundPlayer | undefined = undefined;

  private midiBatcher: MidiBatcher = new MidiBatcher(
    defaultOptions.commands,
    _ => console.log("got midi event, not sure what to do with it yet."));

  private pianoLoaded = false;

  private practiceState: PracticeState = {currentCardId: "", wrongGuesses: 0, giveUp: false};

  async loadAll() {
    // load cards
    this.cardDrawer.resetPriorities(this.options.priorities);
    const platonicCardsById = indexBy(this.chords, c => c.id);
    this.activeFlashcards = derive(this.options.derivation, this.selectedFlashcardIds.map(f => platonicCardsById.get(f)!));
    this.cardDrawer.resetFlashcards(this.activeFlashcards.map(f => f.id));

    // load piano and midi
    this.player = new PianoPlayer(this.options.play);
    await this.player.load();
    this.pianoLoaded = true;

    webmidi.enable(ex => {
      if (ex != undefined) {
        console.log("Error trying to setup midi listener: " + ex.name);
      } else {
        console.log("Successfully set up midi listner.")
      }

      console.log(webmidi.inputs);
      console.log(webmidi.outputs);

      if (webmidi.inputs.length == 0) {
        console.log("No midi input device detected.");
      }

      const input = webmidi.inputs[0];
      input.addListener("noteon", "all", e => {
        this.midiBatcher.accept(e.note.number);
      });
    }, true);

    this.midiBatcher.setEmit(event => {
      if (event.kind == "giveUp") {
        this.giveUp();
      } else if (event.kind == "replay") {
        this.playCard();
      } else if (event.kind == "nextCard") {
        this.recordResult(false);
        this.drawCard();
        this.playCard();
      } else if (event.kind == "rightAnswer") {
        this.recordResult(event.onFirstGuess);
        this.drawCard();
        this.playCard();
      }
    });

    this.drawCard();
    this.playCard();
  }

  drawCard() {
    try {
      this.practiceState = {currentCardId: this.cardDrawer.drawCard(), wrongGuesses: 0, giveUp: false};
      const currentCard = this.currentCard!;
      this.midiBatcher.resetTarget(getMusicalPhrase(currentCard));
    } catch (e) {
      console.log(e);
    }
  }

  recordResult(success: boolean) {
    try {
      this.cardDrawer.recordAttempt(this.practiceState.currentCardId, success);
      this.drawCard();
    } catch (e) {
      console.log(e);
    }
  }

  playCard() {
    const currentCard = this.currentCard;

    this.player!.playMusicalPhrase(getMusicalPhrase(currentCard!));
  }

  giveUp() {
    this.practiceState.giveUp = true;
  }

  get chordsbyId(): Map<DerivedFlashcardId, DerivedFlashcard> {
    const result = new Map<DerivedFlashcardId, DerivedFlashcard>();
    this.activeFlashcards.forEach(c => result.set(c.id, c));
    return result;
  }

  get currentCard(): DerivedFlashcard | undefined {
    return this.chordsbyId.get(this.practiceState.currentCardId);
  }

  get currentCardDescription(): string {
    return this.currentCard == undefined 
      ? ""
      : this.currentCard.id;
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
