import type { Block } from '@blocknote/core';

export function blocksToMarkdown(blocks: Block[]): string {
  let md = '';

  for (const block of blocks) {
    const text = getBlockText(block);
    
    switch (block.type) {
      case 'heading': {
        const level = (block.props as any)?.level || 1;
        md += `${'#'.repeat(level)} ${text}\n\n`;
        break;
      }
      case 'bulletListItem': {
        md += `- ${text}\n`;
        break;
      }
      case 'numberedListItem': {
        md += `1. ${text}\n`;
        break;
      }
      case 'checkListItem': {
        const checked = (block.props as any)?.checked ? '[x]' : '[ ]';
        md += `- ${checked} ${text}\n`;
        break;
      }
      case 'codeBlock': {
        const language = (block.props as any)?.language || '';
        md += `\`\`\`${language}\n${text}\n\`\`\`\n\n`;
        break;
      }
      case 'paragraph':
      default: {
        if (text.trim()) {
          md += `${text}\n\n`;
        } else {
          md += '\n';
        }
        break;
      }
    }
  }

  return md.trim();
}

function getBlockText(block: any): string {
  if (!block.content) return '';
  if (typeof block.content === 'string') return block.content;
  if (Array.isArray(block.content)) {
    return block.content
      .map((item: any) => {
        if (typeof item === 'string') return item;
        return item.text || '';
      })
      .join('');
  }
  return '';
}

export function downloadMarkdownFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.md') ? filename : `${filename}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
