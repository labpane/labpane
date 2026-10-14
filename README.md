# Labpane

Workspace UI for researchers

| Package                                                                       | What it is                                                                             |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [`@labpane/os`](packages/os) [npm](https://www.npmjs.com/package/@labpane/os) | The workspace: tabs, split panes, docking, keyboard navigation. Depends only on React. |
| [`@labpane/ui`](packages/ui) [npm](https://www.npmjs.com/package/@labpane/ui) | Page layouts, forms, dialogs, menus, tables, and an optional terminal, built on Radix. |

Both packages:

- work with React 18.2 and later, including React 19
- ship plain, scoped CSS that builds in Tailwind 3, Tailwind 4, or no-Tailwind apps without touching the host page
- are themed with CSS variables, with light and dark defaults and forced-colors support
- take React and Radix as peer dependencies, so your app keeps a single copy of each

Use `@labpane/os` on its own and bring your own components, or add `@labpane/ui` for a ready-made look.

## Versioning

`@labpane/os` and `@labpane/ui` follow [semantic versioning](https://semver.org) and are released together under one version number, so you can keep both on the same version.

A new major version is needed for any change that can break an app upgrading within its version range:

- removing or renaming an export, prop, or option, or changing what one does
- renaming a `lab-` or `labui:` class, or a `--lab-*` or `--labui-*` token, that apps style against
- changing an accessible name or role that apps or their tests look up
- dropping support for a React version, or for apps with Tailwind 3, Tailwind 4, or no Tailwind

Visual changes that break none of these, such as spacing or alignment, ship in minor releases and are called out in the changelog.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, tests, and releases. Report security issues privately as described in [SECURITY.md](SECURITY.md).

## License

MIT
