// Components.d.ts — the complete catalog of the 85 component(s) in
// Components.bundle.js. READ THIS FILE BEFORE USING THE BUNDLE: component
// names are derived from Figma layer names (sanitized to PascalCase,
// deduplicated) and may differ from what the design calls them — the
// "figma layer" comment above each interface maps them back.
// After the bundle <script> loads, every component is a window global
// (e.g. window.AlbertaLogo3) and usable directly in JSX.
import * as React from 'react';

// figma layer: "Alberta Logo" (node 2531:17608)
export interface AlbertaLogo3Props {
  className?: string;
  style?: React.CSSProperties;
  padding?: boolean;
  reverse?: boolean;
}

// figma layer: "CL - Callout Flags" (node 6012:51786)
export interface CLCalloutFlagsProps {
  className?: string;
  style?: React.CSSProperties;
  callout?: "none" | "hold" | "watchlist" | "review reason variance" | "qa-variance" | "affordability-high" | "wtu-excessivehours" | "wtu-adminhours" | "wtu-thresholdexceed" | "icc-contractrisk" | "icc-contractexceeded" | "icc-contractexpired" | "wtu-duplicatestaff" | "multiple reasons" | "review reason random" | "qa-random";
  /** Text content; defaults to "Review details". */
  text1?: string;
  /** Text content; defaults to "High variance: Part of the 3% of claims with the highest variance in total claim amount from the past month.". */
  text2?: string;
  /** Text content; defaults to "Spoke with Jane from ABC Childcare and confirmed the claim is accurate, this is ready to be released.". */
  text3?: string;
}

// figma layer: "CL - Header" (node 6012:72920)
export interface CLHeaderProps {
  className?: string;
  style?: React.CSSProperties;
  qACTAs?: boolean;
  flag?: boolean;
}

// figma layer: "CL - KPIs" (node 5501:105394)
export interface CLKPIsProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Submitted by". */
  text1?: string;
  /** Text content; defaults to "Claim period". */
  text2?: string;
  /** Text content; defaults to "Aug 2024". */
  text3?: string;
  /** Text content; defaults to "Received". */
  text4?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "Chevron down" (node 2531:14408)
export interface ChevronDown2Props {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Chevron right" (node 2531:17724)
export interface ChevronRightProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Chip-Hold" (node 8128:179138)
export interface ChipHoldProps {
  className?: string;
  style?: React.CSSProperties;
  property1?: "inactive" | "active";
  /** Text content; defaults to "On hold". */
  text1?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "Chip-Review" (node 8128:179180)
export interface ChipReviewProps {
  className?: string;
  style?: React.CSSProperties;
  property1?: "inactive" | "active";
  /** Text content; defaults to "Reviewed". */
  text1?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "Chip-Watchlist" (node 8128:179121)
export interface ChipWatchlistProps {
  className?: string;
  style?: React.CSSProperties;
  property1?: "inactive" | "active";
  /** Text content; defaults to "Watching". */
  text1?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "copy" (node 2597:9988)
export interface Copy2Props {
  className?: string;
  style?: React.CSSProperties;
  variant?: "filled" | "outline";
}

// figma layer: "copy" (node 7710:229288)
export interface Copy4Props {
  className?: string;
  style?: React.CSSProperties;
  variant?: "filled" | "outline";
}

// figma layer: ".Dropdown option list" (node 3807:59390)
export interface DropdownOptionList3Props {
  className?: string;
  style?: React.CSSProperties;
  multiSelect?: boolean;
  ofItems?: "6" | "5" | "4" | "3" | "2" | "1";
  scrollBar?: boolean;
}

// figma layer: ".Expand icon" (node 5189:18892)
export interface ExpandIcon5Props {
  className?: string;
  style?: React.CSSProperties;
  open?: boolean;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: ".Filter-chip" (node 3807:59493)
export interface FilterChip3Props {
  className?: string;
  style?: React.CSSProperties;
  state?: "default" | "hover" | "focus";
  content?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "Findability" (node 5501:65452)
export interface Findability2Props {
  className?: string;
  style?: React.CSSProperties;
  property1?: "default" | "filters applied";
}

// figma layer: "goa-add" (node 2531:12909)
export interface GoaAdd3Props {
  className?: string;
  style?: React.CSSProperties;
  variant?: "basic";
}

// figma layer: "goa-alert-circle" (node 2597:8556)
export interface GoaAlertCircle4Props {
  className?: string;
  style?: React.CSSProperties;
  variant?: "filled" | "outline";
}

// figma layer: "goa-arrow-forward" (node 2531:14237)
export interface GoaArrowForward2Props {
  className?: string;
  style?: React.CSSProperties;
  variant?: "basic";
}

// figma layer: "goa-Badge" (node 3807:58702)
export interface GoaBadge6Props {
  className?: string;
  style?: React.CSSProperties;
  type?: "information" | "warning" | "emergency" | "success" | "dark" | "midtone" | "light" | "custom";
  icon?: boolean;
  content?: boolean;
  content2?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "goa-Badge" (node 5022:15598)
export interface GoaBadge7Props {
  className?: string;
  style?: React.CSSProperties;
  type?: "information" | "warning" | "emergency" | "success" | "dark" | "midtone" | "light";
  icon?: boolean;
  content?: boolean;
  content2?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "goa-Button" (node 2531:13669)
export interface GoaButtonProps {
  className?: string;
  style?: React.CSSProperties;
  type?: "primary" | "secondary" | "tertiary" | "start";
  state?: "default" | "hover" | "focus & active" | "disabled";
  compact?: boolean;
  fullWidth?: boolean;
  destructive?: boolean;
  leadingIcon?: boolean;
  trailingIcon?: boolean;
  enterText?: string;
  enterText2?: string;
  icon?: React.ReactNode;
  icon2?: React.ReactNode;
}

// figma layer: "goa-calendar" (node 2621:138984)
export interface GoaCalendar3Props {
  className?: string;
  style?: React.CSSProperties;
  variant?: "filled" | "outline";
}

// figma layer: "goa-Callout" (node 5101:16972)
export interface GoaCalloutProps {
  className?: string;
  style?: React.CSSProperties;
  type?: "information" | "warning" | "emergency" | "success" | "event";
  size?: "lg" | "md";
  heading?: boolean;
  heading2?: string;
  content?: string;
}

// figma layer: "goa-caret-down" (node 2072:6135)
export interface GoaCaretDownProps {
  className?: string;
  style?: React.CSSProperties;
  variant?: "basic";
}

// figma layer: "goa-caret-up" (node 2072:6132)
export interface GoaCaretUpProps {
  className?: string;
  style?: React.CSSProperties;
  variant?: "basic";
}

// figma layer: "goa-Checkbox" (node 3807:55943)
export interface GoaCheckbox6Props {
  className?: string;
  style?: React.CSSProperties;
  state?: "default" | "hover" | "focus";
  selected?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  error?: boolean;
  text?: string;
  helperText?: boolean;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "goa-checkmark" (node 2597:8664)
export interface GoaCheckmark3Props {
  className?: string;
  style?: React.CSSProperties;
  variant?: "basic";
}

// figma layer: "goa-checkmark" (node 2599:30406)
export interface GoaCheckmark4Props {
  className?: string;
  style?: React.CSSProperties;
  variant?: "basic";
}

// figma layer: "goa-checkmark" (node 6923:108705)
export interface GoaCheckmark5Props {
  className?: string;
  style?: React.CSSProperties;
  variant?: "basic";
}

// figma layer: "goa-checkmark-circle" (node 2597:8551)
export interface GoaCheckmarkCircle3Props {
  className?: string;
  style?: React.CSSProperties;
  variant?: "filled" | "outline";
}

// figma layer: "goa-checkmark-circle" (node 2599:34271)
export interface GoaCheckmarkCircle4Props {
  className?: string;
  style?: React.CSSProperties;
  variant?: "filled" | "outline";
}

// figma layer: "goa-chevron-back" (node 7824:221838)
export interface GoaChevronBack2Props {
  className?: string;
  style?: React.CSSProperties;
  variant?: "basic";
}

// figma layer: "goa-chevron-down" (node 2072:9389)
export interface GoaChevronDown2Props {
  className?: string;
  style?: React.CSSProperties;
  variant?: "basic";
}

// figma layer: "goa-chevron-forward" (node 2597:9891)
export interface GoaChevronForward3Props {
  className?: string;
  style?: React.CSSProperties;
  variant?: "basic";
}

// figma layer: "goa-close" (node 2597:5660)
export interface GoaClose4Props {
  className?: string;
  style?: React.CSSProperties;
  variant?: "basic";
}

// figma layer: "goa-close-circle" (node 2597:28535)
export interface GoaCloseCircleProps {
  className?: string;
  style?: React.CSSProperties;
  variant?: "filled" | "outline";
}

// figma layer: "goa-column-sort" (node 2072:6127)
export interface GoaColumnSortProps {
  className?: string;
  style?: React.CSSProperties;
  variant?: "basic";
}

// figma layer: "goa-column-sort" (node 2072:6138)
export interface GoaColumnSort2Props {
  className?: string;
  style?: React.CSSProperties;
  sort?: "up" | "active" | "down";
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "goa-Divider" (node 7454:170281)
export interface GoaDivider4Props {
  className?: string;
  style?: React.CSSProperties;
  colour?: "dark" | "light";
}

// figma layer: "goa-Dropdown" (node 3807:58871)
export interface GoaDropdown5Props {
  className?: string;
  style?: React.CSSProperties;
  open?: boolean;
  inputState?: "default" | "hover" | "focus";
  error?: boolean;
  disable?: boolean;
  filter?: boolean;
  multiSelect?: boolean;
  helperText?: boolean;
  selectionChips?: boolean;
  content?: boolean;
  /** Text content; defaults to "—Select—". */
  text1?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon3?: React.ReactNode;
}

// figma layer: "goa-eye" (node 7077:66734)
export interface GoaEyeProps {
  className?: string;
  style?: React.CSSProperties;
  variant?: "filled" | "outline";
}

// figma layer: "goa-Helper-Text" (node 3807:58376)
export interface GoaHelperText3Props {
  className?: string;
  style?: React.CSSProperties;
  helperText?: string;
}

// figma layer: "goa-icon" (node 2065:3022)
export interface GoaIconProps {
  className?: string;
  style?: React.CSSProperties;
  size?: "lg" | "md" | "sm";
  icon?: React.ReactNode;
}

// figma layer: "goa-icon" (node 5022:14598)
export interface GoaIcon11Props {
  className?: string;
  style?: React.CSSProperties;
  size?: "lg" | "md" | "sm" | "xs" | "2xsmall";
  icon?: React.ReactNode;
}

// figma layer: "goa-icon" (node 2531:12892)
export interface GoaIcon2Props {
  className?: string;
  style?: React.CSSProperties;
  size?: "xl" | "lg" | "md" | "sm";
  icon?: React.ReactNode;
}

// figma layer: "goa-icon" (node 3639:67465)
export interface GoaIcon8Props {
  className?: string;
  style?: React.CSSProperties;
  size?: "lg" | "md" | "xs" | "sm" | "2xsmall";
  icon?: React.ReactNode;
}

// figma layer: "goa-icon" (node 3807:58306)
export interface GoaIcon9Props {
  className?: string;
  style?: React.CSSProperties;
  size?: "lg" | "md" | "xs" | "sm" | "2xsmall";
  icon?: React.ReactNode;
}

// figma layer: "goa-Icon-Button" (node 3807:58327)
export interface GoaIconButton4Props {
  className?: string;
  style?: React.CSSProperties;
  state?: "default" | "hover" | "focus & active";
  disabled?: boolean;
  colorVariant?: "default" | "light" | "dark" | "destructive";
  icon?: React.ReactNode;
}

// figma layer: "goa-information-circle" (node 2597:8544)
export interface GoaInformationCircle5Props {
  className?: string;
  style?: React.CSSProperties;
  variant?: "filled" | "outline";
}

// figma layer: "goa-Inline-Error" (node 3807:58378)
export interface GoaInlineError5Props {
  className?: string;
  style?: React.CSSProperties;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "goa-Input-Label" (node 3807:58278)
export interface GoaInputLabel5Props {
  className?: string;
  style?: React.CSSProperties;
  optionalRequired?: "none" | "optional" | "required";
  size?: "default" | "lg" | "heading";
  inputLabel?: string;
  /** Text content; defaults to "(optional)". */
  text1?: string;
}

// figma layer: ".goa-Input-Reveal" (node 3807:56058)
export interface GoaInputReveal6Props {
  className?: string;
  style?: React.CSSProperties;
  swapContent?: React.ReactNode;
}

// figma layer: "goa-Link" (node 4043:33926)
export interface GoaLinkProps {
  className?: string;
  style?: React.CSSProperties;
  size?: "lg" | "md";
  state?: "default" | "hover" | "visited";
  externalIcon?: boolean;
  text?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "goa-open" (node 2531:14227)
export interface GoaOpen3Props {
  className?: string;
  style?: React.CSSProperties;
  variant?: "filled" | "outline";
}

// figma layer: ".goa-Option" (node 3807:59447)
export interface GoaOption3Props {
  className?: string;
  style?: React.CSSProperties;
  selected?: boolean;
  hover?: boolean;
  disabled?: boolean;
  multiSelect?: boolean;
  leadingIcon?: boolean;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "goa-person-circle" (node 2072:12806)
export interface GoaPersonCircle2Props {
  className?: string;
  style?: React.CSSProperties;
  variant?: "filled" | "outline";
}

// figma layer: "goa-person-circle" (node 2597:8788)
export interface GoaPersonCircle5Props {
  className?: string;
  style?: React.CSSProperties;
  variant?: "filled" | "outline";
}

// figma layer: "goa-Radio-Option" (node 3807:58775)
export interface GoaRadioOption4Props {
  className?: string;
  style?: React.CSSProperties;
  state?: "default" | "hover" | "focus";
  selected?: boolean;
  disabled?: boolean;
  error?: boolean;
  text?: string;
  itemHelperText?: boolean;
  subItem?: boolean;
}

// figma layer: "goa-remove" (node 2597:8667)
export interface GoaRemove3Props {
  className?: string;
  style?: React.CSSProperties;
  variant?: "basic";
}

// figma layer: "goa-search" (node 2597:5637)
export interface GoaSearch5Props {
  className?: string;
  style?: React.CSSProperties;
  variant?: "basic";
}

// figma layer: "goa-Selection-Chip" (node 8113:183319)
export interface GoaSelectionChipProps {
  className?: string;
  style?: React.CSSProperties;
  state?: "default" | "hover" | "focused" | "selected";
  icon?: boolean;
  text?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "goa-Side-Menu-Item" (node 5189:18898)
export interface GoaSideMenuItem3Props {
  className?: string;
  style?: React.CSSProperties;
  expandable?: boolean;
  icon?: boolean;
  label?: string;
  state?: "default" | "active" | "hover" | "focus";
  subItem?: boolean;
  badge?: boolean;
  /** Text content; defaults to "Label". */
  text1?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon2?: React.ReactNode;
}

// figma layer: "goa-Spacer" (node 7454:169928)
export interface GoaSpacer7Props {
  className?: string;
  style?: React.CSSProperties;
  space?: "none - 0px - 0rem" | "3xs - 2px - 0.125rem" | "2xs - 4px - 0.25rem" | "xs - 8px - 0.5rem" | "s - 12px - 0.75rem" | "m - 16px - 1rem" | "l - 24px - 1.5rem" | "xl - 32px - 2rem" | "2xl - 48px - 3rem" | "3xl - 64px - 4rem" | "4xl - 128px - 8rem";
  or?: boolean;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon2?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon3?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon4?: React.ReactNode;
}

// figma layer: "goa-Table-Cell-Data" (node 3807:58381)
export interface GoaTableCellData3Props {
  className?: string;
  style?: React.CSSProperties;
  type?: "text" | "number" | "$" | "badge" | "badge and text" | "checkbox" | "radio" | "text input" | "dropdown" | "row checkbox" | "row radio" | "row expand" | "files" | "upload progress" | "icon" | "action" | "empty" | "copy to clipboard";
  size?: "default" | "relaxed";
  greyBG?: boolean;
  icon?: React.ReactNode;
  cellText?: string;
  copyThisText?: string;
  bottomBorder?: boolean;
  cellNumber?: string;
  amount?: string;
  /** Text content; defaults to "$". */
  text1?: string;
  /** Text content; defaults to "(PDF, 1.2 MB)". */
  text2?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "goa-Table-Cell-Heading" (node 3807:55844)
export interface GoaTableCellHeading2Props {
  className?: string;
  style?: React.CSSProperties;
  type?: "text" | "number" | "$" | "badge" | "badge and text" | "checkbox" | "radio" | "text input" | "dropdown" | "row checkbox" | "row radio" | "row expand" | "files" | "upload progress" | "icon" | "action" | "empty" | "copy to clipboard";
  selectAll?: boolean;
  bottomBorder?: boolean;
  columnSort?: boolean;
  heading?: string;
  /** Text content; defaults to "Select All". */
  text1?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "goa-Tabs" (node 5501:65418)
export interface GoaTabs4Props {
  className?: string;
  style?: React.CSSProperties;
  tab?: "all" | "released" | "paid" | "issues";
}

// figma layer: "goa-Text-Field" (node 3807:56061)
export interface GoaTextField6Props {
  className?: string;
  style?: React.CSSProperties;
  leadingIcon?: boolean;
  trailingIconButton?: boolean;
  content?: boolean;
  content2?: string;
  state?: "default" | "hover" | "focus";
  width?: "custom" | "20 characters" | "10 characters" | "7 characters" | "5 characters" | "4 characters" | "3 characters" | "2 characters";
  error?: boolean;
  disabled?: boolean;
  leadingContent?: boolean;
  trailingContent?: boolean;
  helperText?: boolean;
  /** Text content; defaults to "Text". */
  text1?: string;
  /** Text content; defaults to "Text". */
  text2?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon2?: React.ReactNode;
}

// figma layer: "goa-Tooltip" (node 4978:4559)
export interface GoaTooltipProps {
  className?: string;
  style?: React.CSSProperties;
  content?: string;
  position?: "top" | "right" | "bottom" | "left";
  horizontalAlign?: "left" | "center" | "right";
  showPopover?: boolean;
}

// figma layer: "goa-trash" (node 2531:14232)
export interface GoaTrashProps {
  className?: string;
  style?: React.CSSProperties;
  variant?: "filled" | "outline";
}

// figma layer: "goa-warning" (node 2597:5726)
export interface GoaWarning5Props {
  className?: string;
  style?: React.CSSProperties;
  variant?: "filled" | "outline";
}

// figma layer: "Heading, search, and actions" (node 5501:68597)
export interface HeadingSearchAndActionsProps {
  className?: string;
  style?: React.CSSProperties;
  callout?: "false";
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon2?: React.ReactNode;
}

// figma layer: "Helper text" (node 2531:13664)
export interface HelperTextProps {
  className?: string;
  style?: React.CSSProperties;
  helperText?: string;
}

// figma layer: ".Invisible letters" (node 2032:1111)
export interface InvisibleLettersProps {
  className?: string;
  style?: React.CSSProperties;
  number?: "--" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
  letter?: "--" | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z";
  special?: "--" | "+" | "-" | "/" | "＝" | "\"" | "'" | "#" | "(" | ")" | "、" | "." | ":" | "?" | "!" | "\\" | "|" | "[" | "]";
}

// figma layer: "Navigation - Internal" (node 6364:52736)
export interface NavigationInternalProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "pause" (node 8113:178222)
export interface PauseProps {
  className?: string;
  style?: React.CSSProperties;
  variant?: "filled" | "outline";
}

// figma layer: "Payment Details" (node 7852:185192)
export interface PaymentDetails2Props {
  className?: string;
  style?: React.CSSProperties;
  property1?: "default";
  /** Text content; defaults to "Program". */
  text1?: string;
  /** Text content; defaults to "0-35 mos". */
  text2?: string;
  /** Text content; defaults to "36+ mos". */
  text3?: string;
  /** Text content; defaults to "19 mos - 3 yrs, 100+ hrs". */
  text4?: string;
}

// figma layer: "Scroll bar" (node 2597:9015)
export interface ScrollBar3Props {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Selected options" (node 3807:59483)
export interface SelectedOptions3Props {
  className?: string;
  style?: React.CSSProperties;
  chip5?: boolean;
  chip6?: boolean;
  chip7?: boolean;
  chip8?: boolean;
  chip9?: boolean;
  chip2?: boolean;
  chip3?: boolean;
  chip4?: boolean;
  chip1?: boolean;
}

// figma layer: "Side Menu - Affordability Grants" (node 5071:36648)
export interface SideMenuAffordabilityGrantsProps {
  className?: string;
  style?: React.CSSProperties;
  property1?: "collapsed" | "expanded";
}

// figma layer: "Side Menu - Certification" (node 5071:36480)
export interface SideMenuCertificationProps {
  className?: string;
  style?: React.CSSProperties;
  property1?: "collapsed" | "expanded";
}

// figma layer: "Side Menu - Licensing" (node 5071:36643)
export interface SideMenuLicensingProps {
  className?: string;
  style?: React.CSSProperties;
  property1?: "collapsed" | "expanded";
}

// figma layer: "Side Menu - Space Creation" (node 5071:36653)
export interface SideMenuSpaceCreationProps {
  className?: string;
  style?: React.CSSProperties;
  property1?: "collapsed";
}

// figma layer: "Side Menu - Sub-Item" (node 5071:36626)
export interface SideMenuSubItemProps {
  className?: string;
  style?: React.CSSProperties;
  active?: boolean;
  hasTitle?: boolean;
  /** Text content; defaults to "Personal Information". */
  text1?: string;
}

// figma layer: "Side Menu - Subsidy" (node 5071:36693)
export interface SideMenuSubsidyProps {
  className?: string;
  style?: React.CSSProperties;
  property1?: "collapsed" | "expanded";
}

// figma layer: "Status" (node 6012:72900)
export interface StatusProps {
  className?: string;
  style?: React.CSSProperties;
  status?: "review" | "ready for release" | "released" | "paid" | "hold";
  /** Text content; defaults to "Claim ID: 123456789". */
  text1?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

declare const AlbertaLogo3: React.FC<AlbertaLogo3Props>;
declare const CLCalloutFlags: React.FC<CLCalloutFlagsProps>;
declare const CLHeader: React.FC<CLHeaderProps>;
declare const CLKPIs: React.FC<CLKPIsProps>;
declare const ChevronDown2: React.FC<ChevronDown2Props>;
declare const ChevronRight: React.FC<ChevronRightProps>;
declare const ChipHold: React.FC<ChipHoldProps>;
declare const ChipReview: React.FC<ChipReviewProps>;
declare const ChipWatchlist: React.FC<ChipWatchlistProps>;
declare const Copy2: React.FC<Copy2Props>;
declare const Copy4: React.FC<Copy4Props>;
declare const DropdownOptionList3: React.FC<DropdownOptionList3Props>;
declare const ExpandIcon5: React.FC<ExpandIcon5Props>;
declare const FilterChip3: React.FC<FilterChip3Props>;
declare const Findability2: React.FC<Findability2Props>;
declare const GoaAdd3: React.FC<GoaAdd3Props>;
declare const GoaAlertCircle4: React.FC<GoaAlertCircle4Props>;
declare const GoaArrowForward2: React.FC<GoaArrowForward2Props>;
declare const GoaBadge6: React.FC<GoaBadge6Props>;
declare const GoaBadge7: React.FC<GoaBadge7Props>;
declare const GoaButton: React.FC<GoaButtonProps>;
declare const GoaCalendar3: React.FC<GoaCalendar3Props>;
declare const GoaCallout: React.FC<GoaCalloutProps>;
declare const GoaCaretDown: React.FC<GoaCaretDownProps>;
declare const GoaCaretUp: React.FC<GoaCaretUpProps>;
declare const GoaCheckbox6: React.FC<GoaCheckbox6Props>;
declare const GoaCheckmark3: React.FC<GoaCheckmark3Props>;
declare const GoaCheckmark4: React.FC<GoaCheckmark4Props>;
declare const GoaCheckmark5: React.FC<GoaCheckmark5Props>;
declare const GoaCheckmarkCircle3: React.FC<GoaCheckmarkCircle3Props>;
declare const GoaCheckmarkCircle4: React.FC<GoaCheckmarkCircle4Props>;
declare const GoaChevronBack2: React.FC<GoaChevronBack2Props>;
declare const GoaChevronDown2: React.FC<GoaChevronDown2Props>;
declare const GoaChevronForward3: React.FC<GoaChevronForward3Props>;
declare const GoaClose4: React.FC<GoaClose4Props>;
declare const GoaCloseCircle: React.FC<GoaCloseCircleProps>;
declare const GoaColumnSort: React.FC<GoaColumnSortProps>;
declare const GoaColumnSort2: React.FC<GoaColumnSort2Props>;
declare const GoaDivider4: React.FC<GoaDivider4Props>;
declare const GoaDropdown5: React.FC<GoaDropdown5Props>;
declare const GoaEye: React.FC<GoaEyeProps>;
declare const GoaHelperText3: React.FC<GoaHelperText3Props>;
declare const GoaIcon: React.FC<GoaIconProps>;
declare const GoaIcon11: React.FC<GoaIcon11Props>;
declare const GoaIcon2: React.FC<GoaIcon2Props>;
declare const GoaIcon8: React.FC<GoaIcon8Props>;
declare const GoaIcon9: React.FC<GoaIcon9Props>;
declare const GoaIconButton4: React.FC<GoaIconButton4Props>;
declare const GoaInformationCircle5: React.FC<GoaInformationCircle5Props>;
declare const GoaInlineError5: React.FC<GoaInlineError5Props>;
declare const GoaInputLabel5: React.FC<GoaInputLabel5Props>;
declare const GoaInputReveal6: React.FC<GoaInputReveal6Props>;
declare const GoaLink: React.FC<GoaLinkProps>;
declare const GoaOpen3: React.FC<GoaOpen3Props>;
declare const GoaOption3: React.FC<GoaOption3Props>;
declare const GoaPersonCircle2: React.FC<GoaPersonCircle2Props>;
declare const GoaPersonCircle5: React.FC<GoaPersonCircle5Props>;
declare const GoaRadioOption4: React.FC<GoaRadioOption4Props>;
declare const GoaRemove3: React.FC<GoaRemove3Props>;
declare const GoaSearch5: React.FC<GoaSearch5Props>;
declare const GoaSelectionChip: React.FC<GoaSelectionChipProps>;
declare const GoaSideMenuItem3: React.FC<GoaSideMenuItem3Props>;
declare const GoaSpacer7: React.FC<GoaSpacer7Props>;
declare const GoaTableCellData3: React.FC<GoaTableCellData3Props>;
declare const GoaTableCellHeading2: React.FC<GoaTableCellHeading2Props>;
declare const GoaTabs4: React.FC<GoaTabs4Props>;
declare const GoaTextField6: React.FC<GoaTextField6Props>;
declare const GoaTooltip: React.FC<GoaTooltipProps>;
declare const GoaTrash: React.FC<GoaTrashProps>;
declare const GoaWarning5: React.FC<GoaWarning5Props>;
declare const HeadingSearchAndActions: React.FC<HeadingSearchAndActionsProps>;
declare const HelperText: React.FC<HelperTextProps>;
declare const InvisibleLetters: React.FC<InvisibleLettersProps>;
declare const NavigationInternal: React.FC<NavigationInternalProps>;
declare const Pause: React.FC<PauseProps>;
declare const PaymentDetails2: React.FC<PaymentDetails2Props>;
declare const ScrollBar3: React.FC<ScrollBar3Props>;
declare const SelectedOptions3: React.FC<SelectedOptions3Props>;
declare const SideMenuAffordabilityGrants: React.FC<SideMenuAffordabilityGrantsProps>;
declare const SideMenuCertification: React.FC<SideMenuCertificationProps>;
declare const SideMenuLicensing: React.FC<SideMenuLicensingProps>;
declare const SideMenuSpaceCreation: React.FC<SideMenuSpaceCreationProps>;
declare const SideMenuSubItem: React.FC<SideMenuSubItemProps>;
declare const SideMenuSubsidy: React.FC<SideMenuSubsidyProps>;
declare const Status: React.FC<StatusProps>;
declare global {
  interface Window {
    AlbertaLogo3: React.FC<AlbertaLogo3Props>;
    CLCalloutFlags: React.FC<CLCalloutFlagsProps>;
    CLHeader: React.FC<CLHeaderProps>;
    CLKPIs: React.FC<CLKPIsProps>;
    ChevronDown2: React.FC<ChevronDown2Props>;
    ChevronRight: React.FC<ChevronRightProps>;
    ChipHold: React.FC<ChipHoldProps>;
    ChipReview: React.FC<ChipReviewProps>;
    ChipWatchlist: React.FC<ChipWatchlistProps>;
    Copy2: React.FC<Copy2Props>;
    Copy4: React.FC<Copy4Props>;
    DropdownOptionList3: React.FC<DropdownOptionList3Props>;
    ExpandIcon5: React.FC<ExpandIcon5Props>;
    FilterChip3: React.FC<FilterChip3Props>;
    Findability2: React.FC<Findability2Props>;
    GoaAdd3: React.FC<GoaAdd3Props>;
    GoaAlertCircle4: React.FC<GoaAlertCircle4Props>;
    GoaArrowForward2: React.FC<GoaArrowForward2Props>;
    GoaBadge6: React.FC<GoaBadge6Props>;
    GoaBadge7: React.FC<GoaBadge7Props>;
    GoaButton: React.FC<GoaButtonProps>;
    GoaCalendar3: React.FC<GoaCalendar3Props>;
    GoaCallout: React.FC<GoaCalloutProps>;
    GoaCaretDown: React.FC<GoaCaretDownProps>;
    GoaCaretUp: React.FC<GoaCaretUpProps>;
    GoaCheckbox6: React.FC<GoaCheckbox6Props>;
    GoaCheckmark3: React.FC<GoaCheckmark3Props>;
    GoaCheckmark4: React.FC<GoaCheckmark4Props>;
    GoaCheckmark5: React.FC<GoaCheckmark5Props>;
    GoaCheckmarkCircle3: React.FC<GoaCheckmarkCircle3Props>;
    GoaCheckmarkCircle4: React.FC<GoaCheckmarkCircle4Props>;
    GoaChevronBack2: React.FC<GoaChevronBack2Props>;
    GoaChevronDown2: React.FC<GoaChevronDown2Props>;
    GoaChevronForward3: React.FC<GoaChevronForward3Props>;
    GoaClose4: React.FC<GoaClose4Props>;
    GoaCloseCircle: React.FC<GoaCloseCircleProps>;
    GoaColumnSort: React.FC<GoaColumnSortProps>;
    GoaColumnSort2: React.FC<GoaColumnSort2Props>;
    GoaDivider4: React.FC<GoaDivider4Props>;
    GoaDropdown5: React.FC<GoaDropdown5Props>;
    GoaEye: React.FC<GoaEyeProps>;
    GoaHelperText3: React.FC<GoaHelperText3Props>;
    GoaIcon: React.FC<GoaIconProps>;
    GoaIcon11: React.FC<GoaIcon11Props>;
    GoaIcon2: React.FC<GoaIcon2Props>;
    GoaIcon8: React.FC<GoaIcon8Props>;
    GoaIcon9: React.FC<GoaIcon9Props>;
    GoaIconButton4: React.FC<GoaIconButton4Props>;
    GoaInformationCircle5: React.FC<GoaInformationCircle5Props>;
    GoaInlineError5: React.FC<GoaInlineError5Props>;
    GoaInputLabel5: React.FC<GoaInputLabel5Props>;
    GoaInputReveal6: React.FC<GoaInputReveal6Props>;
    GoaLink: React.FC<GoaLinkProps>;
    GoaOpen3: React.FC<GoaOpen3Props>;
    GoaOption3: React.FC<GoaOption3Props>;
    GoaPersonCircle2: React.FC<GoaPersonCircle2Props>;
    GoaPersonCircle5: React.FC<GoaPersonCircle5Props>;
    GoaRadioOption4: React.FC<GoaRadioOption4Props>;
    GoaRemove3: React.FC<GoaRemove3Props>;
    GoaSearch5: React.FC<GoaSearch5Props>;
    GoaSelectionChip: React.FC<GoaSelectionChipProps>;
    GoaSideMenuItem3: React.FC<GoaSideMenuItem3Props>;
    GoaSpacer7: React.FC<GoaSpacer7Props>;
    GoaTableCellData3: React.FC<GoaTableCellData3Props>;
    GoaTableCellHeading2: React.FC<GoaTableCellHeading2Props>;
    GoaTabs4: React.FC<GoaTabs4Props>;
    GoaTextField6: React.FC<GoaTextField6Props>;
    GoaTooltip: React.FC<GoaTooltipProps>;
    GoaTrash: React.FC<GoaTrashProps>;
    GoaWarning5: React.FC<GoaWarning5Props>;
    HeadingSearchAndActions: React.FC<HeadingSearchAndActionsProps>;
    HelperText: React.FC<HelperTextProps>;
    InvisibleLetters: React.FC<InvisibleLettersProps>;
    NavigationInternal: React.FC<NavigationInternalProps>;
    Pause: React.FC<PauseProps>;
    PaymentDetails2: React.FC<PaymentDetails2Props>;
    ScrollBar3: React.FC<ScrollBar3Props>;
    SelectedOptions3: React.FC<SelectedOptions3Props>;
    SideMenuAffordabilityGrants: React.FC<SideMenuAffordabilityGrantsProps>;
    SideMenuCertification: React.FC<SideMenuCertificationProps>;
    SideMenuLicensing: React.FC<SideMenuLicensingProps>;
    SideMenuSpaceCreation: React.FC<SideMenuSpaceCreationProps>;
    SideMenuSubItem: React.FC<SideMenuSubItemProps>;
    SideMenuSubsidy: React.FC<SideMenuSubsidyProps>;
    Status: React.FC<StatusProps>;
  }
}
