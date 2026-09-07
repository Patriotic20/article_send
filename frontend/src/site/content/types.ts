/**
 * Модель контента страниц сайта.
 *
 * Тексты не лежат в разметке: блок ссылается на ключ в пространстве имён
 * "site", а i18next подставляет нужный язык. Так все три языка приезжают
 * из выверенных организаторами файлов старого сайта, а страница остаётся
 * данными, которые легко править без знания React.
 */
export type Block =
  /** Подзаголовок внутри страницы. Из таких блоков собирается оглавление. */
  | { type: "heading"; key: string }
  /** Абзац. Ключ может содержать несколько предложений. */
  | { type: "text"; key: string }
  /** Несколько абзацев подряд из разных ключей. */
  | { type: "paragraphs"; keys: string[] }
  /** Маркированный список: ключ указывает на массив строк. */
  | { type: "list"; key: string; headingKey?: string }
  /** Маркированный список, собранный из отдельных ключей. */
  | { type: "bullets"; keys: string[]; headingKey?: string }
  /** Короткие факты строкой — вместо перечисления через запятую в тексте. */
  | { type: "chips"; key: string; headingKey?: string }
  /** Врезка с сильной цитатой из текста. */
  | { type: "quote"; key: string }
  /** Иллюстрация во всю ширину колонки. */
  | { type: "image"; src: string; captionKey?: string }
  /** Сетка изображений. */
  | { type: "gallery"; images: string[]; headingKey?: string }
  /** Врезка о том, что материал ещё готовится. */
  | { type: "pending" }
  /** Врезка с фактами: подпись и значение. */
  | { type: "facts"; items: { labelKey: string; valueKey: string }[] };

export interface PageContent {
  /** Заголовок страницы (ключ в пространстве "site"). */
  titleKey: string;
  /** Короткая подпись для хлебных крошек, если официальное название длинное. */
  shortTitleKey?: string;
  /** Короткое описание под заголовком. */
  ledeKey?: string;
  /** Иллюстрация в шапке страницы. */
  cover?: string;
  /** Подпись к иллюстрации в шапке. */
  coverCaptionKey?: string;
  /** Хлебные крошки: раздел, к которому относится страница. */
  parent?: { labelKey: string; to: string };
  blocks: Block[];
}

/** Идентификатор якоря для подзаголовка — по нему работает оглавление. */
export function headingId(key: string): string {
  return `s-${key.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
}

/** Подзаголовки страницы по порядку — из них строится оглавление. */
export function tableOfContents(blocks: Block[]): { id: string; key: string }[] {
  const out: { id: string; key: string }[] = [];
  for (const block of blocks) {
    if (block.type === "heading") out.push({ id: headingId(block.key), key: block.key });
    else if ((block.type === "list" || block.type === "bullets" || block.type === "chips" || block.type === "gallery") && block.headingKey)
      out.push({ id: headingId(block.headingKey), key: block.headingKey });
  }
  return out;
}
