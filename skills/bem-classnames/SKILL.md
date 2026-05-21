---
name: bem-classnames
description: Use when an agent needs to explain, write, review, or fix code that uses the `@rhapsodic/bem-classnames` package, including `bmc`, `flag`, `variant`, modifier settings, whitelist behavior, custom modifiers, and TypeScript inference.
---

# BEM Classnames

Use this skill to work with `@rhapsodic/bem-classnames` v2 API.

## Core API

Import from the package with ESM:

```ts
import { bmc, flag, variant } from '@rhapsodic/bem-classnames';
```

`bmc(base, settings?)` returns a function that maps props to a class list:

```ts
const buttonClasses = bmc('button', {
  size: true,
  isActive: flag('state', 'active'),
  tone: variant('theme', { brand: 'primary' }),
});

buttonClasses({
  size: 'large',
  isActive: true,
  tone: 'brand',
});
// ['button', 'button_size_large', 'button_state_active', 'button_theme_primary']
```

## Preferred Syntax

Prefer direct shorthand for new code:

```ts
const classNames = bmc('button', {
  size: true,
  variant: true,
  isDisabled: flag('state', 'disabled'),
});
```

Direct shorthand behaves like `whitelist: true`: only configured keys generate
classes. Extra props such as `href`, `id`, `onClick`, etc. are ignored.

Use explicit settings syntax when the user needs `whitelist` control or has
props named `modifiers` or `whitelist`:

```ts
const classNames = bmc('button', {
  modifiers: {
    size: true,
    isActive: flag('state', 'active'),
  },
  whitelist: true,
});
```

## Modifier Forms

For boolean props:

```ts
isActive: true
isActive: 'state'
isActive: flag('state', 'active')
isActive: ['state', 'active', 'inactive']
isActive: { modifier: 'state', stateIfTrue: 'active', stateIfFalse: 'inactive' }
```

Behavior:

- `true` uses the prop name and default states: `active` / `inactive`.
- `flag('state', 'active')` emits a class only when the prop is `true`.
- `flag('state', 'active', 'inactive')` emits one of two state classes.
- `false` or `undefined` in a configured modifier disables class generation.

For string props:

```ts
size: true
size: 'size'
variant: variant('theme', { primary: 'brand' })
variant: ['theme', { primary: 'brand' }]
variant: { modifier: 'theme', variants: { primary: 'brand' } }
```

Behavior:

- `true` uses the prop name and raw prop value.
- `variant('theme', { primary: 'brand' })` remaps selected values.
- A variant value of `undefined` explicitly opts out for that value.

## Custom Modifiers

Custom modifiers are declared in the same settings object and typed with the
second generic parameter:

```ts
interface ButtonProps {
  size: 'small' | 'large';
}

const buttonClasses = bmc<ButtonProps, { isLoading: boolean }>('button', {
  size: true,
  isLoading: flag('state', 'loading'),
});
```

## Whitelist

Use `whitelist: true` to restrict class generation to configured modifier keys:

```ts
const classNames = bmc('button', {
  modifiers: {
    size: true,
    isActive: flag('state', 'active'),
  },
  whitelist: true,
});
```

Use an array to allow specific prop keys:

```ts
const classNames = bmc<ButtonProps>('button', {
  whitelist: ['size', 'variant'],
});
```

Without whitelist in explicit settings syntax, extra string and boolean props
can become classes.

## Reserved Keys

In direct shorthand, `modifiers` and `whitelist` are settings keys. If props
have these names, use explicit syntax:

```ts
const classNames = bmc('button', {
  modifiers: {
    modifiers: true,
    whitelist: true,
  },
  whitelist: true,
});
```

## Review Checklist

- Prefer `flag` and `variant`; do not use removed v1 helpers.
- Prefer direct shorthand for new code unless explicit `whitelist` control is
  needed.
- Use `whitelist: true` for explicit settings when extra props should not
  become classes.
- Use the second `bmc<TProps, TCustom>()` generic for custom modifiers.
- Keep imports ESM-only.
