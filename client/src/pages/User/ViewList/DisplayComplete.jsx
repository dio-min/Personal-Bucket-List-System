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
      { threshold: 0.08 },
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
          { firebaseUid: uid },
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
            cols={isMobile ? 3 : 4} // ✅ RESPONSIVE FIX
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
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    onClick={() => setSelectedItem(null)}
  >
    <div
      className="
        w-full rounded-2xl bg-white shadow-xl overflow-hidden
        flex flex-col max-w-sm max-h-[85dvh]
        sm:flex-row sm:max-w-2xl sm:max-h-[80dvh]
      "
      onClick={(e) => e.stopPropagation()}
    >
      {/* IMAGE */}
      <div className="relative flex-shrink-0 sm:w-2/5">
        <img
          src={selectedItem.imageUrl}
          alt={selectedItem.title}
          className="w-full object-cover object-top
            max-h-64
            sm:h-full sm:max-h-none"
        />
        <button
          onClick={() => setSelectedItem(null)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center text-sm"
        >
          ✕
        </button>
        <div className="absolute bottom-0 inset-x-0 px-5 pb-4 pt-8 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-white font-medium text-base leading-snug">
            {capitalizeFirstLetter(selectedItem.title)}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5 flex flex-col gap-4 overflow-y-auto min-h-0 sm:flex-1">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-neutral-50 rounded-xl p-3">
            <p className="text-[10px] text-neutral-400 mb-1.5 uppercase tracking-wider font-medium">
              Your rating
            </p>
            <Rating
              value={selectedItem.rating}
              readOnly
              precision={0.5}
              size="small"
              sx={{ "& .MuiRating-iconFilled": { color: "#facc15" } }}
            />
          </div>
          <div className="bg-neutral-50 rounded-xl p-3">
            <p className="text-[10px] text-neutral-400 mb-1.5 uppercase tracking-wider font-medium">
              Completed on
            </p>
            <p className="text-sm font-medium text-neutral-800">
              {selectedItem.date
                ? new Date(selectedItem.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "No date"}
            </p>
          </div>
        </div>

        <div className="bg-neutral-50 rounded-xl p-4 flex-1">
          <p className="text-[10px] text-neutral-400 mb-2 uppercase tracking-wider font-medium">
            My experience
          </p>
          <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
            {selectedItem.description || "No description provided."}
          </p>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default DisplayComplete;
