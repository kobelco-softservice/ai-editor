import { useState } from 'react';

export const useStreamingResponse = () => {
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startStreaming = async (payload: Record<string, unknown>, endpoint: string = '/api/stream') => {
        setLoading(true);
        setResult('');
        setError(null);

        if (process.env.NODE_ENV === 'development') {
            console.log('Starting streaming with payload:', payload);
        }

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (process.env.NODE_ENV === 'development') {
                console.log('Response status:', response.status);
                console.log('Response headers:', Object.fromEntries(response.headers.entries()));
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                if (process.env.NODE_ENV === 'development') {
                    console.error('API Error Response:', errorText);
                }
                throw new Error(`APIリクエストに失敗しました: ${response.status} ${response.statusText}\n${errorText}`);
            }

            // ストリーミングレスポンスの処理
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantMessageContent = '';
            let incomplete = ''; // 分割途中のデータ保持用

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    const text = incomplete + chunk;
                    const lines = text.split("\n");
                    incomplete = lines.pop() || "";
                    for (const line of lines) {
                        if (!line.trim()) continue;
                        try {
                            const parsed = JSON.parse(line);
                            if (parsed.text) {
                                assistantMessageContent += parsed.text;
                                // アシスタントメッセージを更新
                                // console.log(assistantMessageContent);
                                setResult(assistantMessageContent);
                            }
                        } catch (e) {
                            if (process.env.NODE_ENV === 'development') {
                                console.error("JSON parse error:", e);
                            }
                        }
                    }
                }
                // 残っている不完全なデータの処理（存在する場合）
                if (incomplete.trim()) {
                    try {
                        const parsed = JSON.parse(incomplete);
                        if (parsed.text) {
                            assistantMessageContent += parsed.text;
                            // console.log(assistantMessageContent);
                            setResult(assistantMessageContent);
                        }
                    } catch (e) {
                        if (process.env.NODE_ENV === 'development') {
                            console.error("JSON parse error on incomplete data:", e);
                        }
                    }
                }
            }

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            if (process.env.NODE_ENV === 'development') {
                console.error('Streaming error:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    return { result, loading, error, startStreaming };
}; 