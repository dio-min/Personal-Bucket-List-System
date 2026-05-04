import React, { useState, useEffect } from "react";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import { auth, db } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import API_BASE_URL from "../../../lib/config";
import axios from "axios";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";

const labels = {
  0.5: "Useless",
  1: "Useless+",
  1.5: "Poor",
  2: "Poor+",
  2.5: "Ok",
  3: "Ok+",
  3.5: "Good",
  4: "Good+",
  4.5: "Excellent",
  5: "Excellent+",
};
function capitalizeFirstLetter(str) {
  if (typeof str !== "string" || str.length === 0) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function DisplayComplete() {
  const [items, setItems] = useState([]);
  const [uid, setUid] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // track which image is open

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!uid) return;
    const fetchData = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/complete/getCompleteByUser`,
          { firebaseUid: uid },
        );
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching completed items:", error);
      }
    };
    fetchData();
  }, [uid]);

  return (
    <div className="flex justify-center">
      {items.length === 0 ? (
      <div
        style={{
          width: 600,
          height: 400,
          backgroundColor: "black",
          borderRadius: "10px",
          marginTop: "50px",
          backgroundColor: "#1a1a1a",
        }}
        className="flex  justify-center "
      >
        <span className="text-sm text-neutral-500 self-center">
          No completed items found. Complete some goals to see them here!
        </span>
      </div>
    ) : (
      <ImageList
        sx={{
          width: 600,
          height: 550,
          backgroundColor: "black",
          padding: "10px",
          borderRadius: "10px",
        }}
        cols={3}
        rowHeight={300}
      >
        {items.map((item) => (
          <ImageListItem
            key={item.id}
            sx={{ cursor: "pointer" }}
            onClick={() => setSelectedItem(item)}
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              loading="eager"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </ImageListItem>
        ))}
      </ImageList>
    )}

      {/* Single modal rendered outside the list */}
      {selectedItem && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    onClick={() => setSelectedItem(null)}
  >
    <div
      className="w-full max-w-5xl p-6 bg-black border border-neutral-800 rounded-2xl shadow-xl text-neutral-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close button */}
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => setSelectedItem(null)}
          className="text-neutral-400 hover:text-white transition-colors text-xl leading-none"
        >
          ✕
        </button>
      </div>

      {/* Body: left text, right image */}
      <div className="flex gap-8 items-start">

        {/* Left: text */}
        <div className="w-1/2 flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-white text-center">
            {capitalizeFirstLetter(selectedItem.title)}
          </h2>
          <hr className="w-full border-t border-neutral-600" />

          {/* Rating + Date row */}
          <div className="flex flex-col md:flex-row gap-4 md:justify-between">
            <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 p-3 rounded-md">
              <Rating
                value={selectedItem.rating}
                readOnly
                precision={0.5}
                sx={{
                  "& .MuiRating-iconFilled": { color: "#ffb300" },
                  "& .MuiRating-iconEmpty": { color: "#404040" },
                }}
              />
              <span className="text-sm text-neutral-400">
                {labels[selectedItem.rating] || ""}
              </span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-md">
              <input
                type="date"
                className="bg-transparent text-white outline-none"
                readOnly
                value={
                  selectedItem.date
                    ? new Date(selectedItem.date).toISOString().split("T")[0]
                    : ""
                }
              />
            </div>
          </div>

          {/* Description */}
          <div className="max-h-[50vh] overflow-y-auto ">
            <p className="text-neutral-300 text-sm text-left whitespace-pre-wrap">
            {selectedItem.description ?? "No description available."}
          </p>
          </div>
          
        </div>

        {/* Right: image */}
        <div className="flex-1 flex items-center justify-center">
          <img
            src={selectedItem.imageUrl}
            alt={selectedItem.title}
            className="w-full max-h-[500px] object-contain rounded-md border border-neutral-800"
          />
        </div>

      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default DisplayComplete;
