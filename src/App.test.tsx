import { fireEvent, render, waitFor } from "@testing-library/react";
import React from "react";
import App from "./App";

test("orders cards by earliest correctly", async () => {
  const { getByTestId, getAllByTestId } = render(<App />);

  const earliestButton = getByTestId("earliest-button");
  fireEvent.click(earliestButton);

  await waitFor(() => {
    expect(getAllByTestId("date")[0]).toBeInTheDocument();
  });

  for (let i = 0; i < getAllByTestId("date").length - 1; i++) {
    var date1 = new Date(getAllByTestId("date")[i].innerHTML);
    var date2 = new Date(getAllByTestId("date")[i + 1].innerHTML);

    expect(date1.getTime()).toBeLessThanOrEqual(date2.getTime());
  }
});

test("orders cards by latest correctly", async () => {
  const { getByTestId, getAllByTestId } = render(<App />);

  const latestButton = getByTestId("latest-button");
  fireEvent.click(latestButton);

  await waitFor(() => {
    expect(getAllByTestId("date")[0]).toBeInTheDocument();
  });

  for (let i = 0; i < getAllByTestId("date").length - 1; i++) {
    var date1 = new Date(getAllByTestId("date")[i].innerHTML);
    var date2 = new Date(getAllByTestId("date")[i + 1].innerHTML);

    expect(date2.getTime()).toBeLessThanOrEqual(date1.getTime());
  }
});
