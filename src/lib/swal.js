import SweetAlert from "sweetalert2";
import "sweetalert2/dist/sweetalert2.css";

// SweetAlert2 wrapper that follows the app's dark/light theme and keeps the
// brand palette. All admin confirm/error flows go through here instead of
// window.confirm so the UI never drops into a native browser dialog.

const palette = {
  light: {
    background: "#ffffff",
    color: "#101828",
    confirmButtonColor: "#ff9490",
    focusColor: "#ffb6b2",
  },
  dark: {
    background: "#0f151d",
    color: "#eef2f7",
    confirmButtonColor: "#c0413f",
    focusColor: "#ff6b6b",
  },
};

// v11 exposes defaults on the imported object, not on a prototype. Setting
// them here makes every popup that opens afterwards pick up the theme.
export function applyThemeToSwal(isDark) {
  const p = isDark ? palette.dark : palette.light;
  Object.assign(SweetAlert.defaults, {
    background: p.background,
    color: p.color,
    confirmButtonColor: p.confirmButtonColor,
    focusColor: p.focusColor,
    customClass: {
      popup: "rounded-2xl shadow-2xl",
      title: "font-bold",
      htmlContainer: "text-text-muted",
      confirmButton: "rounded-xl px-5 py-2.5 font-bold",
      actions: "gap-2",
    },
  });
}

// Confirm dialog — returns true on confirm, false on cancel.
export async function confirmDialog({
  title,
  text,
  confirmText = "Yes, delete",
  cancelText = "Cancel",
  icon = "warning",
  danger = false,
}) {
  const isDark = document.documentElement.classList.contains("dark");
  const p = isDark ? palette.dark : palette.light;

  const result = await SweetAlert.fire({
    title,
    text,
    icon,
    iconColor: danger ? p.confirmButtonColor : "#2686cd",
    showConfirmButton: true,
    showCancel: true,
    confirmButtonColor: p.confirmButtonColor,
    focusCancel: true,
    reverseButtons: true,
    confirmText,
    cancelText,
    background: p.background,
    color: p.color,
    customClass: {
      popup: "rounded-2xl shadow-2xl",
      title: "font-bold",
      htmlContainer: "text-text-muted",
      confirmButton: "rounded-xl px-5 py-2.5 font-bold",
      actions: "gap-2",
    },
  });

  return result.isConfirmed;
}

function currentBackground() {
  return document.documentElement.classList.contains("dark")
    ? palette.dark.background
    : palette.light.background;
}

function currentColor() {
  return document.documentElement.classList.contains("dark")
    ? palette.dark.color
    : palette.light.color;
}

function currentConfirmColor() {
  return document.documentElement.classList.contains("dark")
    ? palette.dark.confirmButtonColor
    : palette.light.confirmButtonColor;
}

// Success / error / info popups.
export function toastSuccess(message) {
  return SweetAlert.fire({
    icon: "success",
    title: message,
    timer: 2500,
    showConfirmButton: false,
    background: currentBackground(),
    color: currentColor(),
  });
}

export function toastError(message) {
  return SweetAlert.fire({
    icon: "error",
    title: "Something went wrong",
    text: message,
    confirmButtonColor: currentConfirmColor(),
    background: currentBackground(),
    color: currentColor(),
  });
}

export function toastInfo(message) {
  return SweetAlert.fire({
    icon: "info",
    title: message,
    timer: 2500,
    showConfirmButton: false,
    background: currentBackground(),
    color: currentColor(),
  });
}