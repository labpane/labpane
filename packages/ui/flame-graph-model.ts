/** Inclusive and exclusive values use the same unit supplied to the chart. */
export type FlameNode = {
  id: string;
  parentId: string | null;
  name: string;
  total: number;
  self: number;
  calls: number;
  /** Caller-supplied source or location detail, shown without interpreting it. */
  detail?: string;
  color?: string;
};

export type FlameRect = {
  node: FlameNode;
  x: number;
  width: number;
  depth: number;
};

const MAX_DEPTH = 256;

const hasWeight = (node: FlameNode) =>
  Number.isFinite(node.total) && node.total > 0;

export function indexFlameNodes(nodes: FlameNode[]): Map<string, FlameNode> {
  return new Map(nodes.map((node) => [node.id, node]));
}

function childrenByParent(nodes: FlameNode[]): Map<string, FlameNode[]> {
  const children = new Map<string, FlameNode[]>();
  for (const node of nodes) {
    if (node.parentId === null) continue;
    const siblings = children.get(node.parentId) ?? [];
    siblings.push(node);
    children.set(node.parentId, siblings);
  }
  for (const siblings of children.values())
    siblings.sort(
      (a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
    );
  return children;
}

/** Lays out a caller-provided tree. Horizontal position is alphabetical, not time. */
export function flameLayout(
  nodes: FlameNode[],
  focusId: string,
  width: number,
): FlameRect[] {
  const root = indexFlameNodes(nodes).get(focusId);
  if (!root || !hasWeight(root)) return [];
  const children = childrenByParent(nodes);
  const rects: FlameRect[] = [];
  const seen = new Set<string>();
  function visit(node: FlameNode, x: number, w: number, depth: number) {
    if (seen.has(node.id) || depth > MAX_DEPTH || !Number.isFinite(w) || w <= 0)
      return;
    seen.add(node.id);
    rects.push({ node, x, width: w, depth });
    const list = (children.get(node.id) ?? []).filter(hasWeight);
    // Children never draw wider than their parent, even when their totals disagree with it.
    const denominator = Math.max(
      node.total,
      list.reduce((sum, child) => sum + child.total, 0),
    );
    let left = x;
    for (const child of list) {
      const childWidth = (w * child.total) / denominator;
      visit(child, left, childWidth, depth + 1);
      left += childWidth;
    }
  }
  visit(root, 0, width, 0);
  return rects;
}

/** Ancestry from the root down to the node, for breadcrumbs and search results. */
export function flamePath(
  nodes: FlameNode[] | Map<string, FlameNode>,
  id: string,
): FlameNode[] {
  const byId = nodes instanceof Map ? nodes : indexFlameNodes(nodes);
  const path: FlameNode[] = [];
  const seen = new Set<string>();
  let node = byId.get(id);
  while (node && !seen.has(node.id)) {
    seen.add(node.id);
    path.unshift(node);
    node = node.parentId === null ? undefined : byId.get(node.parentId);
  }
  return path;
}
