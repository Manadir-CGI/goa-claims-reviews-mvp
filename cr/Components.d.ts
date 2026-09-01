// Components.d.ts — the complete catalog of the 93 component(s) in
// Components.bundle.js. READ THIS FILE BEFORE USING THE BUNDLE: component
// names are derived from Figma layer names (sanitized to PascalCase,
// deduplicated) and may differ from what the design calls them — the
// "figma layer" comment above each interface maps them back.
// After the bundle <script> loads, every component is a window global
// (e.g. window.AccordionAffordability) and usable directly in JSX.
import * as React from 'react';

// figma layer: "Accordion-Affordability" (node 6017:38429)
export interface AccordionAffordabilityProps {
  className?: string;
  style?: React.CSSProperties;
  expand?: boolean;
  review?: boolean;
  /** Text content; defaults to "Affordability Grant". */
  text1?: string;
  /** Text content; defaults to "$1,856.00". */
  text2?: string;
  /** Text content; defaults to "$1,856.00". */
  text3?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon2?: React.ReactNode;
}

// figma layer: "Accordion-Inclusive Child Care" (node 6017:38484)
export interface AccordionInclusiveChildCareProps {
  className?: string;
  style?: React.CSSProperties;
  expand?: boolean;
  /** Text content; defaults to "Inclusive Child Care". */
  text1?: string;
  /** Text content; defaults to "Ready for release". */
  text2?: string;
  /** Text content; defaults to "$567.56". */
  text3?: string;
  /** Text content; defaults to "Staff Details". */
  text4?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "Accordion-Subsidy" (node 6017:38371)
export interface AccordionSubsidyProps {
  className?: string;
  style?: React.CSSProperties;
  expand?: boolean;
  /** Text content; defaults to "Subsidy". */
  text1?: string;
  /** Text content; defaults to "Ready for release". */
  text2?: string;
  /** Text content; defaults to "$1,356.00". */
  text3?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "Accordion-WTU" (node 6017:38539)
export interface AccordionWTUProps {
  className?: string;
  style?: React.CSSProperties;
  expand?: boolean;
  /** Text content; defaults to "Wage Top-Up". */
  text1?: string;
  /** Text content; defaults to "$2,123.00". */
  text2?: string;
  /** Text content; defaults to "Educator hours". */
  text3?: string;
  /** Text content; defaults to "Brown Isabella". */
  text4?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon2?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon3?: React.ReactNode;
}

// figma layer: "Breadcrumb" (node 5022:11227)
export interface BreadcrumbProps {
  className?: string;
  style?: React.CSSProperties;
  property1?: "default" | "3 links";
  /** Text content; defaults to "Claims submission". */
  text1?: string;
  /** Text content; defaults to "New claims". */
  text2?: string;
  /** Text content; defaults to "New claims". */
  text3?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon2?: React.ReactNode;
}

// figma layer: "CL-Accordion" (node 6017:38816)
export interface CLAccordionProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "CL - KPIs/False" (node 5501:66171)
export interface CLKPIsFalseProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Claim period". */
  text1?: string;
  /** Text content; defaults to "Aug 2024". */
  text2?: string;
  /** Text content; defaults to "Received". */
  text3?: string;
  /** Text content; defaults to "Sep 1, 2024". */
  text4?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
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

// figma layer: "Chips - Selected options" (node 5022:16324)
export interface ChipsSelectedOptionsProps {
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

// figma layer: "Claim Header" (node 5022:10855)
export interface ClaimHeaderProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "ABC Pre-school and Daycare : 80003345". */
  text1?: string;
  /** Text content; defaults to "Claim ID: 234904". */
  text2?: string;
}

// figma layer: "Comment Pin" (node 6133:123089)
export interface CommentPinProps {
  className?: string;
  style?: React.CSSProperties;
  pinned?: "true" | "false" | "transition" | "transition 2";
  /** Text content; defaults to "Pinned". */
  text1?: string;
}

// figma layer: "Commenting/New message" (node 6032:56254)
export interface CommentingNewMessageProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Comments". */
  text1?: string;
  /** Text content; defaults to "Dion Alexander". */
  text2?: string;
  /** Text content; defaults to "Sep 18, 2024, 11:40 AM". */
  text3?: string;
  /** Text content; defaults to "What’s a CCIS user’s favourite gym exercise? Jumping through hoops. ". */
  text4?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon2?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon3?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon4?: React.ReactNode;
}

// figma layer: "Content - Affordability - Graph" (node 7224:156834)
export interface ContentAffordabilityGraphProps {
  className?: string;
  style?: React.CSSProperties;
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

// figma layer: "Data Vis - Charts" (node 7510:179007)
export interface DataVisChartsProps {
  className?: string;
  style?: React.CSSProperties;
  type?: "qa" | "icc" | "affordability" | "fdh";
  /** Text content; defaults to "Payment/Advance Amounts". */
  text1?: string;
  /** Text content; defaults to "Staff/Child Capacity". */
  text2?: string;
  /** Text content; defaults to "$9,000". */
  text3?: string;
  /** Text content; defaults to "$7,500". */
  text4?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon2?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon3?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon4?: React.ReactNode;
}

// figma layer: ".Dropdown option list" (node 3807:59390)
export interface DropdownOptionList3Props {
  className?: string;
  style?: React.CSSProperties;
  multiSelect?: boolean;
  ofItems?: "6" | "5" | "4" | "3" | "2" | "1";
  scrollBar?: boolean;
}

// figma layer: "Dropdown option list" (node 5022:16265)
export interface DropdownOptionList5Props {
  className?: string;
  style?: React.CSSProperties;
  multiSelect?: boolean;
  ofItems?: "6" | "5" | "4" | "3" | "2" | "1";
  scrollBar?: boolean;
}

// figma layer: ".Error message content examples" (node 5022:14721)
export interface ErrorMessageContentExamples3Props {
  className?: string;
  style?: React.CSSProperties;
  ofCharacters?: string;
  invalidCharacters?: string;
  errorType?: "none" | "empty input" | "format" | "date input" | "value range" | "outside values" | "file type" | "too large" | "upload error" | "no file selected" | "invalid characters" | "# of characters";
  outsideValues?: string;
  errorMessage?: string;
  fileType?: string;
  tooLarge?: string;
  uploadError?: string;
  valueRange?: string;
  emptyInput?: string;
  dateInput?: string;
  noFileSelected?: string;
  inlineError?: string;
}

// figma layer: ".Expand table row" (node 3982:57050)
export interface ExpandTableRow2Props {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Subheading". */
  text1?: string;
  /** Text content; defaults to "Text". */
  text2?: string;
  /** Text content; defaults to "Subheading". */
  text3?: string;
  /** Text content; defaults to "Text". */
  text4?: string;
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

// figma layer: ".Filter-chip" (node 5022:16334)
export interface FilterChip5Props {
  className?: string;
  style?: React.CSSProperties;
  state?: "default" | "hover" | "focus";
  content?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
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

// figma layer: "goa-Checkbox" (node 5022:12229)
export interface GoaCheckbox8Props {
  className?: string;
  style?: React.CSSProperties;
  state?: "default" | "hover" | "focus";
  selected?: boolean;
  disabled?: boolean;
  indeterminateNotYetAvailableIn?: boolean;
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

// figma layer: "goa-chevron-down" (node 5799:96654)
export interface GoaChevronDown5Props {
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

// figma layer: "goa-Divider" (node 2531:10029)
export interface GoaDividerProps {
  className?: string;
  style?: React.CSSProperties;
  colour?: "dark" | "light";
}

// figma layer: "goa-Divider" (node 5071:36710)
export interface GoaDivider3Props {
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

// figma layer: "goa-Dropdown" (node 5022:15758)
export interface GoaDropdown7Props {
  className?: string;
  style?: React.CSSProperties;
  open?: boolean;
  inputState?: "default" | "hover" | "focus";
  error?: boolean;
  disable?: boolean;
  filterable?: boolean;
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

// figma layer: "goa-Helper-Text" (node 5022:14716)
export interface GoaHelperText5Props {
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

// figma layer: "goa-Icon-Button" (node 5022:14619)
export interface GoaIconButton6Props {
  className?: string;
  style?: React.CSSProperties;
  state?: "default" | "hover" | "focus & active";
  disabled?: boolean;
  colorVariant?: "default" | "light" | "dark" | "destructive";
  size?: "md" | "lg";
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

// figma layer: "goa-Inline-Error" (node 5022:14718)
export interface GoaInlineError7Props {
  className?: string;
  style?: React.CSSProperties;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "goa-Input" (node 5022:12362)
export interface GoaInput2Props {
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

// figma layer: "goa-Input-Label" (node 5022:14579)
export interface GoaInputLabel7Props {
  className?: string;
  style?: React.CSSProperties;
  optionalRequired?: "none" | "optional" | "required";
  size?: "default" | "large/heading";
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

// figma layer: ".goa-Input-Reveal" (node 5022:12359)
export interface GoaInputReveal8Props {
  className?: string;
  style?: React.CSSProperties;
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

// figma layer: ".goa-Option" (node 5022:12193)
export interface GoaOption5Props {
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

// figma layer: "goa-Radio-Option" (node 5022:15662)
export interface GoaRadioOption5Props {
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

// figma layer: "goa-Spacer" (node 5022:10874)
export interface GoaSpacer5Props {
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

// figma layer: "goa-Table-Cell-Data" (node 5022:15239)
export interface GoaTableCellData5Props {
  className?: string;
  style?: React.CSSProperties;
  type?: "text" | "number" | "$" | "badge/status" | "badge and text" | "icon" | "icon and text" | "checkbox" | "dropdown" | "text input" | "radio" | "row select" | "row radio" | "row expand" | "files" | "upload progress" | "action" | "empty" | "copy to clipboard" | "status" | "error";
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

// figma layer: "goa-Table-Cell-Heading" (node 5022:16352)
export interface GoaTableCellHeading5Props {
  className?: string;
  style?: React.CSSProperties;
  type?: "text" | "number" | "$" | "badge/status" | "badge and text" | "checkbox" | "radio" | "text input" | "dropdown" | "row select" | "row radio" | "row expand" | "files" | "upload progress" | "icon" | "icon and text" | "action" | "empty" | "copy to clipboard" | "error";
  selectAll?: boolean;
  bottomBorder?: boolean;
  columnSort?: boolean;
  heading?: string;
  /** Text content; defaults to "Select All". */
  text1?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
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

// figma layer: "pause" (node 8113:178222)
export interface PauseProps {
  className?: string;
  style?: React.CSSProperties;
  variant?: "filled" | "outline";
}

// figma layer: "Scroll bar" (node 2597:9015)
export interface ScrollBar3Props {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Scroll bar" (node 5022:16322)
export interface ScrollBar6Props {
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

// figma layer: "Spacing" (node 2032:1374)
export interface SpacingProps {
  className?: string;
  style?: React.CSSProperties;
  space?: "3xs - 2px - 0.125rem" | "2xs - 4px - 0.25rem" | "xs - 8px - 0.5rem" | "s - 12px - 0.75rem" | "m - 16px - 1rem" | "l - 24px - 1.5rem" | "xl - 32px - 2rem" | "2xl - 48px - 3rem" | "3xl - 64px - 4rem" | "4xl - 128px - 8rem";
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

// figma layer: "Spacing" (node 2531:9723)
export interface Spacing3Props {
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

declare const AccordionAffordability: React.FC<AccordionAffordabilityProps>;
declare const AccordionInclusiveChildCare: React.FC<AccordionInclusiveChildCareProps>;
declare const AccordionSubsidy: React.FC<AccordionSubsidyProps>;
declare const AccordionWTU: React.FC<AccordionWTUProps>;
declare const Breadcrumb: React.FC<BreadcrumbProps>;
declare const CLAccordion: React.FC<CLAccordionProps>;
declare const CLKPIsFalse: React.FC<CLKPIsFalseProps>;
declare const ChipHold: React.FC<ChipHoldProps>;
declare const ChipReview: React.FC<ChipReviewProps>;
declare const ChipWatchlist: React.FC<ChipWatchlistProps>;
declare const ChipsSelectedOptions: React.FC<ChipsSelectedOptionsProps>;
declare const ClaimHeader: React.FC<ClaimHeaderProps>;
declare const CommentPin: React.FC<CommentPinProps>;
declare const CommentingNewMessage: React.FC<CommentingNewMessageProps>;
declare const ContentAffordabilityGraph: React.FC<ContentAffordabilityGraphProps>;
declare const Copy2: React.FC<Copy2Props>;
declare const Copy4: React.FC<Copy4Props>;
declare const DataVisCharts: React.FC<DataVisChartsProps>;
declare const DropdownOptionList3: React.FC<DropdownOptionList3Props>;
declare const DropdownOptionList5: React.FC<DropdownOptionList5Props>;
declare const ErrorMessageContentExamples3: React.FC<ErrorMessageContentExamples3Props>;
declare const ExpandTableRow2: React.FC<ExpandTableRow2Props>;
declare const FilterChip3: React.FC<FilterChip3Props>;
declare const FilterChip5: React.FC<FilterChip5Props>;
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
declare const GoaCheckbox8: React.FC<GoaCheckbox8Props>;
declare const GoaCheckmark3: React.FC<GoaCheckmark3Props>;
declare const GoaCheckmark4: React.FC<GoaCheckmark4Props>;
declare const GoaCheckmark5: React.FC<GoaCheckmark5Props>;
declare const GoaCheckmarkCircle3: React.FC<GoaCheckmarkCircle3Props>;
declare const GoaCheckmarkCircle4: React.FC<GoaCheckmarkCircle4Props>;
declare const GoaChevronDown5: React.FC<GoaChevronDown5Props>;
declare const GoaChevronForward3: React.FC<GoaChevronForward3Props>;
declare const GoaClose4: React.FC<GoaClose4Props>;
declare const GoaCloseCircle: React.FC<GoaCloseCircleProps>;
declare const GoaColumnSort: React.FC<GoaColumnSortProps>;
declare const GoaColumnSort2: React.FC<GoaColumnSort2Props>;
declare const GoaDivider: React.FC<GoaDividerProps>;
declare const GoaDivider3: React.FC<GoaDivider3Props>;
declare const GoaDropdown5: React.FC<GoaDropdown5Props>;
declare const GoaDropdown7: React.FC<GoaDropdown7Props>;
declare const GoaEye: React.FC<GoaEyeProps>;
declare const GoaHelperText3: React.FC<GoaHelperText3Props>;
declare const GoaHelperText5: React.FC<GoaHelperText5Props>;
declare const GoaIcon: React.FC<GoaIconProps>;
declare const GoaIcon11: React.FC<GoaIcon11Props>;
declare const GoaIcon2: React.FC<GoaIcon2Props>;
declare const GoaIcon9: React.FC<GoaIcon9Props>;
declare const GoaIconButton4: React.FC<GoaIconButton4Props>;
declare const GoaIconButton6: React.FC<GoaIconButton6Props>;
declare const GoaInformationCircle5: React.FC<GoaInformationCircle5Props>;
declare const GoaInlineError5: React.FC<GoaInlineError5Props>;
declare const GoaInlineError7: React.FC<GoaInlineError7Props>;
declare const GoaInput2: React.FC<GoaInput2Props>;
declare const GoaInputLabel5: React.FC<GoaInputLabel5Props>;
declare const GoaInputLabel7: React.FC<GoaInputLabel7Props>;
declare const GoaInputReveal6: React.FC<GoaInputReveal6Props>;
declare const GoaInputReveal8: React.FC<GoaInputReveal8Props>;
declare const GoaOpen3: React.FC<GoaOpen3Props>;
declare const GoaOption3: React.FC<GoaOption3Props>;
declare const GoaOption5: React.FC<GoaOption5Props>;
declare const GoaPersonCircle5: React.FC<GoaPersonCircle5Props>;
declare const GoaRadioOption4: React.FC<GoaRadioOption4Props>;
declare const GoaRadioOption5: React.FC<GoaRadioOption5Props>;
declare const GoaRemove3: React.FC<GoaRemove3Props>;
declare const GoaSearch5: React.FC<GoaSearch5Props>;
declare const GoaSelectionChip: React.FC<GoaSelectionChipProps>;
declare const GoaSpacer5: React.FC<GoaSpacer5Props>;
declare const GoaTableCellData3: React.FC<GoaTableCellData3Props>;
declare const GoaTableCellData5: React.FC<GoaTableCellData5Props>;
declare const GoaTableCellHeading2: React.FC<GoaTableCellHeading2Props>;
declare const GoaTableCellHeading5: React.FC<GoaTableCellHeading5Props>;
declare const GoaTextField6: React.FC<GoaTextField6Props>;
declare const GoaTrash: React.FC<GoaTrashProps>;
declare const GoaWarning5: React.FC<GoaWarning5Props>;
declare const HelperText: React.FC<HelperTextProps>;
declare const InvisibleLetters: React.FC<InvisibleLettersProps>;
declare const Pause: React.FC<PauseProps>;
declare const ScrollBar3: React.FC<ScrollBar3Props>;
declare const ScrollBar6: React.FC<ScrollBar6Props>;
declare const SelectedOptions3: React.FC<SelectedOptions3Props>;
declare const Spacing: React.FC<SpacingProps>;
declare const Spacing3: React.FC<Spacing3Props>;
declare global {
  interface Window {
    AccordionAffordability: React.FC<AccordionAffordabilityProps>;
    AccordionInclusiveChildCare: React.FC<AccordionInclusiveChildCareProps>;
    AccordionSubsidy: React.FC<AccordionSubsidyProps>;
    AccordionWTU: React.FC<AccordionWTUProps>;
    Breadcrumb: React.FC<BreadcrumbProps>;
    CLAccordion: React.FC<CLAccordionProps>;
    CLKPIsFalse: React.FC<CLKPIsFalseProps>;
    ChipHold: React.FC<ChipHoldProps>;
    ChipReview: React.FC<ChipReviewProps>;
    ChipWatchlist: React.FC<ChipWatchlistProps>;
    ChipsSelectedOptions: React.FC<ChipsSelectedOptionsProps>;
    ClaimHeader: React.FC<ClaimHeaderProps>;
    CommentPin: React.FC<CommentPinProps>;
    CommentingNewMessage: React.FC<CommentingNewMessageProps>;
    ContentAffordabilityGraph: React.FC<ContentAffordabilityGraphProps>;
    Copy2: React.FC<Copy2Props>;
    Copy4: React.FC<Copy4Props>;
    DataVisCharts: React.FC<DataVisChartsProps>;
    DropdownOptionList3: React.FC<DropdownOptionList3Props>;
    DropdownOptionList5: React.FC<DropdownOptionList5Props>;
    ErrorMessageContentExamples3: React.FC<ErrorMessageContentExamples3Props>;
    ExpandTableRow2: React.FC<ExpandTableRow2Props>;
    FilterChip3: React.FC<FilterChip3Props>;
    FilterChip5: React.FC<FilterChip5Props>;
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
    GoaCheckbox8: React.FC<GoaCheckbox8Props>;
    GoaCheckmark3: React.FC<GoaCheckmark3Props>;
    GoaCheckmark4: React.FC<GoaCheckmark4Props>;
    GoaCheckmark5: React.FC<GoaCheckmark5Props>;
    GoaCheckmarkCircle3: React.FC<GoaCheckmarkCircle3Props>;
    GoaCheckmarkCircle4: React.FC<GoaCheckmarkCircle4Props>;
    GoaChevronDown5: React.FC<GoaChevronDown5Props>;
    GoaChevronForward3: React.FC<GoaChevronForward3Props>;
    GoaClose4: React.FC<GoaClose4Props>;
    GoaCloseCircle: React.FC<GoaCloseCircleProps>;
    GoaColumnSort: React.FC<GoaColumnSortProps>;
    GoaColumnSort2: React.FC<GoaColumnSort2Props>;
    GoaDivider: React.FC<GoaDividerProps>;
    GoaDivider3: React.FC<GoaDivider3Props>;
    GoaDropdown5: React.FC<GoaDropdown5Props>;
    GoaDropdown7: React.FC<GoaDropdown7Props>;
    GoaEye: React.FC<GoaEyeProps>;
    GoaHelperText3: React.FC<GoaHelperText3Props>;
    GoaHelperText5: React.FC<GoaHelperText5Props>;
    GoaIcon: React.FC<GoaIconProps>;
    GoaIcon11: React.FC<GoaIcon11Props>;
    GoaIcon2: React.FC<GoaIcon2Props>;
    GoaIcon9: React.FC<GoaIcon9Props>;
    GoaIconButton4: React.FC<GoaIconButton4Props>;
    GoaIconButton6: React.FC<GoaIconButton6Props>;
    GoaInformationCircle5: React.FC<GoaInformationCircle5Props>;
    GoaInlineError5: React.FC<GoaInlineError5Props>;
    GoaInlineError7: React.FC<GoaInlineError7Props>;
    GoaInput2: React.FC<GoaInput2Props>;
    GoaInputLabel5: React.FC<GoaInputLabel5Props>;
    GoaInputLabel7: React.FC<GoaInputLabel7Props>;
    GoaInputReveal6: React.FC<GoaInputReveal6Props>;
    GoaInputReveal8: React.FC<GoaInputReveal8Props>;
    GoaOpen3: React.FC<GoaOpen3Props>;
    GoaOption3: React.FC<GoaOption3Props>;
    GoaOption5: React.FC<GoaOption5Props>;
    GoaPersonCircle5: React.FC<GoaPersonCircle5Props>;
    GoaRadioOption4: React.FC<GoaRadioOption4Props>;
    GoaRadioOption5: React.FC<GoaRadioOption5Props>;
    GoaRemove3: React.FC<GoaRemove3Props>;
    GoaSearch5: React.FC<GoaSearch5Props>;
    GoaSelectionChip: React.FC<GoaSelectionChipProps>;
    GoaSpacer5: React.FC<GoaSpacer5Props>;
    GoaTableCellData3: React.FC<GoaTableCellData3Props>;
    GoaTableCellData5: React.FC<GoaTableCellData5Props>;
    GoaTableCellHeading2: React.FC<GoaTableCellHeading2Props>;
    GoaTableCellHeading5: React.FC<GoaTableCellHeading5Props>;
    GoaTextField6: React.FC<GoaTextField6Props>;
    GoaTrash: React.FC<GoaTrashProps>;
    GoaWarning5: React.FC<GoaWarning5Props>;
    HelperText: React.FC<HelperTextProps>;
    InvisibleLetters: React.FC<InvisibleLettersProps>;
    Pause: React.FC<PauseProps>;
    ScrollBar3: React.FC<ScrollBar3Props>;
    ScrollBar6: React.FC<ScrollBar6Props>;
    SelectedOptions3: React.FC<SelectedOptions3Props>;
    Spacing: React.FC<SpacingProps>;
    Spacing3: React.FC<Spacing3Props>;
  }
}
