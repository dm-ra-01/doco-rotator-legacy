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
    let targetId = link.replace(/\.mdx?$/, '').replace(/^\.\//, '');
    if (link.startsWith('../') || !link.includes('/')) {
        const dir = path.dirname(sourceId);
        targetId = path.normalize(path.join(dir, link)).replace(/\.mdx?$/, '');
    }
    // If target ends in /, append index (handle directory mapping)
    if (targetId.endsWith('/') || targetId === '.') {
        targetId = path.join(targetId, 'index');
    }
    return targetId.replace(/\\/g, '/'); // Ensure forward slashes for IDs
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

    const files = walk(DOCS_DIR);

    for (const file of files) {
        const relativePath = path.relative(DOCS_DIR, file);
        const id = relativePath.replace(/\.mdx?$/, '');
        const content = fs.readFileSync(file, 'utf8');
        const parsed = parseMarkdown(content);

        // Compact node: [id, title, summary?, keywords?[]]
        const node = [id, parsed.title || path.basename(id)];
        if (parsed.summary || parsed.keywords.length > 0) {
            node.push(parsed.summary || "");
            if (parsed.keywords.length > 0) {
                node.push(parsed.keywords);
            }
        }
        graph.n.push(node);

        // Edges from links
        for (const link of parsed.links) {
            const targetId = normalizeLink(link, id);
            const edgeKey = `${id}|${targetId}|l`;
            if (!edgeSet.has(edgeKey)) {
                edgeSet.add(edgeKey);
                graph.e.push([id, targetId, 'l']);
            }
        }
    }

    // Add hierarchy from sidebars
    const SIDEBAR_JS = fs.existsSync(SIDEBARS_PATH.replace('.js', '.ts')) ? SIDEBARS_PATH.replace('.js', '.ts') : SIDEBARS_PATH;
    if (fs.existsSync(SIDEBAR_JS)) {
        try {
            // Simple regex extraction for autogenerated dirs and explicit IDs since we can't 'require' TS easily without ts-node
            const sidebarContent = fs.readFileSync(SIDEBAR_JS, 'utf8');

            // Match autogenerated dirs: { type: 'autogenerated', dirName: '...' }
            const autoMatch = /dirName:\s*['"]([^'"]+)['"]/g;
            let m;
            while ((m = autoMatch.exec(sidebarContent)) !== null) {
                const dir = m[1];
                const parentId = dir === '.' ? null : dir;
                // Add hierarchy for files in this dir
                for (const node of graph.n) {
                    if (node[0].startsWith(dir === '.' ? '' : dir + '/') && !node[0].includes('/', (dir === '.' ? 0 : dir.length + 1))) {
                        if (parentId && node[0] !== parentId) {
                            graph.e.push([parentId, node[0], 'h']);
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
