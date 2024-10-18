"use client";

import type { InputProps, SelectProps } from "@nextui-org/react";

import React from "react";
import { Input, Select, SelectItem } from "@nextui-org/react";

import { cn } from "./cn";
import companyTypes from "./company-types";
import states from "./states";
import companyIndustries from "./company-industries";

export type CompanyInformationFormProps = React.HTMLAttributes<HTMLFormElement>;

const CompanyInformationForm = React.forwardRef<
  HTMLFormElement,
  CompanyInformationFormProps
>(({ className, ...props }, ref) => {
  const inputProps: Pick<InputProps, "labelPlacement" | "classNames"> = {
    labelPlacement: "outside",
    classNames: {
      label:
        "text-small font-medium text-default-700 group-data-[filled-within=true]:text-default-700",
    },
  };

  const selectProps: Pick<SelectProps, "labelPlacement" | "classNames"> = {
    labelPlacement: "outside",
    classNames: {
      label:
        "text-small font-medium text-default-700 group-data-[filled=true]:text-default-700",
    },
  };

  return <></>;
});

CompanyInformationForm.displayName = "CompanyInformationForm";

export default CompanyInformationForm;
