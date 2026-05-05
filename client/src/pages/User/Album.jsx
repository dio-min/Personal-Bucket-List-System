import React from 'react'
import Navigate from './Navigate'
import DisplayComplete from './ViewList/DisplayComplete'
import Profile from './ViewList/Profile'

function Album() {
  return (
    <>
      <Navigate />
      <div>
        <Profile />
        
    
        <div>
            <DisplayComplete />
        </div>
      </div>
    </>
  )
}

export default Album