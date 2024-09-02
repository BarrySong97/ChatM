import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useTagService } from "@/api/hooks/tag";

interface TagInputProps {
  // Add any additional props specific to TagInput here
  onChange?: (value: string[] | undefined) => void;
  value?: string[];
}
const TagInput: React.FC<TagInputProps> = ({ onChange, value }) => {
  const [inputValue, setInputValue] = useState("");
  const { tags, createTag } = useTagService();

  const filteredTags = useMemo(() => {
    let filteredLength = 0;
    const temp = tags?.map((tag) => {
      if (tag.name?.includes(`${inputValue}`)) {
        filteredLength++;
        return <SelectItem key={tag.id}>{tag.name}</SelectItem>;
      } else {
        return (
          <SelectItem
            classNames={{
              base: "hidden",
            }}
            key={tag.id}
          >
            {tag.name}
          </SelectItem>
        );
      }
    });
    if (filteredLength === 0 && inputValue) {
      temp?.push(<SelectItem key="new">{`创建标签 ${inputValue}`}</SelectItem>);
    }
    return temp;
  }, [tags, inputValue]);

  return (
    <Select
      variant="flat"
      aria-label="tag"
      selectionMode="multiple"
      listboxProps={{
        topContent: (
          <Input
            placeholder="搜索或添加标签"
            size="sm"
            radius="sm"
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
          />
        ),
      }}
      placeholder="添加标签"
      size="sm"
      selectedKeys={new Set(value)}
      endContent={
        value?.length ? (
          <div
            onClick={(e) => {
              onChange?.([]);
            }}
            className="hover:!opacity-100 cursor-pointer  !opacity-60"
          >
            <svg
              aria-hidden="true"
              focusable="false"
              height="1em"
              role="presentation"
              viewBox="0 0 24 24"
              width="1em"
            >
              <path
                d="M12 2a10 10 0 1010 10A10.016 10.016 0 0012 2zm3.36 12.3a.754.754 0 010 1.06.748.748 0 01-1.06 0l-2.3-2.3-2.3 2.3a.748.748 0 01-1.06 0 .754.754 0 010-1.06l2.3-2.3-2.3-2.3A.75.75 0 019.7 8.64l2.3 2.3 2.3-2.3a.75.75 0 011.06 1.06l-2.3 2.3z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
        ) : null
      }
      renderValue={() => {
        const items = tags?.filter((tag) => value?.includes(tag.id));

        return items?.map((item) => `#${item.name}`).join(" ");
      }}
      onSelectionChange={async (e) => {
        if (e instanceof Set && e.has("new") && inputValue) {
          // Create new tag
          const newTag = { name: inputValue };
          const res = await createTag({
            tag: newTag,
          });
          onChange?.([...(value ?? []), res.id]);
          setInputValue("");
        } else {
          // Set select key
          onChange?.(Array.from(e as Set<string>));
          setInputValue("");
        }
      }}
    >
      {filteredTags ?? []}
    </Select>
  );
};

export default TagInput;
