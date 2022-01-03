export type EditType = "cursor" | "addNode" | "addEdges" | "delete";
export type NodeData = {
  id: string;
  name: string;
  description: string;
  urls: string | string[];
  nodetype: string;
  relative_importance: number;
  parent: string;
};
export type ParentNodeData = {
  colour: string;
  id: string;
  name: string;
  nodetype: string;
};
export type ShowEditData = "concept" | "topic";
export type NotificationData = {
  title: string;
  message: string;
  Icon: Function;
  colour: string;
  show: boolean;
};
