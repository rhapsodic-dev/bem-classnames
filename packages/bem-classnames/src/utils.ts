import type {
  BooleanModifierDefinition,
  BooleanModifierSettings,
  ModifiersSettings,
  PropInfo,
  PropInfoBoolean,
  PropInfoString,
  StringModifierDefinition,
  StringModifierSettings,
} from './types';

type NormalizedBooleanModifierSettings = string | BooleanModifierSettings | false | undefined;
type NormalizedStringModifierSettings<T extends string | undefined> = string | StringModifierSettings<T> | undefined;

export function toKebabCase(value: string): string {
  const newString = value.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map((x) => x.toLowerCase())
    .join('-');

  return newString ?? value;
}

export function getPropsInfo(props: Record<string, unknown>): PropInfo[] {
  return Object.entries(props).map(([key, value]) => {
    let type: string = typeof value;
    if (Array.isArray(value)) {
      type = 'array';
    } else if (value !== null && typeof value === 'object') {
      type = 'object';
    }
    return { modifier: key, type, value };
  });
}

export function getBooleanValueStateDefault(state: boolean): string {
  return state ? 'active' : 'inactive';
}

export function getBooleanValueState(state: boolean, valueIfTrue?: string, valueIfFalse?: string): string {
  const stateIfTrue = valueIfTrue ?? getBooleanValueStateDefault(true);
  const stateIfFalse = valueIfFalse ?? getBooleanValueStateDefault(false);
  return state ? stateIfTrue : stateIfFalse;
}

export function getClassName(base: string, modifier: string, value: string): string {
  return `${base}_${toKebabCase(modifier)}_${toKebabCase(value)}`;
}

export function getDefaultClassNameFromBoolean(base: string, modifier: string, state: boolean): string {
  return getClassName(base, modifier, getBooleanValueStateDefault(state));
}

export function getBooleanModifierClassName(
  booleanModifierSettings: BooleanModifierSettings,
  prop: PropInfoBoolean,
  base: string,
): string | undefined {
  if (
    booleanModifierSettings.modifier
    && !booleanModifierSettings.stateIfTrue
    && !booleanModifierSettings.stateIfFalse
  ) {
    return getClassName(base, booleanModifierSettings.modifier, getBooleanValueStateDefault(prop.value));
  }

  if (!prop.value && !booleanModifierSettings.stateIfFalse) return;
  if (prop.value && !booleanModifierSettings.stateIfTrue) return;

  const key = booleanModifierSettings.modifier ?? prop.modifier;
  const value = getBooleanValueState(
    prop.value,
    booleanModifierSettings.stateIfTrue,
    booleanModifierSettings.stateIfFalse,
  );

  return getClassName(base, key, value);
}

export function normalizeBooleanModifierSettings(settings: BooleanModifierDefinition):
NormalizedBooleanModifierSettings {
  // `true` keeps the prop name and falls back to the default active/inactive states.
  if (settings === undefined || settings === true) return;
  if (settings === false) return false;

  if (Array.isArray(settings)) {
    const [modifier, stateIfTrue, stateIfFalse] = settings;
    return { modifier, stateIfTrue, stateIfFalse };
  }

  return settings as string | BooleanModifierSettings;
}

export function getClassNameFromBooleanSettings(
  base: string,
  settings: BooleanModifierDefinition,
  propInfo: PropInfoBoolean,
): string | undefined {
  const normalizedSettings = normalizeBooleanModifierSettings(settings);

  if (typeof normalizedSettings === 'string') {
    return getClassName(base, normalizedSettings, getBooleanValueStateDefault(propInfo.value));
  }

  if (normalizedSettings === false) {
    return;
  }

  if (typeof normalizedSettings === 'object') {
    const settingObject = normalizedSettings as BooleanModifierSettings;

    if (settingObject.modifier && !settingObject.stateIfTrue && !settingObject.stateIfFalse) {
      return getClassName(base, settingObject.modifier, getBooleanValueStateDefault(propInfo.value));
    }

    return getBooleanModifierClassName(settingObject, propInfo, base);
  }

  return getDefaultClassNameFromBoolean(base, propInfo.modifier, propInfo.value);
}

export function normalizeStringModifierSettings<T extends string | undefined>(settings: StringModifierDefinition<T>):
NormalizedStringModifierSettings<T> {
  if (settings === undefined || settings === false) return;
  // `true` keeps the original prop name and raw string value.
  if (settings === true) return {};

  if (Array.isArray(settings)) {
    const [modifier, variants] = settings;
    return {
      modifier,
      variants: variants as StringModifierSettings<T>['variants'],
    };
  }

  return settings as string | StringModifierSettings<T>;
}

export function getClassNameFromStringSettings(
  base: string,
  settings: StringModifierDefinition<string | undefined>,
  stringProp: PropInfoString,
): string | undefined {
  const normalizedSettings = normalizeStringModifierSettings(settings);

  if (typeof normalizedSettings === 'string') {
    return getClassName(base, normalizedSettings, stringProp.value);
  }

  if (typeof normalizedSettings === 'object') {
    const modifierFromSettings = normalizedSettings.modifier ?? stringProp.modifier;
    const valueFromSettings = normalizedSettings.variants?.[stringProp.value];

    if (
      normalizedSettings.variants
      && stringProp.value in normalizedSettings.variants
      && valueFromSettings === undefined
    ) {
      // A matched variant with `undefined` is an explicit opt-out for this value.
      return;
    }

    return getClassName(base, modifierFromSettings, valueFromSettings ?? stringProp.value);
  }
}

export function getBooleanModifierSettings<T>(
  modifiersSettings: ModifiersSettings<T> | undefined,
  modifier: keyof T | string,
): BooleanModifierDefinition {
  if (
    modifiersSettings
    && typeof modifiersSettings === 'object'
  ) {
    const modifierSettings = modifiersSettings[modifier as keyof typeof modifiersSettings];
    return modifierSettings as BooleanModifierDefinition;
  }
  return undefined;
}

export function getStringModifierSettings<T>(
  modifiersSettings: ModifiersSettings<T> | undefined,
  modifier: keyof T | string,
): StringModifierDefinition<string | undefined> {
  if (
    modifiersSettings
    && typeof modifiersSettings === 'object'
  ) {
    const modifierSettings = modifiersSettings[modifier as keyof typeof modifiersSettings];
    return modifierSettings as StringModifierDefinition<string | undefined>;
  }
  return undefined;
}
