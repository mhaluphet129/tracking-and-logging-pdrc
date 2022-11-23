import Visit from "../../database/model/Visit";
import Visitor from "../../database/model/Visitor";
import dbConnect from "../../database/dbConnect";
import moment from "moment";

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  switch (method) {
    case "GET":
      return new Promise(async (resolve, reject) => {
        try {
          const startOfMonth = moment()
            .startOf("month")
            .format("YYYY-MM-DD hh:mm");
          const endOfMonth = moment().endOf("month").format("YYYY-MM-DD hh:mm");
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

          res.json({
            status: 200,
            data: { graphValue, totalVisitor, totalVisit, totalVisitMonth },
          });
        } catch (e) {
          res.status(500).json({ success: false, message: "Error: " + err });
        }
        resolve();
      });

    default:
      res.status(400).json({ success: false });
  }
}
