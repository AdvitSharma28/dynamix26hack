const fs = require('fs');
const path = require('path');
const connectDB = require('../../config/db');

const getPins = async (req, res, next) => {
  try {
    const db = connectDB.getDB();
    const pins = await db.all('SELECT * FROM travel_pins ORDER BY createdAt DESC');
    return res.success(pins, 'Pins retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

const createPin = async (req, res, next) => {
  try {
    const { title, lat, lng, category, caption, image, color } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length < 2) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Title is required and must be at least 2 characters.' } });
    }
    if (lat === undefined || lat === null || isNaN(Number(lat)) || Number(lat) < -90 || Number(lat) > 90) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Valid latitude is required (-90 to 90).' } });
    }
    if (lng === undefined || lng === null || isNaN(Number(lng)) || Number(lng) < -180 || Number(lng) > 180) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Valid longitude is required (-180 to 180).' } });
    }
    if (!category || typeof category !== 'string') {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Category is required.' } });
    }
    if (!caption || typeof caption !== 'string' || caption.trim().length < 5) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Caption is required and must be at least 5 characters.' } });
    }

    const hexColor = (color && /^#[0-9A-F]{6}$/i.test(color)) ? color : '#2d5a27';

    let image_path = null;

    if (image && typeof image === 'string' && image.startsWith('data:')) {
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        let ext = matches[1].split('/')[1] || 'jpg';
        if (ext === 'jpeg') ext = 'jpg';
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        if (buffer.length > 5 * 1024 * 1024) {
          return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Image size cannot exceed 5MB.' } });
        }

        const uniqueName = `pin_${Date.now()}_${Math.round(Math.random() * 1e9)}.${ext}`;
        const uploadsDir = path.join(__dirname, '../../../../frontend/uploads');

        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        fs.writeFileSync(path.join(uploadsDir, uniqueName), buffer);
        image_path = `/uploads/${uniqueName}`;
      } else {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid base64 image format.' } });
      }
    }

    const db = connectDB.getDB();
    const result = await db.run(
      `INSERT INTO travel_pins (title, lat, lng, category, caption, image_path, color) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title.trim(), Number(lat), Number(lng), category.trim(), caption.trim(), image_path, hexColor]
    );

    const newPin = await db.get('SELECT * FROM travel_pins WHERE id = ?', [result.lastID]);
    return res.success(newPin, 'Travel pin created successfully.');
  } catch (error) {
    next(error);
  }
};

const likePin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = connectDB.getDB();

    const pin = await db.get('SELECT id FROM travel_pins WHERE id = ?', [id]);
    if (!pin) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Pin not found.' } });
    }

    await db.run('UPDATE travel_pins SET likes = likes + 1 WHERE id = ?', [id]);
    const updatedPin = await db.get('SELECT * FROM travel_pins WHERE id = ?', [id]);

    return res.success(updatedPin, 'Pin liked successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPins,
  createPin,
  likePin
};
