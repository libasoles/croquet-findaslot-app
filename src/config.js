const locale =
  window.location.pathname === "/en"
    ? {
        lang: "en",
        locale: "en-US",
      }
    : {
        lang: "es",
        locale: "es-ES",
      };

export const config = {
  ...locale,
};
