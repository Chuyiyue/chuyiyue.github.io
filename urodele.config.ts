export const config = {
  github: {
    login: "chuyiyue", // github login name, not user name
    repo: "chuyiyue.github.io", //"urodele",
    logInUrl: "",
    logInAuthUrl: "",
  },
  head: {
    title: "Urodele",
    brand: "Urodele",
    description: "A self-owned full-static blog system",
  },
  footer: {
    copyright: "© ChuYiyue",
    copyrightUrl: "https://github.com/chuyiyue",
  },
  pagination: {
    size: 10,
  },
  giscus: false as object | false,
} as const;

export default config;
