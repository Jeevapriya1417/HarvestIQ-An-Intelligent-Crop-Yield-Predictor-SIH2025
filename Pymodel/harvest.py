# 🌾 Crop Yield Prediction with Streamlit + XGBoost
import pandas as pd
import numpy as np
import xgboost as xgb
import streamlit as st
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import r2_score, mean_squared_error

st.set_page_config(page_title="Crop Yield Predictor", page_icon="🌱", layout="centered")

st.title("🌾 AI-Powered Crop Yield Prediction")
st.markdown("Enter soil, crop, and weather details to predict crop yield")

# ---------------------------
# Load dataset
# ---------------------------
@st.cache_data
def load_data():
    df = pd.read_csv("crop_yield.csv")  # make sure dataset is in same folder
    return df

data = load_data()

# ---------------------------
# Preprocessing & Training
# ---------------------------
@st.cache_resource
def train_model():
    df = data.copy()

    # Encode categorical features
    label_encoders = {}
    categorical_cols = ["Crop", "Season", "State"]
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le

    # Features & Target
    X = df.drop(columns=["Yield"])
    y = df["Yield"]

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )

    # Train XGBoost
    model = xgb.XGBRegressor(
        n_estimators=650,
        learning_rate=0.2,
        max_depth=3,
        subsample=0.9,
        colsample_bytree=0.6,
        gamma=1.3,
        reg_alpha=6.2,
        reg_lambda=3.6,
        random_state=42,
        objective="reg:squarederror",
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))

    return model, scaler, label_encoders, X.columns, r2, rmse


model, scaler, label_encoders, feature_cols, r2, rmse = train_model()

st.success(f"✅ Model Trained | R²: {r2:.3f}, RMSE: {rmse:.2f}")

# ---------------------------
# User Inputs
# ---------------------------
st.subheader("📥 Enter Crop & Soil Information")

crop = st.selectbox("Crop Type", label_encoders["Crop"].classes_)
season = st.selectbox("Season", label_encoders["Season"].classes_)
state = st.selectbox("Region/State", label_encoders["State"].classes_)
area = st.number_input("Farm Area (in hectares)", min_value=0.1, value=1.0, step=0.1)
rainfall = st.number_input("Annual Rainfall (mm)", min_value=100, max_value=5000, value=1000)
ph = st.number_input("Soil pH", min_value=3.0, max_value=10.0, value=6.5, step=0.1)
nitrogen = st.number_input("Nitrogen (kg/ha)", min_value=0, max_value=300, value=100)
phosphorus = st.number_input("Phosphorus (kg/ha)", min_value=0, max_value=150, value=40)
potassium = st.number_input("Potassium (kg/ha)", min_value=0, max_value=200, value=50)
organic = st.number_input("Organic Content (%)", min_value=0.0, max_value=10.0, value=1.5)

# ---------------------------
# Prediction
# ---------------------------
if st.button("🌱 Predict Yield"):
    try:
        input_data = {
            "Area": area,
            "Annual_Rainfall": rainfall,
            "Soil_pH": ph,
            "Nitrogen": nitrogen,
            "Phosphorus": phosphorus,
            "Potassium": potassium,
            "Organic_Content": organic,
            "Crop": label_encoders["Crop"].transform([crop])[0],
            "Season": label_encoders["Season"].transform([season])[0],
            "State": label_encoders["State"].transform([state])[0],
        }

        # Convert to DataFrame
        input_df = pd.DataFrame([input_data])

        # Scale features
        input_scaled = scaler.transform(input_df[feature_cols])

        # Predict
        prediction = model.predict(input_scaled)[0]

        st.success(f"🌾 Predicted Yield: **{prediction:.2f} kg/ha**")
        st.progress(min(1.0, prediction / 5000))  # Show percentage bar (scale to 5000 max)

    except Exception as e:
        st.error(f"Error: {e}")
