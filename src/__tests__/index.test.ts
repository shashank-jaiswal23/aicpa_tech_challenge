import fs from "fs";
import path from "path";
import { parseLog, countPageViews, countUniquePageViews } from "../index";

describe("parseLog", () => {
  it("splits log content into separate lines for each entry", () => {
    const sampleLog = [
      "/home 123.456.789.000",
      "/about 987.654.321.000",
      "/contact 111.222.333.444"
    ].join("\n");

    const result = parseLog(sampleLog);

    // We expect three lines to be returned exactly as they appear
    expect(result.length).toBe(3);
    expect(result).toEqual([
      "/home 123.456.789.000",
      "/about 987.654.321.000",
      "/contact 111.222.333.444"
    ]);
  });

  it("returns an array with a single empty string when input is empty", () => {
    expect(parseLog("")).toEqual([""]);
  });

  it("ignores any accidental extra empty lines at the end", () => {
    const sampleLog = "/home 123.456.789.000\n/about 987.654.321.000\n/contact 111.222.333.444\n";
    const result = parseLog(sampleLog);
    expect(result).toEqual([
      "/home 123.456.789.000",
      "/about 987.654.321.000",
      "/contact 111.222.333.444"
    ]);
  });
});

describe("countPageViews", () => {
  it("counts total visits for each page", () => {
    const logLines = [
      "/home 192.168.1.1",
      "/about 192.168.1.2",
      "/home 192.168.1.3",
      "/contact 192.168.1.1",
      "/home 192.168.1.4"
    ];

    const result = countPageViews(logLines);

    expect(result["/home"]).toBe(3);
    expect(result["/about"]).toBe(1);
    expect(result["/contact"]).toBe(1);
  });

  it("handles empty lines gracefully", () => {
    const logLines = [
      "/home 192.168.1.1",
      "",
      "/about 192.168.1.2",
      "   ",
      "/home 192.168.1.3"
    ];

    const result = countPageViews(logLines);

    expect(result["/home"]).toBe(2);
    expect(result["/about"]).toBe(1);
  });
});

describe("countUniquePageViews", () => {
  it("counts unique visitors for each page", () => {
    const logLines = [
      "/home 192.168.1.1",
      "/home 192.168.1.1", // same IP, should not increase unique count
      "/home 192.168.1.2", // different IP, should increase unique count
      "/about 192.168.1.1",
      "/about 192.168.1.3"
    ];

    const result = countUniquePageViews(logLines);

    expect(result["/home"].size).toBe(2); // 192.168.1.1 and 192.168.1.2
    expect(result["/about"].size).toBe(2); // 192.168.1.1 and 192.168.1.3
    expect(result["/home"].has("192.168.1.1")).toBe(true);
    expect(result["/home"].has("192.168.1.2")).toBe(true);
    expect(result["/about"].has("192.168.1.1")).toBe(true);
    expect(result["/about"].has("192.168.1.3")).toBe(true);
  });
});

describe("Real web.log analysis", () => {
  let logData: string;

  beforeAll(() => {
    const logPath = path.join(__dirname, "../../web.log");
    if (fs.existsSync(logPath)) {
      logData = fs.readFileSync(logPath, "utf-8");
    }
  });

  it("should parse all log lines from web.log", () => {
    if (!logData) {
      console.warn("web.log file not found, skipping real data test");
      return;
    }

    const lines = parseLog(logData);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines[0]).toMatch(/^\/\w+/); // starts with a slash
  });

  it("should find most visited pages from web.log", () => {
    if (!logData) {
      console.warn("web.log file not found, skipping real data test");
      return;
    }

    const lines = parseLog(logData);
    const visits = countPageViews(lines);

    const sorted = Object.entries(visits).sort((a, b) => b[1] - a[1]);
    const [topPage, topCount] = sorted[0];

    // Based on the actual data, /contact should be the most visited
    expect(topPage).toBe("/contact");
    expect(topCount).toBe(71);

    // Verify all expected URLs are present
    expect(visits["/contact"]).toBe(71);
    expect(visits["/home"]).toBe(69);
    expect(visits["/products"]).toBe(67); // Note: it's /products (plural), not /product
    expect(visits["/index"]).toBe(67);
    expect(visits["/products/1"]).toBe(64);
    expect(visits["/about"]).toBe(58);
    expect(visits["/products/3"]).toBe(54);
    expect(visits["/products/2"]).toBe(50);
  });

  it("should find most unique page views from web.log", () => {
    if (!logData) {
      console.warn("web.log file not found, skipping real data test");
      return;
    }

    const lines = parseLog(logData);
    const uniqueVisits = countUniquePageViews(lines);

    const sortedUnique = Object.entries(uniqueVisits).sort(
      (a, b) => b[1].size - a[1].size
    );
    const [topPage, ips] = sortedUnique[0];

    // Based on the console output we saw, /contact should also be the top unique page
    expect(topPage).toBe("/contact");
    expect(ips.size).toBeGreaterThan(55);
  });
});
