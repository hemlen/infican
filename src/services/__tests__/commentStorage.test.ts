import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createDemoThreads,
  loadStoredThreads,
  saveStoredThreads,
  resetStoredThreadsToDemo,
  loadStoredUsername,
  saveStoredUsername,
} from "../commentStorage";
import type { CommentThread } from "../../types/comment";

describe("commentStorage service", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("createDemoThreads", () => {
    it("creates a default set of demo threads with required fields", () => {
      const threads = createDemoThreads();
      expect(Array.isArray(threads)).toBe(true);
      expect(threads.length).toBeGreaterThan(0);

      const first = threads[0];
      expect(first).toHaveProperty("id");
      expect(first).toHaveProperty("author");
      expect(first).toHaveProperty("avatarColor");
      expect(first).toHaveProperty("content");
      expect(typeof first.position.x).toBe("number");
      expect(typeof first.position.y).toBe("number");
      expect(first.zoom).toBeGreaterThan(0);
      expect(["open", "resolved"]).toContain(first.status);
      expect(Array.isArray(first.replies)).toBe(true);
    });

    it("includes both open and resolved threads for filtering demo", () => {
      const threads = createDemoThreads();
      const openThreads = threads.filter((t) => t.status === "open");
      const resolvedThreads = threads.filter((t) => t.status === "resolved");

      expect(openThreads.length).toBeGreaterThan(0);
      expect(resolvedThreads.length).toBeGreaterThan(0);
    });
  });

  describe("loadStoredThreads & saveStoredThreads", () => {
    it("returns fresh demo threads and seeds localStorage when storage is empty", () => {
      const loaded = loadStoredThreads();
      expect(loaded.length).toBeGreaterThan(0);

      const storedRaw = localStorage.getItem("infican_comments_v2");
      expect(storedRaw).not.toBeNull();
      const parsed = JSON.parse(storedRaw!);
      expect(parsed.length).toBe(loaded.length);
    });

    it("loads persisted threads from localStorage if valid data exists", () => {
      const customThreads: CommentThread[] = [
        {
          id: "custom-1",
          author: "Tester",
          avatarColor: "bg-blue-500",
          content: "Custom test comment",
          createdAt: 100000,
          position: { x: 50, y: 100 },
          zoom: 1.5,
          status: "open",
          replies: [],
        },
      ];

      saveStoredThreads(customThreads);
      const loaded = loadStoredThreads();

      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe("custom-1");
      expect(loaded[0].content).toBe("Custom test comment");
      expect(loaded[0].position).toEqual({ x: 50, y: 100 });
    });

    it("recovers gracefully from corrupted JSON in localStorage", () => {
      localStorage.setItem("infican_comments_v2", "{ corrupt json !! }");
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const loaded = loadStoredThreads();
      expect(loaded.length).toBeGreaterThan(0);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("sanitizes invalid or corrupted thread positions (NaN/non-numeric)", () => {
      const corruptedData = [
        {
          id: "corrupted-1",
          author: "Broken",
          position: { x: "invalid", y: NaN },
          zoom: -2,
          status: "invalid-status",
          replies: null,
        },
      ];

      localStorage.setItem("infican_comments_v2", JSON.stringify(corruptedData));
      const loaded = loadStoredThreads();

      expect(loaded).toHaveLength(1);
      expect(loaded[0].position.x).toBe(0);
      expect(loaded[0].position.y).toBe(0);
      expect(loaded[0].zoom).toBe(1);
      expect(loaded[0].status).toBe("open");
      expect(loaded[0].replies).toEqual([]);
    });
  });

  describe("resetStoredThreadsToDemo", () => {
    it("resets storage to default demo threads", () => {
      saveStoredThreads([]);
      const reset = resetStoredThreadsToDemo();

      expect(reset.length).toBeGreaterThan(0);
      const reloaded = loadStoredThreads();
      expect(reloaded.length).toBe(reset.length);
    });
  });

  describe("loadStoredUsername & saveStoredUsername", () => {
    it("defaults to 'You' when username is not set", () => {
      expect(loadStoredUsername()).toBe("You");
    });

    it("saves and reloads custom username", () => {
      saveStoredUsername("Alice Engineer");
      expect(loadStoredUsername()).toBe("Alice Engineer");
    });
  });
});

