---
name: bem-classnames-vue
description: Use when an agent needs to write, review, or refactor Vue 3 components or composables that use `@rhapsodic/bem-classnames`; prefer `useBMC` from `@rhapsodic/bem-classnames-vue` over direct `bmc` usage in Vue reactive code, including props, refs, computed values, and extra reactive modifiers.
---

# BEM Classnames Vue

Use this skill for Vue 3 projects that need BEM class generation with
`@rhapsodic/bem-classnames`.

## Preferred API

In Vue components and composables, use `useBMC` from
`@rhapsodic/bem-classnames-vue`.

```ts
import { flag, useBMC, variant } from '@rhapsodic/bem-classnames-vue';
```

`useBMC(props, base, settings, extra?)` returns `ComputedRef<string[]>`.

```ts
interface ButtonProps {
  size: 'small' | 'large';
  width: 'auto' | 'full';
  color: 'brand' | 'neutral';
  isDisabled: boolean;
}

const props = defineProps<ButtonProps>();
const classNames = useBMC(props, 'button-primary', {
  size: true,
  width: true,
  color: variant('tone', {
    brand: 'primary',
    neutral: 'secondary',
  }),
  isDisabled: flag('state', 'disabled'),
});
```

Use it directly in templates:

```vue
<button :class="classNames" :disabled="props.isDisabled">
  Primary button
</button>
```

## Reactive Extra Modifiers

Use the fourth `extra` argument for reactive values that are not component
props, such as `ref`, `computed`, `v-model`, local state, or derived state.

```ts
const modelValue = defineModel<boolean>();
const classNames = useBMC(props, 'checkbox', {
  isDisabled: flag('state', 'disabled'),
  isActive: flag('state', 'active'),
}, {
  isActive: modelValue,
});
```

`extra` values may be plain values, refs, computed refs, or getters. `useBMC`
unwraps them with Vue `toValue`.

## Do Not Use Direct `bmc` in Vue Reactive Code

Avoid this pattern in Vue components:

```ts
const classNames = bmc('button', {
  size: true,
});

const classes = computed(() => classNames(props));
```

Prefer:

```ts
const classes = useBMC(props, 'button', {
  size: true,
});
```

Direct `bmc` is still fine in non-Vue TypeScript utilities. In Vue components,
`useBMC` keeps the reactive contract clear and avoids rewriting the same
`computed(() => bmc(...)(...))` wrapper.

## Settings

Use the same modifier settings as `@rhapsodic/bem-classnames`:

```ts
size: true
isDisabled: flag('state', 'disabled')
color: variant('tone', { brand: 'primary' })
```

Prefer direct shorthand settings unless explicit `modifiers` / `whitelist`
syntax is needed.

## Review Checklist

- Use `useBMC` in Vue 3 components and composables instead of direct `bmc`.
- Import `useBMC`, `flag`, and `variant` from `@rhapsodic/bem-classnames-vue`.
- Put local refs/computed/model values in the `extra` argument.
- Bind the returned computed ref directly with `:class="classNames"`.
- Preserve existing BEM base names and modifier settings when refactoring.
