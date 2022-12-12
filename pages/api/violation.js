import Visitor from "../../database/model/Visitor";
import Visit from "../../database/model/Visit";
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
          case "fetch-violation-total": {
            try {
              let violators = await Visit.find({
                "remarks.hasViolation": true,
              }).populate("visitorId");

              let totalVisitor = await Visitor.countDocuments();

              return res.json({
                status: 200,
                data: {
                  list: violators,
                  count: violators?.length,
                  totalVisitor,
                },
              });
            } catch (err) {
              return res
                .status(500)
                .json({ success: false, message: "Error: " + err });
            }
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
