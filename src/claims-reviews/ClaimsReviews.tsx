import { useMemo, useState } from 'react';
import {
  GoabBadge,
  GoabButton,
  GoabButtonGroup,
  GoabCheckbox,
  GoabContainer,
  GoabIcon,
  GoabInput,
  GoabDropdown,
  GoabDropdownOption,
  GoabLink,
  GoabTab,
  GoabTable,
  GoabSpacer,
  GoabTableSortHeader,
  GoabTabs,
  GoabText,
  GoabTooltip,
} from '@abgov/react-components';
import type { GoabBadgeProps } from '@abgov/react-components';

import { CLAIMS, QA_QUEUE_TOTAL, type Claim, type ClaimFlag, type ReviewStatus } from './data';
import './ClaimsReviews.css';

/* Local mirrors of design-system detail types: the common package is referenced
   only inside the library's .d.ts, so it isn't importable from app code. */
type BadgeType = NonNullable<GoabBadgeProps['type']>;
interface TableSortDetail {
  sortBy: string;
  sortDir: number;
}
interface InputChangeDetail {
  value: string;
}
interface TabsChangeDetail {
  tab: number;
}
interface DropdownChangeDetail {
  value: string;
}

/* ---------------------------------------------------------------- tab model */

type TabKey = 'overview' | 'qa-queue' | 'hold' | 'watchlist';

const TABS: TabKey[] = ['overview', 'qa-queue', 'hold', 'watchlist'];

/* -------------------------------------------------------- status → badge map */

const REVIEW_STATUS_BADGE: Record<ReviewStatus, BadgeType> = {
  'In review at QA Review': 'information',
  'QA Review complete': 'success',
  'FDH EO complete': 'success',
  'ICC EO complete': 'success',
  'Funding Manager complete': 'success',
  'Held at Funding Manager': 'dark',
};

const FLAG_BADGE: Record<ClaimFlag, BadgeType> = {
  'High variance': 'emergency',
  'Random sample': 'important',
};

/* ----------------------------------------------------------------- helpers */

const money = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  currencyDisplay: 'narrowSymbol',
});

/** Negative amounts read as bracketed credits, e.g. ($11,502.82). */
function formatAmount(amount: number): string {
  const formatted = money.format(Math.abs(amount));
  return amount < 0 ? `(${formatted})` : formatted;
}

const longDate = new Intl.DateTimeFormat('en-CA', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

const shortDate = new Intl.DateTimeFormat('en-CA', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

function formatReceived(iso: string, style: 'long' | 'short'): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return style === 'long' ? longDate.format(date) : shortDate.format(date);
}

type SortName = 'received' | 'program' | 'programId' | 'amount';
type Direction = 'asc' | 'desc' | 'none';

/* ---------------------------------------------------------------- component */

export default function ClaimsReviews() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [sort, setSort] = useState<{ name: SortName; direction: Direction }>({
    name: 'received',
    direction: 'none',
  });
  const [query, setQuery] = useState('');
  const [flagFilter, setFlagFilter] = useState('');

  /** Row selection, keyed by payment reference. */
  const [selected, setSelected] = useState<Set<string>>(new Set());
  /** Claims marked reviewed in this session but not yet released. */
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [watchlist, setWatchlist] = useState<Set<string>>(
    () => new Set(CLAIMS.filter((c) => c.watchlisted).map((c) => c.paymentRef)),
  );
  const [held, setHeld] = useState<Set<string>>(
    () =>
      new Set(
        CLAIMS.filter((c) => c.reviewStatus === 'Held at Funding Manager').map((c) => c.paymentRef),
      ),
  );

  /* The overview lists every claim already in the review chain; the QA queue
     lists what is still awaiting HQ QA. */
  const overviewClaims = useMemo(() => CLAIMS.filter((c) => c.reviewStatus), []);
  const qaQueueClaims = useMemo(() => CLAIMS.filter((c) => c.inQaQueue), []);

  const holdCount = held.size;
  const watchlistCount = watchlist.size;

  const rowsForTab = (tab: TabKey): Claim[] => {
    switch (tab) {
      case 'overview':
        return overviewClaims;
      case 'qa-queue':
        return qaQueueClaims;
      case 'hold':
        return CLAIMS.filter((c) => held.has(c.paymentRef));
      case 'watchlist':
        return CLAIMS.filter((c) => watchlist.has(c.paymentRef));
    }
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = rowsForTab(activeTab).filter((c) => {
      const flagged = flagFilter && flagFilter !== 'all';
      if (flagged) {
        const matches =
          flagFilter === 'Adjustment' ? c.type === 'Adjustment' : c.flag === flagFilter;
        if (!matches) return false;
      }
      if (!q) return true;
      return `${c.program} ${c.address} ${c.programId} ${c.paymentRef}`.toLowerCase().includes(q);
    });

    if (sort.direction === 'none') return filtered;
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sort.name) {
        case 'program':
          return a.program.localeCompare(b.program) * dir;
        case 'programId':
          return a.programId.localeCompare(b.programId) * dir;
        case 'amount':
          return (a.amount - b.amount) * dir;
        case 'received':
        default:
          return a.receivedIso.localeCompare(b.receivedIso) * dir;
      }
    });
  }, [activeTab, query, flagFilter, sort, held, watchlist]);

  /* The overview is a read-only roll-up; the working queues are selectable. */
  const selectable = activeTab !== 'overview';
  const dateStyle = activeTab === 'overview' ? 'long' : 'short';
  /* The reviewed-marker gutter only opens once something in view is marked. */
  const showReviewedMarker = rows.some((c) => reviewed.has(c.paymentRef));
  /* The QA queue *is* the QA Review stage, so it does not restate the stage a
     claim is sitting at; the overview carries that label instead. */
  const showReviewStatus = activeTab !== 'qa-queue';

  const selectedRows = rows.filter((c) => selected.has(c.paymentRef));
  const reviewedSelectedCount = selectedRows.filter((c) => reviewed.has(c.paymentRef)).length;
  const allSelected = rows.length > 0 && selectedRows.length === rows.length;
  const someSelected = selectedRows.length > 0 && !allSelected;

  const onTabChange = (detail: TabsChangeDetail) => {
    setActiveTab(TABS[detail.tab - 1] ?? 'overview');
    setSelected(new Set());
  };

  const onSortHeader = (detail: TableSortDetail) => {
    setSort({
      name: detail.sortBy as SortName,
      direction: detail.sortDir === 1 ? 'asc' : 'desc',
    });
  };

  const dirFor = (name: SortName): Direction => (sort.name === name ? sort.direction : 'none');

  const toggleRow = (ref: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(ref)) next.delete(ref);
      else next.add(ref);
      return next;
    });

  const toggleSelectAll = () =>
    setSelected((prev) => {
      if (allSelected) return new Set();
      const next = new Set(prev);
      rows.forEach((c) => next.add(c.paymentRef));
      return next;
    });

  const clearSelection = () => setSelected(new Set());

  const addSelectedToWatchlist = () =>
    setWatchlist((prev) => {
      const next = new Set(prev);
      selected.forEach((ref) => next.add(ref));
      return next;
    });

  const holdSelected = () => {
    setHeld((prev) => {
      const next = new Set(prev);
      selected.forEach((ref) => next.add(ref));
      return next;
    });
    clearSelection();
  };

  const markSelectedReviewed = () =>
    setReviewed((prev) => {
      const next = new Set(prev);
      selected.forEach((ref) => next.add(ref));
      return next;
    });

  const releaseReviewed = () => {
    setReviewed((prev) => {
      const next = new Set(prev);
      selected.forEach((ref) => next.delete(ref));
      return next;
    });
    clearSelection();
  };

  /* ------------------------------------------------------------------ views */

  const toolbar = (
    <div className="claims-toolbar">
      <GoabTooltip
        content="Claims are pulled into the HQ QA queue by high variance or random sampling."
        position="bottom"
        maxWidth="320px"
      >
        <GoabIcon type="information-circle" size="medium" ariaLabel="About this queue" />
      </GoabTooltip>

      <div className="claims-toolbar__search">
        <GoabInput
          name="search"
          type="search"
          size="compact"
          value={query}
          leadingIcon="search"
          placeholder="Search"
          width="100%"
          ariaLabel="Search claims"
          onChange={(detail: InputChangeDetail) => setQuery(detail.value)}
        />
      </div>

      <GoabDropdown
        name="flag"
        size="compact"
        leadingIcon="filter-lines"
        placeholder="Filter"
        value={flagFilter}
        ariaLabel="Filter claims"
        onChange={(detail: DropdownChangeDetail) => setFlagFilter(detail.value)}
      >
        <GoabDropdownOption value="all" label="All claims" />
        <GoabDropdownOption value="High variance" label="High variance" />
        <GoabDropdownOption value="Random sample" label="Random sample" />
        <GoabDropdownOption value="Adjustment" label="Adjustments" />
      </GoabDropdown>

      <GoabDropdown
        name="export"
        size="compact"
        placeholder="Export"
        value=""
        ariaLabel="Export claims"
        onChange={() => undefined}
      >
        <GoabDropdownOption value="csv" label="Export as CSV" />
        <GoabDropdownOption value="xlsx" label="Export as Excel" />
      </GoabDropdown>
    </div>
  );

  const selectionBar = selectable && selectedRows.length > 0 && (
    <div className="claims-selection">
      <GoabContainer type="info" accent="filled" padding="compact">
        <div className="claims-selection__content">
          <GoabText tag="span" size="body-m">
            {selectedRows.length} selected
          </GoabText>

          <div className="claims-selection__actions">
            <GoabButtonGroup alignment="end" gap="compact">
              {reviewedSelectedCount > 0 && (
                <GoabButton type="primary" leadingIcon="send" onClick={releaseReviewed}>
                  {`Release ${reviewedSelectedCount} reviewed`}
                </GoabButton>
              )}
              <GoabButton type="secondary" onClick={addSelectedToWatchlist}>
                Add to watchlist
              </GoabButton>
              <GoabButton type="secondary" onClick={holdSelected}>
                Place on hold
              </GoabButton>
              {reviewedSelectedCount === selectedRows.length ? (
                /* Once every selected claim is marked, the control becomes a
                   state indicator rather than an action. */
                <GoabBadge
                  type="success"
                  size="large"
                  iconType="checkmark"
                  content="Reviewed"
                  ariaLabel={`${reviewedSelectedCount} claims marked reviewed`}
                />
              ) : (
                <GoabButton type="secondary" onClick={markSelectedReviewed}>
                  Mark reviewed
                </GoabButton>
              )}
            </GoabButtonGroup>

            <GoabLink>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a
                href="#clear"
                onClick={(event) => {
                  event.preventDefault();
                  clearSelection();
                }}
              >
                Clear
              </a>
            </GoabLink>
          </div>
        </div>
      </GoabContainer>
    </div>
  );

  const table = (
    <GoabTable onSort={onSortHeader}>
      <thead>
        <tr>
          {selectable && (
            <th className="claims-cell--select">
              <GoabCheckbox
                name="select-all"
                ariaLabel="Select all claims"
                checked={allSelected}
                indeterminate={someSelected}
                onChange={toggleSelectAll}
              />
            </th>
          )}
          {showReviewedMarker && <th className="claims-cell--marker" aria-label="Reviewed" />}
          <th>
            <GoabTableSortHeader name="received" direction={dirFor('received')}>
              Received
            </GoabTableSortHeader>
          </th>
          <th>
            <GoabTableSortHeader name="program" direction={dirFor('program')}>
              Program name
            </GoabTableSortHeader>
          </th>
          <th>
            <GoabTableSortHeader name="programId" direction={dirFor('programId')}>
              Program ID
            </GoabTableSortHeader>
          </th>
          <th>Claim period</th>
          <th>Payment ref #</th>
          <th>{selectable ? 'Type' : 'Claim type'}</th>
          {selectable && <th>Flag(s)</th>}
          <th>Review status</th>
          <th className="goa-table-number-column">
            <GoabTableSortHeader name="amount" direction={dirFor('amount')}>
              Amount
            </GoabTableSortHeader>
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((claim) => {
          const isReviewed = reviewed.has(claim.paymentRef);
          return (
            <tr key={claim.paymentRef}>
              {selectable && (
                <td className="claims-cell--select">
                  <GoabCheckbox
                    name={`select-${claim.paymentRef}`}
                    ariaLabel={`Select ${claim.program}`}
                    checked={selected.has(claim.paymentRef)}
                    onChange={() => toggleRow(claim.paymentRef)}
                  />
                </td>
              )}
              {showReviewedMarker && (
                <td className="claims-cell--marker">
                  {isReviewed && (
                    <GoabIcon
                      type="checkmark-circle"
                      theme="filled"
                      size="medium"
                      fillColor="var(--goa-color-success-default)"
                      ariaLabel="Marked reviewed"
                    />
                  )}
                </td>
              )}
              <td className="claims-cell--nowrap">
                {formatReceived(claim.receivedIso, dateStyle)}
              </td>
              <td>
                <span className="claims-program">
                  <span className="claims-program__name">{claim.program}</span>
                  <span className="claims-program__address">{claim.address}</span>
                </span>
              </td>
              <td className="claims-cell--number">{claim.programId}</td>
              <td className="claims-cell--nowrap">{claim.claimPeriod}</td>
              <td className="claims-cell--number">{claim.paymentRef}</td>
              <td className="claims-cell--nowrap">{claim.type}</td>
              {selectable && (
                <td>
                  {claim.flag ? (
                    <GoabBadge
                      type={FLAG_BADGE[claim.flag]}
                      emphasis="subtle"
                      content={claim.flag}
                    />
                  ) : (
                    <span className="claims-cell--empty" aria-label="No flags">
                      —
                    </span>
                  )}
                </td>
              )}
              <td>
                {showReviewStatus && claim.reviewStatus ? (
                  <GoabBadge
                    type={REVIEW_STATUS_BADGE[claim.reviewStatus]}
                    emphasis={claim.reviewStatus === 'Held at Funding Manager' ? 'strong' : 'subtle'}
                    content={claim.reviewStatus}
                  />
                ) : null}
              </td>
              <td
                className={`goa-table-number-column claims-cell--number${
                  claim.amount < 0 ? ' claims-cell--credit' : ''
                }`}
              >
                {formatAmount(claim.amount)}
              </td>
              <td className="claims-cell--nowrap">
                <GoabLink leadingIcon="open">
                  <a href={`#/claims-reviews/${claim.paymentRef}`}>Open</a>
                </GoabLink>
              </td>
            </tr>
          );
        })}
      </tbody>
    </GoabTable>
  );

  return (
    <div className="claims">
      <GoabText tag="h1" size="heading-l">
        Claims reviews
      </GoabText>

      <div className="claims-controls">
        <div className="claims-controls__tabs">
          <GoabTabs variant="segmented" navigation="none" onChange={onTabChange}>
            <GoabTab heading="Claims overview" />
            <GoabTab
              heading={
                <>
                  QA queue{' '}
                  <GoabBadge type="information" emphasis="subtle" content={String(QA_QUEUE_TOTAL)} />
                </>
              }
            />
            <GoabTab
              heading={
                <>
                  Hold <GoabBadge type="dark" content={String(holdCount)} />
                </>
              }
            />
            <GoabTab
              heading={
                <>
                  Watchlist{' '}
                  <GoabBadge type="midtone" emphasis="subtle" content={String(watchlistCount)} />
                </>
              }
            />
          </GoabTabs>
        </div>
        {toolbar}
      </div>

      {selectionBar}

      <div className="claims-table">{table}</div>

      {rows.length === 0 && (
        <>
          <GoabSpacer vSpacing="l" />
          <GoabText tag="p" color="secondary">
            No claims match your search.
          </GoabText>
        </>
      )}
    </div>
  );
}
