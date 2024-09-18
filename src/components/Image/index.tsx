import { AppPathAtom } from "@/globals";
import { useAtom } from "jotai";
import React from "react";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

const ElectronImage: React.FC<ImageProps> = ({ src, ...props }) => {
  const [appPath] = useAtom(AppPathAtom);

  const imageSrc = import.meta.env.DEV ? src : `${appPath}/dist${src}`;
  return <img src={imageSrc} {...props} />;
};

export default ElectronImage;
