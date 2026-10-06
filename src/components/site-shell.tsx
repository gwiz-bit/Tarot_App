"use client";
import { useState, useSyncExternalStore, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Moon, Sun, Search } from "lucide-react";
import { LayoutGroup, motion } from "motion/react";
import { Popover } from "@base-ui/react/popover";
import { useLenis } from "lenis/react";

let memoryTheme: "light" | "dark" | null = null;
const subscribe = (notify: () => void) => {
  const fromStorage = (event: StorageEvent) => {
    if (event.key && event.key !== "tarot-theme") return;
    memoryTheme = null;
    notify();
  };
  window.addEventListener("tarot-theme", notify);
  window.addEventListener("storage", fromStorage);
  return () => {
    window.removeEventListener("tarot-theme", notify);
    window.removeEventListener("storage", fromStorage);
  };
};
function themeSnapshot() {
  if (memoryTheme) return memoryTheme;
  try {
    return localStorage.getItem("tarot-theme") === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}
export function SiteShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menu = menuPath === path;
  const setMenu = (open: boolean) => setMenuPath(open ? path : null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const theme = useSyncExternalStore(subscribe, themeSnapshot, () => "dark");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  useEffect(() => {
    if (!menu) return;
    lenis?.stop();
    return () => lenis?.start();
  }, [menu, lenis]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 901px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMenuPath(null);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);
  const links = [
    ["/", "Trang chủ"],
    ["/daily", "Lá hôm nay"],
    ["/reading", "Trải bài"],
    ["/library", "Thư viện"],
    ["/history", "Lịch sử"],
    ["/about", "Về dự án"],
  ];
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("tarot-theme", next);
      memoryTheme = null;
    } catch {
      memoryTheme = next;
    }
    window.dispatchEvent(new Event("tarot-theme"));
  }
  return (
    <div className="site">
      <a className="skip-link" href="#main-content">
        Đến nội dung chính
      </a>
      <Popover.Root open={menu} onOpenChange={setMenu} modal>
        <motion.header ref={header} className="header" layoutRoot layoutScroll>
          <Link className="brand" href="/">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="16" cy="16" r="11" stroke="currentColor" />
              <ellipse
                cx="16"
                cy="16"
                rx="5"
                ry="15"
                transform="rotate(40 16 16)"
                stroke="currentColor"
                strokeWidth=".7"
              />
              <path
                d="M1 16h30M16 1v30"
                stroke="currentColor"
                strokeWidth=".6"
              />
            </svg>
            <span>TAROT BIỆN CHỨNG</span>
          </Link>
          <LayoutGroup id="site-header-navigation">
            <nav aria-label="Điều hướng chính">
              {links.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className={path === href ? "active" : ""}
                  aria-current={path === href ? "page" : undefined}
                >
                  {path === href ? (
                    <motion.span
                      className="nav-active-pill"
                      layoutId="active-page"
                      initial={false}
                      transition={{
                        type: "tween",
                        duration: 0.24,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      style={{ borderRadius: 10 }}
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="nav-label">{label}</span>
                </Link>
              ))}
            </nav>
          </LayoutGroup>
          <div className="header-actions">
            <Link
              className="search-button"
              href="/library"
              aria-label="Tìm kiếm lá bài"
            >
              <Search size={19} />
            </Link>
            <Popover.Trigger
              ref={menuButton}
              className="menu-toggle"
              aria-label={menu ? "Đóng menu" : "Mở menu"}
            >
              {menu ? <X /> : <Menu />}
            </Popover.Trigger>
          </div>
        </motion.header>
        <Popover.Portal>
          <Popover.Backdrop className="mobile-menu-backdrop" />
          <Popover.Positioner
            anchor={header}
            side="bottom"
            sideOffset={10}
            align="end"
            collisionAvoidance={{ side: "none", align: "shift" }}
            positionMethod="fixed"
            className="mobile-menu-positioner"
          >
            <Popover.Popup className="mobile-navigation" data-lenis-prevent>
              <Popover.Title className="sr-only">Menu điều hướng</Popover.Title>
              <nav aria-label="Điều hướng trên điện thoại">
                {links.map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenu(false)}
                    aria-current={path === href ? "page" : undefined}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
              <button
                className="mobile-theme-toggle"
                onClick={() => {
                  toggleTheme();
                  setMenu(false);
                  menuButton.current?.focus();
                }}
                aria-label={
                  theme === "dark"
                    ? "Chuyển sang chế độ sáng"
                    : "Chuyển sang chế độ tối"
                }
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                Chế độ {theme === "dark" ? "sáng" : "tối"}
              </button>
              <Popover.Close className="mobile-menu-close">
                <X size={16} /> Đóng menu
              </Popover.Close>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
      <div id="main-content" tabIndex={-1}>
        {children}
      </div>
      <footer className="footer container">
        <Link className="brand" href="/">
          TAROT BIỆN CHỨNG
        </Link>
        <span>Một sản phẩm sáng tạo cho học phần MLN111.</span>
        <span>SUY NGẪM. THẤU HIỂU. HÀNH ĐỘNG.</span>
      </footer>
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={
          theme === "dark"
            ? "Chuyển sang chế độ sáng"
            : "Chuyển sang chế độ tối"
        }
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        <span>{theme === "dark" ? "Sáng" : "Tối"}</span>
      </button>
    </div>
  );
}
