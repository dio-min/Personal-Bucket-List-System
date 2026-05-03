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
    <div className="flex justify-center ">
        
        <ImageList sx={{ width: 700, height: 550, backgroundColor: 'black', padding:"10px", borderRadius: '10px' }} cols={3} rowHeight={350}>
      {items.map((item) => (
        <ImageListItem key={item.id}>
          <img
            srcSet={`${item.imageUrl}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
            src={`${item.imageUrl}?w=164&h=164&fit=crop&auto=format`}
            alt={item.title}
            loading="eager"
            decoding="sync"
          />
        </ImageListItem>
      ))}
    </ImageList>
    </div>
  )
}
const itemData = [
  {
    img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
    title: 'Breakfast',
  },
  {
    img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
    title: 'Burger',
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
  },
  {
    img: 'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c',
    title: 'Coffee',
  },
  {
    img: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8',
    title: 'Hats',
  },
  {
    img: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62',
    title: 'Honey',
  },
  {
    img: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6',
    title: 'Basketball',
  },
  {
    img: 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f',
    title: 'Fern',
  },
  {
    img: 'https://images.unsplash.com/photo-1597645587822-e99fa5d45d25',
    title: 'Mushrooms',
  },
  {
    img: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af',
    title: 'Tomato basil',
  },
  {
    img: 'https://images.unsplash.com/photo-1471357674240-e1a485acb3e1',
    title: 'Sea star',
  },
  {
    img: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6',
    title: 'Bike',
  },
];

export default DisplayComplete