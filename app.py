import streamlit as st
import requests
import time

# Minimalist Professional Config
st.set_page_config(
    page_title="SHL Assessment Recommender Pro",
    layout="wide",
    page_icon="🎯",
    initial_sidebar_state="expanded"
)

# ---- Clean CSS ----
st.markdown("""
<style>
    /* Modern minimalist style */
    [data-testid="stAppViewContainer"] {
        background: #343939FF;
    }
    .assessment-card {
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        background: #3c5947;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        border-left: 4px solid #4CAF50;
        transition: transform 0.2s;
    }
    .assessment-card:hover {
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .relevance-badge {
        font-size: 0.9rem;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        background: #202C20FF;
        color: #b3c5b3;
        display: inline-block;
    }
</style>
""", unsafe_allow_html=True)

# ---- Header ----
st.title("🎯 SHL Assessment Recommender")
st.caption("Precision matching for talent acquisition team")

# ---- Sidebar ----
with st.sidebar:
    st.header("Settings")
    
    with st.expander("Advanced"):
        api_url = st.text_input(
            "API URL",
            value="https://shl-api-y5bo.onrender.com/recommend"
        )

# ---- Search ----
query = st.text_input(
    "Describe the role or paste job URL:",
    placeholder="e.g. 'Java developer with Spring experience'"
)

if st.button("Find Assessments", type="primary") and query:
    with st.spinner("Finding optimal assessments..."):
        try:
            response = requests.post(
                api_url,
                json={"query": query},
                timeout=100
            ).json()
            
            # Extract recommended assessments from response
            assessments = response.get("recommended_assessments", [])

            if not assessments:
                st.warning("No assessments found. Try different keywords.")
            else:
                st.success(f"Found {len(assessments)} assessments")
                
                # Display each assessment
                for item in assessments:
                    with st.container():
                        st.markdown(f"""
                        <div class="assessment-card">
                            <h3>{item.get('url', '').split('/')[-2].replace('-', ' ').title()}</h3>
                            <div style="display:flex; justify-content:space-between; align-items:center">
                                <a href="{item.get('url', '#')}" target="_blank">🔗 View Assessment</a>
                                <span class="relevance-badge">Test Type: {' '.join(item.get('test_type', []))}</span>
                            </div>
                            <p>{item.get('description', 'No description available.')}</p>
                            <div>
                                <strong>Duration:</strong> {item.get('duration', 'N/A')} minutes
                                <br>
                                <strong>Adaptive:</strong> {item.get('adaptive_support', 'No')}
                                <br>
                                <strong>Remote:</strong> {item.get('remote_support', 'No')}
                            </div>
                        </div>
                        """, unsafe_allow_html=True)
                        
        except Exception as e:
            st.error(f"System error: {str(e)}")
            st.info("Ensure the API is running at: " + api_url)

# ---- Footer ----
st.markdown("---")
st.caption("SHL Assessment Recommender © 2025")
