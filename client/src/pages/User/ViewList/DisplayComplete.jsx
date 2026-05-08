import React, { useState, useEffect } from "react";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import Rating from "@mui/material/Rating";

import { auth } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import API_BASE_URL from "../../../lib/config";

const labels = {
  0.5: "Useless", 1: "Useless+", 1.5: "Poor", 2: "Poor+",
  2.5: "Ok", 3: "Ok+", 3.5: "Good", 4: "Good+",
  4.5: "Excellent", 5: "Excellent+",
};

function capitalizeFirstLetter(str) {
  return typeof str === "string" && str.length > 0
    ? str.charAt(0).toUpperCase() + str.slice(1)
    : "";
}

function DisplayComplete() {
  const [items, setItems] = useState([]);
  const [uid, setUid] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!uid) return;

    const fetchData = async () => {
      try {
        const res = await axios.post(
          `${API_BASE_URL}/api/complete/getCompleteByUser`,
          { firebaseUid: uid }
        );
        setItems(res.data);
      } catch (error) {
        console.error("Error fetching completed items:", error);
      }
    };

    fetchData();
  }, [uid]);

  return (
    <div className="w-full flex justify-center px-4 py-8">
      {items.length === 0 ? (
        <div className="w-full max-w-4xl h-[420px] rounded-[32px] bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center">
          <span className="text-neutral-400">No completed items yet.</span>
        </div>
      ) : (
        <ImageList
          variant="masonry"
          cols={3}
          gap={20}
          sx={{
            width: "100%",
            maxWidth: 1100,           // ← Reduced from 1300
            margin: "0 auto",
          }}
        >
          {items.map((item) => (
            <ImageListItem
              key={item.id}
              onClick={() => setSelectedItem(item)}
              sx={{
                cursor: "pointer",
                borderRadius: "28px",
                overflow: "hidden",
                background: "#111",
                border: "1px solid rgba(255,255,255,0.06)",
                transition: "all 0.3s ease",

                "&:hover img": { transform: "scale(1.05)" },
                "&:hover .overlay": { opacity: 1 },
              }}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                  borderRadius: "28px",
                }}
              />

              <div className="overlay absolute inset-0 opacity-0 transition-all bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white font-semibold text-lg">
                  {capitalizeFirstLetter(item.title)}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <Rating
                    value={item.rating}
                    readOnly
                    precision={0.5}
                    size="small"
                    sx={{ "& .MuiRating-iconFilled": { color: "#ffb300" } }}
                  />
                  <span className="text-sm text-neutral-300">
                    {labels[item.rating]}
                  </span>
                </div>
              </div>
            </ImageListItem>
          ))}
        </ImageList>
      )}

      {/* LIGHT MODE MODAL */}
{selectedItem && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-4"
    onClick={() => setSelectedItem(null)}
  >
    <div
      className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white border border-neutral-200 shadow-xl flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            {capitalizeFirstLetter(selectedItem.title)}
          </h2>

          <div className="flex items-center gap-2 mt-1 text-emerald-600 font-medium text-sm">
            <span>✓</span>
            <span>Completed Goal</span>
          </div>
        </div>

        <button
          onClick={() => setSelectedItem(null)}
          className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center text-lg transition"
        >
          ✕
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">

        {/* Left Panel */}
        <div className="lg:w-3/5 p-6 flex flex-col gap-5 overflow-auto">

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Rating */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
              <p className="text-[11px] text-neutral-500 mb-2 font-medium tracking-widest">
                YOUR RATING
              </p>
              <div className="flex items-center gap-3">
                <Rating
                  value={selectedItem.rating}
                  readOnly
                  precision={0.5}
                  size="small"
                  sx={{ "& .MuiRating-iconFilled": { color: "#facc15" } }}
                />
                <span className="text-xm font-semibold text-neutral-900">
                  {labels[selectedItem.rating]}
                </span>
              </div>
            </div>

            {/* Date */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
              <p className="text-[11px] text-neutral-500 mb-2 font-medium tracking-widest">
                COMPLETED ON
              </p>
              <p className="text-neutral-900 text-sm font-medium">
                {selectedItem.date
                  ? new Date(selectedItem.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "No date"}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl p-6">
            <p className="text-[11px] text-neutral-500 mb-2 font-medium tracking-widest">
              MY EXPERIENCE
            </p>
            <p className="text-neutral-700 leading-relaxed text-sm whitespace-pre-wrap">
              {selectedItem.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Right Image */}
        <div className="lg:w-2/5 bg-white flex items-center justify-center p-6 border-l border-neutral-200">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-neutral-100">
            <img
              src={selectedItem.imageUrl}
              alt={selectedItem.title}
              className="max-h-[400px] w-full object-contain rounded-xl"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default DisplayComplete;