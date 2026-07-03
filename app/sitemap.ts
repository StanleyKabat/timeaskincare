import type { MetadataRoute } from "next";

const routes = [
  "",
  "/sluzby",
  "/cennik",
  "/galeria",
  "/recenzie",
  "/kontakt",
  "/ochrana-osobnych-udajov",
  "/en",
  "/en/services",
  "/en/contact",
  "/en/pricing",
  "/en/gallery",
  "/en/reviews",
];
const lastModified = new Date("2026-07-03");

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://timeaskincare.sk${route}`,
    lastModified,
    changeFrequency: "monthly",
    priority:
      route === ""
        ? 1
        : route === "/en"
          ? 0.9
          : route === "/ochrana-osobnych-udajov"
            ? 0.5
            : 0.8,
  }));
}
