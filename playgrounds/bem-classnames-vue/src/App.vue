<script setup lang="ts">
import { reactive } from 'vue';
import {
  flag,
  useBMC,
  variant,
} from '@rhapsodic/bem-classnames-vue';

interface Props {
  size: 'small' | 'large';
  width: 'auto' | 'full';
  color: 'brand' | 'neutral';
  isDisabled: boolean;
}

const props = reactive<Props>({
  size: 'large',
  width: 'full',
  color: 'brand',
  isDisabled: false,
});
const classNames = useBMC(props, 'button-primary', {
  size: true,
  width: true,
  color: variant('tone', {
    brand: 'primary',
    neutral: 'secondary',
  }),
  isDisabled: flag('state', 'disabled'),
});
</script>

<template>
  <section class="playground">
    <h1 class="playground__title">
      @rhapsodic/bem-classnames-vue
    </h1>
    <fieldset class="playground__controls">
      <label class="playground__control">
        <span class="playground__control-label">Size</span>
        <select v-model="props.size" class="playground__select">
          <option value="small">
            small
          </option>
          <option value="large">
            large
          </option>
        </select>
      </label>
      <label class="playground__control">
        <span class="playground__control-label">Width</span>
        <select v-model="props.width" class="playground__select">
          <option value="auto">
            auto
          </option>
          <option value="full">
            full
          </option>
        </select>
      </label>
      <label class="playground__control">
        <span class="playground__control-label">Color</span>
        <select v-model="props.color" class="playground__select">
          <option value="brand">
            brand
          </option>
          <option value="neutral">
            neutral
          </option>
        </select>
      </label>
      <label class="playground__control playground__control_type_checkbox">
        <input v-model="props.isDisabled" type="checkbox">
        <span class="playground__control-label">Disabled</span>
      </label>
    </fieldset>
    <button :class="classNames" :disabled="props.isDisabled">
      Primary button
    </button>
    <pre class="playground__output">{{ JSON.stringify(classNames, null, 2) }}</pre>
  </section>
</template>
