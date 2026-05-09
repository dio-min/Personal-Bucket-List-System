import React from 'react'
import Navigate from '../Navigate'
import DisplayComplete from './ViewList/DisplayComplete'
import Profile from './ViewList/Profile'

function Album() {
  return (
    <>
      
      <div>
        <Navigate />
        <Profile />
        
    
        <div>
            <DisplayComplete />
        </div>
      </div>
    </>
  )
}

export default Album