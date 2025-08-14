README.md
# AICPA Log Parser

Parses a log file (`web.log`) and outputs:
1. Pages sorted by total visits
2. Pages sorted by unique views

## Install
```sh
npm install

Run
npm run dev

Build
npm run build

Start
npm start

Test
npm test

Example Output

 Pages by Total Visits:
/contact 4 visits
/home 3 visits
/about 2 visits
...

 Pages by Unique Views:
/home 3 unique views
/contact 4 unique views
/about 1 unique views
...