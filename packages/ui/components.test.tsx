import { expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Back, Dialog, DialogDescription, Table, column } from "@labpane/ui";

it("keeps caller URLs intact and renders tables without app dependencies", () => {
  const html = renderToStaticMarkup(
    <>
      <Back href="/projects" label="Projects" />
      <Table
        label="Projects"
        rows={[{ name: "One" }, { name: "Two" }]}
        rowKey={(row) => row.name}
        columns={[column("name", "Name", (row: { name: string }) => row.name)]}
      />
    </>,
  );
  expect(html).toContain('href="/projects"');
  expect(html).toContain('aria-label="Projects"');
  expect(html).toContain("Two");
});

it("describes a dialog with DialogDescription", () => {
  const html = renderToStaticMarkup(
    <Dialog open>
      <DialogDescription>Changes apply to every tab.</DialogDescription>
    </Dialog>,
  );
  expect(html).toMatch(/^<p id="[^"]+" data-slot="dialog-description"/);
  expect(html).toContain("labui:text-muted-foreground");
  expect(html).toContain("Changes apply to every tab.");
});
