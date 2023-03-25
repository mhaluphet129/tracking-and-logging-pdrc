import Visit from "../../database/model/Visit";
import Visitor from "../../database/model/Visitor";
import Item from "../../database/model/Item";
import dbConnect from "../../database/dbConnect";
import moment from "moment";

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  switch (method) {
    case "GET":
      return new Promise(async (resolve, reject) => {
        try {
          const { filter } = req.query;

          if (filter == "Monthly") {
            const startOfMonth = moment()
              .startOf("month")
              .format("YYYY-MM-DD hh:mm");
            const endOfMonth = moment()
              .endOf("month")
              .format("YYYY-MM-DD hh:mm");
            let graphValue = await Visit.aggregate([
              {
                $project: {
                  month: { $month: "$date" },
                },
              },
              {
                $group: {
                  _id: "$month",
                  count: { $sum: 1 },
                },
              },
            ]);

            let totalVisitor = await Visitor.countDocuments();
            let totalVisit = await Visit.countDocuments();
            let totalVisitMonth = await Visit.countDocuments({
              createdAt: { $gte: startOfMonth, $lte: endOfMonth },
            });
            let items = await Item.find();

            res.json({
              status: 200,
              data: {
                graphValue,
                totalVisitor,
                totalVisit,
                totalVisitMonth,
                items,
              },
            });
          } else if (filter == "Daily") {
            const startOfDay = moment().startOf("day");

            const endOfDay = moment().endOf("day");
            let graphValue = await Visit.aggregate([
              {
                $match: {
                  createdAt: {
                    $gte: new Date(startOfDay),
                    $lte: new Date(endOfDay),
                  },
                },
              },
              {
                $project: {
                  hour: { $hour: "$date" },
                },
              },
              {
                $group: {
                  _id: "$hour",
                  count: { $sum: 1 },
                },
              },
            ]);
            let totalVisitor = await Visitor.countDocuments();
            let totalVisit = await Visit.countDocuments();
            let totalVisitDay = await Visit.countDocuments({
              createdAt: {
                $gte: new Date(startOfDay),
                $lte: new Date(endOfDay),
              },
            });
            let items = await Item.find();

            res.json({
              status: 200,
              data: {
                graphValue,
                totalVisitor,
                totalVisit,
                totalVisitMonth: totalVisitDay,
                items,
              },
            });
          } else {
            const startOfDay = moment().startOf("year");
            const endOfDay = moment().endOf("year");

            let graphValue = await Visit.aggregate([
              {
                $project: {
                  year: { $year: "$date" },
                },
              },
              {
                $group: {
                  _id: "$year",
                  count: { $sum: 1 },
                },
              },
            ]);

            let totalVisitor = await Visitor.countDocuments();
            let totalVisit = await Visit.countDocuments();
            let totalVisitYear = await Visit.countDocuments({
              createdAt: {
                $gte: new Date(startOfDay),
                $lte: new Date(endOfDay),
              },
            });
            let items = await Item.find();
            console.log(totalVisitYear);
            res.json({
              status: 200,
              data: {
                graphValue,
                totalVisitor,
                totalVisit,
                totalVisitMonth: totalVisitYear,
                items,
              },
            });
          }
          resolve();
        } catch (err) {
          res.status(500).json({ success: false, message: "Error: " + err });
        }
      });

    default:
      res.status(400).json({ success: false });
  }
}
