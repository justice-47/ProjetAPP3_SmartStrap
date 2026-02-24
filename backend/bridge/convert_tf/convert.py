import tensorflow as tf
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Ajustez les chemins si nécessaire par rapport à votre script
PATH_RESP = os.path.join(BASE_DIR, 'BIDMC_model.keras')
PATH_HAR = os.path.join(BASE_DIR, 'model95.keras')

print("⏳ Chargement des modèles Keras...")
model_resp = tf.keras.models.load_model(PATH_RESP)
model_har = tf.keras.models.load_model(PATH_HAR)

print("🔄 Conversion en TFLite...")

# =========================================
# 1. Conversion du modèle HAR (avec LSTM)
# =========================================
converter_har = tf.lite.TFLiteConverter.from_keras_model(model_har)

# --- CORRECTION POUR LES LSTM ---
# Autorise TFLite à utiliser des opérations TensorFlow plus complexes
converter_har.target_spec.supported_ops = [
    tf.lite.OpsSet.TFLITE_BUILTINS, 
    tf.lite.OpsSet.SELECT_TF_OPS
]
# Désactive l'optimisation qui fait crasher le LSTM
converter_har._experimental_lower_tensor_list_ops = False
# --------------------------------

tflite_har = converter_har.convert()
with open(os.path.join(BASE_DIR, 'model_har.tflite'), 'wb') as f:
    f.write(tflite_har)
print("✅ Modèle HAR converti !")

# =========================================
# 2. Conversion du modèle Respiration
# =========================================
converter_resp = tf.lite.TFLiteConverter.from_keras_model(model_resp)

# On applique la même sécurité au cas où ce modèle utiliserait aussi des ops complexes
converter_resp.target_spec.supported_ops = [
    tf.lite.OpsSet.TFLITE_BUILTINS, 
    tf.lite.OpsSet.SELECT_TF_OPS
]
converter_resp._experimental_lower_tensor_list_ops = False

tflite_resp = converter_resp.convert()
with open(os.path.join(BASE_DIR, 'model_resp.tflite'), 'wb') as f:
    f.write(tflite_resp)
print("✅ Modèle RESP converti !")

print("🎉 Conversion terminée avec succès ! Fichiers .tflite créés.")