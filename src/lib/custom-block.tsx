import { createReactBlockSpec } from '@blocknote/react';

export const HorizontalLineBlock = createReactBlockSpec(
  {
    // ブロックの識別子を "horizontal_line" に設定
    type: 'horizontal_line',
    // このブロックはテキスト編集可能なコンテンツを持たない
    content: 'none',
    // プロパティは不要なため空のオブジェクト
    propSchema: {},
  },
  {
    // ブロックのレンダリングを定義
    render: () => {
      return (
        <hr
          style={{
            // border: 'none',
            // borderTop: '1px solid #ccc',
            // margin: '1em 0',
            // border: '1px solid #ccc',
            // borderRadius: '4px',
            // padding: '0.5em 0',
            // border: 'none',
            border: 'none',
            height: '1px',
            backgroundColor: '#ccc',
            margin: '1em 0',
            width: '100%',
          }}
        />
      );
    },
  }
);
