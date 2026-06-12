export type SalonPhoto = {
  src: string;
  alt: string;
};

export type GalleryPageItem = SalonPhoto & {
  title: string;
  category: string;
  featured?: boolean;
};

export const heroSalonPhoto: SalonPhoto = {
  src: "/images/salon/interier-salon-hq.jpg",
  alt: "Kozmetický salón Timea Skincare s kozmetickým lôžkom, policami a profesionálnou výbavou",
};

/** Výber 6 unikátnych fotiek pre náhľad galérie na homepage (bez hero fotky). */
export const homeGalleryPreview: SalonPhoto[] = [
  {
    src: "/images/salon/produkty-policky-hq.jpg",
    alt: "Profesionálne kozmetické produkty na osvetlených policiach v salóne Timea Skincare",
  },
  {
    src: "/images/salon/certifikaty-stena-hq.jpg",
    alt: "Profesionálne certifikáty Timey Polcovej zavesené na stene salónu",
  },
  {
    src: "/images/salon/nastroje-obocie-hq.jpg",
    alt: "Ružové profesionálne nástroje na úpravu obočia a mihalníc v salóne Timea Skincare",
  },
  {
    src: "/images/salon/zrkadlo-produkty-hq.jpg",
    alt: "Okrúhle zrkadlo a police s produktmi v salóne Timea Skincare",
  },
  {
    src: "/images/salon/cakaci-atmosfera-hq.jpg",
    alt: "Čakací kútik so sviečkami, vizitkami a jemnými detailmi v salóne Timea Skincare",
  },
  {
    src: "/images/salon/kosik-cukriky-hq.jpg",
    alt: "Dekoratívny košík s cukríkmi a ružovou stužkou v salóne Timea Skincare",
  },
];

/** Kompletná galéria salónu – 12 unikátnych fotografií. */
export const galleryPageItems: GalleryPageItem[] = [
  {
    title: "Interiér salónu",
    category: "Salón",
    src: "/images/salon/interier-salon-hq.jpg",
    alt: "Interiér kozmetického salónu Timea Skincare s kozmetickým lôžkom a policami",
  },
  {
    title: "Kozmetika v salóne",
    category: "Salón",
    src: "/images/salon/produkty-policky-hq.jpg",
    alt: "Profesionálne kozmetické produkty na osvetlených policiach v salóne Timea Skincare",
  },
  {
    title: "Zrkadlo a produkty",
    category: "Salón",
    src: "/images/salon/zrkadlo-produkty-hq.jpg",
    alt: "Police s kozmetikou a certifikátmi v salóne Timea Skincare v okrúhlom zrkadle",
    featured: true,
  },
  {
    title: "Profesionálne certifikáty",
    category: "Dôvera",
    src: "/images/salon/certifikaty-stena-hq.jpg",
    alt: "Profesionálne certifikáty Timey Polcovej z Beauty School Nitra v salóne",
  },
  {
    title: "Nástroje pre obočie a mihalnice",
    category: "Detail",
    src: "/images/salon/nastroje-obocie-hq.jpg",
    alt: "Profesionálne ružové nástroje na úpravu obočia a mihalníc v salóne Timea Skincare",
  },
  {
    title: "Čakací priestor",
    category: "Atmosféra",
    src: "/images/salon/cakaci-atmosfera-hq.jpg",
    alt: "Čakací kútik so sviečkami, vizitkami a jemnými detailmi v salóne Timea Skincare",
  },
  {
    title: "Darček pre zákazníčky",
    category: "Atmosféra",
    src: "/images/salon/kosik-cukriky-hq.jpg",
    alt: "Dekoratívny košík s cukríkmi a ružovou stužkou v salóne Timea Skincare",
  },
  {
    title: "Kartičky na ďalší termín",
    category: "Detail",
    src: "/images/salon/karticky-termin-hq.jpg",
    alt: "Ružové kartičky na ďalší termín a vizitky Timea Skincare v stojančeku",
  },
  {
    title: "Certifikát k prístroju",
    category: "Dôvera",
    src: "/images/salon/certifikat-pristroj-hq.jpg",
    alt: "Certifikát Timey Polcovej za odborné školenie na prístroji Beautyrelax",
  },
  {
    title: "Prístrojové ošetrenie",
    category: "Technológia",
    src: "/images/salon/pristroj-beautyrelax-hq.jpg",
    alt: "Profesionálny kozmetický prístroj Beautyrelax v salóne Timea Skincare",
  },
  {
    title: "Prístrojové hlavice",
    category: "Technológia",
    src: "/images/salon/pristroj-hlavice-hq.jpg",
    alt: "Profesionálne hlavice kozmetického prístroja v salóne Timea Skincare",
  },
  {
    title: "Vstup do budovy",
    category: "Lokalita",
    src: "/images/salon/vstup-budova-hq.jpg",
    alt: "Vstup do budovy, kde sa nachádza salón Timea Skincare v Novej Bani",
  },
];
