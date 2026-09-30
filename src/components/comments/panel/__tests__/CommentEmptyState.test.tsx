import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CommentEmptyState } from "../CommentEmptyState";

describe("CommentEmptyState component", () => {
  it("renders open empty state message and triggers onStartPlacing", () => {
    const handleStartPlacing = vi.fn();
    const handleResetDemo = vi.fn();

    render(
      <CommentEmptyState
        activeFilter="open"
        onStartPlacing={handleStartPlacing}
        onResetDemo={handleResetDemo}
      />
    );

    expect(screen.getByText("No open comments")).toBeInTheDocument();
    const addBtn = screen.getByRole("button", { name: /add comment/i });
    expect(addBtn).toBeInTheDocument();

    fireEvent.click(addBtn);
    expect(handleStartPlacing).toHaveBeenCalledTimes(1);

    const restoreBtn = screen.getByRole("button", { name: /restore demo comments/i });
    fireEvent.click(restoreBtn);
    expect(handleResetDemo).toHaveBeenCalledTimes(1);
  });

  it("renders resolved empty state message without add button", () => {
    const handleStartPlacing = vi.fn();

    render(
      <CommentEmptyState
        activeFilter="resolved"
        onStartPlacing={handleStartPlacing}
      />
    );

    expect(screen.getByText("No resolved comments")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /add comment/i })).not.toBeInTheDocument();
  });
});

