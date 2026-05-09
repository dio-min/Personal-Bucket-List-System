import React, { useState, useEffect, useRef } from "react";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import Rating from "@mui/material/Rating";
import useMediaQuery from "@mui/material/useMediaQuery";

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

function useSlideUp(delay = 0) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.08 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return ref;
}

const slideBase = (delay = 0) => ({
  opacity: 0,
  transform: "translateY(28px)",
  transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
});

/* Individual Image Item */
function AnimatedImageItem({ item, index, onClick }) {
  const ref = useSlideUp(index * 60);

  return (
    <ImageListItem
      ref={ref}
      className="group"
      style={slideBase(index * 60)}
      onClick={() => onClick(item)}
      sx={{
        cursor: "pointer",
        overflow: "hidden",
        borderRadius: "2px",
        background: "#fff",
        transition: "all 0.25s ease",
        "&:hover": {
          transform: "translateY(-4px)",
        },
        "&:hover .overlay": {
          opacity: 1,
        },
      }}
    >
      <div className="relative w-full aspect-[3/5] overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="overlay absolute inset-0 opacity-0 transition-all bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-2">
        <h3 className="text-white font-semibold text-[11px] sm:text-sm line-clamp-1">
          {capitalizeFirstLetter(item.title)}
        </h3>

        <div className="flex items-center gap-1">
          <Rating
            value={item.rating}
            readOnly
            precision={0.5}
            size="small"
            sx={{
              "& .MuiRating-iconFilled": {
                color: "#ffb300",
              },
              "& .MuiSvgIcon-root": {
                fontSize: {
                  xs: "0.8rem",
                  sm: "1rem",
                },
              },
            }}
          />

          <span className="text-[10px] sm:text-xs text-neutral-300">
            {labels[item.rating]}
          </span>
        </div>
      </div>
    </ImageListItem>
  );
}

function DisplayComplete() {
  const [items, setItems] = useState([]);
  const [uid, setUid] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const emptyRef = useSlideUp(0);
  const galleryRef = useSlideUp(0);

  // ✅ RESPONSIVE BREAKPOINT
  const isMobile = useMediaQuery("(max-width:600px)");

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
        <div
          ref={emptyRef}
          style={slideBase(0)}
          className="w-full max-w-4xl h-[420px] rounded-[32px] bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center"
        >
          <span className="text-neutral-400">No completed items yet.</span>
        </div>
      ) : (
        <div
          ref={galleryRef}
          style={slideBase(0)}
          className="w-full"
          style={{ maxWidth: 1000, margin: "0 auto" }}
        >
          <ImageList
            cols={isMobile ? 3 : 4}   // ✅ RESPONSIVE FIX
            gap={2}
            sx={{
              width: "100%",
              margin: "0 auto",
            }}
          >
            {items.map((item, index) => (
              <AnimatedImageItem
                key={item.id}
                item={item}
                index={index}
                onClick={setSelectedItem}
              />
            ))}
          </ImageList>
        </div>
      )}

      {/* MODAL */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-full max-w-5xl max-h-[94vh] overflow-hidden rounded-3xl bg-white border border-neutral-200 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
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
                className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center text-xl transition"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
              <div className="lg:w-3/5 p-6 lg:p-8 flex flex-col gap-6 overflow-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5">
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
                      <span className="text-base font-semibold text-neutral-900">
                        {labels[selectedItem.rating]}
                      </span>
                    </div>
                  </div>

                  <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5">
                    <p className="text-[11px] text-neutral-500 mb-2 font-medium tracking-widest">
                      COMPLETED ON
                    </p>
                    <p className="text-neutral-900 text-sm font-medium">
                      {selectedItem.date
                        ? new Date(selectedItem.date).toLocaleDateString()
                        : "No date"}
                    </p>
                  </div>
                </div>

                <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-2xl p-6">
                  <p className="text-[11px] text-neutral-500 mb-3 font-medium tracking-widest">
                    MY EXPERIENCE
                  </p>
                  <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                    {selectedItem.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="lg:w-2/5 bg-neutral-50 flex items-center justify-center p-6 border-l border-neutral-200">
                <div className="w-full max-w-[420px] lg:max-w-none">
                  <div className="bg-white p-4 rounded-3xl shadow-sm border border-neutral-100">
                    <img
                      src={selectedItem.imageUrl}
                      alt={selectedItem.title}
                      className="w-full h-auto max-h-[65vh] lg:max-h-[520px] object-contain rounded-2xl"
                    />
                  </div>
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