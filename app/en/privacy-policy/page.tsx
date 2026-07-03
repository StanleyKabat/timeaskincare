import type { Metadata } from "next";

import { PrivacyPolicyPage } from "@/components/pages/privacy-policy-page";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Information about the processing of personal data and privacy protection at Timea Skincare.",
  alternates: {
    canonical: "/en/privacy-policy",
    languages: {
      sk: "/ochrana-osobnych-udajov",
      en: "/en/privacy-policy",
      "x-default": "/ochrana-osobnych-udajov",
    },
  },
  openGraph: {
    title: "Privacy Policy | Timea Skincare",
    description:
      "Information about the processing of personal data and privacy protection at Timea Skincare.",
    url: "https://timeaskincare.sk/en/privacy-policy",
    siteName: "Timea Skincare",
    locale: "en_US",
    type: "website",
  },
};

export default function EnglishPrivacyPolicyPage() {
  return (
    <PrivacyPolicyPage
      intro={{
        eyebrow: "GDPR",
        title: "Privacy Policy",
        text: "This information explains how we process the data submitted through the booking form.",
      }}
      sections={[
        {
          heading: "Data controller",
          body: (
            <>
              {siteConfig.owner}, {siteConfig.address}, email: {siteConfig.email}, phone:{" "}
              {siteConfig.phone}
            </>
          ),
        },
        {
          heading: "What data we process",
          body: "First and last name, email, phone number, the selected service, the preferred date and time of the booking, and an optional note for the appointment.",
        },
        {
          heading: "Purpose of processing",
          body: "We process the data solely to handle your booking request, to record the appointment in the calendar, and to send a confirmation and a reminder of the appointment by email or SMS.",
        },
        {
          heading: "External services used",
          body: "When handling a booking, we may use Google Calendar to keep a record of booked appointments, an email service to confirm the booking, an SMS service for appointment reminders, and Google Maps to display the salon's location.",
        },
        {
          heading: "Cookies",
          body: "This website does not use analytics or marketing cookies and does not track visitors. The website's own code does not store any cookies. The Contact subpage contains a Google Maps map that loads only after the user clicks. When the map loads, Google may process technical data according to its own policies. Fonts and other files are loaded directly from our domain.",
        },
        {
          heading: "Data retention period",
          body: "We keep the data only for the period necessary to handle the booking, or for the period required by law.",
        },
        {
          heading: "Your rights",
          body: (
            <>
              You have the right to request access to your data, its correction, deletion,
              restriction of processing, or to object to the processing. If you have any questions,
              contact us at {siteConfig.email}.
            </>
          ),
        },
      ]}
    />
  );
}
