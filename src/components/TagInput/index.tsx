import React, { useState } from "react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";

interface TagInputProps {
  // Add any additional props specific to TagInput here
}
const animals = [
  {
    label: "Cat",
    value: "cat",
    description: "The second most popular pet in the world",
  },
  {
    label: "Dog",
    value: "dog",
    description: "The most popular pet in the world",
  },
  {
    label: "Elephant",
    value: "elephant",
    description: "The largest land animal",
  },
  { label: "Lion", value: "lion", description: "The king of the jungle" },
  { label: "Tiger", value: "tiger", description: "The largest cat species" },
  {
    label: "Giraffe",
    value: "giraffe",
    description: "The tallest land animal",
  },
  {
    label: "Dolphin",
    value: "dolphin",
    description: "A widely distributed and diverse group of aquatic mammals",
  },
  {
    label: "Penguin",
    value: "penguin",
    description: "A group of aquatic flightless birds",
  },
  {
    label: "Zebra",
    value: "zebra",
    description: "A several species of African equids",
  },
  {
    label: "Shark",
    value: "shark",
    description:
      "A group of elasmobranch fish characterized by a cartilaginous skeleton",
  },
  {
    label: "Whale",
    value: "whale",
    description: "Diverse group of fully aquatic placental marine mammals",
  },
  {
    label: "Otter",
    value: "otter",
    description: "A carnivorous mammal in the subfamily Lutrinae",
  },
  {
    label: "Crocodile",
    value: "crocodile",
    description: "A large semiaquatic reptile",
  },
];
const TagInput: React.FC<TagInputProps> = (props) => {
  const [inputValue, setInputValue] = useState("");
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
  return (
    <Autocomplete
      allowsCustomValue
      variant="flat"
      aria-label="tag"
      size="sm"
      onClear={() => {
        setInputValue("");
        setselectKey("");
      }}
      defaultFilter={myFilter}
      inputValue={inputValue}
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
      defaultItems={animals.map((item) => ({
        label: `#${item.label}`,
        value: `#${item.value}`,
      }))}
    >
      {(item) => (
        <AutocompleteItem key={`${item.value}`}>{item.label}</AutocompleteItem>
      )}
    </Autocomplete>
  );
};

export default TagInput;
