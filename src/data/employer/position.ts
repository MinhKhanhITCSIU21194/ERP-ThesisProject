export type Position = {
  id: string;
  name: string;
  level: string;
  orderNumber: number;
  parentId: string;
  levels: Level[];
};
export type Level = {
  id: string;
  level: string;
  orderNumber: number;
  parentId: string;
  salary: string;
};

export type PositionResponse = {
  position: Position;
};

export type PositionsResponse = {
  positions: Position[];
  pageSize: number;
  pageIndex: number;
  count: number;
};

export type PositionRequest = {
  id?: string;
  name: string;
  level: string;
  orderNumber: number;
  salary: number;
  levels: string[];
};
export type position_levels = {
  id: string;
  level: string;
  orderNumber: number;
  parentId: string;
};

export type PositionLevelsResponse = {
  position_levels: position_levels[];
  pageSize: number;
  pageIndex: number;
  count: number;
};
