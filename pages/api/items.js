import Item from "../../database/model/Item";
import dbConnect from "../../database/dbConnect";
var ObjectId = require("mongodb").ObjectId;

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  switch (method) {
    case "GET":
      return new Promise(async (resolve, reject) => {
        const { mode } = req.query;
        switch (mode) {
          case "claim-true": {
            let { ids } = req.query;
            ids = JSON.parse(ids);
            return await Item.updateMany(
              { _id: { $in: [...ids] } },
              { $set: { claimed: true } }
            )
              .then(() => {
                res.json({ status: 200, message: "Check out done." });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }
        }
      });
    case "POST": {
      return new Promise(async (resolve, reject) => {
        const { mode } = req.body.payload;
        switch (mode) {
        }
      });
    }
    default:
      res.status(400).json({ success: false });
  }
}
