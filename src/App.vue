<template>
<v-app>
  <v-main>
  <v-tabs>
    <v-tab> Let's Go </v-tab>
    <v-tab-item>
      <options-editor></options-editor>
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
import { Component, Vue } from "vue-property-decorator";
import HelloWorld from "./components/HelloWorld.vue";
import FlashcardSelector from "./components/FlashcardSelector.vue";
import OptionsEditor from "./components/OptionsEditor.vue";
import { Piano } from '@tonejs/piano';
import { VTabs, VApp, VMain, VTabItem, VTab } from "vuetify/lib";

import { chordEntities } from './flashcards/chords/chord-entities';
import { Flashcard, chordEntityToModel } from './domain/models/flashcard';
import { reifyCategories , Category } from './domain/models/category';
import { ICardDrawer, CardDrawer } from './domain/cardDrawer';

@Component ({
  components: {
    FlashcardSelector, OptionsEditor,
    VApp, VMain,
    VTabs, VTab, VTabItem
  }
})

export default class App extends Vue {
  private chords: Flashcard[] = chordEntities.map(chordEntityToModel);
  private categories: Category[] = reifyCategories(this.chords);
  private selectedFlashcardIds: string[] = [];

  // todo: thread default options into, add watch for flashcards.
  // private cardDrawer: ICardDrawer = new CardDrawer([], )
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
