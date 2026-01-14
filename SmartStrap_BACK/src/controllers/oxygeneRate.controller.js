const pool = require('../config/db.js');

exports.getOxygeneRate = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT measured_at AS x, spo2 AS y
      FROM oxygene_rate
      ORDER BY measured_at DESC
      LIMIT 50
    `);

    const history = result.rows.reverse(); // Chronological order (oldest to newest)
    const latest = history.length > 0 ? history[history.length - 1] : null;

    res.json({
      spo2: latest ? latest.y : 10,
      oxygenHistory: history
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getWeeklyStats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT AVG(spo2) as avg_spo2
      FROM oxygene_rate
      WHERE measured_at >= NOW() - INTERVAL '7 days'
    `);

    const avgOxygeneRate = Math.round(result.rows[0].avg_spo2) || 0;

    res.json({
      weeklyAvgSpo2: avgOxygeneRate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};