<template>
  <v-treeview
    open-all
    selectable
    dense
    v-model="selected"
    :items="categories"
    item-children="children"
    item-key="id"
    item-text="name">
  </v-treeview>
</template>

<script lang="ts">
import { Component, Watch, Emit, Prop, Vue } from "vue-property-decorator";
import { Category } from "../domain/models/category";
import { VTreeview } from "vuetify/lib";

@Component ({
  components: {
    VTreeview
  }
})
export default class FlashcardSelector extends Vue {
  @Prop() private categories!: Category[];
  private selected: string[] = [];

  @Watch('selected', {immediate: true, deep: true})
  newSelection(newVal: string[], oldVal: string[]) {
    this.emitSelected(newVal);
  }
  
  @Emit('input')
  emitSelected(selected: string[]) {
    const placeholderUntilIDeleteEsLintNoEmptyFunction = 0;
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
