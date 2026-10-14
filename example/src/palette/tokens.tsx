import { useState } from "react";

type Values = Map<string, string>;
export type Tokens = { light: Values; dark: Values };

export function readTokens(): Tokens {
  const light: Values = new Map();
  const dark: Values = new Map();
  const visit = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) {
        const selector = rule.selectorText.replace(/\s/g, "");
        const target =
          selector === ":where(:root)"
            ? light
            : selector === ":where(.dark)"
              ? dark
              : undefined;
        if (!target) continue;
        for (const name of Array.from(rule.style))
          if (name.startsWith("--lab"))
            target.set(name, rule.style.getPropertyValue(name).trim());
      } else if (
        rule instanceof CSSMediaRule &&
        rule.conditionText.includes("forced-colors")
      )
        continue;
      else if ("cssRules" in rule) visit((rule as CSSGroupingRule).cssRules);
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      visit(sheet.cssRules);
    } catch {
      // Stylesheets from another origin can't be read
    }
  }
  return { light, dark };
}

const nonColour = /-(font-|radius|control-|row-py)/;

function Swatch({ name, tokens }: { name: string; tokens: Tokens }) {
  const prefix = name.startsWith("--labui-") ? "--labui-" : "--lab-";
  const light = tokens.light.get(name)!;
  const dark = tokens.dark.get(name) ?? light;
  const themes = [
    { theme: "Light", value: light, values: tokens.light },
    {
      theme: "Dark",
      value: dark,
      values: new Map([...tokens.light, ...tokens.dark]),
    },
  ];
  return (
    <li className="swatch">
      <div className="swatch-chips" aria-hidden="true">
        {themes.map(({ theme, value, values }) => (
          <span
            key={theme}
            className="swatch-chip"
            style={{
              backgroundColor: values.get(`${prefix}card`),
              backgroundImage: `linear-gradient(${value}, ${value})`,
            }}
          />
        ))}
      </div>
      <code className="swatch-name">{name}</code>
      <dl className="swatch-values">
        {themes.map(({ theme, value }) => (
          <div key={theme}>
            <dt>{theme}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </li>
  );
}

export function ColourTokens({
  prefix,
  label,
}: {
  prefix: "--labui-" | "--lab-";
  label: string;
}) {
  const [tokens] = useState(readTokens);
  const names = [...tokens.light.keys()].filter(
    (name) => name.startsWith(prefix) && !nonColour.test(name),
  );
  if (!names.length)
    return <p className="note">The {label} stylesheet isn’t loaded.</p>;
  return (
    <ul className="swatches" aria-label={`${label} colour tokens`}>
      {names.map((name) => (
        <Swatch key={name} name={name} tokens={tokens} />
      ))}
    </ul>
  );
}

export function OtherTokens() {
  const [tokens] = useState(readTokens);
  const names = [...tokens.light.keys()].filter((name) => nonColour.test(name));
  return (
    <div className="token-table">
      <table>
        <caption className="sr-only">Font and size tokens</caption>
        <thead>
          <tr>
            <th scope="col">Token</th>
            <th scope="col">Default</th>
          </tr>
        </thead>
        <tbody>
          {names.map((name) => (
            <tr key={name}>
              <th scope="row">
                <code>{name}</code>
              </th>
              <td>{tokens.light.get(name)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
