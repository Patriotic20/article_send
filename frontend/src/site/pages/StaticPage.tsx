import { Navigate, useParams } from "react-router-dom";

import { ContentPage } from "@/site/components/ContentPage";
import { PartnerStrip } from "@/site/components/PartnerStrip";
import type { PageContent } from "@/site/content/types";
import {
  aboutPages,
  partnerPages,
  regionPages,
  sectionPages,
  submissionPage,
} from "@/site/content/pages";

/**
 * Одна страница шаблона ContentPage, выбранная по slug из адреса.
 * Неизвестный slug ведёт на главную — заглушек с пустым текстом не бывает.
 */
function fromMap(map: Record<string, PageContent>, slug?: string) {
  const page = slug ? map[slug] : undefined;
  if (!page) return <Navigate to="/" replace />;
  return (
    <>
      <ContentPage page={page} />
      <PartnerStrip />
    </>
  );
}

export function AboutPage() {
  return fromMap(aboutPages, "index");
}

export function AboutSubPage() {
  const { slug } = useParams();
  return fromMap(aboutPages, slug);
}

export function RegionPage() {
  const { slug } = useParams();
  return fromMap(regionPages, slug);
}

export function SectionPage() {
  const { slug } = useParams();
  return fromMap(sectionPages, slug);
}

export function PartnerPage() {
  const { slug } = useParams();
  return fromMap(partnerPages, slug);
}

export function SubmissionPage() {
  return (
    <>
      <ContentPage page={submissionPage} />
      <PartnerStrip />
    </>
  );
}
