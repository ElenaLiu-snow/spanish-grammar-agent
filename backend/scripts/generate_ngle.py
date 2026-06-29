"""
NGLE 48-chapter bilingual content generator.

Uses DeepSeek API to reproduce RAE original Spanish text + Chinese translation
for each chapter of the Nueva gramática de la lengua española.

Key principles:
- Faithfully reproduce the RAE original content, do NOT add fabricated examples
- Translate accurately, preserving academic terminology
- Use ## for sections, ### for subsections
- Each chapter file includes anchor IDs for sidebar navigation

Usage:
    python scripts/generate_ngle.py              # Generate ALL 48 chapters
    python scripts/generate_ngle.py --start 1 --end 3   # Generate chapters 1-3
    python scripts/generate_ngle.py --chapter 2  # Generate single chapter
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

# Load env from backend .env
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

OUTPUT_DIR = Path(__file__).parent.parent.parent / "frontend" / "content" / "rae" / "ngle"

# ---------------------------------------------------------------------------
# NGLE 48-chapter structure
# ---------------------------------------------------------------------------
CHAPTERS = [
    # Parte I: Morfología
    ("Parte I: Morfología", "形态学", [
        (1, "Introducción a la morfología", "形态学导论"),
        (2, "El género", "性"),
        (3, "El número", "数"),
        (4, "La flexión verbal", "动词变位"),
        (5, "Derivación nominal (I): nombres deverbales", "名词派生 (I)：动词派生名词"),
        (6, "Derivación nominal (II): nombres deadjetivales y denominales", "名词派生 (II)：形容词和名词派生名词"),
        (7, "Derivación adjetival y adverbial", "形容词和副词派生"),
        (8, "Derivación verbal y parasíntesis", "动词派生与综合派生"),
        (9, "Derivación apreciativa", "评价性派生"),
        (10, "Prefijación", "前缀法"),
        (11, "Composición", "复合构词"),
    ]),
    # Parte II: Sintaxis — Clases de palabras
    ("Parte II: Sintaxis — Clases de palabras", "句法 — 词类", [
        (12, "El sustantivo", "名词"),
        (13, "El adjetivo", "形容词"),
        (14, "El artículo (determinantes definidos)", "冠词（定指限定词）"),
        (15, "Demostrativos y posesivos", "指示词与物主词"),
        (16, "Cuantificadores (I): numerales e indefinidos", "量化词 (I)：数词与不定词"),
        (17, "Cuantificadores (II): estructuras comparativas", "量化词 (II)：比较结构"),
        (18, "Pronombres personales (I): formas átonas", "人称代词 (I)：非重读形式"),
        (19, "Pronombres personales (II): formas tónicas y reflexivas", "人称代词 (II)：重读与反身形式"),
        (20, "Relativos, interrogativos y exclamativos", "关系词、疑问词与感叹词"),
        (21, "El verbo (I): tiempo y aspecto", "动词 (I)：时与体"),
        (22, "El verbo (II): modo y modalidad", "动词 (II)：式与情态"),
        (23, "El verbo (III): formas no personales", "动词 (III)：非人称形式"),
        (24, "El adverbio", "副词"),
        (25, "Preposiciones (I): inventario y propiedades", "介词 (I)：清单与属性"),
        (26, "Preposiciones (II): usos y alternancias", "介词 (II)：用法与交替"),
        (27, "La conjunción", "连词"),
        (28, "La interjección", "感叹词"),
        (29, "Oración simple: estructura", "简单句：结构"),
        (30, "Oración compuesta: coordinación", "复合句：并列"),
        (31, "Subordinación sustantiva", "名词从句"),
        (32, "Subordinación de relativo", "关系从句"),
    ]),
    # Parte III: Sintaxis — Funciones y construcciones
    ("Parte III: Sintaxis — Funciones y construcciones", "句法 — 功能与构式", [
        (33, "Sujeto y predicado", "主语与谓语"),
        (34, "Complemento directo", "直接宾语"),
        (35, "Complemento indirecto", "间接宾语"),
        (36, "Complemento de régimen preposicional", "介词补语"),
        (37, "Atributo y predicativo", "系表结构与述谓补语"),
        (38, "Adjuntos y complementos circunstanciales", "附加语与状语"),
        (39, "Oraciones activas, pasivas, impersonales y medias", "主动句、被动句、无人称句与中间句"),
        (40, "Modalidad: enunciados interrogativos y exclamativos", "句类：疑问句与感叹句"),
        (41, "Negación", "否定"),
        (42, "Tiempo y aspecto en el discurso", "语篇中的时与体"),
        (43, "Construcciones comparativas y superlativas", "比较与最高级构式"),
        (44, "Construcciones causales, finales e ilativas", "原因、目的与推论构式"),
        (45, "Construcciones condicionales", "条件构式"),
        (46, "Construcciones concesivas", "让步构式"),
        (47, "Ser y estar", "Ser 与 Estar"),
        (48, "Orden de palabras y estructura informativa", "语序与信息结构"),
    ]),
]


SYSTEM_PROMPT = """你是 NGLE（Nueva gramática de la lengua española）的中文译者。输出格式如下：

规则说明部分：用中文写，是西语原文的严格翻译。西语术语用反引号 `así`。

例句部分：保留西语原句，后跟中文翻译。格式为：
> `西语原句`
> 中文翻译

标题用双语：## 西语标题 / 中文标题

完整示例：
```
## El género y el sexo / 性与性别

在指称有生命体的名词中，性通常与所指对象的性别相对应。`niño`（男孩）是阳性，`niña`（女孩）是阴性。但存在例外，如 `persona`（人）始终为阴性，无论指男性还是女性。

> `El niño juega en el parque.`
> 男孩在公园里玩耍。

> `La persona que vino era alta.`
> 来的那个人很高。

名词的性通过限定词和形容词的一致关系来体现，与生理性别不完全等同。
```

严格规则：
1. 规则说明 — 只用中文（西语原文的严格翻译）
2. 西语术语 — 用反引号 `término`
3. 例句 — 放在 > 引用块里，西语原句 + 中文翻译
4. 不要输出西语段落，只有例句才出现整句西语"""


def get_client() -> OpenAI:
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        raise RuntimeError("DEEPSEEK_API_KEY not set")
    return OpenAI(api_key=api_key, base_url="https://api.deepseek.com")

GENERATE_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")


def generate_chapter(client: OpenAI, chapter_num: int, title_es: str, title_zh: str,
                     part_name: str) -> str:
    """Generate bilingual content for one NGLE chapter."""
    user_prompt = f"""NGLE 第 {chapter_num} 章：{title_es} / {title_zh}。属于 {part_name}。

请输出这一章的全部内容。包含所有的节（##）和子节（###），不要遗漏任何部分。"""

    print(f"  [Chapter {chapter_num}] Calling DeepSeek API...")
    start = time.time()

    try:
        response = client.chat.completions.create(
            model=GENERATE_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=16384,
            temperature=0.3,
        )
        elapsed = time.time() - start
        content = response.choices[0].message.content
        print(f"  [Chapter {chapter_num}] Done in {elapsed:.1f}s, {len(content)} chars")
        return content
    except Exception as e:
        print(f"  [Chapter {chapter_num}] ERROR: {e}")
        raise


def save_chapter(chapter_num: int, content: str):
    """Save generated content to file."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    filepath = OUTPUT_DIR / f"capitulo-{chapter_num}.md"
    filepath.write_text(content, encoding="utf-8")
    print(f"  Saved: {filepath}")


def main():
    parser = argparse.ArgumentParser(description="Generate NGLE bilingual content")
    parser.add_argument("--chapter", type=int, help="Generate single chapter")
    parser.add_argument("--start", type=int, default=1, help="Start chapter (inclusive)")
    parser.add_argument("--end", type=int, default=48, help="End chapter (inclusive)")
    parser.add_argument("--delay", type=float, default=2.0,
                        help="Delay between API calls in seconds")
    args = parser.parse_args()

    client = get_client()

    # Build flat chapter list
    all_chapters = []
    for part_info in CHAPTERS:
        part_name, part_zh, chapters = part_info
        for num, title_es, title_zh in chapters:
            all_chapters.append((num, title_es, title_zh, part_name))

    # Filter by range
    chapters_to_gen = [
        (num, es, zh, part)
        for num, es, zh, part in all_chapters
        if args.start <= num <= args.end
    ]

    if args.chapter:
        chapters_to_gen = [
            (num, es, zh, part)
            for num, es, zh, part in chapters_to_gen
            if num == args.chapter
        ]

    print(f"Generating {len(chapters_to_gen)} chapters (Ch. {chapters_to_gen[0][0]}-{chapters_to_gen[-1][0]})")
    print(f"Output: {OUTPUT_DIR}")
    print("-" * 60)

    success = 0
    failed = 0

    for i, (num, title_es, title_zh, part_name) in enumerate(chapters_to_gen):
        print(f"\n[{i+1}/{len(chapters_to_gen)}] Chapter {num}: {title_es}")
        try:
            content = generate_chapter(client, num, title_es, title_zh, part_name)
            save_chapter(num, content)
            success += 1
        except Exception as e:
            print(f"  FAILED: {e}")
            failed += 1
            # Continue with next chapter

        if i < len(chapters_to_gen) - 1:
            time.sleep(args.delay)

    print(f"\n{'=' * 60}")
    print(f"Done: {success} generated, {failed} failed")


if __name__ == "__main__":
    main()
