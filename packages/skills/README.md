# BEM Classnames Skills

Agent skills for `@rhapsodic/bem-classnames`.

These skills are plain `SKILL.md` folders and are not tied to a specific AI
provider. They can be installed through tools that understand package-based
skills, or copied directly from this package.

## Installation with skills-npm

Use this package together with `skills-npm` so the skills are linked for your
agent during dependency installation.

Add a prepare script to the consuming project:

```json
{
  "scripts": {
    "prepare": "skills-npm"
  }
}
```

Install the skills package:

```bash
pnpm add -D @rhapsodic/bem-classnames-skills skills-npm
```

With npm:

```bash
npm install -D @rhapsodic/bem-classnames-skills skills-npm
```

## Installation with npx skills

Install all skills from the GitHub repository:

```bash
npx skills add rhapsodic-dev/bem-classnames --all
```

Install a specific skill:

```bash
npx skills add rhapsodic-dev/bem-classnames --skill bem-classnames
npx skills add rhapsodic-dev/bem-classnames --skill bem-classnames-vue
npx skills add rhapsodic-dev/bem-classnames --skill bem-classnames-v2-migration
```

## Included Skills

- `bem-classnames` - usage guide for the v2 API.
- `bem-classnames-vue` - Vue 3 usage guide for `useBMC`.
- `bem-classnames-v2-migration` - migration workflow from v1 to v2.

## Build

The canonical skills live in this package under `packages/skills/skills`.

To sync them to the repository root `skills/` directory, run:

```bash
pnpm build:skills
```

## Repository Installers

The generated root `skills/` directory is for tools that install skills
directly from Git repositories.
