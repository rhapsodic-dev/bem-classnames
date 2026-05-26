import {
  bmc,
  flag,
  variant,
} from '@rhapsodic/bem-classnames';

import '../../shared/style.css';

interface Props {
  size: 'small' | 'large';
  width: 'auto' | 'full';
  color: 'brand' | 'neutral';
  isDisabled: boolean;
}

const buttonClasses = bmc<Props>('button-primary', {
  size: true,
  width: true,
  color: variant('tone', {
    brand: 'primary',
    neutral: 'secondary',
  }),
  isDisabled: flag('state', 'disabled'),
});

const state: Props = {
  size: 'large',
  width: 'full',
  color: 'brand',
  isDisabled: false,
};

const app = document.querySelector<HTMLElement>('#app');

function render(): void {
  if (!app) return;

  const classes = buttonClasses(state);

  app.innerHTML = `
    <section class="playground">
      <h1 class="playground__title">@rhapsodic/bem-classnames</h1>
      <fieldset class="playground__controls">
        <label class="playground__control">
          <span class="playground__control-label">Size</span>
          <select class="playground__select" data-field="size">
            <option value="small"${state.size === 'small' ? ' selected' : ''}>small</option>
            <option value="large"${state.size === 'large' ? ' selected' : ''}>large</option>
          </select>
        </label>
        <label class="playground__control">
          <span class="playground__control-label">Width</span>
          <select class="playground__select" data-field="width">
            <option value="auto"${state.width === 'auto' ? ' selected' : ''}>auto</option>
            <option value="full"${state.width === 'full' ? ' selected' : ''}>full</option>
          </select>
        </label>
        <label class="playground__control">
          <span class="playground__control-label">Color</span>
          <select class="playground__select" data-field="color">
            <option value="brand"${state.color === 'brand' ? ' selected' : ''}>brand</option>
            <option value="neutral"${state.color === 'neutral' ? ' selected' : ''}>neutral</option>
          </select>
        </label>
        <label class="playground__control playground__control_type_checkbox">
          <input data-field="isDisabled" type="checkbox"${state.isDisabled ? ' checked' : ''}>
          <span class="playground__control-label">Disabled</span>
        </label>
      </fieldset>
      <button class="${classes.join(' ')}"${state.isDisabled ? ' disabled' : ''}>Primary button</button>
      <pre class="playground__output">${JSON.stringify(classes, null, 2)}</pre>
    </section>
  `;
}

app?.addEventListener('change', (event) => {
  const target = event.target;

  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;

  const field = target.dataset.field as keyof Props | undefined;
  if (!field) return;

  if (field === 'isDisabled') {
    state.isDisabled = (target as HTMLInputElement).checked;
  } else {
    state[field] = target.value as never;
  }

  render();
});

render();
