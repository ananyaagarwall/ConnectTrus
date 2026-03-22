import streamlit as st

st.set_page_config(page_title="CONNECTRUST", layout="centered")

# ---------------- SESSION STATE ----------------
if "community_data" not in st.session_state:
    st.session_state.community_data = {}

if "messages" not in st.session_state:
    st.session_state.messages = []

if "analyzed" not in st.session_state:
    st.session_state.analyzed = False

# ---------------- HEADER ----------------
st.title("CONNECTRUST 🚀")
st.subheader("ML-Based Community Growth Advisor")

st.write("Analyze your community and get intelligent growth recommendations.")

st.markdown("---")

# ---------------- INPUT SECTION ----------------
st.header("Enter Community Details")

size = st.number_input("Community Size", min_value=1)
active_users = st.number_input("Monthly Active Users", min_value=1)
events = st.number_input("Event Frequency (per month)", min_value=0)
engagement = st.slider("Engagement Rate (%)", 0, 100)
age = st.number_input("Community Age (months)", min_value=1)

location = st.selectbox(
    "Location Type",
    ["Urban", "Semi-Urban", "Rural"]
)

st.markdown("---")

# ---------------- ANALYZE ----------------
if st.button("Analyze Community"):

    # Store data
    st.session_state.community_data = {
        "size": size,
        "active_users": active_users,
        "events": events,
        "engagement": engagement,
        "age": age,
        "location": location
    }

    st.session_state.analyzed = True

# ---------------- RESULTS ----------------
if st.session_state.analyzed:

    data = st.session_state.community_data

    # Dummy logic (replace with ML later)
    if data["size"] < 50:
        stage = "Early Stage"
        cluster = "Emerging Communities"
        recommendation = "Increase visibility and host more events"
        reason = "Small communities grow faster with frequent engagement"
        confidence = "75%"

    elif data["events"] >= 3 and data["engagement"] > 60:
        stage = "Growing Stage"
        cluster = "High Engagement Communities"
        recommendation = "Introduce mentorship programs and collaborations"
        reason = "High engagement communities benefit from structured growth"
        confidence = "85%"

    else:
        stage = "Stable Stage"
        cluster = "Moderate Activity Communities"
        recommendation = "Improve interaction and increase event frequency"
        reason = "Moderate activity limits growth potential"
        confidence = "78%"

    st.success("Analysis Complete ✅")

    st.subheader("Results 📊")
    st.write(f"**Growth Stage:** {stage}")
    st.write(f"**Cluster Type:** {cluster}")
    st.write(f"**Recommendation:** {recommendation}")
    st.write(f"**Reason:** {reason}")
    st.write(f"**Confidence Score:** {confidence}")

    st.markdown("---")

    # ---------------- CHATBOT ----------------
    st.subheader("Community Advisor Chatbot 🤖")

    user_input = st.text_input("Ask about your community:")

    if user_input:

        st.session_state.messages.append(("user", user_input))

        # Context-aware responses
        data = st.session_state.community_data

        if "event" in user_input.lower():
            response = f"Since your community has {data['events']} events/month, increasing it to 3-4 can boost engagement."

        elif "growth" in user_input.lower():
            response = f"Your current engagement is {data['engagement']}%. Improving interaction and consistency can increase growth."

        elif "engagement" in user_input.lower():
            response = "You can improve engagement by hosting interactive sessions, polls, and collaborative events."

        elif "size" in user_input.lower():
            response = f"Your community size is {data['size']}. Focus on retention before scaling further."

        else:
            response = "Focus on increasing participation, organizing events, and improving member interaction."

        st.session_state.messages.append(("bot", response))

    # Display chat
    for role, msg in st.session_state.messages:
        if role == "user":
            st.write(f"🧑: {msg}")
        else:
            st.write(f"🤖: {msg}")