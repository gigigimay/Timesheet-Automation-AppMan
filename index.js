const Login = require("./common/login");
const { addNewTask } = require("./common/task");
const env = require("./config/env");
const Fs = require("fs/promises");
const puppeteer = require("puppeteer");

const optionDefinitions = [
  { name: "task", alias: "t", type: String },
  { name: "date", alias: "d", type: String },
  { name: "manhours", alias: "M", type: Number },
  { name: "project", alias: "p", type: Number },
  { name: "module", alias: "m", type: String },
  { name: "subTask", alias: "s", type: String },
  { name: "crNo", alias: "c", type: String },
  { name: "file", alias: "f", type: String },
];
const commandLineArgs = require("command-line-args");
const options = commandLineArgs(optionDefinitions);

(async () => {
  console.log(env);
  console.log(options);
  const browser = await puppeteer.launch({
    headless: false,
    waitForInitialPage: true,
    args: [
      "--user-data-dir=/Users/jeetsingh/Library/Application Support/Google/Chrome/Profile 1 ",
    ],
  });
  const page = await browser.newPage();
  const pages = await browser.pages();
  pages[0].close();
  await page.goto(env.TimesheetUrl);
  const didManualLogin = page.waitForFunction(() => {
    return window.location.href == "https://appmantimesheet.herokuapp.com/";
  });
  const login = Login(page);
  await Promise.race([didManualLogin, login]);

  if (options && options.file) {
    const data = await Fs.readFile(options.file);
    const tasks = JSON.parse(data);
    for (const config of tasks) {
      await addNewTask(page, config);
    }
  } else {
    if (Object.keys(options).length > 0) await addNewTask(page, options);
  }

  await browser.close();
})();
