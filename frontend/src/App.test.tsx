import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("MeetMind", () => {
  it("renders transcript input and analysis call to action", () => {
    render(<App />);
    expect(screen.getByText("Meeting transcript")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /analyze meeting/i })).toBeInTheDocument();
  });
});
