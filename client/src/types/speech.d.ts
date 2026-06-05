export type BrowserSpeechRecognitionStatus =
    | "unsupported"
    | "idle"
    | "listening"
    | "transcript-ready"
    | "no-speech"
    | "permission-denied"
    | "error";

export type BrowserSpeechRecognitionConstructor = {
    new(): BrowserSpeechRecognition;
};

export type BrowserSpeechRecognition = EventTarget & {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;

    start: () => void;
    stop: () => void;
    abort: () => void;

    onstart: ((event: Event) => void) | null;
    onend: ((event: Event) => void) | null;
    onresult: ((event: BrowserSpeechRecognitionResultEvent) => void) | null;
    onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
};

export type BrowserSpeechRecognitionResultEvent = Event & {
    results: BrowserSpeechRecognitionResultList;
};

export type BrowserSpeechRecognitionErrorEvent = Event & {
    error:
    | "no-speech"
    | "aborted"
    | "audio-capture"
    | "network"
    | "not-allowed"
    | "service-not-allowed"
    | "bad-grammar"
    | "language-not-supported"
    | string;
    message?: string;
};

export type BrowserSpeechRecognitionResultList = {
    length: number;
    item: (index: number) => BrowserSpeechRecognitionResult;
    [index: number]: BrowserSpeechRecognitionResult;
};

export type BrowserSpeechRecognitionResult = {
    length: number;
    isFinal: boolean;
    item: (index: number) => BrowserSpeechRecognitionAlternative;
    [index: number]: BrowserSpeechRecognitionAlternative;
};

export type BrowserSpeechRecognitionAlternative = {
    transcript: string;
    confidence: number;
};

declare global {
    interface Window {
        SpeechRecognition?: BrowserSpeechRecognitionConstructor;
        webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
    }
}