const fs = require('fs/promises');
const { format, endOfMonth, subMonths, getUnixTime } = require('date-fns');
const cron = require('node-cron');

const trace_dir = process.env.TRACE_PATH || "/traces";
const archive_dir = process.env.ARCHIVE_PATH || "/traces/archives"; 
const keep = Number(process.env.KEEP_MONTHS) || 1;
(async () => {
  console.log("Starting Archiver");
  cron.schedule('0 1 * * *', async () => {
    try {
      console.log("Archiving Data");
      if (!(await exists(trace_dir))) {
        console.error("Can't Find traces");
        return;
      }
      if (!(await exists(archive_dir))) {
        console.log("Generating Archive Directory");
        await fs.mkdir(archive_dir);
      }

      const files = await fs.readdir(trace_dir);
      let year_and_month = "";
      let year_month_day = "";
      //let current_day = "";
      const current_day = format(new Date(), "yyyyMMdd");
      //console.log("MMMMMMMMMMM");
      for await (const file of createAsyncIterable(files)) {
        if (!file.includes(".pcap")) {
          continue;
        }
        //console.log(file);
        const date = file.split("_")[1];
        if (date === current_day) {
          continue;
        }
        let current_year_month = `${date.substring(0,4)}-${date.substring(4,6)}`;
        let day = `${current_year_month}-${date.substring(6)}`;
        
        //console.log(date);
        if (current_year_month !== year_and_month) {
          console.log(date);
          console.log(current_year_month);
          year_and_month = current_year_month;
          await generateDir(`${archive_dir}/${year_and_month}`);
        }

        if (day !== year_month_day) {
          year_month_day = day;
          await generateDir(`${archive_dir}/${year_and_month}/${day}`);
        }

        await fs.rename(`${trace_dir}/${file}`, `${archive_dir}/${year_and_month}/${day}/${file}`);
      }
      //console.log("Found traces", files);
    } catch (err) {
      console.log(err);
    }
    //Start up
  });

  cron.schedule('* 2 * * *', async () => {
    try {
      const oldest_date = subMonths(new Date(), keep);
      const current_day = new Date();
      const oldest_year = format(oldest_date, "yyyy");
      const oldest_month = format(oldest_date, "M");
      /*
      console.log(oldest_date);
      console.log(current_day);
      console.log(oldest_month);
      */
      const directories = await fs.readdir(archive_dir);
      //console.log(directories);
      for await (const dir of createAsyncIterable(directories)) {
        const full_path_dir = archive_dir + "/" + dir;
        //Remove unformatted options
        if ((await fs.lstat(full_path_dir)).isFile() || !/[0-9]{4}-[0-9]{2}/.test(dir)) {
          //Destroy
          console.log("Invalid File/Dir in Archives");
          continue;
        }

        const dir_array = dir.split('-');
        //console.log(format(endOfMonth(new Date(`${dir_array[0]}-${dir_array[1]}-01 00:00:00`)), "yyyy-MM-dd HH:mm:ss"));
        const seconds = getUnixTime(endOfMonth(new Date(`${dir_array[0]}-${dir_array[1]}-01 00:00:00`)));
        const oldest_seconds = getUnixTime(oldest_date);
        console.log(seconds);
        console.log(oldest_seconds);
        if (oldest_seconds > seconds) {
          console.log(`Deleting: ${dir}`);
          await fs.rmdir(full_path_dir);
        }
        //Maybe Remove Individual Days as well as the whole month
      }
    } catch (err) {
      console.log(err);
    }
    //Start up
  });
  
})();


const generateDir = async (path) => {
  if (!(await exists(path))) {
    //console.log("Generating Archive Directory");
    await fs.mkdir(path);
  }
}

const exists = async (path) => {
  try {
    await fs.lstat(path);
    return true;
  } catch (err) {
    return false;
  }
}
const createAsyncIterable = async function*(iterable) {                                                                                                     for (const elem of iterable) {
    yield elem;
  }
}