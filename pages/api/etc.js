import Visitor from "../../database/model/Visitor";
import dbConnect from "../../database/dbConnect";

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  switch (method) {
    case "GET":
      return new Promise(async (resolve, reject) => {
        const { mode } = req.query;
        switch (mode) {
          case "verify-name": {
            const { name, middlename, lastname } = req.query;
            let countMiddleName = 0;
            try {
              let countName = await Visitor.countDocuments({ name });
              if (middlename != "")
                countMiddleName = await Visitor.countDocuments({
                  middlename,
                });

              let countLastname = await Visitor.countDocuments({ lastname });
              let total = await Visitor.countDocuments();

              res.json({
                status: 200,
                message: "Success",
                data: { countName, countMiddleName, countLastname, total },
              });
            } catch (err) {
              res
                .status(500)
                .json({ success: false, message: "Error: " + err });
            }
            resolve();
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
