## Usage

### Basic usage

```typescript
import { bmc } from '@rhapsodic/bem-classnames';

interface ButtonProps {
  size: 'small' | 'medium' | 'large';
  disabled: boolean;
}

const buttonClasses = bmc<ButtonProps>('button');

const classes = buttonClasses({
  size: 'large',
  disabled: true,
});
// ['button', 'button_size_large', 'button_disabled_active']
```

### Recommended syntax

You can pass modifier settings directly as the second argument to `bmc`.

- `true` means "use the default modifier name and value"
- `flag('state', 'active')` is a readable shorthand for boolean modifiers
- `variant('theme', { dark: 'night' })` is a readable shorthand for string mappings


```typescript
import { bmc, flag } from '@rhapsodic/bem-classnames';

const classNames = bmc('button-secondary', {
  variant: true,
  width: true,
  size: true,
  isDisabled: flag('state', 'disabled'),
  isActive: flag('state', 'active'),
  isContrastText: flag('text', 'contrast'),
});

const classes = classNames({
  variant: 'primary',
  width: 'full',
  size: 'large',
  isDisabled: false,
  isActive: true,
  isContrastText: true,
});
// [
//   'button-secondary',
//   'button-secondary_variant_primary',
//   'button-secondary_width_full',
//   'button-secondary_size_large',
//   'button-secondary_state_active',
//   'button-secondary_text_contrast'
// ]
```

### More examples

```typescript
import { bmc, flag } from '@rhapsodic/bem-classnames';

interface ButtonIconProps {
  isActive: boolean;
  isDisabled: boolean;
}

const buttonIconClasses = bmc<ButtonIconProps>('button-icon', {
  isActive: flag('state', 'active'),
  isDisabled: flag('state', 'disabled'),
});

const buttonIconResult = buttonIconClasses({
  isActive: true,
  isDisabled: false,
});
// ['button-icon', 'button-icon_state_active']

interface ButtonOrAnchorProps {
  href?: string;
  isDisabled: boolean;
}

const buttonOrAnchorClasses = bmc<ButtonOrAnchorProps>('button-or-anchor', {
  isDisabled: flag('state', 'disabled'),
});

const buttonOrAnchorResult = buttonOrAnchorClasses({
  href: '/docs',
  isDisabled: true,
});
// ['button-or-anchor', 'button-or-anchor_state_disabled']

interface ButtonSecondaryProps {
  variant: 'primary' | 'secondary';
  width: 'auto' | 'full';
  size: 'small' | 'large';
  isDisabled: boolean;
  isActive: boolean;
  isContrastText: boolean;
}

const buttonSecondaryClasses = bmc<ButtonSecondaryProps>('button-secondary', {
  variant: true,
  width: true,
  size: true,
  isDisabled: flag('state', 'disabled'),
  isActive: flag('state', 'active'),
  isContrastText: flag('text', 'contrast'),
});

const buttonSecondaryResult = buttonSecondaryClasses({
  variant: 'primary',
  width: 'full',
  size: 'large',
  isDisabled: false,
  isActive: true,
  isContrastText: true,
});
// [
//   'button-secondary',
//   'button-secondary_variant_primary',
//   'button-secondary_width_full',
//   'button-secondary_size_large',
//   'button-secondary_state_active',
//   'button-secondary_text_contrast'
// ]
```

For explicit string helper generics, prefer the prop value union or omit the generic entirely:

```typescript
interface ButtonSecondaryProps {
  variant: 'primary' | 'secondary';
}

const explicitVariant = variant<ButtonSecondaryProps['variant']>('theme', {
  primary: 'brand',
  secondary: 'alt',
});

const inferredVariant = variant('theme', {
  primary: 'brand',
  secondary: 'alt',
});
```

### `whitelist` behavior

`whitelist` is enabled automatically only for the direct shorthand syntax.

Without `whitelist`, extra string props are also converted into classes:

```typescript
import { bmc, flag } from '@rhapsodic/bem-classnames';

const classNames = bmc('button', {
  modifiers: {
    size: true,
    isActive: flag('state', 'active'),
  },
});

const result = classNames({
  size: 'large',
  isActive: true,
  href: '/docs',
});
// ['button', 'button_size_large', 'button_state_active', 'button_href_/docs']
```

With `whitelist: true`, only configured keys are used:

```typescript
const classNames = bmc('button', {
  modifiers: {
    size: true,
    isActive: flag('state', 'active'),
  },
  whitelist: true,
});

const result = classNames({
  size: 'large',
  isActive: true,
  href: '/docs',
});
// ['button', 'button_size_large', 'button_state_active']
```

The direct shorthand behaves the same way as `whitelist: true`:

```typescript
const classNames = bmc('button', {
  size: true,
  isActive: flag('state', 'active'),
});

const result = classNames({
  size: 'large',
  isActive: true,
  href: '/docs',
});
// ['button', 'button_size_large', 'button_state_active']
```

In direct shorthand, `modifiers` and `whitelist` are reserved setting keys.
If you need modifier props with those names, use the explicit settings syntax:

```typescript
const classNames = bmc('button', {
  modifiers: {
    modifiers: true,
    whitelist: true,
  },
  whitelist: true,
});
```

## API

```typescript
bmc<TProps, TCustom = {}>(
  base: string,
  modifiers?: ModifiersSettings<TProps, TCustom>
)

bmc(
  base: string,
  modifiers: InferableModifiersSettings
)

bmc<TProps, TCustom = {}>(
  base: string,
  settings?: {
    modifiers?: ModifiersSettings<TProps, TCustom>;
    whitelist?: PropsWhitelist<TProps, TCustom>;
  }
)

bmc(
  base: string,
  settings: InferredBmcSettings
)
```

- `base` - base block class name
- direct `modifiers` argument - shorthand syntax; automatically behaves like `whitelist: true`
- `modifiers` - modifier config for component props and custom keys
- `whitelist` - array of allowed keys or `true` to reuse keys from `modifiers`

### Modifier config forms

For `boolean` props:

```typescript
isActive: true
isActive: 'state'
isActive: flag('state', 'active')
isActive: ['state', 'active', 'inactive']
isActive: { modifier: 'state', stateIfTrue: 'active', stateIfFalse: 'inactive' }
```

For `string` props:

```typescript
size: true
size: 'size'
variant: variant('theme', { primary: 'brand' })
variant: ['theme', { primary: 'brand' }]
variant: { modifier: 'theme', variants: { primary: 'brand' } }
```

### Helper functions

```typescript
flag(modifier?: string, stateIfTrue?: string, stateIfFalse?: string)
variant<T>(modifier?: string, variants?: Record<string, string>)
```

## Types

```typescript
export interface BooleanModifierSettings {
  modifier?: string;
  stateIfTrue?: string;
  stateIfFalse?: string;
}

export interface StringModifierSettings<T extends string | undefined> {
  modifier?: string;
  variants?: Partial<Record<Extract<T, string>, string>>;
}

export type PropsWhitelist<TProps, TCustom = {}> =
  | readonly (keyof TProps | keyof TCustom | string)[]
  | true;
```
