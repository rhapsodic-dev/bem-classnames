import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { Bench } from 'tinybench';

import { bmc, flag, variant } from '../../packages/bem-classnames/dist/index.js';

interface BenchmarkCase {
  name: string;
  expected: string[];
  run: () => string[];
}

interface CliOptions {
  comparePath?: string;
  help: boolean;
  json: boolean;
  outputPath?: string;
  thresholdPercent: number;
}

interface BenchmarkMeasurement {
  name: string;
  samples: number;
  opsPerSecond: number;
  nsPerOp: number;
  p99NsPerOp: number;
  marginPercent: number;
  checksum: number;
}

interface BenchmarkReport {
  version: 1;
  timestamp: string;
  runtime: {
    name: string;
    version: string;
  };
  options: {
    timeMs: number;
    iterations: number;
    warmupTimeMs: number;
    warmupIterations: number;
  };
  results: BenchmarkMeasurement[];
}

interface BenchmarkComparison {
  name: string;
  beforeNsPerOp: number;
  afterNsPerOp: number;
  changePercent: number;
  status: 'faster' | 'slower' | 'same' | 'regression';
}

const BENCH_TIME_MS = 500;
const BENCH_ITERATIONS = 1000;
const WARMUP_TIME_MS = 100;
const WARMUP_ITERATIONS = 20_000;
const DEFAULT_REGRESSION_THRESHOLD_PERCENT = 5;

const defaultClasses = bmc<{
  size: string;
  variant: string;
  isActive: boolean;
  isDisabled: boolean;
}>('button');

const directShorthandClasses = bmc('button', {
  size: true,
  variant: true,
  isActive: flag('state', 'active'),
  tone: variant('theme', {
    brand: 'primary',
    neutral: 'secondary',
  }),
});

const explicitWhitelistClasses = bmc('button', {
  modifiers: {
    size: true,
    variant: true,
    isActive: flag('state', 'active'),
    tone: variant('theme', {
      brand: 'primary',
      neutral: 'secondary',
    }),
  },
  whitelist: true,
});

const customModifierClasses = bmc<
  {
    size: 'small' | 'large';
    variant: 'primary' | 'secondary';
  },
  {
    isLoading: boolean;
    tone: 'brand' | 'neutral';
  }
>('button', {
  size: true,
  variant: true,
  isLoading: flag('state', 'loading'),
  tone: variant('theme', {
    brand: 'primary',
    neutral: 'secondary',
  }),
});

const manyPropsClasses = bmc('button', {
  size: true,
  variant: true,
  width: true,
  density: true,
  isActive: flag('state', 'active'),
  isLoading: flag('loading', 'yes'),
  tone: variant('theme', {
    brand: 'primary',
    neutral: 'secondary',
  }),
});

const defaultProps = {
  size: 'large',
  variant: 'primary',
  isActive: true,
  isDisabled: false,
};

const shorthandProps = {
  size: 'large',
  variant: 'primary',
  isActive: true,
  tone: 'brand',
  href: '/docs',
};

const customModifierProps = {
  size: 'large',
  variant: 'primary',
  isLoading: true,
  tone: 'brand',
} as const;

const manyProps = {
  size: 'large',
  variant: 'primary',
  width: 'full',
  density: 'compact',
  isActive: true,
  isLoading: true,
  tone: 'brand',
  href: '/docs',
  id: 'button-id',
  role: 'button',
};

const cases: BenchmarkCase[] = [
  {
    name: 'default props',
    expected: [
      'button',
      'button_size_large',
      'button_variant_primary',
      'button_is-active_active',
      'button_is-disabled_inactive',
    ],
    run: () => defaultClasses(defaultProps),
  },
  {
    name: 'direct shorthand',
    expected: [
      'button',
      'button_size_large',
      'button_variant_primary',
      'button_state_active',
      'button_theme_primary',
    ],
    run: () => directShorthandClasses(shorthandProps),
  },
  {
    name: 'explicit whitelist',
    expected: [
      'button',
      'button_size_large',
      'button_variant_primary',
      'button_state_active',
      'button_theme_primary',
    ],
    run: () => explicitWhitelistClasses(shorthandProps),
  },
  {
    name: 'custom modifiers',
    expected: [
      'button',
      'button_size_large',
      'button_variant_primary',
      'button_state_loading',
      'button_theme_primary',
    ],
    run: () => customModifierClasses(customModifierProps),
  },
  {
    name: 'many props',
    expected: [
      'button',
      'button_size_large',
      'button_variant_primary',
      'button_width_full',
      'button_density_compact',
      'button_state_active',
      'button_loading_yes',
      'button_theme_primary',
    ],
    run: () => manyPropsClasses(manyProps),
  },
];

function printHelp(): void {
  console.log([
    'Usage: pnpm bench -- [options]',
    '',
    'Options:',
    '  --json                 Print the benchmark report as JSON.',
    '  --output <path>        Save the current benchmark report as JSON.',
    '  --compare <path>       Compare current results with a saved JSON report.',
    '  --threshold <percent>  Mark slower results above this threshold as regressions.',
    '                         Defaults to 5.',
    '  --help                 Show this message.',
    '',
    'Examples:',
    '  pnpm bench -- --output .benchmarks/main.json',
    '  pnpm bench -- --compare .benchmarks/main.json',
    '  pnpm bench -- --compare .benchmarks/main.json --threshold 10',
  ].join('\n'));
}

function getOptionValue(args: string[], index: number, option: string): string {
  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value for ${option}.`);
  }
  return value;
}

function parseCliOptions(args: string[]): CliOptions {
  const options: CliOptions = {
    help: false,
    json: false,
    thresholdPercent: DEFAULT_REGRESSION_THRESHOLD_PERCENT,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg === '--json') {
      options.json = true;
      continue;
    }

    if (arg === '--output') {
      options.outputPath = getOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === '--compare') {
      options.comparePath = getOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === '--threshold') {
      const value = Number(getOptionValue(args, index, arg));
      if (!Number.isFinite(value) || value < 0) {
        throw new Error('--threshold must be a non-negative number.');
      }
      options.thresholdPercent = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown benchmark option: ${arg}`);
  }

  return options;
}

function assertClassList(name: string, actual: string[], expected: string[]): void {
  if (
    actual.length !== expected.length
    || actual.some((className, index) => className !== expected[index])
  ) {
    throw new Error([
      `Benchmark case "${name}" returned an unexpected class list.`,
      `Expected: ${JSON.stringify(expected)}`,
      `Actual:   ${JSON.stringify(actual)}`,
    ].join('\n'));
  }
}

function assertBenchmarkCases(): void {
  for (const benchmark of cases) {
    assertClassList(benchmark.name, benchmark.run(), benchmark.expected);
  }
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatNumber(value)}%`;
}

const checksums = new Map<string, number>();
const bench = new Bench({
  time: BENCH_TIME_MS,
  iterations: BENCH_ITERATIONS,
  retainSamples: true,
  warmupTime: WARMUP_TIME_MS,
  warmupIterations: WARMUP_ITERATIONS,
});

function getBenchmarkMeasurements(): BenchmarkMeasurement[] {
  return bench.tasks.map((task) => {
    const result = task.result;

    if (result.state !== 'completed') {
      throw new Error(`Benchmark task "${task.name}" did not complete.`);
    }

    return {
      name: task.name,
      samples: result.latency.samplesCount,
      opsPerSecond: result.throughput.mean,
      nsPerOp: result.period * 1_000_000,
      p99NsPerOp: result.latency.p99 * 1_000_000,
      marginPercent: result.latency.rme,
      checksum: checksums.get(task.name) ?? 0,
    };
  });
}

function createBenchmarkReport(): BenchmarkReport {
  return {
    version: 1,
    timestamp: new Date().toISOString(),
    runtime: {
      name: bench.runtime,
      version: bench.runtimeVersion,
    },
    options: {
      timeMs: BENCH_TIME_MS,
      iterations: BENCH_ITERATIONS,
      warmupTimeMs: WARMUP_TIME_MS,
      warmupIterations: WARMUP_ITERATIONS,
    },
    results: getBenchmarkMeasurements(),
  };
}

function getBenchmarkTable(report: BenchmarkReport): Record<string, number | string>[] {
  return report.results.map((result) => ({
    name: result.name,
    samples: result.samples,
    'ops/sec': formatNumber(result.opsPerSecond),
    'ns/op': formatNumber(result.nsPerOp),
    'p99 ns/op': formatNumber(result.p99NsPerOp),
    margin: `+/-${formatNumber(result.marginPercent)}%`,
    checksum: result.checksum,
  }));
}

async function writeBenchmarkReport(reportPath: string, report: BenchmarkReport): Promise<void> {
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

async function readBenchmarkReport(reportPath: string): Promise<BenchmarkReport> {
  const rawReport = JSON.parse(await readFile(reportPath, 'utf8')) as BenchmarkReport;

  if (rawReport.version !== 1 || !Array.isArray(rawReport.results)) {
    throw new Error(`Invalid benchmark report: ${reportPath}`);
  }

  return rawReport;
}

function compareReports(
  before: BenchmarkReport,
  after: BenchmarkReport,
  thresholdPercent: number,
): BenchmarkComparison[] {
  const beforeByName = new Map(before.results.map((result) => [result.name, result]));

  return after.results.map((afterResult) => {
    const beforeResult = beforeByName.get(afterResult.name);

    if (!beforeResult) {
      throw new Error(`Baseline report does not contain benchmark case "${afterResult.name}".`);
    }

    const changePercent = ((afterResult.nsPerOp - beforeResult.nsPerOp) / beforeResult.nsPerOp) * 100;
    let status: BenchmarkComparison['status'] = 'same';
    if (changePercent > thresholdPercent) {
      status = 'regression';
    } else if (changePercent > 0) {
      status = 'slower';
    } else if (changePercent < 0) {
      status = 'faster';
    }

    return {
      name: afterResult.name,
      beforeNsPerOp: beforeResult.nsPerOp,
      afterNsPerOp: afterResult.nsPerOp,
      changePercent,
      status,
    };
  });
}

function getComparisonTable(comparisons: BenchmarkComparison[]): Record<string, string>[] {
  return comparisons.map((comparison) => ({
    name: comparison.name,
    'before ns/op': formatNumber(comparison.beforeNsPerOp),
    'after ns/op': formatNumber(comparison.afterNsPerOp),
    change: formatPercent(comparison.changePercent),
    status: comparison.status,
  }));
}

const cliOptions = parseCliOptions(process.argv.slice(2));

if (cliOptions.help) {
  printHelp();
} else {
  assertBenchmarkCases();

  for (const benchmark of cases) {
    checksums.set(benchmark.name, 0);

    bench.add(benchmark.name, () => {
      const result = benchmark.run();
      checksums.set(
        benchmark.name,
        (checksums.get(benchmark.name) ?? 0) + result.length + result[0].length,
      );
    });
  }

  await bench.run();

  const report = createBenchmarkReport();
  const baselineReport = cliOptions.comparePath
    ? await readBenchmarkReport(cliOptions.comparePath)
    : undefined;
  const comparisons = baselineReport
    ? compareReports(baselineReport, report, cliOptions.thresholdPercent)
    : undefined;

  if (cliOptions.outputPath) {
    await writeBenchmarkReport(cliOptions.outputPath, report);
  }

  if (cliOptions.json) {
    console.log(JSON.stringify({
      report,
      comparisons,
    }, null, 2));
  } else {
    console.table(getBenchmarkTable(report));

    if (comparisons) {
      console.table(getComparisonTable(comparisons));
    }
  }

  if (comparisons?.some((comparison) => comparison.status === 'regression')) {
    process.exitCode = 1;
  }
}
