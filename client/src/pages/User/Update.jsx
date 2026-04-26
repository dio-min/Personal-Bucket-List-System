import React from 'react'
import { Button, Alert } from '@heroui/react';

export const Update = ({ title }) => {
  const handleUpdate = async () => {
      // Implement delete functionality here
      alert(title)
    };
  return<>
  <Button onClick={handleUpdate}>Update</Button></>
  ;
};

