import { Flashcard } from "./flashcard";

interface Category {
    readonly id: string;
    readonly name: string;
}

interface ParentCategory extends Category {
    readonly children: Category[];
}

function reifyHelper(idCategories: {id: string, category: string[]}[]): Category[] {
    const categoriesByPath: Map<string, ParentCategory> = new Map<string, ParentCategory>();

    idCategories.forEach(item => {
        let path = "";
        item.category.forEach((c, index) => {
            const newPath = path == "" ? c : path + "." + c;

            // if this category hasn't been created yet
            if (!categoriesByPath.has(newPath)) {
                const category = {id: newPath, name: c, children: []};
                categoriesByPath.set(newPath, category);

                // if there's a parent
                if (categoriesByPath.has(path)) {
                    const parent = categoriesByPath.get(path)!;
                    parent.children!.push(category);
                }
            }

            if (index == item.category.length - 1) {
                const leaf = { id: item.id, name: item.id };
                const parent = categoriesByPath.get(newPath)!;
                parent.children!.push(leaf);
            }

            path = newPath;
        });
    });

    const topLevelNames = new Set(idCategories.map(x => x.category[0]));
    const topLevelCategories =  Array.from(topLevelNames).map(p => categoriesByPath.get(p)!);
    return topLevelCategories;
}

function reifyCategories(flashcards: Flashcard[]): Category[] {
    return reifyHelper(flashcards.map(f => ({id: f.id, category: f.category})));
}

// console.log(reifyHelper([ 
//     {id: "I", category: ["triad", "diatonic", "major"]}, 
//     {id: "bIII", category: ["triad", "diatonic", "minor"]},
//     {id: "xya", category: ["dyad", "diatonic"]}]));

export { Category , reifyCategories }