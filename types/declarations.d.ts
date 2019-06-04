// Needed in order to be able to use "import" with scss files. Without this, only "required" can be used.
declare module '*.scss' {
  const content: { [className: string]: string };
  export = content;
}