import Visit from "../../database/model/Visit";
import dbConnect from "../../database/dbConnect";

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  switch (method) {
    case "GET":
      return new Promise(async (resolve, reject) => {
        return await Visit.aggregate([
          [
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
          ],
        ])
          .then((e) => {
            res.json({ status: 200, data: e });
            resolve();
          })
          .catch((err) => {
            res.status(500).json({ success: false, message: "Error: " + err });
          });
      });

    default:
      res.status(400).json({ success: false });
  }
}
