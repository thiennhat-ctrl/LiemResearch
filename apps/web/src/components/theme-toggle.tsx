import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      className="rounded-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white px-4 py-2 font-bold flex gap-2 items-center shadow-lg"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-5 w-5" /> Light Mode
        </>
      ) : (
        <>
          <Moon className="h-5 w-5" /> Dark Mode
        </>
      )}
    </Button>
  )
}
