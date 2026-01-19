const pool = require('../config/db.js');

exports.getHeartRate = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT measured_at AS x, bpm AS y
      FROM heart_rate
      ORDER BY measured_at DESC
      LIMIT 50
    `);

    const history = result.rows.reverse(); 
    const latest = history.length > 0 ? history[history.length - 1] : null;
    console.log(latest);
    res.json({
      heartRate: latest ? latest.y : 0,
      heartRateHistory: history
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getWeeklyStats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT AVG(bpm) as avg_bpm
      FROM heart_rate
      WHERE measured_at >= NOW() - INTERVAL '7 days'
    `);

    const avgHeartRate = Math.round(result.rows[0].avg_bpm) || 0;

    res.json({
      weeklyAvgHeartRate: avgHeartRate,
    
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};