import Visit from "../../database/model/Visit";
import dbConnect from "../../database/dbConnect";
import moment from "moment";

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  switch (method) {
    case "GET":
      return new Promise(async (resolve, reject) => {
        const { mode } = req.query;

        switch (mode) {
          case "get-visit-data": {
            const { id } = req.query;

            return await Visit.find({ visitorId: id })
              .sort({ createdAt: -1 })
              .then((e) => {
                res.json({ status: 200, data: e });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }
          case "fetch-recent": {
            return await Visit.find({})
              .populate("visitorId")
              .sort({ createdAt: -1 })
              .then((e) => {
                res.json({ status: 200, data: e });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }

          case "visit-out": {
            return await Visit.findOneAndUpdate(
              { _id: req.query.id },
              {
                $set: {
                  timeOutDone: true,
                  timeOut: moment(),
                },
              }
            )
              .then((e) => {
                res.json({ status: 200 });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }
          case "visit-with-timers": {
            return await Visit.find({
              timeOutDone: false,
              // timeOut: { $gte: moment() },
            })
              .populate("visitorId")
              .sort({ timeOut: -1 })
              .then((e) => {
                res.json({ status: 200, data: e });
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
          case "new-visit": {
            let newVisit = Visit(req.body.payload.data);
            return await newVisit
              .save()
              .then(() => {
                res.json({ status: 200, message: "Successfully Added" });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }
          case "new-remarks": {
            let { id, title, hasViolation, description } = req.body.payload;
            return await Visit.findOneAndUpdate(
              { _id: id },
              { $push: { remarks: { title, description, hasViolation } } }
            )
              .then(() => {
                res.json({ status: 200, message: "Successfully Added" });
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
    }
    default:
      res.status(400).json({ success: false });
  }
}
