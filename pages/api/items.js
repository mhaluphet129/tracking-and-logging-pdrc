import Item from "../../database/model/Item";
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

          // case "get-items": {
          //   let { id } = req.query;

          //   return await Item.find({ ownerId: ObjectId(id) })
          //     .then((e) => {
          //       res.json({ status: 200, data: e });
          //       resolve();
          //     })
          //     .catch((err) => {
          //       res
          //         .status(500)
          //         .json({ success: false, message: "Error: " + err });
          //     });
          // }

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
                  as: "ownerId",
                },
              },
              {
                $unwind: "$ownerId",
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
                res.json({
                  status: 200,
                  searchData: e,
                  analytics: {
                    total: e?.length,
                    totalClaimed: e?.filter((_) => _?.claimed)?.length,
                    totalUnclaimed: e?.filter((_) => !_?.claimed)?.length,
                    totalDisposed: e?.filter((_) =>
                      _?.status?.includes("DISPOSED")
                    )?.length,
                  },
                });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }
          case "delete-item": {
            return await Item.findOneAndDelete({ _id: req.query.id })
              .then(() => {
                res.json({ status: 200, message: "Deleted successsfully" });
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
          case "edit-items": {
            const { id } = req.body.payload;
            return Item.findOneAndUpdate(
              { _id: id },
              { $set: { ...req.body.payload } }
            )
              .then((e) => {
                res.json({ status: 200, message: "Successfully Updated" });
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
