import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Hero } from "@/components/home/Hero";
import {
  AboutIntro, BannerSlider, CategoryGrid, CategoryMarquee, CollectionGrid, ContactLocation,
  ImageShowcase, ProductSlider, RepairSection, Testimonials, WhyChoose,
} from "@/components/home/Sections";
import { homeQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  head: () => ({
    meta: [
      { title: "SARTAJ — Premium Sewing Machines, Motors & Repair in Hariana, Punjab" },
      {
        name: "description",
        content:
          "Discover SARTAJ: domestic, industrial, overlock and embroidery sewing machines, servo motors, spare parts and expert repair. Enquire online and visit our Hariana showroom.",
      },
      { property: "og:title", content: "SARTAJ — The crown of fine stitching" },
      {
        property: "og:description",
        content: "Premium sewing machines, motors, spare parts and repair in Hariana, Punjab. Enquire online, buy in store.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Store",
          name: "SARTAJ Sewing Machine",
          address: { "@type": "PostalAddress", addressLocality: "Hariana", addressRegion: "Punjab", addressCountry: "IN" },
          geo: { "@type": "GeoCoordinates", latitude: 31.6387333, longitude: 75.8414912 },
          telephone: "+919855457616",
          email: "mrprince110022@gmail.com",
          hasMap: "https://maps.app.goo.gl/GkMM8mitAMxYkAJT6",
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(homeQuery);
  return (
    <>
      <Hero />
      <CategoryMarquee categories={data.categories} />
      <CategoryGrid categories={data.categories} />
      <ProductSlider
        eyebrow="Best sellers"
        title={<>Featured <em className="text-gradient-gold">machines</em></>}
        subtitle="Our most trusted picks — chosen by tailors, boutiques and garment units."
        products={data.featured.length ? data.featured : data.bestSellers}
      />
      <BannerSlider banners={data.banners} />
      <CollectionGrid products={data.machines} />
      <ProductSlider
        tone="dark"
        eyebrow="Motors & spare parts"
        title={<>Power, parts & <em className="text-gradient-gold">precision</em></>}
        subtitle="Servo motors, tables, belts, needles, bobbins and every spare part — bring your old part and we'll match it."
        products={data.partsAndMotors}
      />
      <WhyChoose />
      <RepairSection />
      <ImageShowcase items={data.gallery} />
      <Testimonials items={data.testimonials} />
      <AboutIntro />
      <ContactLocation />
    </>
  );
}
