---
name: bem-classnames-v2-migration
description: Use when an agent needs to automatically migrate code from `@rhapsodic/bem-classnames` v1 to v2, including converting configs to direct shorthand syntax, replacing `booleanModifier`/`stringModifier`, removing `customModifiers`, converting CommonJS imports to ESM, updating modifier settings, and validating with tests and typecheck.
---

# BEM Classnames v2 Migration

Use this skill to migrate consumers from `@rhapsodic/bem-classnames` v1 to
v2.

## Migration Workflow

1. Search for package usage:

```bash
rg "@rhapsodic/bem-classnames|booleanModifier|stringModifier|customModifiers|require\\("
```

2. Replace removed imports:

```ts
// Before
import { bmc, booleanModifier, stringModifier } from '@rhapsodic/bem-classnames';

// After
import { bmc, flag, variant } from '@rhapsodic/bem-classnames';
```

3. Replace helper calls:

```ts
booleanModifier('state', 'active')
// -> flag('state', 'active')

stringModifier('theme', { primary: 'brand' })
// -> variant('theme', { primary: 'brand' })
```

4. Rewrite `bmc` settings to direct shorthand syntax by default.

5. Add the second `bmc<TProps, TCustom>()` generic when custom modifiers are
   passed in props.

6. Keep explicit `{ modifiers, whitelist }` syntax only when direct shorthand is
   unsafe.

7. Convert CommonJS usage to ESM.

8. Run project checks.

## CommonJS to ESM

v2 is ESM-only. Replace CommonJS imports:

```js
// Before
const { bmc } = require('@rhapsodic/bem-classnames');

// After
import { bmc } from '@rhapsodic/bem-classnames';
```

If the file cannot be converted to ESM, use dynamic import:

```js
const { bmc } = await import('@rhapsodic/bem-classnames');
```

## Helper Renames

`booleanModifier` was removed. Use `flag`:

```ts
// Before
isActive: booleanModifier('state', 'active')

// After
isActive: flag('state', 'active')
```

`stringModifier` was removed. Use `variant`:

```ts
// Before
variant: stringModifier('theme', { primary: 'brand' })

// After
variant: variant('theme', { primary: 'brand' })
```

Keep arguments unchanged when possible.

## Rewrite to Direct Shorthand

The migration target is direct shorthand syntax:

```ts
// Before
const classNames = bmc('button', {
  modifiers: {
    size: true,
    isActive: booleanModifier('state', 'active'),
  },
  whitelist: true,
});

// After
const classNames = bmc('button', {
  size: true,
  isActive: flag('state', 'active'),
});
```

When converting:

- Spread every entry from `settings.modifiers` into the second `bmc` argument.
- Spread every entry from `settings.customModifiers` into the same object.
- Drop `whitelist: true`; direct shorthand already behaves like it.
- Drop `whitelist` arrays only when they match the converted modifier keys.
- Keep explicit syntax if a `whitelist` array allows keys that are not in
  `modifiers` or `customModifiers`.
- Keep explicit syntax if the component has modifier props named `modifiers` or
  `whitelist`.

## Removing `customModifiers`

Before:

```ts
interface ButtonProps {
  size: 'small' | 'large';
}

const classNames = bmc<ButtonProps>('button', {
  modifiers: {
    size: 'size',
  },
  customModifiers: {
    isLoading: booleanModifier('state', 'loading'),
  },
});
```

After:

```ts
interface ButtonProps {
  size: 'small' | 'large';
}

const classNames = bmc<ButtonProps, { isLoading: boolean }>('button', {
  size: 'size',
  isLoading: flag('state', 'loading'),
});
```

Rules:

- Move every `customModifiers` entry into direct shorthand.
- Preserve the modifier key and settings.
- For boolean custom modifiers, type the key in the second generic.
- For string custom modifiers, type the key as a string union.

Example string custom modifier:

```ts
const classNames = bmc<ButtonProps, { tone: 'brand' | 'neutral' }>('button', {
  tone: variant('theme', { brand: 'primary' }),
});
```

## When to Keep Explicit Syntax

Do not rewrite to direct shorthand when it changes behavior.

```ts
const classNames = bmc('button', {
  modifiers: {
    size: true,
  },
  whitelist: ['size', 'href'],
});
```

This must stay explicit because `href` is allowed by whitelist but is not
configured as a modifier.

Also keep explicit syntax for props named `modifiers` or `whitelist`.

## Validation

After editing:

```bash
pnpm typecheck
pnpm test
pnpm build
```

Use the package manager and scripts available in the target repository. If
there is no build script, at least run typecheck and tests.

## Migration Checklist

- No `booleanModifier` imports or calls remain.
- No `stringModifier` imports or calls remain.
- No `customModifiers` keys remain.
- Safe configs are rewritten to direct shorthand.
- Custom modifier props are represented in the second `bmc` generic.
- Package imports are ESM.
- Tests and typecheck pass.
