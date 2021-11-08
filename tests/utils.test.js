import { range } from "../src/utils";

describe("range", () => {
  it("return empty array if 0 is passed as single param", () => {
    const result = range(0);

    expect(result).toEqual([]);
  });

  it("return empty array if 0 is passed in both params", () => {
    const result = range(0, 0);

    expect(result).toEqual([]);
  });

  it("return an array with 0 if passed 0 and 1 as params", () => {
    const result = range(0, 1);

    expect(result).toEqual([0, 1]);
  });

  it("return an array with 1 if only passed 1 as param", () => {
    const result = range(1);

    expect(result).toEqual([0]);
  });

  it("return an array with 0, 1, 2 if passed 3 as param", () => {
    const result = range(3);

    expect(result).toEqual([0, 1, 2]);
  });

  it("return an array with 1, 2, 3 if passed 1, 3", () => {
    const result = range(1, 3);

    expect(result).toEqual([1, 2, 3]);
  });
});
