import { FC } from "react";
export type Position =
  | "-webkit-sticky"
  | "absolute"
  | "fixed"
  | "relative"
  | "static"
  | "sticky";
export interface DragTitleProps {
  bgColor?: string;
  className?: string;
  children?: React.ReactNode;
}
const DragTitle: FC<DragTitleProps> = ({ children, className, bgColor }) => {
  return (
    <div
      className={`app-draggable  ${className} `}
      style={{
        backgroundColor: bgColor,
      }}
    >
      <div className="no-drag">{children}</div>
    </div>
  );
};

export default DragTitle;
