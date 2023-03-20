const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const odbc = require("odbc");
const dotenv = require("dotenv");
const env = dotenv.config().parsed;
const app = express();
const port = 9090;
// const localIp = '192.168.100.22'
const localIp = "192.168.93.24";
const func = require("./functions/index");

app.use(bodyParser.json({ limit: "100mb" }));
app.use(
    bodyParser.urlencoded({
        limit: "100mb",
        extended: true,
    })
);
app.use(cors());

const connection = async(odbcName) => {
    return await odbc
        .connect(`DSN=${odbcName}`)
        .then((result) => {
            console.log(`ODBC ${odbcName} connected.`);
            return result;
        })
        .catch((err) => {
            console.log(err);
            return err;
        });
};

app.get("/getInspection/:date/:licenseNo/:odbcName", async(req, res) => {
    const date = req.params.date;
    // const licenseNo = req.params.licenseNo.split(' ')[1]
    const licenseNo = req.params.licenseNo.substr(-4);
    const odbcname = req.params.odbcName;

    const newYear = Number(date.split("-")[0]); // 543 is convert Christ to Budd
    const regex = /(\d{4})-(\d{2})-(\d{2})/g;
    const newDate = date.replace(regex, `${newYear}$2$3`); // convert year to budd
    console.log(newDate)

    await func.odbc
        .getData(await connection(odbcname), newDate, licenseNo)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});

app.post("/snapshot", async(req, res) => {
    const config = req.body;
    await func.carmera
        .getSnapshot(config.ip, config.port, config.user, config.pass)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});

app.listen(port, localIp, () => {
    console.log(`App running on: ${localIp}:${port}`);
    // await odbcConnect()
});