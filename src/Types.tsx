export type Tag = {
  name: string;
};

export type Exercise = {
  id: string;
  name: string;
  tags: Tag[];
  favorite: boolean;
  batteryName: string;
  numberErrorsSolution: number;
  statusSolution: string;
};

export type ErrorSpring = {
  timestamp?: string;
  status: number;
  error: string;
  trace?: string;
  message: string;
  path: string;
};
