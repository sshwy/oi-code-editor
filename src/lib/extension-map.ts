import {
  Compartment,
  EditorState,
  Facet,
  StateEffect,
  StateField,
  type Extension,
  type StateEffectType,
} from "@codemirror/state";

export class ExtensionMap<T extends Record<string, Extension>> {
  private extensions: T;
  private facet: Facet<keyof T, keyof T | undefined>;
  private setKey: StateEffectType<keyof T>;
  private compartment: Compartment;

  constructor(extensions: T) {
    this.extensions = extensions;
    this.facet = Facet.define({
      combine(value) {
        return value[0];
      },
    });
    this.setKey = StateEffect.define<keyof T>();
    this.compartment = new Compartment();
  }

  of(key: keyof T): Extension {
    const initExt = this.extensions[key];
    if (!initExt) {
      throw new Error(`Extension key ${String(key)} not found`);
    }
    const field = StateField.define<keyof T>({
      create() {
        return key;
      },
      update: (value, tr) => {
        for (const e of tr.effects) {
          if (e.is(this.setKey)) {
            value = e.value;
          }
        }
        return value;
      },
      provide: (field) => this.facet.from(field),
    });

    return [field, this.compartment.of(initExt)];
  }

  reconfigure(key: keyof T) {
    return [this.compartment.reconfigure(this.extensions[key] || []), this.setKey.of(key)];
  }

  read(state: EditorState) {
    return state.facet(this.facet);
  }
}
