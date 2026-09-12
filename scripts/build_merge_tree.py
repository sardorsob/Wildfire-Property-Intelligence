#!/usr/bin/env python3
"""Build D3-ready merge tree JSON from color_pool greedy merge sequence."""
import json
from pathlib import Path

# Merge sequence from color_pool.ipynb (merged -> canonical, votes)
MERGE_LIST = [
    ("brown", "cocoa", 371.5),
    ("terracotta", "orange", 94.0),
    ("sage", "green", 48.5),
    ("blue", "azure", 46.0),
    ("coffee", "cocoa", 212.0),
    ("green", "olive", 94.5),
    ("lavender", "navy", 88.0),
    ("indigo", "azure", 50.5),
    ("foo", "red", 31.5),
    ("azure", "purple", 162.5),
    ("beige", "cocoa", 93.0),
    ("gray", "alabaster", 53.5),
    ("verde", "olive", 51.0),
    ("sienna", "orange", 36.5),
    ("lilac", "navy", 36.0),
    ("grey", "alabaster", 78.5),
    ("lemon", "amber", 41.5),
    ("aqua", "navy", 36.5),
    ("purple", "red", 31.0),
    ("ivory", "alabaster", 152.0),
    ("yellow", "amber", 70.5),
    ("crimson", "red", 62.0),
    ("aquamarine", "navy", 44.0),
    ("gold", "amber", 65.0),
    ("scarlet", "red", 40.0),
]

def make_leaf(name):
    return {"name": name, "value": 0}


def get_leaves(node, leaves=None):
    if leaves is None:
        leaves = []
    if "children" not in node:
        leaves.append(node.get("name", ""))
    else:
        for child in node["children"]:
            get_leaves(child, leaves)
    return leaves


def build_tree():
    # Root node for each color's current cluster.
    roots = {}

    for merged, canonical, votes in MERGE_LIST:
        if merged not in roots:
            roots[merged] = {"name": merged}
        if canonical not in roots:
            roots[canonical] = {"name": canonical}

        merged_root = roots[merged]
        canonical_root = roots[canonical]
        if merged_root is canonical_root:
            continue

        new_node = {
            "name": canonical,
            "value": round(votes, 1),
            "children": [merged_root, canonical_root],
        }
        for color in get_leaves(merged_root) + get_leaves(canonical_root):
            roots[color] = new_node

    # Find the unique cluster roots in the D3 display order.
    group_order = ["red", "navy", "cocoa", "olive", "alabaster", "amber", "orange"]
    seen = set()
    top_by_canonical = {}
    for color, node in roots.items():
        if id(node) in seen:
            continue
        seen.add(id(node))
        leaves = get_leaves(node)
        canonical = max(
            leaves,
            key=lambda name: (
                name in group_order,
                group_order.index(name) if name in group_order else 99,
                name,
            ),
        )
        top_by_canonical[canonical] = node
        node["name"] = canonical.upper()

    top_list = [top_by_canonical[color] for color in group_order if color in top_by_canonical]
    return {"name": "root", "children": top_list}


def main():
    tree = build_tree()
    out_path = (
        Path(__file__).parent.parent
        / "website"
        / "frontend"
        / "public"
        / "data"
        / "color-pool-merge-tree.json"
    )
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(tree, f, indent=2)
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
