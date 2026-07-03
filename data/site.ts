export const siteConfig = {
  name: "Timea Skincare",
  owner: "Timea Polcová",
  location: "Nová Baňa",
  address: "Štúrova 801/36, 968 01 Nová Baňa, Slovensko",
  phone: "+421 908 884 347",
  phoneHref: "tel:+421908884347",
  email: "polcova.timea@gmail.com",
  emailHref: "mailto:polcova.timea@gmail.com",
  instagram: "https://www.instagram.com/timea.skincare/",
  facebook: "https://www.facebook.com/timeapolcova",
  googleBusiness:
    "https://www.google.com/maps/place/Timea+SkinCare/@48.4250459,18.6392719,533m/data=!3m2!1e3!4b1!4m6!3m5!1s0x476ad5b1532d38f1:0x7442c9dd157c4ec1!8m2!3d48.4250424!4d18.6418468!16s%2Fg%2F11zbc5lsmq!5m1!1e1?entry=ttu",
  mapsUrl:
    "https://www.google.com/maps/place/Timea+SkinCare/@48.4250459,18.6392719,533m/data=!3m2!1e3!4b1!4m6!3m5!1s0x476ad5b1532d38f1:0x7442c9dd157c4ec1!8m2!3d48.4250424!4d18.6418468!16s%2Fg%2F11zbc5lsmq!5m1!1e1?entry=ttu",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=Timea%20SkinCare%2C%20%C5%A0t%C3%BArova%20801%2F36%2C%20968%2001%20Nov%C3%A1%20Ba%C5%88a%2C%20Slovakia&output=embed",
};

export const navigation = [
  { label: "Domov", href: "/" },
  { label: "Služby", href: "/sluzby" },
  { label: "O mne", href: "/#o-salone" },
  { label: "Galéria", href: "/galeria" },
  { label: "Cenník", href: "/cennik" },
  { label: "Kontakt", href: "/kontakt" },
];

// English navigation. Pages not yet translated point to their Slovak
// equivalents (which exist) so there are no broken links; they are switched to
// English routes as those pages are added in later phases.
export const navigationEn = [
  { label: "Home", href: "/en" },
  { label: "Services", href: "/en/services" },
  { label: "About me", href: "/en#o-salone" },
  { label: "Gallery", href: "/en/gallery" },
  { label: "Pricing", href: "/en/pricing" },
  { label: "Contact", href: "/en/contact" },
];

export const serviceGroups = [
  {
    title: "Kozmetické ošetrenia",
    description:
      "Ošetrenia sú prispôsobené typu pleti a aktuálnym potrebám pokožky. Cieľom je pleť vyčistiť, osviežiť a hydratovať.",
    services: [
      "Základné ošetrenie",
      "Kompletné ošetrenie",
      "Luxusné ošetrenie",
    ],
  },
  {
    title: "Obočie a mihalnice",
    description:
      "Služby zamerané na prirodzené zvýraznenie obočia a mihalníc, aby tvár pôsobila upravene, jemne a harmonicky.",
    services: [
      "Úprava obočia",
      "Úprava a farbenie obočia",
      "Laminácia obočia",
      "Farbenie mihalníc",
      "Laminácia mihalníc",
    ],
  },
  {
    title: "Depilácia tváre",
    description:
      "Rýchla a jemná úprava nežiaducich chĺpkov v oblasti tváre.",
    services: [
      "Depilácia hornej pery",
      "Depilácia brady",
      "Depilácia hornej pery + brady",
    ],
  },
  {
    title: "Darčekový poukaz",
    description:
      "Každú procedúru je možné zakúpiť aj formou darčekového poukazu.",
    services: ["Darčekový poukaz na vybranú službu"],
  },
];

export const serviceDetails: Record<string, string[]> = {
  "Základné ošetrenie": [
    "povrchové čistenie",
    "hĺbkové čistenie",
    "použitie prístrojových hlavíc",
    "maska, séra a krém",
  ],
  "Kompletné ošetrenie": [
    "povrchové čistenie",
    "hĺbkové čistenie",
    "použitie prístrojových hlavíc",
    "zapracovanie aktívnych látok",
    "maska, séra a krém",
  ],
  "Luxusné ošetrenie": [
    "povrchové čistenie",
    "hĺbkové čistenie",
    "liftingová lymfatická masáž",
    "použitie prístrojových hlavíc",
    "zapracovanie aktívnych látok pomocou robotickej neinvazívnej mezoterapie",
    "maska, séra a krém",
  ],
};

export const bookableServices = [
  { name: "Základné ošetrenie", durationMinutes: 75, durationLabel: "70 - 75 min" },
  { name: "Kompletné ošetrenie", durationMinutes: 95, durationLabel: "85 - 95 min" },
  { name: "Luxusné ošetrenie", durationMinutes: 120 },
  { name: "Úprava obočia", durationMinutes: 20, durationLabel: "15 - 20 min" },
  { name: "Úprava a farbenie obočia", durationMinutes: 50, durationLabel: "35 - 50 min" },
  { name: "Laminácia obočia", durationMinutes: 60 },
  { name: "Farbenie mihalníc", durationMinutes: 20, durationLabel: "15 - 20 min" },
  { name: "Laminácia mihalníc", durationMinutes: 80, durationLabel: "60 - 80 min" },
  { name: "Laminácia obočia + laminácia mihalníc", durationMinutes: 120 },
  {
    name: "Masáž tváre a dekoltu k základnému alebo kompletnému ošetreniu",
    durationMinutes: 20,
  },
  { name: "Darčekový poukaz", durationMinutes: null },
];

export const giftVoucherTreatments = [
  { name: "Základné ošetrenie", amount: 40 },
  { name: "Kompletné ošetrenie", amount: 50 },
  { name: "Luxusné ošetrenie", amount: 70 },
  { name: "Úprava obočia", amount: 8 },
  { name: "Úprava a farbenie obočia", amount: 13 },
  { name: "Laminácia obočia", amount: 28 },
  { name: "Farbenie mihalníc", amount: 8 },
  { name: "Laminácia mihalníc", amount: 33 },
  { name: "Laminácia obočia + laminácia mihalníc", amount: 55 },
  { name: "Depilácia hornej pery", amount: 3 },
  { name: "Depilácia brady", amount: 3 },
  { name: "Depilácia hornej pery + brady", amount: 5 },
  {
    name: "Masáž tváre a dekoltu k základnému alebo kompletnému ošetreniu",
    amount: 10,
  },
];

export const giftVoucherPaymentConfig = {
  iban: "[DOPLNIŤ_IBAN]",
  accountName: "Timea Skincare",
  currency: "EUR",
  notePrefix: "Darčekový poukaz",
};

export const priceGroups = [
  {
    title: "Kozmetické ošetrenia",
    items: [
      { name: "Základné ošetrenie", price: "40 € - 45 €" },
      { name: "Kompletné ošetrenie", price: "50 € - 55 €", highlight: "Obľúbené" },
      { name: "Luxusné ošetrenie", price: "70 € - 75 €", highlight: "Prémiové" },
    ],
  },
  {
    title: "Obočie a mihalnice",
    items: [
      { name: "Úprava obočia / trhanie", price: "8 €" },
      { name: "Úprava a farbenie obočia", price: "13 €", highlight: "Častá voľba" },
      { name: "Laminácia obočia aj s farbením", price: "28 €", highlight: "Obľúbené" },
      { name: "Farbenie mihalníc", price: "8 €" },
      { name: "Laminácia mihalníc aj s farbením", price: "33 €", highlight: "Obľúbené" },
      { name: "Laminácia obočia + laminácia mihalníc", price: "55 €", highlight: "Výhodný balík" },
    ],
  },
  {
    title: "Depilácia",
    items: [
      { name: "Depilácia hornej pery", price: "3 €" },
      { name: "Depilácia brady", price: "3 €" },
      { name: "Depilácia hornej pery + brady", price: "5 €" },
    ],
  },
  {
    title: "Doplnkové služby",
    items: [
      {
        name: "Masáž tváre a dekoltu k základnému alebo kompletnému ošetreniu",
        price: "10 €",
      },
      { name: "Luxusné ošetrenie už masáž obsahuje", price: "v cene" },
    ],
  },
];
