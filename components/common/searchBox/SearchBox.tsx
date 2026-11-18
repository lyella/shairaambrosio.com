import type { ChangeEventHandler } from "react";

import { useCallback } from "react";

import { useSearchBox } from "react-instantsearch";

import { Input } from "components/common/input/Input";

interface SearchBoxProps {
  readonly currentObjectID?: string | null;
  readonly onChange: (refinement: string) => void;
}

export const SearchBox = ({ currentObjectID, onChange }: SearchBoxProps) => {
  const { query, refine } = useSearchBox();

  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      refine(e.currentTarget.value);
      onChange(e.currentTarget.value);
    },
    [onChange, refine],
  );

  return (
    <form noValidate role="search">
      <Input
        aria-autocomplete="list"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder="Search..."
        onChange={handleChange}
        value={query}
        {...(currentObjectID && { "aria-activedescendant": "id" + currentObjectID })}
        type="search"
      >
        <span className="sr-only">search</span>
      </Input>
    </form>
  );
};
