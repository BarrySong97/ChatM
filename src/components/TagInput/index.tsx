import React, { useEffect, useState } from "react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { useTagService } from "@/api/hooks/tag";

interface TagInputProps {
  // Add any additional props specific to TagInput here
  onChange?: (value: string) => void;
  value?: string;
}
const TagInput: React.FC<TagInputProps> = ({ onChange, value }) => {
  const [inputValue, setInputValue] = useState("");
  const { tags } = useTagService();
  const [selectKey, setselectKey] = useState<string>();
  const myFilter = (textValue: string, inputValue: string) => {
    const lastChar = inputValue.slice(-1);
    const last = inputValue.split("#").pop();
    if (inputValue.includes(textValue)) {
      return false;
    }

    if (
      lastChar === "#" ||
      (last && textValue.toLowerCase().includes(last.toLowerCase()))
    ) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    onChange?.(inputValue);
  }, [inputValue]);
  return (
    <Autocomplete
      allowsCustomValue
      variant="flat"
      aria-label="tag"
      placeholder="添加标签, 多个标签用空格隔开"
      size="sm"
      onClear={() => {
        setInputValue("");
        setselectKey("");
      }}
      defaultFilter={myFilter}
      inputValue={value}
      onSelectionChange={(e) => {
        setselectKey(e as string);
      }}
      onInputChange={(e) => {
        setInputValue((prevValue) => {
          // Check if there's a previous value
          if (prevValue) {
            // If the new input is different from selectKey, it's a regular input
            if (e.toLowerCase() !== selectKey?.toLowerCase()) {
              return e;
            }
            // If it's the same as selectKey, concatenate it
            if (prevValue.endsWith("#")) {
              return prevValue + e.slice(1);
            } else {
              const lastHashIndex = prevValue.lastIndexOf("#");
              if (lastHashIndex !== -1) {
                const lastPart = prevValue
                  .slice(lastHashIndex + 1)
                  .toLowerCase();
                if (selectKey && selectKey.toLowerCase().includes(lastPart)) {
                  return prevValue.slice(0, lastHashIndex) + " " + e;
                }
              }
              return prevValue + e;
            }
          }

          // If there's no previous value, just return the new input

          return e;
        });
      }}
      defaultItems={tags ?? []}
    >
      {(item) => <AutocompleteItem key={item.id}>{item.name}</AutocompleteItem>}
    </Autocomplete>
  );
};

export default TagInput;
