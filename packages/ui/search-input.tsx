import * as React from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { cn } from "./classes.js";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./input-group.js";

const SearchInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof InputGroupInput> & {
    onClear?: () => void;
    clearLabel?: string;
  }
>(function SearchInput(
  {
    className,
    type = "search",
    value,
    defaultValue,
    onChange,
    onClear,
    clearLabel = "Clear",
    ...props
  },
  ref,
) {
  const [own, setOwn] = React.useState(String(defaultValue ?? ""));
  const current = value ?? own;
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(ref, () => inputRef.current!);

  function clear() {
    const input = inputRef.current;
    if (!input) return;
    setOwn("");
    if (value === undefined) input.value = "";
    onClear?.();
    input.focus();
  }

  return (
    <InputGroup
      data-slot="search-input"
      className={cn("labui:w-full", className)}
    >
      <InputGroupAddon>
        <SearchIcon aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput
        ref={inputRef}
        type={type}
        value={value}
        defaultValue={defaultValue}
        onChange={(event) => {
          setOwn(event.target.value);
          onChange?.(event);
        }}
        {...props}
      />
      {current !== "" && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label={clearLabel}
            onClick={clear}
          >
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
});

export { SearchInput };
