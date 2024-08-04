import { createContext, useEffect } from "react";
import useDarkMode from "use-dark-mode";

// 创建一个上下文对象
const DarkModeContext = createContext(null);

// 创建一个提供程序组件
export function DarkModeProvider({ children }: { children: any }) {
  const darkMode = useDarkMode(false);

  // 根据 darkMode 状态设置主题类名
  const themeClassName = darkMode.value ? "dark" : "";
  useEffect(() => {
    document.body.classList[darkMode.value ? "add" : "remove"]("dark");
  }, [darkMode.value]);

  return (
    <DarkModeContext.Provider value={null}>
      <main className={`${themeClassName}`}>{children}</main>
    </DarkModeContext.Provider>
  );
}
