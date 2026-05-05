import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../../lib/config";
import axios from "axios";
import { Dropdown, Button, Label } from "@heroui/react";
import { EllipsisVertical } from "@gravity-ui/icons";

const auth = getAuth();

function Profile() {
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [items, setItems] = useState([]);
  const [uid, setUid] = useState(null);
  const [badges, setBadges] = useState("");
  const [userAvatar, setUserAvatar] = useState(null);
  const [image, setImage] = useState(null);         // the actual File object
  const [preview, setPreview] = useState(null);     // local blob URL for preview
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);     
  const [showAvatarModal, setShowAvatarModal] = useState(false);           // hidden file input ref

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const name = user.displayName || user.email?.split("@")[0] || "User";
        setUsername(name);
        setUid(user.uid);
      } else {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // LEFT UNTOUCHED
  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const response = await axios.post(
          `http://localhost:5050/api/user/profile`,
          {
            uid: uid,
          },
        );
        console.log("User profile response:", response.data);
        const avatarUrl = response.data.user.profilePicture;
        setUserAvatar(avatarUrl);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    if (uid) {
      getUserProfile();
    }
  }, [uid]);

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

  useEffect(() => {
    if (items.length >= 25) setBadges("Adventurer");
    else if (items.length >= 10) setBadges("Explorer");
    else if (items.length >= 1) setBadges("First Step");
    else setBadges("");
  }, [items]);

  // Triggered when user picks a file — shows preview immediately
 const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setImage(file);
  setPreview(URL.createObjectURL(file));
  setShowAvatarModal(true); // open modal after picking
};


const handleUpload = async () => {
  if (!image) return;
  setUploading(true);
  try {
    const formData = new FormData();
    formData.append("uid", uid);
    formData.append("avatar", image);

    const response = await axios.post(
      `${API_BASE_URL}/api/user/uploadAvatar`,
      formData,
    );

    const newUrl = response.data?.profilePicture;
    setUserAvatar(newUrl || preview);
    setImage(null);
    setPreview(null);
    setShowAvatarModal(false); // close modal on success
  } catch (error) {
    console.error("Error uploading avatar:", error);
    alert("Failed to upload avatar. Please try again.");
  } finally {
    setUploading(false);
  }
};

// Update handleCancelUpload to close modal
const handleCancelUpload = () => {
  setImage(null);
  setPreview(null);
  setShowAvatarModal(false); // close modal on cancel
  if (fileInputRef.current) fileInputRef.current.value = "";
};

  return (
    <div className="flex justify-center items-center mt-8">
      {/* Hidden file input — triggered by "Change Avatar" menu item */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        className="flex p-4 rounded-lg w-150"
        style={{ backgroundColor: "black", border: "1px solid #333" }}
      >
        <div className="mr-5 flex flex-col items-center gap-2">
          <img
            src={userAvatar}
            alt="User Avatar"
            className="rounded-full object-cover"
        style={{ border: "2px solid #333" }}
          />
          {/* Confirm/cancel buttons shown only when a new image is staged */}
          {/* Avatar Upload Modal */}
{showAvatarModal && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    onClick={handleCancelUpload} // click backdrop to dismiss
  >
    <div
      className="flex flex-col items-center gap-4 p-6 rounded-xl"
      style={{ backgroundColor: "#111", border: "1px solid #333", minWidth: "280px" }}
      onClick={(e) => e.stopPropagation()} // prevent backdrop click from firing inside
    >
      <h3 className="text-white font-semibold text-base">Update Avatar</h3>

      {/* Preview */}
      <img
        src={preview}
        alt="Preview"
        className="w-24 h-24 rounded-full object-cover"
        style={{ border: "2px solid #333" }}
      />

      {/* Actions */}
      <div className="flex gap-2 w-full">
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="flex-1 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium disabled:opacity-50"
        >
          {uploading ? "Saving…" : "Save"}
        </button>
        <button
          onClick={handleCancelUpload}
          className="flex-1 py-2 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: "#333" }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
        </div>

        <div className="flex justify-between items-start w-full">
          <div>
            <h2 className="text-lg text-white " style={{ fontSize: "20px" }}>
              {username}
            </h2>
            {badges && (
              <p
                className="items-center px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium"
                style={{ fontSize: "10px" }}
              >
                {badges}
              </p>
            )}
          </div>
          <div className="flex justify-right">
            <Dropdown>
              <Button aria-label="Menu" variant="default">
                <EllipsisVertical />
              </Button>
              <Dropdown.Popover>
                <Dropdown.Menu>
                  <Dropdown.Item id="personal" textValue="personal">
                    <Label>Change Username</Label>
                  </Dropdown.Item>
                  {/* Fix: clicking this now opens the file picker */}
                  <Dropdown.Item
                    id="career"
                    textValue="career"
                    onPress={() => fileInputRef.current?.click()}
                  >
                    <Label>Change Avatar</Label>
                  </Dropdown.Item>
                  <Dropdown.Item id="travel" textValue="travel">
                    <Label>Add Bio</Label>
                  </Dropdown.Item>
                  <Dropdown.Item id="health" textValue="health">
                    <Label>Delete Account</Label>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;