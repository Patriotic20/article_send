/**
 * Даты и постоянные данные конференции.
 *
 * Даты лежат здесь в машинном виде, а не только в тексте: по ним считается
 * состояние баннера («идёт приём» / «приём закрыт») и текущий этап в ленте,
 * поэтому после каждого срока ничего не нужно править руками.
 */
export interface ConferenceDate {
  id: string;
  /** ISO-дата начала этапа. */
  date: string;
  /** Для многодневных этапов — последний день включительно. */
  endDate?: string;
  labelKey: string;
  /** Полная формулировка со старого сайта — показывается на странице дат. */
  detailKey: string;
}

export const conferenceDates: ConferenceDate[] = [
  {
    id: "submission",
    date: "2026-09-10",
    labelKey: "dates_submission",
    detailKey: "deadline_submission",
  },
  {
    id: "notification",
    date: "2026-09-15",
    labelKey: "dates_notification",
    detailKey: "deadline_notification",
  },
  {
    id: "program",
    date: "2026-09-18",
    labelKey: "dates_program",
    detailKey: "deadline_program",
  },
  {
    id: "conference",
    date: "2026-09-25",
    endDate: "2026-09-26",
    labelKey: "dates_conference",
    detailKey: "deadline_conference",
  },
];

/** Крайний срок подачи тезисов — по нему живёт баннер на главной. */
export const SUBMISSION_DEADLINE = conferenceDates[0];

/** Научные направления: ключи заголовка и списка тем из текстов сайта. */
export const sections = [
  { id: "geology", titleKey: "service_geology_title", pointsKey: "service_geology_points" },
  { id: "metallurgy", titleKey: "service_metallurgy_title", pointsKey: "service_metallurgy_points" },
  { id: "engineering", titleKey: "service_engineering_title", pointsKey: "service_engineering_points" },
  { id: "energy", titleKey: "service_energy_title", pointsKey: "service_energy_points" },
  { id: "eco", titleKey: "service_eco_title", pointsKey: "service_eco_points" },
  { id: "economy", titleKey: "service_economy_title", pointsKey: "service_economy_points" },
];

/**
 * Секретариат конференции: контакты по научным и организационным вопросам.
 *
 * Фотографии — с прежнего сайта конференции; у четвёртого участника там
 * стоял обезличенный силуэт из шаблона, поэтому у него остаются инициалы:
 * это честнее, чем чужая картинка.
 */
export const secretariat = [1, 2, 3, 4].map((n) => ({
  id: `member-${n}`,
  nameKey: `team_member_${n}_name`,
  positionKey: `team_member_${n}_position`,
  photo: n <= 3 ? `/media/team/member-${n}.webp` : undefined,
}));

/** Организаторы и партнёры: логотипы лежат в public/media/partners. */
export const partners = [
  { id: "ndktu", logo: "/media/partners/ndktu.png", nameKey: "sponsor_ndktu" },
  { id: "nkmk", logo: "/media/partners/nkmk.webp", nameKey: "sponsor_ngmk" },
  { id: "academy", logo: "/media/partners/akademiya.png", nameKey: "sponsor_academy" },
  { id: "edu", logo: "/media/partners/oliy-talim.png", nameKey: "sponsor_edu" },
  { id: "mingeo", logo: "/media/partners/tog-kon.webp", nameKey: "sponsor_mingeo" },
  { id: "uran", logo: "/media/partners/uran.webp", nameKey: "sponsor_uran" },
];

/**
 * Сколько полных дней осталось до даты. Считаем в UTC по началу суток:
 * иначе в вечерние часы результат «прыгал» бы на день в зависимости от
 * часового пояса посетителя.
 */
export function daysUntil(iso: string, now: Date = new Date()): number {
  const target = Date.parse(`${iso}T00:00:00Z`);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86_400_000);
}
