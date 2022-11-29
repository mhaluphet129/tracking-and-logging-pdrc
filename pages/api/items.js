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
              { _id: { $in: ids } },
              { $set: { claimed: true } },
              { new: true }
            )
              .then(async () => {
                let data = await Item.find();
                res.json({ status: 200, message: "Check out done.", data });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }

          case "get-items": {
            let { id } = req.query;

            return await Item.find({ ownerId: ObjectId(id) })
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

          case "get-items-all": {
            try {
              let items = await Item.find().populate("ownerId");
              let total = await Item.countDocuments();
              let totalClaimed = await Item.countDocuments({ claimed: true });
              let totalUnclaimed = await Item.countDocuments({
                claimed: false,
              });
              let totalDisposed = await Item.countDocuments({
                status: { $in: ["DISPOSED"] },
              });

              res.json({
                status: 200,
                data: {
                  items,
                  analytics: {
                    total,
                    totalClaimed,
                    totalUnclaimed,
                    totalDisposed,
                  },
                },
              });
            } catch (err) {
              res
                .status(500)
                .json({ success: false, message: "Error: " + err });
            }
          }

          case "search-items": {
            const { searchKeyword } = req.query;
            var re = new RegExp(searchKeyword?.trim(), "i");

            return await Item.aggregate([
              {
                $lookup: {
                  from: "visitors",
                  localField: "ownerId",
                  foreignField: "_id",
                  as: "owner",
                },
              },
              {
                $unwind: "$owner",
              },
              {
                $match: {
                  $or: [
                    { name: { $regex: re } },
                    { description: { $regex: re } },
                    { "owner.name": { $regex: re } },
                    { "owner.middlename": { $regex: re } },
                    { "owner.lastname": { $regex: re } },
                  ],
                },
              },
            ])
              .collation({ locale: "en" })
              .sort({ name: 1 })
              .then((e) => {
                res.json({ status: 200, searchData: e });
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
