const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../docs');
const SIDEBARS_PATH = path.join(__dirname, '../sidebars.js');
const OUTPUT_PATH = path.join(__dirname, '../static/knowledge-graph.json');

// Compact summary length for token efficiency
const MAX_SUMMARY_LENGTH = 100;

/**
 * Basic Markdown Parser to extract title, links, summary, and keywords
 */
function parseMarkdown(content) {
    const result = { title: '', links: [], summary: '', keywords: [] };

    // Extract Title (first H1)
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
        result.title = h1Match[1].trim();
    }

    // Extract Links [text](url) - only internal relative links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
        const link = match[2];
        if (!link.startsWith('http') && !link.startsWith('#') && !link.startsWith('mailto:')) {
            result.links.push(link);
        }
    }

    // Extract Keywords (based on bold text or specific markers)
    const keywordRegex = /\*\*([^*]+)\*\*/g;
    const keywordsFound = new Set();
    while ((match = keywordRegex.exec(content)) !== null) {
        const kw = match[1].trim();
        if (kw.length > 2 && kw.length < 30 && !kw.includes('\n')) {
            keywordsFound.add(kw);
        }
        if (keywordsFound.size >= 5) break;
    }
    result.keywords = Array.from(keywordsFound);

    // Extract Summary (first meaningful paragraph)
    const lines = content.split('\n');
    let inFrontmatter = false;
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === '---') { inFrontmatter = !inFrontmatter; continue; }
        if (inFrontmatter || trimmed === '' || trimmed.startsWith('#') ||
            trimmed.startsWith('import ') || trimmed.startsWith(':::') ||
            trimmed.startsWith('<') || trimmed.startsWith('{') ||
            trimmed.startsWith('export ')) continue;

        // Clean summary of markdown artifacts
        let summary = trimmed
            .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove bold
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
            .replace(/`([^`]+)`/g, '$1'); // Remove code blocks

        if (summary.length > MAX_SUMMARY_LENGTH) {
            summary = summary.substring(0, MAX_SUMMARY_LENGTH) + '…';
        }
        result.summary = summary;
        break;
    }

    return result;
}

/**
 * Recursively walk docs directory
 */
function walk(dir, fileList = []) {
    for (const file of fs.readdirSync(dir)) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walk(filePath, fileList);
        } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

/**
 * Normalize a relative link to a doc ID
 */
function normalizeLink(link, sourceId) {
    if (link.startsWith('http') || link.startsWith('#') || link.startsWith('mailto:')) {
        return null;
    }

    // Resolve relative path using node's path module
    const sourceDir = path.dirname(sourceId);
    let resolvedPath = path.join(sourceDir, link).replace(/\.mdx?$/, '');

    // Normalize and ensure forward slashes
    let targetId = path.normalize(resolvedPath).replace(/\\/g, '/');

    // Handle directory mapping (link to folder resolve to folder/index)
    // Note: This is a heuristic, real docusaurus resolution is more complex
    if (targetId.endsWith('/') || targetId === '.' || targetId === '..') {
        targetId = path.join(targetId, 'index');
    }

    return targetId.replace(/\\/g, '/');
}

/**
 * Main execution
 */
function generate() {
    console.log('Generating Knowledge Graph (refined/compact mode)...');

    // n = nodes: [id, title, summary, keywords[]]
    // e = edges: [source, target, type]
    const graph = { n: [], e: [] };
    const edgeSet = new Set();
    const nodeIds = new Set();

    const files = walk(DOCS_DIR).map(f => ({ path: f }));

    // First pass: collect all nodes
    for (const file of files) {
        const relativePath = path.relative(DOCS_DIR, file.path);
        const id = relativePath.replace(/\.mdx?$/, '').replace(/\\/g, '/');
        const content = fs.readFileSync(file.path, 'utf8');
        const parsed = parseMarkdown(content);

        // Compact node: [id, title, summary?, keywords?[]]
        const node = [id, parsed.title || path.basename(id)];
        if (parsed.summary || (parsed.keywords && parsed.keywords.length > 0)) {
            node.push(parsed.summary || "");
            if (parsed.keywords && parsed.keywords.length > 0) {
                node.push(parsed.keywords);
            }
        }
        graph.n.push(node);
        nodeIds.add(id);

        // Store source links for second pass
        file.sourceLinks = parsed.links;
        file.docId = id;
    }

    // Second pass: create edges
    for (const file of files) {
        const id = file.docId;
        const links = file.sourceLinks || [];

        for (const link of links) {
            const targetId = normalizeLink(link, id);
            if (!targetId) continue;

            const edgeKey = `${id}|${targetId}|l`;
            if (!edgeSet.has(edgeKey)) {
                edgeSet.add(edgeKey);
                graph.e.push([id, targetId, 'l']);
            }
        }

        // Automatic Hierarchy: Link nested files to their parent index
        const parts = id.split('/');
        if (parts.length > 1) {
            // If I am 'a/b/c', my parent is 'a/b/index'
            // If I am 'a/b/index', my parent is 'a/index'
            let parentId;
            if (parts[parts.length - 1] === 'index') {
                parentId = parts.slice(0, -2).join('/') + (parts.length > 2 ? '/index' : 'index');
                if (parts.length === 2 && parts[0] !== '') parentId = 'index';
            } else {
                parentId = parts.slice(0, -1).join('/') + '/index';
            }

            // Clean up parentId
            if (parentId && parentId.startsWith('/')) parentId = parentId.substring(1);

            if (parentId && parentId !== id && nodeIds.has(parentId)) {
                const hEdgeKey = `${parentId}|${id}|h`;
                if (!edgeSet.has(hEdgeKey)) {
                    edgeSet.add(hEdgeKey);
                    graph.e.push([parentId, id, 'h']);
                }
            }
        }
    }

    // Add manual hierarchy from sidebars if present (fallback/complement)
    const SIDEBAR_JS = fs.existsSync(SIDEBARS_PATH.replace('.js', '.ts')) ? SIDEBARS_PATH.replace('.js', '.ts') : SIDEBARS_PATH;
    if (fs.existsSync(SIDEBAR_JS)) {
        try {
            const sidebarContent = fs.readFileSync(SIDEBAR_JS, 'utf8');
            const autoMatch = /dirName:\s*['"]([^'"]+)['"]/g;
            let m;
            while ((m = autoMatch.exec(sidebarContent)) !== null) {
                const dir = m[1];
                const parentId = dir === '.' ? 'index' : dir + '/index';

                if (nodeIds.has(parentId)) {
                    for (const node of graph.n) {
                        const nodeId = node[0];
                        // Link direct children of the dir that are not the index itself
                        if (nodeId.startsWith(dir === '.' ? '' : dir + '/') &&
                            nodeId !== parentId &&
                            nodeId.split('/').length === (dir === '.' ? 1 : dir.split('/').length + 1)) {

                            const edgeKey = `${parentId}|${nodeId}|h`;
                            if (!edgeSet.has(edgeKey)) {
                                edgeSet.add(edgeKey);
                                graph.e.push([parentId, nodeId, 'h']);
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('Could not parse sidebar file:', e.message);
        }
    }


    // Minified JSON
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(graph));

    const stats = fs.statSync(OUTPUT_PATH);
    console.log(`Success! Graph written to ${OUTPUT_PATH}`);
    console.log(`  Nodes: ${graph.n.length}, Edges: ${graph.e.length}`);
    console.log(`  Final Size: ${(stats.size / 1024).toFixed(1)} KB`);
}

generate();
