export function buildActionPrompt(action: string, text: string, option?: string): string {
  switch(action) {
    case 'freeform':
      //選択中の文字がある場合
      if (text.length > 0) {
        return `以下の文章について、${option}\n\n対象の文章:\n"${text}"`;
      }
      else {
        return `${option}`;
      }

    case 'summarize':
      if (option === 'short') {
        return `以下の文章を短い文章で要約した文章を作成してください:\n\n"${text}"`;
      } else if(option === 'medium') {
        return `以下の文章を1段落に要約してください:\n\n"${text}"`;
      } else if(option === 'bullets') {
        return `以下の文章を箇条書きで要約してください:\n\n"${text}"`;
      }
      else {
        return `以下の文章を要約してください:\n\n"${text}"`;
      }
    case 'translate':
      if(option === 'en') {
        return `以下の文章を英語に翻訳してください:\n\n"${text}"`;
      } else if(option === 'zh') {
        return `以下の文章を中国語に翻訳してください:\n\n"${text}"`;
      } else if(option === 'ko') {
        return `以下の文章を韓国語に翻訳してください:\n\n"${text}"`;
      } else if(option === 'ja') {
        return `以下の文章を日本語に翻訳してください:\n\n"${text}"`;
      }
      return `以下の文章の翻訳を行ってください:\n\n"${text}"`;
    case 'tone':
      if(option === 'casual') {
        return `以下の文章をカジュアルな文体に変更してください:\n\n"${text}"`;
      } else if(option === 'formal') {
        return `以下の文章をフォーマルな文体に変更してください:\n\n"${text}"`;
      } else if(option === 'business') {
        return `以下の文章をビジネスライクな文体に変更してください:\n\n"${text}"`;
      }
      return `以下の文章の文体を変更してください:\n\n"${text}"`;
    case 'continue':
      return `以下の続きの文章を、同じ文体とトーンを保って執筆してください:\n\n"${text}"`;
    case 'grammarCheck':
      return `以下の文章の文法と綴りをチェックし、必要に応じた修正案を示してください:\n\n"${text}"`;
    case 'paraphrase':
      if (option === 'casual') {
        return `以下の文章をカジュアルな表現に言い換えてください:\n\n"${text}"`;
      } else if(option === 'formal') {
        return `以下の文章をフォーマルな表現に言い換えてください:\n\n"${text}"`;
      }
      return `以下の文章を別の表現で言い換えてください:\n\n"${text}"`;
    case 'title':
      return `以下の文章に基づいて、キャッチーで魅力的なタイトルを生成してください:\n\n"${text}"`;
    case 'restructure':
      // return `以下の文章をより読みやすくなるように再構成してください:\n\n"${text}"`;
      if (option === 'article') {
        return `以下の文章を一般記事向けに、1.はじめに、2.目次、3.目次の詳細記事の構成にしてください。見出し、段落分け、文章の流れに注意を払い、一般読者にも理解しやすい形に整理してください:\n\n"${text}"`;
      } else if (option === 'academic') {
        return `以下の文章を学術論文形式で再構成してください。序論、本論、結論の構成を明確にし、論理的な展開と客観的な表現を心がけ、参考文献や引用の形式にも配慮してください:\n\n"${text}"`;
      } else if (option === 'report') {
        return `以下の文章をビジネス報告書形式で再構成してください。目的、現状分析、課題、解決策、まとめの順で構成し、簡潔で正確な表現を使用してください:\n\n"${text}"`;
      } else if (option === 'blog') {
        return `以下の文章を絵文字を使ったキャッチーなブログ記事形式で再構成してください。読者の興味を引く導入、わかりやすい見出し、適度な改行、親しみやすい表現を用いて、読みやすい形に整理してください:\n\n"${text}"`;
      } else if (option === 'newsletter') {
        return `以下の文章をメールマガジン形式で再構成してください。読者への語りかけを意識し、重要なポイントを強調し、スキャンしやすい構成と簡潔な表現を心がけてください:\n\n"${text}"`;
      }
      return `以下の文章をより読みやすくなるように再構成してください:\n\n"${text}"`;

    case 'creativeExtend':
      return `以下の文章に創造的なアイディアや独自の表現を追加して、内容を拡充してください:\n\n"${text}"`;
    case 'improveVocabulary':
      return `以下の文章の語彙を、文脈に適したより豊かな表現に改善してください:\n\n"${text}"`;
    case 'removeRedundancy':
      return `以下の文章から冗長な表現や重複する内容を削除し、簡潔に修正してください:\n\n"${text}"`;
    case 'unifyStyle':
      return `以下の文章の文体を一貫性のあるスタイルに統一してください:\n\n"${text}"`;
    default:
      return text;
  }
} 