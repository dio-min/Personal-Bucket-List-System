import { getAuth, onAuthStateChanged, updateProfile, deleteUser } from "firebase/auth";
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Auth Listener
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

  // Fetch Profile (Avatar)
  useEffect(() => {
    if (!uid) return;
    const getUserProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.post(`${API_BASE_URL}/api/user/profile`, { uid });
        setUserAvatar(response.data.user.profilePicture);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    getUserProfile();
  }, [uid]);

  // Fetch Completed Items for Badges
  useEffect(() => {
    if (!uid) return;
    const fetchCompletedItems = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/complete/getCompleteByUser`, {
          firebaseUid: uid,
        });
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching completed items:", error);
      }
    };
    fetchCompletedItems();
  }, [uid]);

  // Set Badge
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

      const response = await axios.post(`${API_BASE_URL}/api/user/uploadAvatar`, formData);
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
    setShowUsernameModal(false);
    setShowDeleteModal(false);
    setNewUsername("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) return;
    setUploading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: newUsername });

      await axios.post(`${API_BASE_URL}/api/user/username`, {
        uid: uid,
        username: newUsername,
      });
      setUsername(newUsername);
      handleCancelUpload();
    } catch (error) {
      console.error("Error updating username:", error);
      alert("Failed to update username.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteUser = async () => {
    setDeleting(true);
    try {
      await axios.post(`${API_BASE_URL}/api/user/isdeleted`, { 
        uid: uid, 
        isdelete: true 
      });
      await deleteUser(auth.currentUser);
      navigate("/");
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
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

      {/* Main Profile Card - Light Mode */}
      <div
        className="flex p-6 rounded-2xl w-[580px] h-[150px] shadow-sm border relative"
        style={{
          backgroundColor: "white",
          borderColor: "#e5e5e5",
        }}
      >
        {/* Avatar with Plus Icon */}
        <div className="relative mr-6 flex-shrink-0">
          {loading ? (
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(90deg, #f0f0f0 25%, #e5e5e5 50%, #f0f0f0 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.4s infinite",
              }}
            />
          ) : (
            <div 
              className="relative group cursor-pointer" 
              onClick={() => fileInputRef.current?.click()}
            >
              <img
                src={userAvatar || "/default-avatar.png"} // Add fallback if needed
                alt="User Avatar"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #e5e5e5",
                }}
              />

              {/* Plus Icon */}
              <div className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1.5 shadow-md 
                            opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* User Info & Menu */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                {username}
              </h2>
              {badges && (
                <span className="inline-block mt-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  {badges}
                </span>
              )}
            </div>

            <Dropdown>
              <Button aria-label="Menu" variant="default" className="text-gray-500 hover:text-gray-700">
                <EllipsisVertical size={20} />
              </Button>
              <Dropdown.Popover>
                <Dropdown.Menu>
                  <Dropdown.Item onPress={() => setShowUsernameModal(true)}>
                    <Label>Change Username</Label>
                  </Dropdown.Item>
                  <Dropdown.Item
                    variant="danger"
                    onPress={() => setShowDeleteModal(true)}
                  >
                    <Label>Delete Account</Label>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* ====================== Modals ====================== */}

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={handleCancelUpload}
        >
          <div
            className="flex flex-col items-center gap-5 p-8 rounded-2xl shadow-xl"
            style={{ backgroundColor: "white", border: "1px solid #e5e5e5", minWidth: "300px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-gray-900">Update Avatar</h3>
            <img
              src={preview}
              alt="Preview"
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #e5e5e5",
              }}
            />
            <div className="flex gap-3 w-full mt-2">
              <button
  onClick={handleUpload}
  disabled={uploading}
  className="flex-1 py-3 rounded-xl bg-[#0f172b] hover:bg-[#111a33] active:bg-[#0b1224] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors duration-200"
>
  {uploading ? "Saving…" : "Save Changes"}
</button>
              <button
                onClick={handleCancelUpload}
                className="flex-1 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-300"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={handleCancelUpload}
        >
          <div
            className="flex flex-col items-center gap-5 p-8 rounded-2xl shadow-xl w-full max-w-[320px]"
            style={{ backgroundColor: "white", border: "1px solid #e5e5e5" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-gray-900">Update Username</h3>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900"
              placeholder="Enter new username"
            />
            <div className="flex gap-3 w-full mt-2">
              <button
  onClick={handleUpdateUsername}
  disabled={uploading}
  className="flex-1 py-3 rounded-xl bg-[#0f172b] hover:bg-[#111a33] active:bg-[#0b1224] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors duration-200"
>
  {uploading ? "Saving…" : "Save Changes"}
</button>
              <button
                onClick={handleCancelUpload}
                className="flex-1 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          <div
            className="flex flex-col items-center gap-5 p-8 rounded-2xl shadow-xl max-w-[320px]"
            style={{ backgroundColor: "white", border: "1px solid #e5e5e5" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: "56px", height: "56px", backgroundColor: "rgba(239, 68, 68, 0.1)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>

            <h3 className="text-xl font-semibold text-gray-900">Delete Account</h3>
            <p className="text-center text-gray-600 text-sm leading-relaxed">
              This action is permanent and cannot be undone.<br />
              All your data will be lost.
            </p>

            <div className="flex gap-3 w-full mt-3">
              <button
                onClick={handleDeleteUser}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-medium transition-colors"
              >
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;