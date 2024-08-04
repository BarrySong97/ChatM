import { SolarMoonSleepBold, SolarSunFogBold } from "@/assets/icon";
import { Button, Tooltip } from "@nextui-org/react";
import React, { FC } from "react";
import useDarkMode from "use-dark-mode";

export interface DarkModeButtonProps {
  className?: string;
}
const DarkModeButton: FC<DarkModeButtonProps> = ({ className }) => {
  const darkMode = useDarkMode(false);
  return (
    <Tooltip
      placement="right"
      content={
        darkMode.value ? (
          <span className="dark:text-foreground">Click to Light Mode</span>
        ) : (
          <span className="dark:text-foreground">Click to Dark Mode</span>
        )
      }
    >
      <Button
        className={`w-full py-6 text-large ${className}`}
        size="sm"
        isIconOnly
        variant="light"
        onClick={darkMode.toggle}
      >
        {darkMode.value ? <SolarSunFogBold /> : <SolarMoonSleepBold />}
      </Button>
    </Tooltip>
  );
};

export default DarkModeButton;
