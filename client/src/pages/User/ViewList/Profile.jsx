import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";
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
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName || user.email?.split("@")[0] || "User");
        setUid(user.uid);
      } else {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!uid) return;
    const getUserProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.post(`${API_BASE_URL}/api/user/profile`, {
          uid,
        });
        setUserAvatar(response.data.user.profilePicture);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    getUserProfile();
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const fetchCompletedItems = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/complete/getCompleteByUser`,
          {
            firebaseUid: uid,
          },
        );
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching completed items:", error);
      }
    };
    fetchCompletedItems();
  }, [uid]);

  useEffect(() => {
    if (items.length >= 25) setBadges("Adventurer");
    else if (items.length >= 10) setBadges("Explorer");
    else if (items.length >= 1) setBadges("First Step");
    else setBadges("");
  }, [items]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setShowAvatarModal(true);
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
      setUserAvatar(response.data?.profilePicture || preview);
      handleCancelUpload();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload avatar. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setImage(null);
    setPreview(null);
    setShowAvatarModal(false);
    setShowUsernameModal(false); // ← also close username modal
    setNewUsername("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // FIX 1: Opens the correct modal (was incorrectly setting showAvatarModal)
  // FIX 2: Awaits both async calls
  // FIX 3: Updates the displayed username in state after success
  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) return;
    setUploading(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: newUsername,
      });
      await axios.post(`${API_BASE_URL}/api/username`, {
        uid: uid,
        username: newUsername,
      });
      setUsername(newUsername); // ← reflect new name in the UI immediately
      handleCancelUpload();
    } catch (error) {
      console.error("error updating username", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-center items-center mt-8">
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
        {/* Avatar */}
        <div className="mr-5 flex flex-col items-center gap-2">
          {loading ? (
            <div
              style={{
                width: "90px",
                height: "90px",
                minWidth: "90px",
                borderRadius: "50%",
                border: "3px solid #444",
                background:
                  "linear-gradient(90deg, #222 25%, #333 50%, #222 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.4s infinite",
              }}
            />
          ) : (
            <img
              src={userAvatar}
              alt="User Avatar"
              style={{
                width: "90px",
                height: "90px",
                minWidth: "90px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #444",
              }}
            />
          )}
        </div>

        {/* Avatar Upload Modal */}
        {showAvatarModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={handleCancelUpload}
          >
            <div
              className="flex flex-col items-center gap-4 p-6 rounded-xl"
              style={{
                backgroundColor: "#111",
                border: "1px solid #333",
                minWidth: "280px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white font-semibold text-base">
                Update Avatar
              </h3>
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: "96px",
                  height: "96px",
                  minWidth: "96px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #333",
                }}
              />
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium disabled:opacity-50"
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

        {/* Username Update Modal */}
        {showUsernameModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={handleCancelUpload}
          >
            <div
              className="flex flex-col items-center gap-4 p-6 rounded-xl"
              style={{
                backgroundColor: "#111",
                border: "1px solid #333",
                minWidth: "280px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white font-semibold text-base">
                Update Username
              </h3>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleUpdateUsername}
                  disabled={uploading}
                  className="flex-1 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium disabled:opacity-50"
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

        {/* User Info & Menu */}
        <div className="flex justify-between items-start w-full">
          <div>
            <h2 className="text-white" style={{ fontSize: "20px" }}>
              {username}
            </h2>
            {badges && (
              <p
                className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium"
                style={{ fontSize: "10px" }}
              >
                {badges}
              </p>
            )}
          </div>

          <Dropdown>
            <Button aria-label="Menu" variant="default">
              <EllipsisVertical />
            </Button>
            <Dropdown.Popover>
              <Dropdown.Menu>
                {/* FIX 4: Added onPress to open the username modal */}
                <Dropdown.Item
                  id="personal"
                  textValue="personal"
                  onPress={() => setShowUsernameModal(true)}
                >
                  <Label>Change Username</Label>
                </Dropdown.Item>
                <Dropdown.Item onPress={() => fileInputRef.current?.click()}>
                  <Label>Change Avatar</Label>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Label>Add Bio</Label>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Label>Delete Account</Label>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}

export default Profile;