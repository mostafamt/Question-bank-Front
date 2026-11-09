import { useMediaQuery } from "@mui/material";

/**
 * Device classes used by the responsive Book Author / Reader layout.
 * Keep in sync with src/styles/_breakpoints.scss.
 *
 * - phone:   < 600px  (MUI `sm`)
 * - tablet:  600–1023px
 * - desktop: ≥ 1024px (custom: iPad landscape gets the desktop layout)
 */
export const BREAKPOINTS = {
  PHONE_MAX: 599.98,
  DESKTOP_MIN: 1024,
};

/**
 * @returns {{ isPhone: boolean, isTablet: boolean, isDesktop: boolean }}
 */
const useBreakpoint = () => {
  const isPhone = useMediaQuery(`(max-width:${BREAKPOINTS.PHONE_MAX}px)`);
  const isDesktop = useMediaQuery(`(min-width:${BREAKPOINTS.DESKTOP_MIN}px)`);

  return {
    isPhone,
    isTablet: !isPhone && !isDesktop,
    isDesktop,
  };
};

export default useBreakpoint;
