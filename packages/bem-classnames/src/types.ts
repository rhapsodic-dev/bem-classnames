export type Props<T> = Readonly<T> & {
  readonly [K in keyof T]?: T[K];
};

export type ModifierPrimitiveValue = string | boolean | undefined;
export type EmptyModifiers = Record<never, never>;
declare const modifierKindSymbol: unique symbol;
export type ModifierKind = 'boolean' | 'string';
export interface ModifierKindBrand<TKind extends ModifierKind> {
  // The brand exists only for inference: runtime values stay plain objects.
  readonly [modifierKindSymbol]?: TKind;
}

export interface PropInfo {
  modifier: string;
  type: string;
  value: unknown;
}

export interface PropInfoBoolean extends PropInfo {
  value: boolean;
}

export interface PropInfoString extends PropInfo {
  value: string;
}

export interface BooleanModifierSettings {
  modifier?: string;
  stateIfTrue?: string;
  stateIfFalse?: string;
}

export type BrandedBooleanModifierSettings = BooleanModifierSettings & ModifierKindBrand<'boolean'>;

export type BooleanModifierTuple = readonly [
  modifier?: string,
  stateIfTrue?: string,
  stateIfFalse?: string,
];

export type StringModifierVariants<T extends string> = Partial<Record<T, string>>;

export interface StringModifierSettings<T extends string | undefined> {
  modifier?: string;
  variants?: Extract<T, string> extends never ? never : StringModifierVariants<Extract<T, string>>;
}

export type BrandedStringModifierSettings<T extends string | undefined>
  = StringModifierSettings<T> & ModifierKindBrand<'string'>;

export type StringModifierTuple<T extends string> = readonly [
  modifier?: string,
  variants?: StringModifierVariants<T>,
];

export type BooleanModifierDefinition
  = | BooleanModifierSettings
    | BooleanModifierTuple
    | string
    | boolean
    | undefined;

export type StringModifierDefinition<T extends string | undefined>
  = | StringModifierSettings<T>
    | StringModifierTuple<Extract<T, string>>
    | string
    | boolean
    | undefined;

export type ModifierSetting<T>
  = [T] extends [boolean | undefined]
    ? BooleanModifierDefinition
    : [T] extends [string | undefined]
        ? StringModifierDefinition<Extract<T, string> | Extract<T, undefined>>
        : undefined;

export type ModifiersSettings<
  TProps,
  TCustom extends Record<string, ModifierPrimitiveValue> = EmptyModifiers,
> = {
  [K in keyof TProps]?: ModifierSetting<TProps[K]>;
} & {
  [K in keyof TCustom]?: ModifierSetting<TCustom[K]>;
};

export type PropsWhitelist<
  TProps,
  TCustom extends Record<string, ModifierPrimitiveValue> = EmptyModifiers,
> = readonly (keyof TProps | keyof TCustom | string)[] | true;

export interface BmcSettings<
  TProps,
  TCustom extends Record<string, ModifierPrimitiveValue> = EmptyModifiers,
> {
  modifiers?: ModifiersSettings<TProps, TCustom>;
  whitelist?: PropsWhitelist<TProps, TCustom>;
}

export type BmcInputSettings<
  TProps,
  TCustom extends Record<string, ModifierPrimitiveValue> = EmptyModifiers,
> = BmcSettings<TProps, TCustom> | ModifiersSettings<TProps, TCustom> | undefined;

export type InferableModifierSetting
  = | BooleanModifierDefinition
    | StringModifierDefinition<string | undefined>
    | BrandedBooleanModifierSettings
    | BrandedStringModifierSettings<string | undefined>;

export type InferableModifiersSettings = Record<string, InferableModifierSetting | undefined>;

type InferStringLiteralUnion<TVariants>
  = Extract<keyof NonNullable<TVariants>, string> extends never
    ? string
    : Extract<keyof NonNullable<TVariants>, string>;

type InferModifierTupleValue<TSetting>
  = TSetting extends readonly [infer _Modifier, infer Second, ...infer _Rest]
    ? Second extends Record<string, string | undefined>
      ? InferStringLiteralUnion<Second>
      : Second extends string | undefined
        ? boolean
        : string | boolean
    : string | boolean;

export type InferModifierValue<TSetting>
  // Helper-returned settings are the most precise case, so resolve them first.
  = TSetting extends ModifierKindBrand<'boolean'>
    ? boolean
    : TSetting extends ModifierKindBrand<'string'>
      ? TSetting extends { variants?: infer TVariants }
        ? InferStringLiteralUnion<TVariants>
        : string
      : TSetting extends readonly unknown[]
        ? InferModifierTupleValue<TSetting>
        : TSetting extends { variants: infer TVariants }
          ? InferStringLiteralUnion<TVariants>
          : TSetting extends { stateIfTrue: string | undefined } | { stateIfFalse: string | undefined }
            ? boolean
            : TSetting extends boolean | string
              ? string | boolean
              : TSetting extends undefined
                ? never
                : TSetting extends object
                  ? string | boolean
                  : never;

export type InferPropsFromModifiers<TModifiers extends InferableModifiersSettings> = {
  [K in keyof TModifiers]?: InferModifierValue<TModifiers[K]>;
};

export interface InferredBmcSettings<
  TModifiers extends InferableModifiersSettings = InferableModifiersSettings,
> {
  modifiers?: TModifiers;
  whitelist?: readonly (keyof TModifiers | string)[] | true;
}
