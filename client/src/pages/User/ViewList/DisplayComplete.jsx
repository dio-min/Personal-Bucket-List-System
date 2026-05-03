import React, { use } from 'react'
import Sample from '../../../assets/sample.png';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { useState, useEffect } from 'react';
import { auth, db } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import API_BASE_URL from "../../../lib/config";
import axios from "axios";

function DisplayComplete() {
    const [items, setItems] = useState([]);
    const [uid, setUid] = useState(null);
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
                    const response = await axios.post(`${API_BASE_URL}/api/complete/getCompleteByUser`, {
                         firebaseUid: uid ,
                    }
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
    <ImageList 
    sx={{ width: 700, height: 550, backgroundColor: 'black', padding: "10px", borderRadius: '10px' }} cols={3} rowHeight={325}>
      {items.map((item) => (
        <ImageListItem key={item.id}>
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="eager"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          
        </ImageListItem>
      ))}
    </ImageList>
  </div>
)
}

export default DisplayComplete