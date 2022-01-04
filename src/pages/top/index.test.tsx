import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { Top } from "./index";

test("renders", () => {
  render(
    <MemoryRouter>
      <Top />
    </MemoryRouter>
  );
  const linkElement = screen.getByText(/My Experimental Site/i);
  expect(linkElement).toBeInTheDocument();
});
