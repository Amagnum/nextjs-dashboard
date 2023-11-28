export type BannerADType =
  | "popup"
  | "redirect-interanlly"
  | "redirect-external";
export type BannerApps = "ALL" | "EXTENSION" | "MOBILE";

export type BannerAD = {
  // To uniquely identify the Banner AD
  id: string;

  // Image to be shown on the Home Page
  // Ideally 640x144px (Width x Hight)
  image_url: string;

  // CTA URL
  redirect_url: string;

  // Banner type 'popup' | 'redirect-interanlly' | 'redirect-external'
  banner_type: BannerADType;

  // For popup banner title, if no image is given this
  // will be default shown on home page
  title: string;

  // For popup banner description
  description: string;

  // Start Date when the extension show the banner
  start_date: string;

  // End date to automatically stop showing the banner
  end_date: string;

  // Show Banner only on mobile/extension/all
  visibleOn: BannerApps;

  position_id: "leap_wallet_home";

  display_position?: number;

  /*
   * Mobile-specific settings
   * If custom details are not provided, then the default values from the
   * the main object will be taken.
   */
  mobile_config?: {
    // Image to be shown on the Home Page
    // Ideally 640x144px (Width x Hight)
    image_url?: string;

    // CTA URL
    redirect_url?: string;

    redirect_url_ios?: string;

    redirect_url_android?: string;

    display_position?: number;

    // For popup banner title, if no image is given this
    // will be default shown on home page
    title?: string;

    position_id?: "leap_mobile_wallet_home";

    // For popup banner description
    description?: string;

    // Start Date when the extension show the banner
    start_date?: string;

    // End date to automatically stop showing the banner
    end_date?: string;

    // Banner type 'popup' | 'redirect-interanlly' | 'redirect-external'
    banner_type?: BannerADType;
  };
};

export type BannerData = Record<string, BannerAD[]>;
