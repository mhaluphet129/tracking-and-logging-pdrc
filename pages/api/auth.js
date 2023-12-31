import Admin from "../../database/model/Admin";
import dbConnect from "../../database/dbConnect";

//4.24.1
export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  switch (method) {
    case "GET":
      return new Promise(async (resolve, reject) => {
        const { email } = req.query;
        return await Admin.findOne({ email }).then((e) => {
          if (e) {
            if (e.password)
              res.json({ status: 403, message: "User/Email already exist." });
            else res.json({ status: 200, message: "New User detected." });
          } else res.json({ status: 404, message: "User not found" });
          resolve();
        });
      });
    case "POST": {
      return new Promise(async (resolve, reject) => {
        const { mode } = req.body.payload;
        switch (mode) {
          case "login": {
            const { email, password } = req.body.payload;
            await Admin.findOne({ email })
              .then((e) => {
                if (e == null) {
                  res.json({ status: 404, message: "Account not found." });
                } else if (e.password == password) {
                  res.json({
                    status: 200,
                    message: "Login Successfully",
                    currentUser: e,
                  });
                } else {
                  res.status(200).json({
                    status: 403,
                    message: "Wrong Password",
                  });
                }
                resolve();
              })
              .catch(() => {
                res.status(500).json({ message: "Error in the server." });
              });
            break;
          }
          case "signup": {
            const { email } = req.body.payload;
            await Admin.findOne({ email, role: "admin" })
              .then((e) => {
                if (e == null) {
                  res.json({ status: 404, message: "Account not found." });
                } else
                  res.json({
                    status: 200,
                  });
              })
              .catch(() => {
                res.status(500).json({ message: "Error in the server." });
              });
            break;
          }

          case "new-user": {
            const { email } = req.body.payload;
            await Admin.findOneAndUpdate(
              { email },
              { $set: { ...req.body.payload } },
              { returnOriginal: false }
            )
              .then((e) => {
                res.json({
                  status: 200,
                  message: "Successfully updated the account",
                  currentUser: e,
                });
              })
              .catch(() => {
                res.status(500).json({ message: "Error in the server." });
              });
            break;
          }
        }
      });
    }
    default:
      res.status(400).json({ success: false });
  }
}
