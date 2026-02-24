const db = require('../config/db');

// --- GET NOTIFICATIONS ---
exports.getNotifications = async (req, res) => {
  const { userId } = req.params;
  const client = await db.connect();

  try {
    const query = `
      SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `;
    const result = await client.query(query, [userId]);
    res.status(200).json(result.rows);

  } catch (error) {
    console.error("Erreur getNotifications :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des notifications." });
  } finally {
    client.release();
  }
};

// --- MARK AS READ ---
exports.markAsRead = async (req, res) => {
  const { notificationId } = req.params;
  const client = await db.connect();

  try {
    const query = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1
    `;
    await client.query(query, [notificationId]);
    res.status(200).json({ message: "Notification marquée comme lue." });

  } catch (error) {
    console.error("Erreur markAsRead :", error);
    res.status(500).json({ message: "Erreur serveur." });
  } finally {
    client.release();
  }
};

// --- MARK ALL AS READ ---
exports.markAllAsRead = async (req, res) => {
  const { userId } = req.params;
  const client = await db.connect();

  try {
    const query = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = $1
    `;
    await client.query(query, [userId]);
    res.status(200).json({ message: "Toutes les notifications ont été marquées comme lues." });

  } catch (error) {
    console.error("Erreur markAllAsRead :", error);
    res.status(500).json({ message: "Erreur serveur." });
  } finally {
    client.release();
  }
};
