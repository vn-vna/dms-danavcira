import { Handler } from "express";
import multer from "multer"
import path from "path";
import config from "config"

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const dest = config.get("storage.location") as string;
    callback(null, dest);
  },
  filename(req, file, callback) {
    callback(null, Date.now() + path.extname(file.originalname));
  },
});

const uploader = multer({ storage: storage });

export const post = [
  uploader.single('file'),
  ((req, res) => {
    const category = req.params.category as string;
  }) as Handler
]

export const get = [
  ((req, res) => {
    const category = req.params.category as string;
    res.status(200).send(category);
  }) as Handler
]