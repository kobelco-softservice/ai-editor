
// テキストを正規化する関数
export const normalizeText = (text: string) => {
    return text
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // 不可視文字を削除
      .replace(/\r\n/g, '\n') // CRLFをLFに統一
      .replace(/\r/g, '\n')   // CRをLFに統一
      .trim(); // 前後の空白を削除
  };