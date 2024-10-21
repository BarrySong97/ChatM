import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";
import { RefObject } from "react";

import { useLocation, useParams } from "react-router-dom";
import { useAtom } from "jotai";
import { AppPathAtom } from "./globals";

export function useRouteQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}
export function usePublicPath(src: string) {
  const [appPath] = useAtom(AppPathAtom);
  const imageSrc = import.meta.env.DEV ? src : `${appPath}/dist${src}`;
  return imageSrc;
}

export function useModuleInfo() {
  const query = useRouteQuery();
  const moduleId = query.get("moduleId");
  const params = useParams();
  const projectId = params.projectId;
  const moduleType = query.get("moduleType");
  const projectTitle = query.get("projectTitle");
  return {
    moduleId: Number(moduleId),
    projectId: Number(projectId),
    moduleType,
    projectTitle: decodeURI(projectTitle ?? ""),
  };
}

const useColumnsAndRows = <T extends HTMLElement>(
  elementWidth: number,
  elementHeight: number,
  ref: RefObject<T>,
  gap: number
): { columns: number; rows: number } => {
  const [state, setState] = useState({ columns: 4, rows: 2 });

  const calculateColumns = (
    elementWidth: number,
    totalWidth: number,
    gapWidth: number
  ): number => {
    return _.round(totalWidth / (elementWidth + gapWidth));
  };

  const calculateRows = (
    elementHeight: number,
    totalHeight: number,
    gapHeight: number
  ): number => {
    return _.round(totalHeight / (elementHeight + gapHeight));
  };

  useEffect(() => {
    function handleResize() {
      if (ref.current) {
        const containerWidth = ref.current.offsetWidth;
        const containerHeight = ref.current.offsetHeight - 80;
        const gapWidth = gap;
        const gapHeight = gap;

        const columns = calculateColumns(
          elementWidth,
          containerWidth,
          gapWidth
        );

        const rows = calculateRows(elementHeight, containerHeight, gapHeight);

        setState({ columns, rows });
      }
    }

    handleResize(); // Initial calculation
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [elementWidth, elementHeight, ref, gap]);

  return state;
};

export default useColumnsAndRows;
