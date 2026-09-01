import type { ReactNode } from 'react';
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
