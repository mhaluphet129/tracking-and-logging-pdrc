import Visitor from "../../database/model/Visitor";
import Visit from "../../database/model/Visit";
import dbConnect from "../../database/dbConnect";
import { autoCap } from "../../assets/utilities";
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
            break;
          }
          case "get-violators-for-print": {
            try {
              return await Visit.find({}, { visitorId: 1, remarks: 1, _id: 0 })
                .populate("visitorId")
                .then((e) => {
                  let _ = [];

                  for (let i = 0; i < e.length; i++) {
                    e[i]?.remarks.forEach((__) => {
                      if (__.hasViolation)
                        _.push({
                          violatorName:
                            autoCap(e[i].visitorId.name) +
                            " " +
                            (e[i].visitorId.middlename != null
                              ? e[i].visitorId.middlename[0].toUpperCase() +
                                ". "
                              : "") +
                            autoCap(e[i].visitorId.lastname),
                          type: __?.type,
                          createdAt: __?.createdAt,
                          description: __?.description,
                        });
                    });
                  }

                  res.json({ status: 200, data: _ });
                  resolve();
                });
            } catch (err) {
              return res
                .status(500)
                .json({ success: false, message: "Error: " + err });
            }
            break;
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
