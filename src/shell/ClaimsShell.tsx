import { useLayoutEffect, type ReactNode } from 'react';
import {
  GoabWorkSideMenu,
  GoabWorkSideMenuGroup,
  GoabWorkSideMenuItem,
  GoabWorkspaceLayout,
} from '@abgov/react-components';

interface ClaimsShellProps {
  children: ReactNode;
}

/**
 * Worker-application shell: the collapsed work side menu rail plus the inset
 * workspace card that the Claims reviews screen scrolls inside.
 *
 * Both regions come from the design system — GoabWorkspaceLayout owns the card,
 * its scroll container and the rail slot; GoabWorkSideMenu owns the logo,
 * collapse toggle and account affordance shown on the rail.
 */
export default function ClaimsShell({ children }: ClaimsShellProps) {
  /*
   * The design shows the rail collapsed to icons. The `open` prop cannot express
   * that on its own: `open` is a boolean attribute, so React omits it rather than
   * writing open="false", and goa-work-side-menu then falls back to its own
   * default — which is expanded at wide viewports. Setting the element property
   * is what actually holds it closed, so do that as soon as the custom element is
   * defined. The rail stays user-toggleable afterwards.
   */
  useLayoutEffect(() => {
    let cancelled = false;
    const collapse = () => {
      if (cancelled) return;
      const el = document.querySelector('goa-work-side-menu') as
        | (HTMLElement & { open?: boolean })
        | null;
      if (el) el.open = false;
    };
    collapse();
    void customElements.whenDefined('goa-work-side-menu').then(collapse);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <GoabWorkspaceLayout
      sideMenu={
        <GoabWorkSideMenu
          heading="HQ QA work queue"
          url="#/claims-reviews"
          userName="Casey Doe"
          userSecondaryText="HQ QA reviewer"
          open={false}
          primaryContent={
            <GoabWorkSideMenuGroup heading="Claims" icon="copy" open>
              <GoabWorkSideMenuItem label="Claims reviews" url="#/claims-reviews" current />
              <GoabWorkSideMenuItem label="Adjustment work queue" url="#/claims-reviews" />
            </GoabWorkSideMenuGroup>
          }
          accountContent={
            <>
              <GoabWorkSideMenuItem icon="settings" label="Settings" url="#/claims-reviews" />
              <GoabWorkSideMenuItem icon="log-out" label="Log out" url="#/claims-reviews" />
            </>
          }
        />
      }
    >
      {children}
    </GoabWorkspaceLayout>
  );
}
