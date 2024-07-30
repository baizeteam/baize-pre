export interface CommandInstance {
  main: string;
  subs: {
    [key: string]: {
      alias: string;
      description: string;
      examples: string[];
    };
  };
}
