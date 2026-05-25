import type {
  BmcInputSettings,
  BrandedBooleanModifierSettings,
  BrandedStringModifierSettings,
  EmptyModifiers,
  InferPropsFromModifiers,
  InferableModifiersSettings,
  InferredBmcSettings,
  ModifierPrimitiveValue,
  ModifiersSettings,
  PropInfoBoolean,
  PropInfoString,
  Props,
  StringModifierVariants,
} from './types';
import {
  getBooleanModifierSettings,
  getClassName,
  getClassNameFromBooleanSettings,
  getClassNameFromStringSettings,
  getDefaultClassNameFromBoolean,
  getPropsInfo,
  getStringModifierSettings,
} from './utils';

export function flag(
  modifier?: string,
  stateIfTrue?: string,
  stateIfFalse?: string,
): BrandedBooleanModifierSettings {
  return { modifier, stateIfTrue, stateIfFalse } as BrandedBooleanModifierSettings;
}

export function variant<T extends string>(
  modifier?: string,
  variants?: StringModifierVariants<T>,
): BrandedStringModifierSettings<T | undefined>;
export function variant<T extends object>(
  modifier?: string,
  variants?: StringModifierVariants<Extract<T[keyof T], string>>,
): BrandedStringModifierSettings<Extract<T[keyof T], string> | undefined>;
export function variant(
  modifier?: string,
  variants?: StringModifierVariants<string>,
): BrandedStringModifierSettings<string | undefined> {
  return {
    modifier,
    variants,
  } as BrandedStringModifierSettings<string | undefined>;
}

type RuntimeModifiersSettings = Record<string, unknown>;

interface RuntimeBmcSettings {
  modifiers?: RuntimeModifiersSettings;
  whitelist?: readonly string[] | true;
}

type RuntimeBmcInputSettings = RuntimeBmcSettings | RuntimeModifiersSettings | undefined;

function hasModifierKey(
  modifiersSettings: Record<string, unknown> | undefined,
  modifier: string,
): boolean {
  return Boolean(modifiersSettings
    && Object.prototype.hasOwnProperty.call(modifiersSettings, modifier));
}

function getConfiguredModifierKeys(modifiers?: Record<string, unknown>): Set<string> {
  return new Set(Object.keys(modifiers ?? {}));
}

function getConfiguredModifierSetting<TSetting>(
  modifiersSettings: Record<string, unknown> | undefined,
  modifier: string,
  getModifierSettings: (
    modifiersSettings: Record<string, unknown> | undefined,
    modifier: string,
  ) => TSetting,
): {
  modifierSettings: TSetting;
  isDisabled: boolean;
} {
  const modifierSettings = getModifierSettings(modifiersSettings, modifier);
  return {
    modifierSettings,
    isDisabled: hasModifierKey(modifiersSettings, modifier) && !modifierSettings,
  };
}

function processStringProp(
  base: string,
  propInfo: PropInfoString,
  modifiersSettings: Record<string, unknown> | undefined,
): string | undefined {
  const { modifierSettings, isDisabled } = getConfiguredModifierSetting(
    modifiersSettings,
    propInfo.modifier,
    (settings, modifier) => getStringModifierSettings(
      settings as ModifiersSettings<Record<string, string>>,
      modifier,
    ),
  );

  // A configured key with `undefined` disables class generation for that prop.
  if (isDisabled) {
    return;
  }

  if (modifierSettings) {
    return getClassNameFromStringSettings(base, modifierSettings, propInfo);
  }

  return getClassName(base, propInfo.modifier, propInfo.value);
}

function processBooleanProp(
  base: string,
  propInfo: PropInfoBoolean,
  modifiersSettings: Record<string, unknown> | undefined,
): string | undefined {
  const { modifierSettings, isDisabled } = getConfiguredModifierSetting(
    modifiersSettings,
    propInfo.modifier,
    (settings, modifier) => getBooleanModifierSettings(
      settings as ModifiersSettings<Record<string, boolean>>,
      modifier,
    ),
  );

  // A configured key with `undefined` disables class generation for that prop.
  if (isDisabled) {
    return;
  }

  if (modifierSettings) {
    return getClassNameFromBooleanSettings(base, modifierSettings, propInfo);
  } else {
    return getDefaultClassNameFromBoolean(base, propInfo.modifier, propInfo.value);
  }
}

function isBmcSettings(settings: RuntimeBmcInputSettings): settings is RuntimeBmcSettings {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    return false;
  }

  return (
    'modifiers' in settings
    || 'whitelist' in settings
  );
}

function normalizeBmcSettings(settings: RuntimeBmcInputSettings): RuntimeBmcSettings | undefined {
  if (!settings) return undefined;
  if (isBmcSettings(settings)) return settings;

  // Direct shorthand (`bmc('block', { size: true })`) is treated as
  // `{ modifiers, whitelist: true }` to avoid leaking unrelated props into classes.
  return {
    modifiers: settings,
    whitelist: true,
  };
}

export function bmc<T extends object, TCustom extends Record<string, ModifierPrimitiveValue> = EmptyModifiers>(
  base: string,
  settings?: BmcInputSettings<T, TCustom>,
): (props: Props<T> & Partial<TCustom>) => string[];
export function bmc<const TModifiers extends InferableModifiersSettings>(
  base: string,
  modifiers: TModifiers,
): (props: Partial<InferPropsFromModifiers<TModifiers>>) => string[];
export function bmc<
  const TModifiers extends InferableModifiersSettings,
>(
  base: string,
  settings: InferredBmcSettings<TModifiers>,
): (props: Partial<InferPropsFromModifiers<TModifiers>>) => string[];
export function bmc(
  base: string,
  settings?: unknown,
) {
  const normalizedSettings = normalizeBmcSettings(settings as RuntimeBmcInputSettings);

  return (props: unknown): string[] => {
    const propsInfo = getPropsInfo(props as Record<string, unknown>);
    const classList: string[] = [base];
    const configuredModifierKeys = normalizedSettings?.whitelist === true
      ? getConfiguredModifierKeys(normalizedSettings?.modifiers as Record<string, unknown> | undefined)
      : undefined;

    for (const propInfo of propsInfo) {
      const isInModifiers = hasModifierKey(
        normalizedSettings?.modifiers as Record<string, unknown> | undefined,
        propInfo.modifier,
      );
      const activeModifierSettings = isInModifiers
        ? normalizedSettings?.modifiers
        : undefined;

      if (normalizedSettings?.whitelist !== undefined) {
        if (normalizedSettings.whitelist === true) {
          if (!configuredModifierKeys?.has(propInfo.modifier)) {
            continue;
          }
        } else if (!normalizedSettings.whitelist.includes(propInfo.modifier)) {
          continue;
        }
      }

      if (propInfo.type === 'string') {
        const stringProp = propInfo as PropInfoString;
        const className = processStringProp(
          base,
          stringProp,
          activeModifierSettings as Record<string, unknown> | undefined,
        );

        if (!className) continue;
        classList.push(className);
      }

      if (propInfo.type === 'boolean') {
        const booleanProp = propInfo as PropInfoBoolean;
        const className = processBooleanProp(
          base,
          booleanProp,
          activeModifierSettings as Record<string, unknown> | undefined,
        );

        if (!className) continue;
        classList.push(className);
      }
    }

    return classList;
  };
}
