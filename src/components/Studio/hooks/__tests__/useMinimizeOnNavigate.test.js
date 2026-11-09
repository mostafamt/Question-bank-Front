import { renderHook } from "@testing-library/react";
import useMinimizeOnNavigate from "../useMinimizeOnNavigate";

describe("useMinimizeOnNavigate", () => {
  it("does not minimize on mount or when the key is unchanged", () => {
    const minimize = jest.fn();
    const { rerender } = renderHook(
      ({ key }) => useMinimizeOnNavigate(key, minimize),
      { initialProps: { key: "0:" } }
    );
    rerender({ key: "0:" });
    expect(minimize).not.toHaveBeenCalled();
  });

  it("minimizes with the latest callback when the page or block changes", () => {
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = renderHook(
      ({ key, cb }) => useMinimizeOnNavigate(key, cb),
      { initialProps: { key: "0:", cb: first } }
    );
    rerender({ key: "1:", cb: second });
    rerender({ key: "1:block-7", cb: second });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(2);
  });
});
