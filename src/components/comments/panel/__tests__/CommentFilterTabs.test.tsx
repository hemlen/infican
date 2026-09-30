import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CommentFilterTabs } from "../CommentFilterTabs";

describe("CommentFilterTabs component", () => {
  it("renders both Open and Resolved tabs with correct counter badges", () => {
    const handleSelect = vi.fn();
    render(
      <CommentFilterTabs
        activeFilter="open"
        openCount={4}
        resolvedCount={2}
        onSelectFilter={handleSelect}
      />
    );

    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Resolved")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("calls onSelectFilter when switching to resolved tab", () => {
    const handleSelect = vi.fn();
    render(
      <CommentFilterTabs
        activeFilter="open"
        openCount={3}
        resolvedCount={1}
        onSelectFilter={handleSelect}
      />
    );

    const resolvedBtn = screen.getByRole("button", { name: /resolved/i });
    fireEvent.click(resolvedBtn);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith("resolved");
  });

  it("calls onSelectFilter when clicking open tab", () => {
    const handleSelect = vi.fn();
    render(
      <CommentFilterTabs
        activeFilter="resolved"
        openCount={3}
        resolvedCount={1}
        onSelectFilter={handleSelect}
      />
    );

    const openBtn = screen.getByRole("button", { name: /open/i });
    fireEvent.click(openBtn);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith("open");
  });
});

