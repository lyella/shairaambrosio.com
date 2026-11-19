import rehypePrismPlus from "rehype-prism-plus";
import { visit } from "unist-util-visit";
import type { Node } from "unist";

interface HtmlNode extends Node {
  tagName: string;
  type: "element";
  children?: (HtmlNode | TextNode)[];
  properties?: {
    [prop: string]: string[] | string | undefined;
  };
}

interface TextNode extends Node {
  type: "text";
  value: string;
}

interface PreNode extends HtmlNode {
  tagName: "pre";
  properties?: {
    className?: string[] | undefined;
    [prop: string]: string[] | string | undefined;
  };
}
interface CodeNode extends HtmlNode {
  tagName: "code";
  properties?: {
    className?: string[] | undefined;
    [prop: string]: string[] | string | undefined;
  };
}

function isPreNode(node: Node): node is PreNode {
  return node && node.type === "element" && (node as PreNode).tagName === "pre";
}
function isCodeNode(node: Node): node is CodeNode {
  return node && node.type === "element" && (node as CodeNode).tagName === "code";
}

// The stylesheet hangs the language badge off `pre[data-lang]`, but neither prism
// plugin emits that attribute: prism-js classes the `code` element with
// `language-*`. This transformer copies the language onto the `pre` so the badge
// and the `code.language-css` / `code.language-ts` theme selectors keep working.
export function addDataToCodeBlocks(): import("unified").Transformer {
  return (tree) => {
    visit(tree, "element", (node: Node) => {
      if (!isPreNode(node) && !isCodeNode(node)) {
        return;
      }

      const prefix = "language-";
      const lang = node.properties?.className?.find((className) => className.startsWith(prefix))?.slice(prefix.length);
      if (lang) {
        node.properties = {
          ...node.properties,
          "data-lang": lang,
        };
      }
    });
  };
}

// rehype-prism-plus replaces @mapbox/rehype-prism, which has not shipped since 0.9.0
// and pinned prismjs 1.27 (DOM-clobbering advisory). `showLineNumbers` is off: the
// design pre-dates line numbers and adding them would shift every code block.
export const commonRehypePlugins = [rehypePrismPlus, addDataToCodeBlocks];
