import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CsvImportForm } from "./upload-form";
import { confirmBusinessCsvAction, reviewBusinessCsvAction, type UploadReview } from "./actions";
vi.mock("./actions", () => ({ reviewBusinessCsvAction: vi.fn(), confirmBusinessCsvAction: vi.fn() }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
const good: UploadReview = { token: "signed-review", result: { ok: true, rows: [{ record: 1, data: { name: '<img src=x onerror="alert(1)">', industry: "roofing" } }], invalidRows: [{ record: 2, fields: { email: ["Enter a valid email address."] } }], duplicates: [{ record: 3, firstRecord: 1 }], counts: { valid: 1, invalid: 1, duplicate: 1 } } };
const submit = () => fireEvent.submit(screen.getByLabelText("Business CSV file").closest("form")!);
describe("CSV review UI", () => {
  it("shows counts, normalized text, errors and duplicates as escaped text", async () => {
    vi.mocked(reviewBusinessCsvAction).mockResolvedValue(good);
    const { container } = render(<CsvImportForm />);
    submit();
    expect(await screen.findByText(/1 valid, 1 invalid, 1 duplicate/)).toBeInTheDocument();
    expect(screen.getByText('<img src=x onerror="alert(1)">')).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText(/email: Enter a valid/)).toBeInTheDocument();
    expect(screen.getByText("Record 3 duplicates record 1.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Business CSV file"));
    expect(screen.queryByRole("region", { name: "CSV review" })).toBeNull();
  });
  it("clears previous results on failure and cancel", async () => {
    vi.mocked(reviewBusinessCsvAction).mockResolvedValueOnce(good).mockResolvedValueOnce({ error: "Malformed CSV" });
    render(<CsvImportForm />); submit();
    await screen.findByText(/1 valid, 1 invalid/);
    submit();
    expect(await screen.findByRole("alert")).toHaveTextContent("Malformed CSV");
    expect(screen.queryByRole("region", { name: "CSV review" })).toBeNull();
    fireEvent.click(screen.getByText("Start over"));
    expect(screen.queryByRole("alert")).toBeNull();
  });
  it("ignores an in-flight result after cancel or replacement", async () => {
    let complete!: (value: UploadReview) => void;
    vi.mocked(reviewBusinessCsvAction).mockImplementation(() => new Promise(resolve => { complete = resolve; }));
    render(<CsvImportForm />); submit();
    expect(screen.getByRole("button", { name: "Reviewing…" })).toBeDisabled();
    fireEvent.click(screen.getByText("Start over"));
    await act(async () => complete(good));
    expect(screen.queryByRole("region", { name: "CSV review" })).toBeNull();
    submit(); fireEvent.change(screen.getByLabelText("Business CSV file"));
    await act(async () => complete(good));
    await waitFor(() => expect(screen.queryByRole("region", { name: "CSV review" })).toBeNull());
  });
});

it("requires confirmation, prevents concurrent clicks and retries uncertainty with the same token", async () => {
  vi.mocked(reviewBusinessCsvAction).mockResolvedValue(good);
  let complete!: (value: { uncertain: boolean; error: string }) => void;
  vi.mocked(confirmBusinessCsvAction).mockImplementationOnce(() => new Promise(resolve => { complete = resolve; })).mockResolvedValueOnce({ inserted: 1, invalid: 1, duplicate: 1 });
  render(<CsvImportForm />); submit();
  await screen.findByText(/1 valid, 1 invalid/);
  expect(confirmBusinessCsvAction).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Confirm import" }));
  expect(screen.getByRole("button", { name: "Confirming…" })).toBeDisabled();
  // Switching to the form tab could abandon the import mid-save.
  expect(screen.getByRole("link", { name: "Enter details" })).toHaveAttribute("aria-disabled", "true");
  await act(async () => complete({ uncertain: true, error: "Unknown outcome" }));
  expect(screen.queryByText(/Nothing has been imported/)).toBeNull();
  expect(screen.getByRole("button", { name: "Review CSV" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Start over" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Retry same import" }));
  expect(await screen.findByText(/Imported 1 businesses/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Enter details" })).not.toHaveAttribute("aria-disabled");
  expect(vi.mocked(confirmBusinessCsvAction).mock.calls[0][0].get("reviewToken")).toBe("signed-review");
  expect(vi.mocked(confirmBusinessCsvAction).mock.calls[1][0].get("reviewToken")).toBe("signed-review");
});
it("disables zero-valid confirmation", async () => {
  vi.mocked(reviewBusinessCsvAction).mockResolvedValue({ ...good, result: { ...good.result!, rows: [], counts: { valid: 0, invalid: 1, duplicate: 0 } } });
  render(<CsvImportForm />); submit();
  expect(await screen.findByRole("button", { name: "Confirm import" })).toBeDisabled();
});
