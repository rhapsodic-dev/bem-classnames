# BEM classnames Vue

Vue 3 composables for `@rhapsodic/bem-classnames`.

## Installation

```bash
pnpm add @rhapsodic/bem-classnames-vue vue
```

## Usage

```typescript
import { flag, useBMC } from '@rhapsodic/bem-classnames-vue';

const classNames = useBMC(props, 'button-primary', {
  size: true,
  width: true,
  color: true,
  isDisabled: flag('state', 'disabled'),
});
```

With extra reactive values:

```typescript
const classNames = useBMC(props, 'checkbox', {
  isDisabled: flag('state', 'disabled'),
  isActive: flag('state', 'active'),
}, {
  isActive: modelValue,
});
```
