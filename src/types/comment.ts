import type { Point } from "./canvas";

export type CommentStatus = "open" | "resolved";

export interface CommentReply {
  id: string;
  author: string;
  avatarColor: string;
  content: string;
  createdAt: number;
}

export interface CommentThread {
  id: string;
  author: string;
  avatarColor: string;
  content: string;
  createdAt: number;
  position: Point;
  zoom?: number;
  status: CommentStatus;
  replies: CommentReply[];
}
