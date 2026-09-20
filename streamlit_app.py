"""
Optional Streamlit Community Cloud mirror.

Streamlit hosts Python apps, not websites: it cannot serve the site's own URLs,
sitemap, or Open Graph previews, so it is NOT the primary host. The real site is
published to GitHub Pages by .github/workflows/deploy.yml. This tiny app simply
embeds that live site so a share.streamlit.io link also works.

Deploy: share.streamlit.io → New app → repo vkgupta0118/BALA-G-TRADING-CENTER,
branch main, main file streamlit_app.py.
"""

import streamlit as st
import streamlit.components.v1 as components

SITE_URL = "https://vkgupta0118.github.io/BALA-G-TRADING-CENTER/"

st.set_page_config(
    page_title="M/S Balajee Trading Centre – Siliguri",
    page_icon="🧱",
    layout="wide",
    initial_sidebar_state="collapsed",
)

st.markdown(
    """
    <style>
      #MainMenu, header, footer {visibility: hidden;}
      .block-container {padding: 0.5rem 0.5rem 0 0.5rem; max-width: 100%;}
    </style>
    """,
    unsafe_allow_html=True,
)

st.markdown(
    f"**M/S Balajee Trading Centre** — this is a mirror. "
    f"For the full site (fast, shareable links, WhatsApp previews) open **[{SITE_URL}]({SITE_URL})**."
)

components.iframe(SITE_URL, height=900, scrolling=True)
