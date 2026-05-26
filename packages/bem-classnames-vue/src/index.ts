import {
  computed,
  toValue,
} from 'vue';
import type {
  BmcInputSettings,
  ModifierPrimitiveValue,
} from '@rhapsodic/bem-classnames';
import {
  bmc,
} from '@rhapsodic/bem-classnames';

import type {
  ComputedRef,
  MaybeRefOrGetter,
} from 'vue';

export {
  bmc,
  flag,
  variant,
} from '@rhapsodic/bem-classnames';
export type {
  BmcInputSettings,
  ModifierPrimitiveValue,
} from '@rhapsodic/bem-classnames';

type BemModifierValue = ModifierPrimitiveValue;
type BemClassNamesExtra = Partial<Record<string, MaybeRefOrGetter<BemModifierValue>>>;
type BemClassNamesExtraValues<TExtra extends BemClassNamesExtra> = {
  [TKey in keyof TExtra]: TExtra[TKey] extends MaybeRefOrGetter<infer TValue extends BemModifierValue>
    ? TValue
    : never;
};
type BemClassNamesInputSettings<
  TProps extends object,
  TExtra extends BemClassNamesExtra,
> = BmcInputSettings<
  TProps,
  NoInfer<BemClassNamesExtraValues<TExtra>>
>;

export function useBMC<TProps extends object, TExtra extends BemClassNamesExtra = Record<never, never>>(
  props: MaybeRefOrGetter<TProps>,
  base: string,
  settings?: BemClassNamesInputSettings<TProps, TExtra>,
  extra?: MaybeRefOrGetter<TExtra>,
): ComputedRef<string[]> {
  const classNames = bmc<TProps, BemClassNamesExtraValues<TExtra>>(base, settings as never);

  return computed(() => {
    const extraValues: Record<string, BemModifierValue> = {};

    for (const [key, value] of Object.entries(toValue(extra) ?? {})) {
      extraValues[key] = toValue(value);
    }

    return classNames({
      ...toValue(props),
      ...extraValues,
    } as TProps & Partial<BemClassNamesExtraValues<TExtra>>);
  });
}
