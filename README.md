# Labpane

Workspace UI for researchers

| Package                      | What it is                                                                             |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| [`@labpane/os`](packages/os) ([npm link](https://www.npmjs.com/package/@labpane/ui)) | The workspace: tabs, split panes, docking, keyboard navigation. Depends only on React. |
| [`@labpane/ui`](packages/ui) ([npm link](https://www.npmjs.com/package/@labpane/os)) | Page layouts, forms, dialogs, menus, tables, and an optional terminal, built on Radix. |

Both packages:

- work with React 18.2 and later, including React 19
- ship plain, scoped CSS that builds in Tailwind 3, Tailwind 4, or no-Tailwind apps without touching the host page
- are themed with CSS variables, with light and dark defaults and forced-colors support
- take React and Radix as peer dependencies, so your app keeps a single copy of each

Use `@labpane/os` on its own and bring your own components, or add `@labpane/ui` for a ready-made look.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, tests, and releases. Report security issues privately as described in [SECURITY.md](SECURITY.md).

## License

MIT
