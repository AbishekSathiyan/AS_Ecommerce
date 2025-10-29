import express from "express";
import fetchAllRoute from "./FetchAll.js";
import addRoute from "./Add.js";
import updateRoute from "./Update.js";
import deleteRoute from "./Delete.js";
import searchRoute from "./Search.js";

const router = express.Router();

// Important: fetch all **must be mounted first**

router.use("/", fetchAllRoute);
router.use("/add", addRoute);
router.use("/update", updateRoute);
router.use("/delete", deleteRoute);
router.use("/search", searchRoute);

export default router;
