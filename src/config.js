const locale = window.location.pathname.includes("en")
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
  defaultDuration: 1,
};
