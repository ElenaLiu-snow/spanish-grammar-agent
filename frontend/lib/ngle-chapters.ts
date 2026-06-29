export type NGLEPart = {
  id: string;
  titleEs: string;
  titleZh: string;
  chapters: NGLEChapter[];
};

export type NGLEChapter = {
  number: number;
  titleEs: string;
  titleZh: string;
  slug: string;
  part: string;
};

export const ngleParts: NGLEPart[] = [
  {
    id: 'morfologia',
    titleEs: 'Morfología',
    titleZh: '形态学',
    chapters: [
      { number: 1, titleEs: 'Introducción a la morfología', titleZh: '形态学导论', slug: '1', part: 'morfologia' },
      { number: 2, titleEs: 'El género', titleZh: '性', slug: '2', part: 'morfologia' },
      { number: 3, titleEs: 'El número', titleZh: '数', slug: '3', part: 'morfologia' },
      { number: 4, titleEs: 'La flexión verbal', titleZh: '动词变位', slug: '4', part: 'morfologia' },
      { number: 5, titleEs: 'Derivación nominal (I): nombres deverbales', titleZh: '名词派生 (I)：动词派生名词', slug: '5', part: 'morfologia' },
      { number: 6, titleEs: 'Derivación nominal (II): nombres deadjetivales y denominales', titleZh: '名词派生 (II)：形容词和名词派生名词', slug: '6', part: 'morfologia' },
      { number: 7, titleEs: 'Derivación adjetival y adverbial', titleZh: '形容词和副词派生', slug: '7', part: 'morfologia' },
      { number: 8, titleEs: 'Derivación verbal y parasíntesis', titleZh: '动词派生与综合派生', slug: '8', part: 'morfologia' },
      { number: 9, titleEs: 'Derivación apreciativa', titleZh: '评价性派生', slug: '9', part: 'morfologia' },
      { number: 10, titleEs: 'Prefijación', titleZh: '前缀法', slug: '10', part: 'morfologia' },
      { number: 11, titleEs: 'Composición', titleZh: '复合构词', slug: '11', part: 'morfologia' },
    ],
  },
  {
    id: 'sintaxis-clases',
    titleEs: 'Sintaxis — Clases de palabras',
    titleZh: '句法 — 词类',
    chapters: [
      { number: 12, titleEs: 'El sustantivo', titleZh: '名词', slug: '12', part: 'sintaxis-clases' },
      { number: 13, titleEs: 'El adjetivo', titleZh: '形容词', slug: '13', part: 'sintaxis-clases' },
      { number: 14, titleEs: 'El artículo (determinantes definidos)', titleZh: '冠词（定指限定词）', slug: '14', part: 'sintaxis-clases' },
      { number: 15, titleEs: 'Demostrativos y posesivos', titleZh: '指示词与物主词', slug: '15', part: 'sintaxis-clases' },
      { number: 16, titleEs: 'Cuantificadores (I): numerales e indefinidos', titleZh: '量化词 (I)：数词与不定词', slug: '16', part: 'sintaxis-clases' },
      { number: 17, titleEs: 'Cuantificadores (II): estructuras comparativas', titleZh: '量化词 (II)：比较结构', slug: '17', part: 'sintaxis-clases' },
      { number: 18, titleEs: 'Pronombres personales (I): formas átonas', titleZh: '人称代词 (I)：非重读形式', slug: '18', part: 'sintaxis-clases' },
      { number: 19, titleEs: 'Pronombres personales (II): formas tónicas y reflexivas', titleZh: '人称代词 (II)：重读与反身形式', slug: '19', part: 'sintaxis-clases' },
      { number: 20, titleEs: 'Relativos, interrogativos y exclamativos', titleZh: '关系词、疑问词与感叹词', slug: '20', part: 'sintaxis-clases' },
      { number: 21, titleEs: 'El verbo (I): tiempo y aspecto', titleZh: '动词 (I)：时与体', slug: '21', part: 'sintaxis-clases' },
      { number: 22, titleEs: 'El verbo (II): modo y modalidad', titleZh: '动词 (II)：式与情态', slug: '22', part: 'sintaxis-clases' },
      { number: 23, titleEs: 'El verbo (III): formas no personales', titleZh: '动词 (III)：非人称形式', slug: '23', part: 'sintaxis-clases' },
      { number: 24, titleEs: 'El adverbio', titleZh: '副词', slug: '24', part: 'sintaxis-clases' },
      { number: 25, titleEs: 'Preposiciones (I): inventario y propiedades', titleZh: '介词 (I)：清单与属性', slug: '25', part: 'sintaxis-clases' },
      { number: 26, titleEs: 'Preposiciones (II): usos y alternancias', titleZh: '介词 (II)：用法与交替', slug: '26', part: 'sintaxis-clases' },
      { number: 27, titleEs: 'La conjunción', titleZh: '连词', slug: '27', part: 'sintaxis-clases' },
      { number: 28, titleEs: 'La interjección', titleZh: '感叹词', slug: '28', part: 'sintaxis-clases' },
      { number: 29, titleEs: 'Oración simple: estructura', titleZh: '简单句：结构', slug: '29', part: 'sintaxis-clases' },
      { number: 30, titleEs: 'Oración compuesta: coordinación', titleZh: '复合句：并列', slug: '30', part: 'sintaxis-clases' },
      { number: 31, titleEs: 'Subordinación sustantiva', titleZh: '名词从句', slug: '31', part: 'sintaxis-clases' },
      { number: 32, titleEs: 'Subordinación de relativo', titleZh: '关系从句', slug: '32', part: 'sintaxis-clases' },
    ],
  },
  {
    id: 'sintaxis-funciones',
    titleEs: 'Sintaxis — Funciones y construcciones',
    titleZh: '句法 — 功能与构式',
    chapters: [
      { number: 33, titleEs: 'Sujeto y predicado', titleZh: '主语与谓语', slug: '33', part: 'sintaxis-funciones' },
      { number: 34, titleEs: 'Complemento directo', titleZh: '直接宾语', slug: '34', part: 'sintaxis-funciones' },
      { number: 35, titleEs: 'Complemento indirecto', titleZh: '间接宾语', slug: '35', part: 'sintaxis-funciones' },
      { number: 36, titleEs: 'Complemento de régimen preposicional', titleZh: '介词补语', slug: '36', part: 'sintaxis-funciones' },
      { number: 37, titleEs: 'Atributo y predicativo', titleZh: '系表结构与述谓补语', slug: '37', part: 'sintaxis-funciones' },
      { number: 38, titleEs: 'Adjuntos y complementos circunstanciales', titleZh: '附加语与状语', slug: '38', part: 'sintaxis-funciones' },
      { number: 39, titleEs: 'Oraciones activas, pasivas, impersonales y medias', titleZh: '主动句、被动句、无人称句与中间句', slug: '39', part: 'sintaxis-funciones' },
      { number: 40, titleEs: 'Modalidad: enunciados interrogativos y exclamativos', titleZh: '句类：疑问句与感叹句', slug: '40', part: 'sintaxis-funciones' },
      { number: 41, titleEs: 'Negación', titleZh: '否定', slug: '41', part: 'sintaxis-funciones' },
      { number: 42, titleEs: 'Tiempo y aspecto en el discurso', titleZh: '语篇中的时与体', slug: '42', part: 'sintaxis-funciones' },
      { number: 43, titleEs: 'Construcciones comparativas y superlativas', titleZh: '比较与最高级构式', slug: '43', part: 'sintaxis-funciones' },
      { number: 44, titleEs: 'Construcciones causales, finales e ilativas', titleZh: '原因、目的与推论构式', slug: '44', part: 'sintaxis-funciones' },
      { number: 45, titleEs: 'Construcciones condicionales', titleZh: '条件构式', slug: '45', part: 'sintaxis-funciones' },
      { number: 46, titleEs: 'Construcciones concesivas', titleZh: '让步构式', slug: '46', part: 'sintaxis-funciones' },
      { number: 47, titleEs: 'Ser y estar', titleZh: 'Ser 与 Estar', slug: '47', part: 'sintaxis-funciones' },
      { number: 48, titleEs: 'Orden de palabras y estructura informativa', titleZh: '语序与信息结构', slug: '48', part: 'sintaxis-funciones' },
    ],
  },
];

export function getChapter(slug: string): NGLEChapter | undefined {
  for (const part of ngleParts) {
    const found = part.chapters.find((c) => c.slug === slug);
    if (found) return found;
  }
  return undefined;
}

export function getAllChapters(): NGLEChapter[] {
  return ngleParts.flatMap((p) => p.chapters);
}
