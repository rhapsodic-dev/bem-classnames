# BEM classnames

A TypeScript utility for generating BEM modifier class names from component props.

## Installation

With `pnpm`

```bash
pnpm add @rhapsodic/bem-classnames
```

Or, with `npm`

```bash
npm install @rhapsodic/bem-classnames
```

Or, with `yarn`

```bash
yarn add @rhapsodic/bem-classnames
```

Or, with `bun`

```bash
bun add @rhapsodic/bem-classnames
```

## Quick start

```typescript
import { bmc, flag } from '@rhapsodic/bem-classnames';

const buttonClasses = bmc('button', {
  size: true,
  variant: true,
  isDisabled: flag('state', 'disabled'),
});

const classes = buttonClasses({
  size: 'large',
  variant: 'primary',
  isDisabled: true,
});
// ['button', 'button_size_large', 'button_variant_primary', 'button_state_disabled']
```

## Documentation
Learn more on the [Documentation](docs/docs.md)

## Agent skills

This repository includes provider-agnostic agent skills in [`skills`](skills).

Install them directly from GitHub:

```bash
npx skills add rhapsodic-dev/bem-classnames --all
```

They can also be installed as a package:

```bash
pnpm add -D @rhapsodic/bem-classnames-skills skills-npm
```

Add `skills-npm` to the consuming project's prepare script:

```json
{
  "scripts": {
    "prepare": "skills-npm"
  }
}
```

## License

[MIT License](./LICENSE)
