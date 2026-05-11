import type { MetadataRoute } from "next";

const routes = [
  "",
  "/sluzby",
  "/cennik",
  "/galeria",
  "/recenzie",
  "/kontakt",
  "/ochrana-osobnych-udajov",
];
const lastModified = new Date("2026-05-11");

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://timeaskincare.sk${route}`,
    lastModified,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : route === "/ochrana-osobnych-udajov" ? 0.5 : 0.8,
  }));
}
