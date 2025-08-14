import * as fs from "fs";
import * as path from "path";

// Not sure if we still need this one but keeping for now
export function parseLog(logContent: string) {
  //console.log("logContent--------", logContent);
  if (!logContent) return [""];
  return logContent.trim().split("\n");
}

function parseLogFile(filePath: string) {
  //console.log("Reading file:", filePath);

  const logContent = fs.readFileSync(filePath, "utf8");
  const lines = parseLog(logContent);

  const visitsCount = countPageViews(lines);
  const uniqueVisits = countUniquePageViews(lines);
  //console.log("visitsCount", visitsCount )
 // console.log("uniqueVisits", uniqueVisits )

  // Add console logging for processing 
//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i].trim();
//     if (!line) continue;

//     // const parts = line.split(/\s+/);
//     // const url = parts[0];
//     // const ip = parts[1];

//     // if (url && ip) {
//     //   console.log("Processing", i + 1, ":", url, ip);
//     // }
//   }

  return { visitsCount, uniqueVisits };
}

function sortAndFormat(counts: any, label: string) {
  //console.log("Sorting for label-----", label);
  let arr = Object.entries(counts);
  console.log("arr", arr);
  arr.sort((a: any, b: any) => b[1] - a[1]);

  const result: string[] = [];
  for (const item of arr) {
    result.push(`${item[0]} ${item[1]} ${label}`);
    //console.log("Adding sorted item:", item[0], item[1]);
  }

  return result;
}
export function countPageViews(lines: string[]): { [url: string]: number } {
  let visitsCount: { [url: string]: number } = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      console.warn(`Empty line at index ${i} ------> skipping`);
      continue;
    }

    const parts = line.split(/\s+/);
    const url = parts[0];
    const ip = parts[1];

    if (!url || !ip) {
      console.warn("no url and ip:", line);
      continue;
    }

    // Count total visits
    if (!visitsCount[url]) {
      visitsCount[url] = 0;
    }
    visitsCount[url] += 1;
  }

  return visitsCount;
}

export function countUniquePageViews(lines: string[]): { [url: string]: Set<string> } {
  let uniqueVisits: { [url: string]: Set<string> } = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      console.warn(`Empty line at index ${i} -----> skipping`);
      continue;
    }

    const parts = line.split(/\s+/);
    const url = parts[0];
    const ip = parts[1];

    if (!url || !ip) {
      console.warn("no url and ip:", line);
      continue;
    }

    // Count unique visits
    if (!uniqueVisits[url]) {
      uniqueVisits[url] = new Set();
    }
    uniqueVisits[url].add(ip);
  }

  return uniqueVisits;
}


function main() {
  const log_path = path.join(__dirname, "../web.log");

  if (!fs.existsSync(log_path)) {
    console.error("!!! Log file not found:", log_path);
    process.exit(1);
  }

  //console.log("Log path resolved", log_path);
  const { visitsCount, uniqueVisits } = parseLogFile(log_path);

  console.log("Most Page Views -------");
  console.log(sortAndFormat(visitsCount, "visits").join("\n"));

  console.log("Most Unique Page Views -------");

  let uniqueCount: any = {};
  for (let page in uniqueVisits) {
    uniqueCount[page] = (uniqueVisits as any)[page].size;
    //console.log(`Counting unique for ${page}: ${uniqueCount[page]}`);
  }

  console.log(sortAndFormat(uniqueCount, "unique views").join("\n"));

}

// Only run main if this file is executed directly, not when imported
if (require.main === module) {
  main();
}
