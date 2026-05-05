import { PersonFill } from "@gravity-ui/icons";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useState, useEffect } from "react";
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
  const [badges, setBadges] = useState(""); // Fix 1: was [], should be ""

  const navigate = useNavigate();

  // Fix 3: Consolidated into one auth listener
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
  }, [navigate]); // Fix 4: added navigate to deps

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

  // Fix 2: Use >= so badges are earned and kept as count grows
  useEffect(() => {
    if (items.length >= 25) {
      setBadges("Adventurer");
    } else if (items.length >= 10) {
      setBadges("Explorer");
    } else if (items.length >= 1) {
      setBadges("First Step");
    } else {
      setBadges("");
    }
  }, [items]);

  const handleUsernameChange = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/user/updateUsername`, {
        uid: uid,
        newUsername: newUsername,
      });
    } catch (error) {
      console.error("Error updating username:", error);
    }
  };

  return (
    <div className="flex justify-center items-center mt-8">
      <div
        className="flex p-4 rounded-lg w-150"
        style={{ backgroundColor: "black", border: "1px solid #333" }}
      >
        <div className="w-20 h-18 rounded-full bg-gray-800 flex items-center justify-center mr-4">
          <PersonFill className="size-13" />
        </div>
        <div className="flex justify-between items-start w-full">
          <div>
            <h2 className="text-lg text-white " style={{fontSize:"20px"}}>{username}</h2>
            {badges && (
              <p className="items-center px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium" style={{fontSize:"10px"}}>
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
                  <Dropdown.Item id="career" textValue="career">
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
