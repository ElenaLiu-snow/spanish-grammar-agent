"""
RAE Knowledge Base retrieval service.

Simple keyword-based retrieval from a curated set of grammar reference files.
"""

import re
from pathlib import Path
from typing import List, Optional


class RAEKnowledgeBase:
    """Simple keyword-indexed RAE grammar knowledge base."""

    def __init__(self, knowledge_dir: Optional[Path] = None):
        if knowledge_dir is None:
            knowledge_dir = Path(__file__).parent.parent / "knowledge" / "rae"
        self.knowledge_dir = knowledge_dir
        self.index: dict[str, str] = {}  # keyword -> relative file path
        self._loaded = False

    def _ensure_loaded(self):
        """Lazy-load the index."""
        if self._loaded:
            return
        self._load_index()
        self._loaded = True

    def _load_index(self):
        """Parse the master index file for keyword -> file mappings."""
        index_path = self.knowledge_dir / "index.md"
        if not index_path.exists():
            print(f"[RAEKnowledgeBase] Index not found: {index_path}")
            return

        content = index_path.read_text(encoding="utf-8")
        # Format: ## [keyword] -> path/to/file
        for line in content.split("\n"):
            match = re.match(r"^##\s+\[(.+?)\]\s*->\s*(.+)$", line.strip())
            if match:
                keyword = match.group(1).strip().lower()
                file_path = match.group(2).strip()
                if keyword not in self.index:
                    self.index[keyword] = file_path

        print(f"[RAEKnowledgeBase] Loaded {len(self.index)} keywords from index")

    def extract_keywords(self, query: str) -> List[str]:
        """Extract grammar-related keywords from user query."""
        query_lower = query.lower()
        found = []
        for keyword in self.index.keys():
            if keyword in query_lower:
                found.append(keyword)
        return found

    def retrieve(self, query: str) -> str:
        """Retrieve relevant knowledge base content for a query.

        Returns empty string if nothing relevant found.
        """
        self._ensure_loaded()

        keywords = self.extract_keywords(query)
        if not keywords:
            return ""

        # Collect unique matched files (preserving priority: first match = highest)
        matched_files = []
        seen = set()
        for kw in keywords:
            if kw in self.index and self.index[kw] not in seen:
                matched_files.append(self.index[kw])
                seen.add(self.index[kw])

        if not matched_files:
            return ""

        # Load and concatenate matched files (limit to top 3)
        matched_files = matched_files[:3]
        sections = []
        for rel_path in matched_files:
            full_path = self.knowledge_dir / f"{rel_path}.md"
            if full_path.exists():
                content = full_path.read_text(encoding="utf-8")
                # Extract first ~80 lines as context
                lines = content.split("\n")
                excerpt = "\n".join(lines[:80])
                sections.append(f"--- 参考: {rel_path} ---\n{excerpt}")
            else:
                # Try without .md extension
                alt_path = Path(self.knowledge_dir, rel_path + ".md")
                if alt_path.exists():
                    content = alt_path.read_text(encoding="utf-8")
                    lines = content.split("\n")
                    excerpt = "\n".join(lines[:80])
                    sections.append(f"--- 参考: {rel_path} ---\n{excerpt}")

        if not sections:
            return ""

        result = "\n\n".join(sections)
        print(f"[RAEKnowledgeBase] Retrieved {len(sections)} files for query: {query[:60]}...")
        return result


# Singleton
_knowledge_base: Optional[RAEKnowledgeBase] = None


def get_knowledge_base() -> RAEKnowledgeBase:
    """Get the RAE knowledge base singleton."""
    global _knowledge_base
    if _knowledge_base is None:
        _knowledge_base = RAEKnowledgeBase()
    return _knowledge_base
