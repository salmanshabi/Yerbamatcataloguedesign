// These declarations tell TypeScript to treat /images/* imports as string (URL) values.
// Vite resolves absolute paths starting with '/' from the public folder at runtime.
declare module '*.png' {
    const value: string;
    export default value;
}

declare module '*.jpg' {
    const value: string;
    export default value;
}

declare module '*.jpeg' {
    const value: string;
    export default value;
}

declare module '*.svg' {
    const value: string;
    export default value;
}
