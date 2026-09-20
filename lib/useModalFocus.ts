'use client';

import { useEffect, useRef, type RefObject } from 'react';

const tabbableSelector = 'a[href], button, input, select, textarea, [tabindex]';

export function useModalFocus(
  dialogRef: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  const closeRef = useRef(onClose);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const activeElement = document.activeElement;
    // Strict Mode can replay this effect while focus is already in the dialog.
    // Keep the outside trigger when that happens, including disabled triggers.
    if (activeElement instanceof HTMLElement && !dialog.contains(activeElement)) {
      returnFocusRef.current = activeElement;
    }
    const previousFocus = returnFocusRef.current;
    const background: Array<{ element: HTMLElement; wasInert: boolean }> = [];

    // The dialogs render inside the page, so exclude siblings at each ancestor.
    let branch: HTMLElement = dialog;
    while (branch.parentElement) {
      const parent = branch.parentElement;
      for (const sibling of parent.children) {
        if (!(sibling instanceof HTMLElement) || sibling === branch
          || /^(SCRIPT|STYLE|LINK)$/.test(sibling.tagName)) continue;
        background.push({ element: sibling, wasInert: sibling.inert });
        sibling.setAttribute('inert', '');
      }
      if (parent === document.body) break;
      branch = parent;
    }

    const tabbableElements = () => Array.from(
      dialog.querySelectorAll<HTMLElement>(tabbableSelector),
    ).filter(element => element.tabIndex >= 0
      && !element.matches(':disabled')
      && !element.closest('[inert]')
      && element.getClientRects().length > 0
      && getComputedStyle(element).visibility !== 'hidden');

    const keepFocusInside = (event: FocusEvent) => {
      if (event.target instanceof Node && !dialog.contains(event.target)) {
        dialog.focus({ preventScroll: true });
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const controls = tabbableElements();
      const first = controls[0];
      const last = controls[controls.length - 1];
      const active = document.activeElement;
      const outsideControls = active === dialog || !dialog.contains(active);
      if (!first) {
        event.preventDefault();
        dialog.focus({ preventScroll: true });
      } else if (event.shiftKey && (active === first || outsideControls)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || outsideControls)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('focusin', keepFocusInside);
    document.addEventListener('keydown', handleKeyDown, true);
    dialog.focus({ preventScroll: true });

    return () => {
      document.removeEventListener('focusin', keepFocusInside);
      document.removeEventListener('keydown', handleKeyDown, true);
      for (const { element, wasInert } of background) element.toggleAttribute('inert', wasInert);
      if (previousFocus?.isConnected && !previousFocus.closest('[inert]')) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [dialogRef]);
}
