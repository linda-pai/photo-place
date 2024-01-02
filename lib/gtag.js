export const G_ADS_TRACKING_ID = "AW-11438567150";
export const GA_TRACKING_ID = "G-JYSP7W4XT5";

export const clickAddToCart = (info) => {
  window.gtag("event", "add_to_cart", info);
};

export const removeAddToCart = (info) => {
  window.gtag("event", "remove_from_cart", info);
};

export const searchTracking = (info) => {
  window.gtag("event", "search", info);
};
