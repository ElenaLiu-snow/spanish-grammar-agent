"""
RAE Grammar Knowledge Base scraper.

Crawls rae.es/gramática to extract NGLE grammar rules and saves them
as structured Markdown files for both:
  1. Agent reference (backend/knowledge/rae/)
  2. User-facing documents (frontend/content/rae/)

Usage:
    python scripts/scrape_rae.py
"""

import httpx
import re
import sys
from pathlib import Path
from urllib.parse import urljoin


BASE_URL = "https://www.rae.es/gramática/"
OUTPUT_DIR_AGENT = Path(__file__).parent.parent / "knowledge" / "rae"
OUTPUT_DIR_FRONTEND = Path(__file__).parent.parent.parent / "frontend" / "content" / "rae"

# Known RAE grammar section URLs to crawl
SECTIONS = {
    # Morfología
    "morfologia/genero": "/gramática/morfología/género",
    "morfologia/numero": "/gramática/morfología/número",
    "morfologia/verbo-flexion": "/gramática/morfología/verbo-flexión",

    # Sintaxis - Clases de palabras
    "sintaxis/clases-palabras/sustantivo": "/gramática/sintaxis/clases-de-palabras/sustantivo",
    "sintaxis/clases-palabras/adjetivo": "/gramática/sintaxis/clases-de-palabras/adjetivo",
    "sintaxis/clases-palabras/verbo-sintaxis": "/gramática/sintaxis/clases-de-palabras/verbo",
    "sintaxis/clases-palabras/preposicion": "/gramática/sintaxis/clases-de-palabras/preposición",
    "sintaxis/clases-palabras/determinantes": "/gramática/sintaxis/clases-de-palabras/determinantes",
    "sintaxis/clases-palabras/pronombres": "/gramática/sintaxis/clases-de-palabras/pronombres",
    "sintaxis/clases-palabras/adverbio": "/gramática/sintaxis/clases-de-palabras/adverbio",
    "sintaxis/clases-palabras/conjuncion": "/gramática/sintaxis/clases-de-palabras/conjunción",

    # Sintaxis - Funciones
    "sintaxis/funciones/sujeto": "/gramática/sintaxis/funciones/sujeto",
    "sintaxis/funciones/complemento-directo": "/gramática/sintaxis/funciones/complemento-directo",
    "sintaxis/funciones/complemento-indirecto": "/gramática/sintaxis/funciones/complemento-indirecto",
    "sintaxis/funciones/atributo": "/gramática/sintaxis/funciones/atributo",

    # Sintaxis - Construcciones
    "sintaxis/construcciones/ser-estar": "/gramática/sintaxis/construcciones/ser-y-estar",
    "sintaxis/construcciones/subordinacion-sustantiva": "/gramática/sintaxis/construcciones/subordinación-sustantiva",
    "sintaxis/construcciones/relativas": "/gramática/sintaxis/construcciones/relativas",
    "sintaxis/construcciones/condicionales": "/gramática/sintaxis/construcciones/condicionales",
    "sintaxis/construcciones/concesivas": "/gramática/sintaxis/construcciones/concesivas",

    # Tiempos verbales
    "sintaxis/tiempos-verbales/indicativo": "/gramática/sintaxis/tiempos-verbales/indicativo",
    "sintaxis/tiempos-verbales/subjuntivo": "/gramática/sintaxis/tiempos-verbales/subjuntivo",
    "sintaxis/tiempos-verbales/contraste-pasado": "/gramática/sintaxis/tiempos-verbales/contraste-pasados",

    # Ortografía
    "ortografia/acentuacion": "/gramática/ortografía/acentuación",
}


def sanitize_html(text: str) -> str:
    """Basic HTML to Markdown conversion for RAE pages."""
    # Remove scripts and styles
    text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)

    # Convert headings
    text = re.sub(r'<h1[^>]*>(.*?)</h1>', r'# \1', text)
    text = re.sub(r'<h2[^>]*>(.*?)</h2>', r'## \1', text)
    text = re.sub(r'<h3[^>]*>(.*?)</h3>', r'### \1', text)

    # Convert paragraphs
    text = re.sub(r'<p[^>]*>(.*?)</p>', r'\1\n\n', text, flags=re.DOTALL)

    # Convert emphasis
    text = re.sub(r'<em[^>]*>(.*?)</em>', r'*\1*', text)
    text = re.sub(r'<strong[^>]*>(.*?)</strong>', r'**\1**', text)
    text = re.sub(r'<i[^>]*>(.*?)</i>', r'*\1*', text)
    text = re.sub(r'<b[^>]*>(.*?)</b>', r'**\1**', text)

    # Convert lists
    text = re.sub(r'<li[^>]*>(.*?)</li>', r'- \1\n', text, flags=re.DOTALL)

    # Convert line breaks
    text = re.sub(r'<br\s*/?>', '\n', text)

    # Remove remaining HTML tags
    text = re.sub(r'<[^>]+>', '', text)

    # Clean up whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = text.strip()

    return text


def extract_content(text: str) -> str:
    """Extract the main content area from an HTML page."""
    # Try to find main content area
    main_match = re.search(
        r'<main[^>]*>(.*?)</main>',
        text, re.DOTALL
    )
    if main_match:
        return main_match.group(1)

    # Fallback: try article or content div
    article_match = re.search(
        r'<(?:article|div[^>]*class="[^"]*content[^"]*")[^>]*>(.*?)</(?:article|div)>',
        text, re.DOTALL
    )
    if article_match:
        return article_match.group(1)

    # Last resort: body
    body_match = re.search(r'<body[^>]*>(.*?)</body>', text, re.DOTALL)
    if body_match:
        return body_match.group(1)

    return text


def fetch_section(client: httpx.Client, url: str) -> str | None:
    """Fetch a single RAE grammar section page."""
    try:
        response = client.get(url, timeout=30.0, follow_redirects=True)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"  FAILED: {url} — {e}")
        return None


def save_markdown(rel_path: str, content: str, title: str, source_url: str):
    """Save content as a Markdown file in both agent and frontend directories."""

    agent_header = f"""# {title}
> NGLE Reference: {rel_path.replace('/', ' > ')}
> Source: {source_url}
> Last updated: auto-scraped

"""
    agent_content = agent_header + content
    agent_path = OUTPUT_DIR_AGENT / f"{rel_path}.md"
    agent_path.parent.mkdir(parents=True, exist_ok=True)
    agent_path.write_text(agent_content, encoding="utf-8")
    print(f"  Saved agent: {agent_path}")

    # Frontend version: cleaner, no metadata header
    frontend_header = f"""# {title}

> 来源：Real Academia Española — Nueva Gramática de la Lengua Española

"""
    frontend_content = frontend_header + content
    frontend_path = OUTPUT_DIR_FRONTEND / f"{rel_path.split('/')[-1]}.md"
    frontend_path.parent.mkdir(parents=True, exist_ok=True)
    frontend_path.write_text(frontend_content, encoding="utf-8")
    print(f"  Saved frontend: {frontend_path}")


def main():
    print("RAE Grammar Knowledge Base Scraper")
    print("=" * 50)

    client = httpx.Client(
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; SpanishGrammarAgent/1.0; educational use)",
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "es,zh;q=0.9,en;q=0.8",
        }
    )

    success = 0
    failed = 0

    for rel_path, path in SECTIONS.items():
        url = urljoin(BASE_URL, path.lstrip('/'))
        title = rel_path.split("/")[-1].replace("-", " ").title()
        print(f"\nFetching: {title} ({url})")

        html = fetch_section(client, url)
        if html is None:
            failed += 1
            continue

        # Extract main content and convert to markdown
        main_content = extract_content(html)
        markdown = sanitize_html(main_content)

        if len(markdown) < 200:
            print(f"  WARNING: Content too short ({len(markdown)} chars), may be behind JS rendering")
            # Save what we got anyway
            markdown += "\n\n> ⚠ 注意：此页面的主要内容可能需要 JavaScript 渲染，爬虫仅获取了静态 HTML 部分。建议手工补充。"

        save_markdown(rel_path, markdown, title, url)
        success += 1

    print(f"\n{'=' * 50}")
    print(f"Done: {success} sections scraped, {failed} failed")

    # Even if scraping partially failed, create the index
    create_index()

    client.close()


def create_index():
    """Create master index mapping keywords to files."""
    index_lines = [
        "# RAE Grammar Knowledge Base Index",
        "",
        "Master index: grammar keyword → knowledge file path",
        "",
    ]

    index_lines.append("## Morfología")
    index_lines.append("")
    index_lines.extend([
        "## [genero] -> morfologia/genero",
        "## [género] -> morfologia/genero",
        "## [性别] -> morfologia/genero",
        "## [numero] -> morfologia/numero",
        "## [número] -> morfologia/numero",
        "## [单复数] -> morfologia/numero",
        "## [verbo] -> morfologia/verbo-flexion",
        "## [变位] -> morfologia/verbo-flexion",
        "## [动词变位] -> morfologia/verbo-flexion",
        "",
    ])

    index_lines.append("## Sintaxis — Clases de palabras")
    index_lines.append("")
    index_lines.extend([
        "## [sustantivo] -> sintaxis/clases-palabras/sustantivo",
        "## [名词] -> sintaxis/clases-palabras/sustantivo",
        "## [adjetivo] -> sintaxis/clases-palabras/adjetivo",
        "## [形容词] -> sintaxis/clases-palabras/adjetivo",
        "## [adverbio] -> sintaxis/clases-palabras/adverbio",
        "## [副词] -> sintaxis/clases-palabras/adverbio",
        "## [preposicion] -> sintaxis/clases-palabras/preposicion",
        "## [preposición] -> sintaxis/clases-palabras/preposicion",
        "## [介词] -> sintaxis/clases-palabras/preposicion",
        "## [por] -> sintaxis/clases-palabras/preposicion",
        "## [para] -> sintaxis/clases-palabras/preposicion",
        "## [determinantes] -> sintaxis/clases-palabras/determinantes",
        "## [articulo] -> sintaxis/clases-palabras/determinantes",
        "## [artículo] -> sintaxis/clases-palabras/determinantes",
        "## [冠词] -> sintaxis/clases-palabras/determinantes",
        "## [pronombres] -> sintaxis/clases-palabras/pronombres",
        "## [代词] -> sintaxis/clases-palabras/pronombres",
        "## [conjuncion] -> sintaxis/clases-palabras/conjuncion",
        "## [conjunción] -> sintaxis/clases-palabras/conjuncion",
        "## [连词] -> sintaxis/clases-palabras/conjuncion",
        "",
    ])

    index_lines.append("## Sintaxis — Funciones")
    index_lines.append("")
    index_lines.extend([
        "## [sujeto] -> sintaxis/funciones/sujeto",
        "## [主语] -> sintaxis/funciones/sujeto",
        "## [complemento directo] -> sintaxis/funciones/complemento-directo",
        "## [直接宾语] -> sintaxis/funciones/complemento-directo",
        "## [complemento indirecto] -> sintaxis/funciones/complemento-indirecto",
        "## [间接宾语] -> sintaxis/funciones/complemento-indirecto",
        "## [atributo] -> sintaxis/funciones/atributo",
        "",
    ])

    index_lines.append("## Sintaxis — Construcciones")
    index_lines.append("")
    index_lines.extend([
        "## [ser] -> sintaxis/construcciones/ser-estar",
        "## [estar] -> sintaxis/construcciones/ser-estar",
        "## [subordinacion] -> sintaxis/construcciones/subordinacion-sustantiva",
        "## [名词从句] -> sintaxis/construcciones/subordinacion-sustantiva",
        "## [从句] -> sintaxis/construcciones/subordinacion-sustantiva",
        "## [relativo] -> sintaxis/construcciones/relativas",
        "## [关系从句] -> sintaxis/construcciones/relativas",
        "## [condicional] -> sintaxis/construcciones/condicionales",
        "## [条件句] -> sintaxis/construcciones/condicionales",
        "## [concesivo] -> sintaxis/construcciones/concesivas",
        "## [让步] -> sintaxis/construcciones/concesivas",
        "",
    ])

    index_lines.append("## Tiempos verbales")
    index_lines.append("")
    index_lines.extend([
        "## [indicativo] -> sintaxis/tiempos-verbales/indicativo",
        "## [陈述式] -> sintaxis/tiempos-verbales/indicativo",
        "## [subjuntivo] -> sintaxis/tiempos-verbales/subjuntivo",
        "## [虚拟式] -> sintaxis/tiempos-verbales/subjuntivo",
        "## [contraste pasado] -> sintaxis/tiempos-verbales/contraste-pasado",
        "## [过去时] -> sintaxis/tiempos-verbales/contraste-pasado",
        "## [indefinido] -> sintaxis/tiempos-verbales/contraste-pasado",
        "## [imperfecto] -> sintaxis/tiempos-verbales/contraste-pasado",
        "## [preterito] -> sintaxis/tiempos-verbales/contraste-pasado",
        "## [pretérito] -> sintaxis/tiempos-verbales/contraste-pasado",
        "## [时态] -> sintaxis/tiempos-verbales/contraste-pasado",
        "",
    ])

    index_lines.append("## Ortografía")
    index_lines.append("")
    index_lines.extend([
        "## [acentuacion] -> ortografia/acentuacion",
        "## [acentuación] -> ortografia/acentuacion",
        "## [重音] -> ortografia/acentuacion",
        "## [tilde] -> ortografia/acentuacion",
        "## [puntuacion] -> ortografia/puntuacion",
        "## [标点] -> ortografia/puntuacion",
        "",
    ])

    index_path = OUTPUT_DIR_AGENT / "index.md"
    index_path.write_text("\n".join(index_lines), encoding="utf-8")
    print(f"\nCreated index: {index_path}")


if __name__ == "__main__":
    main()
