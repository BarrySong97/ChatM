import { AppPathAtom } from "@/globals";
import { usePublicPath } from "@/hooks";
import { useAtom } from "jotai";
import React from "react";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  delay?: number; // 添加可选的延迟参数
}

const ElectronImage: React.FC<ImageProps> = ({
  src,
  delay = 520,
  ...props
}) => {
  const imageSrc = usePublicPath(src);

  return <img src={imageSrc} {...props} />;
};

export default ElectronImage;
