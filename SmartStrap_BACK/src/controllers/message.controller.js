const db = require('../config/db');

// --- SEND MESSAGE ---
exports.sendMessage = async (req, res) => {
  const { sender_id, receiver_id, content } = req.body;
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // 1. Insert message into DB
    const insertMsgQuery = `
      INSERT INTO messages (sender_id, receiver_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const msgResult = await client.query(insertMsgQuery, [sender_id, receiver_id, content]);
    const message = msgResult.rows[0];

    // 2. Create notification for the receiver
    const insertNotifQuery = `
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES ($1, 'message', 'Nouveau message', $2, $3)
    `;
    const notificationData = JSON.stringify({ sender_id, message_id: message.id });
    await client.query(insertNotifQuery, [receiver_id, content.substring(0, 50), notificationData]);

    await client.query('COMMIT');
    
    // Note: WebSocket emit will be handled here or by returning to client
    res.status(201).json(message);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Erreur sendMessage :", error);
    res.status(500).json({ message: "Erreur serveur lors de l'envoi du message." });
  } finally {
    client.release();
  }
};

// --- GET MESSAGES BETWEEN TWO USERS ---
exports.getMessages = async (req, res) => {
  const { userId, otherId } = req.params;
  const client = await db.connect();

  try {
    const query = `
      SELECT * FROM messages
      WHERE (sender_id = $1 AND receiver_id = $2)
         OR (sender_id = $2 AND receiver_id = $1)
      ORDER BY created_at ASC
    `;
    const result = await client.query(query, [userId, otherId]);
    res.status(200).json(result.rows);

  } catch (error) {
    console.error("Erreur getMessages :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des messages." });
  } finally {
    client.release();
  }
};

// --- GET CONVERSATIONS LIST ---
exports.getConversations = async (req, res) => {
  const { userId } = req.params;
  const client = await db.connect();

  try {
    // This query gets the latest message for each contact the user has chatted with
    const query = `
      WITH last_messages AS (
        SELECT 
          CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END as contact_id,
          content,
          created_at,
          is_read,
          sender_id,
          ROW_NUMBER() OVER(PARTITION BY CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END ORDER BY created_at DESC) as rn
        FROM messages
        WHERE sender_id = $1 OR receiver_id = $1
      )
      SELECT 
        lm.contact_id, 
        lm.content as last_message, 
        lm.created_at, 
        lm.is_read, 
        lm.sender_id,
        u.nom, 
        u.prenom
      FROM last_messages lm
      JOIN users u ON lm.contact_id = u.id
      WHERE lm.rn = 1
      ORDER BY lm.created_at DESC
    `;
    const result = await client.query(query, [userId]);
    res.status(200).json(result.rows);

  } catch (error) {
    console.error("Erreur getConversations :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des conversations." });
  } finally {
    client.release();
  }
};
